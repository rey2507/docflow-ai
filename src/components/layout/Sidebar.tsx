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
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setMobileOpen(false)}>
          <aside className="flex w-72 h-full flex-col bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200">
              <span className="text-lg font-bold text-slate-800">DocFlow AI</span>
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
            <div className="flex-1 overflow-y-auto p-4">{navContent}</div>
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center gap-2 rounded-md bg-slate-50 p-2">
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                  {displayEmail.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-900 truncate">{displayEmail}</p>
                  <p className="text-[0.6875rem] text-slate-500">Beta</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white h-full">
        <div className="p-4 border-b border-slate-200">
          <span className="text-lg font-bold text-slate-800 tracking-tight">DocFlow AI</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
          {navContent}

          <div className="border-t border-slate-200 my-2" />
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
            <div className="mt-2 truncate text-xs text-slate-500">
              {displayEmail}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>Usage</span>
            <span>{usagePercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full rounded-full bg-slate-800 transition-all duration-150" style={{ width: `${Math.min(100, Math.max(0, usagePercent))}%` }} />
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-md bg-slate-50 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
              {displayEmail.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-900">{displayEmail}</p>
              <p className="text-[0.6875rem] text-slate-500">Beta</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
