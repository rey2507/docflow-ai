import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import type { Page } from '../../types/page';
import { PageContainer } from '../ui/layout';

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
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-slate-900 focus:shadow-lg">
        Skip to main content
      </a>

      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        userEmail={userEmail}
        usagePercent={usagePercent}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
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
              : 'Dashboard'
          }
          userEmail={userEmail}
          onUploadClick={() => onNavigate('upload')}
        />
        <main id="main-content" className="flex-1 overflow-auto">
          <PageContainer variant="default">
            {children}
          </PageContainer>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
