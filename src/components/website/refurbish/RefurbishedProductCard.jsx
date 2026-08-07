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

  // Destructure flat properties or fall back to variants (making it future-proof)
  const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0];

  const title = product.title || defaultVariant?.title || '';
  const href = product.href || (product.slug ? `/refurbish/${product.slug}` : '#');
  const rating = product.rating !== undefined ? product.rating : (product.ratings?.average || null);
  const badge = product.badge || defaultVariant?.badge || 'Lowest Price';
  const discount = product.discount !== undefined ? product.discount : (defaultVariant?.discountPercentage || 0);

  const price = product.price !== undefined ? product.price : (defaultVariant?.discountPrice || defaultVariant?.sellingPrice || 0);
  const mrp = product.mrp !== undefined ? product.mrp : (defaultVariant?.price || 0);
  const goldPrice = product.goldPrice !== undefined ? product.goldPrice : (defaultVariant?.goldPrice || null);

  // Stock count details (mock or database)
  const stock = product.stock !== undefined ? product.stock : (defaultVariant?.stock !== undefined ? defaultVariant.stock : null);
  // Defaulting to showing stock if between 1 and 5
  const showStock = stock !== null && stock > 0 && stock <= 5;

  // Images
  const mainImage = product.src || defaultVariant?.images?.[0]?.url || '/assets/placeholder.jpg';

  // Video support
  const isVideo = product.isVideo !== undefined ? product.isVideo : !!(defaultVariant?.videos?.[0]?.url || product.videos?.[0]?.url);
  const videoSrc = product.videoSrc || defaultVariant?.videos?.[0]?.url || product.videos?.[0]?.url || null;

  // Calculate off amount
  const offAmount = mrp - price;

  const wishlistItems = useSelector((s) => s.refurbishedWishlist?.items) || [];
  const productIdVal = product._id || product.id || '';
  const isWishlisted = wishlistItems.some(item => {
    const itemProdId = item.productId?._id || item.productId;
    return itemProdId === productIdVal;
  });

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleCardClick = (e) => {
    if (typeof product.onCardClick === 'function') {
      product.onCardClick(e);
    } else if (href && href !== '#') {
      router.push(href);
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(toggleRefurbishedWishlistItem({
      product: { _id: productIdVal },
      variantId: defaultVariant?._id || defaultVariant || null
    }));
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <div
      onClick={handleCardClick}
      className="group block relative border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full flex flex-col justify-between"
    >
      <div>
        {/* Top Header Row: CTI Logo, Stock Badge, and Wishlist Heart */}
        <div className="flex items-center justify-between p-3 pb-0 z-10 relative">
          {/* CTI logo on the left */}
          <div className="relative w-16 h-8 flex items-center">
            <Image
              src="/assets/logo.png"
              alt="CTI Logo"
              width={64}
              height={32}
              className="object-contain w-auto h-auto max-h-8"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Stock count badge */}
            {showStock && (
              <span className="bg-rose-50 border border-rose-200 text-rose-500 text-[10px] md:text-[11px] font-semibold px-2 py-0.5 rounded">
                {stock} left
              </span>
            )}

            {/* Wishlist Button */}
            <button
              onClick={handleWishlist}
              className={`w-8 h-8 rounded-full border shadow flex items-center justify-center transition-all active:scale-95 ${isWishlisted
                ? 'bg-red-50 border-red-300 text-red-500'
                : 'bg-white/90 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300'
                }`}
            >
              <Icon
                icon={isWishlisted ? 'mdi:heart' : 'mdi:heart-outline'}
                className="text-base"
              />
            </button>
          </div>
        </div>

        {/* Product Image Container */}
        <div className="relative w-full h-[180px] md:h-[220px] bg-white flex items-center justify-center p-4">
          <Image
            src={mainImage}
            alt={title}
            fill
            className={`object-contain p-4 group-hover:scale-105 transition-transform duration-300 ${isVideo ? "group-hover:opacity-0" : ""}`}
          />
          {isVideo && videoSrc && (
            <video
              src={videoSrc}
              className="absolute inset-0 w-full h-full object-cover hidden group-hover:block"
              autoPlay
              muted
              loop
              playsInline
            />
          )}
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center group-hover:hidden">
              <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[10px] border-l-white border-y-[6px] border-y-transparent ml-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* Card Details / Body */}
        <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
          {/* Off Amount Badge */}
          {offAmount > 0 && (
            <div>
              <span className="text-[#2e7d32] bg-[#e8f5e9] px-2 py-0.5 rounded text-[10px] md:text-[11px] font-semibold tracking-wide inline-block">
                {formatPrice(offAmount)} OFF
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-[13px] md:text-sm font-semibold text-gray-900 line-clamp-2 min-h-[38px] leading-tight">
            {title}
          </h3>

          {/* Badge Row (Lowest Price & Rating) */}
          <div className="flex items-center gap-2">
            {badge && (
              <span className="bg-[#1a3fb5] text-white text-[9px] md:text-[10px] font-semibold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                {badge}
              </span>
            )}
            {rating !== null && (
              <span className="text-gray-700 text-[10px] md:text-[11px] font-semibold flex items-center gap-0.5 bg-gray-50 border border-gray-205 px-1.5 py-0.5 rounded-sm">
                {Number(rating).toFixed(1)}
                <Icon icon="material-symbols:star-rounded" className="text-amber-500 text-sm -mt-0.5" />
              </span>
            )}
          </div>

          {/* Prices Row */}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {discount > 0 && (
              <span className="text-[#ff4d4f] text-[13px] md:text-sm font-semibold">
                -{discount}%
              </span>
            )}
            <span className="text-sm md:text-base font-bold text-gray-900">
              {formatPrice(price)}
            </span>
            {mrp > price && (
              <span className="text-[11px] md:text-xs text-gray-400 line-through">
                {formatPrice(mrp)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Gold Price Banner Section */}
      {goldPrice && (
        <div className="px-4 pb-4">
          <div className="bg-[#fff8e7] border border-[#fbe9c5] text-[#b45309] text-[11px] md:text-xs font-semibold px-2 py-1 rounded inline-flex items-center gap-1">
            <span>{formatPrice(goldPrice)}</span>
            <span className="text-gray-500 font-normal">with</span>
            <span className="text-[#b45309] font-bold tracking-wider">GOLD</span>
          </div>
        </div>
      )}
    </div>
  );
}
