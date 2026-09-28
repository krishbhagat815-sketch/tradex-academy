import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  ShoppingBag,
  Search,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  FileText,
  X,
  CreditCard
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Receipt Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders');
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleRefund = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Issue refund for order ${orderNumber}? This will revoke student access.`)) {
      return;
    }

    try {
      const res = await api.post(`/admin/orders/${orderId}/refund`);
      if (res.success) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, payment_status: 'refunded' } : o))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Refund failed');
    }
  };

  const filtered = orders.filter(o => {
    const term = search.toLowerCase();
    const matchesSearch =
      o.order_number?.toLowerCase().includes(term) ||
      o.student_name?.toLowerCase().includes(term) ||
      o.course_title?.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || o.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-16">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Financial Ledger</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Orders & Transactions
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review payments, manage refund requests, and inspect transaction invoices.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search order number or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Payment Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-750 rounded-xl text-xs text-slate-200"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading transactions...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Order #</th>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Course</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Payment</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-850/50">
                    <td className="px-6 py-4 font-mono font-bold text-white text-xs">
                      {ord.order_number}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{ord.student_name}</p>
                      <p className="text-[11px] text-slate-400">{ord.student_email}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200 max-w-xs truncate">
                      {ord.course_title}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white text-sm">
                      ${Number(ord.amount).toFixed(2)}
                      {ord.discount_amount > 0 && (
                        <span className="block text-[10px] text-brand-400 font-normal">
                          Saved ${Number(ord.discount_amount).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 uppercase text-slate-400 font-medium">
                      {ord.payment_method}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          ord.payment_status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {ord.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        Invoice
                      </button>
                      {ord.payment_status === 'completed' && (
                        <button
                          onClick={() => handleRefund(ord.id, ord.order_number)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-sm">No orders found.</div>
        )}
      </div>

      {/* Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Invoice Details</h3>
                <p className="text-xs font-mono text-brand-400">{selectedOrder.order_number}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {selectedOrder.payment_status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-semibold text-white">{selectedOrder.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Email:</span>
                <span className="font-semibold text-white">{selectedOrder.student_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Course Enrolled:</span>
                <span className="font-semibold text-white max-w-xs text-right">{selectedOrder.course_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono text-slate-300">{selectedOrder.transaction_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Coupon Used:</span>
                <span className="font-mono text-amber-400 font-bold">{selectedOrder.coupon_code || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="text-slate-300">{new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-800 text-sm font-bold text-white">
                <span>Total Amount Charged:</span>
                <span className="text-brand-400">${Number(selectedOrder.amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
