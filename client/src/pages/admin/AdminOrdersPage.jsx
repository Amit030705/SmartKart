import React, { useState, useEffect } from 'react';
import { ShoppingCart, Check, AlertCircle, Clock, Truck } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = statusFilter ? `/admin/orders?status=${statusFilter}` : '/admin/orders';
      const res = await api.get(url);
      if (res.data.success) {
        setOrders(res.data.orders || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/status`, {
        status: newStatus,
        note: `Status updated to ${newStatus} by administrator.`,
      });
      if (res.data.success) {
        fetchOrders();
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Customer Orders Pipeline</h2>
            <p className="text-xs text-slate-500">
              Total {total} customer transactions recorded in system
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Purchased Items</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-mono font-bold text-slate-900">#{ord.orderNumber}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(ord.createdAt)}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-800">{ord.user?.name || 'Customer'}</p>
                      <p className="text-[11px] text-slate-400">{ord.user?.email || 'N/A'}</p>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        {ord.items?.map((item, idx) => (
                          <p key={idx} className="line-clamp-1 text-slate-700">
                            • {item.name} × {item.quantity}
                          </p>
                        ))}
                      </div>
                    </td>

                    <td className="p-4 font-black text-slate-900">
                      {formatCurrency(ord.pricing?.total)}
                    </td>

                    <td className="p-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : ord.status === 'shipped'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : ord.status === 'processing'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
