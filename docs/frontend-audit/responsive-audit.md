# Responsive Audit

## 1. Breakpoint Strategy

The project uses Tailwind default breakpoints:
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px

No custom breakpoints are defined.

## 2. Layout Responsiveness

### AppShell (App Shell)
- **File**: `components/layout/AppShell.tsx`, `Sidebar.tsx`
- **Desktop**: Fixed 260px sidebar, scrollable main content area.
- **Mobile (`md:hidden`)**: Sidebar is hidden. A floating action button (`fixed bottom-4 right-4 z-50`) opens a mobile drawer with `fixed inset-0 z-40` overlay.
- **Issue**: The mobile close button (`X`) works, but clicking the overlay also closes. There is no transition animation. The `Header` search bar is `hidden md:flex` meaning it is completely missing on mobile with no alternative search input.

### Header
- **File**: `components/layout/Header.tsx`
- **Desktop**: Title on left, search + upload + notifications + user menu on right.
- **Mobile**: Search is hidden. Upload button is `hidden sm:inline-flex` (missing on small phones). Only bell and user menu remain.
- **Issue**: Mobile users lose search and upload capabilities.

### DocumentList
- **File**: `components/DocumentList.tsx`
- **Table view**: `overflow-x-auto` wrapper allows horizontal scrolling on small screens. That is functional but not ideal.
- **Grid view**: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` -- scales well.
- **Filter bar**: `flex-col sm:flex-row` -- stacks vertically on mobile, which is fine.
- **Issue**: Action buttons on table rows are `opacity-0 group-hover:opacity-100`, making them inaccessible on mobile where hover does not fire.

### DashboardOverview
- **File**: `components/DashboardOverview.tsx`
- **Grid**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6`
- **Issue**: `xl:grid-cols-6` on a `max-w-7xl` container means cards become very narrow on ultrawide screens (> 1536px). Should cap with `xl:grid-cols-6` and wider container or enforce card min-width.

### MainDashboard
- **File**: `components/MainDashboard.tsx`
- **Main grid**: `lg:grid-cols-3` with `lg:col-span-2` for list and `space-y-6` for sidebar widgets.
- **Issue**: On `lg` (1024px), the sidebar widgets stack to the right. On `md` (768px), they drop below. No `md:grid-cols-1` explicitly, but implicitly they stack. Works but could be tested for narrow heights.

### QuickActions
- **File**: `components/QuickActions.tsx`
- **Grid**: `grid-cols-2` without responsive modifiers. On very narrow screens (< 300px), two columns may be too cramped.

### ReportsPage
- **File**: `pages/ReportsPage.tsx`
- **Grid**: `grid-cols-1 md:grid-cols-2` -- safe and functional.

### DocumentDetails
- **File**: `components/DocumentDetails.tsx`
- **Grid**: `grid-cols-1 gap-8 lg:grid-cols-2` -- stacks preview and metadata on mobile.
- **Issue**: `FilePreview` has `min-h-[300px] md:min-h-[500px]`. On mobile, `min-h-[300px]` may be taller than the viewport for short documents, causing excessive scrolling.

## 3. Typography & Scale

- **Font sizes** are mostly consistent (`text-xs`, `text-sm`, `text-lg`, `text-2xl`).
- **Line heights** are not explicitly set. Tailwind default is used, which can lead to tight spacing in `text-xs` metadata.
- **Heading hierarchy**: `MainDashboard` uses `text-2xl font-semibold` for page title, but `DashboardOverview` uses the same for card titles. `DocumentDetails` uses `text-lg font-semibold` as a sub-heading, which is smaller than the page title. This is mostly consistent.

## 4. Touch Target Sizes

- **Buttons**: `h-9` (36px) default, `h-8` (32px) for icon buttons. WCAG recommends 44px minimum touch target.
- **Icon buttons** in `DocumentList` table are `h-8 w-8` -- **below WCAG AA** touch target size.
- **Sidebar nav buttons**: `h-9` (36px) -- borderline.

## 5. Color Contrast

- **Slate scale**: Tailwind `slate-500` (#64748b) on white (#ffffff) has a contrast ratio of ~3.5:1. This fails WCAG AA for normal text (< 4.5:1) but passes for large text.
- **Slate-400** (#94a3b8) on white has ~2.0:1 -- fails for all text sizes. Used for placeholder text and disabled text, which is acceptable if properly labeled.
- **Blue-600** (#2563eb) on white is ~4.5:1 -- passes AA.
- **No dark mode**: Contrast is only evaluated for light backgrounds.

## 6. Orientation & Viewport

- **No `lang` attribute issues**: `<html lang="en">` is set in `index.html`.
- **Viewport meta tag**: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` is correct.
- **No `user-scalable=no`**: Good.
- **No orientation lock**: Good.

## 7. Specific Findings by Component

| Component | Issue | Severity |
|-----------|-------|----------|
| `Sidebar` | Mobile menu has no transition, no escape-to-close, no focus trap | Medium |
| `Header` | Search hidden on mobile with no fallback | High |
| `DocumentList` | Table actions invisible on touch (hover-only) | High |
| `DocumentList` | Table scrolls horizontally instead of reflowing to cards | Medium |
| `DocumentDetails` | FilePreview `min-h` too tall on small screens | Low |
| `QuickActions` | 2-column grid may be cramped on 320px width | Low |
| `Button` | Icon buttons at 32px below 44px touch target | Medium |
| `DashboardOverview` | 6-up grid may have ultra-narrow cards on wide screens | Low |
