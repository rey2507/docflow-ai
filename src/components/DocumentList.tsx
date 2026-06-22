import React from 'react';
import type { Document } from '../types/document';
import PipelineStatusDisplay from './PipelineStatusDisplay';
import { DocumentService } from '../services/documents/document.service';

interface DocumentListProps {
  documents: Document[];
  onRefresh: () => void;
  onViewDetails: (id: string) => void;
}

/**
 * DocumentList Component (Task 7.2)
 * 
 * Provides a responsive list of documents with a table view for desktop
 * and a card-based view for mobile devices.
 */
const DocumentList: React.FC<DocumentListProps> = ({ documents, onRefresh, onViewDetails }) => {
  const [confirmingDeleteId, setConfirmingDeleteId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

    // DocumentService expects (db, documentId)
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
          <button
            onClick={() => onViewDetails(doc.id)}
            disabled={isDeleting}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            View
          </button>
          {isConfirming ? (
            <>
              <button
                onClick={() => handleDelete(doc.id, doc.name)}
                disabled={isDeleting || deleteLocked}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Delete permanently'}
              </button>
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => requestDelete(doc.id)}
              disabled={isDeleting || deleteLocked}
              title={deleteLockReason ?? undefined}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {actionFeedback && (
        <div
          role="alert"
          aria-live="polite"
          className={`mb-3 rounded-xl border px-4 py-2 text-sm ${
            actionFeedback.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {actionFeedback.message}
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Filename</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Status & Pipeline</th>
              <th className="px-6 py-4 font-semibold">Created</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <tr key={doc.id} className="transition-colors hover:bg-slate-50/80">
                <td className="px-6 py-4 align-top">
                  <span className="block max-w-[220px] truncate text-sm font-semibold text-slate-900" title={doc.name}>
                    {doc.name}
                  </span>
                </td>
                <td className="px-6 py-4 align-top">
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                    {doc.type}
                  </span>
                </td>
                <td className="px-6 py-4 min-w-[320px] align-top">
                  <PipelineStatusDisplay documentId={doc.id} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 align-top">
                  {formatCreatedDate(doc.createdAt)}
                </td>
                <td className="px-6 py-4 text-right align-top">
                  {renderActions(doc)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="space-y-2">
              <h4 className="max-w-[220px] truncate text-sm font-semibold text-slate-900" title={doc.name}>
                {doc.name}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 font-medium capitalize text-slate-700">
                  {doc.type}
                </span>
                <span>{formatCreatedDate(doc.createdAt)}</span>
              </div>
            </div>
            <PipelineStatusDisplay documentId={doc.id} />
            {renderActions(doc, true)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;