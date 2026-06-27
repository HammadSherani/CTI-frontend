'use client';

import Image from 'next/image';
import { Icon } from '@iconify/react';
import { useRouter } from '@/i18n/navigation';

function ProductCard({ product, isWishlisted = false, onWishlist }) {
  const router = useRouter();

  const defaultVariant =
    product?.variants?.find(v => v.isDefault) || product?.variants?.[0];

  if (!product || !defaultVariant) {
    return (
      <div className="p-4 text-red-500 border rounded-xl">
        Invalid product
      </div>
    );
  }

  const {
    title,
    shortDescription,
    images,
    slug,
    brand,
    ratings = {},
  } = product;

  const {
    sellingPrice,
    price,
    discountPercentage,
    discountPrice,
    stock = 0,
  } = defaultVariant;

  const isOutOfStock = Number(stock) === 0;
  const isLowStock = Number(stock) > 0 && Number(stock) <= 5;

  const mainImage =
    defaultVariant.images?.[0]?.url ||
    images?.[0]?.url ||
    '/assets/placeholder.jpg';

  const displayPrice = Number(discountPrice || sellingPrice || price || 0);
  const originalPrice = Number(sellingPrice || price || 0);

  const hasDiscount =
    Number(discountPercentage) > 0 || originalPrice > displayPrice;

  const discountPercent = hasDiscount
    ? Math.round(
      Number(discountPercentage) ||
      ((originalPrice - displayPrice) / originalPrice) * 100
    )
    : 0;

  const averageRating = Number(ratings?.average || 0);
  const ratingCount = Number(ratings?.count || 0);

  return (
    <div
      onClick={(e) => {
        if (typeof product.onCardClick === 'function') {
          product.onCardClick(e);
        } else {
          router.push(`/product/${slug}`);
        }
      }}
      className="group relative  isolate  flex flex-col cursor-pointer bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
        {isOutOfStock && (
          <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-xl shadow-md">
            Out of Stock
          </div>
        )}

        {isLowStock && !isOutOfStock && (
          <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-xl shadow-md">
            Only {stock} left!
          </div>
        )}

        <div className=" z-10">
          <Image
            src="/assets/logo.png"
            alt="Logo"
            width={77}
            height={40}
            className="object-contain w-16 h-10"
          />
        </div>
      </div>

      {/* Wishlist */}
      {onWishlist && (
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWishlist(e);
            }}
            className={`w-9 h-9 rounded-full border shadow flex items-center justify-center transition-all active:scale-95 ${isWishlisted
                ? 'bg-red-50 border-red-300 text-red-500'
                : 'bg-white/90 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300'
              }`}
          >
            <Icon
              icon={isWishlisted ? 'mdi:heart' : 'mdi:heart-outline'}
              className="text-xl"
            />
          </button>
        </div>
      )}

      {/* Image */}
      <div className="relative w-full h-52 flex items-center justify-center overflow-hidden bg-gray-50">
        <Image
          src={mainImage}
          alt={title || 'product'}
          width={280}
          height={280}
          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
        />

        {(defaultVariant.images?.length > 1 || images?.length > 1) && (
          <div className="absolute bottom-3 right-3 bg-gradient-to-r from-orange-400 to-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-lg shadow">
            Multiple Images
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 px-4 pb-4 pt-3">
        {brand?.title && (
          <p className="text-[11px] font-medium text-gray-500 uppercase mb-1">
            {brand.title}
          </p>
        )}

        <h3 className="text-[15px] font-semibold text-gray-900 line-clamp-2 min-h-[42px]">
          {title}
        </h3>

        {shortDescription && (
          <p className="text-[13px] text-gray-500 line-clamp-2 mb-3">
            {shortDescription}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2.5">
          {averageRating > 0 ? (
            <>
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon
                    key={i}
                    icon={
                      i < Math.floor(averageRating)
                        ? 'mdi:star'
                        : i < averageRating
                          ? 'mdi:star-half-full'
                          : 'mdi:star-outline'
                    }
                    className="text-sm"
                  />
                ))}
              </div>

              <span className="text-xs text-gray-500">
                {averageRating.toFixed(1)}
                {ratingCount > 0 && (
                  <span className="text-gray-400"> ({ratingCount})</span>
                )}
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-400">No reviews yet</span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline justify-between mt-auto">
          {hasDiscount && discountPercent > 0 && (
            <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-xl shadow-md">
              -{discountPercent}%
            </div>
          )}

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-600">
              ${displayPrice.toFixed(2)}
            </span>

            {hasDiscount && originalPrice > displayPrice && (
              <span className="text-sm text-gray-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="text-right">
            {isOutOfStock ? (
              <span className="text-xs text-red-500 font-semibold">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="text-xs text-orange-600 font-semibold">
                Only {stock} left
              </span>
            ) : (
              <span className="text-xs text-emerald-600 font-medium">
                In Stock
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;