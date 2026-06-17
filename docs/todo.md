# TODO / Progress

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

FUTURE
- [ ] Mobile App (Expo)
- [ ] Team Workspaces & Collaboration
- [ ] Public API Access
- [ ] Outbound Webhooks
- [ ] Advanced Analytics Dashboard
- [ ] Custom Workflow Automation Builder
