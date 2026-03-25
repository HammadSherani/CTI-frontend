// components/Testimonials.jsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Marquee from "react-fast-marquee";

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 15, duration: 0.6 },
  },
};

const staticTestimonials = [
  {
    id: 1,
    customerName: "John Smith",
    reviewText: "Amazing service! Got my loan approved within 24 hours. The process was smooth and hassle-free. Highly recommended!",
    createdAt: "2024-03-15",
    isPublic: true,
    moderationStatus: "approved",
    customerAvatar: null
  },
  {
    id: 2,
    customerName: "Emily Johnson",
    reviewText: "Best financial decision I ever made. The team was very supportive and guided me through every step. Thank you!",
    createdAt: "2024-03-10",
    isPublic: true,
    moderationStatus: "approved",
    customerAvatar: null
  },
  {
    id: 3,
    customerName: "Michael Brown",
    reviewText: "Excellent customer support and quick disbursal. The interest rates are competitive and transparent. 5 stars!",
    createdAt: "2024-03-05",
    isPublic: true,
    moderationStatus: "approved",
    customerAvatar: null
  },
  {
    id: 4,
    customerName: "Sophia Williams",
    reviewText: "Very professional and trustworthy platform. They made the entire loan process simple and understandable.",
    createdAt: "2024-02-28",
    isPublic: true,
    moderationStatus: "approved",
    customerAvatar: null
  },
  {
    id: 5,
    customerName: "Daniel Wilson",
    reviewText: "Quick approval and minimal documentation. The team was very helpful throughout. Great experience!",
    createdAt: "2024-02-20",
    isPublic: true,
    moderationStatus: "approved",
    customerAvatar: null
  },
  {
    id: 6,
    customerName: "Olivia Martinez",
    reviewText: "Reliable and trustworthy service. Got my loan in no time. Will definitely recommend to friends and family.",
    createdAt: "2024-02-15",
    isPublic: true,
    moderationStatus: "approved",
    customerAvatar: null
  },
  {
    id: 7,
    customerName: "James Anderson",
    reviewText: "Outstanding service! The team went above and beyond to help me get the best loan terms possible.",
    createdAt: "2024-02-10",
    isPublic: true,
    moderationStatus: "approved",
    customerAvatar: null
  },
  {
    id: 8,
    customerName: "Isabella Thomas",
    reviewText: "Very satisfied with the service. Transparent process and no hidden charges. Highly recommended!",
    createdAt: "2024-02-05",
    isPublic: true,
    moderationStatus: "approved",
    customerAvatar: null
  }
];

