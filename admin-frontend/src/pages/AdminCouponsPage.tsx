import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Tag, PlusCircle, Trash2, CheckCircle2, X } from 'lucide-react';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New coupon modal
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState('20');
  const [minOrder, setMinOrder] = useState('0');
  const [usageLimit, setUsageLimit] = useState('100');
  const [expiresAt, setExpiresAt] = useState('2027-12-31');

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/coupons');
      if (res.success) {
        setCoupons(res.coupons);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      const res = await api.post('/admin/coupons', {
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_amount: Number(minOrder),
        usage_limit: Number(usageLimit),
        expires_at: expiresAt || null
      });

      if (res.success) {
        setShowModal(false);
        setCode('');
        loadCoupons();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create coupon');
    }
  };

  const handleToggleActive = async (couponId: string, current: number) => {
    const nextState = current === 1 ? 0 : 1;
    try {
      await api.put(`/admin/coupons/${couponId}`, { is_active: nextState });
      setCoupons(prev =>
        prev.map(c => (c.id === couponId ? { ...c, is_active: nextState } : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!window.confirm('Delete this coupon code permanently?')) return;
    try {
      await api.delete(`/admin/coupons/${couponId}`);
      setCoupons(prev => prev.filter(c => c.id !== couponId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Marketing & Promos</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Coupons & Discounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create promotional campaigns, percentage discounts, and fixed checkout incentives.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading coupons...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Coupon Code</th>
                  <th className="px-6 py-3.5">Discount</th>
                  <th className="px-6 py-3.5">Usage / Limit</th>
                  <th className="px-6 py-3.5">Expiry</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850/50">
                    <td className="px-6 py-4 font-mono font-bold text-brand-400 text-sm">{c.code}</td>
                    <td className="px-6 py-4 font-bold text-white text-xs">
                      {c.discount_type === 'percent' ? `${c.discount_value}% OFF` : `$${c.discount_value} FLAT OFF`}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">
                      {c.used_count} / {c.usage_limit} used
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'No expiry'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(c.id, c.is_active)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                          c.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {c.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
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
        )}
      </div>

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleCreateCoupon} className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create New Coupon</h3>
              <button type="button" onClick={() => setShowModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. SUMMER30"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs font-mono uppercase text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Value *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Usage Limit</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white"
                />
              </div>
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
                Create Coupon
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
