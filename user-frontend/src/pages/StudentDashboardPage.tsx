import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getMediaUrl } from "../utils/media";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Heart,
  ShoppingBag,
  Settings,
  Play,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Printer,
  X,
  User,
  Key,
} from "lucide-react";

export const StudentDashboardPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { language, dict, formatPrice } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "courses";

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings form states
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Password change states
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passMsg, setPassMsg] = useState<{
    text: string;
    error: boolean;
  } | null>(null);

  // Certificate Modal State
  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  // Avatar upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!user) {
      const redirectPath = window.location.pathname + window.location.search;
      navigate(`/login?redirect=${encodeURIComponent(redirectPath || '/dashboard')}`);
      return;
    }

    setName(user.name || "");
    setHeadline(user.headline || "");
    setBio(user.bio || "");
    setAvatar(
      user.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || "Student")}`,
    );

    async function loadData() {
      setLoading(true);
      try {
        const [dashRes, certRes, wishRes, ordRes] = await Promise.all([
          api.get("/student/dashboard"),
          api.get("/student/certificates"),
          api.get("/student/wishlist"),
          api.get("/student/orders"),
        ]);

        if (dashRes.success) setDashboardData(dashRes);
        if (certRes.success) setCertificates(certRes.certificates);
        if (wishRes.success) setWishlist(wishRes.wishlist);
        if (ordRes.success) setOrders(ordRes.orders);
      } catch (err) {
        console.error("Failed to load student dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, navigate]);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put("/auth/profile", {
        name,
        headline,
        bio,
        avatar,
      });
      if (res.success) {
        updateUser(res.user);
        setProfileMsg("Profile information updated successfully!");
        setTimeout(() => setProfileMsg(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put("/auth/change-password", {
        currentPassword: currPassword,
        newPassword,
      });
      if (res.success) {
        setPassMsg({ text: "Password successfully changed.", error: false });
        setCurrPassword("");
        setNewPassword("");
        setTimeout(() => setPassMsg(null), 3000);
      }
    } catch (err: any) {
      setPassMsg({
        text: err.message || "Failed to update password",
        error: true,
      });
    }
  };

  const handleRemoveWishlist = async (courseId: string) => {
    try {
      await api.post(`/student/wishlist/${courseId}`);
      setWishlist((prev) => prev.filter((item) => item.id !== courseId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingAvatar(true);
    setAvatarUploadError(null);

    try {
      const res = await api.post("/upload", formData);
      if (res.success && res.url) {
        setAvatar(res.url);
        setProfileMsg("Profile photo uploaded successfully!");
        setTimeout(() => setProfileMsg(null), 3000);
      }
    } catch (err: any) {
      setAvatarUploadError(err.message || "Failed to upload profile picture.");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 min-h-screen">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-slate-200 rounded-3xl" />
          <div className="grid grid-cols-4 gap-4">
            <div className="h-24 bg-slate-200 rounded-2xl" />
            <div className="h-24 bg-slate-200 rounded-2xl" />
            <div className="h-24 bg-slate-200 rounded-2xl" />
            <div className="h-24 bg-slate-200 rounded-2xl" />
          </div>
          <div className="h-96 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalEnrolled: 0,
    inProgressCourses: 0,
    completedCourses: 0,
    certificatesEarned: 0,
  };

  const enrolledCourses = dashboardData?.enrolled_courses || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Student Welcome Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-card relative overflow-hidden mb-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-100/30 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
          <img
            src={
              getMediaUrl(user?.avatar) ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || "Student")}`
            }
            alt={user?.name}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-900/10 shadow-md bg-slate-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || "Student")}`;
            }}
          />
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-red-600" /> Student Learning Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {dict.dashboard.welcome} {user?.name}!
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              {user?.headline ||
                (language === 'gu'
                  ? 'Trading ની શરૂઆત કરો અને market concepts ને step by step સમજો. 100% completion તરફ આગળ વધો!'
                  : 'Start your trading education journey and master market concepts step by step.')}
            </p>
          </div>

          <Link
            to="/courses"
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-xs active:scale-95 flex items-center gap-1.5 flex-shrink-0"
          >
            <span>{language === 'gu' ? 'નવા Courses જુઓ' : 'Browse New Courses'}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <p className="text-xs text-slate-500 font-medium">
              {dict.dashboard.statsEnrolled}
            </p>
            <p className="text-2xl font-extrabold text-slate-950 mt-1">
              {stats.totalEnrolled}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <p className="text-xs text-slate-500 font-medium">
              {language === 'gu' ? 'In Progress Courses' : 'In Progress'}
            </p>
            <p className="text-2xl font-extrabold text-red-600 mt-1">
              {stats.inProgressCourses}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <p className="text-xs text-slate-500 font-medium">
              {dict.dashboard.statsCompleted}
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {stats.completedCourses}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <p className="text-xs text-slate-500 font-medium">
              {dict.dashboard.statsCertificates}
            </p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {stats.certificatesEarned}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-slate-200 scrollbar-none">
        <button
          onClick={() => setTab("courses")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            currentTab === "courses"
              ? "bg-slate-950 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{dict.dashboard.tabEnrolled} ({enrolledCourses.length})</span>
        </button>

        <button
          onClick={() => setTab("certificates")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            currentTab === "certificates"
              ? "bg-slate-950 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{dict.dashboard.tabCertificates} ({certificates.length})</span>
        </button>

        <button
          onClick={() => setTab("wishlist")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            currentTab === "wishlist"
              ? "bg-slate-950 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>{dict.dashboard.tabWishlist} ({wishlist.length})</span>
        </button>

        <button
          onClick={() => setTab("orders")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            currentTab === "orders"
              ? "bg-slate-950 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{dict.dashboard.tabOrders}</span>
        </button>

        <button
          onClick={() => setTab("settings")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            currentTab === "settings"
              ? "bg-slate-950 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{dict.dashboard.tabSettings}</span>
        </button>
      </div>

      {/* Tab 1: Enrolled Courses */}
      {currentTab === "courses" && (
        <div className="space-y-6">
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map((c: any) => {
                const isCompleted =
                  c.progress_percent >= 100 ||
                  c.enrollment_status === "completed";
                return (
                  <div
                    key={c.enrollment_id}
                    className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all flex flex-col justify-between space-y-5"
                  >
                    <div className="flex gap-4 items-start">
                      <img
                        src={getMediaUrl(c.thumbnail)}
                        alt={c.title}
                        className="w-28 h-20 rounded-xl object-cover flex-shrink-0 bg-slate-100"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-500">
                            {c.instructor_name}
                          </span>
                          {isCompleted ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> COMPLETED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              IN PROGRESS
                            </span>
                          )}
                        </div>

                        <Link to={`/learn/${c.course_id}`}>
                          <h3 className="text-base font-bold text-slate-900 hover:text-red-600 transition-colors line-clamp-2 mt-1 leading-snug">
                            {c.title}
                          </h3>
                        </Link>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-slate-500">Course Progress</span>
                        <span className="font-extrabold text-slate-900">
                          {c.progress_percent}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted
                              ? "bg-gradient-to-r from-emerald-500 to-green-600"
                              : "bg-gradient-to-r from-red-500 to-red-600"
                          }`}
                          style={{
                            width: `${Math.max(5, c.progress_percent)}%`,
                          }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          {c.completed_lessons} of {c.total_lessons} lessons
                          completed
                        </span>
                        {c.last_lesson_title && (
                          <span className="truncate max-w-[180px] italic text-slate-400">
                            Last: {c.last_lesson_title}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        to={`/course/${c.slug || c.course_id}`}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                      >
                        Course Overview
                      </Link>

                      <Link
                        to={`/learn/${c.course_id}`}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Continue Learning</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/90 shadow-card max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">
                {language === 'gu' ? 'તમે હજુ સુધી કોઈ Course માં Enroll નથી કર્યું' : 'No Enrolled Courses Yet'}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                {language === 'gu'
                  ? 'Stock Market, Options, અને Price Action શીખવા માટે અમારા Courses જુઓ અને શરૂ કરો.'
                  : 'Explore our catalog to start learning stock market trading, options strategies, and price action.'}
              </p>
              <Link
                to="/courses"
                className="mt-6 inline-flex px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
              >
                {language === 'gu' ? 'Courses જુઓ' : 'Browse Courses'}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Certificates */}
      {currentTab === "certificates" && (
        <div className="space-y-6">
          {certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert: any) => (
                <div
                  key={cert.id}
                  className="p-6 rounded-2xl bg-white border border-amber-200/90 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                          Official Certificate of Completion
                        </span>
                        <h4 className="text-base font-bold text-slate-900 leading-tight mt-0.5">
                          {cert.course_title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono">
                    <p className="text-slate-500">
                      Recipient:{" "}
                      <span className="text-slate-900 font-bold">
                        {cert.student_name}
                      </span>
                    </p>
                    <p className="text-slate-500">
                      Verification ID:{" "}
                      <span className="text-emerald-700 font-bold">
                        {cert.certificate_code}
                      </span>
                    </p>
                    <p className="text-slate-500">
                      Issued Date:{" "}
                      <span className="text-slate-700">
                        {new Date(cert.issued_at).toLocaleDateString()}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <Link
                      to={`/verify-certificate?code=${cert.certificate_code}`}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <span>Public Verification Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View & Print</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/90 shadow-card max-w-md mx-auto">
              <Award className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">
                No Certificates Earned Yet
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Complete 100% of any enrolled course to automatically unlock and
                receive your official digital certificate.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Wishlist */}
      {currentTab === "wishlist" && (
        <div className="space-y-6">
          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((c: any) => (
                <div
                  key={c.wishlist_id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all flex flex-col justify-between space-y-4"
                >
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="w-full aspect-video rounded-xl object-cover bg-slate-100"
                  />
                  <div>
                    <h4 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                      {c.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {c.instructor_name}
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-extrabold text-slate-900">
                        {formatPrice(c.discount_price != null ? c.discount_price : c.price)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleRemoveWishlist(c.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                    >
                      Remove
                    </button>
                    <Link
                      to={`/checkout/${c.id}`}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                    >
                      Enroll Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/90 shadow-card max-w-md mx-auto">
              <Heart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">
                Your Wishlist is Empty
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Save courses you are interested in taking later to quickly
                enroll when you are ready.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Purchase History */}
      {currentTab === "orders" && (
        <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-card">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Orders & Transaction Invoices
            </h3>
            <span className="text-xs text-slate-500">
              {orders.length} total orders
            </span>
          </div>

          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Order Number</th>
                    <th className="px-6 py-3">Course</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                        {o.order_number}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {o.course_title}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {formatPrice(o.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {o.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">
              No orders found in your account history.
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Settings */}
      {currentTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile settings */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-red-600" />
              Profile Details
            </h3>

            {profileMsg && (
              <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                {profileMsg}
              </p>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={
                    getMediaUrl(avatar) ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "Student")}`
                  }
                  alt="Profile preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 bg-slate-100 shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "Student")}`;
                  }}
                />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Profile Picture
                  </label>

                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-200">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    {uploadingAvatar ? "Uploading..." : "Choose Image"}
                  </label>

                  {avatarUploadError && (
                    <p className="mt-2 text-xs text-rose-600">
                      {avatarUploadError}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Headline / Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Data Analyst or Frontend Dev"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Biography
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
              >
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-red-600" />
              Change Password
            </h3>

            {passMsg && (
              <p
                className={`text-xs font-semibold p-2.5 rounded-lg border ${
                  passMsg.error
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {passMsg.text}
              </p>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl p-8 sm:p-12 text-center">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Canvas Mockup */}
            <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-b from-amber-50/60 via-white to-amber-50/40 border-4 border-double border-amber-500/50 relative text-slate-800 shadow-inner">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Award className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-xs uppercase tracking-[0.3em] font-extrabold text-amber-700">
                The Safe Trading Global Educational Institute
              </h2>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-4">
                Certificate of Completion
              </h3>
              <p className="mt-4 text-xs text-slate-500 uppercase tracking-wider">
                This officially certifies that
              </p>
              <p className="mt-2 text-3xl font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-700 to-amber-700">
                {selectedCert.student_name}
              </p>
              <p className="mt-4 text-xs text-slate-600 max-w-lg mx-auto">
                has successfully completed all modules, practical projects, and
                knowledge assessments for the course
              </p>
              <h4 className="mt-2 text-lg font-bold text-slate-900">
                {selectedCert.course_title}
              </h4>

              <div className="mt-8 pt-6 border-t border-amber-200/80 flex items-center justify-between text-left text-[11px] text-slate-600">
                <div>
                  <p className="font-semibold text-slate-900">
                    {selectedCert.instructor_name}
                  </p>
                  <p>Lead Instructor</p>
                </div>
                <div className="text-right font-mono">
                  <p className="text-amber-700 font-bold">
                    {selectedCert.certificate_code}
                  </p>
                  <p>{new Date(selectedCert.issued_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs active:scale-95 flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
              <button
                onClick={() => setSelectedCert(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
