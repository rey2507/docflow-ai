import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { ReportService } from '../services/reports/report.service';
import type { Document, DocumentStatus, DocumentType } from '../types/document';
import PipelineStatusDisplay from './PipelineStatusDisplay';

interface DashboardStats {
  total: number;
  processing: number;
  completed: number;
  failed: number;
}

interface MainDashboardProps {
  userId: string;
}

const ITEMS_PER_PAGE = 10;

/**
 * MainDashboard Component
 * 
 * Implements Task 7.1: A comprehensive dashboard for managing documents
 * with stats, search, filtering, and pagination.
 */
const MainDashboard: React.FC<MainDashboardProps> = ({ userId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ total: 0, processing: 0, completed: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  // Filter and Sort State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [providerFilter, setProviderFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
    try {
      let query = supabase
        .from('documents')
        .select('*', { count: 'exact' })
        .eq('userId', userId);

      // Apply Filters
      if (search) query = query.ilike('name', `%${search}%`);
      if (statusFilter) query = query.eq('status', statusFilter);
      if (typeFilter) query = query.eq('type', typeFilter);
      if (providerFilter) query = query.filter('metadata->>aiProvider', 'eq', providerFilter);

      // Apply Sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply Pagination
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;
      setDocuments((data as Document[]) || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, page, search, statusFilter, typeFilter, providerFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchStats();
    fetchDocuments();
  }, [fetchStats, fetchDocuments]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-600', bg: 'bg-gray-50' },
          { label: 'Processing', value: stats.processing, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed', value: stats.completed, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Failed', value: stats.failed, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} p-6 rounded-xl border border-white shadow-sm`}>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{item.label}</p>
            <p className={`text-3xl font-bold mt-1 ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <input
              type="text"
              placeholder="Search by filename..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Status Filter */}
          <select
            className="px-4 py-2 border rounded-lg outline-none"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="validating">Validating</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          {/* Type Filter */}
          <select
            className="px-4 py-2 border rounded-lg outline-none"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Types</option>
            <option value="invoice">Invoice</option>
            <option value="image">Image</option>
            <option value="spreadsheet">Spreadsheet</option>
            <option value="other">Other</option>
          </select>

          {/* Provider Filter */}
          <select
            className="px-4 py-2 border rounded-lg outline-none"
            value={providerFilter}
            onChange={(e) => { setProviderFilter(e.target.value); setPage(1); }}
          >
            <option value="">All AI Providers</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>

        {/* Sorting Controls */}
        <div className="flex items-center justify-between pt-2 border-t text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Sort by:</span>
            <button 
              onClick={() => setSortBy('createdAt')}
              className={`hover:text-blue-600 ${sortBy === 'createdAt' ? 'font-bold text-blue-600' : ''}`}
            >
              Date
            </button>
            <button 
              onClick={() => setSortBy('name')}
              className={`hover:text-blue-600 ${sortBy === 'name' ? 'font-bold text-blue-600' : ''}`}
            >
              Name
            </button>
            <button 
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="flex items-center space-x-1 hover:text-blue-600"
            >
              <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
            </button>
          </div>
          <div>
            Showing {documents.length} of {totalCount} documents
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
            <p className="text-gray-500 font-medium">No documents found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {/* Simple Icon placeholder based on type */}
                      <span className="text-xl">📄</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 truncate max-w-xs">{doc.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 capitalize">{doc.type}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(doc.createdAt as string).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Mini Pipeline View */}
                  <div className="flex-1 max-w-md">
                    <PipelineStatusDisplay documentId={doc.id} />
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-lg border ${
                  page === p ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;