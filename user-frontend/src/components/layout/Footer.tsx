import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Globe,
} from "lucide-react";

export const Footer: React.FC = () => {
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Weekly Tech Curations
            </span>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Stay ahead in modern engineering & analytics
            </h3>
            <p className="mt-2 text-slate-400 text-sm leading-relaxed">
              Get exclusive engineering tutorials, industry case studies,
              special discounts, and early access to masterclasses delivered
              straight to your inbox.
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
                placeholder="Enter your work email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 flex-shrink-0 shadow-lg shadow-brand-500/20"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
        {subscribed && (
          <p className="text-center text-brand-400 text-xs mt-3 flex items-center justify-center gap-1.5 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" /> Thank you for subscribing!
            Check your inbox shortly.
          </p>
        )}
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-teal-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <GraduationCap className="w-6 h-6 text-slate-950 stroke-[2.2]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              TradeX<span className="text-brand-400">Academy</span>
            </span>
          </Link>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            The premier online institute for high-velocity tech mastery.
            Designed and taught by verified tech leads, quantitative analysts,
            and principal architects.
          </p>
          <div className="pt-2 flex items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>Verifiable Certificates</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-brand-400" />
              <span>256-bit Encrypted Checkout</span>
            </div>
          </div>
        </div>

        {/* Featured Programs */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Curriculums
          </h4>
          <ul className="space-y-2.5">
            <li>
              <Link
                to="/courses?category=data-science-analytics"
                className="hover:text-brand-400 transition-colors"
              >
                Data Science & Analytics
              </Link>
            </li>
            <li>
              <Link
                to="/courses?category=web-development"
                className="hover:text-brand-400 transition-colors"
              >
                Full-Stack Next.js 15
              </Link>
            </li>
            <li>
              <Link
                to="/courses?category=ai-machine-learning"
                className="hover:text-brand-400 transition-colors"
              >
                Generative AI & LLMs
              </Link>
            </li>
            <li>
              <Link
                to="/courses?category=trading-finance"
                className="hover:text-brand-400 transition-colors"
              >
                Quantitative Trading
              </Link>
            </li>
            <li>
              <Link
                to="/courses?category=cloud-devops"
                className="hover:text-brand-400 transition-colors"
              >
                Kubernetes & DevOps
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Platform
          </h4>
          <ul className="space-y-2.5">
            <li>
              <Link
                to="/courses"
                className="hover:text-brand-400 transition-colors"
              >
                Browse All Courses
              </Link>
            </li>
            <li>
              <Link
                to="/verify-certificate"
                className="hover:text-brand-400 transition-colors"
              >
                Certificate Verification
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="hover:text-brand-400 transition-colors"
              >
                Student Learning Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Contact */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Support & Trust
          </h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span className="truncate">support@tradex.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>+1 (800) 555-0199</span>
            </li>
            <li className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>San Francisco, CA & Global</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200/80 bg-[#f4efe7] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>
            © {new Date().getFullYear()} TradeX Academy, Inc. All rights
            reserved. Commercial Online Education Platform.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-slate-500">Privacy Policy</span>
            <span className="text-slate-500">Terms of Service</span>
            <span className="text-slate-500">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
