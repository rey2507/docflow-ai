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
  
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    // DocumentService expects (db, documentId)
    const { error } = await DocumentService.deleteDocument({} as any, id);

    if (error) {
      alert(`Failed to delete document: ${error.message}`);
    } else {
      onRefresh();
    }
  };

  return (
    <div className="w-full">
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
                <td className="px-6 py-4">
                  <span className="block max-w-[220px] truncate font-medium text-slate-900" title={doc.name}>
                    {doc.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                    {doc.type}
                  </span>
                </td>
                <td className="px-6 py-4 min-w-[320px] align-top">
                  <PipelineStatusDisplay documentId={doc.id} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {(doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => onViewDetails(doc.id)}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50 hover:text-blue-800"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleDelete(doc.id, doc.name)}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 hover:text-rose-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="max-w-[220px] truncate font-semibold text-slate-900">{doc.name}</h4>
                <p className="text-xs text-slate-500 capitalize">
                  {doc.type} • {(doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={() => handleDelete(doc.id, doc.name)}
                className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
                aria-label={`Delete ${doc.name}`}
              >
                Delete
              </button>
            </div>
            <PipelineStatusDisplay documentId={doc.id} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;