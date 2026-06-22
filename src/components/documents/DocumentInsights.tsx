import React from 'react';

interface DocumentInsightsProps {
  summary: string | null;
  keyPoints: string[] | null;
  isLoading?: boolean;
}

export const DocumentInsights: React.FC<DocumentInsightsProps> = ({ 
  summary, 
  keyPoints, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse">
        <div className="space-y-3">
          <div className="h-3 bg-slate-300 rounded w-24"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 rounded w-4/5"></div>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-4 space-y-3">
          <div className="h-3 bg-slate-300 rounded w-32"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded"></div>
            <div className="h-3 bg-slate-200 rounded w-5/6"></div>
            <div className="h-3 bg-slate-200 rounded"></div>
            <div className="h-3 bg-slate-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary && (!keyPoints || keyPoints.length === 0)) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-dashed border-slate-300 text-center">
        <svg className="w-12 h-12 mx-auto mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5h.01" />
        </svg>
        <p className="text-slate-600 font-medium mb-1">No insights available yet</p>
        <p className="text-slate-500 text-sm">Upload or select a document to generate AI-powered insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      {summary && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">AI Summary</h3>
            <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">Generated</span>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            {summary}
          </p>
        </div>
      )}

      {keyPoints && keyPoints.length > 0 && (
        <div className={summary ? "border-t border-slate-200 pt-6 space-y-3" : "space-y-3"}>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Key Highlights</h3>
            <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">{keyPoints.length} items</span>
          </div>
          <ul className="space-y-2">
            {keyPoints.map((point, index) => (
              <li key={index} className="flex gap-3 text-slate-700 text-sm leading-snug">
                <span className="inline-flex items-center justify-center w-5 h-5 flex-shrink-0 mt-0.5 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold">
                  {index + 1}
                </span>
                <span className="pt-0.5">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};