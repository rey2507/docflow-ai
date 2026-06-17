import { sqliteTable, text, integer, customType } from 'drizzle-orm/sqlite-core';

// Custom type for pgvector (use this when targeting Postgres/Supabase)
const vector = customType<{ data: number[] }>({
  dataType() {
    return 'vector(1536)'; // 1536 is the dimension for OpenAI embeddings
  },
});

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  type: text('type').$type<'invoice' | 'contract' | 'form' | 'image' | 'spreadsheet' | 'other'>().notNull(),
  status: text('status').$type<'pending' | 'processing' | 'completed' | 'failed' | 'validating'>().notNull(),
  storagePath: text('storage_path').notNull(),
  metadata: text('metadata', { mode: 'json' }).$type<{
    fileSize?: number;
    mimeType?: string;
    extractedData?: Record<string, { value: any; confidence: number }>;
    validationSuggestions?: string[];
    summary?: string | null;
    keyPoints?: string[] | null;
    extractedAt?: string;
    aiProvider?: string;
    aiModel?: string;
    pipelineError?: string;
    failedAt?: string;
    duplicateOf?: string;
    embedding?: number[];
    lastExtractionError?: string;
    failedProvider?: string;
    manuallyCorrected?: boolean;
    correctedAt?: string;
  }>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const workflows = sqliteTable('workflows', {
  id: text('id').primaryKey(),
  documentId: text('document_id').references(() => documents.id),
  status: text('status').$type<'active' | 'paused' | 'completed' | 'cancelled' | 'failed'>().notNull(),
  priority: text('priority').notNull(),
  currentStepId: text('current_step_id').notNull(),
  steps: text('steps', { mode: 'json' }).notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  status: text('status').notNull(),
  documentLimit: integer('document_limit'),
  priceId: text('price_id'),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});