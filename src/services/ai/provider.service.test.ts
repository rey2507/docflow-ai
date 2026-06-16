import { describe, it, expect, vi } from 'vitest';
import { AIProviderService } from './provider.service';

// Mock the OpenAI SDK
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: '{"field": "value"}' } }],
            usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
          }),
        },
      },
    })),
  };
});

describe('AIProviderService', () => {
  it('should analyze text using openai and return structured data', async () => {
    const { data, error } = await AIProviderService.analyze('test prompt', { provider: 'openai' });
    
    expect(error).toBeNull();
    expect(data?.provider).toBe('openai');
    expect(data?.usage.totalTokens).toBe(15);
    expect(data?.structuredData).toEqual({ field: 'value' });
  });
});