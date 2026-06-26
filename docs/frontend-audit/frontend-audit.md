# DocFlow AI Frontend Audit

## 1. Folder Structure Map

```
src/
+-- components/
¦   +-- layout/
¦   ¦   +-- AppShell.tsx          # Root layout wrapper (uses PageContainer)
¦   ¦   +-- Header.tsx            # Top navigation bar (inline styles + Tailwind)
¦   ¦   +-- Sidebar.tsx           # Side navigation (BEM classes)
¦   +-- ui/
¦   ¦   +-- index.ts              # Barrel export for all UI primitives
¦   ¦   +-- button.tsx            # Button primitive (variant, size, loading)
¦   ¦   +-- card.tsx              # Card, CardHeader, CardBody, CardFooter
¦   ¦   +-- input.tsx             # Input + SearchInput (label, error, helperText)
¦   ¦   +-- badge.tsx             # Badge (5 variants)
¦   ¦   +-- skeleton.tsx          # Skeleton + SkeletonCard + SkeletonTable
¦   ¦   +-- empty-state.tsx       # EmptyState (icon, title, description, action)
¦   ¦   +-- error-boundary.tsx    # Class-based ErrorBoundary (not used)
¦   ¦   +-- layout.tsx            # PageContainer, SectionContainer
¦   +-- providers/
¦   ¦   +-- Providers.tsx         # QueryClientProvider wrapper
¦   +-- documents/
¦   ¦   +-- DocumentInsights.tsx  # AI summary/key-points card
¦   +-- MainDashboard.tsx         # Dashboard page component (lazy-loaded)
¦   +-- DashboardOverview.tsx     # Stats cards grid + StatsCard
¦   +-- DocumentList.tsx          # Document table/grid view with filters, pagination
¦   +-- DocumentStatsDashboard.tsx # Reports-style stats card (DUPLICATE of ReportsPage)
¦   +-- AIInsights.tsx            # Usage + success rate + confidence metrics
¦   +-- WorkflowActivity.tsx      # Recent activity feed (hardcoded fallback data)
¦   +-- QuickActions.tsx          # QuickActions grid + UploadZone
¦   +-- FilePreview.tsx           # Image/PDF/download previewer
¦   +-- PipelineStatusDisplay.tsx # Real-time pipeline status + retry logic
¦   +-- WorkflowTimeline.tsx      # Vertical workflow step timeline
¦   +-- DocumentDetails.tsx       # Full document detail view with editing
+-- pages/
¦   +-- UploadPage.tsx            # Dedicated upload page
¦   +-- ReportsPage.tsx           # Reports/analytics page
¦   +-- SettingsPage.tsx          # Settings page (placeholder content)
+-- hooks/
¦   +-- useStats.ts               # React Query hook for stats
¦   +-- useDocuments.ts           # React Query hooks for documents + delete
+-- styles/
¦   +-- main.css                  # Massive custom utility + CSS-variable system
¦   +-- components/
¦       +-- auth.css              # BEM auth form styles
¦       +-- layout.css            # BEM shell/sidebar/header styles
¦       +-- header.css            # BEM header styles (CONFLICTS with layout.css)
¦       +-- sidebar.css           # Empty file
¦       +-- button.css            # BEM button styles (CONFLICTS with ui/button.tsx)
¦       +-- card.css              # BEM card styles (CONFLICTS with ui/card.tsx)
¦       +-- badge.css             # BEM badge styles (CONFLICTS with ui/badge.tsx)
¦       +-- input.css             # BEM input styles (CONFLICTS with ui/input.tsx)
¦       +-- skeleton.css          # BEM skeleton styles (CONFLICTS with ui/skeleton.tsx)
+-- services/
¦   +-- auth/
¦   ¦   +-- auth.service.ts       # Supabase auth wrapper
¦   +-- documents/
¦   ¦   +-- document.service.ts
¦   ¦   +-- upload.service.ts
¦   ¦   +-- extract.service.ts
¦   ¦   +-- validate.service.ts
¦   ¦   +-- validator.factory.ts
¦   ¦   +-- finalization.service.ts
¦   ¦   +-- orchestrator.service.ts
¦   ¦   +-- storage.service.ts
¦   ¦   +-- email-import.service.ts
¦   ¦   +-- rate-limit.service.ts
¦   ¦   +-- invoice.rules.ts
¦   ¦   +-- contract.rules.ts
¦   ¦   +-- form.rules.ts
¦   ¦   +-- types.ts
¦   ¦   +-- orchestrator.service.test.ts
¦   +-- workflow/
¦   ¦   +-- workflow.service.ts
¦   +-- ai/
¦   ¦   +-- provider.service.ts   # OpenAI + Gemini client abstraction
¦   ¦   +-- prompt.service.ts     # Prompt templates per document type
¦   ¦   +-- chat.service.ts       # RAG-based library chat
¦   ¦   +-- provider.service.test.ts
¦   +-- reports/
¦   ¦   +-- report.service.ts
¦   +-- usage/
¦   ¦   +-- usage.service.ts
¦   +-- security/
¦   ¦   +-- rate-limit.service.ts
¦   +-- logging/
¦       +-- log.service.ts
+-- subscription/
¦   +-- subscription.service.ts
+-- lib/
¦   +-- queryClient.ts
¦   +-- supabase/
¦   ¦   +-- client.ts             # Supabase singleton + runtime config injection
¦   +-- utils/
¦       +-- index.ts              # cn(), formatBytes(), formatDate(), truncate()
¦       +-- error-normalization.ts # AI/DB/Storage/Auth error normalizers
¦       +-- retry.ts              # Exponential backoff utility
¦       +-- env-validation.ts
+-- types/
¦   +-- page.ts                   # Page type enum
¦   +-- document.ts               # Document, DocumentMetadata, DocumentStatus
¦   +-- document.types.ts         # EMPTY FILE (orphan)
¦   +-- workflow.ts               # Workflow, WorkflowStep, WorkflowPriority
¦   +-- workflow.types.ts         # EMPTY FILE (orphan)
¦   +-- report.ts                 # Report, ReportFilter, ReportType
¦   +-- report.types.ts           # EMPTY FILE (orphan)
¦   +-- auth.ts                   # UserProfile, AuthState, UserRole
+-- routes/
¦   +-- index.tsx                 # Browser router config (lazy routes)
+-- main.tsx                      # App root (auth state, signin/signup UI)
+-- index.ts                      # Cloudflare Worker entry (static asset serving)
+-- vite-env.d.ts
```

