'use client';

import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import RefurbishedProductCard from './RefurbishedProductCard';

import 'swiper/css';
import 'swiper/css/navigation';

export default function RefurbishedSliderSection({ title, products = [], viewAllHref = '#', loading = false }) {
  if (!loading && (!products || products.length === 0)) return null;

  // Generate unique class names for swiper navigation to prevent conflicts between multiple sliders
  const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const prevClass = `prev-${slug}`;
  const nextClass = `next-${slug}`;

  return (
    <div className="mt-10 mb-10 relative">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1"
          >
            View All
          </Link>
        )}
      </div>

      {/* Swiper Container */}
      <div className="relative">
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={2}
          navigation={{
            prevEl: `.${prevClass}`,
            nextEl: `.${nextClass}`,
          }}
          breakpoints={{
            480: { slidesPerView: 2 },
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
          }}
          className="!pb-2"
        >
          {loading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <SwiperSlide key={`skeleton-${idx}`}>
                  <div className="animate-pulse border border-gray-200 rounded-xl overflow-hidden bg-white p-4 space-y-4 h-[350px] flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="h-5 w-16 bg-gray-200 rounded-md"></div>
                        <div className="h-5 w-10 bg-gray-200 rounded-md"></div>
                      </div>
                      <div className="h-36 w-full bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-1/3 bg-gray-200 rounded-md"></div>
                      <div className="h-4 w-5/6 bg-gray-200 rounded-md"></div>
                      <div className="h-5 w-1/2 bg-gray-200 rounded-md"></div>
                    </div>
                  </div>
                </SwiperSlide>
              ))
            : products.map((product) => (
                <SwiperSlide key={product.id || product._id}>
                  <RefurbishedProductCard product={product} />
                </SwiperSlide>
              ))
          }
        </Swiper>

        {/* Custom Navigation Buttons */}
        <button
          className={`${prevClass} absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-3 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 hidden md:flex items-center justify-center hover:bg-gray-50 transition-colors`}
          aria-label="Previous products"
        >
          <svg className="w-4 h-4 text-gray-650" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          className={`${nextClass} absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-3 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 hidden md:flex items-center justify-center hover:bg-gray-50 transition-colors`}
          aria-label="Next products"
        >
          <svg className="w-4 h-4 text-gray-650" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
