import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingDown, TrendingUp, Bell, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export default function PriceHistoryChart({ product, history = [] }) {
  const { user } = useAuth();
  const { setPriceWatch } = useWishlist();
  const [targetPrice, setTargetPrice] = useState(
    product ? Math.round(product.price * 0.9) : 0
  );
  const [alertSubmitted, setAlertSubmitted] = useState(false);

  if (!history || history.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center text-slate-500">
        <DollarSign className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        <p className="text-sm font-medium">Price History Observations</p>
        <p className="text-xs text-slate-400 mt-1">
          Tracking begins when price observations become available.
        </p>
      </div>
    );
  }

  // Format history for Recharts
  const chartData = history.map((item) => ({
    date: formatDate(item.recordedAt),
    rawDate: item.recordedAt,
    price: item.price,
  }));

  const prices = history.map((h) => h.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = product?.price || prices[prices.length - 1];
  const dateFrom = formatDate(history[0].recordedAt);
  const dateTo = formatDate(history[history.length - 1].recordedAt);

  const handlePriceWatchSubmit = async (e) => {
    e.preventDefault();
    if (!targetPrice || targetPrice <= 0) return;
    const ok = await setPriceWatch(product._id, Number(targetPrice));
    if (ok) {
      setAlertSubmitted(true);
      setTimeout(() => setAlertSubmitted(false), 3000);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-sky-600" />
            Price History & Analytics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Audited period: {dateFrom} — {dateTo}
          </p>
        </div>

        {/* Quick Min / Max Badges */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <TrendingDown className="w-3.5 h-3.5" />
              Historical Low
            </div>
            <div className="text-sm font-bold text-emerald-800">
              {formatCurrency(minPrice)}
            </div>
          </div>

          <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-700">
              <TrendingUp className="w-3.5 h-3.5" />
              Historical High
            </div>
            <div className="text-sm font-bold text-rose-800">
              {formatCurrency(maxPrice)}
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Line Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              tickFormatter={(v) => formatCurrency(v)}
            />
            <Tooltip
              formatter={(value) => [`${formatCurrency(value)}`, 'Catalog Price']}
              labelStyle={{ fontWeight: 600, color: '#0f172a' }}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#0284c7"
              strokeWidth={3}
              dot={{ r: 4, fill: '#0284c7', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#0ea5e9' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Price Watch Feature */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-md">
          <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-sky-600" />
            Set a Price Drop Watch
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Receive automated notifications when this product drops below your desired target price.
          </p>
        </div>

        <form onSubmit={handlePriceWatchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              ₹
            </span>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              min={1}
              max={currentPrice}
              className="w-28 pl-7 pr-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
              placeholder="Target $"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            {alertSubmitted ? 'Watch Active! ✓' : 'Watch Price'}
          </button>
        </form>
      </div>
    </div>
  );
}
