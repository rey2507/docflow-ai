import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import AuthPage from '../pages/AuthPage';
import { ErrorBoundary } from '../components/ui/error-boundary';
import { useAuth } from '../contexts/AuthContext';
import { PageContainer } from '../components/ui/layout';
import { Breadcrumbs } from '../components/ui/breadcrumbs';
import { EmptyState } from '../components/ui/empty-state';
import { FileText, GitBranch } from 'lucide-react';

const MainDashboard = lazy(() => import('../components/MainDashboard'));
const AIInsightsPage = lazy(() => import('../pages/AIInsightsPage'));
const UploadPage = lazy(() => import('../pages/UploadPage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const ChatPage = lazy(() => import('../pages/ChatPage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));

const pathToPage: Record<string, string> = {
  '/': 'dashboard',
  '/documents': 'documents',
  '/upload': 'upload',
  '/workflows': 'workflows',
  '/chat': 'chat',
  '/ai-insights': 'ai-insights',
  '/reports': 'reports',
  '/settings': 'settings',
  '/notifications': 'notifications',
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <PageContainer>
        <div className="flex min-h-[50vh] items-center justify-center">
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
            <div className="flex min-h-[50vh] items-center justify-center">
              <p className="text-sm text-slate-500">Loading…</p>
            </div>
          </PageContainer>
        }>
          <div className="space-y-3">
            <Breadcrumbs />
            <Outlet context={{ userId, handleNavigate }} />
          </div>
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  );
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <PageContainer>
      <div className="py-16 text-center">
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
      { path: 'ai-insights', element: <ProtectedRoute><AIInsightsPage /></ProtectedRoute> },
      {
        path: 'documents',
        element: (
          <ProtectedRoute>
            <PageContainer variant="medium">
              <EmptyState
                icon={<FileText className="h-6 w-6" />}
                title="Documents workspace is being built"
                description="Document browsing, filters, and bulk actions will land here next."
                className="bg-white"
              />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      { path: 'upload', element: <ProtectedRoute><UploadPage onUploadComplete={() => {}} /></ProtectedRoute> },
      {
        path: 'workflows',
        element: (
          <ProtectedRoute>
            <PageContainer variant="medium">
              <EmptyState
                icon={<GitBranch className="h-6 w-6" />}
                title="Workflow automation is next"
                description="This area will hold orchestration, routing, and approvals once the flow engine is ready."
                className="bg-white"
              />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      { path: 'chat', element: <ProtectedRoute><ChatPage /></ProtectedRoute> },
      { path: 'reports', element: <ProtectedRoute><ReportsPage /></ProtectedRoute> },
      { path: 'settings', element: <ProtectedRoute><SettingsPage /></ProtectedRoute> },
      { path: 'notifications', element: <ProtectedRoute><NotificationsPage /></ProtectedRoute> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
