import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Sliders,
  CheckCircle2,
  Cpu,
  BarChart2,
  ShieldCheck,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Monitor,
  Tablet,
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { CATEGORIES } from '../utils/constants';

const categoryIcons = {
  smartphones: Smartphone,
  laptops: Laptop,
  headphones: Headphones,
  smartwatches: Watch,
  monitors: Monitor,
  tablets: Tablet,
};

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/products/featured');
        if (data.success) {
          setFeatured(data.featured || []);
          setTrending(data.trending || []);
        }
      } catch (err) {
        console.error('Failed to load home products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();

    // Load recently viewed products from localStorage
    const savedRecent = localStorage.getItem('smartcart_recently_viewed');
    if (savedRecent) {
      try {
        setRecentlyViewed(JSON.parse(savedRecent));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-slate-50 to-white pt-12 pb-20 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-sky-100/80 text-sky-800 border border-sky-200">
                <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                Algorithmic Consumer Electronics Matchmaking
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                Discover Electronics Built for Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-teal-500 to-sky-700">
                  Exact Priorities
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Stop guessing through endless spec sheets. Our transparent, multi-criteria recommendation engine scores real hardware against your specific workflows, budget constraints, and battery expectations.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/smart-finder"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  Find My Perfect Product
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/catalog"
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm sm:text-base border border-slate-200 shadow-sm transition-all"
                >
                  Browse Full Catalog
                </Link>
              </div>

              {/* Stat highlights */}
              <div className="pt-6 grid grid-cols-3 gap-6 border-t border-slate-200/80 max-w-md">
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">100%</p>
                  <p className="text-xs text-slate-500">Explainable Scores</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">0 Fake</p>
                  <p className="text-xs text-slate-500">Reviews & Ratings</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">4-Way</p>
                  <p className="text-xs text-slate-500">Side-by-Side Compare</p>
                </div>
              </div>
            </div>

            {/* Right Column Visual Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800">Smart Finder Live Result</span>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                    98% Match
                  </span>
                </div>

                <div className="flex gap-4 items-center">
                  <img
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80"
                    alt="MacBook Pro"
                    className="w-20 h-20 object-contain rounded-xl bg-slate-50 p-2"
                  />
                  <div>
                    <p className="text-xs font-bold text-sky-600">Laptops · Apple</p>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">MacBook Pro 16 M3 Max</h3>
                    <p className="text-xs text-slate-500 mt-1">36GB RAM · 1TB SSD · 22h Battery</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <p className="font-semibold text-slate-700">Why this product won your criteria:</p>
                  <div className="flex items-start gap-1.5 text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>Extreme 36GB unified memory for heavy development</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>22-hour battery life matches your mobility priority</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs text-slate-400">Audited Price</span>
                    <p className="text-lg font-black text-slate-900">$3,499</p>
                  </div>
                  <Link
                    to="/smart-finder"
                    className="px-4 py-2 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Try Smart Finder
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Explore By Category</h2>
            <p className="text-sm text-slate-500 mt-1">
              Engineered hardware categorized with standardized specification benchmarks
            </p>
          </div>
          <Link
            to="/catalog"
            className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = categoryIcons[cat.id] || Smartphone;
            return (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.id}`}
                className="group bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-sky-300 hover:shadow-lg transition-all text-center flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-sky-50 text-slate-700 group-hover:text-sky-600 flex items-center justify-center transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 group-hover:text-sky-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {cat.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Trending Electronics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Trending Right Now</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Popular devices seeing the highest interest and verified purchases this week
              </p>
            </div>
          </div>
          <Link
            to="/catalog?sort=popular"
            className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            View More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trending.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. How Product Matching Works Infographic */}
      <section className="bg-slate-900 text-white py-16 my-12 rounded-3xl mx-4 sm:mx-6 lg:mx-8 px-6 lg:px-12 border border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Algorithmic Transparency
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            How SmartCart Product Matching Really Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Unlike arbitrary scoreboards, our recommendation algorithm mathematically evaluates eligible hardware across 5 transparent phases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-base">
              1
            </div>
            <h3 className="text-base font-bold text-white">Hard Constraints Filter</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Eliminates products violating strict budgets or mandatory spec baselines (e.g., minimum RAM, 5G, or active noise cancellation).
            </p>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-base">
              2
            </div>
            <h3 className="text-base font-bold text-white">Spec Normalization & Weights</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standardizes attributes (0.0 to 1.0) and weights them by your specific use case (Gaming, Programming, Battery life) and slider priorities.
            </p>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-base">
              3
            </div>
            <h3 className="text-base font-bold text-white">Explainable Match Score (0–100)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Computes a composite score factoring hardware quality, budget efficiency, customer ratings, and generates tailored pros & cons.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/smart-finder"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Launch Questionnaire & Test Algorithm
          </Link>
        </div>
      </section>

      {/* 5. Featured / Best Value Recommendations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-200">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Electronics</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Top engineered devices with outstanding specifications and user satisfaction
              </p>
            </div>
          </div>
          <Link
            to="/catalog"
            className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Recently Viewed Products (if present) */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recently Viewed</h2>
            <p className="text-xs text-slate-500 mt-0.5">Products you checked out during this session</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentlyViewed.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
