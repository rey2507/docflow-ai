import React from 'react';
import { PageContainer, SectionContainer } from '../components/ui/layout';
import { Card, CardHeader, CardBody } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface SettingsPageProps {
  user: { email?: string; id: string };
  onSignOut: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onSignOut }) => {
  return (
    <PageContainer variant="narrow">
      <SectionContainer spacing="md">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage your workspace, account preferences, and integrations.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">Account</h3>
            </CardHeader>
            <CardBody>
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
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">Workspace</h3>
            </CardHeader>
            <CardBody>
              <p className="mt-2 text-sm text-slate-600">
                Workspace configuration and team management will appear here.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">Integrations</h3>
            </CardHeader>
            <CardBody>
              <p className="mt-2 text-sm text-slate-600">
                Connect Supabase, AI providers, and other services from this section.
              </p>
            </CardBody>
          </Card>

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
                onClick={onSignOut}
                className="mt-4"
              >
                Sign out
              </Button>
            </CardBody>
          </Card>
        </div>
      </SectionContainer>
    </PageContainer>
  );
};

export default SettingsPage;
