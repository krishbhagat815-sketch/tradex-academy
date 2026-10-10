import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Search,
  UserPlus,
  X,
} from 'lucide-react';

export const AdminEnrollmentsPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Manual enrollment modal
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [modalMsg, setModalMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [enrRes, stdRes, crsRes] = await Promise.all([
        api.get('/admin/enrollments'),
        api.get('/admin/students'),
        api.get('/admin/courses')
      ]);

      if (enrRes.success) setEnrollments(enrRes.enrollments);
      if (stdRes.success) {
        setStudents(stdRes.students);
        if (stdRes.students[0]) setSelectedStudentId(stdRes.students[0].id);
      }
      if (crsRes.success) {
        setCourses(crsRes.courses);
        if (crsRes.courses[0]) setSelectedCourseId(crsRes.courses[0].id);
      }
    } catch (err) {
      console.error('Failed to load enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedCourseId) return;

    setEnrolling(true);
    setModalMsg(null);
    try {
      const res = await api.post('/admin/enrollments/manual', {
        userId: selectedStudentId,
        courseId: selectedCourseId
      });

      if (res.success) {
        setShowModal(false);
        loadData();
      } else {
        setModalMsg(res.message || 'Failed to enroll student');
      }
    } catch (err: any) {
      setModalMsg(err.message || 'Failed to enroll student');
    } finally {
      setEnrolling(false);
    }
  };

  const handleRevoke = async (enrollmentId: string, studentName: string) => {
    if (!window.confirm(`Revoke enrollment for ${studentName}? The student will lose course access.`)) {
      return;
    }

    try {
      const res = await api.delete(`/admin/enrollments/${enrollmentId}`);
      if (res.success) {
        setEnrollments(prev =>
          prev.map(e => (e.id === enrollmentId ? { ...e, status: 'revoked' } : e))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to revoke enrollment');
    }
  };

  const filtered = enrollments.filter(e => {
    const term = search.toLowerCase();
    return (
      e.student_name?.toLowerCase().includes(term) ||
      e.student_email?.toLowerCase().includes(term) ||
      e.course_title?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Student Access</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Enrollments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track student learning progress, verify completion, and grant manual access.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Manual Student Enrollment</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search student or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs text-slate-500 font-medium">{filtered.length} total enrollments</span>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading enrollments...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Course</th>
                  <th className="px-6 py-3.5">Enrolled Date</th>
                  <th className="px-6 py-3.5">Progress</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((enr) => (
                  <tr key={enr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={enr.student_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${enr.student_name}`}
                          alt={enr.student_name}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20 bg-slate-100"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{enr.student_name}</p>
                          <p className="text-[11px] text-slate-500">{enr.student_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{enr.course_title}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(enr.enrolled_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                            style={{ width: `${Math.max(5, enr.progress_percent)}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-900 font-mono">{enr.progress_percent}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          enr.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : enr.status === 'revoked'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-sky-50 text-sky-700 border-sky-200'
                        }`}
                      >
                        {enr.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {enr.status !== 'revoked' && (
                        <button
                          onClick={() => handleRevoke(enr.id, enr.student_name)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline cursor-pointer"
                        >
                          Revoke Access
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-sm">No enrollments found.</div>
        )}
      </div>

      {/* Manual Enrollment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form onSubmit={handleManualEnroll} className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Manual Student Enrollment</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {modalMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={enrolling}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {enrolling ? 'Enrolling...' : 'Grant Access'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
