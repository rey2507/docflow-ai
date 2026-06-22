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
      const { data, error } = await DocumentService.getDocumentById({} as any, documentId);
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

    // DocumentService expects (db, documentId, metadata)
    const { error } = await DocumentService.updateMetadata({} as any, documentId, updatedMetadata);

    if (error) {
      alert('Failed to save corrections: ' + error.message);
    } else {
      // Rerun validation as per Task 7.5 requirements
      // ValidateService expects (db, documentId, extractedData)
      // In UI layer we only re-trigger validation via the backend pipeline.
  await ValidateService.validateData({} as any, documentId, correctedData);

      // Refresh local state to reflect updated status and metadata
  const { data } = await DocumentService.getDocumentById({} as any, documentId);
      if (data) setDocument(data);
      setIsEditing(false);
    }
    setSaving(false);
  };

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-12 text-center text-slate-500">Loading document details…</div>;
  if (!document) return <div className="mx-auto max-w-7xl px-4 py-12 text-center text-rose-600">Document not found.</div>;

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-50';
    if (score >= 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button onClick={onBack} className="flex items-center text-sm font-medium text-slate-500 transition hover:text-slate-700">
          <span className="mr-1">←</span> Back to Dashboard
        </button>
        <div className="flex space-x-2">
           {/* Placeholder for future actions like 'Edit' or 'Export' */}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column: Preview */}
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Preview</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">Document preview</h3>
          </div>
          <FilePreview 
            storagePath={document.storagePath} 
            fileType={document.type} 
            fileName={document.name} 
          />
        </div>

        {/* Right Column: Data & Status */}
        <div className="space-y-8">
          {/* Status Section */}
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900">Processing status</h3>
            <PipelineStatusDisplay documentId={document.id} />
          </section>

          {/* Error Details Section for Debugging (Task 8.2) */}
          {document.metadata?.lastExtractionError && (
            <section className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
              <div className="flex items-center space-x-2 text-rose-800">
                <span className="text-xl">⚠️</span>
                <h3 className="text-lg font-semibold">Extraction error details</h3>
              </div>
              <div className="space-y-2 text-sm text-rose-900">
                <div>
                  <p className="font-semibold">Last failed provider: <span className="uppercase">{document.metadata?.failedProvider}</span></p>
                  <div className="mt-1 overflow-x-auto rounded-lg border border-rose-100 bg-white/60 p-3 font-mono text-xs whitespace-pre-wrap">
                    {document.metadata.lastExtractionError}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Validation Suggestions Section (Task 8.3) */}
          {document.metadata?.validationSuggestions && document.metadata.validationSuggestions.length > 0 && (
            <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <div className="flex items-center space-x-2 text-amber-800">
                <span className="text-xl">💡</span>
                <h3 className="text-lg font-semibold">AI suggestions</h3>
              </div>
              <ul className="list-inside list-disc space-y-1 text-sm text-amber-900">
                {document.metadata.validationSuggestions.map((suggestion: string, index: number) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Extracted Data Section */}
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-slate-900">Extracted data</h3>
                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium capitalize text-blue-700">
                  AI: {document.metadata?.aiProvider} ({document.metadata?.aiModel})
                </span>
              </div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50 hover:text-blue-800"
                >
                  Edit fields
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button 
                    onClick={() => { setIsEditing(false); setEditedData(document.metadata?.extractedData || {}); }}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                    disabled={saving}
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              )}
            </div>
            
            {Object.keys(editedData).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {Object.entries(editedData).map(([key, data]: [string, any]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
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
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        value={String(data.value ?? '')}
                        onChange={(e) => setEditedData({ 
                          ...editedData, 
                          [key]: { ...data, value: e.target.value } 
                        })}
                      />
                    ) : (
                      <p className={cn(
                        "rounded-lg border border-transparent p-2 text-sm font-medium",
                        data.confidence < 0.7 ? "border-rose-100 bg-rose-50 text-rose-900" : "bg-slate-50 text-slate-900"
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
{(document.createdAt instanceof Date ? document.createdAt : new Date(document.createdAt)).toLocaleString()}

              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
{(document.updatedAt instanceof Date ? document.updatedAt : new Date(document.updatedAt)).toLocaleString()}

              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetails;