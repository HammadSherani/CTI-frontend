"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import Breadcrumb from '@/components/ui/Breadcrumb';

const STORAGE_OPTIONS = [
  { id: '4gb-64gb', value: '4 GB / 64 GB', description: 'Basic use and social apps', icon: 'lucide:database' },
  { id: '4gb-128gb', value: '4 GB / 128 GB', description: 'Standard daily multitasking', icon: 'lucide:database' },
  { id: '6gb-128gb', value: '6 GB / 128 GB', description: 'Recommended for standard users', icon: 'lucide:database' },
  { id: '8gb-128gb', value: '8 GB / 128 GB', description: 'Better performance & media storage', icon: 'lucide:database' },
  { id: '8gb-256gb', value: '8 GB / 256 GB', description: 'Excellent for photos, videos, and apps', icon: 'lucide:database' },
  { id: '12gb-256gb', value: '12 GB / 256 GB', description: 'Power user speed with high storage', icon: 'lucide:database' },
  { id: '12gb-512gb', value: '12 GB / 512 GB', description: 'Premium multitasking & extreme storage', icon: 'lucide:database' },
  { id: '16gb-1tb', value: '16 GB / 1 TB', description: 'Maximum performance and extreme storage', icon: 'lucide:database' },
];

const STEP_ITEMS = [
  { id: 1, name: 'Brand' },
  { id: 2, name: 'Model' },
  { id: 3, name: 'Storage' },
  { id: 4, name: 'Condition' },
  { id: 5, name: 'Upload Media' },
  { id: 6, name: 'Quote' },
  { id: 7, name: 'Booking' },
];

export default function SellStoragePage() {
  const router = useRouter();
  const { brandSlug, modelSlug } = useParams();
  const [selectedStorage, setSelectedStorage] = useState(null);

  const modelName = modelSlug?.replace(/-/g, ' ');

  // Initialize state from sessionStorage if exists
  useEffect(() => {
    const saved = sessionStorage.getItem('sell_device_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.brand === brandSlug && parsed.model === modelSlug) {
          setSelectedStorage(parsed.storage);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [brandSlug, modelSlug]);

  const handleStorageSelect = (storageVal) => {
    setSelectedStorage(storageVal);
    
    // Save to sessionStorage
    const info = {
      brand: brandSlug,
      model: modelSlug,
      storage: storageVal,
      answers: {},
      media: { pictures: [], videos: [] }
    };
    sessionStorage.setItem('sell_device_info', JSON.stringify(info));

    // Navigate to condition page
    router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}/condition`);
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
                  onClick={() => {
                    if (step.id === 1) router.push('/sell-old-phone/brands');
                    if (step.id === 2) router.push(`/sell-old-phone/brands/${brandSlug}`);
                  }}
                  disabled={step.id >= 3}
                  className={`flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                    step.id === 3 ? 'text-primary-600' : step.id < 3 ? 'text-primary-500 hover:text-primary-600' : 'text-gray-400'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step.id === 3 ? 'bg-primary-600 text-white' : step.id < 3 ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.id < 3 ? '✓' : step.id}
                  </span>
                  {step.name}
                </button>
                {idx < STEP_ITEMS.length - 1 && (
                  <div className={`h-[2px] flex-1 min-w-[20px] mx-2 transition-colors ${
                    step.id < 3 ? 'bg-primary-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/sell-old-phone/brands/${brandSlug}`)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold transition text-sm cursor-pointer"
          >
            <Icon icon="lucide:chevron-left" />
            <span>Back to Model Selection</span>
          </button>
        </div>

        {/* Step 3: Storage Selection View */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 capitalize">
              Select Storage Capacity
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Select the RAM & storage variant for your <span className="font-bold text-primary-600 uppercase">{modelName}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl">
            {STORAGE_OPTIONS.map((option) => {
              const isSelected = selectedStorage === option.value;
              return (
                <button
                  key={option.id}
                  onClick={() => handleStorageSelect(option.value)}
                  className={`group bg-white border rounded-3xl p-6 text-left transition-all duration-300 shadow-xs cursor-pointer flex items-center gap-4 ${
                    isSelected 
                      ? 'border-primary-500 ring-2 ring-primary-100 bg-primary-50/20' 
                      : 'border-gray-200/80 hover:border-primary-500 hover:shadow-md'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600'
                  }`}>
                    <Icon icon={option.icon} className="text-2xl" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-gray-800 text-lg">{option.value}</h4>
                    <p className="text-gray-400 text-xs mt-0.5">{option.description}</p>
                  </div>
                  {isSelected && (
                    <Icon icon="lucide:check" className="text-primary-600 text-xl font-bold ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
