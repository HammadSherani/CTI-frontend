import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import { useMultiLoading } from '../../../hooks/useMultiloading';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import handleError from '@/helper/handleError'

const customNavigationStyles = `
  .custom-swiper-button-next-top,
  .custom-swiper-button-prev-top {
    width: 38px;
    height: 38px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .custom-swiper-button-next-top:hover:not(.swiper-button-disabled),
  .custom-swiper-button-prev-top:hover:not(.swiper-button-disabled) {
    background: #e5e7eb;
    border-color: #d1d5db;
  }

  .custom-swiper-button-next-top svg,
  .custom-swiper-button-prev-top svg {
    color: #374151;
  }

  .swiper-button-disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const headingVariants = {
  hidden: { y: -30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

// Skeleton loader component
const RepairmanSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
    <div className="relative h-52 w-full bg-gray-200 animate-pulse">
      <div className="absolute -bottom-6 left-6 border-4 border-white rounded-full w-16 h-16 overflow-hidden bg-gray-300" />
    </div>
    <div className="p-6 pt-8">
      <div className="flex items-center justify-between mb-2">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse ml-auto" />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <div className="flex-1 h-10 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-12 h-10 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

function TopRepairman() {
  const swiperRef = useRef(null);
  
  // Get repairmen data from Redux store
  const { repairmans } = useSelector((state) => state.home);
  const { user } = useSelector((state) => state.auth);
  const { multiloading } = useMultiLoading();
  
  console.log('Repairmen from Redux:', repairmans);
  console.log('User from Redux:', user);

  const handlePrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  // Update button states
  useEffect(() => {
    const swiper = swiperRef.current?.swiper;
    if (swiper && !swiper.params.loop) {
      const updateButtons = () => {
        const prevBtn = document.querySelector('.custom-swiper-button-prev-top');
        const nextBtn = document.querySelector('.custom-swiper-button-next-top');
        if (prevBtn) prevBtn.classList.toggle('swiper-button-disabled', swiper.isBeginning);
        if (nextBtn) nextBtn.classList.toggle('swiper-button-disabled', swiper.isEnd);
      };
      swiper.on('slideChange', updateButtons);
      updateButtons();
      return () => swiper.off('slideChange', updateButtons);
    }
  }, [repairmans]); // Re-run when repairmen data changes

  const isLoading = multiloading?.repairmans;
  const repairmenList = repairmans || []; // Ensure we have an array

  return (
    <motion.div
      className='max-w-7xl mx-auto py-10 px-4'
      initial="visible"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <style>{customNavigationStyles}</style>

      <div className='flex justify-between items-center mb-4'>
        <motion.h2 
          className='text-2xl font-bold text-gray-800'
          variants={headingVariants}
          initial="visible"
        >
          Top Repairman
        </motion.h2>

        {!isLoading && repairmenList.length > 0 && (
          <div className='flex gap-3'>
            <motion.div 
              className='custom-swiper-button-prev-top'
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={handlePrev}
            >
              <svg 
                className='w-5 h-5' 
                fill='none' 
                stroke='currentColor' 
                viewBox='0 0 24 24'
                strokeWidth={2}
              >
                <path 
                  strokeLinecap='round' 
                  strokeLinejoin='round' 
                  d='M15 19l-7-7 7-7' 
                />
              </svg>
            </motion.div>
            <motion.div 
              className='custom-swiper-button-next-top'
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={handleNext}
            >
              <svg 
                className='w-5 h-5' 
                fill='none' 
                stroke='currentColor' 
                viewBox='0 0 24 24'
                strokeWidth={2}
              >
                <path 
                  strokeLinecap='round' 
                  strokeLinejoin='round' 
                  d='M9 5l7 7-7 7' 
                />
              </svg>
            </motion.div>
          </div>
        )}
      </div>

      <div className='relative'>
        <Swiper
          ref={swiperRef}
          modules={[Autoplay]}
          spaceBetween={20}
          slidesPerView={4}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          loop={repairmenList.length > 4} // Only loop if we have enough items
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 25,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 30,
            },
          }}
          className="mySwiper pb-12"
        >
          {isLoading ? (
            // Show skeleton loaders
            [1, 2, 3, 4].map((index) => (
              <SwiperSlide key={`skeleton-${index}`}>
                <RepairmanSkeleton />
              </SwiperSlide>
            ))
          ) : repairmenList.length > 0 ? (
            // Show actual data from Redux
            repairmenList.map((repairman) => (
              <SwiperSlide key={repairman._id}>
                <motion.div
                  className='bg-white rounded-2xl overflow-hidden transition-shadow transform hover:-translate-y-1 hover:shadow-xl border border-gray-100'
                  variants={cardVariants}
                >
                  <div className='relative h-52 w-full bg-gray-100'>
                    <img
                      src={repairman.repairmanProfile?.profilePhoto || repairman.profilePhoto || 'https://via.placeholder.com/400x400?text=No+Image'}
                      alt={repairman.repairmanProfile?.fullName || repairman.name}
                      className='w-full h-full object-cover'
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                      }}
                    />

                    {/* Rating badge - Using repairmanProfile.rating or default */}
                    <div className='absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 shadow'>
                      <svg className='w-4 h-4' viewBox='0 0 20 20' fill='currentColor'>
                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                      </svg>
                      <span className='text-sm font-medium'>
                        {repairman.repairmanProfile?.rating || '4.5'}
                      </span>
                    </div>

                    {/* Avatar overlapping image */}
                    <div className='absolute -bottom-6 left-6 border-4 border-white rounded-full w-16 h-16 overflow-hidden shadow-lg'>
                      <img 
                        src={repairman.repairmanProfile?.profilePhoto || repairman.profilePhoto || 'https://via.placeholder.com/100x100?text=Avatar'} 
                        alt={repairman.repairmanProfile?.fullName || repairman.name} 
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100x100?text=Avatar';
                        }}
                      />
                    </div>
                  </div>

                <div className='p-6 pt-8'>
  <div className='flex items-center justify-between mb-2'>
    <div>
      <h3 className='text-lg font-semibold text-gray-900'>
        {repairman.repairmanProfile?.fullName || repairman.name}
      </h3>
      <p className='text-sm text-primary-600 font-medium'>
        {repairman.repairmanProfile?.specializations?.[0] || 'Repairman'}
      </p>
    </div>
    <div className='text-right'>
      <p className='text-sm text-gray-500'>
        {repairman.repairmanProfile?.totalJobs || 0} jobs
      </p>
      <p className='text-xs text-gray-400'>
        {/* Fix: Check if city and state are objects or strings */}
        {typeof repairman.city === 'object' ? repairman.city?.name || '' : repairman.city || ''}
        {repairman.city && ', '}
        {typeof repairman.state === 'object' ? repairman.state?.name || '' : repairman.state || ''}
      </p>
    </div>
  </div>

  <div className='flex items-center gap-3 mt-4'>
    <button
      className='flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold py-2 rounded-full shadow-md hover:opacity-95 transition'
    >
      Book Now
    </button>
    <button className='w-12 h-12 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm hover:shadow-md'>
      <svg className='w-5 h-5 text-primary-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 4.26a2 2 0 001.85 0L20 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
      </svg>
    </button>
  </div>
</div>
                </motion.div>
              </SwiperSlide>
            ))
          ) : (
            // No data state
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No repairmen found in your area</p>
            </div>
          )}
        </Swiper>
      </div>
    </motion.div>
  );
}

export default TopRepairman;