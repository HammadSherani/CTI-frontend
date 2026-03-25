import React from 'react';

// Hero Skeleton
export const HeroSkeleton = () => {
  return (
    <section className="relative text-white overflow-hidden bg-[linear-gradient(87.19deg,rgba(247,151,87,0.92)_1.48%,#F64B00_92.88%)]">

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center animate-pulse">
          
          {/* Left skeleton */}
          <div className="space-y-6">
            <div className="w-44 h-8 bg-white/20 rounded-full"></div>

            <div className="space-y-3">
              <div className="h-12 w-3/4 bg-white/20 rounded"></div>
              <div className="h-12 w-2/3 bg-white/20 rounded"></div>
            </div>

            <div className="space-y-2">
              <div className="h-4 w-full bg-white/20 rounded"></div>
              <div className="h-4 w-5/6 bg-white/20 rounded"></div>
              <div className="h-4 w-4/6 bg-white/20 rounded"></div>
            </div>

            <div className="h-12 w-40 bg-white/20 rounded-lg"></div>
          </div>

          {/* Right skeleton image */}
          <div className="flex justify-center">
            <div className="w-[420px] h-[420px] bg-white/20 rounded-xl"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export const ServicesSkeleton = () => {
  return (
    <div className="py-16 bg-white animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 🔶 Quick Service Finder Skeleton */}
        <div className="bg-gray-100 rounded-2xl shadow-xl mb-16 p-6 md:p-8 space-y-6">

          {/* Tag */}
          <div className="flex justify-center">
            <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
          </div>

          {/* Heading */}
          <div className="space-y-3 text-center">
            <div className="h-8 w-64 mx-auto bg-gray-200 rounded"></div>
            <div className="h-4 w-96 mx-auto bg-gray-200 rounded"></div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-md">

            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 min-w-[120px] space-y-2">
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded-xl"></div>
              </div>
            ))}

            {/* Button */}
            <div className="w-32 h-10 bg-gray-300 rounded-xl"></div>
          </div>
        </div>

        {/* 🔶 Section Heading */}
        <div className="mb-12 space-y-3">
          <div className="h-5 w-28 bg-gray-200 rounded"></div>
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
        </div>

        {/* 🔶 Services Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-5 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">

              {/* Image */}
              <div className="h-34 md:h-22 bg-gray-200 flex items-center justify-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-300 rounded-md"></div>
              </div>

              {/* Text */}
              <div className="p-4 text-center">
                <div className="h-4 w-20 mx-auto bg-gray-200 rounded"></div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};



export const VideoSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
      <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gray-200 h-[300px] md:h-[450px]">

        {/* Overlay for play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
        </div>

        {/* Bottom info bar (optional) */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-300/50"></div>
      </div>
    </div>
  );
};

// Categories Skeleton
export const CategoriesSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="h-8 bg-gray-300 rounded w-48 mb-6 animate-pulse"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="w-full h-32 bg-gray-300 rounded-xl animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
};


// Repairman Skeleton
export const RepairmanSkeleton = ({ count = 4 }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-gray-300 rounded w-48 animate-pulse"></div>
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <div className="relative h-52 w-full bg-gray-200 animate-pulse">
              <div className="absolute -bottom-6 left-6 border-4 border-white rounded-full w-16 h-16 bg-gray-300"></div>
            </div>
            <div className="p-6 pt-8 space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <div className="flex-1 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-12 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Default export for convenience
const Skeletons = {
  HeroSkeleton,
  CategoriesSkeleton,
  ServicesSkeleton,
  RepairmanSkeleton
};

export default Skeletons;