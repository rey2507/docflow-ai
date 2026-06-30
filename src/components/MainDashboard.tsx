import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DocumentDetails from './DocumentDetails';
import DashboardOverview from './DashboardOverview';
import DocumentList from './DocumentList';
import WorkflowActivity from './WorkflowActivity';
import { UploadZone, QuickActions } from './QuickActions';
import { SectionContainer } from './ui/layout';
import { useDocuments, useDeleteDocument, useUploadDocument } from '../hooks/useDocuments';
import { useStats } from '../hooks/useStats';
import { loadSettings } from '../lib/settings';

interface MainDashboardProps {
  onNavigate: (page: string) => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ onNavigate }) => {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: documents = [], isLoading: documentsLoading, refetch: refetchDocuments } = useDocuments(userId || '');
  const { data: statsData, refetch: refetchStats } = useStats(userId || '');
  const deleteDocument = useDeleteDocument();

  const stats = statsData
    ? {
        total: statsData.total,
        processing: (statsData.breakdown['processing'] || 0) + (statsData.breakdown['validating'] || 0) + (statsData.breakdown['pending'] || 0),
        completed: statsData.breakdown['completed'] || 0,
        failed: statsData.breakdown['failed'] || 0,
      }
    : { total: 0, processing: 0, completed: 0, failed: 0 };

  const uploadDocument = useUploadDocument();
  const defaultDocumentView = loadSettings().defaultDocumentView;

  const handleFileUpload = async (file: File) => {
    if (!userId) return;
    setUploading(true);
    try {
      await uploadDocument.mutateAsync({ file, userId });
    } catch (err: any) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    await deleteDocument.mutateAsync(documentId);
    refetchStats();
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <SectionContainer spacing="md">
        <DashboardOverview stats={stats} />
      </SectionContainer>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-6 lg:p-7">
            <SectionContainer spacing="md">
              <div className="grid grid-cols-1 gap-4">
                <UploadZone onUpload={handleFileUpload} uploading={uploading} />
                <QuickActions onUpload={handleFileUpload} onNavigate={onNavigate} uploading={uploading} />
              </div>

              <div className="mt-6">
                <DocumentList
                  documents={documents}
                  isLoading={documentsLoading}
                  onViewDetails={setSelectedDocumentId}
                  onRefresh={() => { refetchDocuments(); refetchStats(); }}
                  onUpload={handleFileUpload}
                  onDelete={handleDelete}
                  defaultViewMode={defaultDocumentView}
                />
              </div>
            </SectionContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-6 lg:p-7">
            <SectionContainer spacing="md">
              <WorkflowActivity loading={documentsLoading} />
            </SectionContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
