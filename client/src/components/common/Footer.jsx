import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ShieldCheck, Truck, RotateCcw, Headphones, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800 text-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Algorithmic Matching</h4>
              <p className="text-xs text-slate-400 mt-1">
                Data-backed scoring tailored to your exact budget & technical workflows.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Verified Specifications</h4>
              <p className="text-xs text-slate-400 mt-1">
                Zero fake reviews. Transparent hardware specs validated directly.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Express Free Shipping</h4>
              <p className="text-xs text-slate-400 mt-1">
                Shipping charges are included in the displayed catalog total.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">30-Day Hassle-Free Returns</h4>
              <p className="text-xs text-slate-400 mt-1">
                Try out your electronics in real life with peace of mind.
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white font-bold">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white">
                Smart<span className="text-sky-400">Cart</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-4">
              SmartCart transforms consumer electronics shopping through explainable recommendation algorithms, multi-device comparison matrices, and historical price surveillance.
            </p>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} SmartCart Inc. All rights reserved.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Categories</h5>
            <ul className="space-y-2 text-xs">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/catalog?category=${cat.id}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Smart Features */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Discovery Tools</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/smart-finder" className="text-sky-400 hover:text-sky-300 transition-colors font-medium">
                  Smart Finder Questionnaire
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white transition-colors">
                  Product Comparison Matrix
                </Link>
              </li>
              <li>
                <Link to="/catalog?sort=popular" className="hover:text-white transition-colors">
                  Best Value Electronics
                </Link>
              </li>
              <li>
                <Link to="/catalog?isTrending=true" className="hover:text-white transition-colors">
                  Trending Releases
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Area */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Account & Store</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  Wishlist & Price Watches
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-amber-400 hover:text-amber-300 transition-colors">
                  Administrator Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
