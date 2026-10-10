import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import {
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Globe,
  ArrowRight,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";

export const Footer: React.FC = () => {
  const { language, dict } = useLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{language === 'gu' ? 'સાપ્તાહિક માર્કેટ અપડેટ્સ' : 'Weekly Market Curations'}</span>
            </span>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {language === 'gu'
                ? 'ગુજરાતીમાં શેર બજાર અને ટ્રેડિંગ ન્યૂઝ મેળવો'
                : 'Stay Ahead with Gujarati Trading Insights'}
            </h3>
            <p className="mt-2 text-slate-400 text-sm leading-relaxed">
              {language === 'gu'
                ? 'નિફ્ટી અને બેંકનિફ્ટી એનાલિસિસ, પ્રાઇસ એક્શન ચેકલિસ્ટ અને નવી બેચની માહિતી સીધી તમારા ઇમેઇલ પર મેળવો.'
                : 'Get weekly chart breakdowns, option Greek setups, and educational checklists delivered to your inbox.'}
            </p>
          </div>

          <form
            onSubmit={handleSubscribe}
            className="w-full max-w-md flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <input
                type="email"
                required
                placeholder={language === 'gu' ? 'તમારો ઇમેઇલ એડ્રેસ દાખલ કરો' : 'Enter your email address'}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 flex-shrink-0 shadow-lg shadow-emerald-500/20"
            >
              <span>{language === 'gu' ? 'જોડાવો' : 'Subscribe'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
        {subscribed && (
          <p className="text-center text-emerald-400 text-xs mt-3 flex items-center justify-center gap-1.5 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{language === 'gu' ? 'આભાર! સબસ્ક્રિપ્શન કન્ફર્મ થઈ ગયું છે.' : 'Thank you for subscribing! Check your inbox.'}</span>
          </p>
        )}
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-teal-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <TrendingUp className="w-6 h-6 text-slate-950 stroke-[2.2]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              The Safe<span className="text-brand-400">Trading</span>
            </span>
          </Link>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            {dict.footer.aboutDesc}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>{language === 'gu' ? 'ચકાસાયેલ સર્ટિફિકેટ' : 'Verifiable Certificates'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-brand-400" />
              <span>{language === 'gu' ? '૨૫૬-બીટ SSL સુરક્ષિત' : '256-bit SSL Secure'}</span>
            </div>
          </div>
        </div>

        {/* Featured Programs */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            {dict.footer.coursesHeading}
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            <li>
              <Link to="/courses?category=cat-stock-basics" className="hover:text-brand-400 transition-colors">
                {language === 'gu' ? 'બેઝિક શેર બજાર' : 'Stock Market Basics'}
              </Link>
            </li>
            <li>
              <Link to="/courses?category=cat-price-action" className="hover:text-brand-400 transition-colors">
                {language === 'gu' ? 'પ્રાઇસ એક્શન માસ્ટરી' : 'Price Action Mastery'}
              </Link>
            </li>
            <li>
              <Link to="/courses?category=cat-options-trading" className="hover:text-brand-400 transition-colors">
                {language === 'gu' ? 'ઓપ્શન્સ & નિફ્ટી સ્ટ્રેટેજી' : 'Options & Nifty Expiry'}
              </Link>
            </li>
            <li>
              <Link to="/courses?category=cat-swing-trading" className="hover:text-brand-400 transition-colors">
                {language === 'gu' ? 'સ્વિંગ ટ્રેડિંગ & વેલ્થ' : 'Swing Trading & Wealth'}
              </Link>
            </li>
            <li>
              <Link to="/courses?category=cat-crypto-trading" className="hover:text-brand-400 transition-colors">
                {language === 'gu' ? 'ક્રિપ્ટો ટ્રેડિંગ ગાઇડ' : 'Crypto Trading Guide'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            {dict.footer.quickLinks}
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            <li>
              <Link to="/courses" className="hover:text-brand-400 transition-colors">
                {dict.courses.viewAll}
              </Link>
            </li>
            <li>
              <Link to="/my-courses" className="hover:text-brand-400 transition-colors text-emerald-400 font-medium">
                {dict.nav.myCourses}
              </Link>
            </li>
            <li>
              <Link to="/verify-certificate" className="hover:text-brand-400 transition-colors">
                {dict.nav.verifyCert}
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-brand-400 transition-colors">
                {dict.nav.dashboard}
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Contact */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            {dict.footer.contactHeading}
          </h4>
          <ul className="space-y-3 text-xs sm:text-sm">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="truncate">support@tradex.com</span>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>+91 98765 43210 (WhatsApp)</span>
            </li>
            <li className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{language === 'gu' ? 'અમદાવાદ, ગુજરાત, ભારત' : 'Ahmedabad, Gujarat, India'}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* SEBI Compliance & Disclaimer Warning Box */}
      <div className="border-t border-slate-800 bg-slate-900/60 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-start gap-3 text-xs text-slate-400 leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 block sm:inline mr-1">
              {dict.footer.sebiDisclaimerTitle}
            </span>
            <span>{dict.footer.sebiDisclaimer}</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-950 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{dict.footer.copyright}</p>
          <div className="flex items-center gap-6">
            <Link to="/#why-us" className="hover:text-slate-300">{dict.footer.privacyPolicy}</Link>
            <Link to="/#why-us" className="hover:text-slate-300">{dict.footer.termsConditions}</Link>
            <Link to="/#why-us" className="hover:text-slate-300">{dict.footer.refundPolicy}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
