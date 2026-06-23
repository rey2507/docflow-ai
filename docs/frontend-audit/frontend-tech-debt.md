# Frontend Tech Debt - DocFlow AI

## Critical Technical Debt (Bad early decisions)

### 1. No Component Library
- Every button, badge, input, card is hand-rolled
- **Impact**: High maintenance, inconsistent UX
- **Fix**: Build `ui/` primitive library first
- **Effort**: 1-2 sprints

### 2. Mixed Styling Approaches
- Tailwind classes mixed with custom CSS file (AIInsights.css)
- Inline style for variable width in AIInsights
- **Impact**: Confusing for maintainers, inconsistent rendering
- **Fix**: Choose one approach (prefer Tailwind), remove AIInsights.css
- **Effort**: Low

### 3. Client-Side "Routing"
- Switch/case in main.tsx instead of router
- **Impact**: No history, no deep linking, broken back button
- **Fix**: Install React Router or implement useRouter hook
- **Effort**: Medium

### 4. Duplicate Component Logic
- DocumentStatsDashboard ≈ ReportsPage ≈ DashboardOverview
- UploadZone in QuickActions + UploadPage
- **Impact**: Maintenance burden, drift between implementations
- **Fix**: Consolidate single source of truth
- **Effort**: Medium

## Architecture Debt (Structural)

### 1. Missing Folder Structure
- No `ui/` folder for primitives
- No `hooks/` folder for shared stateful logic
- No `features/` folder for domain boundaries
- **Fix**: Organize: `components/ui/ | components/features/ | hooks/`
- **Effort**: Medium (requires migration)

### 2. No Shared State Management
- Each page fetches its own data
- No cache, no optimistic updates
- **Fix**: Add TanStack Query or similar
- **Effort**: Medium-High

### 3. No Error Boundaries
- Currently relies on default React error fallbacks
- No user-facing error recovery
- **Fix**: Add ErrorBoundary component
- **Effort**: Low

### 4. No Testing Patterns
- Components have no tests
- No testing utilities configured
- **Fix**: Setup Vitest + Testing Library patterns
- **Effort**: Medium

## Styling Debt

| Debt | Location | Impact | Fix Priority | Effort |
|------|----------|--------|--------------|--------|
| Card classes duplication | Multiple | High | High | Low (extract once, replace) |
| Spacing inconsistency | Multiple | Medium | Medium | Medium |
| Border color inconsistency | Multiple | Low | Low | Low |
| Font weight inconsistency | Multiple | Low | Low | Low |
| Transition timing inconsistency | Multiple | Medium | Medium | Low |
| Custom CSS file | AIInsights.css | High | High | Low |

## Logic Debt

### 1. Inline Data Fetching
- Every page has its own useEffect + useState for loading/error
- **Impact**: Code duplication, inconsistent states
- **Fix**: Custom hooks like useDocuments, useStats
- **Effort**: Medium

### 2. No Form Validation
- Upload accepts any file
- No validation on edit fields
- **Fix**: Add Zod or similar validation
- **Effort**: Medium

### 3. Props Drilling
- `currentPage`, `onNavigate` passed through AppShell
- User data passed multiple levels deep
- **Fix**: Context or state management
- **Effort**: Low-Medium

## Code Quality Issues

### 1. Type Safety
- `Record<string, any>` in editedData types
- `{} as any` for fake DB parameter
- **Fix**: Proper TypeScript types
- **Effort**: Low

### 2. Error Handling
- No typed errors
- Error messages vary in structure
- **Fix**: Create Error type class
- **Effort**: Medium

### 3. Stale State Risks
- React.useState in loop risk in RecentDocumentsTable
- Closure issues in callbacks
- **Fix**: Careful review + lint rules
- **Effort**: Medium

## Performance Debt

| Issue | Impact | Effort | Priority |
|--------|--------|--------|----------|
| No image optimization | High | Low | High |
| No route-based code splitting | High | Medium | Medium |
| All data fetched on Dashboard load | Medium | Medium | Medium |
| No service worker | Low | High | Low |
| Unused styles in bundle | Low | Low | Low |

## Accessibility Debt

| Issue | Severity | Effort |
|--------|---------|--------|
| Missing alt texts on some images | High | Low |
| Focus indicators inconsistent | Medium | Medium |
| No skip navigation | Medium | Low |
| Table headers not explicit scope | Medium | Low |
| Form validation errors not programmatically associated | High | Medium |
| No aria-describedby for helper text | Medium | Low |

## Documentation Debt
- No component documentation
- No usage examples
- No accessibility notes
- **Fix**: Component docs + Storybook option