## 2. Key Architectural Observations

### Duplication
- **DocumentStatsDashboard.tsx** contains nearly identical stats rendering logic to **ReportsPage.tsx**
- **Document type definitions** exist in both `types/document.ts` and `types/document.types.ts` (empty)
- **Button styles**: BEM `.btn` in `button.css` vs Tailwind-based `Button` component in `ui/button.tsx`
- **Card styles**: BEM `.card` in `card.css` vs Tailwind-based `Card` components in `ui/card.tsx`
- **Header styles**: `.header` in both `layout.css` and `header.css` with conflicting rules
- **Auth UI**: Inline auth form in `main.tsx` (288 lines) vs `styles/components/auth.css` (only used by nothing)

### Missing Boundaries
- No `features/` directory or domain-driven module boundaries
- Pages vs Components are inconsistently organized (Dashboard is a component, Upload is a page)
- Services import `@/` aliases from multiple levels (`docs/client`, `docs/schema`), creating cross-cutting coupling
- No separation between `pages/` and `features/`; feature components sit at `components/` root

### Reusable Opportunities
- `DocumentStatsDashboard.tsx` and `ReportsPage.tsx` should share a single `StatsCards` component
- `UploadZone` logic is duplicated between `QuickActions.tsx` and `UploadPage.tsx` with different styling
- `EmptyState` is used in `DocumentList` but not leveraged for error/loading fallbacks in other pages
- `ErrorBoundary` component is defined but **never imported or used anywhere**
- Multiple hardcoded loading skeletons across components instead of using `SkeletonCard`/`SkeletonTable`
