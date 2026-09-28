import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  TrendingUp,
  Users,
  BookOpen,
  Award,
  DollarSign,
  Clock,
  ArrowUpRight,
  PlusCircle,
  ShieldCheck,
  ShoppingBag,
  Star,
  ChevronRight,
  Tag
} from 'lucide-react';

export const AdminDashboardOverview: React.FC = () => {
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/admin/stats');
        if (res.success) {
          setStatsData(res);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-850 rounded-2xl" />
          ))}
        </div>
        <div className="h-80 bg-slate-850 rounded-2xl" />
      </div>
    );
  }

  const stats = statsData?.stats || {
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    completedEnrollments: 0,
    pendingOrders: 0
  };

  const revenueTrend = statsData?.revenueTrend || [];
  const salesByCategory = statsData?.salesByCategory || [];
  const topCourses = statsData?.topCourses || [];
  const recentOrders = statsData?.recentOrders || [];
  const recentEnrollments = statsData?.recentEnrollments || [];

  const maxRevenue = Math.max(...revenueTrend.map((r: any) => r.revenue), 1000);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Real-Time Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform Analytics & Executive Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/courses/new"
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Course</span>
          </Link>
          <Link
            to="/coupons"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <Tag className="w-4 h-4 text-cyan-400" />
            <span>Manage Coupons</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Gross Revenue</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white">
              ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> +24.8% vs last month
            </p>
          </div>
        </div>

        {/* Total Students */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Students</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white">
              {stats.totalStudents.toLocaleString()}
            </h3>
            <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% student growth
            </p>
          </div>
        </div>

        {/* Total Enrollments */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Enrollments</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white">
              {stats.totalEnrollments.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              <span className="text-brand-400 font-bold">{stats.completedEnrollments}</span> graduated
            </p>
          </div>
        </div>

        {/* Total Courses */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Courses</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white">
              {stats.totalCourses}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              <span className="text-amber-400 font-bold">{stats.publishedCourses || stats.totalCourses}</span> published • <span className="text-slate-400">{stats.draftCourses || 0}</span> drafts
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Revenue Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Monthly Revenue Trajectory</h3>
              <p className="text-xs text-slate-400 mt-0.5">Rolling monthly sales performance</p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-400 text-xs font-bold">
              USD ($)
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="pt-4 h-64 flex items-end justify-between gap-3 sm:gap-6 border-b border-slate-800 pb-4">
            {revenueTrend.map((item: any, idx: number) => {
              const heightPercent = Math.max(15, Math.round((item.revenue / maxRevenue) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[11px] font-mono font-semibold text-slate-400 group-hover:text-brand-400 transition-colors">
                    ${(item.revenue / 1000).toFixed(1)}k
                  </div>
                  <div
                    className="w-full max-w-[48px] bg-slate-800 group-hover:bg-brand-500 rounded-t-lg transition-all duration-300 relative"
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-600/40 to-teal-400/40 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-white mt-1">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Revenue by Discipline</h3>
            <p className="text-xs text-slate-400 mt-0.5">Category distribution</p>
          </div>

          <div className="space-y-4">
            {salesByCategory.map((cat: any, idx: number) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 truncate max-w-[180px]">
                    {cat.category_name}
                  </span>
                  <span className="font-mono text-slate-400">
                    ${Number(cat.revenue).toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"
                    style={{
                      width: `${Math.max(10, Math.min(100, (Number(cat.revenue) / (stats.totalRevenue || 1)) * 100))}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Orders & Recent Enrollments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
            <Link to="/orders" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              View All Orders →
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentOrders.map((ord: any) => (
              <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{ord.student_name}</p>
                  <p className="text-slate-400 truncate max-w-[200px]">{ord.course_title}</p>
                  <span className="font-mono text-[10px] text-slate-500">{ord.order_number}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">${Number(ord.amount).toFixed(2)}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    {ord.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Student Enrollments</h3>
            <Link to="/enrollments" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              View All Enrollments →
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentEnrollments.map((enr: any) => (
              <div key={enr.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={enr.student_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${enr.student_name}`}
                    alt={enr.student_name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/20"
                  />
                  <div>
                    <p className="font-bold text-white">{enr.student_name}</p>
                    <p className="text-slate-400 truncate max-w-[200px]">{enr.course_title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-400">{Math.round(Number(enr.progress_percent || 0))}% completed</p>
                  <span className="text-[10px] text-slate-500">{new Date(enr.enrolled_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
