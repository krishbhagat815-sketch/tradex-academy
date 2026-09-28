import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: "Courses", path: "/courses" },
    { name: "Why Us", path: "/#why-us" },
    { name: "Testimonials", path: "/#testimonials" },
    { name: "Verify Certificate", path: "/verify-certificate" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-teal-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6 text-slate-950 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              TradeX
              <span className="text-brand-400 font-extrabold">Academy</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase text-slate-400 font-medium -mt-1">
              Enterprise Tech Education
            </span>
          </div>
        </Link>

        {/* Global Search Bar (Desktop) */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md mx-4 relative"
        >
          <input
            type="text"
            placeholder="Search courses, skills, technologies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-750 rounded-full text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-inner"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`hover:text-brand-400 transition-colors ${
                location.pathname === link.path ? "text-brand-400" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Wishlist Icon */}
          <Link
            to={user ? "/dashboard?tab=wishlist" : "/login"}
            className="p-2.5 rounded-full text-slate-300 hover:text-rose-400 hover:bg-slate-800/80 transition-colors relative"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
          </Link>

          {/* Authentication State */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-sm font-medium"
              >
                <img
                  src={
                    user.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`
                  }
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/40"
                />
                <span className="text-slate-200 max-w-[120px] truncate">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-800/80">
                    <p className="text-xs text-slate-400">Signed in as</p>
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
                    My Learning Dashboard
                  </Link>
                  <Link
                    to="/dashboard?tab=certificates"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    My Certificates
                  </Link>
                  <Link
                    to="/dashboard?tab=wishlist"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
                  >
                    <Heart className="w-4 h-4 text-rose-400" />
                    Saved Wishlist
                  </Link>
                  <Link
                    to="/dashboard?tab=settings"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4 text-cyan-400" />
                    Account Settings
                  </Link>
                  <div className="border-t border-slate-800/80 my-1"></div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-slate-950 bg-brand-400 hover:bg-brand-300 rounded-xl transition-all shadow-md shadow-brand-500/20 hover:scale-[1.02]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:bg-slate-800/60 transition-colors"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 px-4 py-6 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-medium text-slate-300 hover:text-brand-400 hover:bg-slate-900 rounded-lg"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-slate-950 font-semibold"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Learning Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-medium text-white bg-slate-900 border border-slate-800 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-slate-950 bg-brand-400 rounded-xl"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
