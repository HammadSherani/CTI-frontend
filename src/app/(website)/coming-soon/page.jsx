'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

// Separate component that uses useSearchParams
function ComingSoonContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';   
  const [showSearchMessage, setShowSearchMessage] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      setShowSearchMessage(true);
    }
  }, [query]);

  return (
    <div className="min-h-screen text-black overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(at_center,#14b8a6_0%,transparent_50%)] opacity-10"></div>
      <div className="absolute top-20 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center">
        
        {/* Logo */}
        <div className="mb-10">
          <Image 
            src="/assets/logo/logo.png" 
            alt="CTI Logo" 
            width={140} 
            height={60} 
            className="mx-auto object-contain" 
          />
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Something <span className="text-orange-500">Amazing</span> is Coming
        </h1>

        {/* Search Query Message */}
        {query.trim() && (
          <div className="mb-8 px-6 py-3 bg-orange-50 border border-orange-200 rounded-2xl max-w-md">
            <p className="text-orange-600 font-medium flex items-center gap-2 justify-center">
              <Icon icon="mdi:magnify" className="w-5 h-5" />
              Searching for: <span className="font-bold">"{query}"</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              We are working hard to bring you the best results soon...
            </p>
          </div>
        )}

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12">
          We are working hard to bring you the best platform to sell your old phones 
          and buy pre-owned gadgets with complete trust and ease.
        </p>

        {/* Email Subscription */}
        <div className="w-full max-w-md mx-auto mb-12">
          <p className="text-gray-400 mb-4">Be the first to know when we launch</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-zinc-900 border !text-white border-zinc-700 rounded-2xl px-6 py-4 focus:outline-none focus:border-orange-500 transition-colors placeholder-white"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white transition-all font-semibold px-10 py-4 rounded-2xl whitespace-nowrap">
              Notify Me
            </button>
          </div>
        </div>

        {/* Social Proof / Trust */}
        <div className="flex flex-wrap justify-center gap-8 text-gray-500">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:shield-check" className="text-2xl text-teal-400" />
            <span>Secure Transactions</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="mdi:truck-fast" className="text-2xl text-teal-400" />
            <span>Free Doorstep Pickup</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="mdi:cash-multiple" className="text-2xl text-teal-400" />
            <span>Instant Payment</span>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-20 text-xs text-gray-500">
          © 2026 CTI - Click To Integrate • All Rights Reserved
        </div>
      </div>

      {/* Bottom Floating Element */}
      <div className="absolute bottom-8 text-white left-1/2 -translate-x-1/2 flex gap-2">
        <div className="px-5 py-2 bg-zinc-900/80 backdrop-blur-md border border-zinc-700 rounded-full text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Launching Soon
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-teal-500">Loading...</div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ComingSoon() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ComingSoonContent />
    </Suspense>
  );
}