# Route / Screen Inventory

## 1. Implemented Routes

| Route | File | Component | UX Concerns |
|-------|------|-----------|-------------|
| `/` | `routes/index.tsx` | `MainDashboard` (lazy) | Default landing. `userId="local"` is hardcoded. `onNavigate` is a no-op. Must wrap `MainDashboard` in `ErrorBoundary`. |
| `/upload` | `routes/index.tsx` | `UploadPage` (lazy, ProtectedRoute) | `userId="local"`, `onUploadComplete={() => {}}`. Drag-and-drop upload is duplicated from `QuickActions`. No progress bar for uploads, only text state. |
| `/reports` | `routes/index.tsx` | `ReportsPage` (lazy, ProtectedRoute) | `userId="local"`. Stats and efficiency cards are nearly identical to `DocumentStatsDashboard.tsx`. Missing charts/visualizations. |
| `/settings` | `routes/index.tsx` | `SettingsPage` (lazy, ProtectedRoute) | `user={{ email: 'user@example.com', id: 'local' }}`, `onSignOut={() => {}}`. Workspace, Integrations, and Danger Zone are placeholder text. No actual settings forms. |
| `/*` | `routes/index.tsx` | `NotFound` | Generic 404. No link back to dashboard or suggested routes. |

## 2. Referenced-but-Nonexistent Routes

The `Sidebar.tsx` navigation includes these items, but they have **no routes** defined in `routes/index.tsx`:

| Sidebar Item | Click Handler | Result |
|--------------|---------------|--------|
| Documents | `onNavigate('documents')` | Navigates to `/documents`, which hits the `*` NotFound route |
| Workflows | `onNavigate('workflows')` | Navigates to `/workflows`, which hits NotFound |
| AI Chat | `onNavigate('chat')` | Navigates to `/chat`, which hits NotFound |

**Impact**: Users clicking sidebar items for Documents, Workflows, or AI Chat are silently shown a generic 404 with no recovery path.

## 3. Auth Screens (handled in main.tsx, not routed)

| State | File | Notes |
|-------|------|-------|
| Loading session | `main.tsx` | Full-screen loader with progress bar animation. |
| Unauthenticated | `main.tsx` | Sign-in / Sign-up toggle form with email, password, magic link, and resend confirmation. 288 lines in App root -- should be extracted to `pages/AuthPage.tsx`. |
| Supabase missing | `main.tsx` | "Temporarily unavailable" fallback. |

## 4. Current UX Concerns

- **Hardcoded props**: `userId="local"`, `userEmail="user@example.com"` are passed to every page. No real user identity is wired up.
- **Missing real routing**: Sidebar navigation does not match actual routes. `pathToPage` in `RootLayout` maps only 4 paths.
- **No route guards beyond localStorage**: `ProtectedRoute` checks localStorage for a user email string. No token validation.
- **No breadcrumbs or history**: `DocumentDetails` returns to dashboard via `onBack`, ignoring browser back.
- **No route-level loading**: Suspense fallback is `<div className="p-6">Loading...</div>` -- not styled.
- **Search bar non-functional**: `Header.tsx` search input has no `onChange` handler or action.
- **Notification bell**: No dropdown or panel. The badge dot is purely decorative.
- **Upload page vs UploadZone**: Two separate upload UIs (`UploadPage` and `QuickActions.UploadZone`) with inconsistent drag-over colors (`border-blue-400 bg-blue-50` vs `border-slate-900 bg-slate-50`).
