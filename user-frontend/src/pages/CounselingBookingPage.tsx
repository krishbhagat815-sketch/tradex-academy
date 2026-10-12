import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  ShieldCheck,
  Award,
  Video,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface CounselingType {
  id: string;
  title: string;
  duration: string;
  badge: string;
  description: string;
}

export const CounselingBookingPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Booking form states
  const [sessionTypes, setSessionTypes] = useState<CounselingType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('1-on-1 Portfolio & Risk Review');
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('06:30 PM - 07:30 PM');
  
  // Tomorrow as default date formatted YYYY-MM-DD
  const tomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [preferredDate, setPreferredDate] = useState<string>(tomorrowStr());
  const [clientName, setClientName] = useState<string>(user?.name || '');
  const [clientEmail, setClientEmail] = useState<string>(user?.email || '');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<string>('Beginner (0-1 Years)');
  const [topic, setTopic] = useState<string>('Risk Management & Trading Setup');
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Sync auth user if available
  useEffect(() => {
    if (user) {
      if (!clientName) setClientName(user.name || '');
      if (!clientEmail) setClientEmail(user.email || '');
    }
  }, [user]);

  // Load session types and available slots from real backend
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await api.get('/counseling/types');
        if (res.success) {
          if (res.types && res.types.length > 0) {
            setSessionTypes(res.types);
            setSelectedType(res.types[0].title);
          }
          if (res.availableSlots && res.availableSlots.length > 0) {
            setTimeSlots(res.availableSlots);
            setSelectedSlot(res.availableSlots[0]);
          }
        }
      } catch (err) {
        console.warn('Failed to load session types from backend, using fallback:', err);
        // Fallback defaults
        setSessionTypes([
          {
            id: 'portfolio-review',
            title: '1-on-1 Portfolio & Risk Review',
            duration: '45 Mins',
            badge: 'Most Popular',
            description: 'Audit your current holdings, position sizes, and risk-to-reward ratio with an expert.'
          },
          {
            id: 'beginner-roadmap',
            title: 'Beginner Trader Roadmap (Gujarati/Hindi)',
            duration: '60 Mins',
            badge: 'Fundamentals',
            description: 'Clear step-by-step guidance on chart setup, demat brokers, and avoiding early losses.'
          },
          {
            id: 'options-strategy',
            title: 'Live Options & Expiry Strategy Mentorship',
            duration: '60 Mins',
            badge: 'Advanced',
            description: 'Deep dive into Option Greeks, Open Interest (OI) analysis, and hedging techniques.'
          },
          {
            id: 'psychology-recovery',
            title: 'Trading Psychology & Loss Recovery',
            duration: '45 Mins',
            badge: 'Mental Edge',
            description: 'Overcome revenge trading, fear of missing out (FOMO), and rebuild discipline.'
          }
        ]);
        setTimeSlots([
          '10:00 AM - 11:00 AM',
          '11:30 AM - 12:30 PM',
          '02:00 PM - 03:00 PM',
          '04:00 PM - 05:00 PM',
          '06:30 PM - 07:30 PM',
          '08:30 PM - 09:30 PM'
        ]);
      }
    }
    loadConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      setErrorMsg(
        language === 'gu'
          ? 'કૃપા કરીને તમારું નામ, ઇમેઇલ અને ફોન નંબર દાખલ કરો.'
          : 'Please provide your full name, email address, and active phone number.'
      );
      return;
    }

    if (!preferredDate) {
      setErrorMsg(
        language === 'gu'
          ? 'કૃપા કરીને સેશન માટે તારીખ પસંદ કરો.'
          : 'Please select a preferred date for the session.'
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        client_name: clientName.trim(),
        client_email: clientEmail.trim(),
        client_phone: clientPhone.trim(),
        counseling_type: selectedType,
        topic: topic.trim() || selectedType,
        preferred_date: preferredDate,
        preferred_time_slot: selectedSlot,
        experience_level: experienceLevel,
        notes: notes.trim()
      };

      const res = await api.post('/counseling/book', payload);
      if (res.success) {
        setBookingSuccess(res.booking);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res.message || 'Failed to submit booking. Please try again.');
      }
    } catch (err: any) {
      console.error('Counseling booking error:', err);
      setErrorMsg(err.message || 'Server connection error. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
            <Video className="w-3.5 h-3.5" />
            <span>{language === 'gu' ? '૧-ઓન-૧ લાઈવ મેન્ટરશિપ' : '1-on-1 Live Mentorship & Counseling'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
            {language === 'gu'
              ? 'નિષ્ણાત ટ્રેડર સાથે ૧-ઓન-૧ પર્સનલ કાઉન્સેલિંગ સેશન'
              : 'Book a 1-on-1 Trading Mentorship & Counseling Session'}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {language === 'gu'
              ? 'તમારા પોર્ટફોલિયોનું ઓડિટ કરાવો, તમારા લોસને રિકવર કરવાની સાચી સિસ્ટમ સમજો અને વ્યક્તિગત ગૂગલ મીટ સેશન દ્વારા તમારી ટ્રેડિંગ સાયકોલોજી સુધારો.'
              : 'Direct video consultation with verified senior traders. Review your live trades, fix your risk management, and develop a personalized profitable trading plan.'}
          </p>
        </div>

        {/* Success Confirmation View */}
        {bookingSuccess ? (
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-8 sm:p-12 max-w-3xl mx-auto text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center ring-8 ring-emerald-50">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
                Booking Confirmed & Saved
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-3">
                {language === 'gu' ? 'તમારું કાઉન્સેલિંગ સેશન નોંધાઈ ગયું છે!' : 'Your Counseling Session is Booked!'}
              </h2>
              <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                {language === 'gu'
                  ? 'અમારા મુખ્ય મેન્ટર તમારી વિગતો ચકાસીને ૨ કલાકમાં ગૂગલ મીટ લિંક સાથે ઇમેઇલ અને વ્હોટ્સએપ કરશે.'
                  : 'Our mentor team has received your request. You will receive an official Google Meet link and session confirmation via email and WhatsApp shortly.'}
              </p>
            </div>

            {/* Session Card Details */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 font-sans">
                <span className="text-slate-500 font-semibold">Booking Reference ID</span>
                <span className="font-mono font-bold text-slate-900">#{bookingSuccess.id?.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 font-sans">
                <span className="text-slate-500 font-semibold">Mentorship Topic</span>
                <span className="font-bold text-slate-900">{bookingSuccess.counseling_type}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 font-sans">
                <span className="text-slate-500 font-semibold">Scheduled Date</span>
                <span className="font-bold text-slate-900">{bookingSuccess.preferred_date}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 font-sans">
                <span className="text-slate-500 font-semibold">Time Slot</span>
                <span className="font-bold text-slate-900">{bookingSuccess.preferred_time_slot}</span>
              </div>
              <div className="flex justify-between items-center py-1 font-sans">
                <span className="text-slate-500 font-semibold">Meeting Platform</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" /> Google Meet / Zoom HD
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to="/dashboard?tab=counseling"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm transition-all"
              >
                {language === 'gu' ? 'મારા ડેશબોર્ડ પર જુઓ' : 'View in Student Dashboard'}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setBookingSuccess(null);
                  setNotes('');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-sm transition-all cursor-pointer"
              >
                {language === 'gu' ? 'બીજું સેશન બુક કરો' : 'Book Another Session'}
              </button>
            </div>
          </div>
        ) : (
          /* Main Booking Form + Info Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Booking Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-red-600" />
                  <span>{language === 'gu' ? 'કાઉન્સેલિંગ ફોર્મ ભરો' : 'Schedule Your Session'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'gu'
                    ? 'તમારી અનુકૂળ તારીખ અને વિષય પસંદ કરો. અમારા મેન્ટર તમારી સાથે લાઈવ કનેક્ટ થશે.'
                    : 'Choose your desired date, slot, and focus topic. Real database-connected instant booking.'}
                </p>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Select Counseling Focus */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    1. {language === 'gu' ? 'સેશનનો પ્રકાર પસંદ કરો' : 'Select Mentorship Type'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sessionTypes.map((type) => {
                      const isSelected = selectedType === type.title;
                      return (
                        <div
                          key={type.id || type.title}
                          onClick={() => setSelectedType(type.title)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-red-600 bg-red-50/50 shadow-sm ring-1 ring-red-600'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-red-600">{type.duration}</span>
                            {type.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                {type.badge}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-950 leading-snug">{type.title}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {type.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Date and Time Slot Picker */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    2. {language === 'gu' ? 'તારીખ અને સમય પસંદ કરો' : 'Date & Preferred Time Slot'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-slate-500 mb-1.5 block">Preferred Date:</span>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 mb-1.5 block">Available Slot:</span>
                      <select
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none bg-white"
                      >
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Client Contact Details */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    3. {language === 'gu' ? 'તમારી સંપર્ક વિગતો' : 'Your Contact Details'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-slate-500 mb-1 block">Full Name:</span>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Krish Bhagat"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 mb-1 block">Email Address:</span>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="name@gmail.com"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-xs text-slate-500 mb-1 block">Phone / WhatsApp Number:</span>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="7435961016"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 mb-1 block">Trading Experience:</span>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none bg-white"
                      >
                        <option value="Beginner (0-1 Years)">Beginner (0-1 Years)</option>
                        <option value="Intermediate (1-3 Years)">Intermediate (1-3 Years)</option>
                        <option value="Advanced Full-Time Trader (3+ Years)">Advanced Trader (3+ Years)</option>
                        <option value="Loss Recovery & Psychology">Struggling / Loss Recovery</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 mb-1 block">What would you like to discuss? (Optional):</span>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. I trade Nifty options but often exit early due to emotion. Need guidance on stop-loss execution..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-600 outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-sm transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{language === 'gu' ? 'કાઉન્સેલિંગ સેશન કન્ફર્મ કરો' : 'Confirm 1-on-1 Mentorship Booking'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Why Book 1-on-1 + Mentors */}
            <div className="lg:col-span-5 space-y-6">
              {/* Feature Highlights Card */}
              <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>The Safe Trading Guarantee</span>
                </div>
                <h3 className="text-xl font-extrabold text-white leading-snug">
                  {language === 'gu'
                    ? 'શા માટે ૧-ઓન-૧ કાઉન્સેલિંગ મહત્વપૂર્ણ છે?'
                    : 'Why Traders Choose 1-on-1 Mentorship'}
                </h3>
                <ul className="space-y-3.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Live Chart Breakdown:</strong> Share your trading terminal screen with a mentor to pinpoint exact mistake areas.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Strict Risk Rules:</strong> Calculate your exact per-trade risk allowance and capital allocation.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Bilingual Interaction:</strong> Comfortably speak in Gujarati, Hindi, or English without pressure.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Real Mentor Direct Contact:</strong> No bot or scripted chat — direct interaction with a seasoned market professional.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Direct WhatsApp Quick Contact */}
              <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4" />
                  <span>Prefer Instant WhatsApp Booking?</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Have an urgent query regarding market timings or session availability? Reach out directly via official WhatsApp.
                </p>
                <a
                  href="https://wa.me/917435961016?text=Hello%20The%20Safe%20Trading,%20I%20would%20like%20to%20book%20a%201-on-1%20Counseling%20session"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp (+91 7435961016)</span>
                </a>
              </div>

              {/* FAQ Accordion snippet */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Frequently Asked Questions</h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">How do I join the session?</p>
                    <p className="text-slate-500 mt-0.5">
                      You will receive a Google Meet video conference link in your email and dashboard upon confirmation.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <p className="font-bold text-slate-900">Can I reschedule if market is volatile?</p>
                    <p className="text-slate-500 mt-0.5">
                      Yes, contact us on WhatsApp at least 2 hours before the scheduled time slot to choose another date.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
