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
<section className="relative min-h-[250px]  mx-auto text-white overflow-hidden z-10 bg-[linear-gradient(87.19deg,rgba(247,151,87,0.92)_1.48%,#F64B00_92.88%)] xl:rounded-b-3xl">      {/* Background decorative dots */}
    
      <div className="relative max-w-7xl mx-auto pt-4 md:pt-6 px-4 md:px-8 z-10">
        {slides.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
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
                <div className="grid md:grid-cols-2 gap-8 px-6 md:px-10 pt-10 md:pt-12 z-10 h-full">
                  {/* Left - Text Content */}
                  <motion.div
                    className="space-y-5 md:space-y-4 flex flex-col justify-center pb-10 md:pb-12"
                    variants={textVariants}
                    initial="hidden"
                    animate={activeIndex === idx ? "visible" : "hidden"}
                  >
                    {/* Small badge / highlight */}
                    <div className="inline-flex items-center gap-2 bg-[#181818] backdrop-blur-sm px-5 py-2 rounded-full text-sm font-medium self-start">
                      <span className="w-3 h-3 bg-[#FF6900] rounded-full animate-pulse" />
                      {slide.label || "Hundreds of training courses!"}
                    </div>

                   <h1 className="text-3xl md:text-4xl font-bold">
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
     <div className="relative flex items-end justify-center self-end h-full w-full">

  {/* 🔴 Background Vector */}


  {/* ✨ Rotating Ellipses (BEHIND IMAGE) */}
  <div className="absolute inset-0 z-10 flex items-end justify-center pointer-events-none mb-4 md:mb-8">
    <motion.div
      className="relative w-[300px] h-[300px] md:w-[420px] md:h-[420px]"
      animate={{ rotate: 360 }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute -top-2 md:-top-6 left-1/2 -translate-x-1/2">
        <Image src="/assets/home/ellipse1.png" width={60} height={60} alt="ellipse 1" />
      </div>
      <div className="absolute top-1/2 -left-2 md:-left-6 -translate-y-1/2">
        <Image src="/assets/home/ellipse2.png" width={75} height={75} alt="ellipse 2" />
      </div>
      <div className="absolute bottom-4 right-0 md:-bottom-2 md:right-4">
        <Image src="/assets/home/ellipse3.png" width={85} height={85} alt="ellipse 3" />
      </div>
    </motion.div>
  </div>

  {/* 🟠 MAIN IMAGE (TOP MOST) */}
  <motion.div
    className="relative z-20 flex justify-center items-end pointer-events-none w-full"
    animate={{ y: [0, -15, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
  >
    <div className="w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] md:w-[480px] md:h-[560px] lg:w-[540px] lg:h-[540px] flex items-end justify-center relative -mb-10 md:-mb-12">
      <Image
        src={slide.image}
        alt="hero banner"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-contain object-bottom drop-shadow-2xl"
        priority={idx === 0}
      />
    </div>
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