import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PageContainer, SectionContainer } from '../components/ui/layout';
import { Card, CardHeader, CardBody } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { BriefcaseBusiness, CreditCard, Sparkles, Plug, Shield, Trash2, TriangleAlert } from 'lucide-react';
import { Input } from '../components/ui/input';
import { loadSettings, saveSettings, type AppSettings } from '../lib/settings';

type SettingsTab = 'account' | 'workspace' | 'billing' | 'ai' | 'integrations' | 'security' | 'danger';

interface SelectOption {
  label: string;
  value: string;
}

interface ControlSelectProps {
  label: string;
  description: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

interface ControlToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const fieldClass = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-slate-900 focus:ring-4 focus:ring-slate-100';

const ControlSelect: React.FC<ControlSelectProps> = ({ label, description, value, options, onChange }) => {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <label htmlFor={id} className="text-sm font-semibold text-slate-900">
          {label}
        </label>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const ControlToggle: React.FC<ControlToggleProps> = ({ label, description, checked, onChange }) => {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
      />
    </label>
  );
};

const SettingsPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [deletionStep, setDeletionStep] = useState<'review' | 'confirm' | 'processing'>('review');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

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
      localStorage.removeItem('docflow.settings.v1');
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
            Personalize how DocFlow AI behaves for your workspace.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-900">Preferences</p>
            <p className="text-sm text-slate-500">Changes are applied automatically as you adjust them.</p>
          </div>
          <Badge variant="success">Auto-saved</Badge>
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
                    <p className="mt-1 text-sm text-slate-500">Profile details and launch behavior for this user.</p>
                  </div>
                  <Badge variant="info">Auto-saved</Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
                        {(settings.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Signed in as</p>
                        <p className="mt-1 truncate text-base font-semibold text-slate-900">{user?.email || 'Not available'}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {settings.displayName ? `Display name: ${settings.displayName}` : 'Add a display name to personalize the workspace.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <Input
                      label="Display name"
                      value={settings.displayName}
                      onChange={(event) => updateSettings('displayName', event.target.value)}
                      placeholder="How the app should address you"
                      helperText="Used in account labels and welcome states."
                    />

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <label htmlFor="home-screen-after-sign-in" className="block text-sm font-medium text-slate-700">
                        Home screen after sign-in
                      </label>
                      <select
                        id="home-screen-after-sign-in"
                        value={settings.homePage}
                        onChange={(event) => updateSettings('homePage', event.target.value as AppSettings['homePage'])}
                        className={`${fieldClass} mt-2`}
                      >
                        <option value="dashboard">Dashboard</option>
                        <option value="upload">Uploads</option>
                        <option value="reports">Reports</option>
                        <option value="ai-insights">AI Insights</option>
                      </select>
                      <p className="mt-2 text-xs text-slate-500">Choose where the workspace opens after a fresh login.</p>
                    </div>
                  </div>

                  <ControlToggle
                    label="Compact interface"
                    description="Use tighter spacing for a denser desktop-friendly layout."
                    checked={settings.compactMode}
                    onChange={(checked) => updateSettings('compactMode', checked)}
                  />

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
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness className="h-5 w-5 text-slate-700" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Workspace</h3>
                    <p className="mt-1 text-sm text-slate-500">Document layout and workspace behavior.</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <Input
                    label="Workspace name"
                    value={settings.workspaceName}
                    onChange={(event) => updateSettings('workspaceName', event.target.value)}
                    placeholder="DocFlow Workspace"
                    helperText="Shown in the shell and future workspace branding."
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <ControlSelect
                      label="Default document view"
                      description="Choose how document lists open by default."
                      value={settings.defaultDocumentView}
                      onChange={(value) => updateSettings('defaultDocumentView', value as AppSettings['defaultDocumentView'])}
                      options={[
                        { label: 'Grid', value: 'grid' },
                        { label: 'Table', value: 'table' },
                      ]}
                    />
                    <ControlToggle
                      label="Open uploads automatically"
                      description="Jump to the uploaded document once processing starts."
                      checked={settings.autoOpenUploadedDocument}
                      onChange={(checked) => updateSettings('autoOpenUploadedDocument', checked)}
                    />
                  </div>

                  <ControlToggle
                    label="Show activity timestamps"
                    description="Display exact times in the recent activity feed."
                    checked={settings.showActivityTimestamps}
                    onChange={(checked) => updateSettings('showActivityTimestamps', checked)}
                  />
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'billing' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-slate-700" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Billing</h3>
                    <p className="mt-1 text-sm text-slate-500">Usage alerts and report preferences.</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <ControlToggle
                    label="Usage alerts"
                    description="Warn me before the workspace reaches the selected usage threshold."
                    checked={settings.usageAlerts}
                    onChange={(checked) => updateSettings('usageAlerts', checked)}
                  />

                  <ControlSelect
                    label="Usage alert threshold"
                    description="Choose when usage warnings should appear."
                    value={String(settings.usageAlertThreshold)}
                    onChange={(value) => updateSettings('usageAlertThreshold', Number(value))}
                    options={[
                      { label: '50%', value: '50' },
                      { label: '70%', value: '70' },
                      { label: '80%', value: '80' },
                      { label: '90%', value: '90' },
                      { label: '100%', value: '100' },
                    ]}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <ControlToggle
                      label="Monthly usage report"
                      description="Send a monthly summary of document and AI activity."
                      checked={settings.monthlyUsageReport}
                      onChange={(checked) => updateSettings('monthlyUsageReport', checked)}
                    />
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                      <p className="text-sm font-semibold text-slate-900">Plan visibility</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Plan and invoice controls can be connected later without changing this settings layout.
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'ai' && (
            <Card>
              <CardHeader>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">AI Settings</h3>
                  <p className="mt-1 text-sm text-slate-500">Tune summaries, tone, and extraction behavior.</p>
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
                        <p className="text-sm font-semibold text-slate-900">Current AI behavior</p>
                        <p className="mt-1 text-sm text-slate-600">These preferences shape the summaries and guidance users see in the app.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <ControlSelect
                      label="Summary length"
                      description="Set how much detail AI should include in document summaries."
                      value={settings.summaryLength}
                      onChange={(value) => updateSettings('summaryLength', value as AppSettings['summaryLength'])}
                      options={[
                        { label: 'Short', value: 'short' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Long', value: 'long' },
                      ]}
                    />
                    <ControlSelect
                      label="Response tone"
                      description="Choose the style AI should use when answering users."
                      value={settings.responseTone}
                      onChange={(value) => updateSettings('responseTone', value as AppSettings['responseTone'])}
                      options={[
                        { label: 'Concise', value: 'concise' },
                        { label: 'Balanced', value: 'balanced' },
                        { label: 'Detailed', value: 'detailed' },
                      ]}
                    />
                  </div>

                  <ControlToggle
                    label="Auto-suggest follow-up actions"
                    description="Show next-step suggestions after summaries and uploads."
                    checked={settings.autoSuggestActions}
                    onChange={(checked) => updateSettings('autoSuggestActions', checked)}
                  />

                  <ControlToggle
                    label="Strict extraction mode"
                    description="Prefer precise extraction and validation over relaxed parsing."
                    checked={settings.strictExtraction}
                    onChange={(checked) => updateSettings('strictExtraction', checked)}
                  />
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Plug className="h-5 w-5 text-slate-700" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Integrations</h3>
                    <p className="mt-1 text-sm text-slate-500">Notification and delivery preferences.</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ControlToggle
                      label="Email notifications"
                      description="Send emails for important workspace events."
                      checked={settings.emailNotifications}
                      onChange={(checked) => updateSettings('emailNotifications', checked)}
                    />
                    <ControlToggle
                      label="Desktop notifications"
                      description="Show browser notifications for updates when the app is open."
                      checked={settings.desktopNotifications}
                      onChange={(checked) => updateSettings('desktopNotifications', checked)}
                    />
                  </div>

                  <ControlSelect
                    label="Notification digest"
                    description="Choose how often you want notification summaries."
                    value={settings.digestFrequency}
                    onChange={(value) => updateSettings('digestFrequency', value as AppSettings['digestFrequency'])}
                    options={[
                      { label: 'Instant', value: 'instant' },
                      { label: 'Daily', value: 'daily' },
                      { label: 'Weekly', value: 'weekly' },
                    ]}
                  />

                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">Future integrations</p>
                    <p className="mt-1 text-sm text-slate-500">External connectors can be added later without changing the structure of this settings page.</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Security</h3>
                  <p className="mt-1 text-sm text-slate-500">Session and safety preferences for sensitive actions.</p>
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
                        <p className="mt-1 text-sm text-slate-600">Keep the workspace locked down while preserving a smooth sign-in experience.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <ControlSelect
                      label="Session timeout"
                      description="Set how long a session can stay active before re-authentication."
                      value={settings.sessionTimeout}
                      onChange={(value) => updateSettings('sessionTimeout', value as AppSettings['sessionTimeout'])}
                      options={[
                        { label: '30 minutes', value: '30m' },
                        { label: '2 hours', value: '2h' },
                        { label: '8 hours', value: '8h' },
                        { label: 'Never', value: 'never' },
                      ]}
                    />
                    <ControlToggle
                      label="Require re-authentication for delete actions"
                      description="Ask for confirmation before destructive account changes."
                      checked={settings.requireReauthForDanger}
                      onChange={(checked) => updateSettings('requireReauthForDanger', checked)}
                    />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <ControlToggle
                      label="Hide sensitive previews"
                      description="Reduce preview exposure for document snippets and secure content."
                      checked={settings.hideSensitivePreviews}
                      onChange={(checked) => updateSettings('hideSensitivePreviews', checked)}
                    />
                    <ControlToggle
                      label="Keep me signed in"
                      description="Extend the session between app visits on this device."
                      checked={settings.keepSignedIn}
                      onChange={(checked) => updateSettings('keepSignedIn', checked)}
                    />
                  </div>

                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">Planned controls</p>
                    <ul className="mt-2 space-y-2 text-sm text-slate-600">
                      <li>• Device and session management for signed-in users.</li>
                      <li>• Audit logging for destructive or sensitive changes.</li>
                      <li>• Workspace-level access review tools.</li>
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
