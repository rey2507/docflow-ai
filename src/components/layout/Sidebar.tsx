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
        <button
          key={item.id}
          type="button"
          onClick={() => {
            onNavigate(item.id);
            setMobileOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === item.id
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        className="md:hidden fixed bottom-4 right-4 z-50 rounded-full bg-slate-900 p-3 text-white shadow-lg"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setMobileOpen(false)}>
          <aside
            className="w-72 bg-white h-full shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200">
              <span className="text-lg font-bold text-slate-900 tracking-tight">DocFlow AI</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-3">{navContent}</div>
            <div className="p-3 border-t border-slate-200">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-900 mb-2">Workspace</p>
                <p className="text-xs text-slate-500 truncate">{userEmail || 'user@example.com'}</p>
              </div>
            </div>
          </aside>
        </div>
      )}

      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col h-screen sticky top-0">
        <div className="h-14 flex items-center px-5 border-b border-slate-200">
          <span className="text-lg font-bold text-slate-900 tracking-tight">DocFlow AI</span>
        </div>

        <div className="flex-1 overflow-auto p-3">
          {navContent}

          <div className="mt-6 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setWorkspaceOpen(!workspaceOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Workspace
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${workspaceOpen ? 'rotate-180' : ''}`} />
            </button>
            {workspaceOpen && (
              <div className="mt-1 px-3 py-2 text-xs text-slate-500">
                <p className="truncate">{userEmail || 'user@example.com'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 border-t border-slate-200 space-y-3">
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
