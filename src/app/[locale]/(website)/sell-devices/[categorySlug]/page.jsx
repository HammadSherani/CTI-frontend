"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

export default function SellDevicesPage() {
  const router = useRouter();
  const rawParams = useParams();
  const categorySlug = rawParams?.categorySlug || 'phone';

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = React.useRef(null);

  const [categoryName, setCategoryName] = useState('');
  const [topBrands, setTopBrands] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setTopBrands([]);
    setAllModels([]);
    setCategoryName('');

    Promise.all([
      axiosInstance.get(`/public/sell-device/category/${categorySlug}/brands`),
      axiosInstance.get(`/public/sell-device/category/${categorySlug}/models`),
    ])
      .then(([brandsRes, modelsRes]) => {
        if (!brandsRes.data.success) {
          setNotFound(true);
          return;
        }
        const brandsData = (brandsRes.data.data || []).sort((a, b) => (b.totalModels || 0) - (a.totalModels || 0));
        setTopBrands(brandsData.slice(0, 6));
        setCategoryName(brandsRes.data.category?.name || '');
        setAllModels(modelsRes.data.data || []);
      })
      .catch(() => {
        setNotFound(true);
        toast.error('Failed to load data.');
      })
      .finally(() => setLoading(false));
  }, [categorySlug]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSuggestions([]); return; }
    const filtered = allModels
      .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 8);
    setSuggestions(filtered);
  }, [searchQuery, allModels]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModelClick = (brandSlug, modelSlug) => {
    router.push(`/sell-devices/${categorySlug}/brands/${brandSlug}/${modelSlug}`);
  };

  const displayName = categoryName || 'Device';

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <Icon icon="mdi:category-plus-outline" className="w-20 h-20 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-800">Category Not Found</h1>
        <p className="text-gray-500">The category you are looking for does not exist or is inactive.</p>
        <button onClick={() => router.push('/sell-devices')} className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition">
          Back to Sell Devices
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="px-6 md:px-12 py-3 bg-white border-b border-gray-100">
        <Breadcrumb />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">

          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-primary-50 via-teal-50/50 to-white rounded-3xl p-8 md:p-12 shadow-sm border border-primary-100/60 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in duration-300">

            {/* Left Content */}
            <div className="flex-1 space-y-6 z-10">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                Sell Your <span className="text-primary-600">{displayName}</span> for Instant Cash
              </h1>

              <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full shadow-xs border border-primary-50">
                  <Icon icon="lucide:check-circle" className="text-primary-500 text-lg" />
                  <span>Maximum Value</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full shadow-xs border border-primary-50">
                  <Icon icon="lucide:shield-check" className="text-primary-500 text-lg" />
                  <span>Safe & Hassle-free</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full shadow-xs border border-primary-50">
                  <Icon icon="lucide:truck" className="text-primary-500 text-lg" />
                  <span>Free Doorstep Pickup</span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full max-w-xl" ref={searchContainerRef}>
                <div className="relative flex items-center bg-white rounded-2xl border border-gray-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 shadow-sm transition-all duration-200">
                  <Icon icon="lucide:search" className="text-gray-400 ml-4 text-xl" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder={`Search your ${displayName} to sell`}
                    className="w-full py-4 pl-3 pr-4 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none text-base"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-1 mr-3 hover:bg-gray-100 rounded-full transition">
                      <Icon icon="lucide:x" className="text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Suggestions */}
                {isSearchFocused && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-gray-50">
                    {suggestions.map((model) => (
                      <button
                        key={model._id}
                        onClick={() => handleModelClick(model.brandSlug, model.slug)}
                        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-primary-50/50 transition text-left group"
                      >
                        <div className="relative w-10 h-10 p-1 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                          <img
                            src={model.imageUrl || '/fallback-model.png'}
                            alt={model.name}
                            className="object-contain w-full h-full"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm group-hover:text-primary-700 transition">{model.name}</p>
                          <p className="text-xs text-gray-400 capitalize">Brand: {model.brandName || model.brandSlug}</p>
                        </div>
                        <Icon icon="lucide:arrow-right" className="ml-auto text-gray-300 group-hover:text-primary-600 transition" />
                      </button>
                    ))}
                  </div>
                )}

                {isSearchFocused && searchQuery && suggestions.length === 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-xl z-50 text-center">
                    <p className="text-gray-500 font-medium">No devices found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>

              {/* Brand Selection */}
              {topBrands.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="h-[1px] bg-gray-200 flex-1" />
                    <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">Or choose a brand</span>
                    <div className="h-[1px] bg-gray-200 flex-1" />
                  </div>

                  <div className="flex flex-wrap gap-4 items-center">
                    {topBrands.map((brand) => (
                      <button
                        key={brand._id}
                        onClick={() => router.push(`/sell-devices/${categorySlug}/brands/${brand.slug}`)}
                        className="bg-white hover:bg-gray-50 hover:border-primary-500 hover:shadow-md cursor-pointer border border-gray-100 rounded-2xl px-6 py-4 flex items-center gap-3 font-semibold text-gray-700 transition duration-200"
                      >
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} alt={brand.name} className="w-6 h-6 object-contain" />
                        ) : (
                          <Icon icon="lucide:smartphone" className="text-2xl text-gray-400" />
                        )}
                        <span>{brand.name}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => router.push(`/sell-devices/${categorySlug}/brands`)}
                      className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1.5 transition text-sm ml-2 group cursor-pointer"
                    >
                      <span>More Brands</span>
                      <Icon icon="lucide:arrow-right" className="group-hover:translate-x-1 transition duration-200" />
                    </button>
                  </div>
                </div>
              )}

              {topBrands.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 text-gray-500 text-sm">
                  No brands available for this category yet.
                </div>
              )}
            </div>

            {/* Hero Illustration */}
            <div className="relative w-80 h-80 z-0 hidden md:block">
              <img
                src="/assets/home/sell.avif"
                alt={`Sell ${displayName} Hero illustration`}
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-8 py-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-4 hover:shadow-lg transition duration-300">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto text-primary-600">
                  <Icon icon="lucide:dollar-sign" className="text-3xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">1. Check Price</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Select your device & tell us about its current condition. Our smart system will tailor make the perfect price for you.
                </p>
              </div>
              <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-4 hover:shadow-lg transition duration-300">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto text-primary-600">
                  <Icon icon="lucide:calendar" className="text-3xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">2. Schedule Pickup</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Book a free pickup from your home or work at a time slot that best suits your convenience.
                </p>
              </div>
              <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-4 hover:shadow-lg transition duration-300">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto text-primary-600">
                  <Icon icon="lucide:wallet" className="text-3xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">3. Get Paid</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Receive your payment instantly as soon as our executive picks up your device. Instant payment all the way!
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
