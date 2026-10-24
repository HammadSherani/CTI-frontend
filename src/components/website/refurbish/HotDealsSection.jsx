'use client';

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import axiosInstance from '@/config/axiosInstance';
import { formatCurrency } from '@/helper/currencyFormatter';

export default function HotDealsSection() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchHotDeals = async () => {
      try {
        const res = await axiosInstance.get('/public/refurbished-devices/hot-deals');
        if (isMounted && res.data?.success) {
          setDeals(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load hot deals:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHotDeals();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="my-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="animate-pulse bg-[#FAF7FE] border-2 border-purple-100 rounded-2xl p-4 sm:p-5 flex items-center gap-4 h-36"
            >
              <div className="w-24 h-24 bg-purple-150/60 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="w-20 h-4 bg-purple-200/70 rounded" />
                <div className="w-full h-4 bg-purple-200/50 rounded" />
                <div className="w-16 h-3 bg-purple-200/40 rounded" />
                <div className="w-24 h-6 bg-purple-200/80 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!deals || deals.length === 0) {
    return null;
  }

  return (
    <section className="my-8 relative" aria-label="Hot Deals">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {deals.slice(0, 3).map((item) => {
          const productSlug = item.slug || item.productId;
          const href = productSlug ? `/refurbish/${productSlug}` : '#';
          const discount = item.discountPercentage || 0;
          const originalPrice = item.originalPrice || 0;
          const effectivePrice = item.effectivePrice || Math.round(originalPrice * (1 - discount / 100));

          return (
            <Link
              key={item.id || item.productId || item._id}
              href={href}
              className="group relative block bg-[#FAF7FE] hover:bg-[#F6F0FC] border-2 border-purple-200/90 hover:border-purple-300 rounded-2xl p-4 sm:p-5 transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer overflow-hidden"
            >
              {/* Ticket Scalloped Notches on Left and Right Edges */}
              <span
                aria-hidden="true"
                className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-purple-200/90 pointer-events-none group-hover:border-purple-300 transition-colors"
              />
              <span
                aria-hidden="true"
                className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-purple-200/90 pointer-events-none group-hover:border-purple-300 transition-colors"
              />

              {/* Card Container */}
              <div className="flex items-center gap-3 sm:gap-4 h-full">
                {/* Left: Product Image */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-white p-2 flex items-center justify-center flex-shrink-0 border border-purple-100/60 shadow-2xs group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={item.image || '/assets/placeholder.jpg'}
                    alt={item.title || 'Hot Deal Product'}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/placeholder.jpg';
                    }}
                  />
                </div>

                {/* Right: Content */}
                <div className="min-w-0 flex-1 flex flex-col justify-between self-stretch py-0.5">
                  {/* Top: Discount Tag + Title */}
                  <div>
                    <div className="inline-block bg-[#22c55e] text-white text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded shadow-2xs uppercase tracking-wide">
                      % {discount} İNDİRİM
                    </div>

                    <h3
                      className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 mt-1.5 leading-snug group-hover:text-primary-700 transition-colors"
                      title={item.title}
                    >
                      {item.title}
                    </h3>
                  </div>

                  {/* Bottom: Strike Price + Effective Price */}
                  <div className="mt-2 pt-1 border-t border-purple-100/70">
                    {originalPrice > effectivePrice && (
                      <div className="text-[11px] sm:text-xs text-gray-400 line-through font-semibold leading-tight">
                        {formatCurrency(originalPrice)}
                      </div>
                    )}
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-500 font-medium">Etkin Fiyat</span>
                      <span className="text-lg sm:text-xl font-black text-gray-950 tracking-tight leading-none">
                        {formatCurrency(effectivePrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
