import React, { useState } from 'react';
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        userEmail={userEmail}
        usagePercent={usagePercent}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
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
          onUploadClick={() => onNavigate('upload')}
        />
        <main className="flex-1 overflow-auto">
          <PageContainer variant="default">
            {children}
          </PageContainer>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
