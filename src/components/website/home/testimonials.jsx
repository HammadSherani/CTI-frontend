// components/Testimonials.jsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const testimonials = [
  {
    name: "Tarun Singh Verma",
    location: "New Delhi",
    image: "https://randomuser.me/api/portraits/men/44.jpg",
    text: "Sold off my phone very easily and got the payment on the spot. Best experience so far.",
  },
  {
    name: "Karan Sharma",
    location: "Delhi NCR",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "Well trained staff. Overall a positive experience in selling my phone at Cashify.",
  },
  {
    name: "Abhiyash",
    location: "New Delhi",
    image: "https://randomuser.me/api/portraits/men/68.jpg",
    text: "No complaints, sold my phone very easily here. Definitely worth a try.",
  },
  {
    name: "Vinit Kumar",
    location: "New Delhi",
    image: "https://randomuser.me/api/portraits/men/62.jpg",
    text: "Payment was very instant and the whole process was quick. Will recommend it.",
  },
  {
    name: "Vinit Kumar",
    location: "New Delhi",
    image: "https://randomuser.me/api/portraits/men/62.jpg",
    text: "Payment was very instant and the whole process was quick. Will recommend it.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 15, duration: 0.6 },
  },
};

function Testimonials() {
  return (
    <section className="relative py-20 md:py-24 bg-primary-400 overflow-hidden">
      <div className="absolute top-20 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className=" mb-12 md:mb-16"
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-6 leading-tight">
              Trusted by <span className="text-primary-900">169.65 Lac+</span> Happy Users and Major Brands since 2015
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col md:flex-row justify-center items-center gap-6 mb-16 md:mb-20"
          >
            {/* Current / Active */}
            <div className="flex items-center gap-3 bg-primary-300 p-4 md:w-[250px] w-full rounded-md">
              <div className="w-12 h-12 bg-primary-400 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-primary-900">₹</span>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-white">1272.75 Cr.</p>
                <p className="text-sm text-gray-300">Cash Given</p>
              </div>
            </div>

            {/* Normal */}
            <div className="flex items-center gap-3 bg-primary-300 p-4 md:w-[320px] w-full rounded-lg">
              <div className="w-12 h-12 bg-primary-400 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-white">188.5 Lac</p>
                <p className="text-sm text-gray-300">Gadgets Encashed</p>
              </div>
            </div>
          </motion.div>

        </div>


        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
            1280: { slidesPerView: 4, spaceBetween: 24 },
          }}
          loop={true}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            bulletClass: "swiper-custom-bullet",
            bulletActiveClass: "swiper-custom-bullet-active",
          }}
          navigation={true}
          className="!pb-10 md:!pb-12"
        >
          {testimonials.map((item, index) => (
            <SwiperSlide key={index}>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1 }}
                className="bg-teal-50/20 backdrop-blur-sm rounded-2xl p-6 border border-teal-200/30 h-full flex flex-col"
              >
                {/* Quote Icon */}
                <div className="flex-shrink-0 mb-4">
                  <svg className="w-8 h-8 text-primary-900 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>

                {/* Review Text */}
                <p className="text-white/90 mb-6 flex-grow text-sm leading-relaxed font-medium text-center">
                  "{item.text}"
                </p>

                {/* Author */}
                <div className="flex flex-col items-center gap-3 mt-auto">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary-400/50"
                  />
                  <div className="text-center">
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    <p className="text-primary-900 text-xs">{item.location}</p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Brands */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-wrap justify-center items-center gap-8 md:gap-12 pb-8"
        >
          <img src="/brands/vivo.png" alt="Vivo" className="h-8 grayscale hover:grayscale-0 transition-all" />
          <img src="/brands/samsung.png" alt="Samsung" className="h-8 grayscale hover:grayscale-0 transition-all" />
          <img src="/brands/apple.png" alt="Apple" className="h-8 grayscale hover:grayscale-0 transition-all" />
          <img src="/brands/realme.png" alt="Realme" className="h-8 grayscale hover:grayscale-0 transition-all" />
          <img src="/brands/oppo.png" alt="Oppo" className="h-8 grayscale hover:grayscale-0 transition-all" />
          <img src="/brands/mi.png" alt="Mi" className="h-8 grayscale hover:grayscale-0 transition-all" />
          <img src="/brands/vijay-sales.png" alt="Vijay Sales" className="h-8 grayscale hover:grayscale-0 transition-all" />
          <img src="/brands/reliance-digital.png" alt="Reliance Digital" className="h-8 grayscale hover:grayscale-0 transition-all" />
        </motion.div> */}
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        .swiper-custom-bullet {
          width: 10px;
          height: 10px;
          background: #d1d5db;
          opacity: 0.5;
          border-radius: 50%;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .swiper-custom-bullet-active {
          background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
          opacity: 1;
          width: 32px;
          border-radius: 6px;
        }

        .swiper-button-next,
        .swiper-button-prev {
          color: #d07f1b !important;
          background: rgba(255, 255, 255, 0.1);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }

        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 18px !important;
          font-weight: bold;
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
          color: white !important;
          box-shadow: 0 8px 20px rgba(13, 148, 136, 0.3);
          transform: scale(1.05);
        }
      `}</style>
    </section>
  );
}

export default Testimonials;