'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import axiosInstance from '@/config/axiosInstance';
import SectionTag from '../sectoinTag';
import BrandSlider from './BrandSlider';
import BrandSkeleton from './BrandSkeleton';

export default function TopSellingBrandsSection() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTopSellingBrands = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/public/refurbished-devices/top-selling-brands');
        if (!isMounted) return;

        const list = res.data?.data || [];
        // Show up to Top 10 brands
        const top10 = list.slice(0, 10);
        setData(top10);
      } catch (err) {
        console.error('Failed to fetch top selling brands:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTopSellingBrands();

    return () => {
      isMounted = false;
    };
  }, []);

  // When user clicks a brand on the home page, navigate to its dedicated page
  const handleSelectBrand = (brand) => {
    if (!brand) return;
    const identifier = brand.slug || brand.id || brand._id;
    router.push(`/top-selling-brands/${identifier}`);
  };

  // Don't render section if there are no top-selling brands configured
  if (!loading && data.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="text-left">
          <SectionTag title="Top Brands" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
            <span className="text-primary-600">Top Selling</span> Brands
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
            Choose a verified brand to explore its top-selling refurbished models.
          </p>
        </div>

        {loading ? (
          <BrandSkeleton />
        ) : (
          /* Top 10 Brands Carousel Row (Only brands shown on Home Page) */
          <BrandSlider
            brands={data}
            selectedBrandId={null}
            onSelectBrand={handleSelectBrand}
          />
        )}
      </div>
    </section>
  );
}
