'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

export default function BrandSlider({
  brands = [],
  selectedBrandId,
  onSelectBrand,
}) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 240;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!brands || brands.length === 0) return null;

  return (
    <div className="relative group">
      {/* Left Scroll Arrow Button */}
      <button
        type="button"
        onClick={() => scroll('left')}
        aria-label="Previous brands"
        className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200/90 shadow-md hover:shadow-lg flex items-center justify-center text-gray-700 hover:text-primary-600 hover:border-primary-400 transition-all cursor-pointer opacity-90 hover:opacity-100 active:scale-95"
      >
        <Icon icon="lucide:arrow-left" className="w-5 h-5" />
      </button>

      {/* Brand Cards Row */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
      >
        {brands.map((item) => {
          const brand = item.brand || item;
          const isSelected = String(brand.id || brand._id) === String(selectedBrandId);

          return (
            <motion.button
              key={brand.id || brand._id}
              type="button"
              onClick={() => onSelectBrand(brand)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-shrink-0 w-32 sm:w-40 h-28 sm:h-32 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer relative bg-white ${
                isSelected
                  ? 'border-2 border-primary-500 shadow-md shadow-primary-500/10 bg-gradient-to-b from-primary-50/40 to-white ring-2 ring-primary-500/20'
                  : 'border border-gray-200/80 hover:border-primary-300 hover:shadow-md'
              }`}
            >
              {/* Logo Container */}
              <div className="relative w-full h-12 sm:h-14 flex items-center justify-center mb-2 px-2">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain filter group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm">
                    {brand.name?.charAt(0) || 'B'}
                  </div>
                )}
              </div>

              {/* Brand Name */}
              <span
                className={`text-xs sm:text-sm font-semibold truncate w-full px-1 ${
                  isSelected ? 'text-primary-700 font-bold' : 'text-gray-800'
                }`}
              >
                {brand.name}
              </span>

              {/* Selected indicator pill */}
              {isSelected && (
                <span className="absolute -top-1.5 right-2 w-2 h-2 rounded-full bg-primary-500 ring-2 ring-white animate-pulse" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Right Scroll Arrow Button */}
      <button
        type="button"
        onClick={() => scroll('right')}
        aria-label="Next brands"
        className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200/90 shadow-md hover:shadow-lg flex items-center justify-center text-gray-700 hover:text-primary-600 hover:border-primary-400 transition-all cursor-pointer opacity-90 hover:opacity-100 active:scale-95"
      >
        <Icon icon="lucide:arrow-right" className="w-5 h-5" />
      </button>
    </div>
  );
}
