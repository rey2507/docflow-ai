# Responsive Audit - DocFlow AI

## Viewport Analysis

### Breakpoints Used
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

## Component-by-Component Review

### AppShell
| Feature | Mobile (<768px) | Tablet (768-1024px) | Desktop (>1024px) | Status |
|---------|------------------|---------------------|-------------------|--------|
| Sidebar | Hidden, floating button | Hidden, floating button | Visible | ✅ |
| Content width | Full | Full | max-w-7xl | ✅ |
| Header | Compact | Compact | Full | ✅ |
| Padding | px-4 | px-4 sm:px-6 | px-4 sm:px-6 lg:px-8 | ✅ |

### Sidebar
| Feature | Status | Issues |
|---------|--------|--------|
| Mobile drawer | ✅ Works | No swipe-to-close |
| Desktop sidebar | ✅ 64 width | OK |
| Collapsed state | ❌ | Doesn't exist |
| Push content | ❌ | Overlays content instead |

### Header
| Feature | Status | Issues |
|---------|--------|--------|
| Search visibility | ✅ hidden md:flex | OK |
| Upload button | ✅ hidden sm:inline-flex | OK |
| User menu | ✅ hidden lg:inline | OK |
| Title | ✅responsive | OK |

### RecentDocumentsTable
| Feature | Mobile | Desktop | Issues |
|---------|---------|---------|--------|
| Display | ❌ **Not rendered** | ✅ Table | **CRITICAL** |
| Alternative | Card view | Table view | Separate view, not responsive |
| Columns shown | N/A | 7 columns | Some hidden: md:table-cell |

### DocumentList
| Feature | Mobile | Desktop | Issues |
|---------|---------|---------|--------|
| Display | ✅ Card view | ✅ Table view | Good pattern |
| PipelineStatus | ✅ Renders | ✅ Renders | Long content |
| Actions | Buttons | Dropdown hover | Inconsistent |

### DashboardOverview
| Feature | Mobile | Tablet | Desktop | Status |
|---------|--------|--------|---------|--------|
| Grid | grid-cols-1 | sm:grid-cols-2 | lg:grid-cols-3 xl:grid-cols-6 | ✅ |
| Overflow | OK | OK | Possibly crowded at xl | ⚠️ |

### FilePreview
| Feature | Mobile | Desktop | Issues |
|---------|---------|---------|--------|
| Height | min-h-[300px] | min-h-[500px] | OK |
| Image | w-full, object-contain | w-full, object-contain | OK |
| PDF iframe | ❌ h-full undefined | ❌ h-full undefined | **BROKEN** |

### DocumentDetails
| Feature | Mobile | Desktop | Issues |
|---------|---------|---------|--------|
| Grid | Single column | Two columns | OK |
| Padding | px-4 py-6 | Same | OK |
| Form inputs | Full width | Full width | OK |

## Responsive Issues

### Critical (P0)
1. **RecentDocumentsTable not rendering on mobile** - `hidden md:block` applied, no mobile alternative
2. **PDF iframe `min-h-[600px]`** - Overflow on mobile screens

### High (P1)
1. **Sidebar overlay** - On mobile, sidebar overlays content rather than pushing
2. **DocumentList action buttons** - Desktop has hover actions, mobile has always-visible; inconsistent UX
3. **Upload zone sizing** - Consistent but could be wider on mobile
4. **Card padding** - p-3 on mobile seems cramped for some content

### Medium (P2)
1. **Stat cards grid** - At xl (1280px), 6 cards in a row is cramped
2. **Table column visibility** - Only "Workflow" column hidden; others remain too wide
3. **Text truncation** - `truncate max-w-xs` on document names may cut too much

### Low (P3)
1. **Logo/brand text** - No responsive sizing
2. **Search bar width** - Fixed w-40/sm:w-56 not ideal on tablets

## Mobile-Specific Issues

### Touch Targets
- Search input: OK
- Sidebar buttons: ✅ large targets
- Table action buttons: ❌ h-3.5 w-3.5 too small
- Filter dropdown: OK

### Typography on Mobile
- Body text: 14px ✅
- Small text: 12px ⚠️ borderline for readability
- Tiny text: 10-11px ❌ potentially too small

### Layout on Small Screles
- Header: ✅ collapses search
- Dashboard grid: ✅ stacks cards
- Document list: ❌ **broken** (missing)

## Tablet-Specific Issues
- No specific tablet optimizations
- md: (768px) used as both tablet and mobile break
- Desktop sidebar switches at 768px rather than 1024px

## Recommendations
1. Fix RecentDocumentsTable mobile rendering (critical)
2. Consider breakpoint reorganization:
   - Mobile: < 640px
   - Tablet: ≥ 640px and < 1024px
   - Desktop: ≥ 1024px
3. Review touch target size minimums (44px by 44px recommended)
4. Test PDF preview on mobile separately
