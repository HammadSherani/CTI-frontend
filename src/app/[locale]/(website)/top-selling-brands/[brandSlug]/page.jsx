'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import Breadcrumb from '@/components/ui/Breadcrumb';
import BrandProductList from '@/components/website/home/topSellingBrands/BrandProductList';
import BrandSlider from '@/components/website/home/topSellingBrands/BrandSlider';

export default function TopSellingBrandDetailPage() {
  const router = useRouter();
  const params = useParams();
  const brandSlug = params?.brandSlug || '';

  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!brandSlug) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      axiosInstance.get(`/public/refurbished-devices/top-selling-brands/${brandSlug}/products`),
      axiosInstance.get('/public/refurbished-devices/top-selling-brands'),
    ])
      .then(([brandRes, allRes]) => {
        if (!isMounted) return;

        if (brandRes.data?.success) {
          const brandData = brandRes.data.data?.brand || {};
          const prods = brandRes.data.data?.products || [];
          setBrand(brandData);
          setProducts(prods);
        } else {
          setError('Brand not found or not active');
        }

        if (allRes.data?.success) {
          const top10 = (allRes.data.data || []).slice(0, 10);
          setAllBrands(top10);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load top selling brand details:', err);
        setError(err.response?.data?.message || 'Failed to load brand products');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [brandSlug]);

  const handleBrandChange = (targetBrand) => {
    const slug = targetBrand.slug || targetBrand.id || targetBrand._id;
    if (slug) {
      router.push(`/top-selling-brands/${slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb & Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Breadcrumb />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-primary-600 transition"
          >
            <Icon icon="lucide:arrow-left" className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Brand Banner Header */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-gray-200 p-2 shadow-sm flex items-center justify-center flex-shrink-0">
              {brand?.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name || 'Brand Logo'}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <Icon icon="mdi:tag" className="w-10 h-10 text-gray-400" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200/60">
                  Top Selling Brand
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  {products.length} {products.length === 1 ? 'Featured Model' : 'Featured Models'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {brand?.name ? `${brand.name} Top Selling Models` : 'Top Selling Brand'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Explore verified, quality-tested refurbished devices from {brand?.name || 'this brand'} with official warranty and instant savings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/refurbish"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:border-primary-500 hover:text-primary-600 font-semibold text-xs transition"
            >
              <span>Explore All Devices</span>
              <Icon icon="lucide:arrow-up-right" className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Other Brands Quick Switcher Slider */}
        {allBrands.length > 1 && (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Switch Brand
              </span>
              <span className="text-xs font-semibold text-gray-500">
                Top 10 Selling Brands
              </span>
            </div>
            <BrandSlider
              brands={allBrands}
              selectedBrandId={brand?.id || brand?._id}
              onSelectBrand={handleBrandChange}
            />
          </div>
        )}

        {/* Products Table List (Matching Reference Image 2) */}
        {error ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
              <Icon icon="mdi:alert-circle-outline" className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{error}</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              This brand may not have top-selling models configured or may be temporarily unavailable.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition"
            >
              <Icon icon="lucide:home" className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        ) : (
          <BrandProductList
            brand={brand}
            products={products}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
