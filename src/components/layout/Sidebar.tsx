import React, { useState, useEffect } from 'react';
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
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Button } from '../ui/button';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userEmail?: string;
  usagePercent?: number;
}

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
  { id: 'upload', label: 'Uploads', icon: <Upload className="h-4 w-4" /> },
  { id: 'workflows', label: 'Workflows', icon: <GitBranch className="h-4 w-4" /> },
  { id: 'chat', label: 'AI Chat', icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, userEmail, usagePercent = 0 }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  const displayEmail = userEmail || 'User';

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const mobile = 'matches' in e ? e.matches : (e as MediaQueryList).matches;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(false);
        setMobileOpen(false);
      }
    };
    handler(mql);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const handleNav = (page: Page) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  const sidebarWidth = collapsed ? 'w-16' : 'w-64';

  // ============ MOBILE: overlay drawer ============
  if (isMobile) {
    return (
      <>
        {/* Hamburger — top-left */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="fixed top-3 left-3 z-50"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Drawer */}
        <aside
          className={`fixed top-0 left-0 h-full z-50 bg-white border-r border-slate-200 shadow-xl transition-transform duration-200 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ width: '16rem' }}
        >
          <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200">
            <span className="text-lg font-bold text-slate-800 tracking-tight">DocFlow AI</span>
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

          <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={currentPage === item.id ? 'primary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => handleNav(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Button>
            ))}
          </nav>

          <div className="p-3 border-t border-slate-200">
            <div className="flex items-center gap-2 rounded-md bg-slate-50 p-2">
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                {displayEmail.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-900 truncate">{displayEmail}</p>
                <p className="text-[0.6875rem] text-slate-500">Beta</p>
              </div>
            </div>
          </div>
        </aside>
      </>
    );
  }

  // ============ TABLET + DESKTOP: collapsible inline sidebar ============
  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 border-r border-slate-200 bg-white transition-all duration-200 ${sidebarWidth}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-slate-200">
        {!collapsed && (
          <span className="text-base font-bold text-slate-800 tracking-tight whitespace-nowrap">DocFlow AI</span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`h-8 w-8 ${collapsed ? 'mx-auto' : ''}`}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant={currentPage === item.id ? 'primary' : 'ghost'}
            className={`w-full justify-start ${collapsed ? 'px-2 justify-center' : ''}`}
            onClick={() => handleNav(item.id)}
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </Button>
        ))}
      </nav>

      {/* Workspace */}
      <div className="p-2 border-t border-slate-200">
        {!collapsed ? (
          <>
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
              <div className="mt-2 truncate text-xs text-slate-500 px-2">
                {displayEmail}
              </div>
            )}
          </>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-center"
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            title="Workspace"
          >
            <Users className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Usage + profile */}
      <div className="p-3 border-t border-slate-200">
        {!collapsed ? (
          <>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
              <span>Usage</span>
              <span>{usagePercent}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-slate-800 transition-all duration-150"
                style={{ width: `${Math.min(100, Math.max(0, usagePercent))}%` }}
              />
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-md bg-slate-50 p-2">
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                {displayEmail.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-900">{displayEmail}</p>
                <p className="text-[0.6875rem] text-slate-500">Beta</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
              {displayEmail.charAt(0).toUpperCase()}
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-slate-800 transition-all duration-150"
                style={{ width: `${Math.min(100, Math.max(0, usagePercent))}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
