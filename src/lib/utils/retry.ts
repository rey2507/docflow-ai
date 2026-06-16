export interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  backoffFactor: number;
  jitter: number;
}

const defaultOptions: RetryOptions = {
  maxRetries: 3,
  initialDelayMs: 1000,
  backoffFactor: 2,
  jitter: 0.1, // 10% jitter
};

/**
 * Generic retry utility with exponential backoff.
 * 
 * @param fn The asynchronous function to retry.
 * @param options Configuration for retries.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const { maxRetries, initialDelayMs, backoffFactor, jitter } = { ...defaultOptions, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      if (attempt === maxRetries) break;

      const baseDelay = initialDelayMs * Math.pow(backoffFactor, attempt);
      const jitterAmount = Math.random() * baseDelay * jitter;
      const delay = baseDelay + jitterAmount;

      console.warn(`[Retry] Attempt ${attempt + 1} failed. Retrying in ${delay}ms... Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}