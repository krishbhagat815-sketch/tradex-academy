import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { getMediaUrl } from '../utils/media';
import {
  Save,
  CheckCircle2,
  PlusCircle,
  Palette,
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Eye,
  TrendingUp,
  BarChart3,
  LineChart,
  Activity,
  ShieldCheck,
  GraduationCap,
  Flame,
  Zap,
  Loader2,
  Globe
} from 'lucide-react';

const AVAILABLE_ICONS = [
  { id: 'TrendingUp', label: 'Trending Up', icon: TrendingUp },
  { id: 'BarChart3', label: 'Bar Chart', icon: BarChart3 },
  { id: 'LineChart', label: 'Line Chart', icon: LineChart },
  { id: 'Activity', label: 'Live Activity', icon: Activity },
  { id: 'ShieldCheck', label: 'Shield & Trust', icon: ShieldCheck },
  { id: 'GraduationCap', label: 'Education Cap', icon: GraduationCap },
  { id: 'Flame', label: 'Flame / Momentum', icon: Flame },
  { id: 'Zap', label: 'Lightning / Speed', icon: Zap }
];

const PRESET_ICON_COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Sky Blue', hex: '#0ea5e9' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'White', hex: '#ffffff' }
];

const PRESET_BG_COLORS = [
  { name: 'Slate 950', hex: '#020617' },
  { name: 'Pitch Black', hex: '#000000' },
  { name: 'Dark Emerald', hex: '#064e3b' },
  { name: 'Midnight', hex: '#0f172a' },
  { name: 'Clean White', hex: '#ffffff' }
];

const PRESET_SECONDARY_COLORS = [
  { name: 'Emerald Green', hex: '#16a34a' },
  { name: 'Ruby Red', hex: '#dc2626' },
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Amber Gold', hex: '#d97706' },
  { name: 'Purple', hex: '#7c3aed' }
];

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  TrendingUp,
  BarChart3,
  LineChart,
  Activity,
  ShieldCheck,
  GraduationCap,
  Flame,
  Zap
};

