import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, X, AlertCircle } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';
import { formatCurrency } from '../../utils/formatters';

export default function ComparisonDrawer() {
  const { comparedProducts, removeFromCompare, clearCompare, compareNotice, clearCompareNotice } = useCompare();

  if (comparedProducts.length === 0 && !compareNotice) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pointer-events-none">
      <div className="max-w-5xl mx-auto flex flex-col gap-2 pointer-events-auto">
        {/* Flash Notice message if any */}
        {compareNotice && (
          <div className={`p-3 rounded-xl shadow-lg border flex items-center justify-between text-xs font-medium animate-fadeIn ${
            compareNotice.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : compareNotice.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-sky-50 text-sky-800 border-sky-200'
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{compareNotice.message}</span>
            </div>
            <button onClick={clearCompareNotice} className="hover:opacity-75 p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Floating Tray */}
        {comparedProducts.length > 0 && (
          <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl p-3 sm:p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-sm">Compare Tray</span>
                <span className="text-xs text-slate-400 block">
                  {comparedProducts.length} of 4 products ({comparedProducts[0]?.category})
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {comparedProducts.map((p) => (
                <div
                  key={p._id}
                  className="relative group bg-slate-800/80 rounded-xl p-1.5 border border-slate-700 flex items-center gap-2"
                >
                  <img
                    src={p.images?.[0]}
                    alt={p.name}
                    className="w-10 h-10 object-contain rounded bg-white p-1"
                  />
                  <div className="hidden sm:block max-w-[120px] text-xs">
                    <p className="font-medium text-slate-200 truncate">{p.name}</p>
                    <p className="text-sky-400 font-semibold">{formatCurrency(p.price)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCompare(p._id)}
                    className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearCompare}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2 rounded-lg"
              >
                Clear
              </button>

              <Link
                to="/compare"
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md ${
                  comparedProducts.length >= 2
                    ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/25'
                    : 'bg-slate-700 text-slate-400 pointer-events-none'
                }`}
              >
                {comparedProducts.length >= 2
                  ? `Compare (${comparedProducts.length})`
                  : 'Add 1 more to compare'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
