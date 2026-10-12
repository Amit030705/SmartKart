import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../../services/api';
import { formatCurrency, formatDate, formatCategoryName } from '../../utils/formatters';
import AdminLayout from '../../components/admin/AdminLayout';
import { Link } from 'react-router-dom';

const PIE_COLORS = ['#0ea5e9', '#14b8a6', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch admin dashboard analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <AdminLayout>
      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-28 bg-slate-200 rounded-2xl" />
            ))}
          </div>
          <div className="h-72 bg-slate-200 rounded-3xl" />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200">
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          {/* 1. Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">Recorded Revenue</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">
                {formatCurrency(data?.stats?.totalRevenue)}
              </p>
              <p className="text-[11px] text-slate-400">
                Avg order: {formatCurrency(data?.stats?.averageOrderValue)}
              </p>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">Total Orders</span>
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{data?.stats?.totalOrders}</p>
              <p className="text-[11px] text-slate-400">Recorded transactions</p>
            </div>

            {/* Total Products */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">Catalog Hardware</span>
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{data?.stats?.totalProducts}</p>
              <p className="text-[11px] text-slate-400">Active SKUs</p>
            </div>

            {/* Registered Users */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">Registered Users</span>
                <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{data?.stats?.totalUsers}</p>
              <p className="text-[11px] text-slate-400">Verified shoppers</p>
            </div>
          </div>

          {/* 2. Visual Sales & Category Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sales Chart */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-sky-600" />
                    Revenue & Order Volume Analytics
                  </h3>
                  <p className="text-xs text-slate-400">Recent recorded transactional velocity</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.salesTimeline || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      formatter={(v) => [`₹${v}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="revenue" fill="#0284c7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Category Distribution</h3>
                <p className="text-xs text-slate-400">Proportion of catalog devices</p>
              </div>

              <div className="space-y-2 text-xs">
                {data?.categoryDistribution?.map((cat, idx) => (
                  <div key={cat._id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      <span className="font-semibold text-slate-800">{formatCategoryName(cat._id)}</span>
                    </div>
                    <span className="font-bold text-slate-600">{cat.count} items</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Low-Stock Alert & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Low-Stock Warning List */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Low-Stock Inventory Warnings
                </h3>
                <Link to="/admin/products" className="text-xs font-bold text-sky-600 hover:text-sky-700">
                  Manage Inventory
                </Link>
              </div>

              {data?.lowStockProducts?.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">No low-stock products reported.</p>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {data?.lowStockProducts?.map((p) => (
                    <div key={p._id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 truncate max-w-xs">
                        <img src={p.images?.[0]} alt="" className="w-8 h-8 object-contain rounded bg-slate-50 p-1" />
                        <span className="font-semibold text-slate-800 truncate">{p.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {p.stock} units left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders List */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Recent Customer Orders</h3>
                <Link to="/admin/orders" className="text-xs font-bold text-sky-600 hover:text-sky-700">
                  All Orders
                </Link>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {data?.recentOrders?.map((ord) => (
                  <div key={ord._id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">#{ord.orderNumber}</p>
                      <p className="text-[11px] text-slate-400">
                        {ord.user?.name || 'Customer'} · {formatDate(ord.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 block">
                        {formatCurrency(ord.pricing?.total)}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-sky-600">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
