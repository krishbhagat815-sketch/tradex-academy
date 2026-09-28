import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Users, Search, ShieldAlert, CheckCircle, X } from 'lucide-react';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/students');
      if (res.success) {
        setStudents(res.students);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleToggleStatus = async (studentId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.put(`/admin/students/${studentId}/status`, { status: nextStatus });
      setStudents(prev =>
        prev.map(s => (s.id === studentId ? { ...s, status: nextStatus } : s))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = students.filter(s => {
    const term = search.toLowerCase();
    return s.name?.toLowerCase().includes(term) || s.email?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 pb-16">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-400">User Registry</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Manage Registered Students
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Inspect student profiles, enrolled courses, total spend, and account access status.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs text-slate-400">{filtered.length} total students</span>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading student directory...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Joined Date</th>
                  <th className="px-6 py-3.5">Enrolled Courses</th>
                  <th className="px-6 py-3.5">Total Spent</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-850/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${s.name}`}
                          alt={s.name}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/20"
                        />
                        <div>
                          <p className="font-bold text-white text-sm">{s.name}</p>
                          <p className="text-[11px] text-slate-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {s.enrolled_count} courses
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-brand-400">
                      ${Number(s.total_spent || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          s.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(s.id, s.status)}
                        className={`text-xs font-semibold ${
                          s.status === 'active' ? 'text-rose-400 hover:text-rose-300' : 'text-emerald-400 hover:text-emerald-300'
                        }`}
                      >
                        {s.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-sm">No students found.</div>
        )}
      </div>
    </div>
  );
};
