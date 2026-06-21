import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PipelineOrchestrator } from './orchestrator.service';
import { supabase } from '../../lib/supabase/client';
import { ExtractService } from './extract.service';
import { ValidateService } from './validate.service';
import { FinalizationService } from './finalization.service';
import { SubscriptionService } from '../../subscription/subscription.service';

// Mock all dependencies
vi.mock('../../lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      // Supabase-style mock (only used by these tests)
      select: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

vi.mock('./extract.service');
vi.mock('./validate.service');
vi.mock('./finalization.service');
vi.mock('../../subscription/subscription.service');

describe('PipelineOrchestrator', () => {
  const mockDocId = 'doc-123';
  const mockUserId = 'user-456';

  beforeEach(() => {
    vi.clearAllMocks();

    // Default setup: Document exists and subscription is valid
    (supabase.from as any)().single.mockResolvedValue({
      data: { id: mockDocId, userId: mockUserId, status: 'pending', metadata: {} },
      error: null,
    });

    vi.mocked(SubscriptionService.canProcessDocument).mockResolvedValue({ allowed: true, reason: '' });
  });

  it.skip('should run the full pipeline successfully', async () => {
    vi.mocked(ExtractService.processDocument).mockResolvedValue({ data: {}, error: null });
    vi.mocked(ValidateService.validateData).mockResolvedValue({ success: true, errors: [] } as any);
    vi.mocked(FinalizationService.finalizeDocument).mockResolvedValue({ error: null });

    const result = await PipelineOrchestrator.runPipeline(
      {
        query: {
          documents: {
            findFirst: vi.fn().mockResolvedValue({
              id: mockDocId,
              userId: mockUserId,
              status: 'pending',
              metadata: {},
            }),
          },
          workflows: {
            findFirst: vi.fn().mockResolvedValue(null),
            // ensure eq(workflows.documentId, documentId) doesn't crash on undefined
          },
        },
        update: vi.fn().mockReturnThis(),
      } as any,
      mockDocId,
      mockUserId
    );

    expect(result.success).toBe(true);

    expect(ExtractService.processDocument).toHaveBeenCalled();
    expect(ValidateService.validateData).toHaveBeenCalled();
    expect(FinalizationService.finalizeDocument).toHaveBeenCalled();
  });

  it.skip('should attempt fallback if the first AI provider fails', async () => {
    // Mock environment for provider chain
    process.env.AI_PROVIDER_CHAIN = 'openai,gemini';

    // First attempt fails, second succeeds
    vi.mocked(ExtractService.processDocument)
      .mockResolvedValueOnce({ data: null, error: new Error('OpenAI Failure') })
      .mockResolvedValueOnce({ data: {}, error: null });

    vi.mocked(ValidateService.validateData).mockResolvedValue({ success: true, errors: [] } as any);
    vi.mocked(FinalizationService.finalizeDocument).mockResolvedValue({ error: null });

    const result = await PipelineOrchestrator.runPipeline(
      {
        query: {
          documents: {
            findFirst: vi.fn().mockResolvedValue({
              id: mockDocId,
              userId: mockUserId,
              status: 'pending',
              metadata: {},
            }),
          },
          workflows: {
            findFirst: vi.fn().mockResolvedValue(null),
          },
        },
        update: vi.fn().mockReturnThis(),
      } as any,
      mockDocId,
      mockUserId
    );

    expect(result.success).toBe(true);
    // Should be called twice due to fallback
    expect(ExtractService.processDocument).toHaveBeenCalledTimes(2);

    // Check if it updated metadata about the failure
    expect(supabase.from).toHaveBeenCalledWith('documents');
    expect(vi.mocked(supabase.from('documents').update)).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ failedProvider: 'openai' }) })
    );
  });
});

