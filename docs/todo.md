PLACEHOLDER

## Deno Edge Function type-checking fixes
- [x] Created `docs/index.edge.ts` as the Deno Edge entrypoint (original logic).
- [x] Converted `docs/index.ts` to a stub/reference so it doesn’t break the main app build.
- [x] Added typings stubs for Deno globals + esm.sh URL imports:
  - [x] `docs/types/deno-globals.d.ts`
  - [x] `docs/types/esm-url-modules.d.ts`
- [x] Added `tsconfig.docs.json` to validate `docs/**/*.ts` using those stubs.
- [x] Verify that both `npx tsc -p tsconfig.docs.json --noEmit` passes with no errors.

## VSCode editor diagnostics
- [x] If VSCode still shows errors for `docs/index.edge.ts`, restart TS server / select correct TS config.

8. [x] AI provider abstraction (`src/services/ai/provider.service.ts`)
9. [x] Prompt manager (`src/services/ai/prompt.service.ts`)

PHASE 4 — WORKFLOW ENGINE
10. [x] Workflow service (`src/services/workflow/workflow.service.ts`)

PHASE 5 — REPORTING
11. [x] Report generation service (`src/services/reports/report.service.ts`)
12. [x] Document finalization service (`src/services/documents/finalization.service.ts`)

---

PHASE 6 — INTEGRATION (COMPLETE)
13. [x] Orchestrate full pipeline (Upload -> Extract -> Validate -> Finalize)
14. [x] Implement specific validation rules for invoice documents in ValidateService
15. [x] Create WorkflowTimeline component
16. [x] Add manual retry button to PipelineStatusDisplay
17. [x] Refactor validation logic into rule-based factory pattern
18. [x] Implement real-time Supabase subscriptions in UI components

PHASE 7 — PRODUCTIZATION (HIGHEST PRIORITY)
19. [x] Main Documents Dashboard with stats and filters (Task 7.1)
20. [x] Documents Listing Page with card/table views and actions (Task 7.2)
21. [x] Document Details Page showing full lifecycle data (Task 7.3)
22. [x] File Preview System (PDF, PNG, JPG) (Task 7.4)
23. [x] Extraction Correction UI for manual field edits (Task 7.5)

---
Engineering / DevEx Tasks (Test & CI readiness)
- 41. [x] Fix Vitest setupFiles path and add repo-local `tsconfig.json` so tests compile.
- 42. [x] Resolve Vite/Vitest React plugin type mismatch so `npx vitest run` passes.
- 43. [x] Implement PipelineOrchestrator integration test (sub-service mocking).
- 44. [x] Implement WorkflowTimeline component test (Realtime subscription mocking).
- 45. [x] Record 'failedAt' timestamp in PipelineOrchestrator catch block.
- 46. [x] Implement 'validateMetadata' runtime validation helper.
- 47. [x] Implement automated cleanup Edge Function for stale 'processing' documents.
- 48. [x] Verify Stripe webhook signature verification with raw string body in Deno runtime.
- 49. [x] Audit Edge Functions for remaining Node-specific globals (Buffer, process) and replace with Deno/Web standards.
- 50. [x] Abstract environment variable fetching into a centralized utility for Cloudflare/Deno portability.
- 51. [x] Implement Drizzle ORM schema and universal DB client configuration.
- 52. [x] Setup initial Drizzle migrations using `drizzle-kit generate`.
- 53. [x] Migrate `SubscriptionService` to use Drizzle ORM.
- 54. [x] Migrate `WorkflowService` and `ExtractService` fetches to Drizzle ORM.

---

PHASE 8 — AI QUALITY IMPROVEMENTS
24. [x] Real AI Provider integration (OpenAI & Gemini) (Task 8.1)
25. [x] Field-level Confidence Scoring (Task 8.2)
26. [x] Implement fallback mechanism in PipelineOrchestrator to switch to Gemini if OpenAI fails
27. [x] AI-generated Validation Suggestions (Task 8.3)
28. [x] Generic retry strategy utility with exponential backoff
29. [x] Add a Jitter factor to the retry utility to prevent thundering herd issues

PHASE 9 — SAAS READINESS
30. [x] Implement the Usage Tracking service for Task 9.1
31. [x] Subscription Plan limits enforcement (Task 9.2)
32. [x] Billing Integration (Stripe/Razorpay) (Task 9.3)

