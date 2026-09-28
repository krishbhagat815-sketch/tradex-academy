import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Tag,
  ArrowRight,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
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
  const [country, setCountry] = useState('United States');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'paypal'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');

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
          setError('Course not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load course details.');
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [courseId, user, navigate]);

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
        setCouponError(res.message || 'Invalid coupon code');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to apply coupon.');
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
          country
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
        setError(res.message || 'Payment processing failed.');
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
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-800 rounded w-1/4" />
          <div className="h-64 bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 min-h-[70vh] flex items-center justify-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-brand-500/40 text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-6 ring-8 ring-brand-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Payment Successful</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">Enrollment Confirmed!</h2>
          <p className="mt-2 text-sm text-slate-300">
            Order Reference: <span className="font-mono font-bold text-white">{orderComplete.order?.order_number}</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            A confirmation receipt has been issued to <span className="text-white">{email}</span>.
          </p>

          <div className="mt-8 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left flex items-center gap-4">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate">{course.title}</h4>
              <p className="text-xs text-brand-400 font-medium">Ready to start immediately</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate(`/learn/${course.id}`)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
            >
              <span>Go to Course Player</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all"
            >
              Learning Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const basePrice = course.discount_price != null ? course.discount_price : course.price;
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const finalPrice = Math.max(0, Math.round((basePrice - discountAmount) * 100) / 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Secure Checkout</span>
        <h1 className="text-3xl font-extrabold text-white mt-1">Complete Your Enrollment</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form: Billing & Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* Billing Form */}
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500 text-slate-950 text-xs font-bold flex items-center justify-center">
                1
              </span>
              Billing Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="India">India</option>
                  <option value="Australia">Australia</option>
                  <option value="Singapore">Singapore</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500 text-slate-950 text-xs font-bold flex items-center justify-center">
                2
              </span>
              Payment Method
            </h3>

            {/* Selector tabs */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-brand-500 bg-brand-500/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5 text-brand-400" />
                <span>Credit/Debit Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-brand-500 bg-brand-500/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <span className="font-bold text-cyan-400 text-base">UPI</span>
                <span>Instant Transfer</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'paypal'
                    ? 'border-brand-500 bg-brand-500/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <span className="font-bold text-amber-400 text-base">PayPal</span>
                <span>Express Checkout</span>
              </button>
            </div>

            {/* Simulated Card Fields */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white font-mono"
                    />
                    <CreditCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      CVV / CVC
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <Lock className="w-4 h-4 text-brand-400" />
              <span>Payments are processed with 256-bit bank-level TLS encryption</span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="lg:col-span-5">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6 sticky top-28">
            <h3 className="text-lg font-bold text-white">Order Summary</h3>

            {/* Course Summary Item */}
            <div className="flex items-start gap-4 pb-6 border-b border-slate-800">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-24 h-16 rounded-xl object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-brand-400">{course.category_name}</span>
                <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">{course.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{course.instructor_name}</p>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Have a Promotional Coupon?
              </label>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="e.g. LAUNCH50"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-xs uppercase font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-300 font-bold text-xs transition-colors disabled:opacity-50"
                >
                  {validatingCoupon ? 'Checking...' : 'Apply'}
                </button>
              </form>

              {couponError && (
                <p className="mt-2 text-xs text-rose-400">{couponError}</p>
              )}

              {appliedCoupon && (
                <div className="mt-2 p-2.5 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-between text-xs text-brand-300">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-brand-400" />
                    <span>Coupon {appliedCoupon.code} applied!</span>
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Breakdown */}
            <div className="space-y-3 pt-4 border-t border-slate-800 text-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span>Original Price</span>
                <span>${course.price.toFixed(2)}</span>
              </div>

              {course.discount_price != null && (
                <div className="flex items-center justify-between text-brand-400">
                  <span>Course Sale Discount</span>
                  <span>-${(course.price - course.discount_price).toFixed(2)}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="flex items-center justify-between text-cyan-400 font-medium">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-400">
                <span>Platform Taxes</span>
                <span className="text-brand-400 font-medium">FREE ($0.00)</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between text-white font-extrabold text-lg">
                <span>Total Due</span>
                <span className="text-2xl text-brand-400 font-extrabold">
                  ${finalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleProcessPayment}
              disabled={processing}
              className="w-full py-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-base transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50"
            >
              {processing ? (
                <span>Securing Your Enrollment...</span>
              ) : (
                <>
                  <span>Enroll & Pay ${finalPrice.toFixed(2)}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-slate-400">
              <p>Instant access to all modules, videos, and source code immediately upon checkout completion.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
