import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Star, CheckCircle, EyeOff, Trash2 } from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reviews');
      if (res.success) {
        setReviews(res.reviews);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleStatus = async (reviewId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'approved' ? 'hidden' : 'approved';
    try {
      await api.put(`/admin/reviews/${reviewId}/status`, { status: nextStatus });
      setReviews(prev =>
        prev.map(r => (r.id === reviewId ? { ...r, status: nextStatus } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Quality & Moderation</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Course Reviews & Ratings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Moderate verified student feedback, approve testimonials, and maintain community guidelines.
        </p>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading reviews...</div>
        ) : reviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Course</th>
                  <th className="px-6 py-3.5">Rating</th>
                  <th className="px-6 py-3.5">Feedback</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-850/50">
                    <td className="px-6 py-4 font-bold text-white whitespace-nowrap">{r.student_name}</td>
                    <td className="px-6 py-4 font-medium text-slate-300 max-w-xs truncate">{r.course_title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 max-w-sm">{r.review_text}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(r.id, r.status)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                          r.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {r.status.toUpperCase()}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-sm">No reviews found.</div>
        )}
      </div>
    </div>
  );
};
