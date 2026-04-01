"use client";

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import SummaryCards from '@/components/SumamryCards';
 const reviews = Array(8).fill({
    id: "1",
    customerName: "Ali khan",
    timeAgo: "2 Days Ago",
    rating: 5,
    serviceType: "Screen Repair",
    reviewText:
      "Excellent service! My iPhone screen was shattered and they fixed it in under 30 minutes. The quality of the new screen is perfect, colors are vibrant and touch is responsive. Highly recommend CTI for any mobile repairs.",
    helpful: true,
  });
  const summaryData = [
  {
    label: "Total Reviews",
    value: 124,
    icon: "mdi:star-outline",
  },
  {
    label: "Overall Rating",
    value: 4.6,
    icon: "mdi:star-half-full",
  },
  {
    label: "Repeated Clients",
    value: 38,
    icon: "mdi:account-multiple-outline",
  },
  {
    label: "Response Rate",
    value: 86,
    icon: "mdi:chart-line",
  },
];
const EarningsReviewsPage = () => {
  const [reviewsFilter, setReviewsFilter] = useState('all');
const [showAllReviews, setShowAllReviews] = useState(false);
const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 4);
  const ratingDistribution = [
    { stars: 1, count: 72, percentage: 8 },
    { stars: 2, count: 30, percentage: 4 },
    { stars: 3, count: 12, percentage: 7 },
    { stars: 4, count: 36, percentage: 5 },
    { stars: 5, count: 54, percentage: 3 },
  ];

  

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Icon
          key={i}
          icon={i < rating ? "heroicons:star-solid" : "heroicons:star"}
          className={`w-5 h-5 ${i < rating ? "text-orange-500" : "text-gray-300"}`}
        />
      ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Track your client feedback and ratings
          </p>
        </div>
 
        <div className='mb-4'>
          <SummaryCards data={summaryData}/>
        </div>

        {/* Rating Distribution */}
      <div className="bg-white mt-10 rounded-3xl border border-gray-200 p-8 mb-12 shadow-sm">
  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
    Rating Distribution
  </h3>
  <p className="text-sm text-gray-500 mb-6">
    Breakdown of ratings from 20 verified customers
  </p>

  <div className="space-y-3 ">
    {ratingDistribution.map((item) => (
      <div key={item.stars} className="flex items-center justify-around gap-4">
        
        {/* Left: Stars - Fixed width to prevent shifting */}
        <div className="flex items-center justify-start  gap-2 ">
          <span className={`${item.stars === 1 ? 'ml-[1.5px]' : ''} text-sm text-center font-medium text-gray-700`}>
            {item.stars}
          </span>
          <Icon
            icon="heroicons:star-solid"
            className={` ${item.stars === 1 ? 'ml-[1.8px]' : ''}  w-4 h-4 text-yellow-400 `}
          />
        </div>

        {/* Progress Bar - Takes remaining space */}
        <div className="flex-1">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${item.percentage}%` }}
            />
          </div>
        </div>

        {/* Right: Count - Fixed width for alignment */}
        <div className="flex items-center justify-start ">
          <span className="text-sm font-medium text-gray-700">
            {item.count}
          </span>
          <span className="text-xs text-gray-400">
            ({item.percentage}%)
          </span>
        </div>
      </div>
    ))}
  </div>
</div>

        {/* Reviews Section */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-900">Recent Clinet Reviews</h3>
          <p className="text-gray-500 mb-8">  Showing {visibleReviews.length} of {reviews.length} reviews
</p>

          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {visibleReviews.map((review, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow transition-shadow"
              >
                <div className=" items-start gap-4">
                  <div className='flex gap-4 items-start justify-between'>

                  <div className="w-12 h-12 bg-gray-100 rounded-full flex-shrink-0 overflow-hidden">
                    <img
                      src="https://i.pravatar.cc/150?u=alikhan"
                      alt="Ali Khan"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{review.customerName}</p>
                        <p className="text-xs text-gray-500">{review.timeAgo}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                      <div className="flex justify-center items-end ">{renderStars(review.rating)}     
                    </div>
                        <div 
                        className="inline-flex items-center px-3 py-1 bg-gray-50 text-gray-900 border border-zinc-400 text-xs font-medium rounded-lg">
                      {review.serviceType}
                    </div>
                      </div>
                      
                    </div>

                
                  </div>
                  </div>

                    <p className="mt-4 text-gray-700 text-sm leading-relaxed">
                      {review.reviewText}
                    </p>

                    <div className="flex items-center justify-between gap-4 mt-6 text-sm">
                      <button className="flex items-center gap-1 text-gray-700 hover:text-gray-700 transition-colors">
                        <Icon icon="heroicons:hand-thumb-up" className="w-5 h-5" />
                        
                        Helpful
                      </button>
                      <button className="text-orange-600 underline cursor-pointer hover:text-orange-700 font-medium flex items-center gap-1">
                        Reply To Review
                        <Icon icon="heroicons:arrow-right" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
            ))}

          </div>
<div className="flex justify-center items-center mx-auto mt-10">
<button
  onClick={() => setShowAllReviews(!showAllReviews)}
  className="bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 py-2 px-4 rounded-lg"
>
  {showAllReviews ? "Show Less" : "View All Reviews"}
</button>
</div>

        </div>
      </div>
    </div>
  );
};

export default EarningsReviewsPage;