'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { Link, useRouter } from '@/i18n/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { toggleRefurbishedWishlistItem } from '@/store/refurbishedWishlist';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/helper/currencyFormatter';
import ProductHoverVideo, { extractProductVideo } from '@/components/common/ProductHoverVideo';

export default function RefurbishedProductCard({ product }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);

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
  const videoSrc = extractProductVideo(product, defaultVariant);
  const offAmount = mrp > price ? mrp - price : 0;
  const isFlashDeal = product.isFlashDeal || false;
  const flashDiscount = product.flashDiscount || 0;

  const wishlistItems = useSelector((s) => s.refurbishedWishlist?.items) || [];
  const productIdVal = product._id || product.id || '';
  const isWishlisted = wishlistItems.some(item => {
    const itemProdId = item.productId?._id || item.productId?.id || item.productId;
    return itemProdId === productIdVal;
  });

  const cardHref = href && href !== '#' ? href : (product.slug ? `/refurbish/${product.slug}` : '#');

  const handleCardClick = (e) => {
    if (typeof product.onCardClick === 'function') {
      product.onCardClick(e);
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
    <Link
      href={cardHref}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative border rounded-2xl overflow-hidden bg-white hover:shadow-xl hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-all duration-300 ease-out cursor-pointer flex flex-col w-full h-[375px] justify-between ${isFlashDeal
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
      <div className="flex items-center justify-between px-3 pt-3 shrink-0 h-9">
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

      {/* ── Image with Video Hover Preview (Fixed Height) ── */}
      <div className="relative shrink-0 h-[155px] bg-gradient-to-b from-gray-50/60 to-white flex items-center justify-center overflow-hidden">
        <ProductHoverVideo
          videoSrc={videoSrc}
          posterSrc={mainImage}
          alt={title}
          isCardHovered={isHovered}
          fill={true}
          imageClassName="object-contain p-3 group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </div>

      {/* ── Body (Structured with reserved slots for perfect height consistency) ── */}
      <div className="px-3 pb-3 pt-2 flex flex-col justify-between grow overflow-hidden">
        <div className="flex flex-col gap-1">
          {/* Brand · Category — always exactly 1 line */}
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide truncate leading-none h-[12px] shrink-0">
            {[brand, categoryName].filter(Boolean).join(' · ') || '\u00A0'}
          </p>

          {/* Title — strictly locked to 2 lines space */}
          <h3
            className="text-[13px] font-semibold text-gray-900 leading-[1.35] group-hover:text-primary-700 transition-colors duration-200 overflow-hidden shrink-0"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              height: '35px',
            }}
          >
            {title}
          </h3>

          {/* Short description — strictly locked to 1 line space */}
          <p
            className="text-[11px] text-gray-400 leading-[1.4] overflow-hidden shrink-0"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              height: '16px',
            }}
          >
            {shortDescription || '\u00A0'}
          </p>
        </div>

        {/* Refurbished badge + rating + savings (Strictly reserved 46px height so all cards align) */}
        <div className="flex flex-col justify-center gap-1 h-[46px] shrink-0 my-1">
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
          </div>

          {/* Reserved slot for discount savings or urgency badge */}
          <div className="h-[18px] flex items-center">
            {offAmount > 0 ? (
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded text-[10px] font-semibold truncate leading-none">
                Save {formatCurrency(offAmount)}
              </span>
            ) : isFlashDeal ? (
              <span className="flex items-center gap-1 text-[9px] text-amber-600 font-bold tracking-tight uppercase leading-none">
                <Icon icon="mdi:clock-alert-outline" className="text-amber-500 text-xs" />
                <span>Limited time!</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Price — pinned to bottom, exactly identical baseline across all cards */}
        <div className="mt-auto pt-1 flex items-baseline gap-1.5 shrink-0 h-[26px]">
          <span className="text-base font-bold text-gray-900 tracking-tight">{formatCurrency(price)}</span>
          {mrp > price && (
            <span className="text-[11px] text-gray-400 line-through">{formatCurrency(mrp)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}