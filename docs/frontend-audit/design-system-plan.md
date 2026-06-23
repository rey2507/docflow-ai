# Design System Plan - DocFlow AI

## Current State
No formal design system exists. Components use ad-hoc Tailwind values and occasional custom CSS.

## Proposed Design System Architecture

## 1. Spacing System
**Scale**: 4px base grid
```
space-1: 4px   (0.25rem)
space-2: 8px   (0.5rem)
space-3: 12px  (0.75rem) - standard gap
space-4: 16px  (1rem) - standard padding
space-6: 24px  (1.5rem)
space-8: 32px  (2rem)
space-12: 48px (3rem)
space-16: 64px (4rem)
```

## 2. Typography System
```
Font family: Inter (if available) or system font stack
- headings: font-sans tracking-tight
- body: font-sans text-sm leading-relaxed
- mono: font-mono text-xs (for IDs, technical data)

Weight scale:
- font-normal (400)
- font-medium (500) - labels, UI text
- font-semibold (600) - buttons, highlights
- font-bold (700) - headings

Size scale:
- text-xs (12px) - captions, metadata
- text-sm (14px) - UI text
- text-base (16px) - body
- text-lg (18px) - subheadings
- text-xl (20px) - section headings
- text-2xl (24px) - page headings
```

## 3. Color System
**Primary**: Slate 900 (not black)
**Semantic colors**:
- Success: emerald
- Warning: amber
- Error: rose
- Info: blue
- Neutral: slate scale (50-900)

Usage rules:
- Surface: white background
- Border: border-slate-200
- Text primary: text-slate-900
- Text secondary: text-slate-500
- Text tertiary: text-slate-400
- Focus ring: ring-slate-200/ring-slate-900

## 4. Component Primitives (Required)

### Buttons
```
Primary: bg-slate-900 text-white hover:bg-slate-800
Secondary: bg-white border border-slate-300 text-slate-900
Danger: bg-rose-600 text-white hover:bg-rose-700
Ghost: text-slate-700 hover:bg-slate-100
Sizes: default (h-9 px-3), sm (h-8 px-2), lg (h-10 px-4)
```

### Cards
```
Container: rounded-2xl border border-slate-200 bg-white shadow-sm
Header: border-b border-slate-100 px-4 py-3
Body: p-4 or p-5 or p-6
```

### Badges
```
Default: bg-slate-100 text-slate-700
Success: bg-emerald-50 text-emerald-700
Warning: bg-amber-50 text-amber-700
Error: bg-rose-50 text-rose-700
Info: bg-blue-50 text-blue-700
Style: inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border
```

### Inputs
```
Container: relative
Input: w-full px-3 py-2 border border-slate-300 rounded-lg
Focus: focus:border-slate-900 focus:ring-4 focus:ring-slate-100
Disabled: disabled:bg-slate-50 disabled:text-slate-500
Placeholder: placeholder:text-slate-400
```

### Skeleton
```
Shape: animate-pulse rounded bg-slate-200
Variants: rectangular, circular, card
```

### Tables
```
Container: overflow-x-auto rounded-2xl border border-slate-200 bg-white
Header: border-b border-slate-100 px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider
Row: hover:bg-slate-50 transition-colors
Cell: px-4 py-3 text-sm
```

## 5. Layout Standards

### Page Container
```
Standard: max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8
Narrow: max-w-3xl (forms, settings)
Medium: max-w-5xl (reports)
```

### Section Spacing
```
Between major sections: space-y-6
Within section groups: space-y-4
Inline items: gap-2 or gap-3
Grid gaps: gap-4, gap-6
```

### Card Grid Pattern
```
Default: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
Summary: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4
```

## 6. State System Standards

### Loading State
- Skeleton: use for fast expected loads (<1s)
- Spinner: use for slower operations (>2s)
- Progress bar: use for determinate operations

### Error State
- Container: rounded-xl border-rose-200 bg-rose-50 p-4
- Message: text-sm font-semibold text-rose-900
- Resolution: text-sm text-rose-700 + retry button

### Empty State
- Container: rounded-2xl border-dashed border-slate-300 bg-slate-50 p-8 text-center
- Icon: mx-auto h-12 w-12 text-slate-400
- Text: text-sm font-medium text-slate-900

## 7. Responsive Breakpoints
```
sm: 640px (≥ 40rem)
md: 768px (≥ 48rem)
lg: 1024px (≥ 64rem)
xl: 1280px (≥ 80rem)
2xl: 1536px (≥ 96rem)
```

Usage:
- Mobile-first approach
- Sidebar: hidden md:flex
- Tables: horizontal scroll on mobile
- Grids: responsive columns

## 8. Accessibility Standards
- All interactive elements: aria-label on icon-only
- Focus visible: focus:ring-2 focus:ring-slate-900 focus:ring-offset-2
- Error messages: role="alert"
- Loading states: aria-busy="true"
- Keyboard: tab order logical, Enter/Space activation
- Labels: every input has a visible label

## 9. Implementation Strategy

### Phase 1: Tokens (Done naturally + utils)
- Define spacing constants in CSS
- Define color constants in Tailwind config
- Define typography in Tailwind config

### Phase 2: Primitives
- Button component
- Badge component
- Input component
- Card component
- Skeleton component

### Phase 3: Compositions
- Table component
- Modal component
- Form components
- Empty state component

### Phase 4: Features
- Feature-based organization
- Domain-specific patterns
- Shared hooks
