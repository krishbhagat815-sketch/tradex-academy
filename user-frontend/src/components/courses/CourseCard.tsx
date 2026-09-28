import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Clock, BookOpen, Users, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

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
  const hasDiscount = course.discount_price != null && course.discount_price < originalPrice;

  return (
    <div className="group flex flex-col bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-800 hover:border-brand-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1">
      {/* Thumbnail Header */}
      <Link to={`/course/${course.slug || course.id}`} className="relative block aspect-[16/9] overflow-hidden bg-slate-950">
        <img
          src={course.thumbnail}
          alt={course.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Level badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur-md text-brand-300 border border-brand-500/20 shadow-sm">
            {course.difficulty_level}
          </span>
          {course.category_name && (
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700/60">
              {course.category_name}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          disabled={isTogglingWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
            isWishlisted
              ? 'bg-rose-500/90 text-white'
              : 'bg-slate-950/70 text-slate-300 hover:text-rose-400 hover:bg-slate-900'
          }`}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-brand-500 text-slate-950 text-xs font-extrabold shadow-md">
            {course.discount_percentage ? `${course.discount_percentage}% OFF` : 'SALE'}
          </div>
        )}
      </Link>

      {/* Course Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Rating & Stats */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-white text-sm">{course.rating.toFixed(1)}</span>
              <span>({course.review_count})</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.enrolled_count.toLocaleString()} students</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/course/${course.slug || course.id}`}>
            <h3 className="text-base font-bold text-white leading-snug line-clamp-2 hover:text-brand-400 transition-colors">
              {course.title}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {course.short_description}
          </p>

          {/* Instructor snippet */}
          {course.instructor_name && (
            <div className="mt-3 flex items-center gap-2">
              <img
                src={course.instructor_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${course.instructor_name}`}
                alt={course.instructor_name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-xs text-slate-300 font-medium truncate">{course.instructor_name}</span>
            </div>
          )}

          {/* Meta specs */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{course.duration}</span>
            </div>
            {course.lesson_count !== undefined && (
              <div className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{course.lesson_count} lessons</span>
              </div>
            )}
          </div>
        </div>

        {/* Price & CTA */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-white">
                ${currentPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/course/${course.slug || course.id}`}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-brand-500 hover:text-slate-950 text-brand-300 text-xs font-bold transition-all"
          >
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
};
