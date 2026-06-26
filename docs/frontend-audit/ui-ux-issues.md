# UI / UX Issues

## Critical

### 1. Hardcoded User Context
- **Files**: `routes/index.tsx`, `UploadPage.tsx`, `ReportsPage.tsx`, `SettingsPage.tsx`, `AppShell.tsx`
- **Issue**: `userId="local"`, `userEmail="user@example.com"`, `usagePercent={0}` are passed as props everywhere. Real auth state from Supabase is available in `main.tsx` but never propagated to the router.
- **Impact**: The app cannot function with real users. All dashboards, uploads, and reports use placeholder data.

### 2. Orphaned Sidebar Navigation
- **File**: `components/layout/Sidebar.tsx`
- **Issue**: Sidebar exposes "Documents", "Workflows", and "AI Chat", but no routes exist for them. Clicking these leads to a bare 404 page.
- **Impact**: Users expect functionality that does not exist. Discoverability is broken.

### 3. No Functional Search
- **File**: `components/layout/Header.tsx`
- **Issue**: Search input has `onFocus` / `onBlur` for styling but no `onChange`, no value binding, no search action. `?K` shortcut is shown but not implemented.
- **Impact**: Users see a search bar that does nothing.

### 4. Non-Functional Notifications
- **File**: `components/layout/Header.tsx`
- **Issue**: Bell button renders a red dot badge but has no click handler, no dropdown, and no notification panel.
- **Impact**: Users expect notifications but cannot access them.

### 5. Duplicate Upload UIs
- **Files**: `pages/UploadPage.tsx`, `components/QuickActions.tsx`
- **Issue**: Two different drag-and-drop upload components with different styling (`border-blue-400` vs `border-slate-900`), different accepted file types (`.xlsx,.xls` vs none), and different button patterns.
- **Impact**: Inconsistent UX. Users see different upload experiences in different contexts.

### 6. Unused ErrorBoundary
- **File**: `components/ui/error-boundary.tsx`
- **Issue**: Class-based error boundary exists but is never used. JS errors in components (e.g., `DocumentList` sorting, `PipelineStatusDisplay` realtime) will crash the whole app.
- **Impact**: Poor resilience. One failed fetch can white-screen the dashboard.

### 7. Auth Form in App Root
- **File**: `main.tsx` (lines 167-273)
- **Issue**: 200+ lines of auth UI live in the root `App` component alongside routing logic. This makes `main.tsx` hard to test and violates single-responsibility.
- **Impact**: Auth logic is entangled with router initialization.

## High

### 8. No Real Feedback for Long Operations
- **Files**: `services/documents/orchestrator.service.ts`, `services/ai/provider.service.ts`
- **Issue**: AI extraction and pipeline orchestration run in the background (Fire-and-forget via `PipelineOrchestrator.runPipeline(db, document.id, userId)` without await in `upload.service.ts`). Users see "Processing started" but the `PipelineStatusDisplay` relies on realtime subscription which may not connect.
- **Impact**: Users do not know if processing is stuck or running.

### 9. Missing Command Palette
- **Issue**: `?K` is hinted in the header but no command palette exists.
- **Impact**: Power users have no keyboard-driven navigation.

### 10. Broken Back Navigation
- **File**: `components/DocumentDetails.tsx`
- **Issue**: "Back to Dashboard" button calls `onBack` which sets `selectedDocumentId` to `null`, returning to the dashboard component state. It does not use `useNavigate(-1)` or update URL.
- **Impact**: Deep-linking to a document is impossible. Browser back button does not work.

### 11. Hardcoded Stats / Mock Data
- **Files**: `MainDashboard.tsx`, `AIInsights.tsx`, `WorkflowActivity.tsx`
- **Issue**: `aiUsage={{ used: 847, limit: 1000 }}`, `successRate={98.5}`, `avgConfidence={0.87}`, `defaultActivities` with static timestamps like "2 min ago".
- **Impact**: Dashboard looks alive but shows fake data. Degrades trust when real data loads differently.

### 12. Settings Page Is Placeholder
- **File**: `pages/SettingsPage.tsx`
- **Issue**: All sections (Account, Workspace, Integrations, Danger Zone) contain placeholder text. Only "Sign out" has a handler (no-op).
- **Impact**: Users cannot configure anything.

## Medium

### 13. Inconsistent Empty States
- **Issue**: `EmptyState` component is used in `DocumentList` and `UploadPage`, but `ReportsPage` uses inline text, `SettingsPage` uses placeholder paragraphs, and `DocumentStatsDashboard` uses a custom div.
- **Impact**: Visual inconsistency across the app.

### 14. Inconsistent Error States
- **Issue**: Some pages use rose/emerald inline alert boxes. Others use `EmptyState` with error icons. `DocumentDetails` uses a custom error card with a "Retry" button.
- **Impact**: Users see different error UIs depending on where they are.

### 15. No Loading Skeletons on Routes
- **Issue**: Route-level `Suspense` fallback is `<div className="p-6">Loading...</div>` without skeleton or alignment.
- **Impact**: Page transitions feel jarring.

### 16. Upload Progress Unknown
- **File**: `pages/UploadPage.tsx` and `QuickActions.tsx`
- **Issue**: Upload state is only `uploading: boolean`. No progress percentage, no cancel button.
- **Impact**: Users cannot estimate wait time for large files.

### 17. Table Actions Hidden Until Hover
- **File**: `components/DocumentList.tsx`
- **Issue**: Edit/View/Delete buttons are `opacity-0 group-hover:opacity-100`. On touch devices, hover does not exist.
- **Impact**: Mobile users cannot access document actions.

### 18. DocumentType Hardcoded in Upload
- **File**: `services/documents/upload.service.ts`
- **Issue**: `mapMimeToType` maps all PDFs to `invoice` regardless of actual content.
- **Impact**: Invoices, contracts, and forms all get the same type and validation rules.

## Low

### 19. Inconsistent Icon Sizes
- **Issue**: `h-4 w-4` is common, but `FilePreview`, `DocumentInsights`, and `DocumentList` use `h-6 w-6`, `h-10 w-10`, etc. without a scale.
- **Impact**: Visual rhythm inconsistency.

### 20. Long Component Files
- **Files**: `MainDashboard.tsx` (131 lines), `DocumentList.tsx` (404 lines), `DocumentDetails.tsx` (369 lines), `PipelineStatusDisplay.tsx` (228 lines)
- **Impact**: Hard to maintain and review.
