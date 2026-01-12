'use client';
import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import image from '../../../../public/assets/blog/blog1.jpg';
import imageTwo from '../../../../public/assets/blog/blog2.jpg';
import Image from 'next/image';

const slides = [
  {
    title: 'Build Fast Web Apps',
    description: 'Responsive UI/UX that works perfectly on all devices. Responsive UI/UX that works perfectly on all devices. Responsive UI/UX that works perfectly on all devices.',
    image: image,
  },
  {
    title: 'Mobile Friendly Design',
    description: 'Responsive UI/UX that works perfectly on all devices. Responsive UI/UX that works perfectly on all devices. Responsive UI/UX that works perfectly on all devices.',
    image: imageTwo,
  },
  // {
  //   title: 'High Performance',
  //   description: 'Optimized code for speed, SEO, and best user experience.',
  //   image: 'https://www.freepik.com/free-photos-vectors/technician-banner',
  // },
];

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

  return (
    <section className="relative h-[500px] max-w-7xl mx-auto py-7">
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
          <SwiperSlide key={index}>
            <div className="h-full flex flex-col md:flex-row items-center bg-primary-100/30 overflow-hidden rounded-3xl">

              <motion.div
                className="w-full md:w-1/2 px-4 md:px-10 py-8 md:py-0"
                variants={textVariants}
                initial="hidden"
                animate={activeIndex === index ? 'visible' : 'hidden'}
              >
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {slide.title}
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
                  alt={slide.title}
                  width={5000}
                  height={5000}
                  className="h-auto object-cover w-full "
                />
              </motion.div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx>{`
       
      `}</style>
    </section>
  );
};

export default Hero;