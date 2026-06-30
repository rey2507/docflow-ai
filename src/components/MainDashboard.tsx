import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DocumentDetails from './DocumentDetails';
import DashboardOverview from './DashboardOverview';
import DocumentList from './DocumentList';
import WorkflowActivity from './WorkflowActivity';
import { UploadZone, QuickActions } from './QuickActions';
import { PageContainer, SectionContainer } from './ui/layout';
import { useDocuments, useDeleteDocument, useUploadDocument } from '../hooks/useDocuments';
import { useStats } from '../hooks/useStats';

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
    <PageContainer>
      <div className="space-y-6">
        <SectionContainer spacing="md">
          <DashboardOverview stats={stats} />
        </SectionContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
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
                  defaultViewMode="grid"
                />
              </div>
            </SectionContainer>
          </div>

          <div className="space-y-6">
            <SectionContainer spacing="md">
              <WorkflowActivity loading={documentsLoading} />
            </SectionContainer>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default MainDashboard;
