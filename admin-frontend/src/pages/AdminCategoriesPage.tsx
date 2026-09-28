import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FolderTree, PlusCircle, Trash2, Edit, X } from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Code');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      if (res.success) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setIcon('Code');
    setShowModal(true);
  };

  const openEditModal = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name || '');
    setSlug(cat.slug || '');
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Code');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      slug: slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description.trim(),
      icon
    };

    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, payload);
      } else {
        await api.post('/admin/categories', payload);
      }
      setShowModal(false);
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Curriculum Taxonomies</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Manage Course Categories
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize catalog disciplines, category slugs, and homepage navigation pills.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div
            key={c.id}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-brand-400 font-bold uppercase">
                  Icon: {c.icon}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  {c.course_count || 0} courses
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-2">{c.name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{c.slug}</p>
              <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                {c.description}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => openEditModal(c)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(c.id, c.name)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleSave} className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Category' : 'Add Category'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Data Science & Analytics"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="data-science-analytics"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this track teaches"
                className="w-full p-2.5 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Icon Type</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
              >
                <option value="Database">Database (Data Science)</option>
                <option value="Code">Code (Web Development)</option>
                <option value="Cpu">Cpu (AI & Machine Learning)</option>
                <option value="TrendingUp">TrendingUp (Trading & Finance)</option>
                <option value="Cloud">Cloud (Cloud & DevOps)</option>
                <option value="Layout">Layout (UI/UX Design)</option>
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
                className="px-5 py-2 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
