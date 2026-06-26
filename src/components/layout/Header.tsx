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
    <header className="header">
      <div className="header__title">
        <h1 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>{title}</h1>
      </div>

      <div className="header__actions">
        <div
          className={`header__search ${searchFocused ? 'header__search--focused' : ''}`}
        >
          <Search className="h-3.5 w-3.5" style={{ color: 'var(--color-muted)' }} />
          <input
            type="text"
            placeholder="Search..."
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text)',
              width: '10rem',
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.25rem',
            borderRadius: 'var(--border-radius-sm)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            padding: '0 0.375rem',
            fontSize: '0.625rem',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-muted)',
          }} className="hidden lg:inline-flex">
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
          className="h-9 w-9"
          style={{ position: 'relative' }}
        >
          <Bell className="h-4 w-4" style={{ color: 'var(--color-muted)' }} />
          <span style={{
            position: 'absolute',
            top: '0.375rem',
            right: '0.375rem',
            height: '0.375rem',
            width: '0.375rem',
            borderRadius: '9999px',
            backgroundColor: '#f43f5e',
          }} />
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="flex items-center gap-2"
          aria-label="User menu"
        >
          <span className="hidden lg:inline" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-muted)' }}>{userEmail || 'User'}</span>
          <ChevronDown className="h-3.5 w-3.5" style={{ color: 'var(--color-muted)' }} />
          <div style={{
            height: '1.75rem',
            width: '1.75rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-muted)',
          }}>
            {initials}
          </div>
        </Button>
      </div>
    </header>
  );
};

export default Header;
