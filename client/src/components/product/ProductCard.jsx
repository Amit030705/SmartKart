import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeftRight, Check } from 'lucide-react';
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
  const specs = product.specs || {};
  const quickSpecs = [
    specs.ram && `${specs.ram}GB RAM`,
    specs.storage && `${specs.storage >= 1024 ? `${specs.storage / 1024}TB` : `${specs.storage}GB`} storage`,
    specs.displaySize && `${specs.displaySize}" display`,
    specs.refreshRate && `${specs.refreshRate}Hz`,
    specs.anc && 'Noise cancelling',
  ].filter(Boolean).slice(0, 3);

  return (
    <article className="flex min-w-0 flex-col border border-[#e3e5df] bg-white">
      <Link to={`/product/${product.slug || product._id}`} className="relative flex aspect-[4/3] items-center justify-center bg-[#f7f7f4] p-5">
        <img src={product.images?.[0]} alt={product.name} className="h-full w-full object-contain" loading="lazy" />
        {showMatchBadge && matchScore !== null && <span className="absolute bottom-2 left-2 bg-white/95 px-2 py-1 text-xs font-medium text-[#315740]">{matchScore}% match</span>}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 text-[11px] text-[#737a73]">
          <span className="font-medium text-[#52705d]">{product.brand}</span>
          <span>{formatCategoryName(product.category)}</span>
        </div>
        <Link to={`/product/${product.slug || product._id}`} className="mt-1.5 line-clamp-2 min-h-10 text-sm font-medium leading-5 text-[#252d27] hover:text-[#315740]">
          {product.name}
        </Link>
        {product.reviewCount > 0 ? (
          <div className="mt-2"><StarRating rating={product.rating} reviewCount={product.reviewCount} size="xs" /></div>
        ) : (
          <p className="mt-2 text-xs text-[#81877f]">No reviews yet</p>
        )}
        {quickSpecs.length > 0 && <p className="mt-3 min-h-8 text-xs leading-5 text-[#626a63]">{quickSpecs.join(' · ')}</p>}

        <div className="mt-auto border-t border-[#eceee9] pt-3">
          <p className="text-lg font-semibold text-[#202722]">{formatCurrency(product.price)}</p>
          <p className="text-[11px] text-[#81877f]">Catalog price</p>
          {product.observedPrice && product.priceVerifiedAt && product.priceUrl && (
            <a href={product.priceUrl} target="_blank" rel="noreferrer" className="mt-1 block text-[11px] leading-4 text-[#315740] underline underline-offset-2">
              {formatCurrency(product.observedPrice)} at {product.priceSource}, checked {new Date(product.priceVerifiedAt).toLocaleDateString('en-IN')}
            </a>
          )}
          <div className="mt-3 flex items-center gap-2">
            <button type="button" disabled={product.stock === 0} onClick={() => addToCart(product, 1)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#315740] px-3 py-2 text-xs font-medium text-white hover:bg-[#264633] disabled:cursor-not-allowed disabled:bg-[#d9ded9] disabled:text-[#727972]">
              <ShoppingCart className="h-4 w-4" /> {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
            </button>
            <button type="button" aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'} title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => inWishlist ? removeFromWishlist(product._id) : addToWishlist(product._id)} className={`rounded-md border p-2 ${inWishlist ? 'border-[#315740] text-[#315740]' : 'border-[#dfe3dc] text-[#626a63] hover:bg-[#f7f8f5]'}`}>
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
            <button type="button" aria-label={inCompare ? 'Remove from comparison' : 'Add to comparison'} title={inCompare ? 'Remove from comparison' : 'Add to comparison'} onClick={() => inCompare ? removeFromCompare(product._id) : addToCompare(product)} className={`rounded-md border p-2 ${inCompare ? 'border-[#315740] text-[#315740]' : 'border-[#dfe3dc] text-[#626a63] hover:bg-[#f7f8f5]'}`}>
              {inCompare ? <Check className="h-4 w-4" /> : <ArrowLeftRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
