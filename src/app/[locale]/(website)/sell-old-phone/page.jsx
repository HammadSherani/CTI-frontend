"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import RefurbishedReviewSection from '@/components/website/refurbish/RefurbishedReviewSection';

export default function SellOldPhonePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  const [topBrands, setTopBrands] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch brands and models concurrently
    Promise.all([
      axiosInstance.get('/public/sell-device/brands/phone'),
      axiosInstance.get('/public/sell-device/models/all')
    ])
      .then(([brandsRes, modelsRes]) => {
        let brandsData = brandsRes.data.data || [];
        const modelsData = modelsRes.data.data || [];

        // Sort brands by totalModels descending and take top 6
        brandsData.sort((a, b) => (b.totalModels || 0) - (a.totalModels || 0));
        setTopBrands(brandsData.slice(0, 6));

        setAllModels(modelsData);
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to load initial data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSuggestions([]);
      return;
    }
    const filtered = allModels.filter(model =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8);
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
    router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="px-6 md:px-12 py-3 bg-white border-b border-gray-100">
        <Breadcrumb />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Main landing layout without step tracker */}
        <div className="space-y-12">

          {/* Hero Banner Grid */}
          <div className="bg-gradient-to-r from-primary-50 via-teal-50/50 to-white rounded-3xl p-8 md:p-12 shadow-sm border border-primary-100/60 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in duration-300">

            {/* Left Side Content */}
            <div className="flex-1 space-y-6 z-10">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                Sell Old Mobile Phone for <span className="text-primary-600">Instant Cash</span>
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

              {/* Autocomplete Search Bar */}
              <div className="relative w-full max-w-xl" ref={searchContainerRef}>
                <div className="relative flex items-center bg-white rounded-2xl border border-gray-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 shadow-sm transition-all duration-200">
                  <Icon icon="lucide:search" className="text-gray-400 ml-4 text-xl" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder="Search your Mobile Phone to sell"
                    className="w-full py-4 pl-3 pr-4 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none text-base"
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

                {/* Suggestions Dropdown */}
                {isSearchFocused && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-gray-50">
                    {suggestions.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleModelClick(model.brandSlug, model.slug)}
                        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-primary-50/50 transition text-left group"
                      >
                        <div className="relative w-10 h-10 p-1 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                          <Image
                            src={model.imageUrl || "/fallback-model.png"}
                            alt={model.name}
                            width={32}
                            height={32}
                            className="object-contain group-hover:scale-110 transition duration-200"
                            onError={(e) => {
                              e.currentTarget.src = "/fallback-model.png";
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm group-hover:text-primary-700 transition">
                            {model.name}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            Brand: {model.brandSlug}
                          </p>
                        </div>
                        <Icon icon="lucide:arrow-right" className="ml-auto text-gray-300 group-hover:text-primary-600 transition" />
                      </button>
                    ))}
                  </div>
                )}

                {isSearchFocused && searchQuery && suggestions.length === 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-xl z-50 text-center">
                    <p className="text-gray-500 font-medium">No phones found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>

              {/* Brand selection block */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-[1px] bg-gray-200 flex-1"></div>
                  <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">Or choose a brand</span>
                  <div className="h-[1px] bg-gray-200 flex-1"></div>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                  {topBrands.map((brand) => (
                    <button
                      key={brand._id}
                      onClick={() => router.push(`/sell-old-phone/brands/${brand.slug}`)}
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
                    onClick={() => router.push('/sell-old-phone/brands')}
                    className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1.5 transition text-sm ml-2 group cursor-pointer"
                  >
                    <span>More Brands</span>
                    <Icon icon="lucide:arrow-right" className="group-hover:translate-x-1 transition duration-200" />
                  </button>
                </div>
              </div>

            </div>

            {/* Hero Illustration */}
            <div className="relative w-80 h-80 z-0 hidden md:block">
              <Image
                src="/assets/home/sell.avif"
                alt="Sell Phone Hero illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-8 py-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 text-center">
              How It Works
            </h2>
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

          {/* Why Us Section */}
          <div className="space-y-10 py-10 border-t border-gray-100">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 text-center">Why Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10 max-w-5xl mx-auto px-4">
              {/* Item 1 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-primary-50/30 transition duration-300 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:scale-110 transition duration-300">
                  <Icon icon="lucide:tag" className="text-2xl" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-gray-800">Best Prices</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">Objective AI-based pricing</p>
                </div>
              </div>
              {/* Item 2 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-primary-50/30 transition duration-300 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:scale-110 transition duration-300">
                  <Icon icon="lucide:hand-coins" className="text-2xl" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-gray-800">Instant Payment</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Instant Money Transfer in your preferred mode at time of pick up or store drop off
                  </p>
                </div>
              </div>
              {/* Item 3 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-primary-50/30 transition duration-300 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:scale-110 transition duration-300">
                  <Icon icon="lucide:sparkles" className="text-2xl" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-gray-800">Simple & Convenient</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">Check price, schedule pickup & get paid</p>
                </div>
              </div>
              {/* Item 4 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-primary-50/30 transition duration-300 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:scale-110 transition duration-300">
                  <Icon icon="lucide:truck" className="text-2xl" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-gray-800">Free Doorstep Pickup</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">No fees for pickup across 1500 cities across India</p>
                </div>
              </div>
              {/* Item 5 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-primary-50/30 transition duration-300 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:scale-110 transition duration-300">
                  <Icon icon="lucide:shield-check" className="text-2xl" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-gray-800">Factory Grade Data Wipe</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">100% Safe and Data Security Guaranteed</p>
                </div>
              </div>
              {/* Item 6 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-primary-50/30 transition duration-300 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:scale-110 transition duration-300">
                  <Icon icon="lucide:receipt" className="text-2xl" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-gray-800">Valid Purchase Invoice</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">Genuine Bill of Sale</p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials Review Section */}
          <div className="pt-6 pb-10 border-t border-gray-100">
            <RefurbishedReviewSection />
          </div>

        </div>
      </div>
    </div>
  );
}
