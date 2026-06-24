# Component Inventory - DocFlow AI

## Current Component Map

### Layout System
| Component | File | Status | Issues |
|-----------|------|--------|--------|
| AppShell | `components/layout/AppShell.tsx` | Stable | ✅ Good composition, minimal issues |
| Sidebar | `components/layout/Sidebar.tsx` | Stable | ✅ Mobile responsive, clean state management |
| Header | `components/layout/Header.tsx` | Stable | ✅ Search + actions + workspace selector |

### Dashboard Components
| Component | File | Status | Issues |
|-----------|------|--------|--------|
| MainDashboard | `components/MainDashboard.tsx` | Mixed | ⚠️ Inline state, duplicated stats logic |
| DashboardOverview | `components/DashboardOverview.tsx` | Good | ✅ Reusable StatsCard |
| StatsCard | Exported from DashboardOverview | Reusable | ✅ Good abstraction |
| RecentDocumentsTable | `components/RecentDocumentsTable.tsx` | Complex | ⚠️ 324 lines, too much inline state |
| DocumentList | `components/DocumentList.tsx` | Duplicate | 🔴 Duplicates RecentDocumentsTable |
| WorkflowActivity | `components/WorkflowActivity.tsx` | Good | ✅ Clean isolated component |
| AIInsights | `components/AIInsights.tsx` | Mixed | ⚠️ Uses custom CSS alongside Tailwind |
| UploadZone | Exported from QuickActions.tsx | OK | ⚠️ Mixed with QuickActions export |
| QuickActions | Export from QuickActions.tsx | OK | ⚠️ Two components in one file |

### Document Components
| Component | File | Status | Issues |
|-----------|------|--------|--------|
| DocumentDetails | `components/DocumentDetails.tsx` | Complex | ⚠️ 369 lines, needs split |
| DocumentInsights | `components/documents/DocumentInsights.tsx` | Good | ✅ Isolated, but inconsistent styling |
| FilePreview | `components/FilePreview.tsx` | Good | ✅ Clean, handles image/PDF |
| PipelineStatusDisplay | `components/PipelineStatusDisplay.tsx` | Good | ✅ Real-time, proper state handling |
| WorkflowTimeline | `components/WorkflowTimeline.tsx` | Good | ✅ Clean visualization |

### Page Components
| Component | File | Status | Issues |
|-----------|------|--------|--------|
| UploadPage | `pages/UploadPage.tsx` | OK | ⚠️ Duplicates UploadZone logic |
| ReportsPage | `pages/ReportsPage.tsx` | OK | ⚠️ Inconsistent card styling |
| SettingsPage | `pages/SettingsPage.tsx` | OK | ⚠️ Simple, placeholder content |

### Empty Components
| Component | File | Status | Issues |
|-----------|------|--------|--------|
| DocumentStatsDashboard | `components/DocumentStatsDashboard.tsx` | **Deplicate** | 🔴 Near-identical to ReportsPage + DashboardOverview |

## Duplication Analysis

### High Duplication
1. **DocumentStatsDashboard** duplicates logic from `ReportsPage` and `DashboardOverview`
2. **UploadZone** logic appears in both `QuickActions.tsx` and `UploadPage.tsx`
3. **Loading skeletons** are implemented differently in:
   - RecentDocumentsTable (5-row bone structure)
   - WorkflowActivity (4-row structure)
   - DashboardOverview (pulse rectangles)
   - PipelineStatusDisplay (different pattern)
4. **Error state patterns** vary:
   - Some use rose-50/rose-200
   - Some use red-50/red-200
   - Some use amber-50/amber-200

### Spacing Duplication
- Repeating card patterns without abstraction:
  - `rounded-xl border border-slate-200 bg-white shadow-sm`
  - `p-4 py-3` header in cards
  - Various `border-slate-100` divider lines

## Missing Components
| Component | Purpose | Priority |
|------------|---------|----------|
| Button | Primary/secondary/ghost variants | **Critical** |
| Badge | Status indicator | **Critical** |
| Input | Form field with label | High |
| Card | Abstract container | High |
| Skeleton | Consistent loading placeholder | High |
| EmptyState | Unified empty state component | Medium |
| Modal | Dialog/popup system | Medium |
| Toast | Notification system | Medium |
| Table | Reusable table primitive | Medium |
| FileUpload | Consistent upload component | Medium |

## Component Quality Metrics

| Metric | Score | Notes |
|--------|-------|-------|
| Reusability | 4/10 | Many one-off components |
| Consistency | 5/10 | Mixed Tailwind + custom CSS |
| Maintainability | 6/10 | Generally readable |
| Accessibility | 5/10 | Some aria labels mixed with missing ones |
| Responsiveness | 7/10 | Mobile/desktop handled |
| State Management | 5/10 | Local state, no shared patterns |
