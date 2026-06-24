# Route Inventory - DocFlow AI

## Current Routes

### Implemented Routes
| Route | Component | Status | Documented? |
|-------|-----------|--------|-------------|
| `/` (Dashboard) | MainDashboard | Stable | ✅ |
| `/documents` | *Not implemented* | Missing | ❌ |
| `/upload` | UploadPage | Basic | ✅ |
| `/workflows` | *Not implemented* | Missing | ❌ |
| `/chat` | *Not implemented* | Missing | ❌ |
| `/reports` | ReportsPage | Basic | ✅ |
| `/settings` | SettingsPage | Placeholder | ✅ |

### Routing System
- **Current**: Client-side conditional rendering in `main.tsx`
- **Pattern**: Switch/case in `pageContent` IIFE
- **State**: `currentPage` in App component
- **Navigation**: `onNavigate` prop passed through AppShell

### Route Issues
1. **No `/documents` route** - Only accessible via back button from details
2. **No `/workflows` route** - Referenced in Sidebar but missing
3. **No `/chat` route** - Referenced in Sidebar but missing
4. **No URL/routing library** - React Router not installed
5. **No browser history** - No `pushState`/`popstate` handling
6. **Deep linking broken** - Cannot bookmark document details

## Route to Screen Map

### 1. Dashboard (`currentPage: 'dashboard'`)
- **Component**: MainDashboard
- **Sub-components**: DashboardOverview, RecentDocumentsTable, WorkflowActivity, AIInsights, UploadZone, QuickActions
- **Purpose**: Home hub, document list, metrics
- **UX Issues**:
  - Detail view replaces dashboard (no nested routing)
  - Upload zone on dashboard vs dedicated upload page (confusing)
  - Detail view has full document handling

### 2. Upload (`currentPage: 'upload'`)
- **Component**: UploadPage
- **Purpose**: Dedicated upload page
- **UX Issues**:
  - Duplicates UploadZone styling
  - Success state forces navigation back after 1.5s (invasive)
  - No batch upload
  - Type-specific UI missing

### 3. Reports (`currentPage: 'reports'`)
- **Component**: ReportsPage
- **Purpose**: Document statistics and efficiency
- **UX Issues**:
  - Very basic (2 cards)
  - Repetitive with DashboardOverview
  - No date range filtering
  - No export functionality

### 4. Settings (`currentPage: 'settings'`)
- **Component**: SettingsPage
- **Purpose**: Account/workspace management
- **UX Issues**:
  - Placeholder content
  - No actual settings
  - Sign out on same page as settings
  - No profile editing

### 5. Document Details (`selectedDocumentId set`)
- **Component**: DocumentDetails
- **Purpose**: Single document lifecycle
- **Access**: Only from RecentDocumentsTable click
- **UX Issues**:
  - Replaces entire dashboard (disorienting)
  - No dedicated URL
  - Cannot share/bookmark document

## Route Deficiencies

### Navigation Flow Problems
1. **No deep linking** - Cannot land on specific document
2. **No breadcrumbs** - User loses context
3. **Back button broken** - React state only, no browser history
4. **Sidebar routes don't match screens** - 4 sidebar items missing

### Missing Screens
1. `/documents` - Full document listing
2. `/documents/:id` - Document detail (nested)
3. `/workflows` - Workflow management
4. `/workflows/:id` - Individual workflow
5. `/chat` - AI Chat interface
6. `/settings/profile` - User profile
7. `/settings/workspace` - Workspace settings
8. `/settings/billing` - Subscription management

## Rebuild Priority

### P0 (Critical)
1. Implement React Router or similar
2. Fix document detail deep linking
3. Implement all sidebar routes

### P1 (High)
1. Add breadcrumbs
2. Add nested routes for document workflows
3. Back navigation handling

### P2 (Medium)
1. Route guards for auth
2. Loading states per route
3. Error boundaries per route
