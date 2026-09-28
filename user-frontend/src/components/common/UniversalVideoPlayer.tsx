import React from 'react';
import { PlayCircle } from 'lucide-react';

interface UniversalVideoPlayerProps {
  url?: string | null;
  className?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  onLoadedMetadata?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
}

export function parseVideoSource(url?: string | null): {
  type: 'youtube' | 'vimeo' | 'video' | 'empty';
  src: string;
} {
  if (!url || !url.trim()) {
    return { type: 'empty', src: '' };
  }

  const clean = url.trim();

  // YouTube match
  const ytMatch = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`
    };
  }

  // Vimeo match
  const vimeoMatch = clean.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+))/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
    };
  }

  // Direct video or local uploaded file (/uploads/...)
  return {
    type: 'video',
    src: clean
  };
}

export const UniversalVideoPlayer: React.FC<UniversalVideoPlayerProps> = ({
  url,
  className = 'w-full h-full object-contain',
  autoPlay = true,
  onEnded,
  onLoadedMetadata
}) => {
  const parsed = parseVideoSource(url);

  if (parsed.type === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <PlayCircle className="w-16 h-16 text-slate-600 mb-3" />
        <p className="text-sm text-slate-400">Video source is not available or is being updated.</p>
      </div>
    );
  }

  if (parsed.type === 'youtube' || parsed.type === 'vimeo') {
    return (
      <iframe
        src={parsed.src}
        title="Video Player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full border-0"
      />
    );
  }

  return (
    <video
      key={parsed.src}
      src={parsed.src}
      controls
      autoPlay={autoPlay}
      playsInline
      onEnded={onEnded}
      onLoadedMetadata={onLoadedMetadata}
      className={className}
    />
  );
};
