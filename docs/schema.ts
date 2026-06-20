import { 
  pgTable, 
  uuid, 
  text, 
  integer, 
  timestamp, 
  boolean, 
  numeric, 
  jsonb, 
  pgEnum, 
  index, 
  unique,
  uniqueIndex,
  vector,
  pgSchema
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// --- Supabase Auth Schema ---

export const authSchema = pgSchema('auth');
export const users = authSchema.table('users', {
  id: uuid('id').primaryKey().notNull(),
});

// --- Enum Definitions ---

export const workspaceRoleEnum = pgEnum('workspace_role', ['admin', 'member']);
export const documentStatusEnum = pgEnum('document_status', ['pending', 'processing', 'completed', 'failed', 'validating']);
export const documentTypeEnum = pgEnum('document_type', ['invoice', 'contract', 'form', 'image', 'spreadsheet', 'other']);
export const workflowStatusEnum = pgEnum('workflow_status', ['active', 'paused', 'completed', 'cancelled', 'failed']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'trialing', 'past_due', 'canceled', 'unpaid']);
export const planTypeEnum = pgEnum('plan_type', ['free', 'pro', 'enterprise']);

// --- Tables ---

/**
 * Profiles: User identity and settings.
 * References the auth.users table in Supabase.
 */
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => users.id).notNull(), // Managed by Supabase Auth
  email: text('email').unique().notNull(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Workspaces: The top-level tenant.
 */
export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * WorkspaceMembers: RBAC for multitenancy.
 */
export const workspaceMembers = pgTable('workspace_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  role: workspaceRoleEnum('role').default('member').notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.workspaceId, t.userId),
}));

/**
 * Documents: Asset container within a workspace.
 */
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  // The authenticated user that owns the document.
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  type: documentTypeEnum('type').notNull(),
  status: documentStatusEnum('status').default('pending').notNull(),
  // Arbitrary pipeline metadata (ex: provider used, retry stats, extraction results overrides).
  metadata: jsonb('metadata'),
  storagePath: text('storage_path').notNull(),
  mimeType: text('mime_type'),
  extension: text('extension'),
  sizeBytes: integer('size_bytes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  workspaceStatusIdx: index('idx_documents_workspace_status').on(t.workspaceId, t.status),
  unqDuplicate: unique('unq_documents_duplicate').on(t.workspaceId, t.name, t.sizeBytes),
  userStatusIdx: index('idx_documents_user_status').on(t.userId, t.status),
}));

/**
 * DocumentExtractions: Structured AI results.
 */
export const documentExtractions = pgTable('document_extractions', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  data: jsonb('data').notNull(),
  summary: text('summary'),
  keyPoints: text('key_points').array(),
  aiModel: text('ai_model'),
  aiProvider: text('ai_provider'),
  confidenceScore: numeric('confidence_score', { precision: 3, scale: 2 }),
  rawResponse: text('raw_response'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  documentIdUnqIdx: uniqueIndex('idx_extractions_document_id').on(t.documentId),
  dataGinIdx: index('idx_extractions_data_gin').using('gin', t.data),
}));

/**
 * DocumentEmbeddings: Vector data for semantic search.
 */
export const documentEmbeddings = pgTable('document_embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  embedding: vector('embedding', { dimensions: 1536 }),
  embeddingProvider: text('embedding_provider').notNull(),
  embeddingModel: text('embedding_model').notNull(),
  contentChunk: text('content_chunk'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  embeddingHnswIdx: index('idx_embeddings_vector').using('hnsw', t.embedding.op('vector_cosine_ops')),
}));

/**
 * ValidationResults: Business rule compliance.
 */
export const validationResults = pgTable('validation_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  ruleName: text('rule_name').notNull(),
  isValid: boolean('is_valid').notNull(),
  errorMessage: text('error_message'),
  suggestions: jsonb('suggestions'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Workflows: State machine tracking.
 */
export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  status: workflowStatusEnum('status').default('active').notNull(),

  // Current step pointer (what WorkflowService expects)
  currentStepId: text('current_step_id').notNull(),
  // Step definitions/state
  steps: jsonb('steps').notNull(),

  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (t) => ({
  documentIdUnq: unique().on(t.documentId),
}));

/**
 * Subscriptions: Billing and entitlements.
 */
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'restrict' }).notNull(),
  // User that owns the subscription (used by quota enforcement)
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  status: subscriptionStatusEnum('status').notNull(),
  planType: planTypeEnum('plan_type').notNull(),
  documentLimit: integer('document_limit'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripePriceId: text('stripe_price_id'),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * UsageLogs: Quota tracking.
 */
export const usageLogs = pgTable('usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'set null' }),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  promptTokens: integer('prompt_tokens').default(0).notNull(),
  completionTokens: integer('completion_tokens').default(0).notNull(),
  totalTokens: integer('total_tokens').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  workspaceUsageIdx: index('idx_usage_workspace_created').on(t.workspaceId, t.createdAt),
  userUsageIdx: index('idx_usage_user_created').on(t.userId, t.createdAt),
}));

/**
 * AuditLogs: Compliance and event history.
 */
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  action: text('action').notNull(),
  changes: jsonb('changes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Rate limiting counters for abuse prevention.
 */
export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey().notNull(),
  count: integer('count').notNull(),
  // Migration uses reset_at INTEGER. Keep it as integer and convert in service.
  resetAt: integer('reset_at').notNull(),
});

