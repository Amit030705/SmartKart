import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ArrowLeftRight, Bell, Sparkles } from 'lucide-react';
import { formatCurrency, formatCategoryName } from '../utils/formatters';
import StarRating from '../components/common/StarRating';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const { addToCompare, isInCompare } = useCompare();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Heart className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Sign In for Your Wishlist</h2>
        <p className="text-xs text-slate-500">Sign in to save items, track price alerts, and sync across devices.</p>
        <Link to="/login" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold inline-block">
          Log In
        </Link>
      </div>
    );
  }

  const products = wishlist?.products || [];
  const priceWatch = wishlist?.priceWatch || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          Saved Wishlist & Price Watches
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {products.length} {products.length === 1 ? 'item' : 'items'} saved with price drop monitors
        </p>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Save electronics you're interested in to monitor price movements and purchase whenever ready.
          </p>
          <Link
            to="/catalog"
            className="px-5 py-2.5 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-colors inline-block"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => {
            if (!p) return null;
            const watch = priceWatch.find((pw) => pw.product?._id === p._id || pw.product === p._id);

            return (
              <div
                key={p._id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-bold text-sky-600 uppercase">{p.brand}</span>
                    <button
                      onClick={() => removeFromWishlist(p._id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link to={`/product/${p.slug || p._id}`} className="block aspect-video bg-slate-50 rounded-2xl p-3 mb-3">
                    <img src={p.images?.[0]} alt="" className="w-full h-full object-contain" />
                  </Link>

                  <Link
                    to={`/product/${p.slug || p._id}`}
                    className="font-bold text-sm text-slate-800 hover:text-sky-600 line-clamp-1 block"
                  >
                    {p.name}
                  </Link>

                  <div className="mt-1">
                    <StarRating rating={p.rating} reviewCount={p.reviewCount} size="xs" />
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-lg font-black text-slate-900">{formatCurrency(p.price)}</span>
                    {p.mrp && p.priceVerifiedAt && p.mrp > p.observedPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatCurrency(p.mrp)}
                      </span>
                    )}
                  </div>

                  {/* Active Price Alert Badge */}
                  {watch && (
                    <div className="mt-3 p-2 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-between text-[11px] text-sky-800 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-sky-600" />
                        Alert target:
                      </span>
                      <span className="font-bold">{formatCurrency(watch.targetPrice)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(p, 1);
                      removeFromWishlist(p._id);
                    }}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Move to Cart
                  </button>

                  <button
                    type="button"
                    onClick={() => addToCompare(p)}
                    className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-slate-50"
                    title="Compare"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
