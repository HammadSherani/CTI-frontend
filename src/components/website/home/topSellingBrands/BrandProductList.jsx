'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import { formatCurrency } from '@/helper/currencyFormatter';

export default function BrandProductList({
  brand,
  products = [],
  loading = false,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-sm">
        <div className="space-y-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex-shrink-0" />
                <div className="space-y-2">
                  <div className="w-48 h-4 bg-gray-200 rounded" />
                  <div className="w-28 h-3 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="w-24 h-5 bg-gray-200 rounded" />
              <div className="w-28 h-10 bg-gray-200 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const brandName = brand?.name || 'Selected Brand';

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden transition-all duration-300">
      {/* Table Header Row */}
      <div className="bg-gray-50/70 border-b border-gray-200/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
            Top Selling {brandName} Models
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 font-semibold border border-primary-200/60">
            {products.length} {products.length === 1 ? 'Model' : 'Models'}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-16 pr-8 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <span>Price</span>
          <span className="w-24 text-center">Action</span>
        </div>
      </div>

      {/* Product Items */}
      {products.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <Icon icon="mdi:cellphone-off" className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-700">
            No featured models configured for {brandName} yet.
          </p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Explore our refurbished collection to view all available devices.
          </p>
          <Link
            href="/refurbish"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 mt-2"
          >
            <span>View All Refurbished Products</span>
            <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={brand?.id || brand?._id || 'brand-list'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="divide-y divide-gray-100"
            >
              {products.map((product) => {
                const productSlug = product.slug || product.id || '';
                const title = product.title || product.name || 'Refurbished Device';
                const modelNumber = product.modelNumber || '';
                const image = product.image || '/assets/placeholder.jpg';
                const price = Number(product.price) || 0;

                return (
                  <div
                    key={product.id || product._id || product.slug}
                    className="p-4 sm:p-5 hover:bg-gray-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Left: Image & Title */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-gray-200/80 p-2 flex items-center justify-center flex-shrink-0 shadow-xs">
                        <img
                          src={image}
                          alt={title}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/placeholder.jpg';
                          }}
                        />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <Link
                          href={`/refurbish/${productSlug}`}
                          className="text-sm sm:text-base font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1 block"
                        >
                          {title}
                        </Link>
                        <div className="flex items-center gap-2 flex-wrap">
                          {modelNumber && (
                            <span className="text-xs text-gray-500 font-medium">
                              {modelNumber}
                            </span>
                          )}
                          {product.stock > 0 ? (
                            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              In Stock
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                              Limited
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-12 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                          Price
                        </span>
                        <span className="text-base sm:text-lg font-black text-primary-600">
                          {formatCurrency(price)}
                        </span>
                      </div>

                      {/* Right: Action Button */}
                      <Link
                        href={`/refurbish/${productSlug}`}
                        className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap min-w-[100px]"
                      >
                        <span>Buy Now</span>
                        <Icon icon="lucide:arrow-right" className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
