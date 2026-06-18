import { DbClient } from 'docs/client';
import { documents, documentEmbeddings, documentExtractions, workspaceMembers } from 'docs/schema';
import { eq, sql, and } from 'drizzle-orm';
import { AIProviderService } from './provider.service';
import { RateLimitService } from '@/services/security/rate-limit.service';
import { LogService } from '@/services/logging/log.service';

/**
 * ChatService
 * 
 * Implements Task 11.4: Interactive AI Chat with document context.
 * Uses vector similarity search (via embeddings stored in metadata) to find context.
 */
export const ChatService = {
  /**
   * Answers a query based on the user's document library.
   */
  async askLibrary(db: DbClient, userId: string, query: string): Promise<{ answer: string; sources: string[]; error: Error | null }> {
    try {
      // --- Task 12.5: Rate Limiting ---
      const { allowed: rateAllowed, reason: rateReason } = await RateLimitService.checkRateLimit(db, userId, 'AI_CHAT');
      if (!rateAllowed) {
        return { answer: rateReason || 'Rate limit exceeded', sources: [], error: new Error(rateReason) };
      }

      // 1. Generate embedding for the query
      const { embedding: queryEmbedding, error: embedError } = await AIProviderService.embed(query);
      if (embedError || !queryEmbedding) throw embedError || new Error('Failed to embed query');

      // 2. Perform similarity search
      // Using pgvector <=> (Cosine distance) operator in PostgreSQL.
      // We join documents with embeddings, extractions, and workspace members to filter by userId.
      const relevantDocs = (await (db as any)
        .select({
          name: documents.name,
          summary: documentExtractions.summary,
        })
        .from(documents)
        .innerJoin(documentEmbeddings, eq(documents.id, documentEmbeddings.documentId))
        .innerJoin(documentExtractions, eq(documents.id, documentExtractions.documentId))

        .innerJoin(workspaceMembers, eq(documents.workspaceId, workspaceMembers.workspaceId))
        .where(and(
          eq(workspaceMembers.userId, userId),
          sql`${documentEmbeddings.embedding} IS NOT NULL`
        ))
        // Avoid TS overload issues with orderBy for pgvector expressions by using raw SQL.
        .orderBy(sql`(${documentEmbeddings.embedding} <=> ${JSON.stringify(queryEmbedding)})`)
        .limit(3)) as { name: string; summary: string | null }[];


      if (relevantDocs.length === 0) {
        return { 
          answer: "I couldn't find any relevant documents in your library to answer that question.", 
          sources: [], 
          error: null 
        };
      }

      // 3. Construct context and prompt
      const context = relevantDocs.map(d => `Document: ${d.name}\nSummary: ${d.summary || 'No summary available.'}`).join('\n\n');
      const prompt = `
        You are DocFlow AI assistant. Use the following document context to answer the user's question.
        If the context doesn't contain the answer, say you don't know based on the documents.
        
        Context:
        ${context}
        
        Question: ${query}
      `;

      // 4. Generate answer
      const { data: aiResult, error: chatError } = await AIProviderService.analyze(prompt);
      if (chatError) throw chatError;

      return {
        answer: aiResult?.summary || "Unable to generate response.",
        sources: relevantDocs.map(d => d.name),
        error: null
      };
    } catch (error: any) {
      LogService.error('Library chat failed', error, { userId });
      return { answer: '', sources: [], error };
    }
  },
};