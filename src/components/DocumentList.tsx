import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Search, FileText } from 'lucide-react';
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
  onUploadClick?: () => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onRefresh,
  onViewDetails,
  isLoading = false,
  defaultViewMode = 'grid',
  onUploadClick,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 8;

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
    (date instanceof Date ? date : new Date(date)).toLocaleDateString();

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

  const handleDelete = async (id: string, name: string) => {
    setDeletingId(id);
    setActionFeedback(null);
    const { error } = await DocumentService.deleteDocument({} as any, id);

    if (error) {
      setActionFeedback({ type: 'error', message: `Could not delete "${name}": ${error.message}` });
      setConfirmingDeleteId(id);
    } else {
      setActionFeedback({ type: 'success', message: `Deleted "${name}".` });
      setConfirmingDeleteId(null);
      onRefresh();
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
    const deleteLockReason = getDeleteLockReason(doc.status);
    const deleteLocked = Boolean(deleteLockReason);

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

        <div className={`flex flex-wrap items-center ${mobile ? 'justify-end' : 'justify-end'} gap-2`}>
          <Button size="sm" variant="secondary" onClick={() => onViewDetails(doc.id)} disabled={isDeleting}>
            View
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
        !search && !statusFilter && onUploadClick
          ? { label: 'Upload a document', onClick: onUploadClick }
          : undefined
      }
    />
  );

  const filterBar = (
    <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 max-w-xs">
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
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none"
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
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onRefresh}>
          Refresh
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
        >
          {viewMode === 'grid' ? 'Table' : 'Grid'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full">
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
            <div className="p-6">
              <EmptyState
                title={search || statusFilter ? 'No documents found' : 'No documents uploaded yet'}
                description={search || statusFilter ? 'Try adjusting your filters' : 'Upload a document to get started'}
                action={
                  !search && !statusFilter && onUploadClick
                    ? { label: 'Upload a document', onClick: onUploadClick }
                    : undefined
                }
              />
            </div>
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
                    <tr key={doc.id} className="transition-colors hover:bg-slate-50/80 group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-slate-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate max-w-xs" title={doc.name}>{doc.name}</p>
                            <p className="text-xs text-slate-500">ID: {doc.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <Badge variant="default">{doc.type}</Badge>
                      </td>
                      <td className="px-4 py-3 min-w-[320px] align-top">
                        <PipelineStatusDisplay documentId={doc.id} />
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 align-top">
                        {formatCreatedDate(doc.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right align-top">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" onClick={() => onViewDetails(doc.id)} aria-label="View details" className="h-8 w-8">
                            <FileText className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" aria-label="More" className="h-8 w-8">
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pageData.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader>
                    <div className="space-y-2">
                      <h4 className="max-w-[220px] truncate text-sm font-semibold text-slate-900" title={doc.name}>
                        {doc.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Badge variant={
                          doc.status === 'completed' ? 'success' : doc.status === 'failed' ? 'error' :
                          doc.status === 'processing' || doc.status === 'validating' || doc.status === 'pending' ? 'info' : 'default'
                        }>
                          {doc.type}
                        </Badge>
                        <span>{formatCreatedDate(doc.createdAt)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <PipelineStatusDisplay documentId={doc.id} />
                    {renderActions(doc, true)}
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button type="button" size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && page > 3) pageNum = page - 2 + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <Button key={pageNum} type="button" size="sm" variant={page === pageNum ? 'primary' : 'secondary'} onClick={() => setPage(pageNum)}>
                      {pageNum}
                    </Button>
                  );
                })}
                <Button type="button" size="sm" variant="secondary" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
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
