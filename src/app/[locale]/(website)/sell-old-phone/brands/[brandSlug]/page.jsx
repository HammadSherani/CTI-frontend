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

export default function SellBrandModelsPage() {
  const router = useRouter();
  const { brandSlug } = useParams();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredModels, setFilteredModels] = useState([]);

  useEffect(() => {
    axiosInstance.get(`/public/sell-device/brands/${brandSlug}/models`)
      .then(res => {
        const modelsData = res.data.data || [];
        setModels(modelsData);
        setFilteredModels(modelsData);
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to load models for this brand.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [brandSlug]);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query === '') {
      setFilteredModels(models);
    } else {
      setFilteredModels(models.filter(model => model.name.toLowerCase().includes(query)));
    }
  }, [searchQuery, models]);

  const handleModelClick = (modelSlug) => {
    router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

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
              key={model._id}
              onClick={() => handleModelClick(model.slug)}
              className="group bg-white rounded-2xl shadow-xs border border-gray-200/80 p-6 flex flex-col items-center justify-center hover:border-primary-500 hover:shadow-md transition duration-300 cursor-pointer animate-in fade-in"
            >
              <div className="relative w-24 h-24 flex items-center justify-center bg-gray-50 rounded-xl p-2 group-hover:scale-105 transition duration-300">
                {model.imageUrl ? (
                  <img
                    src={model.imageUrl}
                    alt={model.name}
                    className="object-contain max-h-full max-w-full"
                  />
                ) : (
                  <Icon icon="lucide:smartphone" className="text-4xl text-gray-400" />
                )}
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
