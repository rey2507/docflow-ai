import React from 'react';
import AIInsights from '../components/AIInsights';
import { PageContainer, SectionContainer } from '../components/ui/layout';
import { useAuth } from '../contexts/AuthContext';
import { useAIInsights } from '../hooks/useAIInsights';
import { Card, CardBody } from '../components/ui/card';

const AIInsightsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const { data, isLoading, error } = useAIInsights(user?.id || '');

  if (loading || isLoading) {
    return (
      <PageContainer variant="narrow">
        <SectionContainer spacing="md">
          <Card>
            <CardBody>
              <p className="text-sm text-slate-500">Loading AI insights…</p>
            </CardBody>
          </Card>
        </SectionContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <SectionContainer spacing="md">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">AI Insights</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Model usage and performance</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Track monthly usage, success rate, confidence, and failures in one focused view.
            </p>
          </div>
        </SectionContainer>

        <SectionContainer spacing="md">
          {error ? (
            <Card>
              <CardBody>
                <p className="text-sm text-rose-600">Unable to load AI insights right now.</p>
              </CardBody>
            </Card>
          ) : (
            <AIInsights
              usage={data?.usage || { used: 0, limit: 2000 }}
              successRate={data?.successRate || 0}
              avgConfidence={data?.avgConfidence || 0}
              failedCount={data?.failedCount || 0}
            />
          )}
        </SectionContainer>
      </div>
    </PageContainer>
  );
};

export default AIInsightsPage;
