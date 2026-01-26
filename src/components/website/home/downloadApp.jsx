import { StoreButton } from '@/components/StoreButton';
import Image from 'next/image';
import React from 'react';

export default function AppDownloadBanner() {
  return (
    <div className=" flex items-end justify-center mb-10">
      <div className="w-full  max-w-7xl bg-gradient-to-br from-primary-400 to-primary-500  rounded-3xl overflow-hidden shadow-2xl">
      {/* <div className="w-full  max-w-7xl bg-gradient-to-r from-teal-400 to-teal-500
  rounded-3xl overflow-hidden shadow-xl"> */}
     
        <div className="flex flex-col lg:flex-row items-center justify-between lg:px-10 ">
          {/* Left Content */}
          <div className="flex-1 text-white mb-8 lg:mb-0 lg:pr-8  flex flex-col">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-6">
              Download the App
            </h1>
            <p className="text-lg lg:text-xl mb-8 opacity-95">
              Sell your old phone | Buy top-quality refurbished phones | Get your phone repaired
            </p>
            
            {/* App Store Buttons */}
         <div className="flex flex-wrap items-end gap-3 mt-4">
      <StoreButton
        img="foot3.png" 
        title="App Store" 
        subtitle="Download on the" 
        href="#"
      />
      <StoreButton
        img="foot2.png" 
        title="Google Play" 
        subtitle="Get it on" 
        href="#"
      />
     
     </div>
          </div>
          
          {/* Right Content - Person and Phones */}
          <div className="flex-1 relative flex  items-end mt-10">
            {/* Person Image Placeholder */}
           <Image
           src="/assets/home/mobile-app.png"
           alt="Person using mobile app"
           width={500}
           height={500}
           className='object-contain'
           />            
          
          </div>
        </div>
      </div>
    </div>
  );
}