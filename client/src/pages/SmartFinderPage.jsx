import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShoppingCart,
  Heart,
  ArrowLeftRight,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Monitor,
  Tablet,
  Sliders,
  DollarSign,
  Cpu,
  Layers,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatCategoryName } from '../utils/formatters';
import StarRating from '../components/common/StarRating';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { CATEGORIES, USE_CASES } from '../utils/constants';

const categoryIcons = {
  smartphones: Smartphone,
  laptops: Laptop,
  headphones: Headphones,
  smartwatches: Watch,
  monitors: Monitor,
  tablets: Tablet,
};

const BRAND_OPTIONS = {
  smartphones: ['Any', 'Apple', 'Samsung', 'Google', 'OnePlus'],
  laptops: ['Any', 'Apple', 'Dell', 'Lenovo', 'ASUS'],
  headphones: ['Any', 'Sony', 'Bose', 'Apple'],
  smartwatches: ['Any', 'Apple', 'Samsung', 'Garmin'],
  monitors: ['Any', 'LG', 'Dell', 'Samsung', 'ASUS'],
  tablets: ['Any', 'Apple', 'Samsung', 'Microsoft'],
};

const MAX_BUDGET = 500000;
const BUDGET_STEP = 5000;

export default function SmartFinderPage() {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  const [currentStep, setCurrentStep] = useState(1);

  // Form state across 6 questionnaire steps
  const [formData, setFormData] = useState({
    category: 'laptops',
    budgetMin: 5000,
    budgetMax: 200000,
    useCase: 'Programming & Development',
    brands: ['Any'],
    specs: {
      minRam: 16,
      minStorage: 512,
      minRefreshRate: 60,
      minBatteryLife: 8,
      required5G: false,
      requiredAnc: false,
    },
    priorities: {
      performance: 4,
      battery: 4,
      camera: 2,
      display: 4,
      portability: 3,
      storage: 4,
      price: 3,
      reliability: 4,
    },
  });

  // Results State (Step 7)
  const [results, setResults] = useState(null);
  const [relaxationAdvice, setRelaxationAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePriorityChange = (key, val) => {
    setFormData({
      ...formData,
      priorities: {
        ...formData.priorities,
        [key]: parseInt(val, 10),
      },
    });
  };

  const handleBrandToggle = (brand) => {
    let nextBrands;
    if (brand === 'Any') {
      nextBrands = ['Any'];
    } else {
      const filtered = formData.brands.filter((b) => b !== 'Any');
      if (filtered.includes(brand)) {
        nextBrands = filtered.filter((b) => b !== brand);
        if (nextBrands.length === 0) nextBrands = ['Any'];
      } else {
        nextBrands = [...filtered, brand];
      }
    }
    setFormData({ ...formData, brands: nextBrands });
  };

  const executeRecommendation = async () => {
    try {
      setLoading(true);
      setError(null);
      const cleanBrands = formData.brands.includes('Any') ? [] : formData.brands;

      const payload = {
        category: formData.category,
        budgetMin: Number(formData.budgetMin),
        budgetMax: Number(formData.budgetMax),
        useCase: formData.useCase,
        brands: cleanBrands,
        specs: formData.specs,
        priorities: formData.priorities,
      };

      const { data } = await api.post('/recommendations', payload);
      if (data.success) {
        setResults(data.rankedProducts || []);
        setRelaxationAdvice(data.relaxationAdvice);
        setCurrentStep(7);
      }
    } catch (err) {
      setError(err.message || 'Failed to calculate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setCurrentStep(1);
    setResults(null);
    setRelaxationAdvice(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Questionnaire Wizard Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          SmartFinder 2.0 Algorithmic Wizard
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Find Your Perfect Electronics Match
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          6 simple questions guide our transparent recommendation formula to score and explain every eligible device.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between max-w-3xl mx-auto pb-4 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6, 7].map((step) => {
          const stepNames = ['Category', 'Budget', 'Use Case', 'Brands', 'Specs', 'Priorities', 'Matches'];
          const active = currentStep === step;
          const completed = currentStep > step;

          return (
            <div key={step} className="flex flex-col items-center gap-1 min-w-[70px]">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  active
                    ? 'bg-sky-600 text-white shadow-md ring-4 ring-sky-100'
                    : completed
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {completed ? <CheckCircle2 className="w-4 h-4" /> : step}
              </div>
              <span className={`text-[11px] font-semibold ${active ? 'text-sky-700' : 'text-slate-400'}`}>
                {stepNames[step - 1]}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* WIZARD CONTAINER */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm min-h-[420px] flex flex-col justify-between">
        {/* STEP 1: CATEGORY */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 1: Select Product Category</h2>
              <p className="text-xs text-slate-500 mt-1">Which electronics category are you shopping for today?</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {CATEGORIES.map((cat) => {
                const Icon = categoryIcons[cat.id] || Smartphone;
                const isSelected = formData.category === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`p-5 rounded-2xl border text-left transition-all flex flex-col items-start justify-between space-y-3 ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl ${
                        isSelected ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{cat.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{cat.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: BUDGET */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 2: Enter Your Budget Boundaries</h2>
              <p className="text-xs text-slate-500 mt-1">Specify your comfortable price floor and ceiling.</p>
            </div>

            <div className="max-w-md mx-auto space-y-6 pt-4">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Minimum Budget</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {formatCurrency(formData.budgetMin)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={MAX_BUDGET}
                  step={BUDGET_STEP}
                  value={formData.budgetMin}
                  onChange={(e) => {
                    const budgetMin = Number(e.target.value);
                    setFormData({ ...formData, budgetMin, budgetMax: Math.max(formData.budgetMax, budgetMin) });
                  }}
                  className="w-full accent-sky-600 cursor-pointer"
                />

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-600">Maximum Ceiling</span>
                  <span className="text-base font-extrabold text-sky-600">
                    {formatCurrency(formData.budgetMax)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={MAX_BUDGET}
                  step={BUDGET_STEP}
                  value={formData.budgetMax}
                  onChange={(e) => {
                    const budgetMax = Number(e.target.value);
                    setFormData({ ...formData, budgetMax, budgetMin: Math.min(formData.budgetMin, budgetMax) });
                  }}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 px-2">
                <span>Budget Span: {formatCurrency(formData.budgetMax - formData.budgetMin)}</span>
                <span>Prices use the SmartCart INR catalog</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: USE CASE */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 3: What is Your Primary Use Case?</h2>
              <p className="text-xs text-slate-500 mt-1">
                This configures the base weighting matrix for processor, GPU, memory, and battery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {USE_CASES.map((uc) => {
                const isSelected = formData.useCase === uc.id;
                return (
                  <button
                    key={uc.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, useCase: uc.id })}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{uc.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{uc.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: BRANDS */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 4: Select Preferred Brands</h2>
              <p className="text-xs text-slate-500 mt-1">
                Choose any specific manufacturers, or select "Any" for best overall value.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 max-w-lg mx-auto justify-center py-6">
              {(BRAND_OPTIONS[formData.category] || ['Any', 'Apple', 'Dell', 'Sony']).map((brand) => {
                const isSelected = formData.brands.includes(brand);
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => handleBrandToggle(brand)}
                    className={`px-5 py-3 rounded-2xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: HARD SPECIFICATIONS */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 5: Minimum Hardware Requirements</h2>
              <p className="text-xs text-slate-500 mt-1">
                These act as hard constraints. Devices that do not meet these specs will be filtered out.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Minimum RAM Memory</label>
                <select
                  value={formData.specs.minRam || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specs: { ...formData.specs, minRam: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                >
                  <option value={0}>No Minimum RAM</option>
                  <option value={8}>8 GB</option>
                  <option value={16}>16 GB</option>
                  <option value={32}>32 GB</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Minimum Storage (SSD)</label>
                <select
                  value={formData.specs.minStorage || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specs: { ...formData.specs, minStorage: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                >
                  <option value={0}>No Minimum Storage</option>
                  <option value={256}>256 GB</option>
                  <option value={512}>512 GB</option>
                  <option value={1024}>1 TB</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Minimum Refresh Rate</label>
                <select
                  value={formData.specs.minRefreshRate || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specs: { ...formData.specs, minRefreshRate: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                >
                  <option value={0}>Standard (60Hz+)</option>
                  <option value={90}>90Hz</option>
                  <option value={120}>120Hz (ProMotion / Smooth)</option>
                  <option value={240}>240Hz (Esports Grade)</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-center space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.specs.required5G || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specs: { ...formData.specs, required5G: e.target.checked },
                      })
                    }
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  Require 5G Cellular Connectivity
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.specs.requiredAnc || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specs: { ...formData.specs, requiredAnc: e.target.checked },
                      })
                    }
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  Require Active Noise Cancellation (ANC)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: SLIDER PRIORITIES */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 6: Fine-Tune Your Priority Sliders</h2>
              <p className="text-xs text-slate-500 mt-1">
                Rate the relative importance of each dimension from 1 (Low) to 5 (Crucial).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto pt-2">
              {[
                { key: 'performance', label: 'Processing & Graphic Power' },
                { key: 'battery', label: 'All-Day Battery Endurance' },
                { key: 'display', label: 'Display & Refresh Clarity' },
                { key: 'portability', label: 'Lightweight Portability' },
                { key: 'storage', label: 'Storage Capacity' },
                { key: 'price', label: 'Budget & Cost Efficiency' },
                { key: 'reliability', label: 'Verified Rating & Durability' },
                { key: 'camera', label: 'Camera Quality (if phone)' },
              ].map((p) => (
                <div key={p.key} className="space-y-1.5 p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">{p.label}</span>
                    <span className="text-sky-600 font-extrabold">{formData.priorities[p.key]}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={formData.priorities[p.key]}
                    onChange={(e) => handlePriorityChange(p.key, e.target.value)}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: RANKED RESULTS */}
        {currentStep === 7 && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-600" />
                  Your Personalized Recommendations
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ranked by our multi-criteria algorithm based on {formData.useCase} and your priority weights.
                </p>
              </div>

              <button
                type="button"
                onClick={restart}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retake Questionnaire
              </button>
            </div>

            {/* Empty results with helpful suggestions */}
            {(!results || results.length === 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-4">
                <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
                <h3 className="text-lg font-bold text-amber-900">
                  {relaxationAdvice?.message || 'No products matched all strict constraints'}
                </h3>
                {relaxationAdvice?.suggestions && (
                  <div className="max-w-md mx-auto text-left bg-white/80 p-4 rounded-xl text-xs space-y-1.5 text-amber-800">
                    <p className="font-bold">Suggested Adjustments:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {relaxationAdvice.suggestions.map((sug, i) => (
                        <li key={i}>{sug}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-sky-600"
                >
                  Adjust Budget or Requirements
                </button>
              </div>
            )}

            {/* Results Grid with Explainability */}
            {results && results.length > 0 && (
              <div className="space-y-6">
                {results.map((item, index) => {
                  const p = item.product;
                  const inWishlist = isInWishlist(p._id);
                  const inCompare = isInCompare(p._id);

                  return (
                    <div
                      key={p._id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-lg transition-all space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        {/* Image & Match Rank */}
                        <div className="md:col-span-3 flex flex-col items-center">
                          <div className="relative w-full aspect-square max-w-[160px] bg-slate-50 rounded-2xl p-3 flex items-center justify-center overflow-hidden">
                            <img
                              src={p.images?.[0]}
                              alt={p.name}
                              className="w-full h-full object-contain"
                            />
                            <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-black flex items-center justify-center shadow">
                              #{index + 1}
                            </span>
                          </div>
                        </div>

                        {/* Product Info & Specs */}
                        <div className="md:col-span-5 space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-sky-600 uppercase">{p.brand}</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-500">{formatCategoryName(p.category)}</span>
                          </div>

                          <Link
                            to={`/product/${p.slug || p._id}`}
                            className="block font-bold text-base text-slate-900 hover:text-sky-600 transition-colors"
                          >
                            {p.name}
                          </Link>

                          <StarRating rating={p.rating} reviewCount={p.reviewCount} size="xs" />

                          {/* Quick specs pills */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {p.specs?.processor && (
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                                {p.specs.processor}
                              </span>
                            )}
                            {p.specs?.ram && (
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                                {p.specs.ram}GB RAM
                              </span>
                            )}
                            {p.specs?.storage && (
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                                {p.specs.storage >= 1024 ? `${p.specs.storage/1024}TB` : `${p.specs.storage}GB`}
                              </span>
                            )}
                            {p.specs?.batteryLife && (
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                                {p.specs.batteryLife}h Battery
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Match Score Gauge & Purchase Call */}
                        <div className="md:col-span-4 flex flex-col items-end justify-between space-y-4">
                          <div className="text-right">
                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-sky-500 to-teal-500 text-white font-extrabold text-sm rounded-full shadow-sm">
                              <Sparkles className="w-3.5 h-3.5" />
                              {item.matchScore}% Match
                            </div>
                            <p className="text-xl font-extrabold text-slate-900 mt-2">
                              {formatCurrency(p.price)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 w-full justify-end">
                            <button
                              type="button"
                              onClick={() => inWishlist ? removeFromWishlist(p._id) : addToWishlist(p._id)}
                              className={`p-2 rounded-xl border transition-all ${
                                inWishlist ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                              title="Wishlist"
                            >
                              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500' : ''}`} />
                            </button>

                            <button
                              type="button"
                              onClick={() => inCompare ? removeFromCompare(p._id) : addToCompare(p)}
                              className={`p-2 rounded-xl border transition-all ${
                                inCompare ? 'bg-sky-50 border-sky-200 text-sky-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                              title="Compare"
                            >
                              <ArrowLeftRight className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              disabled={p.stock === 0}
                              onClick={() => addToCart(p, 1)}
                              className="px-4 py-2 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Explainability Section: Reasons, Pros & Cons */}
                      <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100 text-xs">
                        {item.reasons?.length > 0 && (
                          <div className="space-y-1">
                            <span className="font-bold text-slate-800">Why this product matches:</span>
                            <ul className="space-y-1">
                              {item.reasons.map((r, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-slate-600">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                  <span>{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                          {item.pros?.length > 0 && (
                            <div className="space-y-1">
                              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" /> Key Advantages:
                              </span>
                              <ul className="space-y-0.5 text-slate-600">
                                {item.pros.map((pro, i) => (
                                  <li key={i}>• {pro}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {item.cons?.length > 0 && (
                            <div className="space-y-1">
                              <span className="font-semibold text-amber-700 flex items-center gap-1">
                                <ThumbsDown className="w-3 h-3" /> Considerations:
                              </span>
                              <ul className="space-y-0.5 text-slate-600">
                                {item.cons.map((con, i) => (
                                  <li key={i}>• {con}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* NAVIGATION CONTROLS */}
        {currentStep < 7 && (
          <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-6">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Step
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={executeRecommendation}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-sky-500/20"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'Evaluating Hardware...' : 'Calculate Top Matches'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
