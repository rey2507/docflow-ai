export type LogMeta = Record<string, any>;

/**
 * Minimal logging utility.
 *
 * This project currently references LogService from multiple locations.
 * Keep this API stable and dependency-free.
 */
export const LogService = {
  info(message: string, meta?: LogMeta) {
    // eslint-disable-next-line no-console
    console.info(`[INFO] ${message}`, meta ?? '');
  },

  warn(message: string, meta?: LogMeta) {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, meta ?? '');
  },

  error(message: string, error?: any, meta?: LogMeta) {
    // eslint-disable-next-line no-console
    if (error !== undefined) {
      console.error(`[ERROR] ${message}`, error, meta ?? '');
    } else {
      console.error(`[ERROR] ${message}`, meta ?? '');
    }
  },

  logPipelineStart(docId: string, userId: string) {
    this.info(`Pipeline Started`, { docId, userId });
  },

  logProviderFailure(docId: string, provider: string, error: any) {
    this.warn(`AI Provider Failure`, { docId, provider, error: error?.message || error });
  },

  logPipelineSuccess(docId: string, durationMs: number) {
    this.info(`Pipeline Completed Successfully`, { docId, durationMs });
  }
};
