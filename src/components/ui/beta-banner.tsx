import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface BetaBannerProps {
  message?: string;
}

const BetaBanner: React.FC<BetaBannerProps> = ({
  message = 'DocFlow AI is in active development. Some features may change or be unavailable.',
}) => {
  const [visible, setVisible] = useState(true);
  const [topPx, setTopPx] = useState<string | null>(null);

  // Force-show banner during development: do not read persisted dismissal.
  useEffect(() => {
    setVisible(true);
    try {
      const header =
        (document.querySelector('header') as HTMLElement) ||
        (document.querySelector('#main-header') as HTMLElement) ||
        (document.querySelector('.app-header') as HTMLElement);
      if (header && header.offsetHeight) {
        const offset = header.offsetHeight + 12; // 12px gap
        setTopPx(`${offset}px`);
      } else {
        setTopPx('12px');
      }
    } catch (e) {
      setTopPx('12px');
    }
  }, []);

  const dismiss = () => {
    // only dismiss for current session (no localStorage write)
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="inset-x-0 pointer-events-none"
      style={topPx ? { position: 'fixed', top: topPx, left: 0, right: 0, zIndex: 40 } : { position: 'fixed', top: '12px', left: 0, right: 0, zIndex: 40 }}
    >
      <div className="mx-auto w-full max-w-[min(96vw,48rem)] pointer-events-auto">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 text-sm text-white shadow-lg sm:px-5"
          role="status"
        >
          <span className="flex-1">{message}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-white hover:bg-slate-800"
            onClick={dismiss}
            aria-label="Dismiss beta notice"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BetaBanner;
