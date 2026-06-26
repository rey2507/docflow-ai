import React, { useState } from 'react';
import type { Page } from '../../types/page';
import {
  LayoutDashboard,
  FileText,
  Upload,
  GitBranch,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  ChevronDown,
  X,
  Menu,
} from 'lucide-react';
import { Button } from '../ui/button';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userEmail?: string;
  usagePercent?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, userEmail, usagePercent = 0 }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
    { id: 'upload', label: 'Uploads', icon: <Upload className="h-4 w-4" /> },
    { id: 'workflows', label: 'Workflows', icon: <GitBranch className="h-4 w-4" /> },
    { id: 'chat', label: 'AI Chat', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ];

  const navContent = (
    <nav className="space-y-0.5">
      {navItems.map((item) => (
        <Button
          key={item.id}
          type="button"
          variant={currentPage === item.id ? 'primary' : 'ghost'}
          className="w-full justify-start"
          onClick={() => {
            onNavigate(item.id);
            setMobileOpen(false);
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </Button>
      ))}
    </nav>
  );

  const displayEmail = userEmail || 'User';

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="icon"
        className="md:hidden fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {mobileOpen && (
        <div className="sidebar__mobile-backdrop" onClick={() => setMobileOpen(false)}>
          <aside className="sidebar__mobile-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar__mobile-header">
              <span className="sidebar__brand">DocFlow AI</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="sidebar__nav">{navContent}</div>
            <div className="sidebar__footer">
              <div className="sidebar__user-card">
                <div>
                  <p className="sidebar__user-name">{displayEmail}</p>
                  <p className="sidebar__user-plan">Beta</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      <aside className="sidebar">
        <div className="sidebar__header">
          <span className="sidebar__brand">DocFlow AI</span>
        </div>

        <div className="sidebar__nav">
          {navContent}

          <div className="sidebar__divider" />
          <Button
            type="button"
            variant="ghost"
            className="sidebar__workspace-toggle"
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users className="h-4 w-4" />
              Workspace
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${workspaceOpen ? 'rotate-180' : ''}`} />
          </Button>
          {workspaceOpen && (
            <div className="sidebar__workspace-details">
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayEmail}</p>
            </div>
          )}
        </div>

        <div className="sidebar__footer">
          <div className="sidebar__usage-label">
            <span>Usage</span>
            <span>{usagePercent}%</span>
          </div>
          <div className="sidebar__usage-track">
            <div
              className="sidebar__usage-fill"
              style={{ width: `${Math.min(100, Math.max(0, usagePercent))}%` }}
            />
          </div>
          <div className="sidebar__user-card" style={{ marginTop: '0.75rem' }}>
            <div className="sidebar__user-avatar">
              {displayEmail.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p className="sidebar__user-name">{displayEmail}</p>
              <p className="sidebar__user-plan">Beta</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
