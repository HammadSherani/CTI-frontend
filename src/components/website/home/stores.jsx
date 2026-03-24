"use client";

import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";

const storesData = [
  {
    id: 1,
    city: "Gurgaon",
    name: "Cti Mobile Phone Store",
    location: "Airia Mall Sec 68",
    address: "Ground Floor, Reach, AIRIA MALL, Badshahpur Sohna Rd Hwy, Sector...",
    link: "#",
  },
  {
    id: 2,
    city: "Gurgaon",
    name: "Cti Mobile Phone Store",
    location: "Airia Mall Sec 68",
    address: "Ground Floor, Reach, AIRIA MALL, Badshahpur Sohna Rd Hwy, Sector...",
    link: "#",
  },
  {
    id: 3,
    city: "Gurgaon",
    name: "Cti Mobile Phone Store",
    location: "Airia Mall Sec 68",
    address: "Ground Floor, Reach, AIRIA MALL, Badshahpur Sohna Rd Hwy, Sector...",
    link: "#",
  },
  {
    id: 4,
    city: "Gurgaon",
    name: "Cti Mobile Phone Store",
    location: "Airia Mall Sec 68",
    address: "Ground Floor, Reach, AIRIA MALL, Badshahpur Sohna Rd Hwy, Sector...",
    link: "#",
  },
  {
    id: 5,
    city: "Gurgaon",
    name: "Cti Mobile Phone Store",
    location: "Airia Mall Sec 68",
    address: "Ground Floor, Reach, AIRIA MALL, Badshahpur Sohna Rd Hwy, Sector...",
    link: "#",
  },
   {
    id: 6,
    city: "Gurgaon",
    name: "Cti Mobile Phone Store",
    location: "Airia Mall Sec 68",
    address: "Ground Floor, Reach, AIRIA MALL, Badshahpur Sohna Rd Hwy, Sector...",
    link: "#",
  },
  {
    id: 7,
    city: "Gurgaon",
    name: "Cti Mobile Phone Store",
    location: "Airia Mall Sec 68",
    address: "Ground Floor, Reach, AIRIA MALL, Badshahpur Sohna Rd Hwy, Sector...",
    link: "#",
  },
  // Add more stores as needed
];

export default function ExclusiveStores() {
  const [progress, setProgress] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const swiperRef = useRef(null);

  // Update progress bar
 useEffect(() => {
  if (!swiperInstance) return;

  const updateProgress = () => {
    const totalSlides = swiperInstance.slides.length - swiperInstance.loopedSlides * 2; // exclude duplicated slides
    const progressValue = ((swiperInstance.realIndex + 1) / totalSlides) * 100;
    setProgress(Math.min(progressValue, 100));
  };

  swiperInstance.on("slideChange", updateProgress);
  updateProgress(); // initial call

  return () => {
    swiperInstance.off("slideChange", updateProgress);
  };
}, [swiperInstance]);

  return (
    <section className="py-16 max-w-7xl mx-auto text-black">
            <div className="flex flex-col  gap-6 mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Our <span className="text-primary-500">Exclusive Stores</span>
            </h2>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 md:gap-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center">
                <Icon icon="mdi:map-marker" className="text-3xl text-white" />
              </div>
                  <div className="flex gap-2 justify-center items-center">
                <span className="text-2xl font-bold text-primary-500">200+</span>
                <span className="text-sm text-black tracking-wide">Experience Centres</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center">
                <Icon icon="mdi:star" className="text-3xl text-white" />
              </div>
              <div className="flex gap-2 justify-center items-center">
                <span className="text-2xl font-bold text-primary-500">4.5+</span>
                <span className="text-sm text-gray tracking-wide">Star Ratings</span>
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 bg-gray-100">
  
        {/* Pin Code Input */}
        <div className="mb-8 ">
          <div className="max-w-md pt-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Pin Code"
                className="w-full bg-white border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 hover:bg-primary-500 transition-colors w-11 h-11 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:arrow-right" className="text-2xl text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Swiper Slider */}
        <div className="relative">
           {/* Left / Right Buttons */}
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={() => swiperRef.current?.slidePrev()}
                    className="w-9 h-9 absolute top-1/2 -translate-y-1/2 -left-4 z-20 flex items-center justify-center rounded-lg bg-black text-white border border-gray-200 shadow-sm hover:bg-gray-800 hover:border-orange-300 transition-all"
                  >
                    <Icon icon="mdi:chevron-left" className="w-5 h-5 text-white" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next"
                    onClick={() => swiperRef.current?.slideNext()}
                    className="w-9 h-9 absolute top-1/2 -translate-y-1/2 -right-4 z-20 flex items-center justify-center rounded-lg bg-black text-white border border-gray-200 shadow-sm hover:bg-gray-800 hover:border-orange-300 transition-all"
                  >
                    <Icon icon="mdi:chevron-right" className="w-5 h-5 text-white" />
                  </button>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
  onSwiper={(swiper) => {
    setSwiperInstance(swiper);
    swiperRef.current = swiper; 
  }}            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            loop={true}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            className="stores-swiper"
          >
            {storesData.map((store) => (
              <SwiperSlide key={store.id}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white backdrop-blur-xl border border-white/10 rounded-3xl p-6 h-full flex flex-col hover:border-primary-500/50 transition-all duration-300"
                >
                  <div className="bg-black text-white text-xs font-medium px-4 py-1.5 rounded-full w-fit mb-4">
                    {store.city}
                  </div>

                  <h3 className="font-semibold text-lg leading-tight mb-1">
                    {store.name}
                  </h3>
                  <p className="text-primary-400 text-sm font-medium mb-3">
                    {store.location}
                  </p>

                  <p className="text-gray-400 text-sm leading-relaxed flex-1">
                    {store.address}
                  </p>

                  <a
                    href={store.link}
                    className="mt-6 inline-flex items-center gap-2 text-primary-500 hover:text-primary-400 font-medium text-sm transition-colors"
                  >
                    Read More
                    <Icon icon="mdi:arrow-right" />
                  </a>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Progress Bar */}
          <div className="mt-10 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}