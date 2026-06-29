import React, { useState } from 'react';
import { Search, Bell, Command, ChevronDown, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface HeaderProps {
  title: string;
  userEmail?: string;
  onUploadClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, userEmail, onUploadClick }) => {
  const [searchFocused, setSearchFocused] = useState(false);

  const initials = userEmail ? userEmail.charAt(0).toUpperCase() : 'U';

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
      <h1 className="text-sm font-semibold text-slate-800">{title}</h1>

      <div className="flex items-center gap-2">
        <div className={`hidden items-center gap-2 rounded-md border bg-white px-2 py-1 text-sm transition lg:inline-flex ${searchFocused ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200'}`}>
          <Search className="h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search documents"
            className="bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500 w-40 focus:outline-none"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="hidden items-center gap-1 rounded-sm border border-slate-200 bg-slate-50 px-1.5 text-xs font-medium text-slate-500 lg:inline-flex">
            <Command className="h-3 w-3" />
            K
          </kbd>
        </div>

        {onUploadClick && (
          <Button
            variant="primary"
            size="sm"
            onClick={onUploadClick}
            className="hidden items-center gap-1.5 sm:inline-flex"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload</span>
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative h-9 w-9"
        >
          <Bell className="h-4 w-4 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="flex items-center gap-2"
          aria-label="User menu"
        >
          <span className="hidden text-sm font-medium text-slate-600 lg:inline">{userEmail || 'User'}</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
            {initials}
          </div>
        </Button>
      </div>
    </header>
  );
};

export default Header;
