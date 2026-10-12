import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  ArrowLeftRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Sparkles,
  Star,
  ThumbsUp,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatCategoryName, formatDate } from '../utils/formatters';
import StarRating from '../components/common/StarRating';
import PriceHistoryChart from '../components/product/PriceHistoryChart';
import ProductCard from '../components/product/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage() {
  const { identifier } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Form state
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/products/${identifier}`);
      if (data.success && data.product) {
        setProduct(data.product);
        setPriceHistory(data.priceHistory || []);
        setRelatedProducts(data.relatedProducts || []);

        // Save to recently viewed
        try {
          const recent = JSON.parse(localStorage.getItem('smartcart_recently_viewed') || '[]');
          const filtered = recent.filter(p => p._id !== data.product._id);
          localStorage.setItem(
            'smartcart_recently_viewed',
            JSON.stringify([data.product, ...filtered].slice(0, 8))
          );
        } catch (e) {
          console.error(e);
        }

        // Fetch reviews
        fetchReviews(data.product._id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (productId) => {
    try {
      const { data } = await api.get(`/reviews/products/${productId}/reviews`);
      if (data.success) {
        setReviews(data.reviews || []);
        setReviewCount(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [identifier]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      setReviewError('Please provide a title and comment for your review');
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError(null);
      const { data } = await api.post(`/reviews/products/${product._id}/reviews`, {
        rating: userRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });

      if (data.success) {
        setReviewFormOpen(false);
        setReviewTitle('');
        setReviewComment('');
        fetchReviews(product._id);
        fetchProduct(); // Recalculate average rating
      }
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleVoteHelpful = async (reviewId) => {
    try {
      const { data } = await api.post(`/reviews/${reviewId}/vote`);
      if (data.success) {
        setReviews(reviews.map(r => r._id === reviewId ? { ...r, helpfulVotes: data.helpfulVotes } : r));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="h-96 bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded-xl w-3/4" />
            <div className="h-4 bg-slate-200 rounded-xl w-1/4" />
            <div className="h-24 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">{error || 'The requested product does not exist.'}</p>
        <Link to="/catalog" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id);
  const inCompare = isInCompare(product._id);
  const specs = product.specs || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-sky-600">Home</Link>
        <span>/</span>
        <Link to={`/catalog?category=${product.category}`} className="hover:text-sky-600">
          {formatCategoryName(product.category)}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-center min-h-[380px] max-h-[480px] overflow-hidden">
            <img
              src={product.images?.[selectedImageIndex] || product.images?.[0]}
              alt={product.name}
              className="max-h-96 w-auto object-contain transition-all duration-300"
            />
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl border p-1 bg-white overflow-hidden transition-all ${
                    selectedImageIndex === idx
                      ? 'border-sky-500 ring-2 ring-sky-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-bold text-sky-600 uppercase tracking-wider text-xs">
                {product.brand} · {product.subcategory || formatCategoryName(product.category)}
              </span>
              <span className="text-slate-400">SKU: {product._id.slice(-8).toUpperCase()}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mt-3">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} size="sm" />
              <span className="text-slate-300">|</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Price Header */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">
              {formatCurrency(product.price)}
            </span>
            {product.mrp && product.priceVerifiedAt && product.mrp > product.observedPrice && (
              <>
                <span className="text-sm text-slate-400 line-through">
                  {formatCurrency(product.mrp)}
                </span>
                <span className="px-2 py-0.5 text-xs font-bold bg-rose-100 text-rose-700 rounded-md">
                  Save {formatCurrency(product.mrp - product.observedPrice)}
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-500">Catalog price{product.priceVerifiedAt ? ` · retailer price checked ${new Date(product.priceVerifiedAt).toLocaleDateString('en-IN')}` : ' · retailer price not verified'}</p>
          {product.observedPrice && product.priceSource && product.priceUrl && <a className="text-xs text-sky-700 underline" href={product.priceUrl} target="_blank" rel="noreferrer">Retailer observation: {formatCurrency(product.observedPrice)} at {product.priceSource}</a>}

          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Purchase Controls */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-slate-500 hover:bg-slate-50 text-sm font-bold"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-slate-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 text-slate-500 hover:bg-slate-50 text-sm font-bold"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                disabled={product.stock === 0}
                onClick={() => addToCart(product, quantity)}
                className={`flex-1 py-3 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  product.stock === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-sky-600 text-white shadow-slate-900/10 active:scale-98'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart ({formatCurrency(product.price * quantity)})
              </button>
            </div>

            {/* Quick Actions (Wishlist & Compare) */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => inWishlist ? removeFromWishlist(product._id) : addToWishlist(product._id)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                  inWishlist
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500' : ''}`} />
                {inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
              </button>

              <button
                type="button"
                onClick={() => inCompare ? removeFromCompare(product._id) : addToCompare(product)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                  inCompare
                    ? 'bg-sky-50 border-sky-200 text-sky-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                {inCompare ? 'In Comparison Tray' : 'Compare Device'}
              </button>
            </div>
          </div>

          {/* Guarantees Box */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 text-center text-xs text-slate-600">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <Truck className="w-4 h-4 mx-auto text-sky-600" />
              <p className="font-semibold text-slate-800">Free 2-Day Shipping</p>
              <p className="text-[10px] text-slate-400">On all electronics</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <ShieldCheck className="w-4 h-4 mx-auto text-teal-600" />
              <p className="font-semibold text-slate-800">{product.warranty || '1 Year Warranty'}</p>
              <p className="text-[10px] text-slate-400">Manufacturer backed</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <RotateCcw className="w-4 h-4 mx-auto text-slate-600" />
              <p className="font-semibold text-slate-800">30-Day Returns</p>
              <p className="text-[10px] text-slate-400">Hassle-free guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Specifications Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900">
          Hardware & Technical Specifications
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {specs.processor && (
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Processor</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{specs.processor}</p>
            </div>
          )}
          {specs.ram && (
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">RAM Memory</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{specs.ram} GB</p>
            </div>
          )}
          {specs.storage && (
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Storage</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {specs.storage >= 1024 ? `${specs.storage / 1024} TB` : `${specs.storage} GB`} {specs.storageType || ''}
              </p>
            </div>
          )}
          {specs.displaySize && (
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Display Size</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{specs.displaySize} Inches</p>
            </div>
          )}
          {specs.displayType && (
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Display Panel</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{specs.displayType}</p>
            </div>
          )}
          {specs.refreshRate && (
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Refresh Rate</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{specs.refreshRate} Hz</p>
            </div>
          )}
          {specs.batteryLife && (
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Battery Endurance</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{specs.batteryLife} Hours</p>
            </div>
          )}
          {specs.battery && (
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Battery Capacity</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{specs.battery} mAh</p>
            </div>
          )}
          {specs.os && (
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Operating System</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{specs.os}</p>
            </div>
          )}
          {specs.cameraMain && (
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Primary Camera</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{specs.cameraMain} MP</p>
            </div>
          )}
          {specs.gpu && (
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Graphics Card</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{specs.gpu}</p>
            </div>
          )}
          {specs.weight && (
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Weight</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{specs.weight} kg</p>
            </div>
          )}
        </div>
      </div>

      {/* Price History Visualization Module */}
      <PriceHistoryChart product={product} history={priceHistory} />

      {/* Customer Reviews & Moderation Module */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Verified Customer Reviews</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Authentic purchase reviews with verified purchase detection
            </p>
          </div>

          <button
            type="button"
            onClick={() => setReviewFormOpen(!reviewFormOpen)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-sky-600 text-white text-xs font-bold transition-colors"
          >
            {reviewFormOpen ? 'Cancel' : 'Write a Review'}
          </button>
        </div>

        {/* Review Form Modal/Drawer */}
        {reviewFormOpen && (
          <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Submit Your Experience</h3>

            {reviewError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {reviewError}
              </div>
            )}

            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-1">Your Rating</span>
              <StarRating
                rating={userRating}
                size="md"
                interactive={true}
                onRate={(r) => setUserRating(r)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Review Headline</label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="e.g. Blazing fast compilation speed, fantastic battery"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Detailed Review</label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Describe daily battery life, thermal behavior, ergonomics..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={reviewSubmitting || !isAuthenticated}
              className="px-5 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-500 disabled:opacity-50 transition-colors"
            >
              {!isAuthenticated ? 'Please Log In to Submit' : reviewSubmitting ? 'Posting...' : 'Post Verified Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            No reviews submitted for this device yet. Be the first to share your experience!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StarRating rating={r.rating} size="xs" />
                    <span className="font-bold text-xs text-slate-900">{r.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{formatDate(r.createdAt)}</span>
                </div>

                <p className="text-xs text-slate-600">{r.comment}</p>

                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">{r.user?.name || 'Verified Buyer'}</span>
                    {r.isVerifiedPurchase && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleVoteHelpful(r._id)}
                    className="flex items-center gap-1 text-slate-400 hover:text-sky-600 transition-colors"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    Helpful ({r.helpfulVotes || 0})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Similar {formatCategoryName(product.category)}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
