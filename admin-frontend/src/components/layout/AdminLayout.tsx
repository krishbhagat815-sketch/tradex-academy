import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ShoppingBag,
  Tag,
  Star,
  GraduationCap,
  FolderTree,
  Globe,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Enrollments', path: '/enrollments', icon: ShieldCheck },
    { name: 'Orders & Payments', path: '/orders', icon: ShoppingBag },
    { name: 'Coupons & Promos', path: '/coupons', icon: Tag },
    { name: 'Course Reviews', path: '/reviews', icon: Star },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Instructors', path: '/instructors', icon: GraduationCap },
    { name: 'Categories', path: '/categories', icon: FolderTree },
    { name: 'Content CMS', path: '/content', icon: Globe },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } hidden md:flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 sticky top-0 h-screen z-30 select-none`}
      >
        {/* Brand */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center flex-shrink-0 shadow-md">
              <GraduationCap className="w-5 h-5 text-slate-950 stroke-[2.2]" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-extrabold text-white tracking-tight leading-none truncate">
                  TradeX<span className="text-brand-400">Admin</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mt-0.5">
                  Management Console
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                }`}
                title={!sidebarOpen ? item.name : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                {sidebarOpen && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Quick External Link to Student Site */}
        {sidebarOpen && (
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-brand-300 transition-colors"
            >
              <span>View Student Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Bottom User Bar */}
        <div className="p-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={admin?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${admin?.name}`}
              alt={admin?.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/30 flex-shrink-0"
            />
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{admin?.name}</p>
                <p className="text-[10px] text-brand-400 truncate uppercase font-semibold">Master Admin</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-slate-950" />
          </div>
          <span className="font-extrabold text-white text-base">TradeX Admin</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 z-40">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Icon className="w-4 h-4 text-brand-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-400 flex items-center gap-1 font-semibold"
            >
              <span>Student Website ↗</span>
            </a>
            <button
              onClick={handleLogout}
              className="text-xs text-rose-400 font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
