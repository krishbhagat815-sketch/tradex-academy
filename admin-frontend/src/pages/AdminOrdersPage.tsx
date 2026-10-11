import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Search,
  X,
  CreditCard,
  CheckCircle2,
  Clock,
  RotateCcw,
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

  const completedOrders = orders.filter(o => o.payment_status === 'completed');
  const pendingOrders = orders.filter(o => o.payment_status === 'pending');
  const refundedOrders = orders.filter(o => o.payment_status === 'refunded' || o.payment_status === 'failed');

  const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);

  const filtered = orders.filter(o => {
    const term = search.toLowerCase();
    const matchesSearch =
      o.order_number?.toLowerCase().includes(term) ||
      o.student_name?.toLowerCase().includes(term) ||
      o.course_title?.toLowerCase().includes(term) ||
      o.transaction_id?.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || o.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-16">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Financial Ledger</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Orders & Transactions
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review verified payments, inspect Razorpay transaction IDs, and reconcile student purchases.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Verified Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">
            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">From successful payments</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Successful Orders</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {completedOrders.length}
          </p>
          <span className="text-[11px] text-emerald-600 mt-1 block">Active enrollments granted</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Orders</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {pendingOrders.length}
          </p>
          <span className="text-[11px] text-amber-600 mt-1 block">Awaiting payment</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Refunded / Failed</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {refundedOrders.length}
          </p>
          <span className="text-[11px] text-rose-500 mt-1 block">Access revoked / cancelled</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search order #, student, or transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Payment Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="completed">Completed ({completedOrders.length})</option>
            <option value="pending">Pending ({pendingOrders.length})</option>
            <option value="refunded">Refunded / Failed ({refundedOrders.length})</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading transactions...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Order #</th>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Course</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Method</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                      {ord.order_number}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{ord.student_name}</p>
                      <p className="text-[11px] text-slate-500">{ord.student_email}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 max-w-xs truncate">
                      {ord.course_title}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 text-sm">
                      ₹{Number(ord.amount).toFixed(2)}
                      {ord.discount_amount > 0 && (
                        <span className="block text-[10px] text-emerald-600 font-normal">
                          Saved ₹{Number(ord.discount_amount).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 uppercase text-slate-600 font-medium">
                      {ord.payment_method || 'UPI'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          ord.payment_status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : ord.payment_status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {ord.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer transition-colors"
                      >
                        Invoice
                      </button>
                      {ord.payment_status === 'completed' && (
                        <button
                          onClick={() => handleRefund(ord.id, ord.order_number)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 cursor-pointer transition-colors"
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
          <div className="p-12 text-center text-slate-500 text-sm">No orders found.</div>
        )}
      </div>

      {/* Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg p-8 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-2xl relative animate-in fade-in duration-150">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Invoice Details</h3>
                <p className="text-xs font-mono text-emerald-600 font-semibold">{selectedOrder.order_number}</p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  selectedOrder.payment_status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedOrder.payment_status === 'pending'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {selectedOrder.payment_status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-900">{selectedOrder.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Email:</span>
                <span className="font-semibold text-slate-900">{selectedOrder.student_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Course Enrolled:</span>
                <span className="font-semibold text-slate-900 max-w-xs text-right">{selectedOrder.course_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-semibold text-slate-800 uppercase">{selectedOrder.payment_method || 'UPI'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Razorpay Payment ID:</span>
                <span className="font-mono text-slate-700">{selectedOrder.transaction_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Razorpay Order ID:</span>
                <span className="font-mono text-slate-700">
                  {(selectedOrder.billing_info && typeof selectedOrder.billing_info === 'string') 
                    ? (JSON.parse(selectedOrder.billing_info).razorpay_order_id || 'N/A')
                    : (selectedOrder.billing_info?.razorpay_order_id || 'N/A')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Coupon Used:</span>
                <span className="font-mono text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  {selectedOrder.coupon_code || 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-700">{new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Total Amount Charged:</span>
                <span className="text-emerald-600">₹{Number(selectedOrder.amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 cursor-pointer"
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
