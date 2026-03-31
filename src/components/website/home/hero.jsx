"use client";

import React, { useState,useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useSelector } from "react-redux";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Icon } from "@iconify/react";
import { HeroSkeleton } from "../skeletons/home";
import { NavigationHeader } from "../Header";

const textVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: "easeOut", delay: 0.3 },
  },
};

const dotCircleVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 0.25,
    scale: 1,
    transition: { duration: 1.2, ease: "easeOut" },
  },
};


const Hero = () => {
  const { banners, loading } = useSelector((state) => state.home || {});

  const [activeIndex, setActiveIndex] = useState(0);

  // Filter only active banners
  const slides = Array.isArray(banners)
    ? banners.filter((b) => b.isActive !== false)
    : [];

    console.log("slides", slides);
  

if(loading){
  return (
            <HeroSkeleton />
  )
}
  return (
    <>
    {/* <div className="sticky top-[16%] z-50 left-0">
<NavigationHeader/>
    </div> */}
<section className="relative min-h-[300px]  text-white overflow-hidden z-10 bg-[linear-gradient(87.19deg,rgba(247,151,87,0.92)_1.48%,#F64B00_92.88%)]">      {/* Background decorative dots */}
    
      <div className="relative max-w-7xl mx-auto px-2 py- z-10 l4">
        {slides.length === 0 ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-white/20" />
              <div className="h-10 w-64 bg-white/20 rounded" />
              <h1>No Data found</h1>
              <div className="h-6 w-96 bg-white/20 rounded" />
            </div>
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            speed={800}
            pagination={{ clickable: true }}
            loop={slides.length > 1}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="h-full"
          >
            {slides.map((slide, idx) => (
              <SwiperSlide key={slide._id || slide.id || idx}>
                <div className="grid md:grid-cols-2 gap-12 items-center px-10 py-20  z-10">
                  {/* Left - Text Content */}
                  <motion.div
                    className="space-y-6 md:space-y-4"
                    variants={textVariants}
                    initial="hidden"
                    animate={activeIndex === idx ? "visible" : "hidden"}
                  >
                    {/* Small badge / highlight */}
                    <div className="inline-flex items-center gap-2 bg-[#181818] backdrop-blur-sm px-5 py-2 rounded-full text-sm font-medium">
                      <span className="w-3 h-3 bg-[#FF6900] rounded-full animate-pulse" />
                      {slide.label || "Hundreds of training courses!"}
                    </div>

                   <h1 className="text-5xl font-bold">
  <span className="text-black ">
    {slide.title?.split(" ").slice(0, 3).join(" ")}
  </span>{" "}
  {slide.title?.split(" ").slice(3).join(" ") || "Fast & Reliable Device Repairs"}
</h1>

                    <p className="text-md  md:text-lg text-orange-50/90 leading-relaxed max-w-xl">
                      {slide.description ||
                        "Hundreds of different types of training courses... take your business to the next level with personalized experiences tailored to your needs."}
                    </p>

                      <div className="pt-4">
                        <Link
                          href={slide.ctaLink || "/shop"}
                          className="inline-block px-10 py-4 bg-[#181818] text-white font-semibold rounded-xl hover:bg-gray-900 transition-colors shadow-lg hover:shadow-xl text-sm"
                        >
                          {slide.ctaText || "Shop Now"}
                        </Link>
                      </div>
                  </motion.div>

                  {/* Right - Image with frame effect */}
     <div className="relative flex items-center justify-center">

  {/* 🔴 Background Vector */}
  <motion.div
    className="absolute z-0"
    animate={{ scale: [1, 1.05, 1] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
  >
    <Image 
      src='/assets/home/line.png'
      width={500}
      height={500}
      alt="line"
      className="w-[260px] sm:w-[320px] md:w-[400px] lg:w-[480px] opacity-90"
    />
  </motion.div>

  {/* ✨ Ellipses (BEHIND IMAGE) */}
  <motion.div
    className="absolute z-10 flex items-center justify-center"
    animate={{ rotate: 360 }}
    transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
  >
    <div className="relative w-[260px] md:w-[360px] h-[260px] md:h-[360px]">

      <div className="absolute top-0 left-30">
        <Image src="/assets/home/ellipse1.png" width={60} height={60} alt="ellipse 1" />
      </div>

      <div className="absolute top-[35%] -left-[20%]">
        <Image src="/assets/home/ellipse2.png" width={70} height={60} alt="ellipse 2" />
      </div>

      <div className="absolute top-[45%] right-[0%]">
        <Image src="/assets/home/ellipse3.png" width={80} height={60} alt="ellipse 3" />
      </div>

    </div>
  </motion.div>

  {/* 🟠 MAIN IMAGE (TOP MOST) */}
  <motion.div
    className="relative z-20 flex justify-center items-center"
    animate={{ y: [0, -18, 0], scale: [1, 1.04, 1] }}
    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
  >
    <Image
      src={slide.image}
      alt="hero"
      width={600}
      height={600}
      className="w-[220px] md:w-[320px] lg:w-[360px] object-contain"
    />
  </motion.div>

</div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
    </>

  );
};

export default Hero;



  // components/Header.jsx



// "use client";
// import React, { useState } from 'react';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
// import { motion } from 'framer-motion';

// import 'swiper/css';
// import 'swiper/css/pagination';
// import 'swiper/css/effect-fade';
// import Image from 'next/image';
// import { useSelector } from 'react-redux';

// // heroSlides will come from redux (state.home.heroSlides). It may be an array or a single object.

// const textVariants = {
//   hidden: { 
//     opacity: 0, 
//     y: 50 
//   },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: { 
//       duration: 0.6, 
//       ease: 'easeOut' 
//     },
//   },
// };

// const imageVariants = {
//   hidden: { 
//     opacity: 0, 
//     y: 0 
//   },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: { 
//       duration: 0.8, 
//       ease: 'easeOut',
//       delay: 0.2 
//     },
//   },
// };

// const Hero = ({ autoplayDelay = 4000, transitionSpeed = 600 }) => {  
//   const [activeIndex, setActiveIndex] = useState(0);

//   const { heroSlides } = useSelector((state) => state.home || {});

//   const [loading, setLoading] = React.useState(true);

//   React.useEffect(() => {
//     if (heroSlides === undefined) setLoading(true);
//     else setLoading(false);
//   }, [heroSlides]);

//   const slides = React.useMemo(() => {
//     if (!heroSlides) return [];
//     if (Array.isArray(heroSlides)) return heroSlides.filter((s) => s.isActive !== false);
//     return heroSlides.isActive === false ? [] : [heroSlides];
//   }, [heroSlides]);

//   return (
//     <section className="relative h-[500px] max-w-7xl mx-auto py-7">
//       {loading ? (
//         <div className="h-[420px] flex items-center justify-center">
//           <div className="flex flex-col items-center gap-4">
//             <div className="w-12 h-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
//             <p className="text-gray-600">Loading slides...</p>
//           </div>
//         </div>
//       ) : slides.length === 0 ? (
//         <div className="h-[420px] flex items-center justify-center">
//           <div className="text-center">
//             <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 w-24 h-24 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4m-5 4h18" />
//             </svg>
//             <h3 className="text-xl font-semibold mb-2">No slides found</h3>
//             <p className="text-gray-600">There are no active hero slides to display right now.</p>
//           </div>
//         </div>
//       ) : (
//       <Swiper
//         modules={[Autoplay, Pagination, EffectFade]}
//         effect="fade"
//         fadeEffect={{ crossFade: true }}
//         autoplay={{ delay: autoplayDelay, disableOnInteraction: false }}
//         speed={transitionSpeed}  // Fade speed in ms
//         pagination={{
//           clickable: true,
//           renderBullet: (index, className) => `<span class="${className} custom-pagination-bullet"></span>`,
//         }}
//         loop
//         onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
//         className="h-full overflow-hidden"
//       >
//         {slides.map((slide, index) => (
//           <SwiperSlide key={slide.id || slide._id || index}>
//             <div className="h-full flex flex-col md:flex-row items-center bg-primary-100/30 overflow-hidden rounded-3xl">

//               <motion.div
//                 className="w-full md:w-1/2 px-4 md:px-10 py-8 md:py-0"
//                 variants={textVariants}
//                 initial="hidden"
//                 animate={activeIndex === index ? 'visible' : 'hidden'}
//               >
//                 <h1 className="text-3xl md:text-4xl font-bold mb-4">
//                   {slide.title || slide.label}
//                 </h1>
//                 <p className="text-gray-600 text-base md:text-lg mb-6">
//                   {slide.description}
//                 </p>
//                 <button className="px-6 py-3 bg-primary-600 text-white rounded-lg">
//                   Get Started
//                 </button>
//               </motion.div>

//               <motion.div
//                 className="w-full md:w-1/2 flex justify-center px-4 md:px-0 py-8 md:py-0"
//                 variants={imageVariants}
//                 initial="hidden"
//                 animate={activeIndex === index ? 'visible' : 'hidden'}
//               >
//                 <Image
//                   src={slide.image}
//                   alt={slide.title || slide.label || 'hero image'}
//                   width={1600}
//                   height={900}
//                   className="h-auto object-cover w-full"
//                 />
//               </motion.div>

//             </div>
//           </SwiperSlide>
//         ))}
//       </Swiper>
//       )}

//       <style jsx>{`
       
//       `}</style>
//     </section>
//   );
// };

// export default Hero;