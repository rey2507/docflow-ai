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
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!summary && (!keyPoints || keyPoints.length === 0)) {
    return (
      <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        No AI insights generated for this document yet.
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      {summary && (
        <div>
          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">AI Summary</h3>
          <p className="text-gray-700 text-sm leading-relaxed font-medium">
            {summary}
          </p>
        </div>
      )}

      {keyPoints && keyPoints.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Key Highlights</h3>
          <ul className="list-disc list-inside space-y-2">
            {keyPoints.map((point, index) => (
              <li key={index} className="text-gray-700 text-sm leading-snug">
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};