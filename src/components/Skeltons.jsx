export const JobCardSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl p-6 animate-pulse space-y-4">
      
      <div className="flex justify-between">
        <div className="h-5 w-32 bg-gray-200 rounded"></div>
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </div>

      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-40 bg-gray-200 rounded"></div>
      </div>

      <div className="h-4 w-full bg-gray-200 rounded"></div>
      <div className="h-4 w-5/6 bg-gray-200 rounded"></div>

      <div className="flex gap-2">
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
      </div>

      <div className="h-10 w-full bg-gray-200 rounded-xl"></div>
    </div>
  );
};


export const SummaryCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
    <div className="flex justify-between items-center mb-3">
      <div className="w-10 h-10 bg-gray-200 rounded-xl" />
      <div className="w-8 h-6 bg-gray-200 rounded" />
    </div>
    <div className="w-20 h-4 bg-gray-200 rounded mb-2" />
    <div className="w-16 h-3 bg-gray-200 rounded" />
  </div>
);