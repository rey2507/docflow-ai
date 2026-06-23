import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { ReportService } from '../services/reports/report.service';
import type { Document } from '../types/document';
import DocumentDetails from './DocumentDetails';
import DashboardOverview from './DashboardOverview';
import RecentDocumentsTable from './RecentDocumentsTable';
import WorkflowActivity from './WorkflowActivity';
import AIInsights from './AIInsights';
import { UploadZone, QuickActions } from './QuickActions';

type Page = 'dashboard' | 'documents' | 'upload' | 'workflows' | 'chat' | 'reports' | 'settings';

interface MainDashboardProps {
  userId: string;
  onNavigate: (page: Page) => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ userId, onNavigate }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState({ total: 0, processing: 0, completed: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchStats = useCallback(async () => {
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
    setLoading(true);
    setFetchError('');
    try {
      const { data, count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact' })
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

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
    fetchStats();
    fetchDocuments();
  }, [fetchStats, fetchDocuments]);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const { DocumentUploadService } = await import('../services/documents/upload.service');
      const { data, error } = await DocumentUploadService.uploadDocument({} as any, supabase, file, userId);
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

  if (selectedDocumentId) {
    return <DocumentDetails documentId={selectedDocumentId} onBack={() => setSelectedDocumentId(null)} />;
  }

  return (
    <div className="space-y-6">
      <DashboardOverview
        stats={stats}
        aiUsage={{ used: 847, limit: 1000 }}
        memberCount={1}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UploadZone onUpload={handleFileUpload} uploading={uploading} />
            <QuickActions onUpload={() => onNavigate('upload')} onNavigate={onNavigate} />
          </div>

          <RecentDocumentsTable
            documents={documents}
            loading={loading}
            onViewDetails={setSelectedDocumentId}
            onRefresh={() => { fetchStats(); fetchDocuments(); }}
          />
        </div>

        <div className="space-y-6">
          <WorkflowActivity loading={loading} />
          <AIInsights
            usage={{ used: 847, limit: 1000 }}
            successRate={98.5}
            avgConfidence={0.87}
            failedCount={stats.failed}
          />
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
