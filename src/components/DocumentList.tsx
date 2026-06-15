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
    
    const { error } = await DocumentService.deleteDocument(id);
    if (error) {
      alert(`Failed to delete document: ${error.message}`);
    } else {
      onRefresh();
    }
  };

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-sm border">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Filename</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Status & Pipeline</th>
              <th className="px-6 py-4 font-semibold">Created</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900 block truncate max-w-[200px]" title={doc.name}>
                    {doc.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 capitalize">{doc.type}</span>
                </td>
                <td className="px-6 py-4 min-w-[300px]">
                  <PipelineStatusDisplay documentId={doc.id} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(doc.createdAt as string).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => onViewDetails(doc.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleDelete(doc.id, doc.name)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
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
          <div key={doc.id} className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900 truncate max-w-[200px]">{doc.name}</h4>
                <p className="text-xs text-gray-500 capitalize">{doc.type} • {new Date(doc.createdAt as string).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => handleDelete(doc.id, doc.name)}
                className="p-1 text-red-400 hover:text-red-600"
              >
                🗑️
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