import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { TrendingUp, Mail, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { language, dict } = useLanguage();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { email, newPassword });
      if (res.success) {
        setResetSuccess(true);
      }
    } catch (err: any) {
      alert(err.message || (language === 'gu' ? 'પાસવર્ડ રીસેટ કરવામાં ભૂલ આવી' : 'Failed to reset password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-6">
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
            {language === 'gu' ? 'Password Reset કરો' : 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'gu'
              ? 'તમારા Account નો Password reset કરો'
              : 'Recover access to your learning credentials'}
          </p>
        </div>

        {resetSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">
              {language === 'gu' ? 'Password સફળતાપૂર્વક Update થઈ ગયો!' : 'Password Updated!'}
            </h4>
            <p className="text-xs text-slate-600">
              {language === 'gu'
                ? 'તમારો Password બદલાઈ ગયો છે. હવે તમે નવા Password વડે Login કરી શકો છો.'
                : 'Your password has been successfully reset. You can now sign in with your new credentials.'}
            </p>
            <Link
              to="/login"
              className="inline-flex px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 active:scale-95 transition-all"
            >
              {dict.nav.login}
            </Link>
          </div>
        ) : !submitted ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-md shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>{language === 'gu' ? 'Sending...' : 'Sending...'}</span>
              ) : (
                <span>{language === 'gu' ? 'Reset Instructions મોકલો' : 'Send Reset Instructions'}</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSetNewPassword} className="space-y-4">
            <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              {language === 'gu'
                ? 'Security verify થઈ ગઈ છે. કૃપા કરીને નવો Password enter કરો:'
                : 'Security verified. Please enter your new password below:'}
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                {language === 'gu' ? 'નવો Password (ઓછામાં ઓછા 6 characters)' : 'New Password (min 6 characters)'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-md shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>{language === 'gu' ? 'Updating...' : 'Updating...'}</span>
              ) : (
                <span>{language === 'gu' ? 'નવો Password Save કરો' : 'Update Password'}</span>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-slate-500">
          <Link to="/login" className="text-red-600 hover:underline font-semibold">
            {language === 'gu' ? '← Login Page પર પાછા જાઓ' : '← Return to Sign In'}
          </Link>
        </div>
      </div>
    </div>
  );
};
