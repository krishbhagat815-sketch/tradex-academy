import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  TrendingUp,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { language, dict } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate(redirect);
    } catch (err: any) {
      setError(err.message || (language === 'gu' ? "Invalid Email અથવા Password." : "Invalid email or password."));
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoStudent = () => {
    setEmail("student@tradex.com");
    setPassword("Student@123");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-teal-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <TrendingUp className="w-6 h-6 text-slate-950 stroke-[2.2]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              TradeX<span className="text-brand-400">Academy</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-white">
            {dict.auth.loginTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {dict.auth.loginSubtitle}
          </p>
        </div>

        {/* Demo student quick fill */}
        <button
          type="button"
          onClick={handleFillDemoStudent}
          className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{dict.auth.fillDemoStudent} (student@tradex.com)</span>
        </button>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {dict.auth.emailLabel}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {dict.auth.passwordLabel}
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                {dict.auth.forgotPassword}
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <span>{loading ? (language === 'gu' ? "પ્રવેશ થઈ રહ્યો છે..." : "Signing In...") : dict.auth.loginBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400">
          <Link
            to={`/register?redirect=${encodeURIComponent(redirect)}`}
            className="text-emerald-400 hover:underline font-semibold"
          >
            {dict.auth.noAccount}
          </Link>
        </div>
      </div>
    </div>
  );
};
