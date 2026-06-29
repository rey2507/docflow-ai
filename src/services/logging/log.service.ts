export type LogMeta = Record<string, any>;

let currentTraceId: string | null = null;

export function setTraceId(traceId: string | null) {
  currentTraceId = traceId;
}

export function getTraceId(): string | null {
  return currentTraceId;
}

export function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const LogService = {
  withTrace<T>(traceId: string, fn: () => T): T {
    const previous = currentTraceId;
    currentTraceId = traceId;
    try {
      return fn();
    } finally {
      currentTraceId = previous;
    }
  },

  info(message: string, meta?: LogMeta) {
    const enriched = { ...meta, traceId: currentTraceId };
    console.info(`[INFO] ${message}`, enriched ?? '');
  },

  warn(message: string, meta?: LogMeta) {
    const enriched = { ...meta, traceId: currentTraceId };
    console.warn(`[WARN] ${message}`, enriched ?? '');
  },

  error(message: string, error?: any, meta?: LogMeta) {
    const enriched = { ...meta, traceId: currentTraceId };
    if (error !== undefined) {
      console.error(`[ERROR] ${message}`, error, enriched ?? '');
    } else {
      console.error(`[ERROR] ${message}`, enriched ?? '');
    }
  },

  logPipelineStart(docId: string, userId: string) {
    const traceId = generateTraceId();
    setTraceId(traceId);
    this.info(`Pipeline Started`, { traceId, docId, userId });
  },

  logProviderFailure(docId: string, provider: string, error: any) {
    this.warn(`AI Provider Failure`, { docId, provider, error: error?.message || error });
  },

  logPipelineSuccess(docId: string, durationMs: number) {
    const traceId = currentTraceId;
    this.info(`Pipeline Completed Successfully`, { traceId, docId, durationMs });
    setTraceId(null);
  }
};
