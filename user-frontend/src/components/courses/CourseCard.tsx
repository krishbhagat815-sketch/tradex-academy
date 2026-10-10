import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Clock, BookOpen, Users, Heart, Sparkles } from 'lucide-react';
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

export const CourseCard: React.FC<CourseCardProps> = ({ course, onWishlistChange }) => {
  const { user } = useAuth();
  const { language, dict, formatPrice } = useLanguage();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(Boolean(course.is_wishlisted));
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

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
    if (level.toLowerCase().includes('begin')) return 'Beginner';
    if (level.toLowerCase().includes('inter')) return 'Intermediate';
    if (level.toLowerCase().includes('adv')) return 'Advanced';
    return 'All Levels';
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/90 hover:border-emerald-500/50 transition-all duration-300 shadow-card hover:shadow-card-hover hover:-translate-y-1">
      {/* Thumbnail Header */}
      <Link to={`/course/${course.slug || course.id}`} className="relative block aspect-[16/9] overflow-hidden bg-slate-100">
        <img
          src={getMediaUrl(course.thumbnail)}
          alt={course.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />

        {/* Level badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md text-emerald-700 border border-emerald-200/70 shadow-xs">
            {getLevelLabel(course.difficulty_level)}
          </span>
          {course.category_name && (
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-md text-slate-700 border border-slate-200 truncate max-w-[140px] shadow-xs">
              {course.category_name}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          disabled={isTogglingWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
            isWishlisted
              ? 'bg-rose-500 text-white'
              : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white'
          }`}
          title={isWishlisted ? dict.courseDetails.removeFromWishlist : dict.courseDetails.addToWishlist}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Free or Discount Badge */}
        {isFree ? (
          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-black shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {dict.courses.freeBadge}
          </div>
        ) : hasDiscount ? (
          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-xs font-extrabold shadow-md">
            {course.discount_percentage ? `${course.discount_percentage}% OFF` : dict.courses.saleBadge}
          </div>
        ) : null}
      </Link>

      {/* Course Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Rating & Stats */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-900 text-sm">{course.rating.toFixed(1)}</span>
              <span>({course.review_count})</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.enrolled_count.toLocaleString()} {dict.courses.students}</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/course/${course.slug || course.id}`}>
            <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 hover:text-emerald-600 transition-colors">
              {course.title}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {course.short_description}
          </p>

          {/* Instructor snippet */}
          {course.instructor_name && (
            <div className="mt-3 flex items-center gap-2">
              <img
                src={getMediaUrl(course.instructor_avatar) || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(course.instructor_name)}`}
                alt={course.instructor_name}
                className="w-5 h-5 rounded-full object-cover bg-slate-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(course.instructor_name || 'Instructor')}`;
                }}
              />
              <span className="text-xs text-slate-700 font-medium truncate">{course.instructor_name}</span>
            </div>
          )}

          {/* Meta specs */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
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
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-900">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/course/${course.slug || course.id}`}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 ${
              isFree
                ? 'bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isFree ? dict.courses.enrollFree : dict.courses.viewDetails}
          </Link>
        </div>
      </div>
    </div>
  );
};
