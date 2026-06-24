# UI/UX Issues - DocFlow AI

## Critical UI/UX Issues (P0)

### Navigation & Routing
1. **No URL-based routing** - User is trapped in UI state, cannot bookmark
2. **Missing routes** - 4 sidebar items lead nowhere
3. **Dashboard detail view** - Replaces entire page, loses context
4. **No breadcrumbs** - User cannot tell where they are
5. **Back navigation broken** - Loses history when navigating

### Information Architecture
1. **Upload appears twice** - In QuickActions (dashboard) AND upload page - confusing
2. **Document list duplicates** - RecentDocumentsTable + DocumentList, different styles
3. **Stats cards overlap** - DashboardOverview shows same stats as ReportsPage

## High Priority Issues (P1)

### Visual Hierarchy
1. **Color inconsistency** - AIInsights uses violet, DocumentInsights uses indigo, different accent colors
2. **Typography inconsistency** - Mix of rounded-2xl, rounded-xl, rounded-lg for cards
3. **Spacing inconsistency** - p-3, p-4, p-5, p-6 used for similar card interiors
4. **Border inconsistency** - Sometimes slate-100, sometimes slate-200
5. **Icon sizing** - h-3.5 w-3.5, h-4 w-4, h-5 w-5 - no standard

### User Workflow Issues
1. **Upload flow** - Forced redirect after upload breaks user flow
2. **No batch operations** - Cannot select multiple documents
3. **No keyboard shortcuts** - Only visual hint for search, no function
4. **Search is fake** - Header search has no implementation
5. **No drag-and-drop outside upload** - Inconsistent UX

### State Management
1. **No loading consistency** - Each component has different skeleton
2. **No toast system** - Success/error inline only
3. **No confirmation flow** - Delete confirmation is inline, not modal
4. **Error messages vary** - "Could not load" vs "Unable to load" vs "Failed"

## Medium Priority Issues (P2)

### Typography
1. **Heading sizes inconsistent** - text-lg, text-xl, text-2xl used without scale
2. **Label styling** - text-xs uppercase tracking-wider vs text-sm font-medium
3. **Font weights** - font-semibold, font-bold, font-medium used inconsistently

### Spacing Layout
1. **Grid gaps** - gap-3, gap-4, gap-6 used for similar purposes
2. **Padding inconsistencies** - p-4, p-5, p-6 for card contents
3. **Margin collapses** - No consistent margin reset

### Component Styling
1. **Custom CSS alongside Tailwind** - AIInsights.css uses CSS variables
2. **Duplicated card classes** - Repeating rounded-xl border border-slate-200 bg-white
3. **Button styles vary** - Some use rounded-lg, some rounded-xl

### Responsive UX
1. **Mobile menu** - Opens but no overlay behavior
2. **Table overflow** - No column priority/hiding on mobile
3. **Touch targets** - Some buttons too small for touch (h-8)

## Low Priority Issues (P3)

### Polish
1. **Hover states inconsistent** - Some transition, some not
2. **Active states missing** - No feedback on button press
3. **Focus rings inconsistent** - Some focus, some not
4. **Loading messages** - "Loading..." vs "Checking latest pipeline state..."
5. **Empty state wording** - "No documents found" vs "No documents uploaded yet"

### Performance
1. **No image optimization** - Documents load full resolution
2. **No code splitting** - All pages loaded upfront
3. **No caching indicators** - Repeated fetches

### Micro-interactions
1. **Transition timing** - No consistent duration
2. **Loading animations** - Pulse vs spin vs custom
3. **Feedback timing** - Success/error appears abruptly
