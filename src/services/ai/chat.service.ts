import { supabase } from '@/lib/supabase/client';
import { AIProviderService } from './provider.service';
import { LogService } from '@/services/logging/log.service';

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export const ChatService = {
  async askLibrary(
    _db: any,
    userId: string,
    query: string
  ): Promise<{ answer: string; sources: string[]; error: Error | null }> {
    try {
      const { embedding: queryEmbedding, error: embedError } = await AIProviderService.embed(query);
      if (embedError || !queryEmbedding) throw embedError || new Error('Failed to embed query');

      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select(`
          id,
          name,
          documentEmbeddings ( embedding ),
          documentExtractions ( summary )
        `)
        .eq('user_id', userId)
        .limit(20);

      if (docsError) throw docsError;

      const scored = (docs || [])
        .map((doc: any) => {
          const emb = doc.documentEmbeddings?.[0]?.embedding as number[] | undefined;
          const summary = doc.documentExtractions?.[0]?.summary || null;
          if (!emb) return null;
          const score = cosineSimilarity(queryEmbedding, emb);
          return { name: doc.name, summary, score };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 3);

      if (scored.length === 0) {
        return {
          answer: "I couldn't find any relevant documents in your library to answer that question.",
          sources: [],
          error: null,
        };
      }

      const context = scored
        .map((d: any) => `Document: ${d.name}\nSummary: ${d.summary || 'No summary available.'}`)
        .join('\n\n');

      const prompt = `
        You are DocFlow AI assistant. Use the following document context to answer the user's question.
        If the context doesn't contain the answer, say you don't know based on the documents.

        Context:
        ${context}

        Question: ${query}
      `;

      const { data: aiResult, error: chatError } = await AIProviderService.analyze(prompt);
      if (chatError) throw chatError;

      return {
        answer: aiResult?.summary || 'Unable to generate response.',
        sources: scored.map((d: any) => d.name),
        error: null,
      };
    } catch (error: any) {
      LogService.error('Library chat failed', error, { userId });
      return { answer: '', sources: [], error };
    }
  },

  async extractDocument(
    _db: any,
    documentId: string,
    userId: string
  ): Promise<{ data: Record<string, any> | null; error: Error | null }> {
    const { ExtractService } = await import('@/services/documents/extract.service');
    return ExtractService.processDocument(null, documentId, userId);
  },
};
