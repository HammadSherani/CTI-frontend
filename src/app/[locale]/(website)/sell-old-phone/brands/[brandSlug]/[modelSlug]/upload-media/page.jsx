"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import Breadcrumb from '@/components/ui/Breadcrumb';

// ── Module-level store for actual File objects (sessionStorage can't hold them)
let _imageFiles = [];
let _videoFiles = [];

export const getSellMediaFiles = () => ({ imageFiles: _imageFiles, videoFiles: _videoFiles });
export const clearSellMediaFiles = () => { _imageFiles = []; _videoFiles = []; };

const STEP_ITEMS = [
  { id: 1, name: 'Brand' },
  { id: 2, name: 'Model' },
  { id: 3, name: 'Storage' },
  { id: 4, name: 'Condition' },
  { id: 5, name: 'Upload Media' },
  { id: 6, name: 'Quote' },
  { id: 7, name: 'Booking' },
];

export default function UploadMediaPage() {
  const router = useRouter();
  const { brandSlug, modelSlug } = useParams();
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [images, setImages] = useState([]);   // preview objects: { name, size, preview, file }
  const [videos, setVideos] = useState([]);   // preview objects: { name, size, file }
  const [errorMsg, setErrorMsg] = useState('');

  const modelName = modelSlug?.replace(/-/g, ' ');

  // Load from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('sell_device_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.brand === brandSlug && parsed.model === modelSlug) {
          setDeviceInfo(parsed);
          // Restore preview metadata (not File objects — those are in module store)
          if (parsed.mediaPreview) {
            setImages(parsed.mediaPreview.images || []);
            setVideos(parsed.mediaPreview.videos || []);
          }
        } else {
          router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}`);
        }
      } catch (e) {
        console.error(e);
        router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}`);
      }
    } else {
      router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}`);
    }
  }, [brandSlug, modelSlug, router]);

  const syncSession = (updatedImages, updatedVideos, currentDeviceInfo) => {
    if (!currentDeviceInfo) return;
    const updated = {
      ...currentDeviceInfo,
      mediaPreview: {
        images: updatedImages.map(i => ({ name: i.name, size: i.size })),
        videos: updatedVideos.map(v => ({ name: v.name, size: v.size })),
      },
      mediaCount: {
        images: updatedImages.length,
        videos: updatedVideos.length,
      }
    };
    sessionStorage.setItem('sell_device_info', JSON.stringify(updated));
    setDeviceInfo(updated);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setErrorMsg('');

    if (images.length + files.length > 10) {
      setErrorMsg('You can upload a maximum of 10 pictures.');
      return;
    }

    const newImages = files.map(file => ({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      preview: URL.createObjectURL(file),
      file,
    }));

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    // Store actual File objects in module-level store
    _imageFiles = updatedImages.map(i => i.file);
    syncSession(updatedImages, videos, deviceInfo);
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    setErrorMsg('');

    if (videos.length + files.length > 3) {
      setErrorMsg('You can upload a maximum of 3 videos.');
      return;
    }

    const newVideos = files.map(file => ({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      file,
    }));

    const updatedVideos = [...videos, ...newVideos];
    setVideos(updatedVideos);
    // Store actual File objects in module-level store
    _videoFiles = updatedVideos.map(v => v.file);
    syncSession(images, updatedVideos, deviceInfo);
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    _imageFiles = updatedImages.map(i => i.file);
    syncSession(updatedImages, videos, deviceInfo);
  };

  const removeVideo = (index) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    setVideos(updatedVideos);
    _videoFiles = updatedVideos.map(v => v.file);
    syncSession(images, updatedVideos, deviceInfo);
  };

  const handleNext = () => {
    router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}/quote`);
  };

  if (!deviceInfo) return null;

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
                    if (step.id === 3) router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}`);
                    if (step.id === 4) router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}/condition`);
                  }}
                  disabled={step.id > 5}
                  className={`flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                    step.id === 5 ? 'text-primary-600' : step.id < 5 ? 'text-primary-500 hover:text-primary-600' : 'text-gray-400'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step.id === 5 ? 'bg-primary-600 text-white' : step.id < 5 ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.id < 5 ? '✓' : step.id}
                  </span>
                  {step.name}
                </button>
                {idx < STEP_ITEMS.length - 1 && (
                  <div className={`h-[2px] flex-1 min-w-[20px] mx-2 transition-colors ${
                    step.id < 5 ? 'bg-primary-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Upload Media */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 md:p-8 space-y-8 animate-in fade-in duration-200">
              
              <div>
                <h3 className="text-2xl font-black text-gray-900">
                  Upload Device Media
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Upload images and videos of your mobile phone to verify its physical condition.
                </p>
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
                  <Icon icon="lucide:alert-circle" className="text-lg" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Upload Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Pictures Upload Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-gray-800 text-base">Pictures</span>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                      {images.length} / 10 Max
                    </span>
                  </div>

                  <label className="border-2 border-dashed border-gray-200 hover:border-primary-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-primary-50/10 group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      disabled={images.length >= 10}
                    />
                    <Icon icon="lucide:camera" className="text-gray-400 group-hover:text-primary-600 text-3xl mb-2 transition" />
                    <span className="text-sm font-bold text-gray-700">Upload Pictures</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</span>
                  </label>

                  {/* Images Preview list */}
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group">
                        <img src={img.preview} alt="Upload preview" className="object-cover w-full h-full" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                        >
                          <Icon icon="lucide:x" className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Videos Upload Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-gray-800 text-base">Videos</span>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                      {videos.length} / 3 Max
                    </span>
                  </div>

                  <label className="border-2 border-dashed border-gray-200 hover:border-primary-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-primary-50/10 group">
                    <input 
                      type="file" 
                      accept="video/*" 
                      multiple 
                      onChange={handleVideoUpload} 
                      className="hidden" 
                      disabled={videos.length >= 3}
                    />
                    <Icon icon="lucide:video" className="text-gray-400 group-hover:text-primary-600 text-3xl mb-2 transition" />
                    <span className="text-sm font-bold text-gray-700">Upload Videos</span>
                    <span className="text-xs text-gray-400 mt-1">MP4, MOV up to 30MB</span>
                  </label>

                  {/* Videos Preview list */}
                  <div className="space-y-2">
                    {videos.map((vid, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl relative group">
                        <Icon icon="lucide:video" className="text-primary-600 text-xl" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{vid.name}</p>
                          <p className="text-[10px] text-gray-400">{vid.size}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVideo(idx)}
                          className="bg-gray-200 hover:bg-red-500 hover:text-white text-gray-500 rounded-full p-1 transition"
                        >
                          <Icon icon="lucide:x" className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Next step button */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <button
                  onClick={() => router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}/condition`)}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition cursor-pointer flex items-center gap-2"
                >
                  <Icon icon="lucide:chevron-left" />
                  <span>Previous Step</span>
                </button>
                <button
                  onClick={handleNext}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3 px-8 rounded-2xl transition shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <span>Get Quote</span>
                  <Icon icon="lucide:arrow-right" />
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Selected Device Details */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <h4 className="font-black text-gray-900 text-lg">Mobile Details</h4>
              </div>

              {/* Details List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-semibold">Brand</span>
                  <span className="font-extrabold text-gray-800 capitalize">{brandSlug}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-semibold">Model</span>
                  <span className="font-extrabold text-gray-800 capitalize">{modelName}</span>
                </div>
                {deviceInfo.selectedVariants?.map((v, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-semibold">{v.key}</span>
                    <span className="font-extrabold text-gray-800">{v.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-50">
                  <span className="text-gray-400 font-semibold">Media Uploaded</span>
                  <span className="font-extrabold text-gray-800">{images.length} Pics, {videos.length} Vids</span>
                </div>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
                <Icon icon="lucide:shield-check" className="text-9xl" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:shield-check" className="text-2xl" />
                  <span className="font-extrabold text-sm uppercase tracking-wider">CTI Verified Sell</span>
                </div>
                <p className="text-xs text-primary-100 leading-relaxed font-semibold">
                  Get paid instantly at your doorstep. We guarantee 100% data security and professional device assessment through the CTI platform.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
