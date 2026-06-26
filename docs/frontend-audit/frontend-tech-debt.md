# Frontend Tech Debt

## 1. Styling Debt

| Issue | Location | Severity | Effort |
|-------|----------|----------|--------|
| `main.css` reimplements Tailwind with CSS variables | `styles/main.css` (350 lines) | High | 2d |
| BEM CSS files are dead code | `styles/components/*.css` (8 files) | High | 0.5d |
| Tailwind + BEM + inline styles in same view | `Header.tsx`, `Sidebar.tsx`, `main.tsx` | Medium | 1d |
| Primary color mismatch (slate-900 vs sky blue vars) | CSS vars vs Tailwind config | Medium | 0.5d |
| No dark mode tokens or variants | All components | Low | 2d |

## 2. Component Architecture Debt

| Issue | Location | Severity | Effort |
|-------|----------|----------|--------|
| Auth UI in `main.tsx` (288 lines) | `main.tsx` | High | 1d |
| `MainDashboard` is 130 lines of orchestration + layout | `MainDashboard.tsx` | Medium | 1d |
| `DocumentList` is 404 lines (table, grid, filters, pagination, delete) | `DocumentList.tsx` | High | 2d |
| `DocumentDetails` is 369 lines (preview, status, editing, metadata) | `DocumentDetails.tsx` | High | 2d |
| `PipelineStatusDisplay` is 228 lines (realtime, retry, error) | `PipelineStatusDisplay.tsx` | Medium | 1d |
| `ErrorBoundary` defined but never used | `ui/error-boundary.tsx` | Medium | 0.5d |
| `SkeletonCard` exported but never imported | `ui/skeleton.tsx` | Low | 0d |
| `PageContainer` used inconsistently (some pages use it, `DocumentDetails` uses inline classes) | Multiple | Medium | 0.5d |

## 3. Navigation & Routing Debt

| Issue | Location | Severity | Effort |
|-------|----------|----------|--------|
| Sidebar references non-existent routes (Documents, Workflows, AI Chat) | `Sidebar.tsx` | High | 1d |
| Hardcoded `userId="local"` in all route elements | `routes/index.tsx` | High | 1d |
| `ProtectedRoute` only checks localStorage string, no token validation | `routes/index.tsx` | Medium | 0.5d |
| No `ErrorBoundary` around routes | `routes/index.tsx` | Medium | 0.5d |
| Suspense fallback is unstyled plain text | `routes/index.tsx` | Low | 0.5d |

## 4. State Management Debt

| Issue | Location | Severity | Effort |
|-------|----------|----------|--------|
| `MainDashboard` uses manual `useState` instead of `useDocuments`/`useStats` hooks | `MainDashboard.tsx` | High | 1d |
| `ReportsPage` duplicates `useEffect`+`useState` pattern from `DocumentStatsDashboard` | `ReportsPage.tsx`, `DocumentStatsDashboard.tsx` | High | 0.5d |
| Auth context not lifted to router; props drilling for `userEmail` | `main.tsx` -> `Providers` -> `AppShell` -> pages | Medium | 1d |
| `localStorage` used for auth session alongside Supabase `onAuthStateChange` | `main.tsx` | Medium | 0.5d |
| Upload mutation not using React Query `useMutation` | `UploadPage.tsx`, `MainDashboard.tsx` | Medium | 0.5d |

## 5. Type Safety Debt

| Issue | Location | Severity | Effort |
|-------|----------|----------|--------|
| Empty type files: `document.types.ts`, `workflow.types.ts`, `report.types.ts` | `types/` | Low | 0d |
| `as any` casts in services (`upload.service.ts`, `orchestrator.service.ts`) | `services/documents/` | Medium | 1d |
| `DbClient` from `docs/client` is loosely typed, causing `as any` chains | `services/**/*.ts` | Medium | 1d |
| `Document` type has `Date` fields but may receive ISO strings from Supabase | `types/document.ts` vs `ReportService.getUserDocumentStats` | Low | 0.5d |
| `Page` type defined in `types/page.ts` and re-declared in `MainDashboard.tsx` | `types/page.ts`, `MainDashboard.tsx` | Low | 0d |

## 6. Data Fetching Debt

| Issue | Location | Severity | Effort |
|-------|----------|----------|--------|
| `PipelineOrchestrator.runPipeline` is fire-and-forget (no await) in `upload.service.ts` | `upload.service.ts` line 111 | High | 0.5d |
| `MainDashboard` calls `fetchStats` and `fetchDocuments` on every mount AND on refresh without caching | `MainDashboard.tsx` | Medium | 0.5d |
| `PipelineStatusDisplay` uses Supabase realtime but no reconnection logic or backoff | `PipelineStatusDisplay.tsx` | Medium | 1d |
| No request caching for `ReportService` calls | `ReportsPage.tsx` | Low | 0.5d |

## 7. Error Handling Debt

| Issue | Location | Severity | Effort |
|-------|----------|----------|--------|
| `ErrorBoundary` not wrapping the app | `main.tsx` | High | 0.5d |
| `withRetry` utility exists but is only used for AI calls | `lib/utils/retry.ts` | Low | 0.5d |
| `DocumentList` action feedback uses inline alert divs, not a shared error component | `DocumentList.tsx` | Medium | 0.5d |
| `LogService` uses `console.*` -- no production logging backend | `services/logging/log.service.ts` | Medium | 1d |
| Error messages sometimes leak raw API text (e.g., `Retry failed: err.message`) | `PipelineStatusDisplay.tsx` | Medium | 0.5d |

## 8. Accessibility Debt

| Issue | Location | Severity | Effort |
|-------|----------|----------|--------|
| No skip-to-content link | `AppShell.tsx` | Medium | 0.5d |
| Table headers in `DocumentList` lack `scope="col"` | `DocumentList.tsx` | Medium | 0.5d |
| Icon-only buttons in `DocumentList` have `aria-label` but the table action buttons do not | `DocumentList.tsx` | Low | 0.5d |
| No `lang` on individual pages (relies on root `index.html`) | All | Low | 0d |
| No focus management for mobile sidebar drawer | `Sidebar.tsx` | Medium | 0.5d |
| Color contrast `slate-500` on white fails AA for normal text | Multiple components | Medium | 1d |

## 9. Build & Config Debt

| Issue | Location | Severity | Effort |
|-------|----------|----------|--------|
| `index.ts` (Cloudflare Worker) is in `src/` alongside React code | `src/index.ts` | Low | 0.5d |
| `vite.config.ts` manually stringifies env vars with `define` | `config/vite.config.ts` | Low | 0.5d |
| No ESLint / Prettier configs visible in root | Missing | Medium | 0.5d |
| No `.env` validation at build time (only runtime) | `lib/utils/env-validation.ts` | Low | 0d |
