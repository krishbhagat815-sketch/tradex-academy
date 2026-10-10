import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Tag,
  ArrowRight,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  Smartphone,
  Building2,
  Sparkles
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { language, dict, formatPrice } = useLanguage();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Billing & Payment form
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(language === 'gu' ? 'અમદાવાદ' : 'Ahmedabad');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [expiry, setExpiry] = useState('08/28');
  const [cvv, setCvv] = useState('786');

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/checkout/${courseId}`);
      return;
    }

    async function fetchCourse() {
      try {
        const res = await api.get(`/courses/${courseId}`);
        if (res.success && res.course) {
          setCourse(res.course);
          if (res.course.is_enrolled) {
            navigate(`/learn/${res.course.id}`);
          }
        } else {
          setError(language === 'gu' ? 'Course મળ્યો નથી.' : 'Course not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load course details.');
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [courseId, user, navigate, language]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    setCouponError(null);

    try {
      const res = await api.post('/checkout/validate-coupon', {
        couponCode: couponCode.trim(),
        courseId: course.id
      });

      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
      } else {
        setCouponError(res.message || (language === 'gu' ? 'Invalid Coupon Code' : 'Invalid coupon code'));
      }
    } catch (err: any) {
      setCouponError(err.message || (language === 'gu' ? 'Coupon apply કરવામાં error આવી.' : 'Failed to apply coupon.'));
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    setProcessing(true);
    setError(null);

    try {
      const res = await api.post('/checkout/process', {
        courseId: course.id,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        billingInfo: {
          fullName,
          email,
          phone,
          city
        },
        paymentMethod
      });

      if (res.success) {
        setOrderComplete(res);
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore if canvas-confetti fails
        }
      } else {
        setError(res.message || (language === 'gu' ? 'પેમેન્ટ પ્રોસેસ કરવામાં ભૂલ આવી.' : 'Payment processing failed.'));
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 min-h-screen">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-slate-200 rounded w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 h-96 bg-slate-200 rounded-2xl" />
            <div className="h-64 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">
          {language === 'gu' ? 'Order શરૂ થઈ શક્યો નથી' : 'Unable to Proceed with Checkout'}
        </h2>
        <p className="mt-2 text-slate-600">{error}</p>
        <Link
          to="/courses"
          className="mt-6 inline-flex px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xs active:scale-95 transition-all"
        >
          {dict.courses.viewAll}
        </Link>
      </div>
    );
  }

  const basePrice = course?.discount_price != null ? course.discount_price : (course?.price || 0);
  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = appliedCoupon.discount_amount || 0;
  }
  const finalPrice = Math.max(0, basePrice - discountAmount);

  // Success Confirmation Screen
  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-100 shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          {dict.checkout.orderSuccessTitle}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600">
          {dict.checkout.orderSuccessDesc}
        </p>

        {/* Order Details Card */}
        <div className="mt-8 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card text-left space-y-3">
          <div className="flex justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
            <span>{dict.dashboard.orderNumber}:</span>
            <span className="font-mono text-slate-900 font-bold">{orderComplete.order?.order_number}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
            <span>{language === 'gu' ? 'કોર્સનું નામ:' : 'Enrolled Course:'}</span>
            <span className="text-slate-900 font-bold text-right truncate max-w-xs">{course.title}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
            <span>{language === 'gu' ? 'ચૂકવેલ રકમ:' : 'Amount Paid:'}</span>
            <span className="text-emerald-700 font-extrabold text-sm">{formatPrice(orderComplete.order?.amount)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>{language === 'gu' ? 'સ્થિતિ:' : 'Status:'}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs uppercase border border-emerald-200">
              {language === 'gu' ? 'સફળ (Active)' : 'Completed'}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={`/learn/${course.id}`}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xs active:scale-95 transition-all"
          >
            {dict.checkout.startCourseNow}
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm border border-slate-200 transition-all active:scale-95"
          >
            {dict.nav.dashboard}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {dict.checkout.title}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {dict.checkout.subtitle}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Billing & Payment form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleProcessPayment} className="space-y-6">
            {/* Student Details Box */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                {dict.checkout.billingDetails}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {dict.checkout.fullName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {dict.checkout.email} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {dict.checkout.phone}
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {dict.checkout.city}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                {dict.checkout.paymentMethod}
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-100 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <span>UPI / GPay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-100 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-teal-600" />
                  <span>Debit / Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-100 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-amber-600" />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* Payment Fields according to selection */}
              {paymentMethod === 'upi' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    {dict.checkout.upiPlaceholder}
                  </label>
                  <input
                    type="text"
                    placeholder="example@okaxis / mobile@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    {language === 'gu'
                      ? 'GPay, PhonePe, Paytm કે BHIM એપ વડે ચુકવણી કરો.'
                      : 'Pay securely using Google Pay, PhonePe, Paytm, or any UPI app.'}
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'gu' ? 'કાર્ડ નંબર' : 'Card Number'}
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {language === 'gu' ? 'એક્સપાયરી (MM/YY)' : 'Expiry (MM/YY)'}
                      </label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'gu' ? 'બેંક પસંદ કરો' : 'Select Bank'}
                  </label>
                  <select className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500">
                    <option>HDFC Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>ICICI Bank</option>
                    <option>Kotak Mahindra Bank</option>
                    <option>Axis Bank</option>
                    <option>Bank of Baroda</option>
                  </select>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base transition-all shadow-xs active:scale-95 flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              <span>
                {processing
                  ? (language === 'gu' ? 'ચુકવણી પ્રોસેસ થઈ રહી છે...' : 'Processing...')
                  : `${dict.checkout.payNow} — ${formatPrice(finalPrice)}`}
              </span>
            </button>

            <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <span>{dict.checkout.secureNotice}</span>
            </p>
          </form>
        </div>

        {/* Right Col: Course Order Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-5 sticky top-28">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              {dict.checkout.orderSummary}
            </h3>

            {/* Course Snippet */}
            <div className="flex gap-3">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-20 h-14 rounded-xl object-cover flex-shrink-0 bg-slate-100"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                  {course.title}
                </h4>
                <p className="text-[11px] text-emerald-700 font-semibold mt-1">{course.instructor_name}</p>
              </div>
            </div>

            {/* Coupon Code Section */}
            <form onSubmit={handleApplyCoupon} className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={dict.checkout.couponPlaceholder}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-bold transition-all disabled:opacity-50"
                >
                  {validatingCoupon ? '...' : dict.checkout.applyCoupon}
                </button>
              </div>
              {appliedCoupon && (
                <p className="text-xs text-emerald-700 mt-1.5 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {dict.checkout.couponApplied} ({appliedCoupon.code})
                </p>
              )}
              {couponError && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium">{couponError}</p>
              )}
            </form>

            {/* Price Calculations */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>{dict.checkout.originalPrice}:</span>
                <span className="font-semibold text-slate-900">{formatPrice(basePrice)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>{dict.checkout.discount}:</span>
                  <span>- {formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-3 flex justify-between text-sm">
                <span className="font-bold text-slate-900">{dict.checkout.totalAmount}:</span>
                <span className="font-extrabold text-emerald-700 text-lg">
                  {formatPrice(finalPrice)}
                </span>
              </div>
            </div>

            {/* Perks */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>{dict.courseDetails.lifetimeAccess}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>{dict.courseDetails.certificateIncluded}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>{dict.courseDetails.mentorSupport}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
