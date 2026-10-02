import { StoreButton } from '@/components/StoreButton';
import Image from 'next/image';
import React from 'react';

export default function AppDownloadBanner() {
  return (
    <div className=" flex items-end justify-center mb-10">
      <div className="w-full  max-w-7xl bg-gradient-to-br from-primary-500 to-primary-700  rounded-3xl overflow-hidden shadow-2xl">
        {/* <div className="w-full  max-w-7xl bg-gradient-to-r from-teal-400 to-teal-500
  rounded-3xl overflow-hidden shadow-xl"> */}

        <div className="flex flex-col lg:flex-row items-stretch justify-between px-8 lg:px-18">
          {/* Left Content */}
          <div className="flex-1 text-white py-8 lg:py-10 lg:pr-8 flex flex-col justify-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-3">
              Download  <span className='text-black block'>The App
              </span>
            </h1>
            <p className="text-sm lg:text-md mb-2 opacity-95 max-w-sm">
              Sell your old phone | Buy top-quality refurbished phones | Get your phone repaired
            </p>

            {/* App Store Buttons */}
            <div className="flex flex-wrap items-end gap-4 mt-6">
              <StoreButton
                img="foot3.png"
                title="App Store"
                subtitle="Download on the"
                href="/coming"
              />
              <StoreButton
                img="foot2.png"
                title="Google Play"
                subtitle="Get it on"
                href="/coming"
              />

            </div>
          </div>

          {/* Right Content - Person and Phones */}
          <div className="flex-1 relative flex items-end justify-center lg:justify-end pt-8">
            <Image
              src="/assets/home/26.png"
              alt="Person using mobile app"
              width={500}
              height={500}
              className='object-contain object-bottom w-full max-w-[360px] h-auto hover:scale-105 origin-bottom transition-transform duration-300'
            />
          </div>
        </div>
      </div>
    </div>
  );
}