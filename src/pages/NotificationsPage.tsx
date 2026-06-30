import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCheck, BellRing, Clock3, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardBody } from '../components/ui/card';
import { PageContainer, SectionContainer } from '../components/ui/layout';
import { AppNotification, loadNotifications, markAllNotificationsRead, markNotificationRead, removeExpiredNotifications } from '../lib/notifications';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadNotifications());

  useEffect(() => {
    setNotifications(removeExpiredNotifications());
  }, []);

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);
  const unreadNotifications = useMemo(() => notifications.filter((notification) => !notification.read), [notifications]);

  const handleRead = (id: string) => {
    setNotifications(markNotificationRead(id));
  };

  const handleMarkAllRead = () => {
    setNotifications(markAllNotificationsRead());
  };

  return (
    <PageContainer variant="narrow">
      <SectionContainer spacing="md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button variant="ghost" className="mb-3 h-9 px-3 text-sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h2 className="text-2xl font-semibold text-slate-900">Notifications</h2>
            <p className="mt-1 text-sm text-slate-600">
              Unread items stay visible until you mark them read. Older items are kept for 8 days.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
              {unreadCount} unread
            </span>
            <Button variant="secondary" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {unreadNotifications.length === 0 ? (
            <Card>
              <CardBody>
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <BellRing className="h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-900">No unread notifications</p>
                  <p className="mt-1 text-sm text-slate-500">New activity will appear here when it arrives.</p>
                </div>
              </CardBody>
            </Card>
          ) : (
            unreadNotifications.map((notification) => (
              <Card key={notification.id}>
                <CardBody>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-full p-2 ${notification.kind === 'success' ? 'bg-emerald-50 text-emerald-600' : notification.kind === 'warning' ? 'bg-amber-50 text-amber-600' : notification.kind === 'system' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600'}`}>
                      <Clock3 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                          <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500" />
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        {notification.actionPage && (
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => {
                            handleRead(notification.id);
                            navigate(notification.actionPage === 'notifications' ? '/notifications' : `/${notification.actionPage}`);
                          }}>
                            <ExternalLink className="mr-2 h-3.5 w-3.5" />
                            Open
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => handleRead(notification.id)}>
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </SectionContainer>
    </PageContainer>
  );
};

export default NotificationsPage;
