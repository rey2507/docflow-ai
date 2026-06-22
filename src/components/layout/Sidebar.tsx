import React, { useState } from 'react';

type Page = 'dashboard' | 'upload' | 'reports' | 'settings';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { id: Page; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Documents', icon: '📄' },
    { id: 'upload', label: 'Upload', icon: '⬆️' },
    { id: 'reports', label: 'Reports', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const navContent = (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            onNavigate(item.id);
            setMobileOpen(false);
          }}
          className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ' + (currentPage === item.id ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')}
        >
          <span className="text-base">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <>
      <button
        className="md:hidden fixed bottom-4 right-4 z-50 rounded-full bg-blue-600 p-3 text-white shadow-lg"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setMobileOpen(false)}>
          <aside className="w-64 bg-white h-full p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xl font-bold text-slate-900">DocFlow AI</span>
              <button onClick={() => setMobileOpen(false)} className="text-slate-500 hover:text-slate-900">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      )}

      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <span className="text-xl font-bold text-slate-900">DocFlow AI</span>
        </div>
        <div className="flex-1 p-4">
          {navContent}
        </div>
        <div className="p-4 border-t border-slate-100">
          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-900 mb-1">Need help?</p>
            <p>Check the docs or contact support for assistance with workflows and integrations.</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
