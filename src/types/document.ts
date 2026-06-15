export type DocumentType = 'invoice' | 'contract' | 'form' | 'image' | 'spreadsheet' | 'other';

export type DocumentStatus = 
  | 'pending' 
  | 'uploading' 
  | 'processing' 
  | 'validating' 
  | 'completed' 
  | 'failed';

export interface DocumentMetadata {
  pageCount?: number;
  fileSize: number;
  mimeType: string;
  extractedAt?: string;
  [key: string]: any; // Allow for flexible AI-extracted fields
}

export interface Document {
  id: string;
  userId: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  storagePath: string;
  metadata: DocumentMetadata;
  createdAt: string;
  updatedAt: string;
}