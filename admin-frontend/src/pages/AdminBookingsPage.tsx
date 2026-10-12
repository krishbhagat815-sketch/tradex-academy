import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Video,
  PlusCircle,
  Edit,
  Trash2,
  ExternalLink,
  Filter,
  Check,
  X
} from 'lucide-react';

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit / Status Modal
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('confirmed');
  const [meetingLink, setMeetingLink] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // Create Manual Booking Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    counseling_type: '1-on-1 Trading Mentorship & Strategy Review',
    preferred_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    preferred_time_slot: '11:30 AM - 12:30 PM',
    experience_level: 'Beginner',
    notes: '',
    meeting_link: '',
    status: 'confirmed'
  });
  const [submittingManual, setSubmittingManual] = useState(false);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bookings');
      if (res.success) {
        setBookings(res.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleOpenEdit = (b: any) => {
    setEditingBooking(b);
    setNewStatus(b.status || 'confirmed');
    setMeetingLink(b.meeting_link || '');
    setAdminNotes(b.admin_notes || '');
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    setSavingStatus(true);
    try {
      const res = await api.put(`/admin/bookings/${editingBooking.id}`, {
        status: newStatus,
        meeting_link: meetingLink.trim(),
        admin_notes: adminNotes.trim()
      });
      if (res.success) {
        setBookings(prev =>
          prev.map(b => (b.id === editingBooking.id ? res.booking : b))
        );
        setEditingBooking(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update booking');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete counseling booking for ${name}?`)) {
      return;
    }
    try {
      const res = await api.delete(`/admin/bookings/${id}`);
      if (res.success) {
        setBookings(prev => prev.filter(b => b.id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete booking');
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingManual(true);
    try {
      const res = await api.post('/admin/bookings', manualForm);
      if (res.success) {
        setBookings(prev => [res.booking, ...prev]);
        setCreateModalOpen(false);
        setManualForm({
          client_name: '',
          client_email: '',
          client_phone: '',
          counseling_type: '1-on-1 Trading Mentorship & Strategy Review',
          preferred_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
          preferred_time_slot: '11:30 AM - 12:30 PM',
          experience_level: 'Beginner',
          notes: '',
          meeting_link: '',
          status: 'confirmed'
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create booking');
    } finally {
      setSubmittingManual(false);
    }
  };

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

  const filteredBookings = bookings.filter(b => {
    const term = search.toLowerCase();
    const matchesSearch =
      b.client_name?.toLowerCase().includes(term) ||
      b.client_email?.toLowerCase().includes(term) ||
      b.client_phone?.toLowerCase().includes(term) ||
      b.counseling_type?.toLowerCase().includes(term) ||
      b.id?.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Real-Time Sessions
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Counseling & Mentorship Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage 1-on-1 live mentoring appointments, attach Google Meet / Zoom links, and track consultation progress.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Manual Booking</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{totalBookings}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Live database records</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Confirmation</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">{pendingBookings}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting meeting link</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Confirmed & Scheduled</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">{confirmedBookings}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Ready for 1-on-1 session</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Completed Sessions</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-teal-600 mt-2">{completedBookings}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Successfully held</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client, email, phone, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st} {st !== 'all' && `(${bookings.filter(b => b.status === st).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
            Loading real counseling appointments from database...
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Client Information</th>
                  <th className="px-5 py-3">Counseling Type</th>
                  <th className="px-5 py-3">Date & Time Slot</th>
                  <th className="px-5 py-3">Experience</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Meeting Link</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          {b.client_name ? b.client_name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{b.client_name}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {b.client_email}
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {b.client_phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-800 max-w-[220px]">
                      <p className="truncate font-semibold">{b.counseling_type}</p>
                      {b.topic && <p className="text-[11px] text-slate-400 truncate mt-0.5">Topic: {b.topic}</p>}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-900 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {b.preferred_date}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {b.preferred_time_slot}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        {b.experience_level || 'Beginner'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {b.status === 'confirmed' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                          <Check className="w-3 h-3" /> Confirmed
                        </span>
                      )}
                      {b.status === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-max">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                      {b.status === 'completed' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      )}
                      {b.status === 'cancelled' && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-max">
                          <X className="w-3 h-3" /> Cancelled
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {b.meeting_link ? (
                        <a
                          href={b.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 truncate max-w-[150px]"
                        >
                          <Video className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">Open Session Link</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No link assigned yet</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Manage Status & Meeting Link"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                        <button
                          onClick={() => handleDelete(b.id, b.client_name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Booking"
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
          <div className="p-12 text-center text-slate-500">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-sm">No counseling bookings match your filters.</p>
            <p className="text-xs text-slate-400 mt-1">
              New client bookings from the public booking page will appear here in real time.
            </p>
          </div>
        )}
      </div>

      {/* Edit / Status & Meeting Link Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setEditingBooking(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">
              Manage Counseling Session
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Client: <span className="font-semibold text-slate-800">{editingBooking.client_name}</span> • {editingBooking.counseling_type}
            </p>

            <form onSubmit={handleSaveStatus} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Session Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="pending">Pending Review</option>
                  <option value="confirmed">Confirmed & Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Google Meet / Zoom Meeting URL
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Internal Mentor / Admin Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Add notes about candidate background, discussion points, or next steps..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStatus}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  {savingStatus ? 'Saving...' : 'Save & Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Booking Creation Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900">
              Schedule Manual Counseling Booking
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add a new counseling or mentorship appointment directly into the real database.
            </p>

            <form onSubmit={handleCreateManual} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.client_name}
                    onChange={(e) => setManualForm({ ...manualForm, client_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={manualForm.client_email}
                    onChange={(e) => setManualForm({ ...manualForm, client_email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    WhatsApp / Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={manualForm.client_phone}
                    onChange={(e) => setManualForm({ ...manualForm, client_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Trading Experience
                  </label>
                  <select
                    value={manualForm.experience_level}
                    onChange={(e) => setManualForm({ ...manualForm, experience_level: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Beginner">Beginner (0-6 Months)</option>
                    <option value="Intermediate">Intermediate (6-18 Months)</option>
                    <option value="Experienced">Experienced Trader (1-3 Years)</option>
                    <option value="Advanced">Advanced Pro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Counseling Session Type *
                </label>
                <select
                  value={manualForm.counseling_type}
                  onChange={(e) => setManualForm({ ...manualForm, counseling_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="1-on-1 Trading Mentorship & Strategy Review">1-on-1 Trading Mentorship & Strategy Review</option>
                  <option value="Risk Management & Portfolio Counseling">Risk Management & Portfolio Counseling</option>
                  <option value="Beginner Stock Market Counseling & Roadmap">Beginner Stock Market Counseling & Roadmap</option>
                  <option value="Options Trading & Nifty Expiry Counseling">Options Trading & Nifty Expiry Counseling</option>
                  <option value="Algo Trading & Strategy Automation Consultation">Algo Trading & Strategy Automation Consultation</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={manualForm.preferred_date}
                    onChange={(e) => setManualForm({ ...manualForm, preferred_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Time Slot *
                  </label>
                  <select
                    value={manualForm.preferred_time_slot}
                    onChange={(e) => setManualForm({ ...manualForm, preferred_time_slot: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM</option>
                    <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                    <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                    <option value="06:30 PM - 07:30 PM">06:30 PM - 07:30 PM</option>
                    <option value="08:00 PM - 09:00 PM">08:00 PM - 09:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Meeting URL (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={manualForm.meeting_link}
                  onChange={(e) => setManualForm({ ...manualForm, meeting_link: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Session Goals / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Specific goals or requirements discussed..."
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  {submittingManual ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
