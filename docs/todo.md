# DocFlow AI — Production Readiness Audit Roadmap (Stability-First)

## Audit date
2026-06-29

> Scope: audit-only output. Code changes tracked in git history. This file maps completed work and remaining tasks.

---

## Risk key
- **CRITICAL**: must be resolved before any production launch.
- **HIGH**: high likelihood of user harm/data exposure/major reliability issues.
- **MEDIUM**: likely to cause degraded experience or operational burden.
- **LOW**: quality/maintainability improvements that reduce future risk.

---

## Phase 0 — Audit Findings Triage & Roadmap Hygiene

### 0.1 — Reconcile contradictory readiness documentation
- [x] **HIGH**: Identify conflicts between `docs/audit_report.md` / `docs/audit-report.md` readiness claims and the requirement that the app is **not** production-ready.
- **HIGH**: Update operational interpretation in `docs/todo.md` so tasks reflect reality (reliability/recovery/security/deployment blockers).

### 0.2 — Establish "definition of done" for stabilization
- **CRITICAL**: Define acceptance criteria per workflow (Upload → Extract → Validate → Finalize) covering: success, known failure modes, retries, and user-facing recovery paths.
- **HIGH**: Define acceptance criteria per critical endpoint (upload, extraction, chat, report generation, file preview download URL).

---

## Phase 1 — Production Safety: Auth, Authorization, and Workspace Isolation

### 1.1 — Validate route protection and session lifecycle
- [x] **CRITICAL**: Confirm all routes that expose user data enforce auth and workspace scope (no client-only guards that can be bypassed).
- [x] **HIGH**: Ensure sign-out clears session state across the UI reliably (no stale user context after logout).
- [x] **HIGH**: Ensure "auth loading" race conditions never trigger unsafe queries (no querying with missing/empty user/session identifiers).

### 1.2 — Validate workspace membership enforcement across all data access
- **CRITICAL**: Verify every document/workflow/report/stats query is scoped to the correct workspace/user membership.
- **CRITICAL**: Ensure Supabase RLS policies and server-side query filters align; no reliance on client filtering.
- **HIGH**: Confirm realtime subscriptions (document workflow updates) cannot leak events across workspaces/users.

---

## Phase 2 — Workflow Reliability & Recovery (Document Lifecycle)

### 2.1 — End-to-end pipeline correctness under failure
- **CRITICAL**: For each pipeline stage (extract/validate/finalize), document observed failure modes and ensure they transition to a safe, user-visible failed state.
- [x] **CRITICAL**: Ensure the orchestrator cannot leave workflows "stuck" in intermediate states after provider errors/timeouts.

### 2.2 — Retry, cooldown, and loop safety
- [x] **CRITICAL**: Implement/verify retry policies that are bounded (no infinite retry loops).
- [x] **HIGH**: Add provider cooldown/429 handling expectations (backoff + user messaging + eventual safe failure).
- [x] **HIGH**: Add graceful timeout handling so workflows fail predictably rather than consuming resources indefinitely.

### 2.3 — Repair UX for user trust ("what do I do next?")
- **CRITICAL**: If extraction/validation outputs low-confidence or incomplete fields, provide a user-safe recovery path (either automated recovery or explicit user correction workflow).
- [x] **HIGH**: Ensure UI exposes "Retry/Recover" actions only when a valid recovery mechanism exists.
- [x] **HIGH**: Validate current UX behavior when retry endpoints don't exist (avoid dead buttons / broken expectations).

### 2.4 — Duplicate detection and idempotency hardening
- [x] **HIGH**: Confirm deduplication is content-robust (filename+size is insufficient) and is consistent with storage/document metadata.
- **HIGH**: Ensure pipeline processing is idempotent for re-uploads/retries (avoid double-charging and duplicate workflows).

---

## Phase 3 — Storage & Document Safety (Uploads, Previews, Cleanup)

### 3.1 — Upload correctness and storage rollback behavior
- **CRITICAL**: Verify atomicity: if DB insertion fails after upload, storage objects are rolled back; if storage fails, DB doesn't leave orphan records.
- **HIGH**: Confirm workspace auto-create/membership behavior is safe and cannot produce cross-workspace exposure.

### 3.2 — Preview/download reliability and error containment
- [x] **HIGH**: Ensure file preview/download URLs handle failures gracefully (no raw errors; user-safe fallback states).
- **HIGH**: Validate preview behavior across supported file types (PDF, images, DOC/DOCX mapping) and error messaging for unsupported types.

### 3.3 — Orphaned file and stale workflow cleanup
- **HIGH**: Define and implement storage cleanup for orphaned files created by aborted/stuck workflows.
- **MEDIUM**: Add document lifecycle cleanup strategy (archive/retention rules) aligned with user expectations and billing realities.

---

## Phase 4 — AI Provider Orchestration Reliability & Cost Safety

### 4.1 — Provider failover is truly operational
- **CRITICAL**: Verify failover chain behavior under real outages (OpenAI → Gemini → Anthropic) includes bounded retries and correct stage transitions.
- **HIGH**: Ensure provider-specific error normalization prevents raw provider errors from reaching users.

