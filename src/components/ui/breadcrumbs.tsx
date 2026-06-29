import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const LABEL_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  documents: 'Documents',
  upload: 'Upload',
  workflows: 'Workflows',
  chat: 'AI Chat',
  reports: 'Reports',
  settings: 'Settings',
};

interface BreadcrumbItem {
  label: string;
  path?: string;
}

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  const items: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    ...segments.map((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/');
      const label = LABEL_MAP[segment] || decodeURIComponent(segment);
      return { label, path: index < segments.length - 1 ? path : undefined };
    }),
  ];

  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
      <ol className="flex items-center gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            {item.path ? (
              <Link
                to={item.path}
                className="transition-colors hover:text-slate-700"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-slate-900" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
