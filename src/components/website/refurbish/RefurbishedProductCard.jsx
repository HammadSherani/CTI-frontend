'use client';

import Image from 'next/image';
import { Icon } from '@iconify/react';
import { useRouter } from '@/i18n/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { toggleRefurbishedWishlistItem } from '@/store/refurbishedWishlist';
import { toast } from 'react-toastify';

export default function RefurbishedProductCard({ product }) {
  const router = useRouter();
  const dispatch = useDispatch();

  if (!product) return null;

  const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0];

  const title = product.title || defaultVariant?.title || '';
  const href = product.href || (product.slug ? `/refurbish/${product.slug}` : '#');
  const rating = product.rating !== undefined ? product.rating : (product.ratings?.average || null);
  const discount = product.discount !== undefined ? product.discount : (defaultVariant?.discountPercentage || 0);
  const price = product.price !== undefined ? product.price : (defaultVariant?.discountPrice || defaultVariant?.sellingPrice || 0);
  const mrp = product.mrp !== undefined ? product.mrp : (defaultVariant?.price || 0);
  const stock = product.stock !== undefined ? product.stock : (defaultVariant?.stock ?? null);
  const brand = product.brand || product.brandId?.name || '';
  const categoryName = product.categoryName || product.categoryId?.name || '';
  const shortDescription = product.shortDescription || '';
  const showStock = stock !== null && stock > 0 && stock <= 5;
  const mainImage = product.src || defaultVariant?.images?.[0]?.url || '/assets/placeholder.jpg';
  const isVideo = product.isVideo !== undefined ? product.isVideo : !!(defaultVariant?.videos?.[0]?.url || product.videos?.[0]?.url);
  const videoSrc = product.videoSrc || defaultVariant?.videos?.[0]?.url || product.videos?.[0]?.url || null;
  const offAmount = mrp > price ? mrp - price : 0;
  const isFlashDeal = product.isFlashDeal || false;
  const flashDiscount = product.flashDiscount || 0;

  const wishlistItems = useSelector((s) => s.refurbishedWishlist?.items) || [];
  const productIdVal = product._id || product.id || '';
  const isWishlisted = wishlistItems.some(item => {
    const itemProdId = item.productId?._id || item.productId?.id || item.productId;
    return itemProdId === productIdVal;
  });

  const formatPrice = (value) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);

  const handleCardClick = (e) => {
    if (typeof product.onCardClick === 'function') product.onCardClick(e);
    else if (href && href !== '#') router.push(href);
  };

  const handleCardKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(e);
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(toggleRefurbishedWishlistItem({
      product: product,
      variantId: defaultVariant?._id || defaultVariant || null,
    }));
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };


  return (
    <div
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
      className={`group relative border rounded-2xl overflow-hidden bg-white hover:shadow-xl hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-all duration-300 ease-out cursor-pointer flex flex-col w-full ${isFlashDeal
        ? 'border-amber-300 shadow-md shadow-amber-500/5 hover:shadow-amber-500/20 hover:border-amber-400'
        : 'border-gray-200 hover:shadow-primary-100/50 hover:border-primary-300'
        }`}
    >
      {/* ── Discount ribbon ── */}
      {discount > 0 && (
        <div className={`absolute top-3 -left-8 z-10 rotate-[-45deg] text-white text-[9px] font-bold tracking-wide px-8 py-0.5 shadow-sm ${isFlashDeal
          ? 'bg-gradient-to-r from-amber-500 to-rose-600'
          : 'bg-red-500'
          }`}>
          {discount}%
        </div>
      )}

      {/* ── Header: logo + stock + wishlist ── */}
      <div className="flex items-center justify-between px-3 pt-3 shrink-0">
        <div className="relative w-14 h-6 flex items-center">
          <Image
            src="/assets/logo.png"
            alt="CTI"
            width={56}
            height={24}
            className="object-contain w-auto h-auto max-h-6"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {showStock && (
            <span className="relative flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
              </span>
              {stock} left
            </span>
          )}
          <button
            onClick={handleWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={isWishlisted}
            className={`w-7 h-7 shrink-0 rounded-full border shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${isWishlisted
              ? 'bg-red-50 border-red-300 text-red-500'
              : 'bg-white/90 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300'
              }`}
          >
            <Icon
              icon={isWishlisted ? 'mdi:heart' : 'mdi:heart-outline'}
              className={`text-sm transition-transform duration-200 ${isWishlisted ? 'scale-110' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* ── Image ── */}
      <div className="relative shrink-0 h-[160px] bg-gradient-to-b from-gray-50/60 to-white flex items-center justify-center px-3 py-2 overflow-hidden">
        <Image
          src={mainImage}
          alt={title}
          fill
          className={`object-contain p-3 group-hover:scale-110 transition-transform duration-500 ease-out ${isVideo ? 'group-hover:opacity-0' : ''}`}
        />
        {isVideo && videoSrc && (
          <video
            src={videoSrc}
            className="absolute inset-0 w-full h-full object-cover hidden group-hover:block"
            autoPlay muted loop playsInline
          />
        )}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center group-hover:hidden">
            <div className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
              <div className="w-0 h-0 border-l-[9px] border-l-white border-y-[5px] border-y-transparent ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="px-3 pb-3 pt-2 flex flex-col gap-1.5 grow">

        {/* Brand · Category — always 1 line reserved */}
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide truncate leading-none min-h-[10px]">
          {[brand, categoryName].filter(Boolean).join(' · ')}
        </p>

        {/* Title — always exactly 2 lines of space reserved, never clipped mid-glyph */}
        <h3
          className="text-[13px] font-semibold text-gray-900 leading-[1.35] group-hover:text-primary-700 transition-colors duration-200 overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: 'calc(1.35em * 2)',
          }}
        >
          {title}
        </h3>

        {/* Short description — always 1 line of space reserved */}
        <p
          className="text-[11px] text-gray-400 leading-[1.4] overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            minHeight: shortDescription ? 'calc(1.4em * 1)' : 0,
          }}
        >
          {shortDescription}
        </p>

        {/* Refurbished badge + rating + savings */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {isFlashDeal ? (
            <span className="bg-gradient-to-r from-amber-500 to-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 flex items-center gap-0.5 shadow-sm">
              <Icon icon="mdi:flash" className="text-[10px]" /> Flash Deal
            </span>
          ) : (
            <span className="bg-primary-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
              Refurbished
            </span>
          )}
          {product.isCTIVerified && (
            <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
              <Icon icon="mdi:check-decagram" className="text-blue-500" /> CTI Verified
            </span>
          )}
          {rating !== null && (
            <span className="text-gray-700 text-[10px] font-semibold flex items-center gap-0.5 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded shrink-0">
              {Number(rating).toFixed(1)}
              <Icon icon="material-symbols:star-rounded" className="text-amber-500 text-sm -mt-0.5" />
            </span>
          )}
          {offAmount > 0 && (
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded text-[10px] font-semibold truncate">
              Save {formatPrice(offAmount)}
            </span>
          )}
        </div>

        {/* Urgency message for flash deals */}
        {isFlashDeal && (
          <div className="flex items-center gap-1 text-[9px] text-amber-600 font-bold tracking-tight uppercase">
            <Icon icon="mdi:clock-alert-outline" className="text-amber-500 text-xs" />
            <span>Limited time flash deal!</span>
          </div>
        )}

        {/* Price — pinned to bottom, never overlaps text above */}
        <div className="mt-auto flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-base font-bold text-gray-900 tracking-tight">{formatPrice(price)}</span>
          {mrp > price && (
            <span className="text-[11px] text-gray-400 line-through">{formatPrice(mrp)}</span>
          )}
        </div>
      </div>
    </div>
  );
}