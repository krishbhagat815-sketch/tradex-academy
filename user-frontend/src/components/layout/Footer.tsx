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
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-sm">

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
              <TrendingUp className="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              The Safe<span className="text-emerald-600">Trading</span>
            </span>
          </Link>
          <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
            {dict.footer.aboutDesc}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
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
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            {dict.footer.coursesHeading}
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            <li>
              <Link to="/courses?category=cat-stock-basics" className="hover:text-emerald-600 transition-colors">
                {language === 'gu' ? 'બેઝિક શેર બજાર' : 'Stock Market Basics'}
              </Link>
            </li>
            <li>
              <Link to="/courses?category=cat-price-action" className="hover:text-emerald-600 transition-colors">
                {language === 'gu' ? 'પ્રાઇસ એક્શન માસ્ટરી' : 'Price Action Mastery'}
              </Link>
            </li>
            <li>
              <Link to="/courses?category=cat-options-trading" className="hover:text-emerald-600 transition-colors">
                {language === 'gu' ? 'ઓપ્શન્સ & નિફ્ટી સ્ટ્રેટેજી' : 'Options & Nifty Expiry'}
              </Link>
            </li>
            <li>
              <Link to="/courses?category=cat-swing-trading" className="hover:text-emerald-600 transition-colors">
                {language === 'gu' ? 'સ્વિંગ ટ્રેડિંગ & વેલ્થ' : 'Swing Trading & Wealth'}
              </Link>
            </li>
            <li>
              <Link to="/courses?category=cat-crypto-trading" className="hover:text-emerald-600 transition-colors">
                {language === 'gu' ? 'ક્રિપ્ટો ટ્રેડિંગ ગાઇડ' : 'Crypto Trading Guide'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            {dict.footer.quickLinks}
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            <li>
              <Link to="/courses" className="hover:text-emerald-600 transition-colors">
                {dict.courses.viewAll}
              </Link>
            </li>
            <li>
              <Link to="/my-courses" className="hover:text-emerald-700 transition-colors text-emerald-600 font-medium">
                {dict.nav.myCourses}
              </Link>
            </li>
            <li>
              <Link to="/verify-certificate" className="hover:text-emerald-600 transition-colors">
                {dict.nav.verifyCert}
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-emerald-600 transition-colors">
                {dict.nav.dashboard}
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Contact */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            {dict.footer.contactHeading}
          </h4>
          <ul className="space-y-3 text-xs sm:text-sm">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="truncate">support@tradex.com</span>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>+91 98765 43210 (WhatsApp)</span>
            </li>
            <li className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{language === 'gu' ? 'અમદાવાદ, ગુજરાત, ભારત' : 'Ahmedabad, Gujarat, India'}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* SEBI Compliance & Disclaimer Warning Box */}
      <div className="border-t border-amber-200/80 bg-amber-50/70 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-start gap-3 text-xs text-amber-900/90 leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-800 block sm:inline mr-1">
              {dict.footer.sebiDisclaimerTitle}
            </span>
            <span>{dict.footer.sebiDisclaimer}</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200 bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{dict.footer.copyright}</p>
          <div className="flex items-center gap-6">
            <Link to="/#why-us" className="hover:text-slate-800">{dict.footer.privacyPolicy}</Link>
            <Link to="/#why-us" className="hover:text-slate-800">{dict.footer.termsConditions}</Link>
            <Link to="/#why-us" className="hover:text-slate-800">{dict.footer.refundPolicy}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
