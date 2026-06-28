import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PageContainer, SectionContainer } from '../components/ui/layout';
import { Card, CardHeader, CardBody } from '../components/ui/card';
import { Button } from '../components/ui/button';
import type { Page } from '../types/page';

type SettingsTab = 'account' | 'workspace' | 'billing' | 'ai' | 'integrations' | 'security' | 'danger';

const SettingsPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'account', label: 'Account' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'billing', label: 'Billing' },
    { id: 'ai', label: 'AI' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'security', label: 'Security' },
    { id: 'danger', label: 'Danger Zone' },
  ];

  return (
    <PageContainer variant="narrow">
      <SectionContainer spacing="md">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage your workspace, account preferences, and integrations.
          </p>
        </div>

        <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Settings tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-6">
          {activeTab === 'account' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Account</h3>
              </CardHeader>
              <CardBody>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{user?.email || 'Not available'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">User ID</p>
                    <p className="mt-1 text-sm font-mono text-slate-700">{user?.id || '—'}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'workspace' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Workspace</h3>
              </CardHeader>
              <CardBody>
                <p className="mt-2 text-sm text-slate-600">
                  Workspace settings and team management are coming soon.
                </p>
              </CardBody>
            </Card>
          )}

          {activeTab === 'billing' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Billing</h3>
              </CardHeader>
              <CardBody>
                <p className="mt-2 text-sm text-slate-600">
                  Billing and subscription management are coming soon.
                </p>
              </CardBody>
            </Card>
          )}

          {activeTab === 'ai' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">AI Settings</h3>
              </CardHeader>
              <CardBody>
                <p className="mt-2 text-sm text-slate-600">
                  AI provider preferences and configuration are coming soon.
                </p>
              </CardBody>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Integrations</h3>
              </CardHeader>
              <CardBody>
                <p className="mt-2 text-sm text-slate-600">
                  Integration settings are coming soon.
                </p>
              </CardBody>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Security</h3>
              </CardHeader>
              <CardBody>
                <p className="mt-2 text-sm text-slate-600">
                  Security settings are coming soon.
                </p>
              </CardBody>
            </Card>
          )}

          {activeTab === 'danger' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-rose-900">Danger zone</h3>
              </CardHeader>
              <CardBody>
                <p className="mt-2 text-sm text-slate-600">
                  Sign out of your current session.
                </p>
                <Button
                  variant="danger"
                  onClick={signOut}
                  className="mt-4"
                >
                  Sign out
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </SectionContainer>
    </PageContainer>
  );
};

export default SettingsPage;
