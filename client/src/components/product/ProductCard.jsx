import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeftRight, Check, Sparkles } from 'lucide-react';
import { formatCurrency, formatCategoryName } from '../../utils/formatters';
import StarRating from '../common/StarRating';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';

export default function ProductCard({ product, showMatchBadge = false, matchScore = null }) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  const inWishlist = isInWishlist(product._id);
  const inCompare = isInCompare(product._id);

  // Extract top 2 key specs for quick card preview
  const getQuickSpecs = () => {
    const s = product.specs || {};
    const specs = [];
    if (s.ram) specs.push(`${s.ram}GB RAM`);
    if (s.storage) specs.push(`${s.storage >= 1024 ? `${s.storage/1024}TB` : `${s.storage}GB`}`);
    if (s.refreshRate) specs.push(`${s.refreshRate}Hz`);
    if (s.batteryLife) specs.push(`${s.batteryLife}h Battery`);
    if (s.anc) specs.push('ANC');
    if (s.displaySize) specs.push(`${s.displaySize}"`);
    return specs.slice(0, 3);
  };

  const quickSpecs = getQuickSpecs();

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-sky-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {showMatchBadge && matchScore !== null && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500 text-white shadow-md shadow-sky-500/20">
            <Sparkles className="w-3 h-3" />
            {matchScore}% Match
          </span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Action Buttons Overlay */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            inWishlist ? removeFromWishlist(product._id) : addToWishlist(product._id);
          }}
          className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            inWishlist
              ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
              : 'bg-white/80 text-slate-500 hover:text-rose-500 hover:bg-white'
          }`}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500' : ''}`} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            inCompare ? removeFromCompare(product._id) : addToCompare(product);
          }}
          className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            inCompare
              ? 'bg-sky-500 text-white hover:bg-sky-600'
              : 'bg-white/80 text-slate-500 hover:text-sky-600 hover:bg-white'
          }`}
          title={inCompare ? 'Remove from comparison' : 'Add to comparison'}
        >
          {inCompare ? <Check className="w-4 h-4" /> : <ArrowLeftRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Product Image */}
      <Link
        to={`/product/${product.slug || product._id}`}
        className="relative pt-[75%] overflow-hidden bg-slate-50 block"
      >
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-sky-600 tracking-wider uppercase text-[10px]">
              {product.brand}
            </span>
            <span>{formatCategoryName(product.category)}</span>
          </div>

          <Link
            to={`/product/${product.slug || product._id}`}
            className="block text-sm font-semibold text-slate-800 hover:text-sky-600 line-clamp-2 transition-colors mb-2"
          >
            {product.name}
          </Link>

          <div className="mb-2.5">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} size="xs" />
          </div>

          {/* Spec Badges */}
          {quickSpecs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {quickSpecs.map((spec, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] rounded-md font-medium"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900">
                {formatCurrency(product.price)}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Catalog price</span>
            {product.observedPrice && product.priceVerifiedAt && (
              <a href={product.priceUrl} target="_blank" rel="noreferrer" className="block text-[10px] text-sky-700 underline">
                {formatCurrency(product.observedPrice)} at {product.priceSource} · checked {new Date(product.priceVerifiedAt).toLocaleDateString('en-IN')}
              </a>
            )}
          </div>

          <button
            type="button"
            disabled={product.stock === 0}
            onClick={() => addToCart(product, 1)}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
              product.stock === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-sky-600 shadow-sm active:scale-95'
            }`}
            title={product.stock === 0 ? 'Out of stock' : 'Add to cart'}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
