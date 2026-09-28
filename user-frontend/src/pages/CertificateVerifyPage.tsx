import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import {
  Award,
  Search,
  CheckCircle2,
  AlertCircle,
  Printer,
  ShieldCheck,
  Calendar,
  User,
  BookOpen
} from 'lucide-react';

export const CertificateVerifyPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const codeParam = searchParams.get('code') || '';

  const [inputCode, setInputCode] = useState(codeParam);
  const [certificate, setCertificate] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyCode = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await api.get(`/certificates/${codeToVerify.trim()}`);
      if (res.success && res.certificate) {
        setCertificate(res.certificate);
      } else {
        setCertificate(null);
        setError('No certificate found with this verification code.');
      }
    } catch (err: any) {
      setCertificate(null);
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (codeParam) {
      verifyCode(codeParam);
    }
  }, [codeParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setSearchParams({ code: inputCode.trim() });
      verifyCode(inputCode.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-3">
          <ShieldCheck className="w-4 h-4" /> Cryptographic Credential Registry
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Verify Course Completion Certificate
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          Enter the unique certificate serial number found at the bottom of the graduate credential to authenticate student achievement.
        </p>
      </div>

      {/* Verification Search Bar */}
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex gap-2 mb-12">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="e.g. CERT-TRX-2026-78491"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-750 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <button
          type="submit"
          disabled={loading || !inputCode.trim()}
          className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-all shadow-md disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>

      {/* Search Result */}
      {searched && (
        <div>
          {certificate ? (
            <div className="space-y-8 animate-in fade-in zoom-in-95">
              {/* Validation Status Badge */}
              <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-between text-brand-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-400" />
                  <span className="font-bold text-sm">Authentic & Valid Credential Verified</span>
                </div>
                <span className="text-xs font-mono font-semibold">{certificate.certificate_code}</span>
              </div>

              {/* Certificate Card Render */}
              <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-950 to-slate-900 border-4 border-double border-amber-500/40 text-center shadow-2xl relative text-slate-100">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Award className="w-12 h-12 text-amber-400" />
                </div>
                <h2 className="text-xs uppercase tracking-[0.3em] font-extrabold text-amber-400">
                  TradeX Academy Global Educational Institute
                </h2>
                <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-4">
                  Certificate of Completion
                </h3>
                <p className="mt-4 text-xs text-slate-400 uppercase tracking-widest">This certifies that</p>
                <p className="mt-3 text-3xl sm:text-4xl font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-amber-200 to-teal-200">
                  {certificate.student_name}
                </p>
                <p className="mt-4 text-sm text-slate-400 max-w-lg mx-auto">
                  has demonstrated exemplary mastery in all curriculums, code exercises, and technical projects in
                </p>
                <h4 className="mt-2 text-xl font-bold text-white">
                  {certificate.course_title}
                </h4>

                <div className="mt-10 pt-6 border-t border-slate-800 flex items-center justify-between text-left text-xs text-slate-400">
                  <div>
                    <p className="font-semibold text-white">{certificate.instructor_name}</p>
                    <p>Instructor & Program Lead</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-amber-400 font-bold">{certificate.certificate_code}</p>
                    <p>Issued: {new Date(certificate.issued_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Verified Certificate</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-rose-400" />
              <h3 className="text-base font-bold text-white">Certificate Verification Failed</h3>
              <p className="mt-1 text-xs text-slate-400">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
