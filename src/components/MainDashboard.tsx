import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { ReportService } from '../services/reports/report.service';
import type { Document } from '../types/document';
import DocumentList from './DocumentList';
import DocumentDetails from './DocumentDetails';

interface DashboardStats {
  total: number;
  processing: number;
  completed: number;
  failed: number;
}

interface MainDashboardProps {
  userId: string;
  onNavigate?: (page: string) => void;
}

const ITEMS_PER_PAGE = 10;

const MainDashboard: React.FC<MainDashboardProps> = ({ userId, onNavigate }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ total: 0, processing: 0, completed: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [providerFilter, setProviderFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const hasActiveFilters = search !== '' || statusFilter !== '' || typeFilter !== '' || providerFilter !== '';

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
    setProviderFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

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
      let query = supabase
        .from('documents')
        .select('*', { count: 'exact' })
        .eq('userId', userId);

      if (search) query = query.ilike('name', '%' + search + '%');
      if (statusFilter) query = query.eq('status', statusFilter);
      if (typeFilter) query = query.eq('type', typeFilter);
      if (providerFilter) query = query.filter('metadata->>aiProvider', 'eq', providerFilter);

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;
      setDocuments((data as Document[]) || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setFetchError(err instanceof Error ? err.message : 'Unable to load documents right now.');
    } finally {
      setLoading(false);
    }
  }, [userId, page, search, statusFilter, typeFilter, providerFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchStats();
    fetchDocuments();
  }, [fetchStats, fetchDocuments]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (selectedDocumentId) {
    return (
      <DocumentDetails documentId={selectedDocumentId} onBack={() => setSelectedDocumentId(null)} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace dashboard</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Documents</h2>
          <p className="mt-1 text-sm text-slate-600">Review processing status, filter the queue, and open a document when you need details.</p>
        </div>
        <div className="flex gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate('upload')}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Upload
            </button>
          )}
          <div className="text-sm text-slate-500 self-center">
            Showing {documents.length} of {totalCount} documents
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-900', bg: 'bg-white', hint: 'All documents in the workspace' },
          { label: 'Processing', value: stats.processing, color: 'text-blue-700', bg: 'bg-blue-50', hint: 'Pending, processing, or validating' },
          { label: 'Completed', value: stats.completed, color: 'text-emerald-700', bg: 'bg-emerald-50', hint: 'Ready for review or export' },
          { label: 'Failed', value: stats.failed, color: 'text-rose-700', bg: 'bg-rose-50', hint: 'Needs attention or retry' },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} rounded-2xl border border-slate-200 p-5 shadow-sm`}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
            <p className={`text-3xl font-bold mt-1 ${item.color}`}>{item.value}</p>
            <p className="mt-2 text-sm text-slate-600">{item.hint}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <input
              type="text"
              placeholder="Search documents"
              aria-label="Search documents by filename"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <select
            aria-label="Filter by document status"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="validating">Validating</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          <select
            aria-label="Filter by document type"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          >
            <option value="">All types</option>
            <option value="invoice">Invoice</option>
            <option value="image">Image</option>
            <option value="spreadsheet">Spreadsheet</option>
            <option value="other">Other</option>
          </select>

          <select
            aria-label="Filter by AI provider"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            value={providerFilter}
            onChange={(e) => { setProviderFilter(e.target.value); setPage(1); }}
          >
            <option value="">All AI providers</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-medium text-slate-500">Sort by</span>
            <button
              onClick={() => setSortBy('createdAt')}
              className={'rounded-full px-3 py-1.5 transition hover:bg-slate-100 hover:text-blue-700 ' + (sortBy === 'createdAt' ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600')}
            >
              Date
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={'rounded-full px-3 py-1.5 transition hover:bg-slate-100 hover:text-blue-700 ' + (sortBy === 'name' ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600')}
            >
              Name
            </button>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-blue-700"
            >
              <span aria-hidden="true">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              <span className="sr-only">Toggle sort direction</span>
            </button>
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters && sortBy === 'createdAt' && sortOrder === 'desc'}
              className="rounded-full px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reset filters
            </button>
          </div>
          <div className="text-slate-500">
            {page > 1 ? 'Page ' + page + ' of ' + totalPages : 'First page'}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center text-slate-500 shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-slate-200" />
            <p className="font-medium text-slate-700">Loading documents</p>
            <p className="mt-1 text-sm text-slate-500">Fetching the latest document queue and status updates.</p>
          </div>
        ) : fetchError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 shadow-sm">
            <p className="font-semibold text-rose-900">Unable to load documents</p>
            <p className="mt-1 text-sm text-rose-800">{fetchError}</p>
            <button
              type="button"
              onClick={() => { fetchStats(); fetchDocuments(); }}
              className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        ) : documents.length === 0 && hasActiveFilters ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-base font-semibold text-slate-900">No documents match these filters.</p>
            <p className="mt-2 text-sm text-slate-500">
              Clear the current search or filters to return to the full queue.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Reset filters
            </button>
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-base font-semibold text-slate-900">No documents yet.</p>
            <p className="mt-2 text-sm text-slate-500">
              When documents arrive, they will appear here with processing status and review actions.
            </p>
          </div>
        ) : (
          <DocumentList
            documents={documents}
            onRefresh={() => { fetchStats(); fetchDocuments(); }}
            onViewDetails={(id) => setSelectedDocumentId(id)}
          />
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={'h-10 min-w-10 rounded-xl border px-3 text-sm font-medium transition ' + (page === p ? 'border-blue-600 bg-blue-600 text-white shadow-sm' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50')}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;
