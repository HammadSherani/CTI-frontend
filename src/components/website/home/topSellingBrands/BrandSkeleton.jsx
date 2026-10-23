'use client';

import React from 'react';

export default function BrandSkeleton({ showProducts = false }) {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Brands row skeleton */}
      <div className="flex items-center gap-4 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-32 sm:w-40 h-28 sm:h-32 bg-gray-100 rounded-2xl border border-gray-200/60 p-4 flex flex-col items-center justify-center gap-2"
          >
            <div className="w-16 h-8 bg-gray-200 rounded-lg" />
            <div className="w-20 h-3 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Product list skeleton (only if showProducts is true) */}
      {showProducts && (
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 space-y-4">
          <div className="w-48 h-5 bg-gray-200 rounded mb-4" />
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-200 rounded-xl flex-shrink-0" />
                <div className="space-y-2">
                  <div className="w-40 h-4 bg-gray-200 rounded" />
                  <div className="w-24 h-3 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="w-20 h-5 bg-gray-200 rounded" />
              <div className="w-24 h-9 bg-gray-200 rounded-xl" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
