import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import type { Page } from '../../types/page';
import { PageContainer } from '../ui/layout';
import { FileText, GitBranch, MessageSquare, BarChart3, Upload, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { removeExpiredNotifications } from '../../lib/notifications';

interface AppShellProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userEmail?: string;
  usagePercent?: number;
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({
  currentPage,
  onNavigate,
  userEmail,
  usagePercent = 0,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    removeExpiredNotifications();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-slate-900 focus:shadow-lg">
        Skip to main content
      </a>

      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        userEmail={userEmail}
        usagePercent={usagePercent}
        mobileOpen={mobileMenuOpen}
        onMobileOpenChange={setMobileMenuOpen}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title={
            currentPage === 'dashboard'
              ? 'Dashboard'
              : currentPage === 'upload'
              ? 'Uploads'
              : currentPage === 'reports'
              ? 'Reports'
              : currentPage === 'settings'
              ? 'Settings'
              : currentPage === 'workflows'
              ? 'Workflows'
              : currentPage === 'chat'
              ? 'AI Chat'
              : currentPage === 'ai-insights'
              ? 'AI Insights'
              : currentPage === 'notifications'
              ? 'Notifications'
              : 'Dashboard'
          }
          userEmail={userEmail}
          onUploadClick={() => onNavigate('upload')}
          onMenuClick={() => setMobileMenuOpen(true)}
          onNavigate={onNavigate}
        />
        <main id="main-content" className="flex-1 overflow-auto pb-20 sm:pb-0">
          <PageContainer variant="default" className="px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {children}
          </PageContainer>
        </main>
      </div>

      <Button
        type="button"
        variant="primary"
        size="icon"
        className="fixed bottom-4 right-4 z-40 h-14 w-14 rounded-full shadow-lg sm:hidden"
        onClick={() => onNavigate('notifications')}
        aria-label="Open notifications"
      >
        <Bell className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default AppShell;
