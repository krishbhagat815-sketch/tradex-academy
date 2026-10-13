import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { CourseCard, Course } from '../components/courses/CourseCard';
import { PromoBanner } from '../components/layout/PromoBanner';
import { useLanguage } from '../context/LanguageContext';
import { getMediaUrl } from '../utils/media';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Star,
  Award,
  BookOpen,
  MessageCircle,
  Calendar,
  Video
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { language, dict } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cmsContent, setCmsContent] = useState<any>(null);
  const [instructorsList, setInstructorsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'free' | 'options' | 'price-action' | 'crypto'>('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [courseRes, catRes, contentRes, instRes] = await Promise.all([
          api.get('/courses?limit=12'),
          api.get('/categories'),
          api.get('/content'),
          api.get('/instructors').catch(() => ({ success: false, instructors: [] }))
        ]);

        if (courseRes.success) setCourses(courseRes.courses);
        if (catRes.success) setCategories(catRes.categories);
        if (contentRes.success) setCmsContent(contentRes.content);
        if (instRes.success && instRes.instructors?.length > 0) {
          setInstructorsList(instRes.instructors);
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter courses based on active tab
  const filteredCourses = courses.filter((c: any) => {
    const isFree = (c.discount_price != null ? c.discount_price : c.price) <= 0;
    if (activeTab === 'free') return isFree;
    if (activeTab === 'options') {
      return c.category_slug?.includes('options') || c.title?.toLowerCase().includes('option') || c.title?.includes('ઓપ્શન્સ');
    }
    if (activeTab === 'price-action') {
      return c.category_slug?.includes('price-action') || c.title?.toLowerCase().includes('price') || c.title?.includes('પ્રાઇસ');
    }
    if (activeTab === 'crypto') {
      return c.category_slug?.includes('crypto') || c.title?.toLowerCase().includes('crypto') || c.title?.includes('ક્રિપ્ટો');
    }
    return true;
  });

  // Why Choose Us Points
  const whyUsPoints = [
    {
      title: dict.whyUs.point1Title,
      desc: dict.whyUs.point1Desc,
      badge: '01'
    },
    {
      title: dict.whyUs.point2Title,
      desc: dict.whyUs.point2Desc,
      badge: '02'
    },
    {
      title: dict.whyUs.point3Title,
      desc: dict.whyUs.point3Desc,
      badge: '03'
    },
    {
      title: dict.whyUs.point4Title,
      desc: dict.whyUs.point4Desc,
      badge: '04'
    },
    {
      title: dict.whyUs.point5Title,
      desc: dict.whyUs.point5Desc,
      badge: '05'
    },
    {
      title: dict.whyUs.point6Title,
      desc: dict.whyUs.point6Desc,
      badge: '06'
    }
  ];

  // Mentors Data
  const mentors = [
    {
      name: language === 'gu' ? 'ભાવિક પટેલ' : 'Bhavik Patel',
      role: language === 'gu' ? 'મુખ્ય મેન્ટર & પ્રાઇસ એક્શન એક્સપર્ટ' : 'Lead Mentor & Price Action Trader',
      exp: '10+',
      students: '35,000+',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      bio: language === 'gu'
        ? '૧૦+ વર્ષથી ભારતીય શેર બજારમાં ફૂલ-ટાઇમ ટ્રેડિંગ. હજારો ગુજરાતીઓને સ્વતંત્ર અને શિસ્તબદ્ધ ટ્રેડર બનાવ્યા છે.'
        : '10+ years of active trading in Indian stock markets. Empowered thousands of traders with disciplined price action rules.'
    },
    {
      name: language === 'gu' ? 'જિજ્ઞેશ શાહ' : 'Jignesh Shah',
      role: language === 'gu' ? 'ઓપ્શન્સ & ડેરિવેટિવ્સ સ્ટ્રેટેજિસ્ટ' : 'Options & Derivatives Strategist',
      exp: '8+',
      students: '20,000+',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
      bio: language === 'gu'
        ? 'નિફ્ટી અને બેંકનિફ્ટી ઓપ્શન્સ ડેટા, ઓપન ઇન્ટરેસ્ટ (OI) અને એક્સપાયરી ડે ટ્રેડિંગના માસ્ટર.'
        : 'Specialist in Nifty & BankNifty OI analysis, option Greeks, and high-probability expiry day setups.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <PromoBanner banner={cmsContent?.promo_banner} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-20 lg:pt-14 lg:pb-28 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white via-slate-50/70 to-white dark:from-[#0b0f19] dark:via-slate-900/50 dark:to-[#0b0f19]">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-red-600/5 dark:bg-red-600/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[350px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-12 left-10 w-[350px] h-[300px] bg-red-700/5 dark:bg-red-700/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Top Gujarat Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 shadow-2xs mb-6 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-red-600" />
              <span>{dict.hero.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.18]">
              {dict.hero.headlinePart1}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-red-700">
                {dict.hero.headlineHighlight}
              </span>{' '}
              {dict.hero.headlinePart2}
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-sm sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
              {dict.hero.description}
            </p>

            {/* Trust Pill Highlights */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-slate-800 dark:text-slate-200">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {language === 'gu' ? 'સરળ Gujlish ભાષા' : 'Simple Gujlish Language'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {language === 'gu' ? 'No Tips • Pure Learning' : 'No Tips • Pure Learning'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs font-medium">
                <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {language === 'gu' ? 'Digital Certificate Included' : 'Digital Certificate Included'}
              </span>
            </div>

            {/* Action CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/courses?price=free"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-base transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>{dict.hero.startLearningFree}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/courses"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-950 hover:bg-black dark:bg-slate-900 dark:hover:bg-slate-800 text-white font-bold text-base border border-slate-900 dark:border-slate-750 transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95 cursor-pointer"
              >
                <BookOpen className="w-5 h-5 text-red-500" />
                <span>{dict.hero.exploreCourses}</span>
              </Link>

              <a
                href="https://wa.me/917435961016?text=Hello%20The%20Safe%20Trading%2C%20I%20want%20to%20know%20more%20about%20your%20courses."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold text-base border border-emerald-200 dark:border-emerald-800 transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{dict.hero.chatWhatsApp}</span>
              </a>
            </div>
          </div>

          {/* Trust Stats Bar */}
          <div className="mt-14 pt-10 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {dict.hero.statStudents}
              </span>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {dict.hero.statStudentsLabel}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {dict.hero.statRating}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {dict.hero.statRatingLabel}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {dict.hero.statPractical}
              </span>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {dict.hero.statPracticalLabel}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {dict.hero.statSupport}
              </span>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {dict.hero.statSupportLabel}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-white dark:bg-[#0b0f19] border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-500">
                {dict.courses.badge}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white mt-1">
                {dict.courses.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {dict.courses.subtitle}
              </p>
            </div>

            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <span>{dict.courses.viewAll}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700'
              }`}
            >
              {dict.courses.tabAll}
            </button>
            <button
              onClick={() => setActiveTab('free')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'free'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/60 dark:border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {dict.courses.tabFree}
            </button>
            <button
              onClick={() => setActiveTab('options')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'options'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700'
              }`}
            >
              {dict.courses.tabOptions}
            </button>
            <button
              onClick={() => setActiveTab('price-action')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'price-action'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700'
              }`}
            >
              {dict.courses.tabPriceAction}
            </button>
            <button
              onClick={() => setActiveTab('crypto')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'crypto'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700'
              }`}
            >
              {dict.courses.tabCrypto}
            </button>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl h-80 border border-slate-200 dark:border-slate-700" />
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-700 dark:text-slate-300 font-semibold">{dict.courses.noCoursesFound}</p>
              <button
                onClick={() => setActiveTab('all')}
                className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs"
              >
                {dict.courses.resetFilters}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-us" className="py-24 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
              {dict.whyUs.badge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white mt-3">
              {dict.whyUs.title}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              {dict.whyUs.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyUsPoints.map((item, idx) => (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-red-500/40 dark:hover:border-red-500/50 transition-all duration-300 shadow-card hover:shadow-card-hover hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-white text-sm mb-4 shadow-2xs">
                    {item.badge}
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentors Section */}
      <section className="py-20 bg-white dark:bg-[#0b0f19] border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">
              {dict.mentors.badge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white mt-1">
              {dict.mentors.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {dict.mentors.subtitle}
            </p>
          </div>

          {/* Dynamic or curated mentors */}
          {(() => {
            const displayMentors = instructorsList.length > 0
              ? instructorsList.map((inst) => ({
                  name: inst.name,
                  role: inst.title || (language === 'gu' ? 'મુખ્ય ટ્રેડિંગ મેન્ટર' : 'Lead Trading Mentor'),
                  exp: inst.expertise ? inst.expertise.split(',')[0] : '8+ Years',
                  students: inst.students_count ? `${Number(inst.students_count).toLocaleString()}+` : '15,000+',
                  avatar: getMediaUrl(inst.avatar),
                  bio: inst.bio || (language === 'gu'
                    ? 'ભારતીય શેર બજારમાં ફૂલ-ટાઇમ ટ્રેડિંગ અને વિદ્યાર્થીઓને સ્વતંત્ર બનાવવાનો અનુભવ.'
                    : 'Professional full-time trader and mentor at The Safe Trading.')
                }))
              : mentors.map((m) => ({
                  ...m,
                  avatar: getMediaUrl(m.avatar)
                }));

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {displayMentors.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:border-red-500/40 dark:hover:border-red-500/50 transition-all shadow-card hover:shadow-card-hover hover:-translate-y-1"
                  >
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-24 h-24 rounded-2xl object-cover ring-2 ring-red-500/20 flex-shrink-0 bg-slate-100 dark:bg-slate-800"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name)}`;
                      }}
                    />
                    <div className="text-center sm:text-left flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-950 dark:text-white truncate">{m.name}</h3>
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-0.5 truncate">{m.role}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed line-clamp-3">{m.bio}</p>
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center sm:justify-start gap-6 text-xs text-slate-600 dark:text-slate-400">
                        <div>
                          <span className="font-bold text-slate-950 dark:text-white">{m.exp}</span> {dict.mentors.experience}
                        </div>
                        <div>
                          <span className="font-bold text-slate-950 dark:text-white">{m.students}</span> {dict.mentors.studentsTrained}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* 1-on-1 Counseling & Personal Mentorship Spotlight */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50 dark:from-[#0b0f19] dark:to-slate-900/60 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-950 rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden text-white flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30">
                <Video className="w-3.5 h-3.5" />
                <span>{language === 'gu' ? '૧-ઓન-૧ પર્સનલ કાઉન્સેલિંગ' : '1-on-1 Private Mentorship'}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {language === 'gu'
                  ? 'ટ્રેડિંગમાં સતત લોસ થાય છે? સીધા મેન્ટર સાથે લાઈવ ડિસ્કસ કરો'
                  : 'Stuck with Repeated Trading Losses? Review Your Trades Live With A Pro'}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {language === 'gu'
                  ? 'ગૂગલ મીટ પર તમારા ડિમેટ એકાઉન્ટના ટ્રેડ્સ શેર કરો, તમારી ભૂલો શોધો અને ગુજરાતીમાં ચોક્કસ રિસ્ક-મેનેજમેન્ટ પ્લાન મેળવો.'
                  : 'Book a dedicated 1-on-1 video consultation. Audit your real trades, fix emotional exits, and design a customized daily trading routine.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Portfolio & Stop-loss Audit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Options Expiry Strategies</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Psychology & Discipline Mastery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Available in Gujarati & English</span>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-auto shrink-0 relative z-10 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                to="/counseling"
                className="px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm sm:text-base transition-all shadow-lg shadow-red-600/30 active:scale-95 text-center flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>{language === 'gu' ? 'કાઉન્સેલિંગ સ્લોટ બુક કરો' : 'Book 1-on-1 Session'}</span>
              </Link>
              <a
                href="https://wa.me/917435961016?text=Hello%20The%20Safe%20Trading,%20I%20want%20to%20know%20more%20about%201-on-1%20Counseling"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Query</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Footer Action Banner */}
      <section className="py-20 bg-slate-950 text-white border-t border-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {language === 'gu'
              ? 'આજે જ શરૂ કરો તમારી ટ્રેડિંગ સફર'
              : 'Ready to Master Indian Stock Markets?'}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {language === 'gu'
              ? 'હજારો ગુજરાતી વિદ્યાર્થીઓ સાથે જોડાઈને શેર બજાર, ઓપ્શન્સ અને પ્રાઇસ એક્શનનું વ્યવહારુ શિક્ષણ મેળવો.'
              : 'Join thousands of traders mastering stock markets, options, and price action in Gujarati today.'}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/courses?price=free"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-base transition-all shadow-lg shadow-red-600/30 active:scale-95 cursor-pointer"
            >
              {dict.hero.startLearningFree}
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-base transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              {dict.auth.registerBtn}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
