import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { withRetry } from '@/lib/utils/retry';
import { getEnv } from 'docs/env';
import { LogService } from '@/services/logging/log.service';

/**
 * AIProviderService
 * 
 * Abstraction layer for AI models. This allows the system to switch between
 * providers (OpenAI, Gemini, Anthropic) without changing the core business logic.
 */

const openai = new OpenAI({
  apiKey: getEnv('OPENAI_API_KEY'),
  dangerouslyAllowBrowser: true,
});

const genAI = new GoogleGenerativeAI(
  getEnv('GEMINI_API_KEY')
);

export type AIProvider = 'openai' | 'gemini' | 'anthropic';

export interface AIAnalysisResponse {
  rawResponse: string;
  structuredData: Record<string, any> | null;
  suggestions: string[] | null;
  summary: string | null;
  keyPoints: string[] | null;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: AIProvider;
}

export const AIProviderService = {
  /**
   * Generates a vector embedding for a given text.
   * Used for Semantic Search and RAG.
   */
  async embed(
    text: string,
    options: { provider?: AIProvider; model?: string } = {}
  ): Promise<{ embedding: number[] | null; error: Error | null }> {
    try {
      const provider = options.provider || 'openai';
      const model = options.model || 'text-embedding-3-small';

      if (provider === 'openai') {
        const response = await withRetry(() => openai.embeddings.create({
          model: model,
          input: text.replace(/\n/g, ' '),
        }));

        return {
          embedding: response.data[0].embedding,
          error: null
        };
      }

      throw new Error(`Embedding not yet implemented for ${provider}`);
    } catch (error: any) {
      console.error(`[AIProviderService] Embedding error:`, error.message);
      return { embedding: null, error };
    }
  },

  /**
   * General method to analyze text or documents using a chosen provider.
   * Currently acts as a wrapper for future SDK integrations.
   */
  async analyze(
    prompt: string,
    options: { provider?: AIProvider; model?: string; image?: string } = {}
  ): Promise<{ data: AIAnalysisResponse | null; error: Error | null }> {
    try {
      const provider = options.provider || (getEnv('AI_DEFAULT_PROVIDER') as AIProvider) || 'openai';
      const model = options.model || getEnv('AI_DEFAULT_MODEL') || 'gpt-4o';

      LogService.info(`Calling AI provider`, { provider, model, hasImage: !!options.image });

      if (provider === 'openai') {
        const response = await withRetry(() => openai.chat.completions.create({
          model: model,
          messages: [
            { 
              role: 'user', 
              content: options.image 
                ? [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${options.image}` } }
                  ]
                : prompt 
            }
          ],
          response_format: { type: 'json_object' },
        }));

        const rawResponse = response.choices[0].message.content || '';
        let structuredData = null;
        let suggestions: string[] = [];
        let summary: string | null = null;
        let keyPoints: string[] = [];
        
        try {
          const parsed = JSON.parse(rawResponse);
          const { validation_suggestions, summary: parsedSummary, key_points, ...data } = parsed;
          summary = typeof parsedSummary === 'string' ? parsedSummary : null;
          keyPoints = Array.isArray(key_points) ? key_points : [];
          structuredData = data;
          suggestions = Array.isArray(validation_suggestions) ? validation_suggestions : [];
        } catch (e) {
          LogService.warn('Failed to parse AI JSON response', { provider, docId: 'unknown' });
        }

        return {
          data: {
            rawResponse,
            structuredData,
            suggestions,
            summary,
            keyPoints,
            usage: {
              promptTokens: response.usage?.prompt_tokens || 0,
              completionTokens: response.usage?.completion_tokens || 0,
              totalTokens: response.usage?.total_tokens || 0,
            },
            model,
            provider: 'openai',
          },
          error: null,
        };
      }

      if (provider === 'gemini') {
        const genModel = genAI.getGenerativeModel({ 
          model: model,
          generationConfig: { responseMimeType: "application/json" }
        });

        const result = await withRetry(() => 
          genModel.generateContent(
            options.image 
              ? [
                  prompt, 
                  { inlineData: { data: options.image, mimeType: "image/jpeg" } }
                ] 
              : prompt
          )
        );
        const response = await result.response;
        const rawResponse = response.text();
        
        let structuredData = null;
        let suggestions: string[] = [];
        let summary: string | null = null;
        let keyPoints: string[] = [];
        try {
          const parsed = JSON.parse(rawResponse);
          const { validation_suggestions, summary: parsedSummary, key_points, ...data } = parsed;
          summary = typeof parsedSummary === 'string' ? parsedSummary : null;
          keyPoints = Array.isArray(key_points) ? key_points : [];
          structuredData = data;
          suggestions = Array.isArray(validation_suggestions) ? validation_suggestions : [];
        } catch (e) {
          LogService.warn('Failed to parse Gemini JSON response', { provider });
        }

        return {
          data: {
            rawResponse,
            structuredData,
            suggestions,
            summary,
            keyPoints,
            usage: { // Extract usage from Gemini's response metadata
              promptTokens: response.usageMetadata?.promptTokenCount || 0,
              completionTokens: response.usageMetadata?.candidatesTokenCount || 0, // Candidates are completions
              totalTokens: response.usageMetadata?.totalTokenCount || 0,
            },
            model,
            provider: 'gemini',
          },
          error: null,
        };
      }

      // Fallback for other providers while integration is pending
      return { 
        data: {
          rawResponse: `Mock response for ${provider}. Integration pending.`,
          structuredData: null,
          suggestions: null,
          summary: null,
          keyPoints: null,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          model,
          provider
        }, 
        error: null 
      };
      
    } catch (error: any) {
      LogService.error('AI analysis request failed', error, { provider: options.provider });
      return { data: null, error };
    }
  }
};