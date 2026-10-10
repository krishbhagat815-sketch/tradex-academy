import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PlusCircle, Trash2, Edit, Star, X, Upload, Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { getMediaUrl } from '../utils/media';

export const AdminInstructorsPage: React.FC = () => {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300');
  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadInstructors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/instructors');
      if (res.success) {
        setInstructors(res.instructors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstructors();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setTitle('');
    setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300');
    setBio('');
    setExpertise('');
    setShowModal(true);
  };

  const openEditModal = (inst: any) => {
    setEditingId(inst.id);
    setName(inst.name || '');
    setEmail(inst.email || '');
    setTitle(inst.title || '');
    setAvatar(inst.avatar || '');
    setBio(inst.bio || '');
    setExpertise(inst.expertise || '');
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Photo must be less than 10MB.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/upload', formData);
      if (res.success && res.url) {
        setAvatar(res.url);
      } else {
        throw new Error(res.message || 'Photo upload failed');
      }
    } catch (err: any) {
      console.warn('Server upload failed, converting to local data URL:', err);
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setAvatar(loadEvt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const payload = {
      name: name.trim(),
      email: email.trim(),
      title: title.trim(),
      avatar: avatar.trim(),
      bio: bio.trim(),
      expertise: expertise.trim()
    };

    try {
      if (editingId) {
        await api.put(`/admin/instructors/${editingId}`, payload);
      } else {
        await api.post('/admin/instructors', payload);
      }
      setShowModal(false);
      loadInstructors();
    } catch (err: any) {
      alert(err.message || 'Failed to save instructor');
    }
  };

  const handleDelete = async (id: string, instName: string) => {
    if (!window.confirm(`Delete instructor "${instName}"?`)) return;
    try {
      await api.delete(`/admin/instructors/${id}`);
      setInstructors(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Faculty Management</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Instructors
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Add lead faculty members, edit biographies, and manage course assignments.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Instructor</span>
        </button>
      </div>

      {/* Grid of Instructors */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading instructors...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.map((inst) => (
            <div
              key={inst.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col justify-between space-y-4 hover:shadow-card-hover transition-all"
            >
              <div className="flex items-start gap-4">
                <img
                  src={getMediaUrl(inst.avatar)}
                  alt={inst.name}
                  className="w-14 h-14 rounded-xl object-cover ring-2 ring-emerald-500/20 flex-shrink-0 bg-slate-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(inst.name)}`;
                  }}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900 truncate">{inst.name}</h3>
                  <p className="text-xs text-emerald-600 font-medium truncate">{inst.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">{inst.email}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {inst.bio}
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{inst.rating || 5.0}</span>
                </div>
                <span>{inst.courses_count || 0} courses</span>
                <span>{(inst.students_count || 0).toLocaleString()} students</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => openEditModal(inst)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title="Edit Instructor"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(inst.id, inst.name)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete Instructor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form onSubmit={handleSave} className="w-full max-w-lg p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? 'Edit Instructor' : 'Add New Instructor'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Title</label>
              <input
                type="text"
                placeholder="e.g. Principal AI Scientist & Ex-Google Lead"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Instructor Profile Photo
              </label>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-4">
                  {/* Photo Preview Circle/Square */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden ring-2 ring-emerald-500/30 bg-slate-200 flex-shrink-0 flex items-center justify-center">
                    {avatar ? (
                      <img
                        src={getMediaUrl(avatar)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'Instructor')}`;
                        }}
                      />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-400" />
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <label
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          uploading
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Photo</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploading}
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      {avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar('')}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-rose-600 text-xs transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Upload JPG, PNG or WebP image. Max 10MB.
                    </p>
                  </div>
                </div>

                {/* Direct image URL fallback */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>Or image URL</span>
                    {avatar && avatar.startsWith('/uploads') && (
                      <span className="text-emerald-600 font-mono text-[10px] flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Uploaded to server
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="https://... or /uploads/..."
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 font-mono focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Biography</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Core Expertise</label>
              <input
                type="text"
                placeholder="e.g. Machine Learning, Python, Distributed Systems"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
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
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95"
              >
                Save Instructor
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
