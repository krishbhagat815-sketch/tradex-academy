import React, { useState } from 'react';
import { Sparkles, X, Copy, Check } from 'lucide-react';

interface PromoBannerProps {
  banner?: {
    isActive: boolean;
    message: string;
    couponCode: string;
    link: string;
  };
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ banner }) => {
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !banner || !banner.isActive) {
    return null;
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(banner.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-950 border-b border-red-900/40 text-white text-xs sm:text-sm font-medium px-4 py-2.5 flex items-center justify-between shadow-md relative z-50">
      <div className="flex-1 flex items-center justify-center gap-2.5 flex-wrap text-center">
        <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-red-600 text-white shadow-xs">
          OFFER
        </span>
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse hidden sm:inline" />
        <span className="text-slate-200 font-medium">{banner.message}</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 hover:text-emerald-200 px-3 py-0.5 rounded-full border border-emerald-500/40 transition-all font-mono font-bold text-xs shadow-xs"
          title="Click to copy coupon code"
        >
          <span>{banner.couponCode}</span>
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-emerald-400" />}
        </button>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-white/80 hover:text-white p-1 rounded transition-colors ml-2"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
