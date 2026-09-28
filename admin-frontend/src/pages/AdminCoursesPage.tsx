import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  BookOpen,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  Eye,
  SlidersHorizontal,
  DollarSign,
  Users
} from 'lucide-react';

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/courses');
      if (res.success) {
        setCourses(res.courses);
      }
    } catch (err) {
      console.error('Failed to load admin courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleToggleStatus = async (courseId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      const res = await api.put(`/admin/courses/${courseId}`, { status: nextStatus });
      if (res.success) {
        setCourses(prev =>
          prev.map(c => (c.id === courseId ? { ...c, status: nextStatus } : c))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update course status');
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}" and all its lessons?`)) {
      return;
    }

    try {
      const res = await api.delete(`/admin/courses/${courseId}`);
      if (res.success) {
        setCourses(prev => prev.filter(c => c.id !== courseId));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete course');
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.instructor_name && c.instructor_name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Curriculum Inventory</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Manage Courses
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, edit, publish, and structure masterclasses without modifying source code.
          </p>
        </div>

        <Link
          to="/courses/new"
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Course</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search courses or instructors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-750 rounded-xl text-xs text-slate-200 font-medium"
          >
            <option value="all">All ({courses.length})</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Courses Data Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading course catalog...</div>
        ) : filteredCourses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Course</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Pricing</th>
                  <th className="px-6 py-3.5">Enrollments</th>
                  <th className="px-6 py-3.5">Revenue</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850/50 transition-colors">
                    {/* Course Title & Thumb */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.thumbnail}
                          alt={c.title}
                          className="w-16 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <Link
                            to={`/courses/${c.id}/edit`}
                            className="font-bold text-white hover:text-brand-400 transition-colors truncate block text-sm"
                          >
                            {c.title}
                          </Link>
                          <p className="text-[11px] text-slate-400 truncate">
                            {c.instructor_name} • {c.module_count} modules ({c.lesson_count} lessons)
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 font-medium text-slate-300 whitespace-nowrap">
                      {c.category_name || 'General'}
                    </td>

                    {/* Pricing */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm">
                          ${(c.discount_price != null ? c.discount_price : c.price).toFixed(2)}
                        </span>
                        {c.discount_price != null && (
                          <span className="text-[10px] text-slate-500 line-through">
                            ${c.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Enrollments */}
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-200">
                      {c.enrolled_count.toLocaleString()} students
                    </td>

                    {/* Revenue */}
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-emerald-400">
                      ${c.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(c.id, c.status)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
                          c.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                        title="Click to toggle status"
                      >
                        {c.status.toUpperCase()}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <Link
                        to={`/courses/${c.id}/edit`}
                        className="inline-flex p-1.5 rounded-lg bg-slate-800 hover:bg-brand-500 hover:text-slate-950 text-slate-300 transition-colors"
                        title="Edit Course & Curriculum"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(c.id, c.title)}
                        className="inline-flex p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-300 transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-sm">
            No courses found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};
