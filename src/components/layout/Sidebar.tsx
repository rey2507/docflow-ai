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
  Sparkles,
  Bell,
  ChevronDown,
  X,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Button } from '../ui/button';

const navButtonClass = (active: boolean, compact = false) =>
  [
    'w-full justify-start gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
    active
      ? 'border-slate-900/10 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm hover:from-slate-900 hover:to-slate-700'
      : 'border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50',
    compact ? 'justify-center px-2' : '',
  ].join(' ');

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userEmail?: string;
  usagePercent?: number;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
  { id: 'upload', label: 'Uploads', icon: <Upload className="h-4 w-4" /> },
  { id: 'workflows', label: 'Workflows', icon: <GitBranch className="h-4 w-4" /> },
  { id: 'chat', label: 'AI Chat', icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'ai-insights', label: 'AI Insights', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, userEmail, usagePercent = 0, mobileOpen: controlledMobileOpen, onMobileOpenChange }) => {
  const [uncontrolledMobileOpen, setUncontrolledMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  const displayEmail = userEmail || 'User';
  const mobileOpen = controlledMobileOpen ?? uncontrolledMobileOpen;
  const setMobileOpen = onMobileOpenChange ?? setUncontrolledMobileOpen;

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

  if (isMobile) {
    return (
      <>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMobileOpen(false)} />
        )}

        <aside
          className={`fixed top-0 left-0 z-50 flex h-full w-[86vw] max-w-sm flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 to-slate-900 px-4 py-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">DocFlow AI</p>
                <span className="block text-base font-semibold tracking-tight text-white">Workspace</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="h-9 w-9 rounded-full text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Signed in as</p>
              <p className="truncate text-sm font-medium text-white">{displayEmail}</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Navigation
            </div>
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={currentPage === item.id ? 'primary' : 'ghost'}
                className={navButtonClass(currentPage === item.id)}
                onClick={() => handleNav(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Button>
            ))}
          </nav>

          <div className="border-t border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {displayEmail.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{displayEmail}</p>
                <p className="text-xs text-slate-500">Beta workspace</p>
              </div>
            </div>
          </div>
        </aside>
      </>
    );
  }

  return (
    <aside className={`hidden md:flex h-screen flex-col sticky top-0 border-r border-slate-200 bg-white/95 backdrop-blur-sm transition-all duration-200 ${sidebarWidth}`}>
      <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-950 to-slate-900 px-3 text-white">
        {!collapsed && (
          <span className="text-base font-semibold tracking-tight whitespace-nowrap text-white">DocFlow AI</span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`h-8 w-8 rounded-full text-white hover:bg-white/10 ${collapsed ? 'mx-auto' : ''}`}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {!collapsed && (
          <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Navigation
          </div>
        )}
        {NAV_ITEMS.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant={currentPage === item.id ? 'primary' : 'ghost'}
            className={navButtonClass(currentPage === item.id, collapsed)}
            onClick={() => handleNav(item.id)}
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </Button>
        ))}
      </nav>

      <div className="border-t border-slate-200 bg-slate-50 p-2">
        {!collapsed ? (
          <>
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm hover:bg-slate-50"
              onClick={() => setWorkspaceOpen(!workspaceOpen)}
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Workspace
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${workspaceOpen ? 'rotate-180' : ''}`} />
            </Button>
            {workspaceOpen && <div className="mt-2 truncate px-2 text-xs text-slate-500">{displayEmail}</div>}
          </>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-center rounded-xl border border-slate-200 bg-white py-2.5 shadow-sm hover:bg-slate-50"
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            title="Workspace"
          >
            <Users className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="border-t border-slate-200 bg-white p-3">
        {!collapsed ? (
          <>
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Usage</span>
              <span>{usagePercent}%</span>
            </div>
            <progress
              className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-slate-800 [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-slate-800"
              max={100}
              value={Math.min(100, Math.max(0, usagePercent))}
            />
            <div className="mt-3 flex items-center gap-2 rounded-md bg-slate-50 p-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
              {displayEmail.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
