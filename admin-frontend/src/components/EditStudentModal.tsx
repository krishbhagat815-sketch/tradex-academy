import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface EditStudentModalProps {
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status?: string;
    headline?: string;
    bio?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: any) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setEmail(student.email || '');
      setPassword('');
      setStatus((student.status as any) === 'suspended' ? 'suspended' : 'active');
      setHeadline(student.headline || '');
      setBio(student.bio || '');
      setAvatar(student.avatar || '');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const handleGenerateDicebear = () => {
    const randomSeed = encodeURIComponent(name.trim() || `student_${Date.now()}`);
    const newAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${randomSeed}&backgroundColor=059669,06b6d4,3b82f6`;
    setAvatar(newAvatarUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Student name is required.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Student email is required.');
      return;
    }
    if (password && password.trim().length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        status,
        headline: headline.trim(),
        bio: bio.trim(),
        avatar: avatar.trim()
      };

      if (password && password.trim().length >= 6) {
        payload.password = password.trim();
      }

      const res = await api.put(`/admin/students/${student.id}`, payload);

      if (res.success) {
        setSuccessMsg('Student details updated successfully!');
        setTimeout(() => {
          onSuccess(res.student);
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.message || 'Failed to update student.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network or server error while updating student.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Edit Student Profile</h2>
              <p className="text-[11px] text-slate-500 font-mono">ID: {student.id}</p>
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

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
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

          {/* Avatar Section */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <img
              src={avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${name || 'student'}`}
              alt="Student Avatar"
              className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500/20 bg-white"
            />
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Avatar Photo</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Paste image URL..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleGenerateDicebear}
                  title="Generate random initials avatar"
                  className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto</span>
                </button>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Student Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password Reset (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Reset Password <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <span className="text-[10px] text-slate-400">Leave blank to keep unchanged</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new master password (min 6 chars)..."
                className="w-full pl-9 pr-10 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Account Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Account Access Status</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  status === 'active'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs">Active (Normal Access)</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  status === 'suspended'
                    ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="suspended"
                  checked={status === 'suspended'}
                  onChange={() => setStatus('suspended')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs">Suspended (Blocked)</span>
              </label>
            </div>
          </div>

          {/* Headline / Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Headline / Trading Level <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Option Buyer, Beginner Trader, Surat"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Bio / Admin Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bio / Admin Internal Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Add contact notes or student background..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
