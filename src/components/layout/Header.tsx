import React, { useState } from 'react';
import { Search, Bell, Command, ChevronDown, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { SearchInput } from '../ui/input';

interface HeaderProps {
  title: string;
  onUploadClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onUploadClick }) => {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold text-slate-900 lg:text-base">{title}</h1>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        <div
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
            searchFocused ? 'border-slate-900 bg-white' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400 w-40 lg:w-56"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-white px-1.5 text-[10px] font-medium text-slate-500">
            <Command className="h-3 w-3" />
            K
          </kbd>
        </div>

        {onUploadClick && (
          <Button
            variant="primary"
            size="sm"
            onClick={onUploadClick}
            className="hidden sm:inline-flex items-center gap-1.5"
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
          className="h-9 w-9 rounded-lg text-slate-500"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="User menu"
        >
          <span className="hidden lg:inline text-sm font-medium text-slate-700">Workspace</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
            W
          </div>
        </Button>
      </div>
    </header>
  );
};

export default Header;
