# TODO

## Module resolution + directory cleanup

- [ ] Delete misplaced files if they exist:
  - [ ] docs/usage.service.ts
  - [ ] docs/subscription.service.ts
  - [ ] src/services/documents/usage.service.ts
  - [ ] src/services/documents/subscription.service.ts
- [x] Ensure single canonical SubscriptionService implementation exists at:
  - [x] src/services/subscription/subscription.service.ts (create/migrate if missing)
- [x] Update imports to canonical locations:
  - [x] src/services/documents/orchestrator.service.ts should import SubscriptionService from ../subscription/subscription.service
  - [ ] Any other references to subscription.service.ts should match canonical path
- [x] Fix TS2306 “not a module” from legacy path:
  - [x] src/subscription/subscription.service.ts re-exports canonical SubscriptionService
- [ ] Ensure UsageService correctness:
  - [x] src/services/usage/usage.service.ts exports UsageService
  - [x] Syntax comma between logAIUsage and getUserMonthlyTokenUsage
  - [x] Uses usage_logs insert + monthly aggregation
- [x] Ensure SubscriptionService correctness:
  - [x] tiers: free=50k, pro=1M, enterprise=Infinity
  - [x] canProcessDocument enforces monthly usage limit
  - [x] imports supabase from ../../lib/supabase/client
  - [x] imports UsageService from ../usage/usage.service
- [ ] Run TypeScript build:
  - [ ] npm run build
