import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ShoppingCart, AlertCircle, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const redirectPath = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoUser = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-md shadow-sky-500/20">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign In to SmartCart
        </h1>
        <p className="text-xs text-slate-500">
          Access your personalized recommendations, orders, and saved wishlist
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Demo Logins Box */}
      <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 space-y-2.5 text-xs">
        <span className="font-bold text-sky-900 block">Quick Demo Credentials (1-Click Fill):</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillDemoUser('alex@example.com', 'UserPassword123!')}
            className="p-2 rounded-xl bg-white border border-sky-200 text-sky-800 hover:bg-sky-100 text-left transition-colors flex items-center gap-1.5 font-medium"
          >
            <User className="w-3.5 h-3.5 text-sky-600" />
            Shopper Demo
          </button>
          <button
            type="button"
            onClick={() => fillDemoUser('admin@smartcart.com', 'AdminPassword123!')}
            className="p-2 rounded-xl bg-white border border-sky-200 text-sky-800 hover:bg-sky-100 text-left transition-colors flex items-center gap-1.5 font-medium"
          >
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            Admin Demo
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
        >
          {submitting ? 'Authenticating...' : 'Sign In'}
        </button>

        <p className="text-center text-xs text-slate-500 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-sky-600 hover:text-sky-700">
            Create an Account
          </Link>
        </p>
      </form>
    </div>
  );
}
