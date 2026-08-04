'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Icon } from '@iconify/react';

import 'swiper/css';
import 'swiper/css/navigation';

export default function RefurbishedReviewSection() {
  const reviews = [
    {
      id: 1,
      name: 'Akshay Rao',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&q=80',
      text: 'I got new phone.which has no scratches...I buy in superb condition and got brand new phone... charger is not orginal but it is authorised and so fast.... everything is good. Go for superb condition',
    },
    {
      id: 2,
      name: 'Abhijit Laskar',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80',
      text: "I wasn't sure before buying a used phone online. But I took the chance as they have return policy. Overwhelming my expectations, cashify delivered a really good mobile. It's been a month now and I am happy with the product.",
    },
    {
      id: 3,
      name: 'Roshan',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80',
      text: "Very good product I love it and prefer's you to buy phone's from cashify with full trust",
    },
    {
      id: 4,
      name: 'Farooq Sayyed',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&q=80',
      text: "Not a single point to consider it refurbished. It's new only. Everything is nice. Value for money.",
    },
  ];

  return (
    <div className="bg-[#121212] -mx-[12.5%] px-[12.5%] py-12 md:py-16 mt-12 mb-12 rounded-xl">
      {/* Title */}
      <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold text-center mb-10 leading-tight">
        10+ lakh Happy heroes of Earth trust us to buy refurbished phones
      </h2>

      {/* Swiper Slider Wrapper */}
      <div className="relative px-8 md:px-12">
        <Swiper
          modules={[Navigation]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={{
            prevEl: '.review-prev',
            nextEl: '.review-next',
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className="!pb-2"
        >
          {reviews.map((review) => (
            <SwiperSlide key={review.id} className="h-auto">
              <div className="bg-white rounded-xl p-6 flex flex-col justify-between h-full min-h-[300px] border border-gray-100 shadow-sm">
                <div>
                  {/* Teal Quote Icon */}
                  <div className="text-primary-600 leading-none mb-3">
                    <Icon icon="mdi:format-quote-open" className="text-5xl" />
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 text-[13px] md:text-sm leading-relaxed mb-6 font-medium">
                    {review.text}
                  </p>
                </div>

                {/* Profile Footer */}
                <div className="flex items-center gap-3 mt-auto">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={review.avatar}
                      alt={review.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-gray-900 text-sm font-bold">
                    {review.name}
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Circular Navigation Buttons */}
        <button
          className="review-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-150 flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Previous reviews"
        >
          <Icon icon="mdi:arrow-left" className="text-gray-800 text-xl" />
        </button>
        <button
          className="review-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-150 flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Next reviews"
        >
          <Icon icon="mdi:arrow-right" className="text-gray-800 text-xl" />
        </button>
      </div>
    </div>
  );
}
