import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Save, CheckCircle2, PlusCircle } from 'lucide-react';

export const AdminContentCMSPage: React.FC = () => {
  const [content, setContent] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hero' | 'promo' | 'testimonials' | 'faqs' | 'settings'>('hero');
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Hero state
  const [heroBadge, setHeroBadge] = useState('');
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubheadline, setHeroSubheadline] = useState('');
  const [heroCtaPrimary, setHeroCtaPrimary] = useState('');
  const [heroCtaSecondary, setHeroCtaSecondary] = useState('');

  // Promo Banner state
  const [promoActive, setPromoActive] = useState(true);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoCoupon, setPromoCoupon] = useState('');

  // Testimonials state
  const [testimonials, setTestimonials] = useState<any[]>([]);

  // FAQs state
  const [faqs, setFaqs] = useState<any[]>([]);

  // Platform Settings state
  const [platformName, setPlatformName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('$');

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/content');
      if (res.success && res.content) {
        const c = res.content;
        setContent(c);

        if (c.hero) {
          setHeroBadge(c.hero.badge || '');
          setHeroHeadline(c.hero.headline || '');
          setHeroSubheadline(c.hero.subheadline || '');
          setHeroCtaPrimary(c.hero.ctaPrimaryText || 'Explore Courses');
          setHeroCtaSecondary(c.hero.ctaSecondaryText || 'Get Started');
        }

        if (c.promo_banner) {
          setPromoActive(Boolean(c.promo_banner.isActive));
          setPromoMessage(c.promo_banner.message || '');
          setPromoCoupon(c.promo_banner.couponCode || '');
        }

        if (c.testimonials) setTestimonials(c.testimonials);
        if (c.faqs) setFaqs(c.faqs);

        if (c.settings) {
          setPlatformName(c.settings.platformName || 'TradeX Academy');
          setSupportEmail(c.settings.supportEmail || 'support@tradex.com');
          setSupportPhone(c.settings.supportPhone || '+1 (800) 555-0199');
          setCurrencySymbol(c.settings.currencySymbol || '$');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const saveSection = async (sectionKey: string, payload: any) => {
    try {
      const res = await api.put(`/admin/content/${sectionKey}`, payload);
      if (res.success) {
        setSavedMsg(`Saved section "${sectionKey}" successfully!`);
        setTimeout(() => setSavedMsg(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save content');
    }
  };

  const handleSaveHero = () => {
    const updatedHero = {
      ...(content.hero || {}),
      badge: heroBadge,
      headline: heroHeadline,
      subheadline: heroSubheadline,
      ctaPrimaryText: heroCtaPrimary,
      ctaSecondaryText: heroCtaSecondary
    };
    saveSection('hero', updatedHero);
  };

  const handleSavePromo = () => {
    const updatedPromo = {
      isActive: promoActive,
      message: promoMessage,
      couponCode: promoCoupon,
      link: '/courses'
    };
    saveSection('promo_banner', updatedPromo);
  };

  const handleSaveTestimonials = () => {
    saveSection('testimonials', testimonials);
  };

  const handleSaveFaqs = () => {
    saveSection('faqs', faqs);
  };

  const handleSaveSettings = () => {
    const updatedSettings = {
      ...(content.settings || {}),
      platformName,
      supportEmail,
      supportPhone,
      currencySymbol
    };
    saveSection('settings', updatedSettings);
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-medium">Loading website CMS content...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Website Customizer</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Content Management (CMS)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update student landing page banners, hero texts, reviews, and platform configurations with zero code edits.
          </p>
        </div>

        {savedMsg && (
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 self-start sm:self-auto bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" /> {savedMsg}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 text-xs font-semibold scrollbar-none">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Hero Banner
        </button>
        <button
          onClick={() => setActiveTab('promo')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'promo'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Top Promo Banner
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'testimonials'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Alumni Testimonials
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'faqs'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          FAQs
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Platform Settings
        </button>
      </div>

      {/* Tab 1: Hero */}
      {activeTab === 'hero' && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-6 max-w-4xl">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Top Badge Text
            </label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Main Headline
            </label>
            <input
              type="text"
              value={heroHeadline}
              onChange={(e) => setHeroHeadline(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Subheadline / Pitch
            </label>
            <textarea
              rows={3}
              value={heroSubheadline}
              onChange={(e) => setHeroSubheadline(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Primary CTA Text
              </label>
              <input
                type="text"
                value={heroCtaPrimary}
                onChange={(e) => setHeroCtaPrimary(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Secondary CTA Text
              </label>
              <input
                type="text"
                value={heroCtaSecondary}
                onChange={(e) => setHeroCtaSecondary(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            onClick={handleSaveHero}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Hero Banner</span>
          </button>
        </div>
      )}

      {/* Tab 2: Promo Banner */}
      {activeTab === 'promo' && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-6 max-w-4xl">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="promoCheck"
              checked={promoActive}
              onChange={(e) => setPromoActive(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <label htmlFor="promoCheck" className="text-xs font-semibold text-slate-800 cursor-pointer">
              Enable Promotional Header Bar
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Announcement Message
            </label>
            <input
              type="text"
              value={promoMessage}
              onChange={(e) => setPromoMessage(e.target.value)}
              placeholder="e.g. 🎉 Special Launch Offer: Get 50% OFF all courses with coupon code"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Featured Coupon Code
            </label>
            <input
              type="text"
              value={promoCoupon}
              onChange={(e) => setPromoCoupon(e.target.value.toUpperCase())}
              placeholder="LAUNCH50"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono uppercase text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={handleSavePromo}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Promo Banner</span>
          </button>
        </div>
      )}

      {/* Tab 3: Testimonials */}
      {activeTab === 'testimonials' && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-6 max-w-4xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Student Testimonials</h3>
            <button
              onClick={() =>
                setTestimonials(prev => [
                  ...prev,
                  {
                    name: 'New Student',
                    role: 'Software Engineer',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
                    content: 'Excellent course content and production quality.'
                  }
                ])
              }
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Add Testimonial
            </button>
          </div>

          <div className="space-y-4">
            {testimonials.map((t, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => {
                      const next = [...testimonials];
                      next[idx].name = e.target.value;
                      setTestimonials(next);
                    }}
                    placeholder="Student Name"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={t.role}
                    onChange={(e) => {
                      const next = [...testimonials];
                      next[idx].role = e.target.value;
                      setTestimonials(next);
                    }}
                    placeholder="Job Title & Company"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <textarea
                  rows={2}
                  value={t.content}
                  onChange={(e) => {
                    const next = [...testimonials];
                    next[idx].content = e.target.value;
                    setTestimonials(next);
                  }}
                  placeholder="Testimonial quote"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setTestimonials(prev => prev.filter((_, i) => i !== idx))}
                  className="text-xs text-rose-600 hover:text-rose-700 cursor-pointer font-medium"
                >
                  Remove Testimonial
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveTestimonials}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Testimonials</span>
          </button>
        </div>
      )}

      {/* Tab 4: FAQs */}
      {activeTab === 'faqs' && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-6 max-w-4xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Frequently Asked Questions</h3>
            <button
              onClick={() =>
                setFaqs(prev => [
                  ...prev,
                  { question: 'New Question', answer: 'Clear helpful answer.' }
                ])
              }
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Add FAQ
            </button>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => {
                    const next = [...faqs];
                    next[idx].question = e.target.value;
                    setFaqs(next);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => {
                    const next = [...faqs];
                    next[idx].answer = e.target.value;
                    setFaqs(next);
                  }}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setFaqs(prev => prev.filter((_, i) => i !== idx))}
                  className="text-xs text-rose-600 hover:text-rose-700 cursor-pointer font-medium"
                >
                  Remove FAQ
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveFaqs}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save FAQs</span>
          </button>
        </div>
      )}

      {/* Tab 5: Settings */}
      {activeTab === 'settings' && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-6 max-w-4xl">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Platform Name
            </label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Support Phone
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Currency Symbol
            </label>
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-24 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Platform Settings</span>
          </button>
        </div>
      )}
    </div>
  );
};
