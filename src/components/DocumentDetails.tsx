import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [savingStage, setSavingStage] = useState<'idle' | 'saving' | 'revalidating'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadDocument = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await DocumentService.getDocumentById({} as any, documentId);

    if (error) {
      setLoadError(error.message || 'Unable to load document details.');
      setDocument(null);
      setLoading(false);
      return;
    }

    if (!data) {
      setDocument(null);
      setLoading(false);
      return;
    }

    setDocument(data);
    setEditedData(data.metadata?.extractedData || {});
    setLoading(false);
  }, [documentId]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const handleSave = async () => {
    if (!document) return;
    setSaveError(null);
    setSavingStage('saving');
    
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
      setSaveError(`Failed to save corrections: ${error.message}`);
      setSavingStage('idle');
      return;
    }

    setSavingStage('revalidating');
    const { error: validationError } = await ValidateService.validateData({} as any, documentId, correctedData);
    if (validationError) {
      setSaveError(`Saved, but revalidation failed: ${validationError.message}`);
      setSavingStage('idle');
      return;
    }

    await loadDocument();
    setIsEditing(false);
    setSavingStage('idle');
  };

  const baseExtractedData = document?.metadata?.extractedData || {};
  const hasPendingChanges = useMemo(
    () => JSON.stringify(editedData) !== JSON.stringify(baseExtractedData),
    [editedData, baseExtractedData]
  );
  const isSaving = savingStage !== 'idle';
  const suggestions = document?.metadata?.validationSuggestions || [];

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <div className="h-3 w-16 animate-pulse rounded-full bg-slate-200" />
              <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200" />
            </div>
            <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-slate-100" />
          </div>

          <div className="space-y-8">
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-5 w-44 animate-pulse rounded-full bg-slate-200" />
              <div className="h-24 w-full animate-pulse rounded-2xl bg-slate-100" />
            </section>

            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-5 w-36 animate-pulse rounded-full bg-slate-200" />
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
                <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-100" />
                <div className="h-4 w-4/6 animate-pulse rounded-full bg-slate-100" />
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="text-sm font-semibold text-rose-800">Could not load document</p>
          <p className="mt-1 text-sm text-rose-700">{loadError}</p>
          <button
            onClick={loadDocument}
            className="mt-4 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-slate-800">Document not found</p>
          <p className="mt-1 text-sm text-slate-600">The document may have been removed or is unavailable.</p>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-rose-900">Extraction issue</h3>
                {document.metadata?.failedProvider && (
                  <span className="rounded-full border border-rose-200 bg-white px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-rose-700">
                    {document.metadata.failedProvider}
                  </span>
                )}
              </div>
              <p className="text-sm text-rose-800">
                Extraction produced an error. You can still review and edit fields manually below.
              </p>
              <div className="overflow-x-auto rounded-lg border border-rose-100 bg-white/70 p-3 font-mono text-xs whitespace-pre-wrap text-rose-900">
                {document.metadata.lastExtractionError}
              </div>
            </section>
          )}

          {/* Validation Suggestions Section (Task 8.3) */}
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
                  onClick={() => {
                    setEditedData(document.metadata?.extractedData || {});
                    setSaveError(null);
                    setIsEditing(true);
                  }}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50 hover:text-blue-800"
                >
                  Edit fields
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setSaveError(null);
                      setEditedData(document.metadata?.extractedData || {});
                    }}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSaving || !hasPendingChanges}
                  >
                    {savingStage === 'saving' ? 'Saving…' : savingStage === 'revalidating' ? 'Revalidating…' : 'Save changes'}
                  </button>
                </div>
              )}
            </div>

            {isEditing && suggestions.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Validation suggestions</p>
                <ul className="mt-2 space-y-1 text-sm text-amber-900">
                  {suggestions.map((suggestion: string, index: number) => (
                    <li key={index}>{index + 1}. {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {isEditing && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                {isSaving
                  ? savingStage === 'saving'
                    ? 'Saving your corrections…'
                    : 'Corrections saved. Re-running validation and refreshing data…'
                  : hasPendingChanges
                    ? 'You have unsaved changes.'
                    : 'No changes to save yet.'}
              </div>
            )}

            {saveError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                {saveError}
              </div>
            )}
            
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
                        placeholder={`Enter ${key.replace(/([A-Z_])/g, ' $1').replace(/_/g, ' ').toLowerCase()}`}
                        value={String(data.value ?? '')}
                        disabled={isSaving}
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
                        {String(data.value ?? '—')}
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