PHASE 10 — BUSINESS FEATURES
33. [x] Contract Validation Rules (Signatures, Expiry) (Task 10.1)
34. [x] Form Validation Rules (Required fields, Formats) (Task 10.2)
35. [x] Duplicate Upload/Invoice Detection (Task 10.3)
36. [x] AI Summary and Key Point Generation (Task 10.4)

PHASE 11 — GROWTH FEATURES
37. [x] Email Import (Gmail/Outlook attachments) (Task 11.1)
38. [x] OCR Support for scanned docs and photos (Task 11.2)
39. [x] Semantic Search ("contracts expiring soon") (Task 11.3)
40. [x] Interactive AI Chat with document context (Task 11.4)

---

PHASE 12 — PRODUCTION HARDENING

Goal:
Convert DocFlow AI from Beta to Launch Ready.

---

55. [x] **Task 12.1 - Processing Credit Enforcement** (Priority: CRITICAL)
    - Problem: `canProcessDocument` currently returns true.
    - [x] Implement processing credit tracking
    - [x] Implement monthly usage tracking
    - [x] Implement quota enforcement
    - [x] Implement processing blocks
    - **Acceptance Criteria:**
      - [x] Processing denied when limit exceeded
      - [x] User receives actionable error message
      - [x] Usage metrics available for dashboard (Service logic implemented)

56. [x] **Task 12.2 - AI Provider Failover** (Priority: CRITICAL)
    - [x] Implement OpenAI ↓ Gemini ↓ Anthropic fallback chain logic
    - **Acceptance Criteria:**
      - [x] Automatic provider failover on failure
      - [x] Actual provider used is recorded in document metadata
      - [x] Retry statistics and failure reasons captured and typed in metadata

57. [x] **Task 12.3 - Security Verification** (Priority: HIGH)
    - [x] Verify Supabase RLS policies for all tables
    - [x] Verify ownership validation in all service methods
    - [x] Audit storage bucket permissions
    - [x] Secure API authorization headers
    - **Acceptance Criteria:**
      - [x] Manual verification that cross-user document access is impossible

58. [x] **Task 12.4 - Billing Enforcement** (Priority: HIGH)
    - [x] Connect subscription status to user quotas
    - [x] Link quotas to pipeline execution permissions
    - **Acceptance Criteria:**
      - [x] Billing status affects platform access

59. [x] **Task 12.5 - Rate Limiting** (Priority: HIGH)
    - [x] Implement rate limiting for file uploads
    - [x] Implement rate limiting for AI extraction endpoints
    - [x] Implement rate limiting for chat endpoints (Service logic implemented)
    - **Acceptance Criteria:**
      - [x] Abuse prevention triggers correctly under high load

60. [x] **Task 12.6 - Structured Logging** (Priority: MEDIUM)
    - [x] Create a centralized `LogService`
    - [x] Capture provider-specific failures
    - [x] Capture pipeline orchestration failures
    - [x] Capture validation and billing errors
    - **Acceptance Criteria:**
      - [x] Production issues are traceable via logs

61. [x] **Task 12.7 - Vector Search Foundation** (Priority: MEDIUM)
    - [x] Implement persistent embedding storage (pgvector)
    - [x] Create vector indexes for summary columns (Schema ready)
    - [x] Implement similarity search logic
    - **Acceptance Criteria:**
      - [x] Semantic search results are backed by actual vector storage queries

62. [x] **Task 12.8 - Production Test Audit** (Priority: MEDIUM)
    - [x] Audit existing test accuracy
    - [x] Review mocked behavior vs. real service implementation
    - [x] Identify and fill gaps in integration tests
    - **Acceptance Criteria:**
      - [x] No tests passing for non-existent features (e.g., failover loop verified)

---

## NEW — Typecheck blocker checklist (from latest `tsc`)
- [x] `docs/schema.ts`: add/align `documents.userId`
- [x] `docs/schema.ts`: add/align `documents.metadata` (JSONB) field
- [x] `docs/schema.ts`: align `workflows` fields to service expectations (`steps`, `currentStepId` vs `stepsConfig`, `currentStep`)
- [x] `docs/schema.ts`: add/align `subscriptions.userId`
- [x] `docs/schema.ts`: add/align `usage_logs.userId`
- [x] After schema alignment, rerun: `npx tsc -p tsconfig.json --noEmit --pretty false`

---

## Phase: Supabase Infrastructure Finalization
- [ ] Validate all RLS policies (tables: documents, workflows, workflow_steps, usage_logs, subscriptions, storage objects).
- [ ] Test workspace isolation: ensure cross-workspace access is denied for reads/writes.
- [ ] Test document ownership rules: ensure users can only act on documents they own / belong to.
- [ ] Test realtime subscriptions for workspace-scoped updates (no cross-tenant leakage).
- [ ] Create/verify Supabase storage buckets for document uploads (bucket exists + correct naming).
- [ ] Configure and verify storage policies (read/write scoped by workspace + ownership).
- [ ] Verify pgvector similarity search end-to-end (embedding stored -> similarity query -> expected results).

## Phase: Backend Refactor Cleanup
- [ ] Remove remaining D1/SQLite logic and references (code + docs/config).
- [ ] Refactor `ChatService` to use native pgvector similarity queries (no legacy similarity paths).
- [ ] Audit all services for Supabase compatibility (Auth, Documents, Chat, Reports, Storage).
- [ ] Validate migration consistency across database setup + Drizzle migrations (no drift).
- [ ] Remove obsolete D1 documentation/config references (docs + runtime files).

## Phase: Environment & Secrets
- [ ] Create `.env.example` with all required variables (including Supabase + Edge Function env).
- [ ] Document required env vars in README (and/or docs) with defaults where safe.
- [ ] Validate missing env handling (fail fast with clear, non-sensitive error).
- [ ] Add startup env validation (for both app and edge/docs runtime entrypoints).

## Phase: Error System Audit
- [ ] Ensure raw stack traces are never exposed to the UI (sanitize error responses).
- [ ] Validate graceful API failure responses (consistent shape + status codes).
- [ ] Add/verify fallback UI states for: failed loads, empty data, and server errors.
- [ ] Test AI provider failure handling (failover triggers, correct provider attribution).
- [ ] Test empty/no-response states (no embeddings, no results, empty chat context).
- [ ] Test upload failures (network abort, unsupported file, storage policy denial).
- [ ] Test timeout handling (AI calls, extraction calls, realtime fetch dependencies).
- [ ] Test invalid auth/session handling (expired token, missing session, revoked user).

## Phase: UI/UX Stability Audit
- [ ] Validate responsive layouts (dashboard, details, workflow timeline, forms).
- [ ] Test loading states (skeletons/spinners) for all major screens.
- [ ] Test empty states (no documents, no workflows, no chat history).
- [ ] Test dashboard usability (filters/actions work with realistic data volume).
- [ ] Ensure no broken navigation (routes/components linked correctly).
- [ ] Verify form validation UX (client-side rules + server error mapping).
- [ ] Verify basic accessibility (keyboard navigation, readable contrast, focus states).
- [ ] Ensure UI remains simple and maintainable (avoid adding new complex UI flows).

## Phase: Testing & QA
- [ ] Run and complete end-to-end workflow testing (happy path + failure modes).
- [ ] Upload pipeline testing (multipart flow, storage write, metadata persistence).
- [ ] Extraction validation testing (rule outcomes + error mapping).
- [ ] Semantic search testing (vector query correctness + workspace scoping).
- [ ] Auth flow testing (sign-in/out + session persistence + protected routes).
- [ ] Workspace RBAC testing (read/write/delete boundaries).
- [ ] Regression testing across key services (chat, workflow timeline, reports).
- [ ] Production smoke testing (build + runtime checks + critical paths).

## Phase: Deployment Preparation
- [ ] Cloudflare Pages configuration verification (build output, routes, env wiring).
- [ ] Supabase production environment validation (URLs, keys, schema, RLS enabled).
- [ ] Deployment-time environment variable setup (secrets management readiness).
- [ ] Production build testing (app build + edge/docs typecheck + bundling).
- [ ] Edge function verification (workflows: upload/extract/chat/storage/realtime).
- [ ] Deployment rollback planning (document steps; confirm revert can be executed safely).

## Phase: Billing Decision
- [ ] Evaluate Stripe alternatives (requirements fit + implementation complexity).
- [ ] Decide payment provider strategy (current plan vs migration path).
- [ ] Define free-tier limits (credits/workflows/chats; enforcement expectations).
- [ ] Separate free vs paid AI provider access (quota gating + safe error messaging).

## Post-Launch Next Steps
- [ ] Create a single, canonical “Correction UI” endpoint and wire it to the Extraction Correction UI
- [ ] Implement Edge Function / worker for OCR offloading to reduce Edge memory pressure
- [ ] Add middleware to Deno Edge Functions to prevent API abuse (upload/extract/chat)
- [ ] Refine subscription/credit proration for mid-cycle upgrades
- [ ] Validate pgvector HNSW performance for expected dataset size and plan migration strategy





