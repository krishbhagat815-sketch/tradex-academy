import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { VideoModal } from '../components/common/VideoModal';
import {
  Star,
  Clock,
  BookOpen,
  Users,
  CheckCircle,
  Play,
  PlayCircle,
  Lock,
  Globe,
  Award,
  ShieldCheck,
  Heart,
  ChevronDown,
  ArrowRight,
  Sparkles,
  MessageSquare
} from 'lucide-react';

export const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Video preview modal state
  const [previewVideo, setPreviewVideo] = useState<{ url: string; title: string } | null>(null);

  // Curriculum accordion expansion state
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Review submission state for enrolled students
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/courses/${id}`);
        if (res.success && res.course) {
          setCourse(res.course);
          // Expand first 2 modules by default
          const initialExpanded: Record<string, boolean> = {};
          res.course.curriculum?.forEach((m: any, idx: number) => {
            if (idx < 2) initialExpanded[m.id] = true;
          });
          setExpandedModules(initialExpanded);
        } else {
          setError(res.message || 'Course not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load course details.');
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchCourse();
  }, [id]);

  const toggleModule = (modId: string) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleEnrollClick = () => {
    if (!course) return;
    if (course.is_enrolled) {
      navigate(`/learn/${course.id}`);
    } else {
      navigate(`/checkout/${course.id}`);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/student/wishlist/${course.id}`);
      if (res.success) {
        setCourse((prev: any) => ({ ...prev, is_wishlisted: res.is_wishlisted }));
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    try {
      setSubmittingReview(true);
      const res = await api.post('/reviews', {
        courseId: course.id,
        rating,
        reviewText: reviewText.trim()
      });

      if (res.success) {
        setReviewSuccess('Thank you! Your review has been submitted.');
        setReviewText('');
        // Refresh course reviews
        const updated = await api.get(`/courses/${id}`);
        if (updated.success) setCourse(updated.course);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 min-h-screen">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-slate-800 rounded w-1/3" />
          <div className="h-12 bg-slate-800 rounded w-3/4" />
          <div className="h-64 bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-white">Course Not Found</h2>
        <p className="mt-2 text-slate-400">{error || 'The requested course does not exist.'}</p>
        <Link
          to="/courses"
          className="mt-6 inline-flex px-6 py-3 rounded-xl bg-brand-500 text-slate-950 font-bold text-sm"
        >
          Return to Course Catalog
        </Link>
      </div>
    );
  }

  const currentPrice = course.discount_price != null ? course.discount_price : course.price;
  const originalPrice = course.price;
  const hasDiscount = course.discount_price != null && course.discount_price < originalPrice;

  return (
    <div className="min-h-screen pb-24">
      {/* Course Hero Header */}
      <section className="relative bg-slate-900/90 border-b border-slate-800/80 pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Left 2 Cols: Main Info */}
            <div className="lg:col-span-2 space-y-4">
              {/* Category & Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/courses?category=${course.category_slug}`}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-colors"
                >
                  {course.category_name}
                </Link>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                  {course.difficulty_level}
                </span>
                {course.featured ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    ★ FEATURED
                  </span>
                ) : null}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {course.title}
              </h1>

              {/* Short Description */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                {course.short_description}
              </p>

              {/* Metrics Row */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-300">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Star className="w-5 h-5 fill-amber-400" />
                  <span className="text-white text-base">{course.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({course.review_count} ratings)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{course.enrolled_count.toLocaleString()} students enrolled</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{course.duration} total duration</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span>{course.language}</span>
                </div>
              </div>

              {/* Instructor snippet */}
              <div className="pt-4 flex items-center gap-3 border-t border-slate-800">
                <img
                  src={course.instructor_avatar}
                  alt={course.instructor_name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500/40"
                />
                <div>
                  <p className="text-xs text-slate-400">Created by expert instructor</p>
                  <h4 className="text-sm font-bold text-white">{course.instructor_name}</h4>
                  <p className="text-xs text-slate-400">{course.instructor_title}</p>
                </div>
              </div>
            </div>

            {/* Right Col: Desktop Pricing & Action Card */}
            <div className="lg:col-span-1 lg:-mb-32 z-20">
              <div className="rounded-2xl bg-slate-900 border border-slate-750 overflow-hidden shadow-2xl sticky top-28">
                {/* Thumbnail Preview Area */}
                <div className="relative aspect-video bg-black group overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                    <button
                      onClick={() =>
                        setPreviewVideo({
                          url: course.preview_video_url,
                          title: `${course.title} - Official Preview`
                        })
                      }
                      className="p-4 rounded-full bg-brand-500 text-slate-950 hover:bg-brand-400 hover:scale-110 transition-all shadow-xl shadow-brand-500/30 flex items-center gap-2 group/btn"
                    >
                      <Play className="w-6 h-6 fill-current" />
                    </button>
                  </div>
                  <span className="absolute bottom-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-white">
                    Watch Free Preview
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-6">
                  {/* Pricing */}
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-3xl font-extrabold text-white">
                        ${currentPrice.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-base text-slate-400 line-through">
                          ${originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <span className="px-2.5 py-1 rounded-md bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs font-extrabold">
                        {course.discount_percentage}% OFF
                      </span>
                    )}
                  </div>

                  {/* Primary Action Button */}
                  <div className="space-y-3">
                    <button
                      onClick={handleEnrollClick}
                      className="w-full py-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-base transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2 hover:scale-[1.01]"
                    >
                      {course.is_enrolled ? (
                        <>
                          <PlayCircle className="w-5 h-5" />
                          <span>Go to Course Player</span>
                        </>
                      ) : (
                        <>
                          <span>Enroll Now — ${currentPrice.toFixed(2)}</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleToggleWishlist}
                      className={`w-full py-2.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        course.is_wishlisted
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : 'bg-slate-950/60 border-slate-750 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${course.is_wishlisted ? 'fill-current text-rose-400' : ''}`} />
                      <span>{course.is_wishlisted ? 'In Your Wishlist' : 'Add to Wishlist'}</span>
                    </button>
                  </div>

                  {/* Trust list */}
                  <div className="pt-4 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      <span>30-Day Money-Back Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      <span>Full Lifetime Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      <span>Verifiable Certificate of Completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      <span>Downloadable source code & materials</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Course Content Tabs & Details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left 2 Cols: Outcomes, Curriculum, Instructor, Reviews */}
          <div className="lg:col-span-2 space-y-14">
            {/* What you'll learn */}
            {course.learning_outcomes && course.learning_outcomes.length > 0 && (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-400" />
                  What You'll Learn in This Course
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.learning_outcomes.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-300 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Curriculum */}
            <div>
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Course Curriculum</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {course.curriculum?.length || 0} modules •{' '}
                    {course.curriculum?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0}{' '}
                    lessons • {course.duration} total duration
                  </p>
                </div>
                <button
                  onClick={() => {
                    const allOpen = Object.values(expandedModules).every(Boolean);
                    const next: Record<string, boolean> = {};
                    course.curriculum?.forEach((m: any) => {
                      next[m.id] = !allOpen;
                    });
                    setExpandedModules(next);
                  }}
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300"
                >
                  {Object.values(expandedModules).every(Boolean) ? 'Collapse All' : 'Expand All'}
                </button>
              </div>

              <div className="space-y-4">
                {course.curriculum?.map((mod: any, mIdx: number) => {
                  const isOpen = Boolean(expandedModules[mod.id]);
                  return (
                    <div
                      key={mod.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden"
                    >
                      {/* Module Header Accordion */}
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className="w-full px-6 py-4 flex items-center justify-between bg-slate-900 hover:bg-slate-850 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <ChevronDown
                            className={`w-5 h-5 text-slate-400 transition-transform ${
                              isOpen ? 'rotate-180 text-brand-400' : ''
                            }`}
                          />
                          <div>
                            <h4 className="text-base font-bold text-white">{mod.title}</h4>
                            {mod.description && (
                              <p className="text-xs text-slate-400 line-clamp-1">{mod.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-4">
                          {mod.lessons?.length || 0} lessons
                        </span>
                      </button>

                      {/* Lessons List */}
                      {isOpen && (
                        <div className="divide-y divide-slate-800/80 border-t border-slate-800">
                          {mod.lessons?.map((lsn: any, lIdx: number) => (
                            <div
                              key={lsn.id}
                              className="px-6 py-3.5 flex items-center justify-between text-sm hover:bg-slate-850/50 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                                {lsn.is_preview || course.is_enrolled ? (
                                  <PlayCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
                                ) : (
                                  <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                )}
                                <span className="text-slate-300 font-medium truncate">{lsn.title}</span>
                              </div>

                              <div className="flex items-center gap-3 flex-shrink-0">
                                {lsn.is_preview && (
                                  <button
                                    onClick={() =>
                                      setPreviewVideo({
                                        url: lsn.video_url || course.preview_video_url,
                                        title: lsn.title
                                      })
                                    }
                                    className="px-2.5 py-1 rounded-md bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/20 text-xs font-semibold transition-colors flex items-center gap-1"
                                  >
                                    <Play className="w-3 h-3 fill-current" />
                                    <span>Preview</span>
                                  </button>
                                )}
                                <span className="text-xs text-slate-400 font-mono">{lsn.video_duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Requirements & Target Audience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {course.requirements && course.requirements.length > 0 && (
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <h4 className="text-lg font-bold text-white mb-4">Requirements</h4>
                  <ul className="space-y-2.5 text-sm text-slate-400">
                    {course.requirements.map((req: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.target_audience && course.target_audience.length > 0 && (
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <h4 className="text-lg font-bold text-white mb-4">Target Audience</h4>
                  <ul className="space-y-2.5 text-sm text-slate-400">
                    {course.target_audience.map((aud: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                        <span>{aud}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Instructor Profile Card */}
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Lead Instructor</span>
              <div className="mt-4 flex flex-col sm:flex-row items-start gap-6">
                <img
                  src={course.instructor_avatar}
                  alt={course.instructor_name}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-brand-500/30 flex-shrink-0"
                />
                <div className="space-y-2 flex-1">
                  <h4 className="text-xl font-bold text-white">{course.instructor_name}</h4>
                  <p className="text-sm text-slate-400 font-medium">{course.instructor_title}</p>
                  <p className="text-sm text-slate-300 leading-relaxed pt-2">{course.instructor_bio}</p>
                  <div className="flex flex-wrap gap-4 pt-3 text-xs text-slate-400">
                    <span className="font-semibold text-white">★ {course.instructor_rating || 4.9} Instructor Rating</span>
                    <span>•</span>
                    <span>{(course.instructor_students || 24000).toLocaleString()} Students</span>
                    <span>•</span>
                    <span>{course.instructor_courses || 4} Courses</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Reviews & Ratings */}
            <div className="space-y-8">
              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Student Reviews</h3>
                  <p className="text-xs text-slate-400 mt-1">Authentic feedback from verified students</p>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  <span className="text-2xl font-extrabold text-white">{course.rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400 font-normal">course rating</span>
                </div>
              </div>

              {/* Review writing box for enrolled students */}
              {course.is_enrolled && (
                <form onSubmit={handleSubmitReview} className="p-6 rounded-2xl bg-slate-900 border border-brand-500/30 space-y-4">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-400" />
                    Write a Review
                  </h4>
                  {reviewSuccess && (
                    <p className="text-xs text-brand-400 font-semibold">{reviewSuccess}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    required
                    placeholder="Share your learning experience and what you learned from this masterclass..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full p-3.5 bg-slate-950 border border-slate-750 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all shadow-md"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}

              {/* Reviews list */}
              <div className="space-y-4">
                {course.reviews && course.reviews.length > 0 ? (
                  course.reviews.map((rev: any) => (
                    <div key={rev.id} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={rev.student_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${rev.student_name}`}
                            alt={rev.student_name}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/20"
                          />
                          <div>
                            <h5 className="text-sm font-bold text-white">{rev.student_name}</h5>
                            <span className="text-[11px] text-slate-500">Verified Enrollment</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{rev.review_text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">No reviews yet for this course. Be the first to enroll and share your thoughts!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Preview Modal */}
      {previewVideo && (
        <VideoModal
          isOpen={Boolean(previewVideo)}
          onClose={() => setPreviewVideo(null)}
          videoUrl={previewVideo.url}
          title={previewVideo.title}
          subtitle="Free Lesson Preview"
        />
      )}
    </div>
  );
};
