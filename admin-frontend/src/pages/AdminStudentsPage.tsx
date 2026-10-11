import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Search, Pencil, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { EditStudentModal } from '../components/EditStudentModal';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit student modal state
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const handleOpenEdit = (student: any) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleStudentUpdated = (updated: any) => {
    setStudents(prev =>
      prev.map(s => (s.id === updated.id ? { ...s, ...updated } : s))
    );
  };

  const filtered = students.filter(s => {
    const term = search.toLowerCase();
    return s.name?.toLowerCase().includes(term) || s.email?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 pb-16">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">User Registry</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Manage Registered Students
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Inspect student profiles, update account credentials, view course enrollments, and toggle access status.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs text-slate-500 font-medium">{filtered.length} total students</span>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading student directory...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Joined Date</th>
                  <th className="px-6 py-3.5">Enrolled Courses</th>
                  <th className="px-6 py-3.5">Total Spent</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div
                        onClick={() => handleOpenEdit(s)}
                        className="flex items-center gap-3 cursor-pointer group"
                        title="Click to edit student profile"
                      >
                        <img
                          src={s.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${s.name}`}
                          alt={s.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20 group-hover:ring-emerald-500 bg-slate-100 transition-all"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                              {s.name}
                            </p>
                            <Pencil className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                          </div>
                          <p className="text-[11px] text-slate-500">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {s.enrolled_count} courses
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-700">
                      ₹{Number(s.total_spent || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          s.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                          title="Edit student profile & password"
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit Student</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(s.id, s.status)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                            s.status === 'active'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {s.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-sm">No students found.</div>
        )}
      </div>

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={showEditModal}
        student={selectedStudent}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStudent(null);
        }}
        onSuccess={handleStudentUpdated}
      />
    </div>
  );
};
