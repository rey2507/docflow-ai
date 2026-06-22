import React from 'react';
import Sidebar from './Sidebar';

interface AppShellProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ currentPage, onNavigate, children }) => {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-slate-900">DocFlow AI</h1>
          <div className="text-sm text-slate-500">Workspace</div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
