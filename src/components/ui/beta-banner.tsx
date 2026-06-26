import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface BetaBannerProps {
  message?: string;
}

const BetaBanner: React.FC<BetaBannerProps> = ({
  message = 'DocFlow AI is in active development. Some features may change or be unavailable.',
}) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 px-4">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
        <span className="flex-1">{message}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-white hover:bg-slate-800"
          onClick={() => setVisible(false)}
          aria-label="Dismiss beta notice"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BetaBanner;
