import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  Sparkles,
  Award,
  DollarSign,
  Star,
  Check,
  X,
  ShoppingCart,
  Trash2,
  Info,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatCategoryName } from '../utils/formatters';
import StarRating from '../components/common/StarRating';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';

export default function ComparePage() {
  const { comparedProducts, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComparisonAnalysis = async () => {
      if (comparedProducts.length < 2) {
        setAnalysis(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const { data } = await api.post('/compare', {
          productIds: comparedProducts.map((p) => p._id),
        });

        if (data.success) {
          setAnalysis(data);
        }
      } catch (err) {
        setError(err.message || 'Failed to compare selected devices');
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonAnalysis();
  }, [comparedProducts]);

  if (comparedProducts.length < 2) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
          <ArrowLeftRight className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Side-by-Side Product Comparison</h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2">
            You need at least 2 products from the same category to generate a comparative analysis. Add products to compare from the catalog or product pages.
          </p>
        </div>

        {comparedProducts.length === 1 && (
          <div className="p-4 bg-white rounded-2xl border border-slate-200 max-w-sm mx-auto flex items-center gap-3 text-left">
            <img
              src={comparedProducts[0].images?.[0]}
              alt=""
              className="w-12 h-12 object-contain rounded bg-slate-50 p-1"
            />
            <div className="flex-1 truncate">
              <p className="text-xs font-bold text-slate-900 truncate">{comparedProducts[0].name}</p>
              <p className="text-[11px] text-sky-600 font-semibold">{formatCurrency(comparedProducts[0].price)}</p>
            </div>
            <button onClick={() => removeFromCompare(comparedProducts[0]._id)}>
              <X className="w-4 h-4 text-slate-400 hover:text-rose-500" />
            </button>
          </div>
        )}

        <div className="pt-2">
          <Link
            to="/catalog"
            className="px-6 py-3 bg-slate-900 hover:bg-sky-600 text-white rounded-2xl text-xs font-bold transition-colors shadow-sm"
          >
            Browse Catalog to Add Products
          </Link>
        </div>
      </div>
    );
  }

  const highlights = analysis?.highlights || {};
  const summary = analysis?.summary || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-sky-600" />
            Device Comparison Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Analyzing {comparedProducts.length} devices in the {formatCategoryName(comparedProducts[0]?.category)} category
          </p>
        </div>

        <button
          onClick={clearCompare}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Comparison
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Difference Analysis Summary Callout */}
      {summary.length > 0 && (
        <div className="bg-sky-50/70 border border-sky-200 rounded-3xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-sky-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-600" />
            Algorithmic Comparison Summary
          </h3>
          <ul className="space-y-1.5 text-xs text-sky-800">
            {summary.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mobile-Friendly Horizontally Scrollable Comparison Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[700px]">
            {/* Table Header: Product Cards */}
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60">
                <th className="p-4 w-44 font-bold text-xs text-slate-400 uppercase tracking-wider">
                  Product Overview
                </th>
                {comparedProducts.map((p) => {
                  const isLowestPrice = highlights.lowestPriceId === p._id;
                  const isLowestVerifiedPrice = highlights.lowestVerifiedPriceId === p._id;
                  const isHighestRated = highlights.highestRatedId === p._id;
                  const isBestValue = highlights.bestValueId === p._id;

                  return (
                    <th key={p._id} className="p-4 align-top w-64 border-l border-slate-200/80">
                      <div className="space-y-3">
                        {/* Highlights Badges */}
                        <div className="flex flex-col gap-1 min-h-[50px]">
                          {isBestValue && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-teal-500 text-white shadow-sm w-fit">
                              <Sparkles className="w-3 h-3" />
                              Best Value Choice
                            </span>
                          )}
                          {isLowestPrice && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 w-fit">
                              <DollarSign className="w-3 h-3" />
                              Lowest Catalog Price
                            </span>
                          )}
                          {isLowestVerifiedPrice && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 w-fit">
                              Verified Lowest Retailer Offer
                            </span>
                          )}
                          {isHighestRated && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 w-fit">
                              <Star className="w-3 h-3" />
                              Highest Rated
                            </span>
                          )}
                        </div>

                        {/* Image & Title */}
                        <div className="relative aspect-square max-h-36 bg-white rounded-xl p-2 border border-slate-200/60 flex items-center justify-center">
                          <img src={p.images?.[0]} alt="" className="max-h-full object-contain" />
                          <button
                            onClick={() => removeFromCompare(p._id)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <Link
                          to={`/product/${p.slug || p._id}`}
                          className="font-bold text-xs text-slate-900 hover:text-sky-600 line-clamp-2 block"
                        >
                          {p.name}
                        </Link>

                        <div className="pt-1">
                          <p className="text-lg font-black text-slate-900">{formatCurrency(p.price)}</p>
                          <span className="block text-[10px] text-slate-500">Catalog price</span>
                          {p.observedPrice && p.priceVerifiedAt && p.priceUrl && (
                            <a href={p.priceUrl} target="_blank" rel="noreferrer" className="block text-[10px] text-sky-700 underline">
                              {formatCurrency(p.observedPrice)} at {p.priceSource}, checked {new Date(p.priceVerifiedAt).toLocaleDateString('en-IN')}
                            </a>
                          )}
                          {p.mrp && p.priceVerifiedAt && p.mrp > p.observedPrice && (
                            <p className="text-[11px] text-slate-400 line-through">
                              {formatCurrency(p.mrp)}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => addToCart(p, 1)}
                          className="w-full py-2 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Add to Cart
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Spec Comparison Rows */}
            <tbody className="divide-y divide-slate-100 text-xs">
              {/* Rating */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50/30">Customer Rating</td>
                {comparedProducts.map((p) => (
                  <td key={p._id} className="p-4 border-l border-slate-100">
                    <StarRating rating={p.rating} reviewCount={p.reviewCount} size="xs" />
                  </td>
                ))}
              </tr>

              {/* Brand */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50/30">Brand</td>
                {comparedProducts.map((p) => (
                  <td key={p._id} className="p-4 border-l border-slate-100 font-semibold text-slate-800">
                    {p.brand}
                  </td>
                ))}
              </tr>

              {/* Processor */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50/30">Processor / Chipset</td>
                {comparedProducts.map((p) => (
                  <td key={p._id} className="p-4 border-l border-slate-100 text-slate-700">
                    {p.specs?.processor || 'Standard Architecture'}
                  </td>
                ))}
              </tr>

              {/* RAM */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50/30">RAM Memory</td>
                {comparedProducts.map((p) => (
                  <td key={p._id} className="p-4 border-l border-slate-100 font-bold text-slate-800">
                    {p.specs?.ram ? `${p.specs.ram} GB` : '—'}
                  </td>
                ))}
              </tr>

              {/* Storage */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50/30">Storage Capacity</td>
                {comparedProducts.map((p) => (
                  <td key={p._id} className="p-4 border-l border-slate-100 font-bold text-slate-800">
                    {p.specs?.storage
                      ? `${p.specs.storage >= 1024 ? `${p.specs.storage / 1024} TB` : `${p.specs.storage} GB`} ${p.specs.storageType || ''}`
                      : '—'}
                  </td>
                ))}
              </tr>

              {/* Display & Refresh */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50/30">Display & Refresh</td>
                {comparedProducts.map((p) => (
                  <td key={p._id} className="p-4 border-l border-slate-100 text-slate-700">
                    {p.specs?.displaySize ? `${p.specs.displaySize}" ` : ''}
                    {p.specs?.displayType || ''}
                    {p.specs?.refreshRate ? ` (${p.specs.refreshRate}Hz)` : ''}
                  </td>
                ))}
              </tr>

              {/* Battery */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50/30">Battery Endurance</td>
                {comparedProducts.map((p) => (
                  <td key={p._id} className="p-4 border-l border-slate-100 text-slate-700 font-medium">
                    {p.specs?.batteryLife
                      ? `${p.specs.batteryLife} Hours`
                      : p.specs?.battery
                      ? `${p.specs.battery} mAh`
                      : '—'}
                  </td>
                ))}
              </tr>

              {/* Operating System */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50/30">Operating System</td>
                {comparedProducts.map((p) => (
                  <td key={p._id} className="p-4 border-l border-slate-100 text-slate-700">
                    {p.specs?.os || 'Standard Embedded OS'}
                  </td>
                ))}
              </tr>

              {/* Warranty */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50/30">Warranty Coverage</td>
                {comparedProducts.map((p) => (
                  <td key={p._id} className="p-4 border-l border-slate-100 text-slate-600">
                    {p.warranty || '1 Year Standard Warranty'}
                  </td>
                ))}
              </tr>

              {/* Stock Status */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50/30">Availability</td>
                {comparedProducts.map((p) => (
                  <td key={p._id} className="p-4 border-l border-slate-100">
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> In Stock ({p.stock})
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