### 4.2 — Quota exhaustion and model selection safety
- **HIGH**: Ensure quota/rate-limit exhaustion is handled without cascading failures (bounded retries + safe failure state + clear UX).
- **HIGH**: Confirm usage tracking stays accurate across providers for both extraction and chat.

### 4.3 — Extraction output quality controls
- **HIGH**: Validate OCR/extraction confidence handling so low confidence is surfaced and actionable.
- **MEDIUM**: Define fallback behavior when OCR confidence is too low (avoid silent "success" with unusable data).
- [x] **MEDIUM**: Add/complete field-level confidence scoring requirements if not already fully implemented.

---

## Phase 5 — SaaS Fundamentals: Billing, Usage Tracking, and Limits

### 5.1 — Subscription + quota enforcement correctness
- **CRITICAL**: Ensure upload and processing limits are consistently enforced end-to-end (UI + backend + orchestrator).
- **CRITICAL**: Ensure users cannot bypass limits via retries, background processing, or alternate entry points.

### 5.2 — Upgrade/downgrade proration safety
- **HIGH**: Address proration edge cases for mid-cycle upgrades so accounting stays correct.

### 5.3 — Billing integration readiness
- **CRITICAL**: Confirm Stripe (or configured billing provider) is fully integrated for production (webhooks, idempotency, verification, environment separation).
- **HIGH**: Validate webhook failure recovery and reprocessing strategy (no duplicated state transitions).

---

## Phase 6 — Security Hardening Beyond RLS

### 6.1 — Rate limiting enforcement and safe fallback behavior
- **CRITICAL**: Ensure rate limits protect all relevant endpoints (upload, extraction, chat, report generation).
- **HIGH**: Ensure rate limit failures return user-friendly, safe responses (no silent bypass that breaks fairness or costs).

### 6.2 — Environment separation and secrets handling
- **HIGH**: Confirm production env vars are finalized and validated; no dev defaults that leak behavior (or URLs).
- **HIGH**: Ensure API keys are never exposed to the browser and are only used in server/worker contexts.

### 6.3 — Content and upload validation safety
- **HIGH**: Validate file type/content beyond MIME type to prevent unsafe or unsupported uploads.
- [x] **HIGH**: Establish file size limits and ensure errors are user-safe.

---

## Phase 7 — Frontend Reliability & Trustworthy UX

### 7.1 — Eliminate misleading UI states
- **CRITICAL**: Remove or disable UI actions that do not have functioning backend endpoints (avoid broken expectations).
- [x] **HIGH**: Ensure all pages show correct loading, empty, and error states consistently.

### 7.2 — Notifications and realtime UX correctness
- **CRITICAL**: Replace any client-only/seeded notification behavior with real per-user backend data.
- **HIGH**: Ensure notification read/unread state persists reliably across refresh and new sessions.

### 7.3 — Trust-building workflow visibility
- **HIGH**: Ensure pipeline progress is visible, accurate, and eventually consistent (no silent failures).
- [x] **HIGH**: Ensure users can interpret failed states and recover using available actions.

### 7.4 — Accessibility and safety UX
- [x] **MEDIUM**: Complete accessibility pass: focus states, keyboard navigation, screen reader validation.
- [x] **MEDIUM**: Verify skip navigation and interactive element semantics across main flows.

---

## Phase 8 — Observability, Logging, and Operational Readiness

### 8.1 — Production logging coverage
- [x] **CRITICAL**: Ensure all critical systems log structured events: upload lifecycle, orchestrator transitions, provider calls/failures, and quota enforcement.
- **HIGH**: Ensure user-facing errors map to internal error codes for support/debugging.

### 8.2 — Monitoring readiness
- **HIGH**: Define operational dashboards/alerts for: failed workflows, provider error rates, rate limit spikes, webhook failures, and storage rollback counts.

### 8.3 — Tracing for workflow debugging
- [x] **HIGH**: Ensure every document/workflow has correlation identifiers across frontend actions, orchestrator updates, AI calls, and storage/DB operations.

---

## Phase 9 — Testing, QA, and Release Verification

### 9.1 — Real end-to-end verification (no mocks-only)
- **CRITICAL**: Run manual and automated end-to-end tests covering the full pipeline on multiple providers.
- **CRITICAL**: Include recovery tests: provider timeouts, quota exhaustion, and forced failures.

### 9.2 — Browser automation smoke tests
- **HIGH**: Add/execute Playwright workflow tests for: login → upload → verify processing → view results → chat (if enabled) → retry/recovery.

### 9.3 — Regression suite for critical paths
- **HIGH**: Lock in regression coverage for upload/download preview correctness and document detail correctness.

---

## Phase 10 — Deployment Readiness & Launch Preparation

### 10.1 — Production environment configuration
- **CRITICAL**: Finalize production environment variables and validate them before deploy.
- **HIGH**: Configure Supabase production settings and storage buckets/policies.

