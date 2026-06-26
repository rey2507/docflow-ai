# Frontend Rebuild Plan

## 1. Phase 1: Cleanup & Consolidation (1-2 days)

### 1.1 Remove Dead Code
- Delete empty type files: `types/document.types.ts`, `types/workflow.types.ts`, `types/report.types.ts`
- Delete unused BEM CSS: `styles/components/auth.css`, `styles/components/button.css`, `styles/components/card.css`, `styles/components/badge.css`, `styles/components/input.css`, `styles/components/skeleton.css`, `styles/components/header.css`, `styles/components/sidebar.css`
- Delete `src/index.ts` (Cloudflare Worker entry) if not actively maintaining the Worker bundle, or move to `worker/`
- Remove unused exports from `components/ui/index.ts` if any

### 1.2 Extract Auth to Page
- Move auth UI from `main.tsx` into `pages/AuthPage.tsx`
- Add route `/auth` or keep as unauthenticated root view before router mounts
- Use existing `Input`, `Button` primitives instead of raw HTML elements

### 1.3 Wire Up ErrorBoundary
- Wrap `<RouterProvider>` in `AppShell` with `<ErrorBoundary>`
- Add a global fallback UI with retry capability

### 1.4 Fix Navigation
- Implement missing routes: `/documents`, `/workflows`, `/chat`
- Update `Sidebar.tsx` to match implemented routes
- Replace hardcoded `userEmail` and `usagePercent` with real context provider

## 2. Phase 2: Design System Foundation (2-3 days)

### 2.1 Tailwind Config Extension
```js
// tailwind.config.js (or vite.config JS object)
theme: {
  extend: {
    colors: {
      primary: { DEFAULT: '#0f172a', hover: '#1e293b' }, // match slate-900
      surface: '#ffffff',
      background: '#f8fafc',
    },
    fontFamily: {
      sans: ['system-ui', '-apple-system', ...],
    },
  }
}
```

### 2.2 Component Standardization
- Replace all inline `<button>` elements with `<Button>` component
- Replace all custom card-like divs with `<Card>` + `<CardHeader>` + `<CardBody>`
- Replace all custom badge spans with `<Badge>`
- Replace all raw `<input>` with `<Input>` or `<SearchInput>`
- Replace inline loading spinners with `<Skeleton>` or `<SkeletonCard>`
- Replace inline empty states with `<EmptyState>`

### 2.3 Shared Stats Component
- Extract `StatsCard` from `DashboardOverview.tsx` into `components/ui/stats-card.tsx`
- Refactor `ReportsPage.tsx` and `DocumentStatsDashboard.tsx` to use shared component

## 3. Phase 3: Missing Primitives (2-3 days)

### 3.1 Modal / Dialog
- Create `components/ui/modal.tsx` with `Modal`, `ModalHeader`, `ModalBody`, `ModalFooter`
- Use for document delete confirmation, settings forms, and image previews

### 3.2 Dropdown / Menu
- Create `components/ui/dropdown.tsx` with `Dropdown`, `DropdownItem`, `DropdownTrigger`
- Implement for: user menu, notification bell, workspace selector

### 3.3 Toast / Notification System
- Create `components/ui/toast.tsx` + `useToast()` hook
- Replace inline `actionFeedback` divs in `DocumentList` with toasts

### 3.4 Table Primitive
- Create `components/ui/table.tsx` with wrappers for `<table>`, `<thead>`, `<tbody>`, `TableRow`, `TableCell`
- Refactor `DocumentList` table rendering to use primitives

### 3.5 Form Primitives
- Create `components/ui/select.tsx`, `components/ui/textarea.tsx`, `components/ui/checkbox.tsx`
- Replace raw `<select>` in `DocumentList` with `<Select>`

## 4. Phase 4: UX Improvements (2-3 days)

### 4.1 Loading & Empty States
- Add `SkeletonPage` wrapper for route-level loading
- Use `EmptyState` consistently across all pages when data is absent
- Add retry buttons to all error states, wired to `refetch` functions

### 4.2 Upload Experience
- Unify `UploadZone` styling between `QuickActions` and `UploadPage`
- Add progress indicator for file uploads
- Add file type/size validation with user-friendly errors

### 4.3 Search
- Wire up `Header` search bar to a document search filter or command palette (Cmd+K)
- Add debounce and keyboard navigation

### 4.4 Notifications
- Replace bell icon with functional dropdown showing activity feed
- Mark notifications as read / persist state

### 4.5 Dark Mode
- Add `class="dark"` toggling on root
- Define all surface, text, and border colors with `dark:` variants
- Ensure charts and gradients adapt

## 5. Phase 5: Responsive & Accessibility (1-2 days)

### 5.1 Responsive
- Audit all breakpoints: `sm`, `md`, `lg`, `xl`
- Ensure `DocumentList` table collapses to cards on mobile (partially done)
- Add `max-h` and scroll to sidebar on mobile
- Test `AppShell` layout on narrow viewports (320px - 768px)

### 5.2 Accessibility
- Add `role="alert"` and `aria-live="polite"` to all error/success toasts
- Ensure all icon-only buttons have `aria-label` (partially done)
- Add `scope="col"` to table headers in `DocumentList`
- Add skip-to-content link
- Ensure focus management in modals and navigation
- Verify color contrast ratios meet WCAG AA
- Add `lang` and proper heading hierarchy

## 6. Phase 6: State Management & Data Fetching (1-2 days)

### 6.1 Replace manual useState with React Query
- `MainDashboard` uses manual `useState` for documents and stats. Replace with `useDocuments()` and `useStats()` hooks.
- `UploadPage` uses local state only. Add mutation with optimistic update.

### 6.2 Global State
- Introduce `AuthContext` instead of passing `userEmail` through props
- Introduce `WorkspaceContext` for subscription/usage data
- Use React Query for server state, Zustand/Context for client state

## 7. Phase 7: Testing & Documentation (1 day)

### 7.1 Component Tests
- Add vitest tests for all `ui/` primitives
- Add interaction tests for `DocumentList` sorting/filtering
- Add tests for auth flow

### 7.2 Documentation
- Generate Storybook or Docgen for component library
- Add README to `components/ui/` with usage examples
- Document design tokens and spacing scale
