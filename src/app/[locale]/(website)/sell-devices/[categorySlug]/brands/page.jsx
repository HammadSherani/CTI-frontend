"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

const STEP_ITEMS = [
  { id: 1, name: 'Brand' },
  { id: 2, name: 'Model' },
  { id: 3, name: 'Variants' },
  { id: 4, name: 'Condition' },
  { id: 5, name: 'Upload Media' },
  { id: 6, name: 'Quote' },
  { id: 7, name: 'Booking' },
];

export default function SellBrandsListPage() {
  const router = useRouter();
  const { categorySlug } = useParams();
  const [brands, setBrands] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBrands, setFilteredBrands] = useState([]);

  useEffect(() => {
    axiosInstance.get(`/public/sell-device/category/${categorySlug}/brands`)
      .then(res => {
        const brandsData = res.data.data || [];
        setBrands(brandsData);
        setFilteredBrands(brandsData);
        setCategoryName(res.data.category?.name || '');
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to load brands.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [categorySlug]);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query === '') {
      setFilteredBrands(brands);
    } else {
      setFilteredBrands(brands.filter(brand => brand.name.toLowerCase().includes(query)));
    }
  }, [searchQuery, brands]);

  const handleBrandSelect = (brandSlug) => {
    router.push(`/sell-devices/${categorySlug}/brands/${brandSlug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  const displayName = categoryName || categorySlug;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="px-6 md:px-12 py-3 bg-white border-b border-gray-100">
        <Breadcrumb />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Step Indicator (7 Steps) */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider overflow-x-auto py-2">
            {STEP_ITEMS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <span className={`flex items-center gap-1.5 whitespace-nowrap ${step.id === 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step.id === 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                    {step.id}
                  </span>
                  {step.name}
                </span>
                {idx < STEP_ITEMS.length - 1 && (
                  <div className="h-[2px] bg-gray-200 flex-1 min-w-[20px] mx-2"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Back and Page header */}
        <div className="space-y-6 mb-10">
          <button
            onClick={() => router.push(`/sell-devices/${categorySlug}`)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold transition text-sm cursor-pointer"
          >
            <Icon icon="lucide:chevron-left" />
            <span>Back to Sell Home</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black text-gray-900">
                Select Brand
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Choose your <span className="font-bold text-primary-600 capitalize">{displayName}</span> brand to find your model
              </p>
            </div>

            {/* Search Bar for Brands */}
            <div className="relative w-full max-w-sm">
              <div className="relative flex items-center bg-white rounded-2xl border border-gray-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 shadow-sm transition-all duration-200">
                <Icon icon="lucide:search" className="text-gray-400 ml-4 text-lg" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Brands..."
                  className="w-full py-3 pl-3 pr-4 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 mr-3 hover:bg-gray-100 rounded-full transition"
                  >
                    <Icon icon="lucide:x" className="text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredBrands.map((brand) => (
            <button
              key={brand._id}
              onClick={() => handleBrandSelect(brand.slug)}
              className="group bg-white rounded-2xl shadow-xs border border-gray-200/80 p-6 flex flex-col items-center justify-center hover:border-primary-500 hover:shadow-md transition duration-300 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center group-hover:scale-110 transition duration-300 overflow-hidden">
                {brand.logoUrl ? (
                  <img src={brand.logoUrl} alt={brand.name} className="w-12 h-12 object-contain" />
                ) : (
                  <Icon icon="lucide:smartphone" className="text-4xl text-gray-500" />
                )}
              </div>
              <span className="mt-4 font-bold text-gray-800 text-base">{brand.name}</span>
            </button>
          ))}
        </div>

        {filteredBrands.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Icon icon="lucide:search" className="text-gray-300 text-5xl mx-auto mb-4" />
            <p className="text-gray-500 font-bold">
              {searchQuery ? `No brands found matching "${searchQuery}"` : 'No brands available for this category yet.'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
