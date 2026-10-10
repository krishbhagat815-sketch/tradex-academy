import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { api } from "../../services/api";
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

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
      setMobileMenuOpen(false);
    } else {
      navigate('/courses');
      setShowDropdown(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: dict.nav.courses, path: "/courses" },
    { name: dict.nav.freeCourses, path: "/courses?price=free" },
    { name: dict.nav.whyUs, path: "/#why-us" },
    { name: dict.nav.testimonials, path: "/#testimonials" },
    { name: dict.nav.verifyCert, path: "/verify-certificate" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-teal-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-6 h-6 text-slate-950 stroke-[2.4]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              The Safe
              <span className="text-brand-400 font-extrabold">Trading</span>
            </span>
            <span className="text-[10px] tracking-wider text-slate-400 font-medium -mt-1 font-gujarati">
              {dict.nav.tagline}
            </span>
          </div>
        </Link>

        {/* Global Search Bar (Desktop) with Live Autocomplete */}
        <div
          ref={searchContainerRef}
          className="hidden md:flex flex-1 max-w-md lg:max-w-xl mx-3 relative"
        >
          <form onSubmit={handleSearch} className="w-full relative">
            <input
              type="text"
              placeholder={dict.nav.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full pl-12 pr-24 py-2.5 bg-slate-900/90 border border-slate-700 hover:border-slate-600 rounded-full text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-400 transition-colors p-1"
              title="Search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSuggestions([]);
                    setShowDropdown(false);
                  }}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="px-3 py-1 rounded-full bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all shadow-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Live Autocomplete Suggestions Dropdown */}
          {showDropdown && searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
              <div className="p-3 border-b border-slate-800 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                <span>{language === 'gu' ? 'કોર્સ પરિણામો:' : 'Matching Courses:'}</span>
                {isSearching && <span className="text-brand-400 animate-pulse text-[10px]">Searching...</span>}
              </div>

              {suggestions.length > 0 ? (
                <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
                  {suggestions.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => {
                        navigate(`/courses/${course.slug || course.id}`);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left p-3 hover:bg-slate-800/80 transition-colors flex items-center gap-3 group"
                    >
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-12 h-9 rounded-lg object-cover flex-shrink-0 border border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white group-hover:text-brand-400 transition-colors truncate">
                          {course.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <span className="text-emerald-400 font-semibold">
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
                    className="w-full text-center py-2.5 bg-slate-950/60 hover:bg-brand-500/10 text-brand-400 font-bold text-xs transition-colors"
                  >
                    {language === 'gu' ? 'બધા પરિણામો જુઓ →' : 'View all matching courses →'}
                  </button>
                </div>
              ) : !isSearching ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  <p>{language === 'gu' ? 'કોઈ કોર્સ મળ્યો નથી.' : 'No courses found for this query.'}</p>
                  <button
                    type="button"
                    onClick={() => handleSearch()}
                    className="mt-2 text-brand-400 underline hover:text-brand-300 font-medium"
                  >
                    {language === 'gu' ? 'બધા Courses પેજ પર શોધો' : 'Browse full catalog'}
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`hover:text-brand-400 transition-colors ${
                location.pathname === link.path ? "text-brand-400 font-semibold" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Controls & Language Switcher */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Language Switcher Pill */}
          <div className="relative">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-full p-0.5 text-xs font-semibold">
              <button
                onClick={() => setLanguage("gu")}
                className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
                  language === "gu"
                    ? "bg-brand-500 text-slate-950 shadow-sm font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="ગુજરાતી + English (Gujlish) ભાષા પસંદ કરો"
              >
                <span>ગુજરાતી (Gujlish)</span>
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
                  language === "en"
                    ? "bg-brand-500 text-slate-950 shadow-sm font-bold"
                    : "text-slate-400 hover:text-slate-200"
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
            className="p-2 rounded-full text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
            title={dict.nav.whatsappHelp}
          >
            <MessageCircle className="w-4 h-4" />
          </a>

          {/* Wishlist Icon */}
          <Link
            to={user ? "/dashboard?tab=wishlist" : "/login"}
            className="p-2 rounded-full text-slate-300 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
            title={dict.nav.wishlist}
          >
            <Heart className="w-4 h-4" />
          </Link>

          {/* Authentication State */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-2.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-xs font-medium"
              >
                <img
                  src={
                    user.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`
                  }
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-500/40"
                />
                <span className="text-slate-200 max-w-[100px] truncate">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-800/80">
                    <p className="text-xs text-slate-400">
                      {language === "gu" ? "લોગિન યુઝર" : "Signed in as"}
                    </p>
                    <p className="text-sm font-semibold text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-brand-400" />
                    {dict.nav.dashboard}
                  </Link>
                  <Link
                    to="/dashboard?tab=certificates"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    {dict.dashboard.tabCertificates}
                  </Link>
                  <Link
                    to="/dashboard?tab=wishlist"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
                  >
                    <Heart className="w-4 h-4 text-rose-400" />
                    {dict.dashboard.tabWishlist}
                  </Link>
                  <Link
                    to="/dashboard?tab=settings"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4 text-cyan-400" />
                    {dict.dashboard.tabSettings}
                  </Link>
                  <div className="border-t border-slate-800/80 my-1"></div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-medium"
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
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
              >
                {dict.nav.login}
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 rounded-xl transition-all shadow-md shadow-brand-500/20 hover:scale-[1.02]"
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
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-brand-400 flex items-center gap-1"
          >
            <Globe className="w-3 h-3" />
            <span>{language === "gu" ? "GU" : "EN"}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-300 hover:bg-slate-800/60 transition-colors"
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
        <div className="sm:hidden border-t border-slate-800 bg-slate-950/98 px-4 py-5 space-y-4">
          <form onSubmit={handleSearch} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={dict.nav.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs"
            >
              Search
            </button>
          </form>

          {/* Mobile Language Switcher Row */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-400" />
              {language === "gu" ? "ભાષા પસંદ કરો:" : "Select Language:"}
            </span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg">
              <button
                onClick={() => setLanguage("gu")}
                className={`px-3 py-1 rounded-md text-xs font-bold ${
                  language === "gu"
                    ? "bg-brand-500 text-slate-950"
                    : "text-slate-400"
                }`}
              >
                ગુજરાતી (Gujlish)
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 rounded-md text-xs font-bold ${
                  language === "en"
                    ? "bg-brand-500 text-slate-950"
                    : "text-slate-400"
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-brand-400 hover:bg-slate-900 rounded-lg"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-slate-950 font-bold text-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {dict.nav.dashboard}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl"
                >
                  {dict.nav.logout}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-bold text-white bg-slate-900 border border-slate-800 rounded-xl"
                >
                  {dict.nav.login}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-bold text-slate-950 bg-brand-400 rounded-xl"
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
