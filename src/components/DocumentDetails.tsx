import React, { useEffect, useState } from 'react';
import { DocumentService } from '../services/documents/document.service';
import { ValidateService } from '../services/documents/validate.service';
import type { Document } from '../types/document';
import { cn } from '../lib/utils';
import FilePreview from './FilePreview';
import PipelineStatusDisplay from './PipelineStatusDisplay';

interface DocumentDetailsProps {
  documentId: string;
  onBack: () => void;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({ documentId, onBack }) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchDoc() {
      setLoading(true);
      const { data, error } = await DocumentService.getDocumentById(documentId);
      if (!error && data) {
        setDocument(data);
        setEditedData(data.metadata?.extractedData || {});
      }
      setLoading(false);
    }
    fetchDoc();
  }, [documentId]);

  const handleSave = async () => {
    if (!document) return;
    setSaving(true);
    
    // When saving manual corrections, we update values and set confidence to 1.0
    const correctedData = { ...editedData };
    Object.keys(correctedData).forEach(key => {
      correctedData[key] = {
        ...correctedData[key],
        confidence: 1.0,
      };
    });

    const updatedMetadata = {
      ...document.metadata,
      extractedData: correctedData,
      manuallyCorrected: true,
      correctedAt: new Date().toISOString(),
    };

    const { error } = await DocumentService.updateMetadata(documentId, updatedMetadata);
    
    if (error) {
      alert('Failed to save corrections: ' + error.message);
    } else {
      // Rerun validation as per Task 7.5 requirements
      await ValidateService.validateData(documentId, correctedData);
      
      // Refresh local state to reflect updated status and metadata
      const { data } = await DocumentService.getDocumentById(documentId);
      if (data) setDocument(data);
      setIsEditing(false);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
  if (!document) return <div className="p-8 text-center text-red-500">Document not found.</div>;

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-50';
    if (score >= 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center text-sm text-gray-500 hover:text-gray-700">
          <span className="mr-1">←</span> Back to Dashboard
        </button>
        <div className="flex space-x-2">
           {/* Placeholder for future actions like 'Edit' or 'Export' */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Document Preview</h3>
          <FilePreview 
            storagePath={document.storagePath} 
            fileType={document.type} 
            fileName={document.name} 
          />
        </div>

        {/* Right Column: Data & Status */}
        <div className="space-y-8">
          {/* Status Section */}
          <section className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Processing Status</h3>
            <PipelineStatusDisplay documentId={document.id} />
          </section>

          {/* Error Details Section for Debugging (Task 8.2) */}
          {document.metadata?.lastExtractionError && (
            <section className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-red-800">
                <span className="text-xl">⚠️</span>
                <h3 className="text-lg font-bold">Extraction Error Details</h3>
              </div>
              <div className="text-sm text-red-900 space-y-2">
                <div>
                  <p className="font-semibold">Last Failed Provider: <span className="uppercase">{document.metadata?.failedProvider}</span></p>
                  <div className="mt-1 bg-white/50 p-3 rounded border border-red-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                    {document.metadata.lastExtractionError}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Validation Suggestions Section (Task 8.3) */}
          {document.metadata?.validationSuggestions && document.metadata.validationSuggestions.length > 0 && (
            <section className="bg-amber-50 p-6 rounded-xl border border-amber-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-amber-800">
                <span className="text-xl">💡</span>
                <h3 className="text-lg font-bold">AI Suggestions</h3>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-amber-900">
                {document.metadata.validationSuggestions.map((suggestion: string, index: number) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Extracted Data Section */}
          <section className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-bold text-gray-900">Extracted Data</h3>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded capitalize font-medium">
                  AI: {document.metadata?.aiProvider} ({document.metadata?.aiModel})
                </span>
              </div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit Fields
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button 
                    onClick={() => { setIsEditing(false); setEditedData(document.metadata?.extractedData || {}); }}
                    className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="text-sm text-green-600 hover:text-green-800 font-medium"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
            
            {Object.keys(editedData).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {Object.entries(editedData).map(([key, data]: [string, any]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                        {key.replace(/([A-Z_])/g, ' $1').replace(/_/g, ' ')}
                      </label>
                      {data.confidence !== undefined && (
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                          getConfidenceColor(data.confidence)
                        )}>
                          {Math.round(data.confidence * 100)}%
                        </span>
                      )}
                    </div>
                    {isEditing ? (
                      <input 
                        className="w-full text-sm text-gray-900 font-medium bg-white border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={String(data.value ?? '')}
                        onChange={(e) => setEditedData({ 
                          ...editedData, 
                          [key]: { ...data, value: e.target.value } 
                        })}
                      />
                    ) : (
                      <p className={cn(
                        "text-sm font-medium p-2 rounded border border-transparent",
                        data.confidence < 0.7 ? "bg-red-50 text-red-900 border-red-100" : "bg-gray-50 text-gray-900"
                      )}>
                        {String(data.value ?? '')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm italic py-4">No data extracted yet or extraction failed.</p>
            )}
          </section>

          {/* Metadata & Details */}
          <section className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Document Info</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">File Name</p>
                <p className="font-medium truncate" title={document.name}>{document.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Document Type</p>
                <p className="font-medium capitalize">{document.type}</p>
              </div>
              <div>
                <p className="text-gray-500">Uploaded On</p>
                <p className="font-medium">{new Date(document.createdAt as string).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p className="font-medium">{new Date(document.updatedAt as string).toLocaleString()}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetails;