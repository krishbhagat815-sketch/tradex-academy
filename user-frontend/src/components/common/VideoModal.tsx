import React from 'react';
import { X, PlayCircle, ShieldCheck } from 'lucide-react';
import { UniversalVideoPlayer } from './UniversalVideoPlayer';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string | null;
  title: string;
  subtitle?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title,
  subtitle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-750 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <PlayCircle className="w-5 h-5 text-brand-400" />
            <div>
              <h3 className="text-base font-bold text-white leading-tight">{title}</h3>
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <UniversalVideoPlayer url={videoUrl} />
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-slate-950 flex items-center justify-between text-xs text-slate-400 border-t border-slate-850">
          <div className="flex items-center gap-1.5 text-brand-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Complimentary Course Preview Stream</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
