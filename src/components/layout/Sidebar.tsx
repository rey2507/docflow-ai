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
        <div className="md:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setMobileOpen(false)}>
          <aside className="sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar__header">
              <span className="text-lg font-bold text-slate-900 tracking-tight">DocFlow AI</span>
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
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-900 mb-2">Workspace</p>
                <p className="text-xs text-slate-500 truncate">{userEmail || 'user@example.com'}</p>
              </div>
            </div>
          </aside>
        </div>
      )}

      <aside className="sidebar">
        <div className="sidebar__header">
          <span className="text-lg font-bold text-slate-900 tracking-tight">DocFlow AI</span>
        </div>

        <div className="sidebar__nav">
          {navContent}

          <div className="mt-6 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between"
              onClick={() => setWorkspaceOpen(!workspaceOpen)}
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Workspace
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${workspaceOpen ? 'rotate-180' : ''}`} />
            </Button>
            {workspaceOpen && (
              <div className="mt-1 px-3 py-2 text-xs text-slate-500">
                <p className="truncate">{userEmail || 'user@example.com'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar__footer space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-600">Usage</span>
              <span className="text-xs text-slate-500">{usagePercent}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-slate-900 transition-all"
                style={{ width: `${Math.min(100, Math.max(0, usagePercent))}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-900 truncate">{userEmail || 'User'}</p>
              <p className="text-[11px] text-slate-500">Free plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
