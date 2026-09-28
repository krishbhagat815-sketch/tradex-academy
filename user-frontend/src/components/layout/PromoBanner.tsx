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
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white text-xs sm:text-sm font-medium px-4 py-2 flex items-center justify-between shadow-md relative z-50">
      <div className="flex-1 flex items-center justify-center gap-2 flex-wrap text-center">
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse hidden sm:inline" />
        <span>{banner.message}</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 bg-black/25 hover:bg-black/40 text-amber-200 hover:text-white px-2.5 py-0.5 rounded-full border border-amber-300/30 transition-all font-mono font-semibold"
          title="Click to copy coupon code"
        >
          {banner.couponCode}
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
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
