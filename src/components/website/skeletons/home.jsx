import React from 'react';

// Hero Skeleton
export const HeroSkeleton = () => {
  return (
    <section className="relative h-[500px] max-w-7xl mx-auto py-7">
      <div className="h-full flex flex-col md:flex-row items-center bg-gray-100 overflow-hidden rounded-3xl animate-pulse">
        <div className="w-full md:w-1/2 px-4 md:px-10 py-8 md:py-0 space-y-4">
          <div className="h-12 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          <div className="h-12 bg-gray-300 rounded w-32 mt-6"></div>
        </div>
        <div className="w-full md:w-1/2 flex justify-center px-4 md:px-0 py-8 md:py-0">
          <div className="w-full h-[300px] bg-gray-300 rounded-2xl"></div>
        </div>
      </div>
    </section>
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

// Services Skeleton
export const ServicesSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="h-8 bg-gray-300 rounded w-48 mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4 p-6 border rounded-2xl">
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto"></div>
            <div className="h-5 bg-gray-300 rounded w-32 mx-auto"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
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