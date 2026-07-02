import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Bell, Command, ChevronDown, Upload, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { Page } from '../../types/page';
import { AppNotification, getUnreadCount, loadNotifications, markAllNotificationsRead, markNotificationRead, removeExpiredNotifications } from '../../lib/notifications';

interface HeaderProps {
  title: string;
  userEmail?: string;
  onUploadClick?: () => void;
  onMenuClick?: () => void;
  onNavigate?: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ title, userEmail, onUploadClick, onMenuClick, onNavigate }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => removeExpiredNotifications());
  const headerRef = useRef<HTMLDivElement>(null);
  const [menuTop, setMenuTop] = useState<number>(0);

  const initials = userEmail ? userEmail.charAt(0).toUpperCase() : 'U';
  const unreadCount = getUnreadCount(notifications);

  useEffect(() => {
    const stored = loadNotifications();
    setNotifications(stored);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
        setUserMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    const updateTop = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setMenuTop(rect.bottom + window.scrollY + 4); // small gap
      }
    };
    updateTop();
    window.addEventListener('resize', updateTop);
    window.addEventListener('scroll', updateTop, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', updateTop);
      window.removeEventListener('scroll', updateTop);
    };
  }, []);

  const orderedNotifications = useMemo(() => {
    return [...notifications]
      .filter((notification) => !notification.read)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [notifications]);

  return (
    <header ref={headerRef} className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur-sm sm:px-4 lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        {onMenuClick && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="h-9 w-9 shrink-0 sm:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-slate-900 sm:text-sm">{title}</h1>
          <p className="hidden text-xs text-slate-500 sm:block">DocFlow workspace</p>
        </div>
      </div>

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

        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="relative h-9 w-9"
            onClick={() => {
              setNotificationsOpen((open) => !open);
              setUserMenuOpen(false);
            }}
          >
            <Bell className="h-4 w-4 text-slate-500" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>

          {notificationsOpen && (
            <div
              className="fixed right-4 z-50 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
              style={{ top: `${menuTop}px` }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <p className="text-sm font-semibold text-slate-900">Notifications</p>
                <button
                  type="button"
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
                  onClick={() => {
                    setNotifications(markAllNotificationsRead());
                  }}
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 space-y-2 overflow-y-auto pt-2">
                {orderedNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-left text-sm text-slate-800 transition hover:bg-rose-100"
                    onClick={() => {
                      setNotifications(markNotificationRead(notification.id));
                      setNotificationsOpen(false);
                      if (notification.actionPage) {
                        onNavigate?.(notification.actionPage);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium">{notification.title}</span>
                      <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
                    </div>
                    <span className="mt-1 block text-xs text-slate-500">{notification.message}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={() => {
                  setNotificationsOpen(false);
                  onNavigate?.('notifications');
                }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            className="flex items-center gap-2 rounded-full pl-2 pr-1 sm:rounded-md sm:px-2"
            aria-label="User menu"
            onClick={() => {
              setUserMenuOpen((open) => !open);
              setNotificationsOpen(false);
            }}
          >
            <span className="hidden text-sm font-medium text-slate-600 lg:inline">{userEmail || 'User'}</span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-slate-500 sm:block" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 sm:h-7 sm:w-7">
              {initials}
            </div>
          </Button>

          {userMenuOpen && (
            <div
              className="fixed right-4 z-50 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
              style={{ top: `${menuTop}px` }}
            >
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                onClick={() => {
                  setUserMenuOpen(false);
                  onNavigate?.('settings');
                }}
              >
                Settings
              </button>
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                onClick={() => {
                  setUserMenuOpen(false);
                  onNavigate?.('notifications');
                }}
              >
                Notifications
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                onClick={() => {
                  setUserMenuOpen(false);
                  onUploadClick?.();
                }}
              >
                Upload
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
