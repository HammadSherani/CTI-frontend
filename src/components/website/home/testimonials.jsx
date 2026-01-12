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
    name: "Ayesha Khan",
    role: "Freelance Graphic Designer",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    text: "This is by far the best platform for Pakistani freelancers! Payments are always on time and the support team is super responsive.",
    verified: true,
    projectsCompleted: 47,
  },
  {
    name: "Hamza Malik",
    role: "Web Developer",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    text: "I've used many platforms over the last 4 years, but this one offers the best client satisfaction and payment security by far.",
    verified: true,
    projectsCompleted: 124,
  },
  {
    name: "Sana Ahmed",
    role: "Digital Marketing Expert",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 4,
    text: "The interface is very clean and sending proposals is really easy. Just needs a little improvement in the category system.",
    verified: true,
    projectsCompleted: 89,
  },
  {
    name: "Usman Tariq",
    role: "Mobile App Developer",
    image: "https://randomuser.me/api/portraits/men/62.jpg",
    rating: 5,
    text: "Got a 5-star rating from my very first project here. Clients are professional and payments get released quickly.",
    verified: true,
    projectsCompleted: 56,
  },
  {
    name: "Fatima Noor",
    role: "Content Writer",
    image: "https://randomuser.me/api/portraits/women/85.jpg",
    rating: 5,
    text: "Thank you so much! This platform has given a huge boost to my writing career. Really grateful!",
    verified: true,
    projectsCompleted: 203,
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
  hover: {
    y: -12,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

function Testimonials() {
  return (
    <section className="relative py-20 md:py-14 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 -left-40 w-80 h-80 bg-primary-100/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 -right-40 w-80 h-80 bg-primary-100/40 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 md:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 px-4 py-2 rounded-full mb-6"
          >
            <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span className="text-sm font-semibold text-primary-700">Trusted by 10,000+ professionals</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-5 leading-tight">
            Success Stories That{" "}
            <span className="bg-gradient-to-r from-primary-600 to-primary-600 bg-clip-text text-transparent">
              Inspire Us
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover how people fixed their mobile issues quickly by booking trusted repair services through our platform.
          </p>
        </motion.div>

        {/* Swiper */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={28}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 28 },
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
                whileHover="hover"
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.08 }}
                className="group relative bg-white rounded-3xl border border-gray-100 p-7 md:p-8 h-full flex flex-col transition-all duration-500"
              >
                {/* Quote Icon */}
                <div className="absolute top-7 right-7 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <svg className="w-16 h-16 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                {/* Stars & Verified Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < item.rating ? "text-amber-400" : "text-gray-200"
                        } transition-colors duration-300`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  {item.verified && (
                    <div className="flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium text-green-700">Verified</span>
                    </div>
                  )}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 mb-6 flex-grow text-base md:text-lg leading-relaxed">
                  "{item.text}"
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Projects</p>
                      <p className="text-sm font-bold text-gray-900">{item.projectsCompleted}+</p>
                    </div>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-50"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Bottom CTA
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-6 text-lg">Want to share your success story?</p>
          <button className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            Join Our Community
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
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
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          opacity: 1;
          width: 32px;
          border-radius: 6px;
        }

        .swiper-button-next,
        .swiper-button-prev {
          color: #4f46e5 !important;
          background: white;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 18px !important;
          font-weight: bold;
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: linear-gradient(135deg, #ef7d35ff 0%, #ed7c3aff 100%);
          color: white !important;
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
          transform: scale(1.05);
        }
      `}</style>
    </section>
  );
}

export default Testimonials;
