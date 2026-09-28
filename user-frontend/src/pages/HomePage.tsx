import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { CourseCard, Course } from '../components/courses/CourseCard';
import { PromoBanner } from '../components/layout/PromoBanner';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Star,
  Users,
  Award,
  BookOpen,
  TrendingUp,
  Cpu,
  Database,
  Code,
  Layout,
  Cloud,
  ChevronDown,
  Quote,
  Compass
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cmsContent, setCmsContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [courseRes, catRes, contentRes] = await Promise.all([
          api.get('/courses?limit=12'),
          api.get('/categories'),
          api.get('/content')
        ]);

        if (courseRes.success) setCourses(courseRes.courses);
        if (catRes.success) setCategories(catRes.categories);
        if (contentRes.success) setCmsContent(contentRes.content);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const hero = cmsContent?.hero || {
    badge: '🚀 NEW: NEXT-GENERATION CAREER ROADMAPS 2026',
    headline: 'Master High-Income Tech Skills with Industry Veterans',
    subheadline: 'Learn data analytics, full-stack engineering, AI agents, and quantitative finance through production-ready projects, guided curriculums, and verifiable certificates.',
    ctaPrimaryText: 'Explore All Courses',
    ctaPrimaryLink: '/courses',
    ctaSecondaryText: 'Start Learning Free',
    ctaSecondaryLink: '/register',
    stats: [
      { label: 'Active Students', value: '45,000+' },
      { label: 'Course Completion Rate', value: '94.8%' },
      { label: 'Instructor Quality Score', value: '4.9/5' },
      { label: 'Global Alumni Network', value: '80+ Countries' }
    ]
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Database': return <Database className="w-6 h-6 text-emerald-400" />;
      case 'Code': return <Code className="w-6 h-6 text-cyan-400" />;
      case 'Cpu': return <Cpu className="w-6 h-6 text-purple-400" />;
      case 'TrendingUp': return <TrendingUp className="w-6 h-6 text-amber-400" />;
      case 'Cloud': return <Cloud className="w-6 h-6 text-blue-400" />;
      case 'Layout': return <Layout className="w-6 h-6 text-rose-400" />;
      default: return <BookOpen className="w-6 h-6 text-brand-400" />;
    }
  };

  const featuredCourses = courses.filter((c: any) => c.featured);
  const popularCourses = courses.filter((c: any) => c.popular);

  return (
    <div className="flex flex-col min-h-screen">
      <PromoBanner banner={cmsContent?.promo_banner} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800/60 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
        {/* Glow ambient effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-brand-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-brand-500/10 border border-brand-500/30 text-brand-300 shadow-sm mb-6 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>{hero.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
            Master High-Income Tech Skills with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-teal-300 to-cyan-400">
              Industry Veterans
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            {hero.subheadline}
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={hero.ctaPrimaryLink || '/courses'}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-base transition-all shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <span>{hero.ctaPrimaryText || 'Explore Courses'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to={hero.ctaSecondaryLink || '/register'}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-base border border-slate-700/80 transition-all flex items-center justify-center gap-2 hover:border-slate-600"
            >
              <Compass className="w-5 h-5 text-brand-400" />
              <span>{hero.ctaSecondaryText || 'Get Started'}</span>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 pt-12 border-t border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {hero.stats?.map((stat: any, idx: number) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges Bar */}
      <section className="py-8 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs uppercase tracking-wider text-slate-400 font-semibold mb-6">
            Trusted by engineers & analysts at industry leaders worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-60 grayscale hover:grayscale-0 transition-all">
            <span className="text-base sm:text-lg font-bold tracking-wider text-slate-300">GOOGLE</span>
            <span className="text-base sm:text-lg font-bold tracking-wider text-slate-300">AMAZON</span>
            <span className="text-base sm:text-lg font-bold tracking-wider text-slate-300">META</span>
            <span className="text-base sm:text-lg font-bold tracking-wider text-slate-300">MICROSOFT</span>
            <span className="text-base sm:text-lg font-bold tracking-wider text-slate-300">GOLDMAN SACHS</span>
            <span className="text-base sm:text-lg font-bold tracking-wider text-slate-300">STRIPE</span>
          </div>
        </div>
      </section>

      {/* Course Categories Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Curated Disciplines</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Explore High-Demand Categories</h2>
          </div>
          <Link
            to="/courses"
            className="text-sm font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 transition-colors"
          >
            <span>Browse All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/courses?category=${cat.slug}`}
              className="group p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-brand-500/40 hover:bg-slate-900 transition-all hover:shadow-lg hover:shadow-brand-500/5 hover:-translate-y-1 flex items-start gap-4"
            >
              <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/60 group-hover:scale-110 transition-transform">
                {getCategoryIcon(cat.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors truncate">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-400">
                  <span>{cat.course_count || 1} Courses available</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Handpicked Excellence</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Featured Masterclasses</h2>
            </div>
            <Link
              to="/courses"
              className="text-sm font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 transition-colors"
            >
              <span>View Full Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.length > 0
              ? featuredCourses.slice(0, 3).map((c) => <CourseCard key={c.id} course={c} />)
              : courses.slice(0, 3).map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </div>
      </section>

      {/* Popular & Trending Courses */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Student Favorites</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Most Popular Courses</h2>
          </div>
          <Link
            to="/courses?sort=popular"
            className="text-sm font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 transition-colors"
          >
            <span>See Top Rated</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularCourses.length > 0
            ? popularCourses.slice(0, 3).map((c) => <CourseCard key={c.id} course={c} />)
            : courses.slice(3, 6).map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      </section>

      {/* Why Choose Us & Learning Benefits */}
      <section id="why-us" className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Why TradeX Academy
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 tracking-tight">
              Engineered for Real-World Career Acceleration
            </h2>
            <p className="mt-4 text-base text-slate-400 leading-relaxed">
              We ditched shallow 10-minute tutorials to build deep, production-grade curriculums that prepare you for senior roles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Industry-Standard Curriculums',
                description: 'Built directly around what tier-1 tech firms and modern startups hire for today. Zero obsolete theories.',
                icon: <TargetIcon className="w-6 h-6 text-brand-400" />
              },
              {
                title: 'Real-World Production Projects',
                description: 'Build genuine GitHub-ready portfolio applications and executive business intelligence pipelines.',
                icon: <Code className="w-6 h-6 text-cyan-400" />
              },
              {
                title: 'Interactive Knowledge Checkpoints',
                description: 'Quizzes, downloadable code templates, cheat sheets, and hands-on drills embedded into every module.',
                icon: <CheckCircle className="w-6 h-6 text-purple-400" />
              },
              {
                title: 'Verifiable Digital Credentials',
                description: 'Earn cryptographic certificate codes that can be shared on LinkedIn or verified by prospective employers.',
                icon: <Award className="w-6 h-6 text-amber-400" />
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Testimonials */}
      <section id="testimonials" className="py-24 border-t border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Student Success</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">What Our Alumni Say</h2>
            <p className="mt-4 text-base text-slate-400">
              Thousands of students and working professionals have elevated their career trajectories with TradeX Academy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(cmsContent?.testimonials || [
              {
                name: 'James Rodriguez',
                role: 'Senior Data Analyst @ FinTech Global',
                avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
                rating: 5,
                content: 'The Data Analytics Masterclass directly helped me transition from a spreadsheet reporting analyst to leading our product analytics team. The course player and curriculum quality are second to none.'
              },
              {
                name: 'Amara Chen',
                role: 'Staff Software Engineer @ CloudScale',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
                rating: 5,
                content: 'The Next.js 15 and Distributed Cloud Architecture course gave me the exact mental model needed for enterprise microfrontends. Sarah teaching style is crisp, precise, and delightfully practical.'
              },
              {
                name: 'Liam O’Connor',
                role: 'Quantitative Analyst @ Alpha Capital',
                avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
                rating: 5,
                content: 'Marcus Vance breaks down market microstructure and statistical arbitrage better than most university graduate courses. The backtesting engine we built in class is running live strategies today.'
              }
            ]).map((t: any, idx: number) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between relative hover:border-slate-700 transition-all"
              >
                <div>
                  <Quote className="w-8 h-8 text-brand-500/20 mb-4" />
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    "{t.content}"
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-brand-500/30"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{t.name}</h4>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-24 border-t border-slate-800/80 bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Clear Answers</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Frequently Asked Questions</h2>
            <p className="mt-3 text-sm text-slate-400">Everything you need to know about enrollments, access, and certificates.</p>
          </div>

          <div className="space-y-4">
            {(cmsContent?.faqs || [
              {
                question: 'Do I get lifetime access to purchased courses?',
                answer: 'Yes! Once you enroll in any course, you retain permanent lifetime access to all current and future lessons, downloadable files, code repositories, and quizzes.'
              },
              {
                question: 'Will I receive a completion certificate?',
                answer: 'Absolutely. Upon finishing 100% of a course curriculum, our system generates an official, verifiable digital certificate featuring your name, the instructor signature, and a unique cryptographic verification ID.'
              },
              {
                question: 'Can I preview lessons before buying?',
                answer: 'Yes! Every course includes complimentary preview lessons marked in the curriculum list so you can inspect the teaching style and depth before purchasing.'
              },
              {
                question: 'Can I apply promotional coupons at checkout?',
                answer: 'Yes. Simply enter your coupon code (such as LAUNCH50 or EDTECH20) at checkout for an instant discount calculation.'
              },
              {
                question: 'What if I am a beginner in programming or analytics?',
                answer: 'Each course has a clearly marked difficulty level (Beginner, Intermediate, Advanced, All Levels). Beginner courses require zero prior coding experience and walk you step-by-step from zero.'
              }
            ]).map((faq: any, idx: number) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-white hover:text-brand-300 transition-colors"
                >
                  <span className="text-base">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-brand-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pre-Footer Action Banner */}
      <section className="py-20 bg-gradient-to-r from-brand-900/30 via-slate-900 to-cyan-950/30 border-t border-slate-800/80 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Accelerate Your Career?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Join over 45,000 students learning production-ready technical skills from proven engineering leaders today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/courses"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-base transition-all shadow-xl shadow-brand-500/20"
            >
              Browse All Courses
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base border border-slate-700 transition-all"
            >
              Create Free Student Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

function TargetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