### 10.2 — Infrastructure deployment verification
- **CRITICAL**: Verify Cloudflare Workers/edge runtime compatibility end-to-end.
- **HIGH**: Confirm migrations are validated for production and are safe to re-run.

### 10.3 — Security headers and transport safety
- **HIGH**: Ensure HTTPS and security headers are correctly configured.

<<<<<<< HEAD
### 10.4 — Final launch gate
- **CRITICAL**: Create a go/no-go checklist that blocks launch if any critical workflow safety criteria fail.
=======
### Phase 13.4 — Error Handling & Resilience Hardening (Mostly Completed)
- [x] Add frontend error boundaries (ErrorBoundary wired in router)
- [x] Normalize API error responses
- [x] Add retry handling for provider failures
- [x] Add provider cooldown handling for 429 errors
- [x] Prevent stuck workflows
- [x] Add graceful timeout handling
- [ ] Verify upload recovery logic
- [x] Improve structured logging coverage
- [x] Prevent infinite retry loops
- [x] Ensure readable user-facing error messages

### Phase 13.5 — Real System Testing & Verification (Pending)
- [ ] Manual end-to-end workflow testing
- [ ] Authentication testing
- [ ] Upload testing
- [ ] AI extraction testing
- [ ] Provider failover testing
- [ ] Workspace isolation/RLS verification
- [ ] Semantic search verification
- [ ] AI chat verification
- [ ] Realtime update verification
- [ ] OCR/image extraction verification
- [ ] Playwright installation and setup
- [ ] Playwright browser workflow testing
- [ ] Keep Vitest limited to utility/service tests only

### Phase 13.6 — Deployment & Production Launch Preparation (Partial)
- [ ] Finalize production environment variables
- [x] Configure Cloudflare Workers deployment
- [ ] Configure Supabase production settings
- [ ] Verify production migrations
- [ ] Configure storage buckets/policies
- [ ] Configure monitoring/logging
- [ ] Configure production rate limits
- [ ] Verify production failover handling
- [ ] Configure custom domain
- [ ] Verify HTTPS/security headers
- [ ] Perform final production readiness audit
>>>>>>> 4f97c5a77741c97e8b5d886773d13c5004c955ba

---

## Phase 11 — Post-Launch Stabilization Only (No new features)

### 11.1 — Address remaining reliability debt
- **MEDIUM**: Resolve medium-risk items that remain after launch gate passes (vector performance, OCR memory pressure mitigations).
- **MEDIUM**: Complete any missing correction/recovery workflows required for safe user trust.

### 11.2 — Performance and cost controls
- **LOW**: Optimize vector search strategy and memory-heavy payload handling in a controlled, stability-first manner.

### 11.3 — Enterprise features (deferred post-launch)
- [x] **MEDIUM**: Add document export functionality for user data portability.
- [x] **MEDIUM**: Add document sharing/link generation for collaboration workflows.

---

## Phase 12 — Completion Summary

### Completed in latest session
- **2.1** — Stuck workflow prevention + timeout handling via `pipelineStartedAt` timestamp + 30min timeout check
- **2.2** — Bounded retry with exponential backoff, provider cooldown service for 429 errors
- **2.3** — Retry button in DocumentList for failed documents, UI shows valid recovery actions only
- **2.4** — SHA-256 content hash duplicate detection (`computeFileHash` + `file-validation.service.ts`)
- **4.3** — Field-level confidence scoring in extract service and UI
- **6.3** — File size limits (25MB) with user-safe errors (extension validation only; magic-byte validation not yet wired)
- **7.1** — Dead retry button removed from PipelineStatusDisplay, functional retry added to DocumentList
- **7.4** — Accessibility improvements (aria-labels, focus rings, keyboard navigation, skip nav)
- **8.1** — Structured logging coverage replacing all console.* calls in services
- **8.3** — Correlation/trace IDs in LogService for workflow tracing
- **11.3** — Document export (JSON download) and share (clipboard link) in DocumentList

### Still remaining
- **1.2** — Full workspace membership enforcement on all queries
- **3.1** — Verify upload atomicity with E2E testing
- **3.3** — Orphaned file cleanup and document lifecycle/auto-archive
- **4.1** — Wire `normalizeAIProviderError` into provider error paths (function exists but is unused; raw errors still surface)
- **4.2** — Wire `RateLimitService` into API route middleware (service exists but is never imported or used)
- **5.1** — End-to-end quota enforcement verification (backend middleware)
- **5.3** — Stripe billing integration
- **6.1** — Rate limiting middleware for API routes (frontend exists, backend incomplete)
- **6.3** — Magic-byte / signature-based file type validation (FILE_SIGNATURES defined but never called)
- **7.2** — Real notification backend data (not client-only seeded)
- **8.2** — Operational monitoring dashboards/alerts
- **9.1-9.3** — Real E2E testing, Playwright, regression suite
- **10.1** — Finalize production environment variables
- **10.3** — HTTPS/security headers configuration
- **10.4** — Final production readiness audit and launch gate
- **11.1** — Remaining reliability debt (vector performance, OCR memory)
- **11.2** — Performance/cost optimization for heavy payloads
