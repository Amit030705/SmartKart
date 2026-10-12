import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export default function OrderHistoryPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/orders/my-orders');
        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Package className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Please Sign In</h2>
        <p className="text-xs text-slate-500">Log in to view your order history and tracking status.</p>
        <Link to="/login" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold inline-block">
          Log In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4 animate-pulse">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-32 bg-slate-200 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Your Order History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track packages, view past electronics receipts, and check delivery status
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't made any purchases on SmartCart. Browse our electronics catalog to place your first order.
          </p>
          <Link
            to="/catalog"
            className="px-5 py-2.5 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-colors inline-block"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusColors = {
              pending: 'bg-amber-100 text-amber-800',
              processing: 'bg-sky-100 text-sky-800',
              shipped: 'bg-indigo-100 text-indigo-800',
              delivered: 'bg-emerald-100 text-emerald-800',
              cancelled: 'bg-rose-100 text-rose-800',
            };

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900">
                      #{order.orderNumber}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">{formatDate(order.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        statusColors[order.status] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-base font-black text-slate-900">
                      {formatCurrency(order.pricing?.total)}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 text-xs">
                      <img
                        src={item.image}
                        alt=""
                        className="w-10 h-10 object-contain rounded-lg bg-white p-1"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                        <p className="text-slate-500 text-[11px]">
                          Qty: {item.quantity} · {formatCurrency(item.price)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom link */}
                <div className="pt-2 flex justify-end">
                  <Link
                    to={`/order-confirmation/${order.orderNumber || order._id}`}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    View Order Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
