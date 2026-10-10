import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { CourseCard, Course } from '../components/courses/CourseCard';
import { useLanguage } from '../context/LanguageContext';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const { language, dict } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state from URL params or defaults
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const level = searchParams.get('level') || 'all';
  const price = searchParams.get('price') || 'all';
  const rating = searchParams.get('rating') || '';
  const sort = searchParams.get('sort') || 'popular';

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get('/categories');
        if (res.success) setCategories(res.categories);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.set('search', search);
        if (category && category !== 'all') queryParams.set('category', category);
        if (level && level !== 'all') queryParams.set('level', level);
        if (price && price !== 'all') queryParams.set('price', price);
        if (rating) queryParams.set('rating', rating);
        if (sort) queryParams.set('sort', sort);

        const res = await api.get(`/courses?${queryParams.toString()}`);
        if (res.success) {
          setCourses(res.courses);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [search, category, level, price, rating, sort]);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(search || (category && category !== 'all') || (level && level !== 'all') || (price && price !== 'all') || rating);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{language === 'gu' ? 'Complete Trading Curriculum' : 'Full Curriculum Catalog'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          {language === 'gu' ? 'અમારા Trading Courses' : 'Explore Trading Courses'}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          {language === 'gu'
            ? 'Stock Market, Price Action, Nifty/BankNifty Options અને Crypto Trading ના practical video courses. તમારા Level મુજબ Course પસંદ કરો.'
            : 'Discover comprehensive stock market, price action, and options trading masterclasses designed for Gujarati investors.'}
        </p>
      </div>

      {/* Top Controls: Search & Sort */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md mb-8">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder={dict.courses.filterSearch}
            value={search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <span className="text-xs text-slate-400 font-medium">{dict.courses.filterSort}:</span>
          <select
            value={sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="px-4 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          >
            <option value="popular">{dict.courses.sortPopular}</option>
            <option value="newest">{dict.courses.sortNewest}</option>
            <option value="rating">{dict.courses.sortHighestRated}</option>
            <option value="price-asc">{dict.courses.sortPriceLow}</option>
            <option value="price-desc">{dict.courses.sortPriceHigh}</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        <button
          onClick={() => updateFilter('category', 'all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            category === 'all'
              ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          {language === 'gu' ? 'બધી કેટેગરીઝ' : 'All Categories'}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => updateFilter('category', c.slug)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              category === c.slug
                ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Secondary Filter Pills: Level & Price & Rating */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> {language === 'gu' ? 'ફિલ્ટર્સ:' : 'Filters:'}
          </span>

          {/* Level Filter */}
          <select
            value={level}
            onChange={(e) => updateFilter('level', e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs font-medium focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">{dict.courses.filterLevel}: {dict.courses.levelAll}</option>
            <option value="Beginner">{dict.courses.levelBeginner}</option>
            <option value="Intermediate">{dict.courses.levelIntermediate}</option>
            <option value="Advanced">{dict.courses.levelAdvanced}</option>
            <option value="All Levels">{dict.courses.levelAll}</option>
          </select>

          {/* Price Filter */}
          <select
            value={price}
            onChange={(e) => updateFilter('price', e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs font-medium focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">{dict.courses.filterPrice}: {dict.courses.filterAll}</option>
            <option value="paid">{language === 'gu' ? 'પેઇડ કોર્સ (Paid)' : 'Paid Courses'}</option>
            <option value="free">{language === 'gu' ? 'મફત કોર્સ (Free ₹0)' : 'Free Courses (₹0)'}</option>
          </select>

          {/* Rating Filter */}
          <select
            value={rating}
            onChange={(e) => updateFilter('rating', e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs font-medium focus:ring-1 focus:ring-brand-500"
          >
            <option value="">{language === 'gu' ? 'રેટિંગ: બધા' : 'Rating: All'}</option>
            <option value="4.9">4.9 & Above</option>
            <option value="4.8">4.8 & Above</option>
            <option value="4.5">4.5 & Above</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors ml-2 font-medium"
            >
              <RotateCcw className="w-3 h-3" /> {dict.courses.resetFilters}
            </button>
          )}
        </div>

        <p className="text-xs text-slate-400 font-medium">
          {language === 'gu' ? 'કુલ' : 'Showing'} <span className="font-bold text-white">{courses.length}</span> {dict.courses.title}
        </p>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-slate-900 border border-slate-800 h-96 animate-pulse" />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl bg-slate-900/40 border border-slate-800 max-w-xl mx-auto p-8">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">{dict.courses.noCoursesFound}</h3>
          <p className="mt-2 text-sm text-slate-400">
            {language === 'gu'
              ? 'કૃપા કરીને અન્ય ફિલ્ટર પસંદ કરો અથવા સર્ચ બદલો.'
              : 'Try adjusting your search query, difficulty level, or category filter.'}
          </p>
          <button
            onClick={clearAllFilters}
            className="mt-6 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-brand-500/20"
          >
            {dict.courses.resetFilters}
          </button>
        </div>
      )}
    </div>
  );
};
