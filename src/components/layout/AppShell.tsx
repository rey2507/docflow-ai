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
    <div className="app-shell">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        userEmail={userEmail}
        usagePercent={usagePercent}
      />

      <div className="app-shell__main">
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
        <main className="app-shell__content">
          <PageContainer variant="default">
            {children}
          </PageContainer>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
