# Component Inventory

## 1. Reusable UI Primitives (src/components/ui/)

| Component | File | Variants/Props | Duplicates / Notes |
|-----------|------|----------------|---------------------|
| Button | `ui/button.tsx` | primary, secondary, danger, ghost; sm/default/lg/icon; loading | BEM `.btn` in `button.css` conflicts. Auth buttons in `main.tsx` are raw `<button>` with inline classes. |
| Card | `ui/card.tsx` | default, ghost | BEM `.card` in `card.css` conflicts. Many components roll their own card-like divs (`rounded-2xl border shadow-sm`). |
| Badge | `ui/badge.tsx` | default, success, warning, error, info | BEM `.badge` in `badge.css` conflicts. Status badges in `DocumentList` use inline `<span>` with classes. |
| Input | `ui/input.tsx` | label, error, helperText | BEM `.form-input` in `input.css` conflicts. `main.tsx` uses raw `<input>` with inline classes for auth. |
| SearchInput | `ui/input.tsx` | extends Input | Used only in `Header.tsx`. |
| Skeleton | `ui/skeleton.tsx` | rectangular, circular, card; animate | BEM `.skeleton` in `skeleton.css` conflicts. SkeletonCard and SkeletonTable exported but SkeletonCard is not imported anywhere. |
| EmptyState | `ui/empty-state.tsx` | icon, title, description, action | Used only in `DocumentList.tsx` and `UploadPage.tsx`. Not used for zero-state in `ReportsPage` or `SettingsPage`. |
| ErrorBoundary | `ui/error-boundary.tsx` | fallback, onReset | **DEFINED BUT NEVER USED** in the app. |
| PageContainer | `ui/layout.tsx` | default, narrow, medium | Used in layout pages and `AppShell`. |
| SectionContainer | `ui/layout.tsx` | sm, md, lg spacing | Used in pages and some components. |

## 2. Layout Components

| Component | File | Notes |
|-----------|------|-------|
| AppShell | `layout/AppShell.tsx` | Wraps all protected routes. Passes hardcoded `userEmail` and `usagePercent={0}`. |
| Header | `layout/Header.tsx` | Mix of Tailwind + inline className conditionals. Search input is non-functional (no onChange). Notification bell has no dropdown. |
| Sidebar | `layout/Sidebar.tsx` | Uses BEM `sidebar` class. References routes `/documents`, `/workflows`, `/chat` that do not exist. Mobile menu has open state but no close-on-navigate-from-header. |

## 3. Feature Components

| Component | File | Purpose | Issues |
|-----------|------|---------|--------|
| MainDashboard | `MainDashboard.tsx` | Dashboard orchestrator | 280+ lines, handles data fetching AND layout. Contains inline `Page` type conflicting with `types/page.ts`. |
| DashboardOverview | `DashboardOverview.tsx` | 6-up stats cards grid | Exports `StatsCard` but it is not reused. Hardcoded `aiUsage={{ used: 847, limit: 1000 }}` and `memberCount={1}`. |
| DocumentStatsDashboard | `DocumentStatsDashboard.tsx` | Stats cards for reports | **DUPLICATE** of `ReportsPage.tsx` logic. |
| DocumentList | `DocumentList.tsx` | Table/grid toggle, filtering, pagination | 400+ lines. `SkeletonCard` imported but unused. Inline table/rendering has duplicated empty-state logic. |
| DocumentDetails | `DocumentDetails.tsx` | Document preview + extracted data editing | 370+ lines. Uses raw `<input>` instead of `Input` component. Missing `Input` for confidence badges. |
| AIInsights | `AIInsights.tsx` | Usage meter + metrics | Uses inline `style` for progress bar width. Hardcoded fallback data. |
| WorkflowActivity | `WorkflowActivity.tsx` | Activity feed | Falls back to hardcoded `defaultActivities` when no props provided. Should use `EmptyState` instead. |
| QuickActions | `QuickActions.tsx` | Action grid + UploadZone | `UploadZone` duplicates upload UI from `UploadPage.tsx` with different styling and no drag-over color consistency. |
| FilePreview | `FilePreview.tsx` | File previewer | Custom loading spinner instead of using `Skeleton`. |
| PipelineStatusDisplay | `PipelineStatusDisplay.tsx` | Real-time pipeline status | 228 lines, handles loading/error/success/timeout/retry states. Inline buttons instead of `Button` component. |
| WorkflowTimeline | `WorkflowTimeline.tsx` | Vertical step timeline | Custom SVG icons inline instead of lucide. |
| DocumentInsights | `documents/DocumentInsights.tsx` | AI summary + key points | Lives in `components/documents/` but is not referenced by `DocumentDetails`. Custom loading skeleton instead of `SkeletonCard`. |

## 4. Missing / Broken Components

| Component | Status | Notes |
|-----------|--------|-------|
| Modal | **MISSING** | No modal/dialog primitive. `DocumentDetails` effectively navigates away instead of opening a modal. No confirmation dialogs. |
| Dropdown | **MISSING** | Notification bell, user menu, and workspace selector are all buttons with no dropdown. |
| Toast / Notification | **MISSING** | Action feedback in `DocumentList` uses inline alert divs. No global toast system. |
| Table | **MISSING as primitive** | `DocumentList` renders a custom `<table>` inline. No reusable `Table` component. |
| Form | **MISSING as primitive** | Auth form in `main.tsx` is raw HTML. No `Form`, `Select`, `Checkbox`, `Textarea` primitives. |
| Select | **MISSING** | `DocumentList` uses raw `<select>` with inline classes. |
| Tabs | **MISSING** | No tab navigation for multi-section views. |
| Toggle / Switch | **MISSING** | No toggle component. |
| Avatar | **MISSING** | User avatar rendered as inline `<div>` in `Header` and `Sidebar`. |
| Breadcrumb | **MISSING** | No breadcrumb for drill-down navigation. |
| Accordion | **MISSING** | No accordion for collapsible sections. |
