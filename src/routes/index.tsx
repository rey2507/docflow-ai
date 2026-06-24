import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';

const MainDashboard = lazy(() => import('../components/MainDashboard'));
const UploadPage = lazy(() => import('../pages/UploadPage'));
const ReportsPage = lazy(() => import('../pages/ReportsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

const pathToPage: Record<string, string> = {
  '/': 'dashboard',
  '/upload': 'upload',
  '/reports': 'reports',
  '/settings': 'settings',
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('docflow-user');
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = pathToPage[location.pathname] || 'dashboard';

  return (
    <AppShell currentPage={currentPage as any} onNavigate={(page) => navigate(page === 'dashboard' ? '/' : `/${page}`)} userEmail="user@example.com" usagePercent={0}>
      <Suspense fallback={<div className="p-6">Loading…</div>}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
        <p className="text-slate-600 mb-4">Page not found</p>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <MainDashboard userId="local" onNavigate={() => {}} /> },
      { path: 'upload', element: <ProtectedRoute><UploadPage userId="local" onUploadComplete={() => {}} /></ProtectedRoute> },
      { path: 'reports', element: <ProtectedRoute><ReportsPage userId="local" /></ProtectedRoute> },
      { path: 'settings', element: <ProtectedRoute><SettingsPage user={{ email: 'user@example.com', id: 'local' }} onSignOut={() => {}} /></ProtectedRoute> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
