import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PageContainer, SectionContainer } from '../components/ui/layout';
import { Card, CardHeader, CardBody } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/ui/empty-state';
import { Badge } from '../components/ui/badge';
import { BriefcaseBusiness, CreditCard, Sparkles, Plug, Shield, Trash2, TriangleAlert } from 'lucide-react';
import { Input } from '../components/ui/input';

type SettingsTab = 'account' | 'workspace' | 'billing' | 'ai' | 'integrations' | 'security' | 'danger';

const SettingsPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [deletionStep, setDeletionStep] = useState<'review' | 'confirm' | 'processing'>('review');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  const resetDeletionFlow = () => {
    setDeletionStep('review');
    setDeleteConfirmation('');
    setDeleteError('');
    setDeleteMessage('');
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteMessage('');

    if (deleteConfirmation.trim() !== 'DELETE MY ACCOUNT') {
      setDeleteError('Type DELETE MY ACCOUNT exactly to continue.');
      return;
    }

    setDeletionStep('processing');
    try {
      localStorage.removeItem('docflow.notifications.v1');
      await signOut();
      setDeleteMessage('You have been signed out. Full account deletion should be completed by a server-side deletion endpoint.');
      resetDeletionFlow();
    } catch (error: any) {
      setDeleteError(error?.message || 'Unable to complete the account deletion flow.');
      setDeletionStep('confirm');
    }
  };

  const phraseConfirmed = deleteConfirmation.trim() === 'DELETE MY ACCOUNT';

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
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Account</h3>
                    <p className="mt-1 text-sm text-slate-500">Identity and session details for this workspace.</p>
                  </div>
                  <Badge variant="info">Active session</Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
                        {(user?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Signed in as</p>
                        <p className="mt-1 truncate text-base font-semibold text-slate-900">{user?.email || 'Not available'}</p>
                          <p className="mt-1 text-sm text-slate-500">This account is currently connected to the active workspace session.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</p>
                      <p className="mt-2 break-all text-sm font-medium text-slate-900">{user?.email || 'Not available'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">User ID</p>
                      <p className="mt-2 break-all font-mono text-sm text-slate-700">{user?.id || '—'}</p>
                    </div>
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
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">AI Settings</h3>
                  <p className="mt-1 text-sm text-slate-500">Control how DocFlow AI summarizes, extracts, and responds.</p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-slate-900 p-2 text-white shadow-sm">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">Current AI experience</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Document extraction, summaries, and workflow guidance are powered by the active workspace configuration.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Response style</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">Concise and workspace-focused</p>
                      <p className="mt-1 text-sm text-slate-500">Best for document summaries, task prompts, and workflow feedback.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Safety</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">Guardrails enabled</p>
                      <p className="mt-1 text-sm text-slate-500">Keep AI actions scoped to the current user and workspace.</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">Coming next</p>
                    <ul className="mt-2 space-y-2 text-sm text-slate-600">
                      <li>• Choose an AI provider or model preset.</li>
                      <li>• Adjust summary length and tone.</li>
                      <li>• Add per-workspace prompt rules.</li>
                    </ul>
                  </div>
                </div>
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
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Security</h3>
                  <p className="mt-1 text-sm text-slate-500">Session policies, access rules, and workspace protections.</p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-slate-900 p-2 text-white shadow-sm">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">Current protection posture</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Access is currently governed by workspace authentication and row-level policies.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Session protection</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">Active sign-in session</p>
                      <p className="mt-1 text-sm text-slate-500">The app uses the current sign-in session to identify the user.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Access control</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">Workspace-scoped</p>
                      <p className="mt-1 text-sm text-slate-500">Policies should keep documents, reports, and activity isolated by user.</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">Planned controls</p>
                    <ul className="mt-2 space-y-2 text-sm text-slate-600">
                      <li>• Session timeout and re-authentication for critical actions.</li>
                      <li>• Device/session management for signed-in users.</li>
                      <li>• Audit logging for destructive or sensitive changes.</li>
                    </ul>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'danger' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TriangleAlert className="h-5 w-5 text-rose-700" />
                  <h3 className="text-lg font-semibold text-rose-900">Danger zone</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-5">
                  <div className="rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50 to-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-rose-100 p-2 text-rose-700">
                        <Trash2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-rose-900">Delete account</p>
                        <p className="mt-1 text-sm text-rose-700">
                          This permanently removes the user account and should be backed by a server-side deletion endpoint. The UI below is designed to prevent accidental deletion.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Step 1 of 2: review</p>
                      <ul className="mt-2 space-y-2 text-sm text-slate-600">
                        <li>• Export documents or reports you want to keep.</li>
                        <li>• Confirm this is the correct workspace identity.</li>
                        <li>• Continue only if you are ready for the final confirmation step.</li>
                      </ul>
                    </div>

                    {deletionStep === 'review' ? (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          variant="danger"
                          onClick={() => setDeletionStep('confirm')}
                          className="w-full sm:w-auto"
                        >
                          Continue to delete
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={signOut}
                          className="w-full sm:w-auto"
                        >
                          Sign out instead
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                          Step 2 of 2: type <span className="font-semibold">DELETE MY ACCOUNT</span> to enable deletion.
                        </div>

                        <Input
                          label="Confirmation phrase"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          placeholder="DELETE MY ACCOUNT"
                          autoComplete="off"
                          spellCheck={false}
                          disabled={deletionStep === 'processing'}
                          error={deleteError || undefined}
                          helperText={phraseConfirmed ? 'Phrase matched. Final delete is ready.' : 'Exact match required.'}
                        />

                        {deleteMessage && (
                          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                            {deleteMessage}
                          </p>
                        )}

                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            variant="danger"
                            onClick={handleDeleteAccount}
                            disabled={deletionStep === 'processing' || !phraseConfirmed}
                            loading={deletionStep === 'processing'}
                            className="w-full sm:w-auto"
                          >
                            Delete account permanently
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={resetDeletionFlow}
                            disabled={deletionStep === 'processing'}
                            className="w-full sm:w-auto"
                          >
                            Cancel
                          </Button>
                        </div>

                        <p className="text-xs text-slate-500">
                          Proper account deletion should be implemented with a server-side endpoint or Supabase admin function. This UI protects against accidental deletion while keeping the destructive path explicit.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </SectionContainer>
    </PageContainer>
  );
};

export default SettingsPage;
