'use client';
import { Icon } from '@iconify/react';

const TechnicianFinder = () => {
  return (
    <section className="w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 bg-[#FAF3D9] py-10 my-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left Side: Title and Subtitle */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-800">
              All Technicians
            </h1>
            <p className="mt-1 text-base text-gray-600">
              Find Your Desired professional and shop your favourite products
            </p>
          </div>

          {/* Right Side: Search Bar */}
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search your favorite product..."
              className="w-full py-3 pl-4 pr-12 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition-shadow"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Icon icon="mdi:magnify" className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnicianFinder;