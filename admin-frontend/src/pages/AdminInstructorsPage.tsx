import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { GraduationCap, PlusCircle, Trash2, Edit, Star, X } from 'lucide-react';

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
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Faculty Management</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Manage Instructors
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Add lead faculty members, edit biographies, and manage course assignments.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Instructor</span>
        </button>
      </div>

      {/* Grid of Instructors */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading instructors...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.map((inst) => (
            <div
              key={inst.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-md"
            >
              <div className="flex items-start gap-4">
                <img
                  src={inst.avatar}
                  alt={inst.name}
                  className="w-14 h-14 rounded-xl object-cover ring-2 ring-brand-500/30 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-white truncate">{inst.name}</h3>
                  <p className="text-xs text-brand-400 font-medium truncate">{inst.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">{inst.email}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {inst.bio}
              </p>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{inst.rating || 5.0}</span>
                </div>
                <span>{inst.courses_count || 0} courses</span>
                <span>{(inst.students_count || 0).toLocaleString()} students</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => openEditModal(inst)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(inst.id, inst.name)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-300"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleSave} className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Instructor' : 'Add New Instructor'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Title</label>
              <input
                type="text"
                placeholder="e.g. Principal AI Scientist & Ex-Google Lead"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Profile Photo URL</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Biography</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Core Expertise</label>
              <input
                type="text"
                placeholder="e.g. Machine Learning, Python, Distributed Systems"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
              />
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
                className="px-5 py-2 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs"
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
