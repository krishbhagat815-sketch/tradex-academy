import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  ShieldCheck,
  Search,
  UserPlus,
  Trash2,
  CheckCircle,
  X,
  AlertCircle
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
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Student Access</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Manage Enrollments
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track student learning progress, verify completion, and grant manual access.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Manual Student Enrollment</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search student or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs text-slate-400 font-medium">{filtered.length} total enrollments</span>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading enrollments...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Course</th>
                  <th className="px-6 py-3.5">Enrolled Date</th>
                  <th className="px-6 py-3.5">Progress</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((enr) => (
                  <tr key={enr.id} className="hover:bg-slate-850/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={enr.student_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${enr.student_name}`}
                          alt={enr.student_name}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/20"
                        />
                        <div>
                          <p className="font-bold text-white text-sm">{enr.student_name}</p>
                          <p className="text-[11px] text-slate-400">{enr.student_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">{enr.course_title}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(enr.enrolled_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-slate-950 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-500 to-cyan-400"
                            style={{ width: `${Math.max(5, enr.progress_percent)}%` }}
                          />
                        </div>
                        <span className="font-bold text-white font-mono">{enr.progress_percent}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          enr.status === 'completed'
                            ? 'bg-brand-500/10 text-brand-400 border-brand-500/30'
                            : enr.status === 'revoked'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        }`}
                      >
                        {enr.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {enr.status !== 'revoked' && (
                        <button
                          onClick={() => handleRevoke(enr.id, enr.student_name)}
                          className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
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
          <div className="p-12 text-center text-slate-400 text-sm">No enrollments found.</div>
        )}
      </div>

      {/* Manual Enrollment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleManualEnroll} className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Manual Student Enrollment</h3>
              <button type="button" onClick={() => setShowModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {modalMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {modalMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
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
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={enrolling}
                className="px-5 py-2 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs"
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
