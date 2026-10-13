import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  BookOpen,
  Users,
  Heart,
  Sparkles,
  Play,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { getMediaUrl } from '../../utils/media';

export interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  thumbnail: string;
  preview_video_url?: string;
  category_name?: string;
  instructor_name?: string;
  instructor_avatar?: string;
  price: number;
  discount_price?: number | null;
  discount_percentage?: number;
  difficulty_level: string;
  duration: string;
  lesson_count?: number;
  enrolled_count: number;
  rating: number;
  review_count: number;
  is_wishlisted?: boolean;
}

interface CourseCardProps {
  course: Course;
  onWishlistChange?: (courseId: string, newState: boolean) => void;
}

function getYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return match ? match[1] : null;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onWishlistChange }) => {
  const { user } = useAuth();
  const { language, dict, formatPrice } = useLanguage();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(Boolean(course.is_wishlisted));
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  // Video Preview States
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const ytId = getYouTubeId(course.preview_video_url);
  const isDirectVideo = Boolean(course.preview_video_url && !ytId);
  const resolvedDirectVideoUrl = isDirectVideo && course.preview_video_url ? getMediaUrl(course.preview_video_url) : null;

  // Cleanup timers & video playback on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  // Manage direct video play/pause when preview state toggles
  useEffect(() => {
    if (isPreviewActive && videoRef.current) {
      videoRef.current.muted = isMuted;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name !== 'AbortError') {
            console.debug('Autoplay video preview note:', err);
          }
        });
      }
    } else if (!isPreviewActive && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setVideoProgress(0);
    }
  }, [isPreviewActive]);

  // Sync mute state to video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Desktop Hover Handlers with Intent Debounce
  const handleMouseEnter = () => {
    if (!course.preview_video_url) return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    // 240ms debounce prevents unnecessary network calls on quick cursor pass
    hoverTimerRef.current = setTimeout(() => {
      setIsPreviewActive(true);
    }, 240);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsPreviewActive(false);
  };

  // Mobile Touch Toggle Handlers
  const handleToggleMobilePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPreviewActive((prev) => !prev);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  const handleClosePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPreviewActive(false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setVideoProgress((current / total) * 100);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setIsTogglingWishlist(true);
      const res = await api.post(`/student/wishlist/${course.id}`);
      if (res.success) {
        setIsWishlisted(res.is_wishlisted);
        if (onWishlistChange) {
          onWishlistChange(course.id, res.is_wishlisted);
        }
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const currentPrice = course.discount_price != null ? course.discount_price : course.price;
  const originalPrice = course.price;
  const isFree = currentPrice <= 0;
  const hasDiscount = !isFree && course.discount_price != null && course.discount_price < originalPrice;

  // Bilingual level label helper
  const getLevelLabel = (level: string) => {
    if (level.toLowerCase().includes('begin')) return dict.courses.levelBeginner || 'Beginner';
    if (level.toLowerCase().includes('inter')) return dict.courses.levelIntermediate || 'Intermediate';
    if (level.toLowerCase().includes('adv')) return dict.courses.levelAdvanced || 'Advanced';
    return dict.courses.levelAll || 'All Levels';
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 hover:border-red-500/50 dark:hover:border-red-500/50 transition-all duration-300 shadow-card hover:shadow-card-hover hover:-translate-y-1"
    >
      {/* Thumbnail & Video Preview Header */}
      <div className="relative block aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-950">
        <Link to={`/course/${course.slug || course.id}`} className="block w-full h-full">
          {/* Static Thumbnail Image */}
          <img
            src={getMediaUrl(course.thumbnail)}
            alt={course.title}
            loading="lazy"
            className={`w-full h-full object-cover transition-all duration-500 ${
              isPreviewActive ? 'opacity-0 scale-105' : 'opacity-100 group-hover:scale-105'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        </Link>

        {/* Video Preview Overlay (Direct HTML5 Video) */}
        {isDirectVideo && resolvedDirectVideoUrl && (
          <div
            className={`absolute inset-0 z-10 transition-opacity duration-300 pointer-events-none ${
              isPreviewActive ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <video
              ref={videoRef}
              src={resolvedDirectVideoUrl}
              playsInline
              muted={isMuted}
              loop
              preload="none"
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Video Preview Overlay (YouTube Iframe Embed) */}
        {ytId && isPreviewActive && (
          <div className="absolute inset-0 z-10 bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&rel=0`}
              title={`${course.title} Preview`}
              className="w-full h-full border-0 pointer-events-none"
              allow="autoplay; encrypted-media"
            />
          </div>
        )}

        {/* Active Preview HUD Badges & Controls */}
        {isPreviewActive ? (
          <>
            {/* Live Preview Indicator Badge */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider shadow-md animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>{dict.courses.previewing}</span>
            </div>

            {/* Close Preview Button */}
            <button
              type="button"
              onClick={handleClosePreview}
              className="absolute top-3 right-12 z-20 p-1.5 rounded-full bg-slate-950/80 hover:bg-rose-600 text-white backdrop-blur-md border border-white/20 shadow-md transition-all active:scale-90"
              title={dict.courses.closePreview}
              aria-label={dict.courses.closePreview}
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Audio Mute / Unmute Button (for direct videos) */}
            {isDirectVideo && (
              <button
                type="button"
                onClick={handleToggleMute}
                className="absolute bottom-3 left-3 z-20 p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 shadow-md transition-all active:scale-90"
                title={isMuted ? dict.courses.unmutePreview : dict.courses.mutePreview}
                aria-label={isMuted ? dict.courses.unmutePreview : dict.courses.mutePreview}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </button>
            )}

            {/* Video Playback Progress Bar */}
            {isDirectVideo && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-950/40 z-20">
                <div
                  className="h-full bg-red-600 transition-all duration-100"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
            )}
          </>
        ) : (
          <>
            {/* Inactive Header Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-xs">
                {getLevelLabel(course.difficulty_level)}
              </span>
              {course.category_name && (
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 truncate max-w-[140px] shadow-xs">
                  {course.category_name}
                </span>
              )}
            </div>

            {/* Mobile Touch Preview Trigger Button */}
            {course.preview_video_url && (
              <button
                type="button"
                onClick={handleToggleMobilePreview}
                className="sm:hidden absolute bottom-3 left-3 z-10 px-2.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 text-white backdrop-blur-md border border-white/20 text-[11px] font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                title={dict.courses.previewVideo}
                aria-label={dict.courses.previewVideo}
              >
                <Play className="w-3 h-3 fill-current text-red-500" />
                <span>{dict.courses.previewVideo}</span>
              </button>
            )}
          </>
        )}

        {/* Wishlist Button (Always accessible) */}
        <button
          onClick={handleToggleWishlist}
          disabled={isTogglingWishlist}
          className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
            isWishlisted
              ? 'bg-red-600 text-white'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-white dark:hover:bg-slate-800'
          }`}
          title={isWishlisted ? dict.courseDetails.removeFromWishlist : dict.courseDetails.addToWishlist}
          aria-label={isWishlisted ? dict.courseDetails.removeFromWishlist : dict.courseDetails.addToWishlist}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Free or Discount Badge (When preview not active) */}
        {!isPreviewActive && (
          <>
            {isFree ? (
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-black shadow-md flex items-center gap-1 z-10">
                <Sparkles className="w-3 h-3" />
                {dict.courses.freeBadge}
              </div>
            ) : hasDiscount ? (
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-red-600 text-white text-xs font-black shadow-md tracking-wider z-10">
                {course.discount_percentage ? `${course.discount_percentage}% OFF` : dict.courses.saleBadge}
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Course Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Rating & Stats */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-900 dark:text-white text-sm">{course.rating.toFixed(1)}</span>
              <span>({course.review_count})</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>{course.enrolled_count.toLocaleString()} {dict.courses.students}</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/course/${course.slug || course.id}`}>
            <h3 className="text-base font-bold text-slate-950 dark:text-white leading-snug line-clamp-2 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              {course.title}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {course.short_description}
          </p>

          {/* Instructor snippet */}
          {course.instructor_name && (
            <div className="mt-3 flex items-center gap-2">
              <img
                src={getMediaUrl(course.instructor_avatar) || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(course.instructor_name)}`}
                alt={course.instructor_name}
                className="w-5 h-5 rounded-full object-cover bg-slate-100 dark:bg-slate-800"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(course.instructor_name || 'Instructor')}`;
                }}
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">{course.instructor_name}</span>
            </div>
          )}

          {/* Meta specs */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{course.duration}</span>
            </div>
            {course.lesson_count !== undefined && (
              <div className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{course.lesson_count} {dict.courses.lessons}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price & CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-950 dark:text-white">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/course/${course.slug || course.id}`}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 ${
              isFree
                ? 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20'
            }`}
          >
            {isFree ? dict.courses.enrollFree : dict.courses.viewDetails}
          </Link>
        </div>
      </div>
    </div>
  );
};
