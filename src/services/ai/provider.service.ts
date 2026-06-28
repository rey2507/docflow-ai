import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { withRetry } from '@/lib/utils/retry';
import { getEnv } from 'docs/env';
import { LogService } from '@/services/logging/log.service';

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

function parseAIResponse(rawResponse: string, provider: AIProvider): {
  structuredData: Record<string, any> | null;
  suggestions: string[];
  summary: string | null;
  keyPoints: string[];
} {
  try {
    const parsed = JSON.parse(rawResponse);
    const { validation_suggestions, summary: parsedSummary, key_points, ...data } = parsed;
    return {
      structuredData: data,
      suggestions: Array.isArray(validation_suggestions) ? validation_suggestions : [],
      summary: typeof parsedSummary === 'string' ? parsedSummary : null,
      keyPoints: Array.isArray(key_points) ? key_points : [],
    };
  } catch (error: any) {
    LogService.warn(`Failed to parse ${provider} JSON response`, { error: error.message });
    return { structuredData: null, suggestions: [], summary: null, keyPoints: [] };
  }
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

      return { embedding: null, error: new Error(`Embedding not yet implemented for ${provider}`) };
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
        const { structuredData, suggestions, summary, keyPoints } = parseAIResponse(rawResponse, 'openai');

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
        const { structuredData, suggestions, summary, keyPoints } = parseAIResponse(rawResponse, 'gemini');

        return {
          data: {
            rawResponse,
            structuredData,
            suggestions,
            summary,
            keyPoints,
            usage: {
              promptTokens: response.usageMetadata?.promptTokenCount || 0,
              completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
              totalTokens: response.usageMetadata?.totalTokenCount || 0,
            },
            model,
            provider: 'gemini',
          },
          error: null,
        };
      }

      return { 
        data: null, 
        error: new Error(`AI provider "${provider}" is not yet implemented. Use openai or gemini.`) 
      };
      
    } catch (error: any) {
      LogService.error('AI analysis request failed', error, { provider: options.provider });
      return { data: null, error };
    }
  }
};