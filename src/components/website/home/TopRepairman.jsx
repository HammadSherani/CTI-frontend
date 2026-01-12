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
                className='bg-white rounded-xl overflow-hidden transition-shadow duration-300 border border-gray-100'
                variants={cardVariants}
              >
                <div className='relative h-52 w-full object-contain p-2 '>
                  <motion.img
                    src={repairman.image}
                    alt={repairman.name}
                    className='w-full h-full rounded-md '
                    // whileHover={{ scale: 1.02 }}
                  />
                  <div className='absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1'>
                    <span>⭐</span>
                    <span>{repairman.rating}</span>
                  </div>
                </div>

                <div className='p-6'>
                  <motion.h3 
                    className='text-xl font-bold text-gray-800 mb-2'
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    {repairman.name}
                  </motion.h3>
                  
                  <motion.p 
                    className='text-primary-600 font-semibold mb-3'
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    {repairman.specialty}
                  </motion.p>

                  <motion.div 
                    className='flex items-center justify-between text-sm text-gray-600 mb-4'
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <span className='flex items-center gap-1'>
                      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                        <path d='M10 12a2 2 0 100-4 2 2 0 000 4z'/>
                        <path fillRule='evenodd' d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z' clipRule='evenodd'/>
                      </svg>
                      {repairman.reviews} reviews
                    </span>
                    <span className='flex items-center gap-1'>
                      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clipRule='evenodd'/>
                      </svg>
                      {repairman.experience}
                    </span>
                  </motion.div>

                  <motion.button 
                    className='w-full bg-primary-50 hover:bg-primary-100 text-primary-500 font-semibold py-3 rounded-full transition-colors duration-200' /* Changed to rounded-full */
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Book Now
                  </motion.button>
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