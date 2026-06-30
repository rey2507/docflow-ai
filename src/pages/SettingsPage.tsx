import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PageContainer, SectionContainer } from '../components/ui/layout';
import { Card, CardHeader, CardBody } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/ui/empty-state';
import { BriefcaseBusiness, CreditCard, Sparkles, Plug, Shield } from 'lucide-react';

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
                <EmptyState
                  icon={<BriefcaseBusiness className="h-6 w-6" />}
                  title="Workspace controls are being prepared"
                  description="Team roles, members, and workspace preferences will appear here."
                  className="border-slate-200 bg-slate-50"
                />
              </CardBody>
            </Card>
          )}

          {activeTab === 'billing' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Billing</h3>
              </CardHeader>
              <CardBody>
                <EmptyState
                  icon={<CreditCard className="h-6 w-6" />}
                  title="Billing center is not live yet"
                  description="Plans, invoices, and subscription controls will connect here once billing is enabled."
                  className="border-slate-200 bg-slate-50"
                />
              </CardBody>
            </Card>
          )}

          {activeTab === 'ai' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">AI Settings</h3>
              </CardHeader>
              <CardBody>
                <EmptyState
                  icon={<Sparkles className="h-6 w-6" />}
                  title="AI provider controls are pending"
                  description="Model selection, prompts, and safety settings will be managed here."
                  className="border-slate-200 bg-slate-50"
                />
              </CardBody>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Integrations</h3>
              </CardHeader>
              <CardBody>
                <EmptyState
                  icon={<Plug className="h-6 w-6" />}
                  title="Integrations will connect here"
                  description="External tools, webhooks, and workspace connectors will be configured on this screen."
                  className="border-slate-200 bg-slate-50"
                />
              </CardBody>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Security</h3>
              </CardHeader>
              <CardBody>
                <EmptyState
                  icon={<Shield className="h-6 w-6" />}
                  title="Security controls are queued"
                  description="Session policies, access rules, and workspace protections will live here."
                  className="border-slate-200 bg-slate-50"
                />
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
