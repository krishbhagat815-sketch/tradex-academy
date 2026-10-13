import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import {
  TrendingUp,
  ShieldCheck,
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

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm transition-colors">

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-md border border-slate-800">
              <TrendingUp className="w-6 h-6 text-red-500 stroke-[2.2]" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              The Safe<span className="text-red-600">Trading</span>
            </span>
          </Link>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
            {dict.footer.aboutDesc}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{language === 'gu' ? 'ચકાસાયેલ સર્ટિફિકેટ' : 'Verifiable Certificates'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>{language === 'gu' ? '૨૫૬-બીટ SSL સુરક્ષિત' : '256-bit SSL Secure'}</span>
            </div>
          </div>
        </div>

        {/* Featured Programs */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            {dict.footer.coursesHeading}
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            <li>
              <Link to="/courses?category=cat-stock-basics" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                {language === 'gu' ? 'બેઝિક શેર બજાર' : 'Stock Market Basics'}
              </Link>
            </li>
            <li>
              <Link to="/courses?category=cat-price-action" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                {language === 'gu' ? 'પ્રાઇસ એક્શન માસ્ટરી' : 'Price Action Mastery'}
              </Link>
            </li>
            <li>
              <Link to="/courses?category=cat-options-trading" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                {language === 'gu' ? 'ઓપ્શન્સ & નિફ્ટી સ્ટ્રેટેજી' : 'Options & Nifty Expiry'}
              </Link>
            </li>
            <li>
              <Link to="/courses?category=cat-swing-trading" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                {language === 'gu' ? 'સ્વિંગ ટ્રેડિંગ & વેલ્થ' : 'Swing Trading & Wealth'}
              </Link>
            </li>
            <li>
              <Link to="/courses?category=cat-crypto-trading" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                {language === 'gu' ? 'ક્રિપ્ટો ટ્રેડિંગ ગાઇડ' : 'Crypto Trading Guide'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            {dict.footer.quickLinks}
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            <li>
              <Link to="/counseling" className="hover:text-red-600 dark:hover:text-red-400 transition-colors text-red-600 dark:text-red-400 font-semibold flex items-center gap-1.5">
                <span>{language === 'gu' ? '૧-ઓન-૧ કાઉન્સેલિંગ' : '1-on-1 Counseling'}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold">New</span>
              </Link>
            </li>
            <li>
              <Link to="/courses" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                {dict.courses.viewAll}
              </Link>
            </li>
            <li>
              <Link to="/my-courses" className="hover:text-red-700 dark:hover:text-red-300 transition-colors text-red-600 dark:text-red-400 font-medium">
                {dict.nav.myCourses}
              </Link>
            </li>
            <li>
              <Link to="/verify-certificate" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                {dict.nav.verifyCert}
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                {dict.nav.dashboard}
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Contact */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            {dict.footer.contactHeading}
          </h4>
          <ul className="space-y-3 text-xs sm:text-sm">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="truncate">support@tradex.com</span>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>+91 7435961016 (WhatsApp)</span>
            </li>
            <li className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{language === 'gu' ? 'અમદાવાદ, ગુજરાત, ભારત' : 'Ahmedabad, Gujarat, India'}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* SEBI Compliance & Disclaimer Warning Box */}
      <div className="border-t border-amber-200/80 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-start gap-3 text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-800 dark:text-amber-300 block sm:inline mr-1">
              {dict.footer.sebiDisclaimerTitle}
            </span>
            <span>{dict.footer.sebiDisclaimer}</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>{dict.footer.copyright}</p>
          <div className="flex flex-wrap items-center gap-5 sm:gap-6">
            <Link to="/#why-us" className="hover:text-slate-800 dark:hover:text-slate-200">{dict.footer.privacyPolicy}</Link>
            <Link to="/#why-us" className="hover:text-slate-800 dark:hover:text-slate-200">{dict.footer.termsConditions}</Link>
            <Link to="/#why-us" className="hover:text-slate-800 dark:hover:text-slate-200">{dict.footer.refundPolicy}</Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-preferences'))}
              className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium cursor-pointer underline underline-offset-2"
            >
              {language === 'gu' ? 'કૂકી પસંદગીઓ' : 'Cookie Preferences'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
