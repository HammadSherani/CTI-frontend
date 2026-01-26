"use client";
import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import Image from 'next/image';
import { useSelector } from 'react-redux';

// heroSlides will come from redux (state.home.heroSlides). It may be an array or a single object.

const textVariants = {
  hidden: { 
    opacity: 0, 
    y: 50 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: 'easeOut' 
    },
  },
};

const imageVariants = {
  hidden: { 
    opacity: 0, 
    y: 0 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: 'easeOut',
      delay: 0.2 
    },
  },
};

const Hero = ({ autoplayDelay = 4000, transitionSpeed = 600 }) => {  
  const [activeIndex, setActiveIndex] = useState(0);

  const { heroSlides } = useSelector((state) => state.home || {});

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (heroSlides === undefined) setLoading(true);
    else setLoading(false);
  }, [heroSlides]);

  const slides = React.useMemo(() => {
    if (!heroSlides) return [];
    if (Array.isArray(heroSlides)) return heroSlides.filter((s) => s.isActive !== false);
    return heroSlides.isActive === false ? [] : [heroSlides];
  }, [heroSlides]);

  return (
    <section className="relative h-[500px] max-w-7xl mx-auto py-7">
      {loading ? (
        <div className="h-[420px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
            <p className="text-gray-600">Loading slides...</p>
          </div>
        </div>
      ) : slides.length === 0 ? (
        <div className="h-[420px] flex items-center justify-center">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 w-24 h-24 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4m-5 4h18" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">No slides found</h3>
            <p className="text-gray-600">There are no active hero slides to display right now.</p>
          </div>
        </div>
      ) : (
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: autoplayDelay, disableOnInteraction: false }}
        speed={transitionSpeed}  // Fade speed in ms
        pagination={{
          clickable: true,
          renderBullet: (index, className) => `<span class="${className} custom-pagination-bullet"></span>`,
        }}
        loop
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="h-full overflow-hidden"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id || slide._id || index}>
            <div className="h-full flex flex-col md:flex-row items-center bg-primary-100/30 overflow-hidden rounded-3xl">

              <motion.div
                className="w-full md:w-1/2 px-4 md:px-10 py-8 md:py-0"
                variants={textVariants}
                initial="hidden"
                animate={activeIndex === index ? 'visible' : 'hidden'}
              >
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {slide.title || slide.label}
                </h1>
                <p className="text-gray-600 text-base md:text-lg mb-6">
                  {slide.description}
                </p>
                <button className="px-6 py-3 bg-primary-600 text-white rounded-lg">
                  Get Started
                </button>
              </motion.div>

              <motion.div
                className="w-full md:w-1/2 flex justify-center px-4 md:px-0 py-8 md:py-0"
                variants={imageVariants}
                initial="hidden"
                animate={activeIndex === index ? 'visible' : 'hidden'}
              >
                <Image
                  src={slide.image}
                  alt={slide.title || slide.label || 'hero image'}
                  width={1600}
                  height={900}
                  className="h-auto object-cover w-full"
                />
              </motion.div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      )}

      <style jsx>{`
       
      `}</style>
    </section>
  );
};

export default Hero;