"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import Breadcrumb from '@/components/ui/Breadcrumb';

const STEP_ITEMS = [
  { id: 1, name: 'Brand' },
  { id: 2, name: 'Model' },
  { id: 3, name: 'Storage' },
  { id: 4, name: 'Condition' },
  { id: 5, name: 'Upload Media' },
  { id: 6, name: 'Quote' },
  { id: 7, name: 'Booking' },
];

export default function QuotePage() {
  const router = useRouter();
  const { brandSlug, modelSlug } = useParams();
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    nameSurname: '',
    email: '',
    telephone: '',
    trIdNumber: '',
    address: '',
    iban: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const modelName = modelSlug?.replace(/-/g, ' ');

  // Load from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('sell_device_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.brand === brandSlug && parsed.model === modelSlug) {
          setDeviceInfo(parsed);
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

  const handleRestart = () => {
    sessionStorage.removeItem('sell_device_info');
    router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nameSurname.trim()) errors.nameSurname = 'Name & Surname is required';
    if (!formData.email.trim()) {
      errors.email = 'E-mail is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid e-mail';
    }
    if (!formData.telephone.trim()) errors.telephone = 'Telephone number is required';
    if (!formData.trIdNumber.trim()) {
      errors.trIdNumber = 'TR ID Number is required';
    } else if (formData.trIdNumber.trim().length !== 11) {
      errors.trIdNumber = 'TR ID Number must be exactly 11 digits';
    }
    if (!formData.address.trim()) errors.address = 'Address information is required';
    if (!formData.iban.trim()) {
      errors.iban = 'IBAN is required';
    } else if (!formData.iban.toUpperCase().startsWith('TR')) {
      errors.iban = 'IBAN must start with TR';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitted(true);
    }
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
            {STEP_ITEMS.map((step, idx) => {
              const isActive = isSubmitted ? step.id === 7 : step.id === 6;
              const isCompleted = step.id < (isSubmitted ? 7 : 6);
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => {
                      if (step.id === 1) router.push('/sell-old-phone/brands');
                      if (step.id === 2) router.push(`/sell-old-phone/brands/${brandSlug}`);
                      if (step.id === 3) router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}`);
                      if (step.id === 4) router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}/condition`);
                      if (step.id === 5) router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}/upload-media`);
                    }}
                    disabled={step.id > (isSubmitted ? 7 : 6)}
                    className={`flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                      isActive ? 'text-primary-600' : isCompleted ? 'text-primary-500 hover:text-primary-600' : 'text-gray-400'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      isActive ? 'bg-primary-600 text-white' : isCompleted ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? '✓' : step.id}
                    </span>
                    {step.name}
                  </button>
                  {idx < STEP_ITEMS.length - 1 && (
                    <div className={`h-[2px] flex-1 min-w-[20px] mx-2 transition-colors ${
                      isCompleted ? 'bg-primary-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Back Button */}
        {!isSubmitted && (
          <div className="mb-6">
            <button
              onClick={() => router.push(`/sell-old-phone/brands/${brandSlug}/${modelSlug}/upload-media`)}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold transition text-sm cursor-pointer"
            >
              <Icon icon="lucide:chevron-left" />
              <span>Back</span>
            </button>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Form OR Submission Confirmation */}
          <div className="lg:col-span-2 space-y-6">
            {!isSubmitted ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Complete Your Application</h3>
                  <p className="text-gray-500 text-sm mt-1">Please provide your details below. Our technicians will inspect your device details and get back to you with our customized quote.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Name surname */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-gray-700 block">Name Surname *</label>
                      <input 
                        type="text"
                        name="nameSurname"
                        value={formData.nameSurname}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition ${
                          formErrors.nameSurname ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                        }`}
                      />
                      {formErrors.nameSurname && <p className="text-red-500 text-xs font-bold">{formErrors.nameSurname}</p>}
                    </div>

                    {/* E-mail */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-gray-700 block">E-mail *</label>
                      <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="example@mail.com"
                        className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition ${
                          formErrors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                        }`}
                      />
                      {formErrors.email && <p className="text-red-500 text-xs font-bold">{formErrors.email}</p>}
                    </div>

                    {/* Telephone */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-gray-700 block">Telephone *</label>
                      <input 
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleInputChange}
                        placeholder="+90 500 000 0000"
                        className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition ${
                          formErrors.telephone ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                        }`}
                      />
                      {formErrors.telephone && <p className="text-red-500 text-xs font-bold">{formErrors.telephone}</p>}
                    </div>

                    {/* TR ID Number */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-gray-700 block">TR ID Number *</label>
                      <input 
                        type="text"
                        name="trIdNumber"
                        maxLength={11}
                        value={formData.trIdNumber}
                        onChange={handleInputChange}
                        placeholder="Your 11-digit TR ID number"
                        className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition ${
                          formErrors.trIdNumber ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                        }`}
                      />
                      {formErrors.trIdNumber && <p className="text-red-500 text-xs font-bold">{formErrors.trIdNumber}</p>}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-gray-700 block">Address *</label>
                    <textarea 
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your address information"
                      className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition resize-none ${
                        formErrors.address ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                      }`}
                    />
                    {formErrors.address && <p className="text-red-500 text-xs font-bold">{formErrors.address}</p>}
                  </div>

                  {/* IBAN */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-gray-700 block">IBAN (For payment) *</label>
                    <input 
                      type="text"
                      name="iban"
                      value={formData.iban}
                      onChange={handleInputChange}
                      placeholder="TR00 0000 0000 0000 0000 0000"
                      className={`w-full px-4 py-3 rounded-xl border bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 transition ${
                        formErrors.iban ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                      }`}
                    />
                    {formErrors.iban && <p className="text-red-500 text-xs font-bold">{formErrors.iban}</p>}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-4 px-6 rounded-2xl transition shadow-md hover:shadow-lg cursor-pointer text-base pt-3 pb-3 mt-4"
                  >
                    Complete Application
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-8 md:p-12 text-center space-y-6 animate-in zoom-in duration-300">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Icon icon="lucide:badge-check" className="text-5xl animate-pulse" />
                </div>

                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-gray-900">Application Submitted!</h3>
                  <p className="text-gray-600 text-base max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="font-extrabold text-primary-600">{formData.nameSurname}</span>. Your request has been successfully registered. We will notify you or email you our offer after our team verifies your device details and uploaded media.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      sessionStorage.removeItem('sell_device_info');
                      router.push('/sell-old-phone');
                    }}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3.5 px-8 rounded-2xl transition shadow-md cursor-pointer"
                  >
                    Go Back to Sell Home
                  </button>
                </div>
              </div>
            )}
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
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-semibold">Storage / RAM</span>
                  <span className="font-extrabold text-gray-800">{deviceInfo.storage}</span>
                </div>
                {deviceInfo.media && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-semibold">Media Uploaded</span>
                    <span className="font-extrabold text-gray-800">
                      {(deviceInfo.media.images?.length || 0)} Pics, {(deviceInfo.media.videos?.length || 0)} Vids
                    </span>
                  </div>
                )}
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
