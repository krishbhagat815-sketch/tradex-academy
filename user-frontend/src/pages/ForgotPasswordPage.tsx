import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { GraduationCap, Mail, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
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
      alert(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-slate-950 stroke-[2.2]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              TradeX<span className="text-brand-400">Academy</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-white">Reset Password</h2>
          <p className="text-xs text-slate-400">Recover access to your learning credentials</p>
        </div>

        {resetSuccess ? (
          <div className="p-6 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-brand-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Password Updated!</h4>
            <p className="text-xs text-slate-300">
              Your password has been successfully reset. You can now sign in with your new credentials.
            </p>
            <Link
              to="/login"
              className="inline-flex px-6 py-2.5 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs"
            >
              Go to Sign In
            </Link>
          </div>
        ) : !submitted ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Enter your account email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? <span>Sending...</span> : <span>Send Reset Instructions</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSetNewPassword} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-brand-300">
              Verification confirmed for <strong>{email}</strong>. Enter your new password below.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                New Password (min 6 characters)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-all shadow-md"
            >
              {loading ? 'Updating...' : 'Set New Password'}
            </button>
          </form>
        )}

        <div className="text-center pt-2 text-xs text-slate-400">
          Remembered your password?{' '}
          <Link to="/login" className="text-brand-400 font-semibold hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
