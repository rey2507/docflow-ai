import React from 'react';

interface SettingsPageProps {
  user: { email?: string; id: string };
  onSignOut: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onSignOut }) => {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
        <p className="mt-1 text-sm text-slate-600">
          Manage your workspace, account preferences, and integrations.
        </p>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Account</h3>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{user.email || 'Not available'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">User ID</p>
              <p className="mt-1 text-sm font-mono text-slate-700">{user.id}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Workspace</h3>
          <p className="mt-2 text-sm text-slate-600">
            Workspace configuration and team management will appear here.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Integrations</h3>
          <p className="mt-2 text-sm text-slate-600">
            Connect Supabase, AI providers, and other services from this section.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-rose-900">Danger zone</h3>
          <p className="mt-2 text-sm text-slate-600">
            Sign out of your current session.
          </p>
          <button
            onClick={onSignOut}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Sign out
          </button>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
