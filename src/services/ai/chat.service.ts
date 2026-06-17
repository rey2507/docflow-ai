import { DbClient } from '../../../docs/client';
import { documents } from '../../../docs/schema';
import { eq, sql } from 'drizzle-orm';
import { AIProviderService } from './provider.service';

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
      // 1. Generate embedding for the query
      const { embedding: queryEmbedding, error: embedError } = await AIProviderService.embed(query);
      if (embedError || !queryEmbedding) throw embedError || new Error('Failed to embed query');

      // 2. Perform similarity search
      // Since D1 is used, we perform cosine similarity comparison. 
      // Note: For large libraries, this should be moved to a dedicated Vector DB or optimized D1 query.
      const allDocs = await db.query.documents.findMany({
        where: eq(documents.userId, userId),
        columns: { name: true, metadata: true, id: true }
      });

      const relevantDocs = allDocs
        .filter(doc => doc.metadata?.embedding && doc.metadata.summary)
        .map(doc => ({
          name: doc.name,
          summary: doc.metadata!.summary!,
          similarity: this.cosineSimilarity(queryEmbedding, doc.metadata!.embedding!)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3); // Get top 3 most relevant documents

      if (relevantDocs.length === 0) {
        return { 
          answer: "I couldn't find any relevant documents in your library to answer that question.", 
          sources: [], 
          error: null 
        };
      }

      // 3. Construct context and prompt
      const context = relevantDocs.map(d => `Document: ${d.name}\nSummary: ${d.summary}`).join('\n\n');
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
      console.error('[ChatService] Error:', error.message);
      return { answer: '', sources: [], error };
    }
  },

  cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magA * magB);
  }
};