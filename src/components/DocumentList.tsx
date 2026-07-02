import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowUpDown, Search, FileText, MoreVertical, Trash2, Share2, Download, RefreshCw, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { relativeTimeFrom } from '../lib/time';
import type { Document } from '../types/document';
import PipelineStatusDisplay from './PipelineStatusDisplay';
import { DocumentService } from '../services/documents/document.service';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardBody, CardFooter } from './ui/card';
import { Skeleton, SkeletonCard } from './ui/skeleton';
import { EmptyState } from './ui/empty-state';
import { Input } from './ui/input';

type SortKey = 'name' | 'status' | 'type' | 'createdAt';
type ViewMode = 'table' | 'grid';

interface DocumentListProps {
  documents: Document[];
  onRefresh: () => void;
  onViewDetails: (id: string) => void;
  isLoading?: boolean;
  defaultViewMode?: ViewMode;
  onUpload?: (file: File) => void;
  onDelete?: (id: string) => Promise<void>;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onRefresh,
  onViewDetails,
  isLoading = false,
  defaultViewMode = 'grid',
  onUpload,
  onDelete,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      setUploading(true);
      try {
        await onUpload(file);
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    }
  };

  const filtered = useMemo(() => {
    let data = [...documents];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((d) => d.name.toLowerCase().includes(q));
    }
    if (statusFilter) {
      data = data.filter((d) => d.status === statusFilter);
    }
    data.sort((a, b) => {
      let aVal: any = a[sortKey];
      let bVal: any = b[sortKey];
      if (sortKey === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [documents, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const formatCreatedDate = (date: Date | string) =>
    (() => {
      try {
        const d = date instanceof Date ? date : new Date(date as string);
        if (Number.isNaN(d.getTime())) return '—';
        return d.toLocaleDateString();
      } catch {
        return '—';
      }
    })();

  const getDeleteLockReason = (status: Document['status']) => {
    if (status === 'processing') return 'Delete is unavailable while processing is running.';
    if (status === 'validating') return 'Delete is unavailable while validation is in progress.';
    return null;
  };

  const requestDelete = (id: string) => {
    setActionFeedback(null);
    setConfirmingDeleteId(id);
  };

  const cancelDelete = () => {
    setConfirmingDeleteId(null);
  };

  const handleRetry = async (doc: Document) => {
    setRetryingId(doc.id);
    setActionFeedback(null);
    try {
      const { PipelineOrchestrator } = await import('../services/documents/orchestrator.service');
      const { user } = useAuth();
      const userId = user?.id || doc.userId;
      await PipelineOrchestrator.runPipeline({} as any, doc.id, userId);
      setActionFeedback({ type: 'success', message: 'Retrying processing…' });
      onRefresh();
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: `Retry failed: ${err.message}` });
    } finally {
      setRetryingId(null);
    }
  };

  const showErrorTooltip = (doc: Document) => {
    const err = (doc.metadata as any)?.extractionError || (doc.metadata as any)?.pipelineError;
    const attempts = (doc.metadata as any)?.failoverAttempts;
    const details: string[] = [];
    if (err) details.push(String(err));
    if (Array.isArray(attempts) && attempts.length) details.push(`Attempts: ${attempts.map((a: any) => `${a.provider}:${a.error}`).join('; ')}`);
    return details.join(' — ') || 'No detailed error available';
  };

  const handleDelete = async (id: string, name: string) => {
    setDeletingId(id);
    setActionFeedback(null);
    try {
      if (onDelete) {
        await onDelete(id);
      } else {
        const { error } = await DocumentService.deleteDocument(null, id);
        if (error) {
          setActionFeedback({ type: 'error', message: `Could not delete "${name}": ${error.message}` });
          setConfirmingDeleteId(id);
          setDeletingId(null);
          return;
        }
      }
      setActionFeedback({ type: 'success', message: `Deleted "${name}".` });
      setConfirmingDeleteId(null);
      onRefresh();
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: `Could not delete "${name}": ${err.message}` });
      setConfirmingDeleteId(id);
    }
    setDeletingId(null);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const renderActions = (doc: Document, mobile = false) => {
    const isConfirming = confirmingDeleteId === doc.id;
    const isDeleting = deletingId === doc.id;
    const isRetrying = retryingId === doc.id;
    const deleteLockReason = getDeleteLockReason(doc.status);
    const deleteLocked = Boolean(deleteLockReason);
    const canRetry = doc.status === 'failed';

    return (
      <div className={`space-y-2 ${mobile ? 'w-full' : 'min-w-[280px]'}`}>
        {isConfirming && !isDeleting && (
          <p className="text-xs font-medium text-rose-600">Delete permanently? This action cannot be undone.</p>
        )}
        {deleteLockReason && <p className="text-xs text-amber-700">{deleteLockReason}</p>}
        {isDeleting && (
          <p className="text-xs font-medium text-slate-600" aria-live="polite">
            Deleting document...
          </p>
        )}
        {isRetrying && (
          <p className="text-xs font-medium text-blue-600" aria-live="polite">
            Retrying...
          </p>
        )}

        <div className={`flex flex-wrap items-center ${mobile ? 'justify-end' : 'justify-end'} gap-2`}>
          <Button size="sm" variant="secondary" onClick={() => onViewDetails(doc.id)} disabled={isDeleting || isRetrying}>
            View
          </Button>
          {canRetry && !isConfirming && (
            <Button size="sm" variant="ghost" onClick={() => handleRetry(doc)} disabled={isDeleting || isRetrying} className="text-blue-700 hover:text-blue-800 hover:bg-blue-50">
              Retry
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/documents/${doc.id}`);
              setActionFeedback({ type: 'success', message: 'Link copied to clipboard.' });
            }}
            disabled={isDeleting || isRetrying}
            title="Copy document link"
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const data = { name: doc.name, type: doc.type, metadata: doc.metadata, createdAt: doc.createdAt };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${doc.name.replace(/\.[^.]+$/, '')}_data.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={isDeleting || isRetrying}
            title="Export extracted data"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          {isConfirming ? (
            <>
              <Button size="sm" variant="danger" onClick={() => handleDelete(doc.id, doc.name)} disabled={isDeleting || deleteLocked}>
                {isDeleting ? 'Deleting...' : 'Delete permanently'}
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelDelete} disabled={isDeleting}>
                Cancel
              </Button>
            </>
          ) : (
            <Button size="sm" variant="danger" onClick={() => requestDelete(doc.id)} disabled={isDeleting || deleteLocked} title={deleteLockReason ?? undefined}>
              Delete
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderSkeletonCard = (index: number) => (
    <Card key={index}>
      <CardBody>
        <div className="space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-10 w-full mt-3 rounded-xl" />
        <div className="flex items-center justify-end gap-2 mt-3">
          <Skeleton className="h-9 w-16 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-16 rounded-lg" />
        </div>
      </CardBody>
    </Card>
  );

  const renderEmptyState = () => (
    <EmptyState
      title={search || statusFilter ? 'No documents found' : 'No documents uploaded yet'}
      description={search || statusFilter ? 'Try adjusting your filters' : 'Upload a document to get started'}
      action={
        !search && !statusFilter && onUpload
          ? { label: 'Upload a document', onClick: triggerUpload, variant: 'primary' }
          : undefined
      }
    />
  );

  const filterBar = (
    <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex flex-col gap-3 sm:flex-1 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs sm:flex-1">
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search documents..."
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            title="Filter documents by status"
            aria-label="Filter documents by status"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none sm:w-auto sm:py-1.5"
          >
            <option value="">All statuses</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="validating">Validating</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
        <Button type="button" variant="ghost" size="sm" className="w-full sm:w-auto" onClick={onRefresh}>
          Refresh
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
        >
          {viewMode === 'grid' ? 'Table' : 'Grid'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        aria-label="Upload document"
        title="Upload document"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.csv,.txt,.doc,.docx,.xlsx,.pptx"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {actionFeedback && (
        <div role="alert" aria-live="polite" className={`mb-3 rounded-xl border px-4 py-2 text-sm ${
          actionFeedback.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
        }`}>
          {actionFeedback.message}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {filterBar}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Document</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Status & Pipeline</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4 align-top"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-6 py-4 align-top"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="px-6 py-4 align-top"><Skeleton className="h-10 w-full" /></td>
                    <td className="px-6 py-4 align-top"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4 text-right align-top">
                      <div className="ml-auto flex justify-end gap-2">
                        <Skeleton className="h-9 w-16 rounded-lg" />
                        <Skeleton className="h-9 w-20 rounded-lg" />
                        <Skeleton className="h-9 w-16 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden p-4 space-y-4">
            {Array.from({ length: 6 }).map((_, index) => renderSkeletonCard(index))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {filterBar}

          {pageData.length === 0 ? (
            renderEmptyState()
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">
                      <button type="button" onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-slate-700">
                        Document <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-2.5 font-medium">Type</th>
                    <th className="px-4 py-2.5 font-medium">Status & Pipeline</th>
                    <th className="px-4 py-2.5 font-medium">Date</th>
                    <th className="px-4 py-2.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
<tbody className="divide-y divide-slate-100">
                   {pageData.map((doc) => (
                      <tr key={doc.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50">
                       <td className="px-4 py-3 align-top">
                         <div className="flex items-center gap-3">
                           <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                             <FileText className="h-4 w-4 text-slate-500" />
                           </div>
                           <div className="min-w-0">
                             <p className="font-medium text-slate-900 truncate max-w-[36ch]" title={doc.name}>{doc.name}</p>
                             <p className="text-xs text-slate-400 mt-0.5">ID: {doc.id.slice(0, 8)}</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-4 py-3 align-top">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                            doc.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : doc.status === 'failed'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {doc.status === 'completed' ? <CheckCircle className="h-3.5 w-3.5 mr-1 text-emerald-700" /> : doc.status === 'failed' ? <AlertCircle className="h-3.5 w-3.5 mr-1 text-rose-700" /> : <RefreshCw className="h-3.5 w-3.5 mr-1 text-blue-700" />}
                            {doc.type}
                          </span>
                       </td>
<td className="px-4 py-3 align-top">
                          <div className="min-w-[160px] md:min-w-[200px]">
                            {doc.metadata?.extractionAttempted && !doc.metadata?.lastExtractionError ? (
                              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                                completed
                              </span>
                            ) : doc.status === 'completed' ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 border-amber-200">
                                  stored
                                </span>
                                <p className="text-xs text-slate-500">Ready for AI processing</p>
                              </div>
                            ) : doc.status === 'failed' ? (
                              <span title={showErrorTooltip(doc)} className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-rose-50 text-rose-700 border-rose-200">
                                <AlertCircle className="h-3.5 w-3.5 mr-1" /> failed
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                                {doc.status}
                              </span>
                            )}
                          </div>
                        </td>
<td className="px-4 py-3 text-sm text-slate-500 align-top">
                          {doc.createdAt ? formatCreatedDate(doc.createdAt) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right align-top">
                          <div className="flex items-center justify-end gap-2">
                            {doc.status === 'failed' && (
                              <Button size="sm" variant="ghost" onClick={() => handleRetry(doc)} disabled={retryingId === doc.id}>
                                {retryingId === doc.id ? 'Retrying…' : 'Retry'}
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => onViewDetails(doc.id)} title="Preview document">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => onViewDetails(doc.id)}>
                              View
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => requestDelete(doc.id)}
                              title="Delete document"
                              disabled={getDeleteLockReason(doc.status) !== null}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pageData.map((doc) => (
                <Card key={doc.id} className="flex flex-col h-full">
                  <CardHeader className="pb-3">
                    <div className="space-y-2">
                      <h4 className="truncate text-sm font-semibold text-slate-900" title={doc.name}>
                        {doc.name}
                      </h4>
                      <div className="flex items-center gap-3 justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                          doc.status === 'completed' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : doc.status === 'failed'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {doc.status}
                        </span>
                        </div>
                        <span className="text-slate-500 text-xs" title={doc.createdAt ? new Date(doc.createdAt).toISOString() : ''}>{doc.createdAt ? relativeTimeFrom(doc.createdAt).label : '—'}</span>
                      </div>
                    </div>
                  </CardHeader>
<CardBody className="flex-1 pt-0 pb-3">
                    {doc.metadata?.extractionAttempted && !doc.metadata?.lastExtractionError ? (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500">Type: {doc.type}</p>
                      </div>
                    ) : doc.status === 'completed' ? (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500">Type: {doc.type}</p>
                        <p className="text-xs text-amber-600">AI: Pending</p>
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-slate-500">Type: {doc.type}</p>
                    )}
                  </CardBody>
                  <div className="px-4 pb-4">
                    {renderActions(doc, true)}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500 text-center sm:text-left">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center justify-center gap-1 sm:justify-end">
                <Button type="button" size="sm" variant="secondary" className="px-3" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && page > 3) pageNum = page - 2 + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <Button key={pageNum} type="button" size="sm" variant={page === pageNum ? 'primary' : 'secondary'} className="px-3" onClick={() => setPage(pageNum)}>
                      {pageNum}
                    </Button>
                  );
                })}
                <Button type="button" size="sm" variant="secondary" className="px-3" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
