import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/orders/${id}`);
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center animate-pulse space-y-4">
        <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto" />
        <div className="h-6 bg-slate-200 rounded-xl w-1/2 mx-auto" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Order Information Unavailable</h2>
        <p className="text-xs text-slate-500">{error || 'Could not locate requested order.'}</p>
        <Link to="/catalog" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top Success Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
          Thank You! Your Order is Confirmed
        </h1>
        <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
          We've sent a detailed confirmation invoice to your email address. Your order is being prepared for shipment.
        </p>
        <div className="pt-2">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white text-emerald-900 font-mono font-bold text-xs shadow-sm border border-emerald-200">
            Order #{order.orderNumber}
          </span>
        </div>
      </div>

      {/* Order Tracking Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Truck className="w-4 h-4 text-sky-600" />
          Fulfillment Status & Timeline
        </h2>

        <div className="flex items-center justify-between max-w-xl mx-auto text-center relative py-2">
          {['pending', 'processing', 'shipped', 'delivered'].map((stepStatus, idx) => {
            const statuses = ['pending', 'processing', 'shipped', 'delivered'];
            const currentIdx = statuses.indexOf(order.status);
            const isCompleted = idx <= currentIdx;

            return (
              <div key={stepStatus} className="flex flex-col items-center gap-2 z-10 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCompleted
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  {stepStatus}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Purchased Items Snapshots */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Package className="w-4 h-4 text-sky-600" />
          Ordered Electronics Snapshot ({order.items.length} items)
        </h2>

        <div className="divide-y divide-slate-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt=""
                  className="w-12 h-12 object-contain rounded-xl bg-slate-50 p-1 border border-slate-100"
                />
                <div>
                  <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{item.specsSummary}</p>
                  <span className="text-slate-500">Qty: {item.quantity}</span>
                </div>
              </div>
              <span className="font-extrabold text-slate-900 text-sm">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600 max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-bold text-slate-800">{formatCurrency(order.pricing.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="font-bold text-slate-800">
              {order.pricing.shippingCost === 0 ? 'FREE' : formatCurrency(order.pricing.shippingCost)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Sales Tax</span>
            <span className="font-bold text-slate-800">{formatCurrency(order.pricing.tax)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-black text-slate-900">
            <span>Total Paid</span>
            <span>{formatCurrency(order.pricing.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-bold text-slate-700 block mb-1">Shipping Destination:</span>
          <p className="text-slate-600">{order.shippingAddress.street}</p>
          <p className="text-slate-600">
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          </p>
          <p className="text-slate-500 mt-1">Phone: {order.shippingAddress.phone}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="px-5 py-2.5 bg-slate-900 hover:bg-sky-600 text-white rounded-xl font-bold transition-colors"
          >
            View All Orders
          </Link>
          <Link
            to="/catalog"
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
