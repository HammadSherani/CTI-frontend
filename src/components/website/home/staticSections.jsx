import React from 'react';
import Image from 'next/image';
import SectionTag from './sectoinTag';



export default function StaticSections() {
  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-4 py-12 lg:py-20 space-y-48">

      {/* ════════════════════════════════════
          SECTION 1 — Integrate Academy
      ════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">

        {/* Image — left */}
        <div className="relative flex ">
          {/* Subtle background blob */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl opacity-60 blur-2xl scale-90" />
          <Image
            src="/assets/home/academy.png"
            alt="Integrate Academy"
            width={520}
            height={380}
            className="relative z-10 w-full max-w-[520px] object-contain drop-shadow-xl"
            priority
          />
        </div>

        {/* Text — right */}
        <div className="flex flex-col gap-5">
          <SectionTag title="Hundreds of training courses!" />

          <h2 className="text-[32px] md:text-[40px] font-extrabold leading-tight tracking-tight">
            {/* <span className="bg-gradient-to-r from-[#993F00] via-[#FF6900] to-[#FF8C00] bg-clip-text text-transparent">
              Integrate Academy
            </span> */}
              <span className=" text-primary-600">
              Integrate Academy
            </span>
            <br />
            <span className="text-gray-900">is here for you!</span>
          </h2>

          <p className="text-gray-500 text-[14.5px] leading-relaxed max-w-[480px]">
            Hundreds of different types of training courses, enriched with AI-powered content, await you at Trendyol Academy! Easily access all the information you need, anytime and anywhere, and take your business to the next level with personalized experiences tailored to your needs.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            {/* Primary filled button */}
            <button className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-[13.5px] font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
              Review the trainings
            </button>

            {/* Ghost / text button with arrow */}
            <button className="flex items-center gap-2 text-[13.5px] font-semibold text-gray-800 hover:text-orange-500 transition-colors duration-200 group">
              <span className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-gray-800 group-hover:border-orange-500 transition-colors">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Promotional Video
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          SECTION 2 — Grow Your Business
      ════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">

        {/* Text — left */}
        <div className="flex flex-col gap-5 order-2 md:order-1">
          <div className="mt-3">  
          <SectionTag title="Our Business" />
          </div>
          <h2 className="text-[32px] md:text-[40px] font-extrabold leading-tight tracking-tight">
            <span className="text-gray-900">Grow Your Business With</span>
            <br />
            <span className="text-primary-600">
               Our Platform
            </span>
          </h2>

          <p className="text-gray-500 text-[14.5px] leading-relaxed max-w-[440px]">
            Join our trusted network as a verified repair technician or product seller and expand your reach to thousands of potential customers. We provide the tools, visibility, and support you need to scale your business faster and smarter.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            {/* Primary filled */}
            <button className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-[13.5px] font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
              Join as Repair Partner
            </button>

            {/* Outlined / ghost */}
            <button className="text-[13.5px] font-semibold text-gray-700 hover:text-orange-500 border border-gray-300 hover:border-orange-400 px-5 py-2.5 rounded-lg transition-all duration-200">
              Join as Seller
            </button>
          </div>
        </div>

        {/* Image — right */}
        <div className="relative flex justify-center order-1 md:order-2">
          {/* Warm background blob */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-amber-50 rounded-3xl opacity-70 blur-2xl scale-90" />
          <Image
            src="/assets/home/business.png"
            alt="Grow Your Business"
            width={520}
            height={380}
            className="relative z-10 w-full max-w-[520px] object-cover rounded-2xl shadow-2xl"
          />
        </div>
      </div>


 {/* ════════════════════════════════════
          SECTION 3 — Integrate Academy
      ════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">

        {/* Image — left */}
        <div className="relative flex ">
          {/* Subtle background blob */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl opacity-60 blur-2xl scale-90" />
          <Image
            src="/assets/home/trusted.png"
            alt="Integrate Academy"
            width={520}
            height={380}
            className="relative z-10 w-full max-w-[520px] object-contain drop-shadow-xl"
            priority
          />
        </div>

        {/* Text — right */}
        <div className="flex flex-col gap-5">
          <SectionTag title="Our Achievements" />

          <h2 className="text-[32px] md:text-[40px] font-extrabold leading-tight tracking-tight">
            {/* <span className="bg-gradient-to-r from-[#993F00] via-[#FF6900] to-[#FF8C00] bg-clip-text text-transparent">
              Integrate Academy
            </span> */}
              <span className=" text-gray-900">
           Trusted by Thousands
            </span>
            <br />
            <span className=" text-primary-600"> Across the Country</span>
          </h2>

          <p className="text-gray-500 text-[14.5px] leading-relaxed max-w-[480px]">
            Hundreds of different types of training courses, enriched with AI-powered content, await you at Trendyol Academy! Easily access all the information you need, anytime and anywhere, and take your business to the next level with personalized experiences tailored to your needs.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            {/* Primary filled button */}
          <div>
            <h1 className="text-3xl font-bold text-primary-600">150,000+</h1>
            <p className="text-gray-500 text-sm">Happy Customers</p>
          </div>
            <div>
            <h1 className="text-3xl font-bold text-primary-600">120,000+</h1>
            <p className="text-gray-500 text-sm">Devices Repaired</p>
          </div>
            <div>
            <h1 className="text-3xl font-bold text-primary-600">98%</h1>
            <p className="text-gray-500 text-sm">Customer Satisfaction</p>
          </div>
          </div>
        </div>
      </div>

    </div>
  );
}