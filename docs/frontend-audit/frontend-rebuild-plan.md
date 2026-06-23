# Frontend Rebuild Plan - DocFlow AI

## Guiding Principles
1. **Stability first** - No shipping broken
2. **Progressive enhancement** - One layer at a time
3. **Non-breaking changes** - Preserve existing functionality
4. **Component purity** - Isolate, test, document

## Rebuild Phases

### Phase 1: Primitives (Foundation)
**Time**: 1 sprint
**Goal**: Create reusable building blocks

```
Deliverables:
- `src/components/ui/button.tsx` - Primary, secondary, danger, ghost
- `src/components/ui/badge.tsx` - Status variants
- `src/components/ui/input.tsx` - Form input with label
- `src/components/ui/card.tsx` - Card container + header + body
- `src/components/ui/skeleton.tsx` - Consistent loading placeholder
- `src/components/ui/empty-state.tsx` - Unified empty state
- `src/components/ui/error-boundary.tsx` - Error fallback
- `src/lib/utils/cn.ts` - Class name helper (already exists)
```

**Success Criteria:**
- All new screens use primitives
- Visual consistency >80%

### Phase 2: Layout Standardization
**Time**: 1 sprint
**Goal**: Stable, reusable shell

```
Deliverables:
- Refine AppShell with route-aware layout changes
- Consolidate Sidebar (remove duplicate styles)
- Standardize Header
- Add layout containers: `PageContainer`, `SectionContainer`
```

**Success Criteria:**
- All routes render within AppShell
- Layout doesn't break on resize

### Phase 3: Component Consolidation
**Time**: 1-2 sprints
**Goal**: Remove duplicates, improve each component

```
Deliverables:
- Replace RecentDocumentsTable + DocumentList with unified Table component
- Replace UploadZone with consistent file upload component
- Create unified StatsCard
- Create unified StatusBadge
- Create unified Skeleton (replace all ad-hoc ones)
- Standardize ErrorState across all components
```

**Success Criteria:**
- Zero duplicated component logic
- Reduced bundle size

### Phase 4: Routing & Navigation
**Time**: 1 sprint
**Goal**: Proper navigation UX

```
Deliverables:
- Install TanStack Router or React Router
- Define all routes with lazy loading
- Add breadcrumbs component
- Add 404 handling
- Implement back navigation properly
```

**Success Criteria:**
- All sidebar routes work
- Browser back/forward buttons work
- Deep linking works

### Phase 5: State Management
**Time**: 1 sprint
**Goal**: Predictable async state

```
Deliverables:
- Add TanStack Query (React Query)
- Convert data fetching to hooks
- Add caching layer
- Add optimistic updates patterns
```

**Success Criteria:**
- No page-level loading/error state repetition
- Loading states consistent

### Phase 6: Polish & Accessibility
**Time**: 1 sprint
**Goal**: Production quality

```
Deliverables:
- Accessibility audit pass
- Focus state standardization
- Keyboard navigation testing
- Screen reader testing
- Dark mode preparation
```

**Success Criteria:**
- WCAG AA compliance
- Keyboard-only navigation possible

## Rollback Strategy
Each phase must:
1. Keep old code until new code proven stable
2. Feature flag new components
3. Test in staging before merge
4. Preserve git history

## Migration Order
1. Primitives first (no dependencies)
2. Layout uses primitives
3. Components use primitives + layout
4. Pages use components + layout
5. Old components removed one by one

## Rebuild Priority Matrix

| Component/Issue | Priority | Confidence | Effort |
|-----------------|----------|------------|--------|
| Routing (TanStack Router) | P0 | High | Med |
| Button primitive | P0 | High | Low |
| Card primitive | P0 | High | Low |
| Skeleton system | P0 | High | Low |
| Status badge | P0 | High | Low |
| Unify tables | P0 | High | High |
| Unify uploads | P0 | High | Med |
| Input primitive | P1 | High | Low |
| Error boundary | P1 | Med | Low |
| Toast system | P1 | Med | Med |
| Modal system | P1 | Med | Med |
| React Query migration | P1 | Med | High |
| Accessibility | P2 | High | Med |
| Dark mode | P2 | Low | High |

## Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Components not adopted | High | Med | Phase gating, code review |
| Styling drift continues | Med | High | Lint rules |
| Performance regressions | Med | Med | Bundle size checks |
| Routing breaks | High | Low | Feature flags |
| Over-engineering | Med | Low | Simple first |

## Success Metrics
- Component reuse rate: >70%
- Bundle size: Reduced by 15%
- Accessibility score: 90+
- TypeScript type coverage: 100%
- Test coverage: >60%
- Time to new feature: Reduced by 30%
