'use client';

import Image from 'next/image';
import { Icon } from '@iconify/react';

function ProductCard({ 
  title, 
  img, 
  price, 
  oldPrice, 
  discountAmount, 
  discountPercent, 
  reviews, 
  goldPrice, 
  badge, 
  onAdd 
}) {
  return (
    <div className="group relative flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">

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

        {/* Badge */}
        {badge && (
          <div className="absolute top-3 right-3 z-10  bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            {badge}
          </div>
        )}
      </div>

      {/* ── Product Image ── */}
      <div className="relative w-full h-40 md:h-36 border-b lg:h-32 xl:h-28 2xl:h-24 bg-white flex items-center justify-center">
        <Image
          src={img || "https://via.placeholder.com/250?text=Product"}
          alt={title||"product"}
          width={250}
          height={250}
          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 px-3 pb-3 gap-2 p-3 bg-white">

        {/* Discounts Row */}
        {(discountAmount || discountPercent) && (
          <div className="flex justify-between gap-2">
            {discountAmount && (
              <span className="bg-green-500 text-white text-[14px] font-bold px-2 py-0.5 rounded-md">
                {discountAmount}
              </span>
            )}
            {discountPercent && (
              <span className="text-primary-600 text-[14px] font-bold px-2 py-0.5 rounded-md">
              -  {discountPercent}Off
              </span>
            )}
          </div>
        )}

        {/* Product Title */}
        <h3 className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-2 min-h-[36px]">
          {title}
        </h3>

        {/* Price & Reviews Row */}
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[18px] font-extrabold text-orange-500">{price}</span>
            {oldPrice && (
              <span className="text-[13px] text-gray-400 line-through">{oldPrice}</span>
            )}
          </div>

          {reviews && (
            <div className="flex items-center gap-1">
              <Icon icon="mdi:star" className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-[11px] text-gray-500 font-medium">{reviews} Reviews</span>
            </div>
          )}
        </div>

        {/* Gold Payment Tag */}
        {goldPrice && (
          <div className="flex items-center gap-1.5 mt-2 bg-gradient-to-r from-[#F1D0A2] via-[#F9EAEA]/0 to-transparent border border-amber-200 rounded-lg px-2.5 py-1.5">
            <span className="text-[12px] font-bold text-gray-700">{goldPrice}</span>
            <span className="text-[10px] text-gray-500">with</span>
            <span className="text-[11px] font-extrabold text-amber-600 tracking-wide uppercase">GOLD</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;