import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import AuthPage from '../pages/AuthPage';
import { ErrorBoundary } from '../components/ui/error-boundary';
import { useAuth } from '../contexts/AuthContext';
import { PageContainer } from '../components/ui/layout';
import BetaBanner from '../components/ui/beta-banner';
import { Breadcrumbs } from '../components/ui/breadcrumbs';

const MainDashboard = lazy(() => import('../components/MainDashboard'));
const UploadPage = lazy(() => import('../pages/UploadPage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const ChatPage = lazy(() => import('../pages/ChatPage'));

const pathToPage: Record<string, string> = {
  '/': 'dashboard',
  '/documents': 'documents',
  '/upload': 'upload',
  '/workflows': 'workflows',
  '/chat': 'chat',
  '/reports': 'reports',
  '/settings': 'settings',
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center" style={{ minHeight: '50vh' }}>
          <p className="text-sm text-slate-500">Loading workspace…</p>
        </div>
      </PageContainer>
    );
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

function AuthRoute() {
  const navigate = useNavigate();
  return <AuthPage onAuthenticated={() => navigate('/')} />;
}

function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentPage = pathToPage[location.pathname] || 'dashboard';
  const handleNavigate = (page: string) => navigate(page === 'dashboard' ? '/' : `/${page}`);
  const userId = user?.id || '';

  return (
    <AppShell
      currentPage={currentPage as any}
      onNavigate={handleNavigate}
      userEmail={user?.email || ''}
      usagePercent={0}
    >
      <ErrorBoundary>
        <Suspense fallback={
          <PageContainer>
            <div className="flex items-center justify-center" style={{ minHeight: '50vh' }}>
              <p className="text-sm text-slate-500">Loading…</p>
            </div>
          </PageContainer>
        }>
          <div className="space-y-4">
            <Breadcrumbs />
            <Outlet context={{ userId, handleNavigate }} />
          </div>
        </Suspense>
      </ErrorBoundary>
      <BetaBanner />
    </AppShell>
  );
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <PageContainer>
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h1 className="text-4xl font-bold text-slate-900">404</h1>
        <p className="mt-2 text-sm text-slate-600">Page not found</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </PageContainer>
  );
}

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthRoute />,
  },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <ProtectedRoute><MainDashboard onNavigate={() => {}} /></ProtectedRoute> },
      { path: 'documents', element: <ProtectedRoute><div style={{ padding: '2rem' }}>Documents page coming soon.</div></ProtectedRoute> },
      { path: 'upload', element: <ProtectedRoute><UploadPage onUploadComplete={() => {}} /></ProtectedRoute> },
      { path: 'workflows', element: <ProtectedRoute><div style={{ padding: '2rem' }}>Workflows page coming soon.</div></ProtectedRoute> },
      { path: 'chat', element: <ProtectedRoute><ChatPage /></ProtectedRoute> },
      { path: 'reports', element: <ProtectedRoute><ReportsPage /></ProtectedRoute> },
      { path: 'settings', element: <ProtectedRoute><SettingsPage /></ProtectedRoute> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
