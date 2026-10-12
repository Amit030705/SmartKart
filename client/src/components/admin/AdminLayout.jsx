import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-8 bg-slate-200 rounded-xl w-48 mx-auto" />
      </div>
    );
  }

  // Enforce role-based authorization: only admin allowed
  if (!isAdmin) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  const navItems = [
    { path: '/admin', label: 'KPI Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Product Inventory', icon: Package },
    { path: '/admin/orders', label: 'Order Processing', icon: ShoppingCart },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-200">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              SmartCart Management Console
            </h1>
            <p className="text-xs text-slate-500">
              Logged in as <span className="font-semibold text-slate-800">{user?.email}</span> (Role: Administrator)
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="text-xs font-bold text-slate-600 hover:text-sky-600 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Storefront
        </Link>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Main Content */}
      <div>{children}</div>
    </div>
  );
}
