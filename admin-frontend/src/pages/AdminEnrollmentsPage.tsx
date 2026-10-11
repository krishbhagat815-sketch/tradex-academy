import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import {
  Search,
  UserPlus,
  X,
  Pencil,
  BookOpen,
  GraduationCap,
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { EditStudentModal } from '../components/EditStudentModal';
import { ManageStudentCoursesModal } from '../components/ManageStudentCoursesModal';

interface StudentGroup {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: string;
  created_at: string;
  courses: {
    enrollment_id: string;
    course_id: string;
    course_title: string;
    course_thumbnail?: string;
    enrolled_at: string;
    progress_percent: number;
    status: 'active' | 'completed' | 'revoked';
  }[];
}

export const AdminEnrollmentsPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Top Manual Enrollment modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [manualModalMsg, setManualModalMsg] = useState<string | null>(null);

  // Edit Student Profile Modal
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);

  // Manage Student Courses Modal
  const [courseManagingStudent, setCourseManagingStudent] = useState<any | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [enrRes, stdRes, crsRes] = await Promise.all([
        api.get('/admin/enrollments'),
        api.get('/admin/students'),
        api.get('/admin/courses')
      ]);

      if (enrRes.success) setEnrollments(enrRes.enrollments || []);
      if (stdRes.success) {
        setStudents(stdRes.students || []);
        if (stdRes.students[0]) setSelectedStudentId(stdRes.students[0].id);
      }
      if (crsRes.success) {
        setCourses(crsRes.courses || []);
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

  // 1 Student = 1 Row Grouping
  const groupedStudents: StudentGroup[] = useMemo(() => {
    const studentMap = new Map<string, StudentGroup>();

    // 1. Initialize with all registered students
    students.forEach((s) => {
      studentMap.set(s.id, {
        id: s.id,
        name: s.name,
        email: s.email,
        avatar: s.avatar,
        status: s.status || 'active',
        created_at: s.created_at,
        courses: []
      });
    });

    // 2. Attach enrollments to each student
    enrollments.forEach((e) => {
      let student = studentMap.get(e.user_id);
      if (!student) {
        student = {
          id: e.user_id,
          name: e.student_name,
          email: e.student_email,
          avatar: e.student_avatar,
          status: 'active',
          created_at: e.enrolled_at,
          courses: []
        };
        studentMap.set(e.user_id, student);
      }

      const alreadyHasCourse = student.courses.some(
        (c) => c.enrollment_id === e.id || c.course_id === e.course_id
      );

      if (!alreadyHasCourse) {
        student.courses.push({
          enrollment_id: e.id,
          course_id: e.course_id,
          course_title: e.course_title,
          course_thumbnail: e.course_thumbnail,
          enrolled_at: e.enrolled_at,
          progress_percent: e.progress_percent,
          status: e.status
        });
      }
    });

    return Array.from(studentMap.values());
  }, [students, enrollments]);

  // Search filter across student name, email, or enrolled course titles
  const filteredStudents = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return groupedStudents;

    return groupedStudents.filter((s) => {
      const matchStudent =
        s.name?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term);
      const matchCourse = s.courses.some((c) =>
        c.course_title?.toLowerCase().includes(term)
      );
      return matchStudent || matchCourse;
    });
  }, [groupedStudents, search]);

  // Open Edit Courses Modal
  const handleOpenCourseManager = (student: StudentGroup) => {
    setCourseManagingStudent(student);
    setShowCourseModal(true);
  };

  // Open Edit Profile Modal
  const handleOpenEditStudent = (student: StudentGroup) => {
    const fullStudent = students.find((s) => s.id === student.id) || student;
    setEditingStudent(fullStudent);
    setShowEditStudentModal(true);
  };

  // Student Profile Updated callback
  const handleStudentUpdated = (updated: any) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
    );
  };

  // Manual Top Enrollment
  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedCourseId) return;

    setEnrolling(true);
    setManualModalMsg(null);
    try {
      const res = await api.post('/admin/enrollments/manual', {
        userId: selectedStudentId,
        courseId: selectedCourseId
      });

      if (res.success) {
        setShowManualModal(false);
        loadData();
      } else {
        setManualModalMsg(res.message || 'Failed to enroll student');
      }
    } catch (err: any) {
      setManualModalMsg(err.message || 'Failed to enroll student');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Student Access</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Enrollments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Student-wise overview. Edit student profiles, assign or revoke courses, and track learning progress.
          </p>
        </div>

        <button
          onClick={() => setShowManualModal(true)}
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
            placeholder="Search student or course title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'total students'}
        </span>
      </div>

      {/* Table: 1 Student = 1 Row */}
      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading students & enrollments...</div>
        ) : filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Enrolled Courses</th>
                  <th className="px-6 py-3.5">Avg Progress</th>
                  <th className="px-6 py-3.5">Account Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((std) => {
                  const activeCourses = std.courses.filter((c) => c.status === 'active');
                  const revokedCourses = std.courses.filter((c) => c.status === 'revoked');
                  const completedCourses = std.courses.filter((c) => c.status === 'completed');

                  const avgProgress =
                    std.courses.length > 0
                      ? Math.round(
                          std.courses.reduce((acc, c) => acc + (c.progress_percent || 0), 0) /
                            std.courses.length
                        )
                      : 0;

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Student Info */}
                      <td className="px-6 py-4">
                        <div
                          onClick={() => handleOpenEditStudent(std)}
                          className="flex items-center gap-3 cursor-pointer group"
                          title="Click to edit student profile"
                        >
                          <img
                            src={std.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${std.name}`}
                            alt={std.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20 group-hover:ring-emerald-500 bg-slate-100 transition-all flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                                {std.name}
                              </p>
                              <Pencil className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-colors opacity-70" />
                            </div>
                            <p className="text-[11px] text-slate-500">{std.email}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Joined: {std.created_at ? new Date(std.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Enrolled Courses Badges */}
                      <td className="px-6 py-4">
                        <div className="space-y-1.5 max-w-md">
                          {std.courses.length === 0 ? (
                            <div className="flex items-center gap-2 text-slate-400 italic text-xs">
                              <span>No courses enrolled</span>
                              <button
                                onClick={() => handleOpenCourseManager(std)}
                                className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold not-italic transition-colors cursor-pointer border border-emerald-200"
                              >
                                + Assign Course
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {std.courses.map((c) => {
                                const isRevoked = c.status === 'revoked';
                                const isCompleted = c.status === 'completed';

                                return (
                                  <div
                                    key={c.enrollment_id || c.course_id}
                                    onClick={() => handleOpenCourseManager(std)}
                                    title={`${c.course_title} - Click to edit course access`}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-2xs ${
                                      isRevoked
                                        ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                        : isCompleted
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                        : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200/80'
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        isRevoked
                                          ? 'bg-rose-500'
                                          : isCompleted
                                          ? 'bg-emerald-500'
                                          : 'bg-emerald-600'
                                      }`}
                                    />
                                    <span className="truncate max-w-[170px]">{c.course_title}</span>
                                    <span className="text-[10px] opacity-75 font-mono">
                                      {c.progress_percent}%
                                    </span>
                                    {isRevoked && (
                                      <span className="text-[9px] font-bold text-rose-600 uppercase bg-rose-100 px-1 rounded">
                                        REVOKED
                                      </span>
                                    )}
                                  </div>
                                );
                              })}

                              <button
                                onClick={() => handleOpenCourseManager(std)}
                                title="Add another course to this student"
                                className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Average Progress */}
                      <td className="px-6 py-4">
                        {std.courses.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                style={{ width: `${Math.max(5, avgProgress)}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-900 font-mono">{avgProgress}%</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            std.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {std.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenCourseManager(std)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-200 active:scale-95"
                            title="Manage & edit courses assigned to this student"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Edit Courses ({std.courses.length})</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditStudent(std)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 active:scale-95"
                            title="Edit student personal profile, email, or password"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit Student</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-sm">No students found matching your search.</div>
        )}
      </div>

      {/* Top Manual Enrollment Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form onSubmit={handleManualEnroll} className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Manual Student Enrollment</h3>
              <button type="button" onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {manualModalMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {manualModalMsg}
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
                onClick={() => setShowManualModal(false)}
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

      {/* Edit Student Profile Modal */}
      <EditStudentModal
        isOpen={showEditStudentModal}
        student={editingStudent}
        onClose={() => {
          setShowEditStudentModal(false);
          setEditingStudent(null);
        }}
        onSuccess={handleStudentUpdated}
      />

      {/* Manage Student Courses Modal */}
      <ManageStudentCoursesModal
        isOpen={showCourseModal}
        student={courseManagingStudent}
        allCourses={courses}
        onClose={() => {
          setShowCourseModal(false);
          setCourseManagingStudent(null);
        }}
        onUpdated={loadData}
      />
    </div>
  );
};
