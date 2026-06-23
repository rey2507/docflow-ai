import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, MoreHorizontal, Eye, Trash2, Download, FileText } from 'lucide-react';
import type { Document } from '../types/document';

type SortKey = 'name' | 'status' | 'type' | 'createdAt';

interface RecentDocumentsTableProps {
  documents: Document[];
  loading?: boolean;
  onViewDetails: (id: string) => void;
  onRefresh: () => void;
}

const RecentDocumentsTable: React.FC<RecentDocumentsTableProps> = ({
  documents,
  loading = false,
  onViewDetails,
  onRefresh,
}) => {
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

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'processing':
      case 'validating':
      case 'pending':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'failed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getConfidenceColor = (confidence: number | null | undefined) => {
    if (!confidence && confidence !== 0) return 'text-slate-400';
    if (confidence >= 0.9) return 'text-emerald-600';
    if (confidence >= 0.7) return 'text-amber-600';
    return 'text-rose-600';
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-4">
              <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 flex items-center gap-2">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 flex-1 max-w-xs">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
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
        <button
          type="button"
          onClick={onRefresh}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-medium text-slate-500">
              <th className="px-4 py-2.5 font-medium">
                <button
                  type="button"
                  onClick={() => toggleSort('name')}
                  className="flex items-center gap-1 hover:text-slate-700"
                >
                  Document
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">
                <button
                  type="button"
                  onClick={() => toggleSort('status')}
                  className="flex items-center gap-1 hover:text-slate-700"
                >
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-2.5 font-medium">Confidence</th>
              <th className="px-4 py-2.5 font-medium hidden md:table-cell">Workflow</th>
              <th className="px-4 py-2.5 font-medium">
                <button
                  type="button"
                  onClick={() => toggleSort('createdAt')}
                  className="flex items-center gap-1 hover:text-slate-700"
                >
                  Date
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-2.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <p className="text-sm font-medium text-slate-900">No documents found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {search || statusFilter ? 'Try adjusting your filters' : 'Upload a document to get started'}
                  </p>
                </td>
              </tr>
            ) : (
              pageData.map((doc) => {
                const confidence = doc.metadata.extractedData
                  ? (() => {
                      const values = Object.values(doc.metadata.extractedData).filter((v: any) => v && typeof v.confidence === 'number');
                      if (values.length === 0) return null;
                      const sum = values.reduce((acc: number, v: any) => acc + v.confidence, 0);
                      return sum / values.length;
                    })()
                  : null;

                return (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate max-w-xs">{doc.name}</p>
                          <p className="text-xs text-slate-500">ID: {doc.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 capitalize">{doc.type}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusClass(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-xs font-medium ${getConfidenceColor(confidence)}`}>
                      {confidence !== null ? `${Math.round(confidence * 100)}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs hidden md:table-cell">
                      {doc.status === 'completed'
                        ? 'Finalized'
                        : doc.status === 'failed'
                        ? 'Failed'
                        : 'In progress'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(doc.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onViewDetails(doc.id)}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          aria-label="View details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Download"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && page > 3) pageNum = page - 2 + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`h-8 min-w-8 rounded-md border px-2 text-xs font-medium transition ${
                    page === pageNum
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentDocumentsTable;
