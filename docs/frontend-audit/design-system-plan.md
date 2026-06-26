# Design System Audit

## 1. Styling Stack

The project uses a **mixed styling approach** with three overlapping systems:

| System | Location | Usage |
|--------|----------|-------|
| Tailwind utility classes | Inline in TSX | Primary styling method for all components |
| Custom CSS (`src/styles/`) | `main.css` + `components/*.css` | BEM classes + custom utility replacements |
| Inline styles | React `style` prop | Dynamic widths, colors in `AIInsights.tsx` |
| Browser default styles | N/A | Some raw HTML elements lack reset classes |

## 2. Tailwind Usage

Tailwind is extensively used via class strings. Examples:

- **Colors**: `bg-slate-50`, `text-slate-900`, `border-rose-200`, `bg-blue-50`, `bg-emerald-50`, `bg-violet-50`, etc.
- **Spacing**: `p-4`, `px-6`, `py-3`, `gap-4`, `space-y-6`
- **Typography**: `text-xs`, `text-sm`, `text-2xl`, `font-bold`, `font-medium`
- **Layout**: `grid`, `flex`, `lg:grid-cols-3`, `md:grid-cols-2`
- **Effects**: `rounded-xl`, `shadow-sm`, `border`, `transition-colors`, `animate-pulse`

**Consistency**: Good within components, but no centralized theme enforcement.

## 3. Custom CSS (`src/styles/main.css`)

`main.css` is a **350-line custom utility sheet** that reimplements Tailwind-like classes using CSS variables. It is loaded in `index.html` and applies globally.

Issues:
- **Redundant**: Duplicates Tailwind utilities (`.bg-white`, `.text-slate-900`, `.p-4`, `.flex`, etc.)
- **Inconsistent values**: `.mb-1` maps to `0.25rem` but Tailwind `mb-1` is `0.25rem`; `.mb-2` maps to `0.5rem` vs Tailwind `0.5rem`. Most match, but edge cases differ.
- **Missing utilities**: Does not cover the full Tailwind set. Components rely on both Tailwind and custom CSS unpredictably.
- **Custom names**: `.py-1-half`, `.w-2-thirds`, `.bg-black-third` -- non-standard values not in Tailwind.
- **Animation conflicts**: `@keyframes loading` in `main.css` conflicts with `animate-loading` but components use Tailwind `animate-pulse` or inline animations instead.

## 4. BEM CSS Files (`src/styles/components/`)

These files define BEM class names that are **mostly unused**. Only `layout.css` is actually imported (for `.app-shell`, `.sidebar`, `.header`) but `Header.tsx` does not use `.header` from `layout.css` -- it uses inline Tailwind classes. `header.css` defines competing `.header` rules.

| File | Content | Usage in TSX |
|------|---------|--------------|
| `auth.css` | Full auth form styles | **NOT USED** -- `main.tsx` uses inline Tailwind |
| `button.css` | `.btn`, `.btn--primary`, etc. | **NOT USED** -- `ui/button.tsx` uses Tailwind |
| `card.css` | `.card`, `.card__header`, etc. | **NOT USED** -- `ui/card.tsx` uses Tailwind |
| `badge.css` | `.badge`, `.badge--success` | **NOT USED** -- `ui/badge.tsx` uses Tailwind |
| `input.css` | `.form-input`, `.form-group` | **NOT USED** -- `ui/input.tsx` uses Tailwind |
| `skeleton.css` | `.skeleton`, `.skeleton--card` | **NOT USED** -- `ui/skeleton.tsx` uses Tailwind |
| `layout.css` | `.app-shell`, `.sidebar` | **PARTIALLY USED** -- `Sidebar.tsx` uses `className="sidebar"` |
| `header.css` | `.header`, `.header__title` | **NOT USED** -- `Header.tsx` uses Tailwind |
| `sidebar.css` | Empty (1 line) | N/A |

## 5. Color / Theme Inconsistencies

- **Primary color conflict**: CSS variables define `--color-primary: #0ea5e9` (sky blue), but all Tailwind components use `bg-slate-900` (near-black) as the primary action color.
- **Badge variants**: CSS uses solid white text on colored backgrounds; Tailwind `Badge` uses borders with light backgrounds and dark text.
- **Success/warning/error**: CSS uses `#10b981`, `#f59e0b`, `#ef4444`. Tailwind uses `emerald-*`, `amber-*`, `rose-*` (slightly different hues).
- **No dark mode**: No CSS variables or Tailwind `dark:` classes. Everything assumes a light background.

## 6. Spacing / Typography Inconsistencies

- **Card padding**: `ui/card.tsx` uses `p-4` (16px). `QuickActions` card-like div uses `p-3` (12px). `DocumentDetails` custom sections use `p-6` (24px).
- **Font sizes**: `text-2xl` (24px) is used for headings in `main.tsx`, but `DocumentDetails` uses `text-lg` (18px) for the same semantic heading level.
- **Border radii**: `rounded-xl` (12px) is most common, but `rounded-2xl` (16px) and `rounded-lg` (8px) are used interchangeably for similar containers.

## 7. Inline Style Usage

- `AIInsights.tsx`: `usageBarStyle` sets `backgroundColor: '#8b5cf6'`, `borderRadius`, `transition`, `width` inline.
- `Sidebar.tsx`: usage bar width set via `style={{ width: ... }}`.
- `DocumentList.tsx`: action buttons use `min-w-[280px]` with arbitrary values.

## 8. Recommendations

1. **Remove `src/styles/` custom CSS** and rely entirely on Tailwind (or migrate fully to CSS, but not both).
2. **Standardize primary color**: Choose `slate-900` or a brand color and apply consistently via a Tailwind config extension or CSS variable.
3. **Create a design-tokens file**: Map spacing, typography, and color scales to a single source of truth.
4. **Consolidate card padding**: Use a single `Card` variant (e.g., `Card` with `p-4`, `CardLarge` with `p-6`).
5. **Remove all inline styles** and replace with Tailwind classes or CSS custom properties.
6. **Add dark mode support**: Define `dark:` variants for key surfaces and text colors.
