import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { CourseCard, Course } from '../components/courses/CourseCard';
import { PromoBanner } from '../components/layout/PromoBanner';
import { useLanguage } from '../context/LanguageContext';
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
  BarChart3,
  CandlestickChart,
  Coins,
  ShieldAlert,
  ChevronDown,
  Quote,
  MessageCircle,
  PlayCircle,
  Check,
  HelpCircle
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { language, dict } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cmsContent, setCmsContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'free' | 'options' | 'price-action' | 'crypto'>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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

  // 6 Trading Highlights Data
  const highlightPillars = [
    {
      title: dict.highlights.pillar1Title,
      desc: dict.highlights.pillar1Desc,
      icon: <BarChart3 className="w-7 h-7 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-500/5',
      borderColor: 'border-emerald-500/30',
      tag: language === 'gu' ? 'Beginner Friendly' : 'Beginner Friendly',
      link: '/courses?category=cat-stock-basics'
    },
    {
      title: dict.highlights.pillar2Title,
      desc: dict.highlights.pillar2Desc,
      icon: <TrendingUp className="w-7 h-7 text-cyan-400" />,
      color: 'from-cyan-500/20 to-blue-500/5',
      borderColor: 'border-cyan-500/30',
      tag: language === 'gu' ? 'Pure Price Action' : 'Zero Indicators',
      link: '/courses?category=cat-price-action'
    },
    {
      title: dict.highlights.pillar3Title,
      desc: dict.highlights.pillar3Desc,
      icon: <Sparkles className="w-7 h-7 text-amber-400" />,
      color: 'from-amber-500/20 to-orange-500/5',
      borderColor: 'border-amber-500/30',
      tag: language === 'gu' ? 'Nifty & BankNifty' : 'Nifty & BankNifty',
      link: '/courses?category=cat-options-trading'
    },
    {
      title: dict.highlights.pillar4Title,
      desc: dict.highlights.pillar4Desc,
      icon: <CandlestickChart className="w-7 h-7 text-rose-400" />,
      color: 'from-rose-500/20 to-pink-500/5',
      borderColor: 'border-rose-500/30',
      tag: language === 'gu' ? 'Candlestick Secrets' : 'Price Secrets',
      link: '/courses?category=cat-price-action'
    },
    {
      title: dict.highlights.pillar5Title,
      desc: dict.highlights.pillar5Desc,
      icon: <Coins className="w-7 h-7 text-purple-400" />,
      color: 'from-purple-500/20 to-indigo-500/5',
      borderColor: 'border-purple-500/30',
      tag: language === 'gu' ? 'Crypto & Futures' : 'Crypto & Futures',
      link: '/courses?category=cat-crypto-trading'
    },
    {
      title: dict.highlights.pillar6Title,
      desc: dict.highlights.pillar6Desc,
      icon: <ShieldAlert className="w-7 h-7 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-500/5',
      borderColor: 'border-emerald-500/30',
      tag: language === 'gu' ? 'Capital Protection' : 'Capital Safety',
      link: '/courses?category=cat-psychology-risk'
    }
  ];

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

  // Testimonials in Gujarati & English
  // Testimonials in English as requested
  const testimonials = [
    {
      name: 'Pratik Patel',
      city: language === 'gu' ? 'અમદાવાદ (નવરંગપુરા)' : 'Ahmedabad (Navrangpura)',
      role: language === 'gu' ? 'Full-Time Options Trader' : 'Full-Time Options Trader',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      rating: 5,
      content: 'I used to lose capital every month following random Telegram tip channels. The Safe Trading’s Price Action & Risk Management course opened my eyes! Now I have strict setups, predefined entry points, and disciplined stop losses. Proud to be a consistently profitable trader.'
    },
    {
      name: 'Harshil Mehta',
      city: language === 'gu' ? 'સુરત (અડાજણ)' : 'Surat (Adajan)',
      role: language === 'gu' ? 'Textile Business Owner & Swing Trader' : 'Textile Business Owner & Swing Trader',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      rating: 5,
      content: 'I learned how to trade alongside running my textile business through the Swing Trading course. The best part is the practical live chart analysis without confusing financial jargon. Truly the most reliable trading education platform!'
    },
    {
      name: 'Neha Shah',
      city: language === 'gu' ? 'વડોદરા (અલકાપુરી)' : 'Vadodara (Alkapuri)',
      role: language === 'gu' ? 'Banking Professional & Options Trader' : 'Banking Professional & Options Trader',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      rating: 5,
      content: 'The Nifty & BankNifty Expiry Strategy course is simply phenomenal! How Option Greeks (Delta & Theta) work was explained with crystal clarity. Whenever I have a question during live market hours, the mentor team answers instantly on WhatsApp.'
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

  // FAQs Data
  const faqs = language === 'gu' ? [
    {
      q: 'શું સંપૂર્ણ નવો માણસ (Beginner) પણ આ કોર્સથી શેર બજાર શીખી શકે?',
      a: 'હા, ચોક્કસ! અમારો "બેઝિક શેર બજાર ફાઉન્ડેશન કોર્સ" બિલકુલ શૂન્યથી શરૂ થાય છે. ડીમેટ એકાઉન્ટ શું છે, શેર કેવી રીતે ખરીદવા-વેચવા, અને રિસ્ક કેવી રીતે કંટ્રોલ કરવું તે બધું સરળ ગુજરાતીમાં શીખવવામાં આવે છે.'
    },
    {
      q: 'શું શીખવા માટે મોંઘા લેપટોપની જરૂર છે કે મોબાઈલથી શીખી શકાય?',
      a: 'તમે કોઈપણ સાધન — તમારા એન્ડ્રોઇડ કે આઈફોન મોબાઈલ, ટેબ્લેટ અથવા લેપટોપ પરથી આરામથી વિડિયો જોઈ શકો છો. અમારું પ્લેટફોર્મ ૧૦૦% મોબાઈલ ફ્રેન્ડલી છે.'
    },
    {
      q: 'કોર્સ ખરીદ્યા પછી વિડિયો કેટલા સમય સુધી જોઈ શકાશે?',
      a: 'તમામ કોર્સમાં લાઈફટાઈમ (આજીવન) અનલિમિટેડ એક્સેસ મળે છે! તમે ગમે ત્યારે, ગમે તેટલી વાર વિડિયો રિવિઝન કરી શકો છો. ભવિષ્યમાં ઉમેરાતા નવા વિડિયો પણ મફત મળશે.'
    },
    {
      q: 'જો મને કોઈ સવાલ કે શંકા હોય તો માર્ગદર્શન કેવી રીતે મળશે?',
      a: 'દરેક વિદ્યાર્થીને અમારો ડેડિકેટેડ વોટ્સએપ મેન્ટર સપોર્ટ મળે છે. તમે તમારા ચાર્ટના સ્ક્રીનશોટ મોકલીને મેન્ટર પાસેથી સીધો પ્રતિસાદ મેળવી શકો છો.'
    },
    {
      q: 'શું તમે લાઈવ ટ્રેડિંગ ટીપ્સ કે કોલ્સ આપો છો?',
      a: 'ના. અમે કોઈ ટીપ્સ આપતા નથી. અમે તમને ૧૦૦% સાચું શિક્ષણ આપીએ છીએ જેથી તમે જાતે ચાર્ટ રીડ કરીને આત્મનિર્ભર બનીને ટ્રેડિંગ કરી શકો.'
    }
  ] : [
    {
      q: 'Can complete beginners with no financial background learn?',
      a: 'Yes, absolutely! Our Stock Market Basics course starts from scratch. We explain Demat accounts, how to place orders, and risk management in plain language.'
    },
    {
      q: 'Can I learn using a mobile phone without an expensive laptop?',
      a: 'Yes. Our learning player is fully mobile-optimized. You can watch lessons, download cheat sheets, and take quizzes on Android, iOS, or laptops.'
    },
    {
      q: 'How long do I have access to course lessons after enrolling?',
      a: 'You get lifetime unlimited access to all videos, downloadable resources, and future curriculum updates.'
    },
    {
      q: 'How can I clear my doubts while studying?',
      a: 'Enrolled students receive dedicated WhatsApp mentor support to clarify concepts and review chart patterns directly with educators.'
    },
    {
      q: 'Do you provide stock tips or trading calls?',
      a: 'No. We strictly adhere to education only. We teach you how to analyze charts independently without depending on external tip channels.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <PromoBanner banner={cmsContent?.promo_banner} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-20 lg:pt-14 lg:pb-28 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900/70 to-slate-950">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[350px] bg-teal-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-12 left-10 w-[350px] h-[300px] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Top Gujarat Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shadow-sm mb-6 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{dict.hero.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.18]">
              {dict.hero.headlinePart1}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                {dict.hero.headlineHighlight}
              </span>{' '}
              {dict.hero.headlinePart2}
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-sm sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
              {dict.hero.description}
            </p>

            {/* Trust Pill Highlights */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'gu' ? 'સરળ Gujlish ભાષા' : 'Simple Gujlish Language'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-teal-300">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                {language === 'gu' ? 'No Tips • Pure Learning' : 'No Tips • Pure Learning'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-300">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {language === 'gu' ? 'Digital Certificate Included' : 'Digital Certificate Included'}
              </span>
            </div>

            {/* Action CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/courses?price=free"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <span>{dict.hero.startLearningFree}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/courses"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-base border border-slate-750 transition-all flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5 text-brand-400" />
                <span>{dict.hero.exploreCourses}</span>
              </Link>

              <a
                href="https://wa.me/919876543210?text=Hello%20The%20Safe%20Trading%2C%20I%20want%20to%20know%20more%20about%20your%20courses."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-bold text-base border border-emerald-500/30 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <span>{dict.hero.chatWhatsApp}</span>
              </a>
            </div>
          </div>

          {/* Hero Visual Feature Dashboard Mockup */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl p-2 bg-gradient-to-b from-slate-800/80 via-slate-900/60 to-slate-950 border border-slate-750 shadow-2xl relative">
            <div className="rounded-2xl bg-slate-950/95 border border-slate-800/80 p-5 sm:p-7 overflow-hidden">
              {/* Header Bar Mockup */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="ml-2 font-mono text-[11px] text-slate-400">thesafetrading.in / live-classroom</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Live Market Ready
                  </span>
                  <span className="hidden sm:inline text-slate-400">• High Accuracy Price Action</span>
                </div>
              </div>

              {/* Internal Grid Inside Visual */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
                {/* Visual Card 1 */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <CandlestickChart className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Pure Price Action</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Support, Resistance & Chart Patterns</p>
                  </div>
                </div>

                {/* Visual Card 2 */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 flex-shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Nifty & BankNifty Options</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Greeks (Delta/Theta) & Expiry Rules</p>
                  </div>
                </div>

                {/* Visual Card 3 */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Capital Protection First</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Strict Stop Loss & 1:2 Risk-Reward</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Stats Bar */}
          <div className="mt-14 pt-10 border-t border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {dict.hero.statStudents}
              </span>
              <span className="text-xs sm:text-sm text-slate-400 mt-1">
                {dict.hero.statStudentsLabel}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {dict.hero.statRating}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-slate-400 mt-1">
                {dict.hero.statRatingLabel}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {dict.hero.statPractical}
              </span>
              <span className="text-xs sm:text-sm text-slate-400 mt-1">
                {dict.hero.statPracticalLabel}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-300">
                {dict.hero.statSupport}
              </span>
              <span className="text-xs sm:text-sm text-slate-400 mt-1">
                {dict.hero.statSupportLabel}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Trading Highlights (Gujju The Trader Inspired) */}
      <section className="py-20 bg-slate-900/40 border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/20">
              {dict.highlights.sectionBadge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3 leading-tight">
              {dict.highlights.sectionTitle}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400">
              {dict.highlights.sectionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlightPillars.map((pillar, idx) => (
              <Link
                key={idx}
                to={pillar.link}
                className={`p-6 rounded-2xl bg-gradient-to-br ${pillar.color} bg-slate-900/90 border ${pillar.borderColor} hover:border-brand-400/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 shadow-md">
                      {pillar.icon}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-950/80 text-slate-300 border border-slate-800">
                      {pillar.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-brand-400 group-hover:text-brand-300">
                  <span>{language === 'gu' ? 'કોર્સ વિશે વધુ જાણો' : 'Explore Curriculum'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                {dict.courses.badge}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
                {dict.courses.title}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {dict.courses.subtitle}
              </p>
            </div>

            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-400 hover:text-brand-300 transition-colors"
            >
              <span>{dict.courses.viewAll}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-slate-800 pb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {dict.courses.tabAll}
            </button>
            <button
              onClick={() => setActiveTab('free')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'free'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-emerald-400 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {dict.courses.tabFree}
            </button>
            <button
              onClick={() => setActiveTab('options')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'options'
                  ? 'bg-brand-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {dict.courses.tabOptions}
            </button>
            <button
              onClick={() => setActiveTab('price-action')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'price-action'
                  ? 'bg-brand-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {dict.courses.tabPriceAction}
            </button>
            <button
              onClick={() => setActiveTab('crypto')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'crypto'
                  ? 'bg-brand-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {dict.courses.tabCrypto}
            </button>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-900 rounded-2xl h-80 border border-slate-800" />
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
              <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-300 font-semibold">{dict.courses.noCoursesFound}</p>
              <button
                onClick={() => setActiveTab('all')}
                className="mt-4 px-4 py-2 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs"
              >
                {dict.courses.resetFilters}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-us" className="py-24 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {dict.whyUs.badge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">
              {dict.whyUs.title}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400">
              {dict.whyUs.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyUsPoints.map((item, idx) => (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-sm mb-4">
                    {item.badge}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentors Section */}
      <section className="py-20 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              {dict.mentors.badge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              {dict.mentors.title}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {dict.mentors.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {mentors.map((m, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:border-slate-700 transition-all"
              >
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-24 h-24 rounded-2xl object-cover ring-2 ring-emerald-500/40 flex-shrink-0"
                />
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-bold text-white">{m.name}</h3>
                  <p className="text-xs font-semibold text-emerald-400 mt-0.5">{m.role}</p>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">{m.bio}</p>
                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-center sm:justify-start gap-6 text-xs text-slate-300">
                    <div>
                      <span className="font-bold text-white">{m.exp}</span> {dict.mentors.experience}
                    </div>
                    <div>
                      <span className="font-bold text-white">{m.students}</span> {dict.mentors.studentsTrained}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Testimonials */}
      <section id="testimonials" className="py-24 border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {dict.testimonials.badge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              {dict.testimonials.title}
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              {dict.testimonials.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between relative hover:border-emerald-500/30 transition-all"
              >
                <div>
                  <Quote className="w-7 h-7 text-emerald-500/30 mb-3" />
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                    "{t.content}"
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{t.name}</h4>
                    <p className="text-[11px] text-emerald-400">{t.city}</p>
                    <p className="text-[10px] text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-24 border-b border-slate-800/80 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              {dict.faqs.badge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              {dict.faqs.title}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {dict.faqs.subtitle}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-white hover:text-brand-300 transition-colors"
                >
                  <span className="text-sm sm:text-base pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                      openFaq === idx ? 'rotate-180 text-brand-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Additional Help Prompt */}
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="text-white font-bold text-sm sm:text-base">
                {dict.faqs.haveQuestions}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'gu'
                  ? 'અમારા ગુજરાતી ટ્રેડિંગ મેન્ટર સાથે વોટ્સએપ પર સીધી વાત કરો.'
                  : 'Chat directly with our Gujarati trading mentor on WhatsApp.'}
              </p>
            </div>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{dict.faqs.whatsappUs}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Pre-Footer Action Banner */}
      <section className="py-20 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-teal-950/30 border-t border-slate-800/80 relative overflow-hidden">
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
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base transition-all shadow-xl shadow-emerald-500/20"
            >
              {dict.hero.startLearningFree}
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base border border-slate-700 transition-all"
            >
              {dict.auth.registerBtn}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
