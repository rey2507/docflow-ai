export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'validating';
export type DocumentType = 'invoice' | 'contract' | 'form' | 'image' | 'spreadsheet' | 'other';

export interface DocumentMetadata {
  fileSize?: number;
  mimeType?: string;
  extractedData?: Record<string, { value: any; confidence: number }>;
  validationSuggestions?: string[];
  summary?: string | null; // Added for AI Summary
  keyPoints?: string[] | null; // Added for AI Key Points
  extractedAt?: string; // ISO date string
  aiProvider?: string;
  aiModel?: string;
  embedding?: number[]; // Added for Semantic Search
  pipelineError?: string;
  failedAt?: string;
  duplicateOf?: string;
  lastExtractionError?: string;
  failedProvider?: string;
  manuallyCorrected?: boolean;
  correctedAt?: string;
  extractionAttempted?: boolean; // Set when AI extraction was attempted but failed
  pipelineStartedAt?: string; // ISO timestamp when pipeline began — used for timeout detection
  contentHash?: string; // SHA-256 hash of file content for deduplication
}

export interface Document {
  id: string;
  userId: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  storagePath: string;
  metadata: DocumentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Runtime validation helper for DocumentMetadata
 */
export function validateMetadata(metadata: unknown): metadata is DocumentMetadata {
  if (typeof metadata !== 'object' || metadata === null) return false;
  
  // Basic structural check; can be expanded with specific field validations
  return true;
}