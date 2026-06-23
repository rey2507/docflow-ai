# Dashboard Redesign Plan

## Current State
`MainDashboard.tsx` renders: header row → 4 stat cards → filter bar → document list/table → pagination. Everything uses flat slate colors, no icons, no visual hierarchy beyond font sizes.

## Target Design Direction
Modern SaaS dashboard: **clean, light, card-based**. Inspired by Linear/Notion/Vercel dashboard patterns. Keep Tailwind-only (no new libs).

## Changes (in implementation order)

1. **Stat Cards Redesign**
   - Replace plain cards with icon + gradient accent variants
   - Icons: Total (layers), Processing (spinner/loader), Completed (check-circle), Failed (alert-circle)
   - Use `bg-gradient-to-br` from slate-50 to white with colored top border or icon background
   - Keep same data source (`ReportService.getUserDocumentStats`)

2. **Filter Bar Redesign**
   - Wrap filters in a collapsible "Filters" panel (toggle button)
   - Replace selects with pill/chip-style active filters when values are set
   - Add a "Clear all" chip button when any filter is active
   - Keep search input prominent

3. **Document List Modernization**
   - Switch primary view from table to **card grid** (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`)
   - Each card: filename, type badge, mini pipeline status, date, action dropdown (View/Delete)
   - Keep table view as secondary toggle for power users
   - Add hover lift effect (`hover:-translate-y-0.5 hover:shadow-md`)

4. **Color & Spacing Standardization**
   - Introduce consistent card token: `rounded-xl border border-slate-200 bg-white shadow-sm`
   - Primary action blue: `blue-600` / `hover:bg-blue-700`
   - Danger: `rose-600` / `hover:bg-rose-700`
   - Success: `emerald-600`
   - Reduce excessive padding on filter bar (tighten from `p-4 sm:p-5` to `p-4`)

5. **Loading & Empty States**
   - Replace pulse rectangles with skeleton cards matching new card layout
   - Add subtle illustration or icon to empty states
   - "No documents" → show upload CTA button linking to upload page

6. **Mobile Responsiveness**
   - Cards: single column on mobile, 2 on tablet, 3 on desktop
   - Filter toggle: slide-down panel on mobile, inline row on desktop
   - Pagination: scroll horizontally if needed

## File Boundaries
- Modify: `src/components/MainDashboard.tsx`
- Modify (minor): `src/components/DocumentList.tsx` (pass `viewMode`, adapt card rendering)
- No new files needed

## Validation
- Build passes (`npm run build`)
- Visual check: cards render with icons, filters collapse, responsive at 320px/768px/1280px
- No runtime errors in browser console

## Out of Scope
- New data viz (charts) → defer to Reports page
- Drag-drop reordering
- Bulk actions
