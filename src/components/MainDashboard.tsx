import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase/client';
import { ReportService } from '../services/reports/report.service';
import type { Document } from '../types/document';
import { useAuth } from '../contexts/AuthContext';
import DocumentDetails from './DocumentDetails';
import DashboardOverview from './DashboardOverview';
import DocumentList from './DocumentList';
import WorkflowActivity from './WorkflowActivity';
import AIInsights from './AIInsights';
import { UploadZone, QuickActions } from './QuickActions';
import { PageContainer, SectionContainer } from './ui/layout';

interface MainDashboardProps {
  onNavigate: (page: string) => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ onNavigate }) => {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState({ total: 0, processing: 0, completed: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await ReportService.getUserDocumentStats(userId);
    if (error || !data) return;
    const breakdown = data.breakdown;
    setStats({
      total: data.total,
      processing: (breakdown['processing'] || 0) + (breakdown['validating'] || 0) + (breakdown['pending'] || 0),
      completed: breakdown['completed'] || 0,
      failed: breakdown['failed'] || 0,
    });
  }, [userId]);

  const fetchDocuments = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setFetchError('');
    try {
      const { data, count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments((data as Document[]) || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setFetchError(err instanceof Error ? err.message : 'Unable to load documents right now.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!authLoading && userId) {
      fetchStats();
      fetchDocuments();
    }
  }, [fetchStats, fetchDocuments, authLoading, userId]);

  const handleFileUpload = async (file: File) => {
    if (!userId) {
      setFetchError('Unable to upload: user not authenticated');
      return;
    }
    setUploading(true);
    try {
      const { DocumentUploadService } = await import('../services/documents/upload.service');
      const { data, error } = await DocumentUploadService.uploadDocument(supabase, file, userId);
      if (error) {
        setFetchError(error.message || 'Upload failed');
      } else if (data) {
        fetchDocuments();
        fetchStats();
      }
    } catch (err: any) {
      setFetchError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageContainer>
      <SectionContainer spacing="md">
        <DashboardOverview stats={stats} />
      </SectionContainer>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionContainer spacing="md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UploadZone onUpload={handleFileUpload} uploading={uploading} />
              <QuickActions onUpload={handleFileUpload} onNavigate={onNavigate} uploading={uploading} />
            </div>

            <div className="mt-6">
              <DocumentList
                documents={documents}
                isLoading={loading}
                onViewDetails={setSelectedDocumentId}
                onRefresh={() => { fetchStats(); fetchDocuments(); }}
                onUpload={handleFileUpload}
                defaultViewMode="grid"
              />
            </div>
          </SectionContainer>
        </div>

        <div className="space-y-6">
          <SectionContainer spacing="md">
            <WorkflowActivity loading={loading} />
            <AIInsights />
          </SectionContainer>
        </div>
      </div>
    </PageContainer>
  );
};

export default MainDashboard;
