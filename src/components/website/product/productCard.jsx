'use client';

import Image from 'next/image';
import { Icon } from '@iconify/react';
import { useRouter } from '@/i18n/navigation';

function ProductCard({ 
  product,
  isWishlisted = false,
  onWishlist,
  // onAdd is no longer needed - we use slug for navigation
}) {
  const router = useRouter();

  // Get default variant
  const defaultVariant = product?.variants?.find(v => v.isDefault) || product?.variants?.[0];

  if (!product || !defaultVariant) {
    return <div className="p-4 text-red-500 border rounded-xl">Invalid product</div>;
  }

  const { title, images, slug } = product;
  const {
    sellingPrice,
    price,
    discountPercentage,
    discountPrice,
    stock,
  } = defaultVariant;

  // Image priority: variant → product
  const mainImage = defaultVariant.images?.[0]?.url || images?.[0]?.url || "/assets/placeholder.jpg";

  const displayPrice = discountPrice || sellingPrice || price;
  const originalPrice = sellingPrice || price;
  const hasDiscount = Number(discountPercentage) > 0;

  const discountPercent = hasDiscount 
    ? Math.round(Number(discountPercentage)) 
    : Math.round(((originalPrice - displayPrice) / originalPrice) * 100);

  return (
    <div 
      onClick={() => router.push(`/product/${slug}`)}
      className="group relative flex flex-col cursor-pointer bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full"
    >
      {/* ── Top Badges Row ── */}
      <div className="flex items-start justify-between px-2.5 p-4 pt-2.5 gap-1 min-h-[32px] relative">
        {/* Logo */}
        <Image 
          src='/assets/logo.png' 
          alt='Logo' 
          width={77} 
          height={40} 
          className="inline-block mr-1" 
        />

        {/* Wishlist */}
        {onWishlist && (
          <div className="absolute top-2 right-2 z-10">
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onWishlist(e); 
              }}
              className={`w-8 h-8 rounded-full border shadow-sm flex items-center justify-center transition-colors ${
                isWishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200'
              }`}
            >
              <Icon icon={isWishlisted ? "mdi:heart" : "mdi:heart-outline"} className="text-lg" />
            </button>
          </div>
        )}
      </div>

      {/* ── Product Image ── */}
      <div className="relative w-full h-40 md:h-36 border-b lg:h-32 xl:h-28 2xl:h-24 bg-white flex items-center justify-center overflow-hidden">
        <Image
          src={mainImage}
          alt={title || "product"}
          width={250}
          height={250}
          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
        />

        {/* Discount Badge */}
        {hasDiscount && discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-xl shadow">
            -{discountPercent}%
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 px-3 pb-3 gap-2 p-3 bg-white">
        {/* Product Title */}
        <h3 className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-2 min-h-[36px]">
          {title}
        </h3>

        {/* Price Row */}
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[18px] font-extrabold text-orange-500">
              ${Number(displayPrice).toFixed(2)}
            </span>
            {hasDiscount && originalPrice > displayPrice && (
              <span className="text-[13px] text-gray-400 line-through">
                ${Number(originalPrice).toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Stock Warning */}
        {stock > 0 && stock <= 5 && (
          <p className="text-xs text-orange-600 font-medium">Only {stock} left in stock</p>
        )}
        {stock === 0 && (
          <p className="text-xs text-red-500 font-medium">Out of stock</p>
        )}
      </div>
    </div>
  );
}

export default ProductCard;