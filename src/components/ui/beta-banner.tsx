import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface BetaBannerProps {
  message?: string;
}

const BetaBanner: React.FC<BetaBannerProps> = ({
  message = 'DocFlow AI is in active development. Some features may change or be unavailable.',
}) => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('docflow.betaBanner.visible');
      if (stored === 'false') setVisible(false);
    } catch (e) {
      // ignore
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem('docflow.betaBanner.visible', 'false');
    } catch (e) {
      // ignore
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 md:top-6">
      <div className="w-[min(92vw,56rem)]">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 text-sm text-white shadow-lg sm:px-5">
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
