import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';

function loadRazorpayScript(src: string) {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

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

  // Billing form
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(language === 'gu' ? 'સુરત' : 'Surat');

  // Modal for Simulated / Test Razorpay flow
  const [showSimulatedModal, setShowSimulatedModal] = useState<boolean>(false);
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);

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

  const basePrice = course?.discount_price != null ? course.discount_price : (course?.price || 0);
  const discountAmount = appliedCoupon ? (appliedCoupon.discount_amount || 0) : 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

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
        setCouponError(res.message || (language === 'gu' ? 'અમાન્ય કુપન કોડ' : 'Invalid coupon code'));
      }
    } catch (err: any) {
      setCouponError(err.message || (language === 'gu' ? 'Coupon apply કરવામાં ભૂલ આવી.' : 'Failed to apply coupon.'));
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Complete Payment Verification helper
  const finalizeVerification = async (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
  }) => {
    setProcessing(true);
    setError(null);

    try {
      let verifyRes: any = null;
      try {
        verifyRes = await api.post('/payments/verify', {
          ...payload,
          courseId: course.id,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          billingInfo: { fullName, email, phone, city },
          paymentMethod: 'UPI'
        });
      } catch {
        verifyRes = await api.post('/checkout/verify-payment', {
          ...payload,
          courseId: course.id,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          billingInfo: { fullName, email, phone, city },
          paymentMethod: 'UPI'
        });
      }

      if (verifyRes && verifyRes.success) {
        setOrderComplete(verifyRes);
        setShowSimulatedModal(false);
        try {
          confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
        } catch {}
      } else {
        setError(verifyRes?.message || (language === 'gu' ? 'Payment પૂર્ણ થયું નથી. ફરી પ્રયાસ કરો.' : 'Payment failed. Please try again.'));
      }
    } catch (err: any) {
      setError(err.message || (language === 'gu' ? 'Payment પૂર્ણ થયું નથી. ફરી પ્રયાસ કરો.' : 'Verification failed.'));
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    setProcessing(true);
    setError(null);

    // Free course bypass
    if (finalPrice === 0) {
      try {
        const res = await api.post('/checkout/process', {
          courseId: course.id,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          billingInfo: { fullName, email, phone, city },
          paymentMethod: 'free'
        });
        if (res.success) {
          setOrderComplete(res);
          try {
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
          } catch {}
        } else {
          setError(res.message || (language === 'gu' ? 'Payment પૂર્ણ થયું નથી. ફરી પ્રયાસ કરો.' : 'Payment failed. Please try again.'));
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during checkout.');
      } finally {
        setProcessing(false);
      }
      return;
    }

    try {
      // 1. Create order on backend (payments/create-order with fallback)
      let orderRes: any = null;
      try {
        orderRes = await api.post('/payments/create-order', {
          courseId: course.id,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          paymentMethod: 'UPI'
        });
      } catch {
        orderRes = await api.post('/checkout/create-razorpay-order', {
          courseId: course.id,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          paymentMethod: 'UPI'
        });
      }

      if (!orderRes || !orderRes.success) {
        setError(orderRes?.message || (language === 'gu' ? 'Payment ઓર્ડર શરૂ થઈ શક્યો નથી. ફરી પ્રયાસ કરો.' : 'Failed to create payment order.'));
        setProcessing(false);
        return;
      }

      // Check if real live Razorpay SDK should be launched
      if (orderRes.isRealRazorpay) {
        const sdkLoaded = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
        if (sdkLoaded && (window as any).Razorpay) {
          const options = {
            key: orderRes.keyId,
            amount: orderRes.amount * 100,
            currency: orderRes.currency,
            name: 'The Safe Trading',
            description: course.title,
            order_id: orderRes.orderId,
            handler: async function (response: any) {
              await finalizeVerification({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
            },
            prefill: {
              name: fullName,
              email: email,
              contact: phone,
            },
            theme: {
              color: '#dc2626'
            },
            modal: {
              ondismiss: function () {
                setProcessing(false);
              }
            }
          };

          const rzpInstance = new (window as any).Razorpay(options);
          rzpInstance.on('payment.failed', function () {
            setError(language === 'gu' ? 'Payment પૂર્ણ થયું નથી. ફરી પ્રયાસ કરો.' : 'Payment failed. Please try again.');
            setProcessing(false);
          });
          rzpInstance.open();
          return;
        }
      }

      // If simulated / test mode order or if QR code is selected:
      setPendingOrderData(orderRes);
      setShowSimulatedModal(true);
      setProcessing(false);

    } catch (err: any) {
      setError(err.message || (language === 'gu' ? 'Payment શરૂ કરવામાં સમસ્યા આવી. ફરી પ્રયાસ કરો.' : 'An error occurred during payment.'));
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

  // Success Confirmation Screen
  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-100 shadow-sm animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          {language === 'gu' ? 'Payment સફળ થયું!' : 'Payment Successful!'}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600">
          {language === 'gu'
            ? 'અભિનંદન! તમારું પેમેન્ટ સફળતાપૂર્વક પૂર્ણ થયું છે અને કોર્સ અનલૉક થઈ ગયો છે.'
            : 'Congratulations! Your payment has been verified and course access is granted.'}
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
          <div className="flex justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
            <span>{language === 'gu' ? 'Payment Method:' : 'Payment Method:'}</span>
            <span className="text-slate-900 font-semibold">{orderComplete.order?.payment_method || 'Razorpay UPI'}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>{language === 'gu' ? 'સ્થિતિ:' : 'Status:'}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs uppercase border border-emerald-200">
              {language === 'gu' ? 'સફળ (Active)' : 'Completed'}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={`/learn/${course.id}`}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>{dict.checkout.startCourseNow}</span>
            <ExternalLink className="w-4 h-4" />
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
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-shake">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => { setError(null); setProcessing(false); }}
            className="self-start sm:self-auto px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            {language === 'gu' ? 'ફરી પ્રયાસ કરો (Retry)' : 'Retry Payment'}
          </button>
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
                    placeholder="8530724929"
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

            {/* Submit & Secure Payment Button */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={processing}
                className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-base transition-all shadow-lg shadow-red-600/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Lock className="w-5 h-5" />
                <span>
                  {processing
                    ? (language === 'gu' ? 'પ્રોસેસ થઈ રહ્યું છે...' : 'Processing...')
                    : `${language === 'gu' ? 'હવે Pay કરો' : 'Pay Now'} — ${formatPrice(finalPrice)}`}
                </span>
              </button>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  {language === 'gu'
                    ? 'Razorpay દ્વારા ૧૦૦% સુરક્ષિત ચુકવણી (UPI, Cards, Net Banking)'
                    : '100% Secure Payment via Razorpay (UPI, Cards, Net Banking)'}
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <span>{dict.checkout.secureNotice}</span>
            </p>
          </form>
        </div>

        {/* Right Col: Course Order Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-5 sticky top-28">
            <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
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
                <h4 className="text-xs font-bold text-slate-950 line-clamp-2 leading-snug">
                  {course.title}
                </h4>
                <p className="text-[11px] text-red-600 font-semibold mt-1">{course.instructor_name}</p>
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
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-red-600 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
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

      {/* Razorpay Test / Interactive Payment Modal */}
      {showSimulatedModal && pendingOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                type="button"
                onClick={() => setShowSimulatedModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                  R
                </div>
                <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-400">
                  Razorpay Checkout Gateway
                </span>
              </div>
              <h3 className="text-lg font-bold text-white truncate">{course.title}</h3>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1">
                {formatPrice(finalPrice)}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Order Info */}
              <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-mono text-slate-800 font-bold">{pendingOrderData.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="text-slate-800 font-semibold">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{dict.checkout.totalAmount}:</span>
                  <span className="text-emerald-700 font-extrabold">{formatPrice(finalPrice)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() =>
                    finalizeVerification({
                      razorpay_order_id: pendingOrderData.orderId,
                      razorpay_payment_id: `pay_${Date.now()}`
                    })
                  }
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {processing
                      ? (language === 'gu' ? 'વેરિફાઇ થઈ રહ્યું છે...' : 'Verifying...')
                      : (language === 'gu' ? 'Payment પૂર્ણ કરો (Approve Payment)' : 'Complete & Approve Payment')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSimulatedModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  {language === 'gu' ? 'રદ કરો (Cancel)' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
