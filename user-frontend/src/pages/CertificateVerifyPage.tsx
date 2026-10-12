import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
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
  const { language, dict } = useLanguage();
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
        setError(language === 'gu' ? 'આ વેરિફિકેશન કોડ સાથે કોઈ સર્ટિફિકેટ મળ્યું નથી.' : 'No certificate found with this verification code.');
      }
    } catch (err: any) {
      setCertificate(null);
      setError(err.message || (language === 'gu' ? 'વેરિફિકેશન નિષ્ફળ રહ્યું. કૃપા કરીને કોડ તપાસો.' : 'Verification failed. Please check the code.'));
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
          <ShieldCheck className="w-4 h-4" />
          <span>{language === 'gu' ? 'Official Certificate Registry' : 'Official Credential Registry'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          {language === 'gu' ? 'Certificate Verification' : 'Verify Course Completion Certificate'}
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          {language === 'gu'
            ? 'Certificate ના તળિયે આપેલો Unique Code (e.g. CERT-TRX-2026-78491) enter કરીને Student Achievement verify કરો.'
            : 'Enter the unique certificate serial number found at the bottom of the graduate credential to authenticate student achievement.'}
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
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 shadow-xs"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <button
          type="submit"
          disabled={loading || !inputCode.trim()}
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-md shadow-red-600/20 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (language === 'gu' ? 'Verifying...' : 'Verifying...') : (language === 'gu' ? 'Verify કરો' : 'Verify')}
        </button>
      </form>

      {/* Search Result */}
      {searched && (
        <div>
          {certificate ? (
            <div className="space-y-8 animate-in fade-in zoom-in-95">
              {/* Validation Status Badge */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm">
                    {language === 'gu' ? '100% Authentic & Verified Certificate' : 'Authentic & Valid Credential Verified'}
                  </span>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-700">{certificate.certificate_code}</span>
              </div>

              {/* Certificate Card Render */}
              <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-amber-50/60 via-white to-amber-50/40 border-4 border-double border-amber-500/50 text-center shadow-card relative text-slate-800">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Award className="w-12 h-12 text-amber-500" />
                </div>
                <h2 className="text-xs uppercase tracking-[0.3em] font-extrabold text-amber-700">
                  The Safe Trading
                </h2>
                <h3 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mt-4">
                  {language === 'gu' ? 'કોર્સ પૂર્ણતા પ્રમાણપત્ર' : 'Certificate of Completion'}
                </h3>
                <p className="mt-4 text-xs text-slate-500 uppercase tracking-widest">
                  {language === 'gu' ? 'આથી પ્રમાણિત કરવામાં આવે છે કે' : 'This certifies that'}
                </p>
                <p className="mt-3 text-3xl sm:text-4xl font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-700 to-amber-700">
                  {certificate.student_name}
                </p>
                <p className="mt-4 text-sm text-slate-600 max-w-lg mx-auto">
                  {language === 'gu'
                    ? 'તેમણે નીચે મુજબના કોર્સના તમામ વિષયો, ચાર્ટ પ્રેક્ટિસ અને ટેસ્ટ સફળતાપૂર્વક પૂર્ણ કર્યા છે:'
                    : 'has demonstrated exemplary mastery in all curriculums, exercises, and trading strategies in'}
                </p>
                <h4 className="mt-2 text-xl font-bold text-slate-900">
                  {certificate.course_title}
                </h4>

                <div className="mt-10 pt-6 border-t border-amber-200/80 flex items-center justify-between text-left text-xs text-slate-600">
                  <div>
                    <p className="font-semibold text-slate-900">{certificate.instructor_name}</p>
                    <p>{language === 'gu' ? 'લીડ મેન્ટર & એનાલિસ્ટ' : 'Instructor & Program Lead'}</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-amber-700 font-bold">{certificate.certificate_code}</p>
                    <p>{language === 'gu' ? 'તારીખ:' : 'Issued:'} {new Date(certificate.issued_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs active:scale-95 flex items-center gap-2 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>{language === 'gu' ? 'સર્ટિફિકેટ પ્રિન્ટ કરો' : 'Print Verified Certificate'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-700">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-rose-500" />
              <h3 className="text-base font-bold text-slate-900">
                {language === 'gu' ? 'સર્ટિફિકેટ વેરિફિકેશન નિષ્ફળ' : 'Certificate Verification Failed'}
              </h3>
              <p className="mt-1 text-xs text-rose-600">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