export const AdminContentCMSPage: React.FC = () => {
  const [content, setContent] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'logo' | 'hero' | 'promo' | 'testimonials' | 'faqs' | 'settings'>('logo');
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Brand & Logo state
  const [logoType, setLogoType] = useState<'icon' | 'image'>('icon');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [brandNamePrimary, setBrandNamePrimary] = useState('The Safe');
  const [brandNameSecondary, setBrandNameSecondary] = useState('Trading');
  const [brandSecondaryColor, setBrandSecondaryColor] = useState('#16a34a');
  const [brandTagline, setBrandTagline] = useState('ગુજરાતનું શ્રેષ્ઠ શેર બજાર અને ટ્રેડિંગ શિક્ષણ');
  const [iconName, setIconName] = useState('TrendingUp');
  const [iconColor, setIconColor] = useState('#ef4444');
  const [bgColor, setBgColor] = useState('#020617');
  const [borderRadius, setBorderRadius] = useState('rounded-xl');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

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
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  // WhatsApp Configuration state
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('917435961016');
  const [whatsappMessage, setWhatsappMessage] = useState('Hello, I would like to know more about your courses.');

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/content');
      if (res.success && res.content) {
        const c = res.content;
        setContent(c);

        if (c.logo) {
          if (c.logo.logoType) setLogoType(c.logo.logoType);
          if (c.logo.logoUrl !== undefined) setLogoUrl(c.logo.logoUrl);
          if (c.logo.faviconUrl !== undefined) setFaviconUrl(c.logo.faviconUrl);
          if (c.logo.brandNamePrimary) setBrandNamePrimary(c.logo.brandNamePrimary);
          if (c.logo.brandNameSecondary) setBrandNameSecondary(c.logo.brandNameSecondary);
          if (c.logo.brandSecondaryColor) setBrandSecondaryColor(c.logo.brandSecondaryColor);
          if (c.logo.brandTagline !== undefined) setBrandTagline(c.logo.brandTagline);
          if (c.logo.iconName) setIconName(c.logo.iconName);
          if (c.logo.iconColor) setIconColor(c.logo.iconColor);
          if (c.logo.bgColor) setBgColor(c.logo.bgColor);
          if (c.logo.borderRadius) setBorderRadius(c.logo.borderRadius);
        }

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
          setPlatformName(c.settings.platformName || 'The Safe Trading Academy');
          setSupportEmail(c.settings.supportEmail || 'support@tradex.com');
          setSupportPhone(c.settings.supportPhone || '+91 7435961016');
          setCurrencySymbol(c.settings.currencySymbol || '₹');
          setWhatsappEnabled(c.settings.whatsapp_enabled !== false);
          setWhatsappNumber(c.settings.whatsapp_number || '917435961016');
          setWhatsappMessage(c.settings.whatsapp_default_message || 'Hello, I would like to know more about your courses.');
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
        setTimeout(() => setSavedMsg(null), 3500);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save content');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Logo image must be less than 10MB.');
      return;
    }

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/upload', formData);
      if (res.success && res.url) {
        setLogoUrl(res.url);
        setLogoType('image');
      } else {
        throw new Error(res.message || 'Logo upload failed');
      }
    } catch (err: any) {
      console.warn('Server upload failed, converting to local data URL:', err);
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setLogoUrl(loadEvt.target.result as string);
          setLogoType('image');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Favicon must be less than 2MB.');
      return;
    }

    setUploadingFavicon(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/upload', formData);
      if (res.success && res.url) {
        setFaviconUrl(res.url);
      } else {
        throw new Error(res.message || 'Favicon upload failed');
      }
    } catch (err: any) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setFaviconUrl(loadEvt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingFavicon(false);
      e.target.value = '';
    }
  };

  const handleSaveLogo = () => {
    const updatedLogo = {
      ...(content.logo || {}),
      logoType,
      logoUrl: logoUrl.trim(),
      faviconUrl: faviconUrl.trim(),
      brandNamePrimary: brandNamePrimary.trim() || 'The Safe',
      brandNameSecondary: brandNameSecondary.trim() || 'Trading',
      brandSecondaryColor: brandSecondaryColor || '#16a34a',
      brandTagline: brandTagline.trim(),
      iconName,
      iconColor,
      bgColor,
      borderRadius
    };
    saveSection('logo', updatedLogo);
  };

  const handleResetLogoDefaults = () => {
    if (!window.confirm('Reset Brand & Logo settings to default?')) return;
    setLogoType('icon');
    setLogoUrl('');
    setFaviconUrl('');
    setBrandNamePrimary('The Safe');
    setBrandNameSecondary('Trading');
    setBrandSecondaryColor('#16a34a');
    setBrandTagline('ગુજરાતનું શ્રેષ્ઠ શેર બજાર અને ટ્રેડિંગ શિક્ષણ');
    setIconName('TrendingUp');
    setIconColor('#ef4444');
    setBgColor('#020617');
    setBorderRadius('rounded-xl');
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
      currencySymbol,
      whatsapp_enabled: whatsappEnabled,
      whatsapp_number: whatsappNumber,
      whatsapp_default_message: whatsappMessage
    };
    saveSection('settings', updatedSettings);
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-medium">Loading website CMS content...</div>;
  }

  const SelectedPreviewIcon = ICON_MAP[iconName] || TrendingUp;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Website Customizer</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Content Management (CMS)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update brand logo, header, student landing page banners, reviews, and platform configurations with zero code edits.
          </p>
        </div>

        {savedMsg && (
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 self-start sm:self-auto bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" /> {savedMsg}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 text-xs font-semibold scrollbar-none">
        <button
          onClick={() => setActiveTab('logo')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'logo'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Brand & Logo CMS</span>
        </button>
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Hero Banner
        </button>
        <button
          onClick={() => setActiveTab('promo')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'promo'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Top Promo Banner
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'testimonials'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Alumni Testimonials
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'faqs'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          FAQs
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Platform Settings
        </button>
      </div>

      {/* Tab 0: Brand & Logo CMS */}
      {activeTab === 'logo' && (
        <div className="space-y-6 max-w-5xl">
          {/* Live Preview Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold tracking-tight">Live Interactive Website Preview</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Real-time preview across themes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Light Mode Navbar Mockup */}
              <div className="rounded-xl bg-white p-4 text-slate-900 shadow-md border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Light Theme Navbar
                </span>
                <div className="flex items-center gap-3">
                  {logoType === 'image' && logoUrl ? (
                    <div className={`w-10 h-10 ${borderRadius} flex items-center justify-center overflow-hidden border border-slate-200 bg-slate-50 shadow-xs`}>
                      <img
                        src={getMediaUrl(logoUrl)}
                        alt="Logo"
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-10 h-10 ${borderRadius} flex items-center justify-center shadow-md border border-slate-800`}
                      style={{ backgroundColor: bgColor }}
                    >
                      <SelectedPreviewIcon
                        className="w-6 h-6 stroke-[2.4]"
                        style={{ color: iconColor }}
                      />
                    </div>
                  )}

                  <div className="flex flex-col">
                    <span className="text-xl font-extrabold tracking-tight text-slate-950 flex items-center gap-1.5 leading-tight">
                      {brandNamePrimary}
                      <span style={{ color: brandSecondaryColor }} className="font-black">
                        {brandNameSecondary}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium font-gujarati -mt-0.5 truncate max-w-[200px]">
                      {brandTagline}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dark Mode Navbar Mockup */}
              <div className="rounded-xl bg-[#0b0f19] p-4 text-white shadow-md border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Dark Theme Navbar
                </span>
                <div className="flex items-center gap-3">
                  {logoType === 'image' && logoUrl ? (
                    <div className={`w-10 h-10 ${borderRadius} flex items-center justify-center overflow-hidden border border-slate-800 bg-slate-900/50 shadow-xs`}>
                      <img
                        src={getMediaUrl(logoUrl)}
                        alt="Logo"
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-10 h-10 ${borderRadius} flex items-center justify-center shadow-md border border-slate-800`}
                      style={{ backgroundColor: bgColor }}
                    >
                      <SelectedPreviewIcon
                        className="w-6 h-6 stroke-[2.4]"
                        style={{ color: iconColor }}
                      />
                    </div>
                  )}

                  <div className="flex flex-col">
                    <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5 leading-tight">
                      {brandNamePrimary}
                      <span style={{ color: brandSecondaryColor }} className="font-black">
                        {brandNameSecondary}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium font-gujarati -mt-0.5 truncate max-w-[200px]">
                      {brandTagline}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section 1: Logo Graphic & Mode */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>Logo Graphic Asset</span>
                </h3>

                {/* Mode Switch Pills */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setLogoType('image')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      logoType === 'image'
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Image Logo
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoType('icon')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      logoType === 'icon'
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Vector Icon
                  </button>
                </div>
              </div>

              {/* Image Upload Area */}
              {logoType === 'image' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 transition-colors bg-slate-50/50 flex flex-col items-center justify-center text-center">
                    {logoUrl ? (
                      <div className="space-y-3 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center overflow-hidden p-2">
                          <img
                            src={getMediaUrl(logoUrl)}
                            alt="Uploaded Logo"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Change Image</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml,image/webp"
                              disabled={uploadingLogo}
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setLogoUrl('')}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                          {uploadingLogo ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <Upload className="w-6 h-6" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {uploadingLogo ? 'Uploading logo...' : 'Upload Brand Logo Image'}
                        </span>
                        <p className="text-[11px] text-slate-500 max-w-xs">
                          Recommended format: Transparent PNG or SVG. Max file size: 10MB.
                        </p>
                        <label className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs inline-flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Logo File</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                            disabled={uploadingLogo}
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Direct URL Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Or Direct Image URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://... or /uploads/..."
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Vector Icon Mode */}
              {logoType === 'icon' && (
                <div className="space-y-4">
                  {/* Select Icon */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Select Icon
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {AVAILABLE_ICONS.map((item) => {
                        const Icon = item.icon;
                        const isSelected = iconName === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setIconName(item.id)}
                            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <Icon className="w-5 h-5 stroke-[2.2]" />
                            <span className="text-[10px] font-medium truncate w-full text-center">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Icon Color */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Icon Color
                      </label>
                      <span className="text-xs font-mono font-semibold text-slate-500">{iconColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={iconColor}
                        onChange={(e) => setIconColor(e.target.value)}
                        className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                      />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {PRESET_ICON_COLORS.map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setIconColor(c.hex)}
                            title={c.name}
                            style={{ backgroundColor: c.hex }}
                            className={`w-6 h-6 rounded-lg border border-slate-300/80 cursor-pointer transition-transform hover:scale-110 ${
                              iconColor === c.hex ? 'ring-2 ring-offset-1 ring-slate-900' : ''
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Background Color */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Container Background Color
                      </label>
                      <span className="text-xs font-mono font-semibold text-slate-500">{bgColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                      />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {PRESET_BG_COLORS.map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setBgColor(c.hex)}
                            title={c.name}
                            style={{ backgroundColor: c.hex }}
                            className={`w-6 h-6 rounded-lg border border-slate-300/80 cursor-pointer transition-transform hover:scale-110 ${
                              bgColor === c.hex ? 'ring-2 ring-offset-1 ring-slate-900' : ''
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Corner Radius */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Border Corner Radius
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'rounded-xl', label: 'Rounded XL' },
                        { id: 'rounded-2xl', label: 'Pill 2XL' },
                        { id: 'rounded-full', label: 'Circle' },
                        { id: 'rounded-lg', label: 'Subtle LG' }
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setBorderRadius(r.id)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            borderRadius === r.id
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Brand Text & Favicon */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>Brand Typography & Favicon</span>
                </h3>
              </div>

              {/* Primary & Secondary Brand Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Primary Brand Text
                  </label>
                  <input
                    type="text"
                    value={brandNamePrimary}
                    onChange={(e) => setBrandNamePrimary(e.target.value)}
                    placeholder="The Safe"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">e.g. "The Safe"</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Accent Brand Text
                  </label>
                  <input
                    type="text"
                    value={brandNameSecondary}
                    onChange={(e) => setBrandNameSecondary(e.target.value)}
                    placeholder="Trading"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">e.g. "Trading"</p>
                </div>
              </div>

              {/* Accent Text Color */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Accent Text Color
                  </label>
                  <span className="text-xs font-mono font-semibold text-slate-500">{brandSecondaryColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandSecondaryColor}
                    onChange={(e) => setBrandSecondaryColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {PRESET_SECONDARY_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setBrandSecondaryColor(c.hex)}
                        title={c.name}
                        style={{ backgroundColor: c.hex }}
                        className={`w-6 h-6 rounded-lg border border-slate-300/80 cursor-pointer transition-transform hover:scale-110 ${
                          brandSecondaryColor === c.hex ? 'ring-2 ring-offset-1 ring-slate-900' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Brand Tagline (Shown in Navbar Subtitle)
                </label>
                <input
                  type="text"
                  value={brandTagline}
                  onChange={(e) => setBrandTagline(e.target.value)}
                  placeholder="ગુજરાતનું શ્રેષ્ઠ શેર બજાર અને ટ્રેડિંગ શિક્ષણ"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-gujarati focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Browser Tab Favicon */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Browser Tab Icon (Favicon)</span>
                  </label>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setFaviconUrl(logoUrl)}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer underline"
                    >
                      Use Main Logo as Favicon
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-300 flex items-center justify-center overflow-hidden p-1 shadow-xs flex-shrink-0">
                    {faviconUrl ? (
                      <img src={getMediaUrl(faviconUrl)} alt="Favicon" className="w-full h-full object-contain" />
                    ) : (
                      <Globe className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  <label className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs">
                    {uploadingFavicon ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>Upload Favicon</span>
                    <input
                      type="file"
                      accept=".ico,.png,.svg,.webp"
                      disabled={uploadingFavicon}
                      onChange={handleFaviconUpload}
                      className="hidden"
                    />
                  </label>

                  {faviconUrl && (
                    <button
                      type="button"
                      onClick={() => setFaviconUrl('')}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Or favicon URL: /favicon.svg or https://..."
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveLogo}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Brand & Logo Settings</span>
            </button>

            <button
              type="button"
              onClick={handleResetLogoDefaults}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </div>
      )}

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
              Subheadline / Description
            </label>
            <textarea
              rows={3}
              value={heroSubheadline}
              onChange={(e) => setHeroSubheadline(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Primary CTA Button
              </label>
              <input
                type="text"
                value={heroCtaPrimary}
                onChange={(e) => setHeroCtaPrimary(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Secondary CTA Button
              </label>
              <input
                type="text"
                value={heroCtaSecondary}
                onChange={(e) => setHeroCtaSecondary(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              id="promoActive"
              checked={promoActive}
              onChange={(e) => setPromoActive(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <label htmlFor="promoActive" className="text-xs font-bold text-slate-800 cursor-pointer">
              Enable Top Promotional Bar
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
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Promotional Coupon Code
            </label>
            <input
              type="text"
              value={promoCoupon}
              onChange={(e) => setPromoCoupon(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={handleSavePromo}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Promo Bar</span>
          </button>
        </div>
      )}

      {/* Tab 3: Testimonials */}
      {activeTab === 'testimonials' && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-6 max-w-4xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Alumni Feedback & Reviews</h3>
            <button
              onClick={() => {
                setTestimonials([
                  ...testimonials,
                  {
                    name: 'New Trader',
                    role: 'Swing Trader',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                    content: 'Excellent course content and production quality.'
                  }
                ]);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Testimonial</span>
            </button>
          </div>

          <div className="space-y-4">
            {testimonials.map((t, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group">
                <button
                  onClick={() => {
                    const next = [...testimonials];
                    next.splice(idx, 1);
                    setTestimonials(next);
                  }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-600 text-xs font-semibold cursor-pointer"
                >
                  Delete
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Student Name</label>
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) => {
                        const next = [...testimonials];
                        next[idx].name = e.target.value;
                        setTestimonials(next);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Role / Title</label>
                    <input
                      type="text"
                      value={t.role}
                      onChange={(e) => {
                        const next = [...testimonials];
                        next[idx].role = e.target.value;
                        setTestimonials(next);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Review Quote</label>
                  <textarea
                    rows={2}
                    value={t.content}
                    onChange={(e) => {
                      const next = [...testimonials];
                      next[idx].content = e.target.value;
                      setTestimonials(next);
                    }}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
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
            <h3 className="text-sm font-bold text-slate-900">Frequently Asked Questions</h3>
            <button
              onClick={() => {
                setFaqs([
                  ...faqs,
                  {
                    question: 'Can beginners join this course?',
                    answer: 'Yes, our courses start from basic foundation and build up to advanced professional trading.'
                  }
                ]);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add FAQ</span>
            </button>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group">
                <button
                  onClick={() => {
                    const next = [...faqs];
                    next.splice(idx, 1);
                    setFaqs(next);
                  }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-600 text-xs font-semibold cursor-pointer"
                >
                  Delete
                </button>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Question</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => {
                      const next = [...faqs];
                      next[idx].question = e.target.value;
                      setFaqs(next);
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Answer</label>
                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => {
                      const next = [...faqs];
                      next[idx].answer = e.target.value;
                      setFaqs(next);
                    }}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
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

          {/* WhatsApp Integration Card */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>WhatsApp Contact Floating Button</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure the floating WhatsApp live support button displayed to all website visitors.
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800">
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Enable WhatsApp Button</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  WhatsApp Number (with country code, no + or spaces)
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="917435961016"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Default: 917435961016 (Live link: https://wa.me/{whatsappNumber})
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Default Chat Message
                </label>
                <input
                  type="text"
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  placeholder="Hello, I would like to know more about your courses."
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Pre-filled text when a student clicks the WhatsApp button.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Platform & WhatsApp Settings</span>
          </button>
        </div>
      )}
    </div>
  );
};
