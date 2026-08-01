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

export default function SellVariantsPage() {
  const router = useRouter();
  const { categorySlug, brandSlug, modelSlug } = useParams();
  
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({});

  const modelName = modelSlug?.replace(/-/g, ' ');

  useEffect(() => {
    if (!brandSlug || !modelSlug) return;

    axiosInstance.get(`/public/sell-device/config/${brandSlug}/${modelSlug}`)
      .then(res => {
        const fetchedConfig = res.data.data;
        setConfig(fetchedConfig);
        
        const saved = sessionStorage.getItem('sell_device_info');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const decodeCompare = (a, b) => decodeURIComponent(a || '').toLowerCase() === decodeURIComponent(b || '').toLowerCase();
            if (decodeCompare(parsed.brand, brandSlug) && decodeCompare(parsed.model, modelSlug)) {
              if (parsed.selectedVariants) {
                const sv = {};
                parsed.selectedVariants.forEach(v => sv[v.key] = v.value);
                setSelectedVariants(sv);
                
                const answeredCount = Object.keys(sv).length;
                if (answeredCount < fetchedConfig.variants.length) {
                  setCurrentVariantIndex(answeredCount);
                } else {
                  setCurrentVariantIndex(fetchedConfig.variants.length - 1);
                }
              }
            } else {
              // Overwrite if brand/model mismatch
              sessionStorage.setItem('sell_device_info', JSON.stringify({
                brand: brandSlug,
                model: modelSlug,
                category: categorySlug,
                brandId: fetchedConfig.brand._id,
                modelId: fetchedConfig.model._id,
                categoryId: fetchedConfig.categoryId,
                selectedVariants: [],
                answers: {},
                media: { pictures: [], videos: [] }
              }));
            }
          } catch (e) {
            console.error(e);
          }
        } else {
          sessionStorage.setItem('sell_device_info', JSON.stringify({
            brand: brandSlug,
            model: modelSlug,
            category: categorySlug,
            brandId: fetchedConfig.brand._id,
            modelId: fetchedConfig.model._id,
            categoryId: fetchedConfig.categoryId,
            selectedVariants: [],
            answers: {},
            media: { pictures: [], videos: [] }
          }));
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to load device configuration.");
        router.push(`/sell-devices/${categorySlug}/brands/${brandSlug}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [brandSlug, modelSlug, categorySlug, router]);

  // If no variants exist for this product, skip immediately to condition
  useEffect(() => {
    if (!loading && config && config.variants.length === 0) {
      router.push(`/sell-devices/${categorySlug}/brands/${brandSlug}/${modelSlug}/condition`);
    }
  }, [loading, config, categorySlug, brandSlug, modelSlug, router]);

  const handleVariantSelect = (key, value) => {
    const updatedVariants = { ...selectedVariants, [key]: value };
    setSelectedVariants(updatedVariants);

    const saved = JSON.parse(sessionStorage.getItem('sell_device_info') || '{}');
    saved.selectedVariants = Object.keys(updatedVariants).map(k => ({ key: k, value: updatedVariants[k] }));
    sessionStorage.setItem('sell_device_info', JSON.stringify(saved));

    if (currentVariantIndex < config.variants.length - 1) {
      setCurrentVariantIndex(prev => prev + 1);
    } else {
      router.push(`/sell-devices/${categorySlug}/brands/${brandSlug}/${modelSlug}/condition`);
    }
  };

  const handleBack = () => {
    if (currentVariantIndex > 0) {
      setCurrentVariantIndex(prev => prev - 1);
    } else {
      router.push(`/sell-devices/${categorySlug}/brands/${brandSlug}`);
    }
  };

  if (loading || (config && config.variants.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!config) return null;

  const currentVariant = config.variants[currentVariantIndex];

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
                    if (step.id === 1) router.push(`/sell-devices/${categorySlug}/brands`);
                    if (step.id === 2) router.push(`/sell-devices/${categorySlug}/brands/${brandSlug}`);
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
            onClick={handleBack}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold transition text-sm cursor-pointer"
          >
            <Icon icon="lucide:chevron-left" />
            <span>{currentVariantIndex > 0 ? "Back to Previous Option" : "Back to Model Selection"}</span>
          </button>
        </div>

        {/* Dynamic Variant View */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 capitalize">
              Select {currentVariant.key}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Select the {currentVariant.key} variant for your <span className="font-bold text-primary-600 uppercase">{modelName}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl">
            {currentVariant.values.map((val, idx) => {
              const isSelected = selectedVariants[currentVariant.key] === val;
              return (
                <button
                  key={idx}
                  onClick={() => handleVariantSelect(currentVariant.key, val)}
                  className={`group bg-white border rounded-2xl p-3 text-left transition-all duration-200 shadow-xs cursor-pointer flex items-center gap-2.5 ${
                    isSelected 
                      ? 'border-primary-500 ring-2 ring-primary-50 bg-primary-50/10' 
                      : 'border-gray-200/80 hover:border-primary-500 hover:shadow-xs'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600'
                  }`}>
                    <Icon icon="lucide:check-circle" className="text-base" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-sm truncate">{val}</h4>
                  </div>
                  {isSelected && (
                    <Icon icon="lucide:check" className="text-primary-600 text-sm font-bold ml-auto flex-shrink-0" />
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
