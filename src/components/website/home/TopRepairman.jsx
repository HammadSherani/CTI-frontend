import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

const customNavigationStyles = `
  .custom-swiper-button-next-top,
  .custom-swiper-button-prev-top {
    width: 38px;
    height: 38px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 50%; /* Fully rounded (circular) */
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

const buttonVariants = {
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.98,
  },
};

function TopRepairman() {
  const swiperRef = useRef(null);

  // Sample repairman data
  const repairmen = [
    {
      id: 1,
      name: 'John Smith',
      specialty: 'Plumbing',
      rating: 4.9,
      reviews: 152,
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
      experience: '10+ years'
    },
    {
      id: 2,
      name: 'Mike Johnson',
      specialty: 'Electrical',
      rating: 4.8,
      reviews: 134,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      experience: '8+ years'
    },
    {
      id: 3,
      name: 'David Brown',
      specialty: 'HVAC',
      rating: 4.9,
      reviews: 167,
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
      experience: '12+ years'
    },
    {
      id: 4,
      name: 'James Wilson',
      specialty: 'Carpentry',
      rating: 4.7,
      reviews: 98,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      experience: '9+ years'
    },
    {
      id: 5,
      name: 'Robert Davis',
      specialty: 'Appliance Repair',
      rating: 4.8,
      reviews: 145,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      experience: '11+ years'
    },
    {
      id: 6,
      name: 'Michael Lee',
      specialty: 'General Handyman',
      rating: 4.9,
      reviews: 189,
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
      experience: '15+ years'
    }
  ];

  const handlePrev = () => {
    console.log('Prev button clicked'); // Debug log
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    console.log('Next button clicked'); // Debug log
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  // Optional: Update button states (safe version for loop=true)
  useEffect(() => {
    const swiper = swiperRef.current?.swiper;
    if (swiper && !swiper.params.loop) { // Only if not loop
      const updateButtons = () => {
        const prevBtn = document.querySelector('.custom-swiper-button-prev-top');
        const nextBtn = document.querySelector('.custom-swiper-button-next-top');
        if (prevBtn) prevBtn.classList.toggle('swiper-button-disabled', swiper.isBeginning);
        if (nextBtn) nextBtn.classList.toggle('swiper-button-disabled', swiper.isEnd);
      };
      swiper.on('slideChange', updateButtons);
      updateButtons();
      return () => swiper.off('slideChange', updateButtons); // Cleanup
    }
  }, []);

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
         
          loop={true}
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
          {repairmen.map((repairman) => (
            <SwiperSlide key={repairman.id}>
              <motion.div
                className='bg-white rounded-2xl overflow-hidden transition-shadow transform hover:-translate-y-1 hover:shadow-xl border border-gray-100'
                variants={cardVariants}
              >
                <div className='relative h-52 w-full bg-gray-100'>
                  <img
                    src={repairman.image}
                    alt={repairman.name}
                    className='w-full h-full object-cover'
                  />

                  {/* Rating badge */}
                  <div className='absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 shadow'>
                    <svg className='w-4 h-4' viewBox='0 0 20 20' fill='currentColor'>
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                    <span className='text-sm font-medium'>{repairman.rating}</span>
                  </div>

                  {/* Avatar overlapping image */}
                  <div className='absolute -bottom-6 left-6 border-4 border-white rounded-full w-16 h-16 overflow-hidden shadow-lg'>
                    <img src={repairman.image} alt={repairman.name} className='w-full h-full object-cover' />
                  </div>
                </div>

                <div className='p-6 pt-8'>
                  <div className='flex items-center justify-between mb-2'>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900'>{repairman.name}</h3>
                      <p className='text-sm text-primary-600 font-medium'>{repairman.specialty}</p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm text-gray-500'>{repairman.reviews} reviews</p>
                      <p className='text-xs text-gray-400'>{repairman.experience}</p>
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
          ))}
        </Swiper>
      </div>
    </motion.div>
  );
}

export default TopRepairman;