function Testimonials() {
    const { reviews } = useSelector((state) => state.home || {});

    // Use static data if reviews is empty or undefined, otherwise use dynamic data
    const items = React.useMemo(() => {
      // For testing: Uncomment the line below to always use static data
      return staticTestimonials;
      
      // For production: Use dynamic data from Redux if available, otherwise fallback to static
      if (!reviews || (Array.isArray(reviews) && reviews.length === 0)) {
        console.log('Using static test data');
        return staticTestimonials;
      }
      
      const list = Array.isArray(reviews) ? reviews : [reviews];
      const filtered = list.filter((r) => r.isPublic !== false && (r.moderationStatus || '').toLowerCase() === 'approved');
      
      // If no approved reviews, fallback to static data
      if (filtered.length === 0) {
        console.log('No approved reviews found, using static test data');
        return staticTestimonials;
      }
      
      return filtered;
    }, [reviews]);

    console.log(items, 'visible reviews');
    
  return (
    <section className="relative  bg-gradient-to-r from-primary-400 to-primary-700 text-gray-900 overflow-hidden">
      <div className="absolute top-20 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl p-10 mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="mb-12 md:mb-16"
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
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 bg-white opacity-90 p-4 md:w-[250px] w-full rounded-md">
                <div className="w-12 h-12 bg-primary-400 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:account-group" className="text-3xl font-bold text-white"/>
                </div>
                <div>
                  <p className="text-2xl md:text-2xl font-bold text-primary-500">123.8 + Lac</p>
                  <p className="text-sm text-primary-500">Happy Customer</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white opacity-90 p-4 md:w-[250px] w-full rounded-md">
                <div className="w-12 h-12 bg-primary-400 rounded-full flex items-center justify-center">
                  <Icon icon="streamline-flex:credit-card-approved-remix" className="text-3xl font-bold text-white"/>
                </div>
                <div>
                  <p className="text-2xl md:text-2xl font-bold text-primary-500">185.8 + Lac</p>
                  <p className="text-sm text-primary-500">Loans Approved</p>
                </div>
              </div>    
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 bg-white opacity-90 p-4 md:w-[250px] w-full rounded-md">
                <div className="w-12 h-12 bg-primary-400 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:dollar" className="text-3xl font-bold text-white"/>
                </div>
                <div>
                  <p className="text-2xl md:text-2xl font-bold text-primary-500">93212.8 Cr</p>
                  <p className="text-sm text-primary-500">Cash Given</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white opacity-90 p-4 md:w-[250px] w-full rounded-md">
                <div className="w-12 h-12 bg-primary-400 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:award" className="text-3xl font-bold text-white"/>
                </div>
                <div>
                  <p className="text-2xl md:text-2xl font-bold text-primary-500">Since 2015</p>
                  <p className="text-sm text-primary-500">Years of Excellence</p>
                </div>
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
        >
          {items.map((item, index) => (
            <SwiperSlide key={item.id || index}>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1 }}
                className="bg-teal-50/20 backdrop-blur-sm rounded-2xl p-6 border border-teal-200/30 h-[300px] mb-8 flex flex-col"
              >
                           <div className="flex flex-row items-center gap-3 mt-auto">
                  {(() => {
                    const name = item.customerName || 'Customer Name';
                    const imageSrc = item.customerAvatar || item.avatar;
                    const fallback = name.charAt(0).toUpperCase() || 'C';

                    return imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={name||"name"}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary-400/50"
                      />
                    ) : (
                      <div className="w-12 h-12 text-primary-700 flex items-center justify-center rounded-full  bg-[#D9D9D9] font-semibold border-2 border-primary-400/50">
                        {fallback}
                      </div>
                    );
                  })()}
                  <div className="text-center">
                    <h4 className="font-bold capitalize text-white text-md">{item.customerName || 'Customer Name'}</h4>
                    {/* <p className="text-primary-900 text-xs">{new Date(item.createdAt || item.updatedAt || Date.now()).toLocaleDateString()}</p> */}
                  </div>
                </div>
               

                {/* Review Text */}
                <p className="text-white opacity-90  mt-3  flex-grow text-sm line-clamp-5 leading-relaxed font-medium text-left p-2">
                  {item.reviewText || item.text || ''}
                </p>
                 {/* Quote Icon */}
                <div className="flex flex-row justify-between items-center mt-4">
                  <svg className="w-8 h-8 text-primary-900" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>

<p className="text-primary-900 text-xs">{new Date(item.createdAt || item.updatedAt || Date.now()).toLocaleDateString()}</p>            
     
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Brands */}
 
      </div>
<div className="w-full p-8 bg-primary-600">
  <Marquee speed={40} gradient={false} pauseOnHover autoFill>
  <div className="flex items-center gap-24">
    
    {[
      "/assets/marque/image1.png",
      "/assets/marque/image2.png",
      "/assets/marque/image3.png",
      "/assets/marque/image4.png",
      "/assets/marque/image5.png",
      "/assets/marque/image6.png",
      "/assets/marque/image7.png",
    ].map((src, i) => (
      <div key={i} className="flex items-center justify-center h-12">
        <Image
          src={src}
          alt={`brand-${i}`}
          width={120} // fallback (required by Next)
          height={50}
          className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
        />
      </div>
    ))}

  </div>
</Marquee>
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
          color: #ffffff !important;
          // background: rgba(255, 255, 255, 0.1);
          background: linear-gradient(135deg, #d6811a 0%, #e08414 100%);
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
          background: linear-gradient(135deg, #d6811a 0%, #e08414 100%);
          color: white !important;
          box-shadow: 0 8px 20px rgba(204, 132, 16, 0.3);
          transform: scale(1.05);
        }
      `}</style>
    </section>
  );
}

export default Testimonials;