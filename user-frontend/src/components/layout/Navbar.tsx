import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { api } from "../../services/api";
import { getMediaUrl } from "../../utils/media";
import {
  GraduationCap,
  Search,
  Heart,
  User,
  LogOut,
  LayoutDashboard,
  Award,
  Menu,
  X,
  ChevronDown,
  Globe,
  MessageCircle,
  TrendingUp,
  BookOpen,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, dict, formatPrice } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search suggestions with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await api.get(`/courses?search=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        if (res.success && res.courses) {
          setSuggestions(res.courses.slice(0, 4));
        }
      } catch (err) {
        console.error("Live search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync input with URL search param on page change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [location.search]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const clean = searchQuery.trim();
    setShowDropdown(false);
    setMobileMenuOpen(false);
    if (clean) {
      navigate(`/courses?search=${encodeURIComponent(clean)}`);
    } else {
      navigate('/courses');
    }
  };

  const navLinks = [
    { name: dict.nav.courses, path: "/courses" },
    {
      name: dict.nav.myCourses,
      path: user ? "/my-courses" : "/login?redirect=/my-courses",
      badge: user ? "Enrolled" : undefined
    },
    { name: dict.nav.whyUs, path: "/#why-us" },
    { name: dict.nav.verifyCert, path: "/verify-certificate" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-colors">
      <div className="w-full max-w-[1550px] mx-auto px-3 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left Side: Brand Logo + Extended Search Bar */}
        <div className="flex items-center gap-4 lg:gap-6 flex-1 min-w-0">
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-md border border-slate-800 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6 text-red-500 stroke-[2.4]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-950 flex items-center gap-1.5 whitespace-nowrap">
                The Safe
                <span className="text-red-600 font-black">Trading</span>
              </span>
              <span className="text-[10px] tracking-wider text-slate-500 font-medium -mt-1 font-gujarati whitespace-nowrap">
                {dict.nav.tagline}
              </span>
            </div>
          </Link>

          {/* Global Extended Search Bar (Desktop) */}
          <div
            ref={searchContainerRef}
            className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl relative"
          >
            <form onSubmit={handleSearch} className="w-full relative flex items-center">
              <input
                type="text"
                placeholder={dict.nav.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(e);
                  }
                }}
                className="w-full pl-12 pr-28 py-2.5 bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-600 rounded-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all shadow-xs"
              />
              <button
                type="submit"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600 transition-colors p-1"
                title="Search"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                      setShowDropdown(false);
                      if (location.pathname === "/courses") {
                        navigate("/courses");
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                    title="Clear"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  onClick={handleSearch}
                  className="px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs transition-all shadow-sm shadow-red-600/20 cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Live Autocomplete Suggestions Dropdown */}
            {showDropdown && searchQuery.trim().length >= 2 && (
              <div
                className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-[999] animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div className="p-3 border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                  <span>{language === 'gu' ? 'કોર્સ પરિણામો:' : 'Matching Courses:'}</span>
                  {isSearching && <span className="text-emerald-600 animate-pulse text-[10px]">Searching...</span>}
                </div>

                {suggestions.length > 0 ? (
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {suggestions.map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => {
                          navigate(`/courses/${course.slug || course.id}`);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-center gap-3 group"
                      >
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-12 h-9 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-red-600 transition-colors truncate">
                            {course.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                            <span className="text-red-600 font-bold">
                              {formatPrice(course.discount_price ?? course.price)}
                            </span>
                            <span>•</span>
                            <span>{course.difficulty_level}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleSearch()}
                      className="w-full text-center py-2.5 bg-slate-50 hover:bg-red-50 text-red-600 font-bold text-xs transition-colors"
                    >
                      {language === 'gu' ? 'બધા પરિણામો જુઓ →' : 'View all matching courses →'}
                    </button>
                  </div>
                ) : !isSearching ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    <p>{language === 'gu' ? 'કોઈ કોર્સ મળ્યો નથી.' : 'No courses found for this query.'}</p>
                    <button
                      type="button"
                      onClick={() => handleSearch()}
                      className="mt-2 text-red-600 underline hover:text-red-700 font-semibold"
                    >
                      {language === 'gu' ? 'બધા Courses પેજ પર શોધો' : 'Browse full catalog'}
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>


        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-slate-700">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path.startsWith('/my-courses') &&
                (location.pathname === '/my-courses' ||
                  (location.pathname === '/dashboard' && !location.search.includes('tab='))));
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`hover:text-red-600 transition-colors flex items-center gap-1.5 ${
                  isActive ? "text-red-600 font-bold" : ""
                }`}
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Active Learning" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & Language Switcher */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Language Switcher Pill */}
          <div className="relative">
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-full p-0.5 text-xs font-semibold">
              <button
                onClick={() => setLanguage("gu")}
                className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
                  language === "gu"
                    ? "bg-white text-emerald-700 shadow-xs font-bold border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="ગુજરાતી + English (Gujlish) ભાષા પસંદ કરો"
              >
                <span>ગુજરાતી (Gujlish)</span>
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
                  language === "en"
                    ? "bg-white text-emerald-700 shadow-xs font-bold border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Switch to English"
              >
                <span>EN</span>
              </button>
            </div>
          </div>

          {/* Quick WhatsApp Support Link */}
          <a
            href="https://wa.me/919876543210?text=Hello%20The%20Safe%20Trading%2C%20I%20want%20to%20know%20more%20about%20your%20courses."
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all"
            title={dict.nav.whatsappHelp}
          >
            <MessageCircle className="w-4 h-4" />
          </a>

          {/* Wishlist Icon */}
          <Link
            to={user ? "/dashboard?tab=wishlist" : "/login"}
            className="p-2 rounded-full text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition-colors"
            title={dict.nav.wishlist}
          >
            <Heart className="w-4 h-4" />
          </Link>

          {/* Authentication State */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-2.5 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200/70 transition-all text-xs font-medium"
              >
                <img
                  src={
                    getMediaUrl(user.avatar) ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
                  }
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-red-500/40 bg-slate-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`;
                  }}
                />
                <span className="text-slate-800 max-w-[100px] truncate font-medium">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-xs text-slate-500">
                      {language === "gu" ? "લોગિન યુઝર" : "Signed in as"}
                    </p>
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    to="/my-courses"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-red-600" />
                    {dict.nav.myCourses}
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-red-600" />
                    {dict.nav.dashboard}
                  </Link>
                  <Link
                    to="/dashboard?tab=certificates"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <Award className="w-4 h-4 text-emerald-600" />
                    {dict.dashboard.tabCertificates}
                  </Link>
                  <Link
                    to="/dashboard?tab=wishlist"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    {dict.dashboard.tabWishlist}
                  </Link>
                  <Link
                    to="/dashboard?tab=settings"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-700" />
                    {dict.dashboard.tabSettings}
                  </Link>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    {dict.nav.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                {dict.nav.login}
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-600/20 hover:scale-[1.02] active:scale-95"
              >
                {dict.nav.register}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile controls & hamburger */}
        <div className="flex items-center gap-2 sm:hidden">
          {/* Mobile Language Switcher */}
          <button
            onClick={() => setLanguage(language === "gu" ? "en" : "gu")}
            className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-900 flex items-center gap-1"
          >
            <Globe className="w-3 h-3 text-red-600" />
            <span>{language === "gu" ? "GU" : "EN"}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-5 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearch} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={dict.nav.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs"
            >
              Search
            </button>
          </form>

          {/* Mobile Language Switcher Row */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-red-600" />
              {language === "gu" ? "ભાષા પસંદ કરો:" : "Select Language:"}
            </span>
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setLanguage("gu")}
                className={`px-3 py-1 rounded-md text-xs font-bold ${
                  language === "gu"
                    ? "bg-slate-950 text-white"
                    : "text-slate-600"
                }`}
              >
                ગુજરાતી (Gujlish)
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 rounded-md text-xs font-bold ${
                  language === "en"
                    ? "bg-slate-950 text-white"
                    : "text-slate-600"
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            {navLinks.map((link) => {
              const isActive =
                location.pathname === link.path ||
                (link.path.startsWith('/my-courses') &&
                  (location.pathname === '/my-courses' ||
                    (location.pathname === '/dashboard' && !location.search.includes('tab='))));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between transition-colors ${
                    isActive
                      ? "text-red-700 bg-red-50 font-bold"
                      : "text-slate-700 hover:text-red-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      Enrolled
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 text-white font-bold text-sm shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {dict.nav.dashboard}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  {dict.nav.logout}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl"
                >
                  {dict.nav.login}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/20"
                >
                  {dict.nav.register}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
