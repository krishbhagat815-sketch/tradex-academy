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


  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-md border border-slate-800">
              <TrendingUp className="w-6 h-6 text-red-500 stroke-[2.2]" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-950">
              The Safe<span className="text-red-600 font-black">Trading</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-950">
            {dict.auth.loginTitle}
          </h2>
          <p className="text-xs text-slate-500">
            {dict.auth.loginSubtitle}
          </p>
        </div>


        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              {dict.auth.emailLabel}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {dict.auth.passwordLabel}
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-red-600 hover:text-red-700 font-medium"
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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-md shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? (language === 'gu' ? "પ્રવેશ થઈ રહ્યો છે..." : "Signing In...") : dict.auth.loginBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          <Link
            to={`/register?redirect=${encodeURIComponent(redirect)}`}
            className="text-red-600 hover:underline font-semibold"
          >
            {dict.auth.noAccount}
          </Link>
        </div>
      </div>
    </div>
  );
};
