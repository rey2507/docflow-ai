/**
 * Error Normalization Utilities
 * 
 * Normalizes errors from various sources (AI providers, databases, external APIs)
 * to consistent, user-friendly messages for the frontend.
 * 
 * This prevents raw provider errors and stack traces from reaching the client.
 */

export type ErrorSeverity = 'user' | 'system' | 'unknown';

export interface NormalizedError {
  message: string;
  code: string;
  severity: ErrorSeverity;
  details?: Record<string, any>;
}

/**
 * Categorizes and normalizes AI provider errors
 */
export function normalizeAIProviderError(error: Error | any, provider: string = 'unknown'): NormalizedError {
  const message = error?.message || String(error);

  // Rate limiting / quota errors
  if (message.includes('429') || message.includes('rate limit') || message.includes('quota')) {
    return {
      message: 'AI service is temporarily busy. Please try again in a few moments.',
      code: 'AI_RATE_LIMITED',
      severity: 'user',
    };
  }

  // Authentication errors
  if (message.includes('401') || message.includes('unauthorized') || message.includes('invalid api key')) {
    return {
      message: 'AI service authentication failed. Please check the service configuration.',
      code: 'AI_AUTH_FAILED',
      severity: 'system',
      details: { provider },
    };
  }

  // Timeout errors
  if (message.includes('timeout') || message.includes('ECONNREFUSED')) {
    return {
      message: 'AI service is not responding. Please try again later.',
      code: 'AI_TIMEOUT',
      severity: 'user',
    };
  }

  // Model not found
  if (message.includes('model') && message.includes('not found')) {
    return {
      message: 'The configured AI model is not available. Please check the model name.',
      code: 'AI_MODEL_NOT_FOUND',
      severity: 'system',
    };
  }

  // Fallback for unknown AI errors
  return {
    message: 'AI processing failed. Your document could not be extracted at this time.',
    code: 'AI_PROCESSING_FAILED',
    severity: 'user',
    details: { provider },
  };
}

/**
 * Categorizes and normalizes database errors
 */
export function normalizeDbError(error: Error | any): NormalizedError {
  const message = error?.message || String(error);

  // RLS policy violations
  if (message.includes('policy') || message.includes('RLS')) {
    return {
      message: 'Access denied. You do not have permission to access this resource.',
      code: 'DB_POLICY_VIOLATION',
      severity: 'user',
    };
  }

  // Foreign key violations
  if (message.includes('foreign key') || message.includes('FOREIGN KEY')) {
    return {
      message: 'This operation references data that no longer exists.',
      code: 'DB_FOREIGN_KEY_VIOLATION',
      severity: 'user',
    };
  }

  // Connection errors
  if (message.includes('connection') || message.includes('ECONNREFUSED')) {
    return {
      message: 'Database connection failed. Please try again later.',
      code: 'DB_CONNECTION_ERROR',
      severity: 'system',
    };
  }

  // Unique constraint violations
  if (message.includes('unique') || message.includes('duplicate')) {
    return {
      message: 'A record with this information already exists.',
      code: 'DB_DUPLICATE_ERROR',
      severity: 'user',
    };
  }

  // Fallback
  return {
    message: 'A database error occurred. Please try again later.',
    code: 'DB_ERROR',
    severity: 'system',
  };
}

/**
 * Normalizes storage-related errors
 */
export function normalizeStorageError(error: Error | any): NormalizedError {
  const message = error?.message || String(error);

  // File not found
  if (message.includes('not found') || message.includes('404')) {
    return {
      message: 'The document file could not be found. It may have been deleted.',
      code: 'STORAGE_NOT_FOUND',
      severity: 'user',
    };
  }

  // Permission errors
  if (message.includes('unauthorized') || message.includes('permission')) {
    return {
      message: 'You do not have permission to access this file.',
      code: 'STORAGE_ACCESS_DENIED',
      severity: 'user',
    };
  }

  // Storage quota exceeded
  if (message.includes('quota') || message.includes('limit')) {
    return {
      message: 'Storage limit exceeded. Please delete some documents to free up space.',
      code: 'STORAGE_QUOTA_EXCEEDED',
      severity: 'user',
    };
  }

  // Connection errors
  if (message.includes('connection') || message.includes('timeout')) {
    return {
      message: 'Storage service is not responding. Please try again later.',
      code: 'STORAGE_TIMEOUT',
      severity: 'system',
    };
  }

  return {
    message: 'A storage error occurred. Please try again later.',
    code: 'STORAGE_ERROR',
    severity: 'system',
  };
}

/**
 * Generic error normalizer that routes to specific handlers
 */
export function normalizeError(error: Error | any, context?: { type: 'ai' | 'db' | 'storage'; provider?: string }): NormalizedError {
  if (!error) {
    return {
      message: 'An unknown error occurred.',
      code: 'UNKNOWN_ERROR',
      severity: 'unknown',
    };
  }

  if (context?.type === 'ai') {
    return normalizeAIProviderError(error, context.provider);
  }

  if (context?.type === 'db') {
    return normalizeDbError(error);
  }

  if (context?.type === 'storage') {
    return normalizeStorageError(error);
  }

  // Try to infer type from error message
  const message = error?.message || String(error);
  if (message.includes('API') || message.includes('provider') || message.includes('model')) {
    return normalizeAIProviderError(error);
  }
  if (message.includes('database') || message.includes('policy') || message.includes('query')) {
    return normalizeDbError(error);
  }
  if (message.includes('storage') || message.includes('bucket')) {
    return normalizeStorageError(error);
  }

  // Generic fallback
  return {
    message: 'An error occurred. Please try again later.',
    code: 'ERROR',
    severity: 'system',
  };
}

/**
 * Formats a normalized error for display to users
 */
export function formatErrorForUser(normalized: NormalizedError): string {
  return normalized.message;
}

/**
 * Logs normalized errors for debugging
 */
export function logNormalizedError(normalized: NormalizedError, context?: Record<string, any>): void {
  const logLevel = normalized.severity === 'system' ? 'error' : 'warn';
  if (logLevel === 'error') {
    console.error(`[${normalized.code}] ${normalized.message}`, { details: normalized.details, ...context });
  } else {
    console.warn(`[${normalized.code}] ${normalized.message}`, { details: normalized.details, ...context });
  }
}
