import { supabase } from '../lib/supabase/client';
import { AIProviderService } from '../services/ai/provider.service';
import { WorkflowService } from '../services/workflow/workflow.service';
import { LogService } from '../services/logging/log.service';

const pdfParse = (() => {
  try {
    // require dynamically so bundlers won't include it on the client
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    // @ts-ignore
    return require('pdf-parse');
  } catch (e) {
    return null;
  }
})();

export async function processDocumentServer(documentId: string, userId: string, providerOverride?: string) {
  try {
    const { data: document } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!document) throw new Error('Document not found');

    // mark processing and pipelineStartedAt
    await supabase
      .from('documents')
      .update({ status: 'processing', metadata: { ...(document.metadata || {}), pipelineStartedAt: new Date().toISOString() }, updated_at: new Date().toISOString() })
      .eq('id', documentId);

    let textPreview: string | undefined;
    // try pdf parse when available
    if (pdfParse && document.storage_path && (document.name?.toLowerCase().endsWith('.pdf') || document.metadata?.mimeType === 'application/pdf')) {
      try {
        const { data: blob, error: dlErr } = await supabase.storage.from('documents').download(document.storage_path);
        if (!dlErr && blob) {
          const arrayBuffer = await blob.arrayBuffer();
          const parsed = await pdfParse(Buffer.from(arrayBuffer));
          textPreview = String(parsed?.text || '').slice(0, 20000);
          await supabase.from('documents').update({ metadata: { ...(document.metadata || {}), textPreview }, updated_at: new Date().toISOString() }).eq('id', documentId);
        }
      } catch (e) {
        LogService.warn('pdf parse failed in server core', { error: (e as any)?.message });
      }
    }

    // build prompt based on type - simplified
    const prompt = `Extract structured data and summary from document. Preview: ${textPreview || ''}`;

    const { data: aiResult, error: aiError } = await AIProviderService.analyze(prompt, { provider: providerOverride as any });
    if (aiError || !aiResult) throw aiError || new Error('AI failed');

    const updatedMetadata = { ...(document.metadata || {}), extractedData: aiResult.structuredData || {}, summary: aiResult.summary, aiProvider: aiResult.provider, aiModel: aiResult.model, extractedAt: new Date().toISOString() };
    await supabase.from('documents').update({ metadata: updatedMetadata, status: 'completed', updated_at: new Date().toISOString() }).eq('id', documentId);

    // finalize workflow step
    try {
      const { data: workflow } = await WorkflowService.getWorkflowByDocumentId(null, documentId);
      if (workflow) await WorkflowService.updateStepStatus(null, workflow.id, 'Extraction', 'completed');
    } catch (e) {
      // ignore
    }

    return { success: true, result: aiResult };
  } catch (error) {
    LogService.error('server extract failed', error as Error, { documentId });
    try {
      const { data: doc } = await supabase.from('documents').select('metadata').eq('id', documentId).maybeSingle();
      const existing = (doc?.metadata as Record<string, any>) || {};
      await supabase.from('documents').update({ metadata: { ...existing, extractionError: (error as any)?.message || String(error), failedAt: new Date().toISOString() }, status: 'failed', updated_at: new Date().toISOString() }).eq('id', documentId);
    } catch (e) {
      // ignore
    }
    return { success: false, error };
  }
}

export default { processDocumentServer };
