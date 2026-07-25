"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import Breadcrumb from '@/components/ui/Breadcrumb';

const MOCK_MODELS = {
  apple: [
    { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', icon: '/fallback-model.png' },
    { id: 'iphone-15-pro', name: 'iPhone 15 Pro', slug: 'iphone-15-pro', icon: '/fallback-model.png' },
    { id: 'iphone-15', name: 'iPhone 15', slug: 'iphone-15', icon: '/fallback-model.png' },
    { id: 'iphone-14-pro-max', name: 'iPhone 14 Pro Max', slug: 'iphone-14-pro-max', icon: '/fallback-model.png' },
    { id: 'iphone-14-pro', name: 'iPhone 14 Pro', slug: 'iphone-14-pro', icon: '/fallback-model.png' },
    { id: 'iphone-13-pro-max', name: 'iPhone 13 Pro Max', slug: 'iphone-13-pro-max', icon: '/fallback-model.png' },
    { id: 'iphone-13', name: 'iPhone 13', slug: 'iphone-13', icon: '/fallback-model.png' },
    { id: 'iphone-12', name: 'iPhone 12', slug: 'iphone-12', icon: '/fallback-model.png' },
  ],
  xiaomi: [
    { id: 'redmi-note-6-pro', name: 'Xiaomi Redmi Note 6 Pro', slug: 'redmi-note-6-pro', icon: '/fallback-model.png' },
    { id: 'mi-a2', name: 'Xiaomi Mi A2', slug: 'mi-a2', icon: '/fallback-model.png' },
    { id: 'redmi-6', name: 'Xiaomi Redmi 6', slug: 'redmi-6', icon: '/fallback-model.png' },
    { id: 'redmi-6-pro', name: 'Xiaomi Redmi 6 Pro', slug: 'redmi-6-pro', icon: '/fallback-model.png' },
    { id: 'redmi-6a', name: 'Xiaomi Redmi 6A', slug: 'redmi-6a', icon: '/fallback-model.png' },
    { id: 'redmi-y2', name: 'Xiaomi Redmi Y2', slug: 'redmi-y2', icon: '/fallback-model.png' },
    { id: 'redmi-5', name: 'Xiaomi Redmi 5', slug: 'redmi-5', icon: '/fallback-model.png' },
    { id: 'redmi-note-5-pro', name: 'Xiaomi Redmi Note 5 Pro', slug: 'redmi-note-5-pro', icon: '/fallback-model.png' },
    { id: 'redmi-note-5', name: 'Xiaomi Redmi Note 5', slug: 'redmi-note-5', icon: '/fallback-model.png' },
    { id: 'redmi-5a', name: 'Xiaomi Redmi 5A', slug: 'redmi-5a', icon: '/fallback-model.png' },
    { id: 'redmi-y1', name: 'Xiaomi Redmi Y1', slug: 'redmi-y1', icon: '/fallback-model.png' },
    { id: 'redmi-y1-lite', name: 'Redmi Y1 Lite', slug: 'redmi-y1-lite', icon: '/fallback-model.png' },
    { id: 'mi-mix-2', name: 'Mi Mix 2', slug: 'mi-mix-2', icon: '/fallback-model.png' },
    { id: 'mi-max-2', name: 'Xiaomi Mi Max 2', slug: 'mi-max-2', icon: '/fallback-model.png' },
    { id: 'redmi-note-7', name: 'Xiaomi Redmi Note 7', slug: 'redmi-note-7', icon: '/fallback-model.png' },
    { id: 'redmi-note-7-pro', name: 'Xiaomi Redmi Note 7 Pro', slug: 'redmi-note-7-pro', icon: '/fallback-model.png' },
  ],
  samsung: [
    { id: 'galaxy-s24-ultra', name: 'Samsung Galaxy S24 Ultra', slug: 'galaxy-s24-ultra', icon: '/fallback-model.png' },
    { id: 'galaxy-s23-ultra', name: 'Samsung Galaxy S23 Ultra', slug: 'galaxy-s23-ultra', icon: '/fallback-model.png' },
    { id: 'galaxy-s22-ultra', name: 'Samsung Galaxy S22 Ultra', slug: 'galaxy-s22-ultra', icon: '/fallback-model.png' },
    { id: 'galaxy-a54', name: 'Samsung Galaxy A54 5G', slug: 'galaxy-a54', icon: '/fallback-model.png' },
    { id: 'galaxy-z-fold5', name: 'Samsung Galaxy Z Fold 5', slug: 'galaxy-z-fold5', icon: '/fallback-model.png' },
    { id: 'galaxy-z-flip5', name: 'Samsung Galaxy Z Flip 5', slug: 'galaxy-z-flip5', icon: '/fallback-model.png' },
  ],
  vivo: [
    { id: 'v29-pro', name: 'Vivo V29 Pro', slug: 'v29-pro', icon: '/fallback-model.png' },
    { id: 'v27-pro', name: 'Vivo V27 Pro', slug: 'v27-pro', icon: '/fallback-model.png' },
    { id: 'y200', name: 'Vivo Y200', slug: 'y200', icon: '/fallback-model.png' },
    { id: 't2-pro', name: 'Vivo T2 Pro', slug: 't2-pro', icon: '/fallback-model.png' },
    { id: 'x100-pro', name: 'Vivo X100 Pro', slug: 'x100-pro', icon: '/fallback-model.png' },
  ],
  oppo: [
    { id: 'reno11-pro', name: 'Oppo Reno11 Pro 5G', slug: 'reno11-pro', icon: '/fallback-model.png' },
    { id: 'reno10-pro', name: 'Oppo Reno10 Pro 5G', slug: 'reno10-pro', icon: '/fallback-model.png' },
    { id: 'f23', name: 'Oppo F23 5G', slug: 'f23', icon: '/fallback-model.png' },
    { id: 'find-n3-flip', name: 'Oppo Find N3 Flip', slug: 'find-n3-flip', icon: '/fallback-model.png' },
  ],
  oneplus: [
    { id: 'oneplus-12', name: 'OnePlus 12', slug: 'oneplus-12', icon: '/fallback-model.png' },
    { id: 'oneplus-12r', name: 'OnePlus 12R', slug: 'oneplus-12r', icon: '/fallback-model.png' },
    { id: 'oneplus-11', name: 'OnePlus 11', slug: 'oneplus-11', icon: '/fallback-model.png' },
    { id: 'oneplus-nord-ce-3-lite', name: 'OnePlus Nord CE 3 Lite', slug: 'oneplus-nord-ce-3-lite', icon: '/fallback-model.png' },
    { id: 'oneplus-open', name: 'OnePlus Open', slug: 'oneplus-open', icon: '/fallback-model.png' },
  ],
};

const STEP_ITEMS = [
  { id: 1, name: 'Brand' },
  { id: 2, name: 'Model' },
  { id: 3, name: 'Storage' },
  { id: 4, name: 'Condition' },
  { id: 5, name: 'Quote' },
  { id: 6, name: 'Verification' },
  { id: 7, name: 'Booking' },
];

export default function SellBrandModelsPage() {
  const router = useRouter();
  const { brandSlug } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredModels, setFilteredModels] = useState([]);

  const modelsList = MOCK_MODELS[brandSlug] || [];

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query === '') {
      setFilteredModels(modelsList);
    } else {
      setFilteredModels(modelsList.filter(model => model.name.toLowerCase().includes(query)));
    }
  }, [searchQuery, brandSlug]);

  const handleModelClick = (modelSlug) => {
    router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}`);
  };

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
                <button
                  onClick={() => step.id < 2 && router.push('/sell-old-phone/brands')}
                  disabled={step.id >= 2}
                  className={`flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    step.id === 2 ? 'text-primary-600' : step.id < 2 ? 'text-primary-500' : 'text-gray-400'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step.id === 2 ? 'bg-primary-600 text-white' : step.id < 2 ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.id < 2 ? '✓' : step.id}
                  </span>
                  {step.name}
                </button>
                {idx < STEP_ITEMS.length - 1 && (
                  <div className={`h-[2px] flex-1 min-w-[20px] mx-2 ${
                    step.id < 2 ? 'bg-primary-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Back Button and Header */}
        <div className="space-y-6 mb-10">
          <button
            onClick={() => router.push('/sell-old-phone/brands')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold transition text-sm cursor-pointer"
          >
            <Icon icon="lucide:chevron-left" />
            <span>Back to Brand Selection</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black text-gray-900 capitalize">
                Select Model
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Showing models for <span className="font-bold text-primary-600 capitalize">{brandSlug}</span>
              </p>
            </div>

            {/* Search Bar for Models */}
            <div className="relative w-full max-w-sm">
              <div className="relative flex items-center bg-white rounded-2xl border border-gray-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 shadow-sm transition-all duration-200">
                <Icon icon="lucide:search" className="text-gray-400 ml-4 text-lg" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Models..."
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

        {/* Models Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredModels.map((model) => (
            <button
              key={model.id}
              onClick={() => handleModelClick(model.slug)}
              className="group bg-white rounded-2xl shadow-xs border border-gray-200/80 p-6 flex flex-col items-center justify-center hover:border-primary-500 hover:shadow-md transition duration-300 cursor-pointer animate-in fade-in"
            >
              <div className="relative w-24 h-24 flex items-center justify-center bg-gray-50 rounded-xl p-2 group-hover:scale-105 transition duration-300">
                <Image
                  src={model.icon}
                  alt={model.name}
                  width={80}
                  height={80}
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/fallback-model.png";
                  }}
                />
              </div>
              <span className="mt-4 font-bold text-gray-800 text-sm text-center line-clamp-2 min-h-[2.5rem]">
                {model.name}
              </span>
            </button>
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Icon icon="lucide:smartphone" className="text-gray-300 text-5xl mx-auto mb-4" />
            <p className="text-gray-500 font-bold">No models found matching "{searchQuery}"</p>
          </div>
        )}

      </div>
    </div>
  );
}
