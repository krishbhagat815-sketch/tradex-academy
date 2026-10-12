import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Megaphone,
  PlusCircle,
  Sparkles,
  Trash2,
  Eye,
  MousePointerClick,
  Percent,
  X,
  ExternalLink,
  Layers,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowRight
} from 'lucide-react';

interface Popup {
  id: string;
  title: string;
  description: string;
  type: string;
  image_url: string;
  cta_text: string;
  cta_url: string;
  badge_text: string;
  bg_color: string;
  text_color: string;
  layout: string;
  animation: string;
  trigger_type: string;
  trigger_value: number;
  target_page: string;
  target_audience: string;
  frequency: string;
  priority: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  views_count: number;
  clicks_count: number;
  ctr?: string;
  created_at: string;
}

export const AdminPopupsPage: React.FC = () => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewPopup, setPreviewPopup] = useState<Popup | null>(null);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('discount');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaText, setCtaText] = useState('Explore Courses');
  const [ctaUrl, setCtaUrl] = useState('/courses');
  const [badgeText, setBadgeText] = useState('LIMITED TIME OFFER');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#0f172a');
  const [layout, setLayout] = useState('modal');
  const [triggerType, setTriggerType] = useState('delay');
  const [triggerValue, setTriggerValue] = useState(3);
  const [targetPage, setTargetPage] = useState('all');
  const [targetAudience, setTargetAudience] = useState('all');
  const [frequency, setFrequency] = useState('once_per_session');
  const [priority, setPriority] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPopups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/popups/admin');
      if (res.success) {
        setPopups(res.popups || []);
      }
    } catch (err: any) {
      console.error('Failed to load popups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPopups();
  }, []);

  const openCreateModal = () => {
    setEditingPopup(null);
    setTitle('');
    setDescription('');
    setType('discount');
    setImageUrl('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80');
    setCtaText('Get Started');
    setCtaUrl('/courses');
    setBadgeText('LIMITED TIME OFFER');
    setBgColor('#ffffff');
    setTextColor('#0f172a');
    setLayout('modal');
    setTriggerType('delay');
    setTriggerValue(3);
    setTargetPage('all');
    setTargetAudience('all');
    setFrequency('once_per_session');
    setPriority(1);
    setIsActive(true);
    setMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (p: Popup) => {
    setEditingPopup(p);
    setTitle(p.title || '');
    setDescription(p.description || '');
    setType(p.type || 'discount');
    setImageUrl(p.image_url || '');
    setCtaText(p.cta_text || 'Learn More');
    setCtaUrl(p.cta_url || '/courses');
    setBadgeText(p.badge_text || '');
    setBgColor(p.bg_color || '#ffffff');
    setTextColor(p.text_color || '#0f172a');
    setLayout(p.layout || 'modal');
    setTriggerType(p.trigger_type || 'delay');
    setTriggerValue(p.trigger_value || 3);
    setTargetPage(p.target_page || 'all');
    setTargetAudience(p.target_audience || 'all');
    setFrequency(p.frequency || 'once_per_session');
    setPriority(p.priority || 1);
    setIsActive(p.is_active);
    setMsg(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMsg({ type: 'error', text: 'Title is required.' });
      return;
    }

    setSaving(true);
    setMsg(null);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      type,
      image_url: imageUrl.trim(),
      cta_text: ctaText.trim(),
      cta_url: ctaUrl.trim(),
      badge_text: badgeText.trim(),
      bg_color: bgColor,
      text_color: textColor,
      layout,
      trigger_type: triggerType,
      trigger_value: Number(triggerValue),
      target_page: targetPage,
      target_audience: targetAudience,
      frequency,
      priority: Number(priority),
      is_active: isActive
    };

    try {
      if (editingPopup) {
        const res = await api.put(`/popups/admin/${editingPopup.id}`, payload);
        if (res.success) {
          setMsg({ type: 'success', text: 'Popup updated successfully!' });
          setTimeout(() => {
            setModalOpen(false);
            loadPopups();
          }, 800);
        } else {
          setMsg({ type: 'error', text: res.message || 'Failed to update popup.' });
        }
      } else {
        const res = await api.post('/popups/admin', payload);
        if (res.success) {
          setMsg({ type: 'success', text: 'Popup created successfully!' });
          setTimeout(() => {
            setModalOpen(false);
            loadPopups();
          }, 800);
        } else {
          setMsg({ type: 'error', text: res.message || 'Failed to create popup.' });
        }
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error saving popup.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await api.put(`/popups/admin/${id}/toggle`, {});
      if (res.success) {
        setPopups(prev =>
          prev.map(p => (p.id === id ? { ...p, is_active: !p.is_active } : p))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status.');
    }
  };

  const handleDelete = async (id: string, popupTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete popup "${popupTitle}"?`)) return;
    try {
      const res = await api.delete(`/popups/admin/${id}`);
      if (res.success) {
        setPopups(prev => prev.filter(p => p.id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete popup.');
    }
  };

  // Top Aggregate Metrics
  const totalViews = popups.reduce((acc, p) => acc + (p.views_count || 0), 0);
  const totalClicks = popups.reduce((acc, p) => acc + (p.clicks_count || 0), 0);
  const activeCount = popups.filter(p => p.is_active).length;
  const overallCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Promotion Engine</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Popup Campaigns & Banners
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create high-converting promotional popups, announcements, and coupon banners with customizable triggers and real-time CTR analytics.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Popup Campaign</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Active Campaigns</span>
            <Megaphone className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{activeCount} / {popups.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Impressions</span>
            <Eye className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalViews.toLocaleString()}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total CTA Clicks</span>
            <MousePointerClick className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalClicks.toLocaleString()}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Avg Click-Through (CTR)</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono">{overallCtr}%</div>
        </div>
      </div>

      {/* Popups Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading popup campaigns...</div>
        ) : popups.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Campaign Name</th>
                  <th className="px-6 py-3.5">Type & Trigger</th>
                  <th className="px-6 py-3.5">Targeting</th>
                  <th className="px-6 py-3.5">Impressions / Clicks</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {popups.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold flex-shrink-0">
                            <Sparkles className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            {p.badge_text && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                                {p.badge_text}
                              </span>
                            )}
                            <p className="font-bold text-slate-900 text-sm">{p.title}</p>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">{p.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="capitalize font-semibold text-slate-800 text-[11px]">{p.type} popup</span>
                        <p className="text-[10px] text-slate-400 capitalize">
                          Trigger: {p.trigger_type} ({p.trigger_value}s)
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-medium text-slate-700 capitalize">
                          Page: {p.target_page}
                        </span>
                        <p className="text-[10px] text-slate-400 capitalize">
                          Audience: {p.target_audience}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-slate-900 font-bold font-mono">
                          {p.views_count} <span className="text-slate-400 font-normal">views</span> / {p.clicks_count} <span className="text-slate-400 font-normal">clicks</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.ctr || '0%'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(p.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                          p.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {p.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewPopup(p)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Preview Popup"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => openEditModal(p)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-emerald-200"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Popup"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-sm">
            <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>No popup campaigns found. Click "Create New Popup Campaign" above to launch one!</p>
          </div>
        )}
      </div>

      {/* Popup Creation / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingPopup ? 'Edit Popup Campaign' : 'Create New Popup Campaign'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {msg && (
                <div
                  className={`p-3 rounded-xl border flex items-center gap-2 ${
                    msg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{msg.text}</span>
                </div>
              )}

              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Campaign Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 20% Off Gujarati Algo Trading Mastery!"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Text (Optional)</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. FLASH SALE, NEW"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Popup Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Offer details, coupon code, or announcement details..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Image & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Promotional Banner Image URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campaign Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="discount">Discount / Coupon Code</option>
                    <option value="welcome">Welcome Visitor</option>
                    <option value="new_course">New Course Announcement</option>
                    <option value="promotion">Trading Webinar / Live Class</option>
                    <option value="newsletter">Free Trading Checklist / Newsletter</option>
                    <option value="custom">General Custom Popup</option>
                  </select>
                </div>
              </div>

              {/* Button CTA Text & URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Button CTA Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Claim Discount Now"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destination URL / Page</label>
                  <input
                    type="text"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="/courses or https://wa.me/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Display Rules */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                  Display & Frequency Rules
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Trigger Event</label>
                    <select
                      value={triggerType}
                      onChange={(e) => setTriggerType(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="delay">Timed Delay (seconds)</option>
                      <option value="scroll">Scroll Percentage</option>
                      <option value="immediate">Immediate on Load</option>
                      <option value="exit_intent">Exit Intent (Mouse Leave)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {triggerType === 'scroll' ? 'Scroll % (e.g. 50)' : 'Seconds (e.g. 3)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={triggerValue}
                      onChange={(e) => setTriggerValue(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Frequency Limit</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="once_per_session">Once Per Session</option>
                      <option value="once_per_day">Once Per Day</option>
                      <option value="always">Every Visit</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Page</label>
                    <select
                      value={targetPage}
                      onChange={(e) => setTargetPage(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="all">All Website Pages</option>
                      <option value="home">Homepage Only</option>
                      <option value="courses">Courses List Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                    <select
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="all">Everyone (Visitors + Students)</option>
                      <option value="guests">Guests Only (Non-logged-in)</option>
                      <option value="logged_in">Logged-in Students Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Priority (1 = Low, 10 = Max)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isActiveToggle" className="font-bold text-slate-700 cursor-pointer">
                  Activate this popup immediately
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {saving ? 'Saving...' : editingPopup ? 'Update Campaign' : 'Launch Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Close mock button */}
            <button
              onClick={() => setPreviewPopup(null)}
              className="absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full bg-slate-900/40 hover:bg-slate-900/70 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Image */}
            {previewPopup.image_url && (
              <div className="w-full h-44 bg-slate-100 overflow-hidden relative">
                <img
                  src={previewPopup.image_url}
                  alt={previewPopup.title}
                  className="w-full h-full object-cover"
                />
                {previewPopup.badge_text && (
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-emerald-600 text-white shadow-xs">
                    {previewPopup.badge_text}
                  </span>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-6 text-center space-y-3">
              <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                {previewPopup.title}
              </h3>
              {previewPopup.description && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {previewPopup.description}
                </p>
              )}

              <div className="pt-2">
                <button
                  onClick={() => setPreviewPopup(null)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{previewPopup.cta_text || 'Learn More'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-slate-400 mt-2">Preview Mode • Click X to close</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
