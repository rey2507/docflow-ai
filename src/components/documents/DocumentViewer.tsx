import React from 'react';

export default function DocumentViewer({ document, signedUrl, textPreview }: { document: any; signedUrl?: string; textPreview?: string }) {
  const mime = document?.metadata?.mimeType || '';

  // PDF viewer
  if (mime === 'application/pdf' && signedUrl) {
    return (
      <iframe title={document.name} src={signedUrl} className="w-full h-full border rounded-md" />
    );
  }

  // Images
  if (mime.startsWith('image/') && signedUrl) {
    return <img src={signedUrl} alt={document.name} className="max-h-full w-full object-contain rounded-md" />;
  }

  // Office docs (doc, docx, pptx) - use Google Docs viewer as a fallback when signed URL is available
  if ((mime.includes('word') || document.name?.toLowerCase().endsWith('.docx') || document.name?.toLowerCase().endsWith('.doc')) && signedUrl) {
    const gdocs = `https://docs.google.com/gview?url=${encodeURIComponent(signedUrl)}&embedded=true`;
    return (
      <iframe title={document.name} src={gdocs} className="w-full h-full border rounded-md" />
    );
  }

  // Text fallback
  if (textPreview) {
    return (
      <div className="prose max-h-full overflow-auto p-3 bg-white border rounded-md">
        <pre className="whitespace-pre-wrap">{textPreview}</pre>
      </div>
    );
  }

  // Generic fallback
  return (
    <div className="flex items-center justify-center h-full rounded-md border border-dashed bg-white p-6">
      <p className="text-sm text-slate-600">Preview not available. Use Download to open the file.</p>
    </div>
  );
}
