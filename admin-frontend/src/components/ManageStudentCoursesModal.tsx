import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  X,
  BookOpen,
  PlusCircle,
  RotateCcw,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  GraduationCap
} from 'lucide-react';

interface EnrolledCourse {
  enrollment_id: string;
  course_id: string;
  course_title: string;
  course_thumbnail?: string;
  enrolled_at: string;
  progress_percent: number;
  status: 'active' | 'completed' | 'revoked';
}

interface ManageStudentCoursesModalProps {
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status?: string;
    courses?: EnrolledCourse[];
  } | null;
  allCourses: any[];
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const ManageStudentCoursesModal: React.FC<ManageStudentCoursesModalProps> = ({
  student,
  allCourses,
  isOpen,
  onClose,
  onUpdated
}) => {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [selectedNewCourseId, setSelectedNewCourseId] = useState('');
  const [addingCourse, setAddingCourse] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync courses whenever student or modal opens
  useEffect(() => {
    if (student) {
      setCourses(student.courses || []);
      setErrorMsg(null);
      setSuccessMsg(null);

      // Select first available course that is not already enrolled
      const enrolledIds = new Set((student.courses || []).map(c => c.course_id));
      const available = allCourses.filter(c => !enrolledIds.has(c.id));
      setSelectedNewCourseId(available[0]?.id || '');
    }
  }, [student, isOpen, allCourses]);

  if (!isOpen || !student) return null;

  // Filter available courses not yet enrolled
  const enrolledCourseIds = new Set(courses.map(c => c.course_id));
  const availableCourses = allCourses.filter(c => !enrolledCourseIds.has(c.id));

  // 1. Assign New Course to Student
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewCourseId) return;

    setAddingCourse(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.post('/admin/enrollments/manual', {
        userId: student.id,
        courseId: selectedNewCourseId
      });

      if (res.success) {
        setSuccessMsg('Course assigned successfully!');
        onUpdated();
        // Update local state
        const addedCourseObj = allCourses.find(c => c.id === selectedNewCourseId);
        if (addedCourseObj) {
          setCourses(prev => [
            {
              enrollment_id: `temp-${Date.now()}`,
              course_id: addedCourseObj.id,
              course_title: addedCourseObj.title,
              course_thumbnail: addedCourseObj.thumbnail,
              enrolled_at: new Date().toISOString(),
              progress_percent: 0,
              status: 'active'
            },
            ...prev
          ]);
        }
      } else {
        setErrorMsg(res.message || 'Failed to assign course.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to assign course.');
    } finally {
      setAddingCourse(false);
    }
  };

  // 2. Toggle Status (Active <-> Revoked <-> Completed)
  const handleToggleStatus = async (enrollmentId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'revoked' ? 'active' : 'revoked';
    setActionLoadingId(enrollmentId);
    setErrorMsg(null);

    try {
      const res = await api.put(`/admin/enrollments/${enrollmentId}`, {
        status: nextStatus
      });

      if (res.success) {
        setCourses(prev =>
          prev.map(c => (c.enrollment_id === enrollmentId ? { ...c, status: nextStatus as any } : c))
        );
        onUpdated();
      } else {
        setErrorMsg(res.message || 'Failed to update course status.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update course status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 3. Update Progress Percentage
  const handleUpdateProgress = async (enrollmentId: string, newProgress: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newProgress)));
    try {
      await api.put(`/admin/enrollments/${enrollmentId}`, {
        progress_percent: clamped
      });
      setCourses(prev =>
        prev.map(c => (c.enrollment_id === enrollmentId ? { ...c, progress_percent: clamped } : c))
      );
      onUpdated();
    } catch (err: any) {
      console.error('Failed to update progress:', err);
    }
  };

  // 4. Remove / Delete Course Permanently
  const handleRemoveCourse = async (enrollmentId: string, courseTitle: string) => {
    if (!window.confirm(`Permanently remove "${courseTitle}" from ${student.name}? The student will lose this course completely.`)) {
      return;
    }

    setActionLoadingId(enrollmentId);
    setErrorMsg(null);

    try {
      const res = await api.delete(`/admin/enrollments/${enrollmentId}?permanent=true`);
      if (res.success) {
        setCourses(prev => prev.filter(c => c.enrollment_id !== enrollmentId));
        setSuccessMsg(`"${courseTitle}" removed successfully.`);
        onUpdated();
      } else {
        setErrorMsg(res.message || 'Failed to remove course.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove course.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <img
              src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`}
              alt={student.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/20 bg-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{student.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
                </span>
              </div>
              <p className="text-xs text-slate-500">{student.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Enrolled Courses List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Enrolled Courses ({courses.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">Modify access, toggle status, or update progress</span>
            </div>

            {courses.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No courses assigned to this student</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Use the section below to assign a course.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {courses.map((c) => {
                  const isRevoked = c.status === 'revoked';
                  const isCompleted = c.status === 'completed';
                  const isLoading = actionLoadingId === c.enrollment_id;

                  return (
                    <div
                      key={c.enrollment_id || c.course_id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isRevoked
                          ? 'bg-rose-50/40 border-rose-200/80'
                          : isCompleted
                          ? 'bg-emerald-50/40 border-emerald-200/80'
                          : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Course Info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {c.course_thumbnail ? (
                            <img
                              src={c.course_thumbnail}
                              alt={c.course_title}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-slate-200 bg-slate-100"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 font-bold text-xs">
                              <BookOpen className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate" title={c.course_title}>
                              {c.course_title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : isRevoked
                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                    : 'bg-sky-50 text-sky-700 border-sky-200'
                                }`}
                              >
                                {c.status ? c.status.toUpperCase() : 'ACTIVE'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Enrolled: {c.enrolled_at ? new Date(c.enrolled_at).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Input */}
                        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                          <span className="text-[11px] font-semibold text-slate-500">Progress:</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={c.progress_percent || 0}
                            onChange={(e) => handleUpdateProgress(c.enrollment_id, Number(e.target.value))}
                            className="w-14 px-1.5 py-0.5 text-center text-xs font-bold font-mono bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900"
                          />
                          <span className="text-xs font-bold text-slate-600">%</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleToggleStatus(c.enrollment_id, c.status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                              isRevoked
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                                : 'bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border-rose-200'
                            }`}
                            title={isRevoked ? 'Reactivate course access' : 'Revoke course access'}
                          >
                            {isRevoked ? (
                              <>
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reactivate</span>
                              </>
                            ) : (
                              <span>Revoke Access</span>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleRemoveCourse(c.enrollment_id, c.course_title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                            title="Remove this course completely"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Assign New Course */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Assign Another Course to this Student</span>
            </h3>

            {availableCourses.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                This student is already enrolled in all available courses in the academy!
              </p>
            ) : (
              <form onSubmit={handleAddCourse} className="flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={selectedNewCourseId}
                  onChange={(e) => setSelectedNewCourseId(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="" disabled>Select a course to enroll...</option>
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.price ? `₹${c.price}` : 'Free'})
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={addingCourse || !selectedNewCourseId}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 flex-shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{addingCourse ? 'Enrolling...' : 'Grant Course Access'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
};
