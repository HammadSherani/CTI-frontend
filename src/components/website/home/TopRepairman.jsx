"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import SectionTag from './sectoinTag';
import { useRouter } from "@/i18n/navigation";

import { toast } from 'react-toastify';
import { useChat } from '@/hooks/useChat';
import { addChat } from '@/store/chat';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';

export default function MeetOurProfessionals() {
  const swiperRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const { repairmans, loading } = useSelector((state) => state.home || {});
  const professionals = Array.isArray(repairmans) ? repairmans : [];

  // Memoized update function
  const updateProgress = useCallback((swiper) => {
    if (!swiper) return;
    const total = professionals.length || 1;
    const current = swiper.realIndex + 1;
    setCurrentIndex(current);
    setProgress((current / total) * 100);
  }, [professionals.length]);

  useEffect(() => {
    const swiper = swiperRef.current?.swiper;
    if (!swiper) return;

    const handleSlideChange = () => updateProgress(swiper);
    swiper.on('slideChange', handleSlideChange);
    handleSlideChange(); // Initial update

    return () => {
      swiper.off('slideChange', handleSlideChange);
    };
  }, [updateProgress]);

  const handlePrev = useCallback(() => {
    swiperRef.current?.swiper?.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    swiperRef.current?.swiper?.slideNext();
  }, []);

  const router = useRouter();

  const { user, token } = useSelector(state => state.auth || {});
  const dispatch = useDispatch();
  const { selectChat, openChat } = useChat();

  const handleChat = async (pro) => {
    if (!pro._id) return;

    if (!user) {
      toast.error("Please login to start a chat with the professional.");
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'customer') {
      toast.error("Only customers can start a chat with professionals.");
      return;
    }
    try {
      const { data } = await axiosInstance.post(
        `/chat/start`,
        { repairmanId: pro._id },
        { headers: { Authorization: "Bearer " + token } }
      );

      const profile = pro.repairmanProfile || pro;
      const fullName = profile.fullName || "Expert Technician";
      const imageSrc = profile.profilePhoto || '/placeholder-repairman.jpg';

      const newChat = {
        id: data?.chat._id,
        chatId: data?.chat._id,
        name: data?.chat?.user?.name || fullName,
        avatar: data?.chat?.user?.avatar || imageSrc,
        userId: data?.chat?.user?._id || pro._id,
        lastMessage: '',
        timestamp: new Date().toISOString(),
        online: false
      };

      dispatch(addChat(newChat));
      openChat();
      selectChat({
        id: data?.chat._id,
        name: data?.chat?.user?.name || fullName,
        avatar: data?.chat?.user?.avatar || imageSrc,
      });
    } catch (error) {
      handleError(error);
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <section className="py-20 bg-white text-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded mb-4" />
            <div className="h-12 w-96 bg-gray-200 rounded mb-16" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-[50vh] bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!professionals.length) {
    return (
      <section className="py-20 bg-white text-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 text-center">
          <SectionTag title="Our Specialists" />
          <h2 className="text-xl md:text-2xl font-bold mt-4 mb-6">
            Coming Soon
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Our team of verified professionals will be showcased here shortly.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="max-w-7xl mx-auto py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50 text-gray-900 overflow-hidden"
      aria-label="Meet our professionals section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 mb-12 lg:mb-16">
          <div className="lg:max-w-xl">
            <div className="">
              <SectionTag title="Our Specialists" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">
              Meet Our Verified{' '}
              <p className="text-primary-500 relative ">
                Professional
              </p>
            </h2>
          </div>
          <p className="max-w-lg text-gray-500 text-sm sm:text-base leading-relaxed lg:self-end">
            Our certified repair experts bring years of hands-on experience and consistently
            high customer satisfaction. Each professional is carefully vetted to ensure
            reliable, fast, and trustworthy service.
          </p>
        </div>

        {/* Slider Section */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Swiper
            ref={swiperRef}
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 1, spaceBetween: 20 },
              768: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 2, spaceBetween: 30 },
            }}
            loop={professionals.length > 1}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            speed={800}
            className="!overflow-visible"
          >
            {professionals.map((pro, idx) => {
              const profile = pro.repairmanProfile || pro;
              const fullName = profile.fullName || "Expert Technician";
              const specialization = profile.specialization || "Mobile Repair Services";
              const rawBio = profile.bio || "Specializes in corporate governance and commercial law, supporting clients through high-stakes decisions with precision, discretion, and a strong commitment to ethical practice.";
              const bio = rawBio.length > 150 ? rawBio.slice(0, 150) + '...' : rawBio;

              return (
                <SwiperSlide key={pro._id || idx}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="h-auto"
                  >
                    {/* Card Container */}
                    <div className="bg-white overflow-hidden  transition-all duration-300 flex flex-col sm:flex-row h-auto sm:h-[450px]
                     lg:h-[370px] group">

                      {/* Image Section - Responsive */}
                      <div className="relative w-full sm:w-[200px] md:w-[230px] lg:w-[260px] h-[250px] sm:h-full overflow-hidden">
                        <Image
                          src={profile.profilePhoto || '/placeholder-repairman.jpg'}
                          alt={fullName || "profile"}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 260px"
                          className="object-cover object-center group-hover:scale-105 rounded-lg transition-transform duration-500"
                          priority={idx < 2}
                        />
                        {/* Gradient Overlay for better text readability on mobile */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent sm:bg-none" />

                        {/* Mobile Name Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 sm:hidden">
                          <h3 className="text-white text-lg font-bold drop-shadow-lg">
                            {fullName}
                          </h3>
                          <p className="text-white/90 text-sm drop-shadow">
                            {specialization}
                          </p>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5 sm:p-6 flex flex-col flex-1">
                        {/* Desktop Name & Location */}
                        <div className="hidden sm:block mb-4">
                          <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight hover:text-primary-500 transition-colors">
                            {fullName}
                          </h3>
                          <p className="text-primary-500 text-sm md:text-base mt-1 font-medium">
                            {specialization}
                          </p>
                          {profile.city && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Icon icon="mdi:map-marker-outline" width={12} />
                              {profile.city.name || profile.city}
                            </p>
                          )}
                        </div>

                        {/* Divider - Hidden on mobile */}
                        <div className="hidden sm:block h-px bg-gray-200 mb-4" />

                        {/* Bio - Responsive */}
                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-4 md:line-clamp-5 mb-4">
                          {bio}
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-center text-gray-900 gap-3 mb-4">
                          <a
                            href="#"
                            className="text-gray-900 hover:text-primary-500 transition-colors"
                            aria-label="Twitter"
                          >
                            <Icon icon="mdi:twitter" width={18} className="sm:w-5" />
                          </a>
                          <a
                            href="#"
                            className="text-gray-900 hover:text-primary-500 transition-colors"
                            aria-label="LinkedIn"
                          >
                            <Icon icon="mdi:linkedin" width={18} className="sm:w-5" />
                          </a>
                          <a
                            href="#"
                            className="text-gray-900 hover:text-primary-500 transition-colors"
                            aria-label="Facebook"
                          >
                            <Icon icon="mdi:facebook" width={18} className="sm:w-5" />
                          </a>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 sm:gap-3 mt-auto">
                          <button
                            onClick={() => router.push(`/repairmans/${pro._id}`)}
                            className="flex-1 bg-gray-900 hover:bg-primary-500 text-white transition-all duration-300 py-2.5 sm:py-3 rounded-xl text-sm font-semibold transform hover:scale-[1.02] active:scale-[0.98]"
                            aria-label="Book appointment"
                          >
                            Book Appointment
                          </button>
                          {/* Chat only for logged-in customers */}
                          {user?.role === 'customer' && (
                            <button
                              onClick={() => handleChat(pro)}
                              className="w-10 h-10 sm:w-12 sm:h-12 border border-gray-200 hover:border-primary-500 hover:text-primary-500 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 hover:scale-105"
                              aria-label="Chat with professional"
                            >
                              <Icon icon="mdi:chat-outline" width={18} className="sm:w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 mt-8 sm:mt-10">
            <button
              onClick={handlePrev}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-gray-200 hover:border-primary-500 hover:text-primary-500 hover:bg-primary-50 flex items-center justify-center transition-all duration-200 flex-shrink-0"
              aria-label="Previous slide"
            >
              <Icon icon="mdi:chevron-left" width={20} className="sm:w-[22px]" />
            </button>

            {/* Progress Bar */}
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-500 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            <button
              onClick={handleNext}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-gray-200 hover:border-primary-500 hover:text-primary-500 hover:bg-primary-50 flex items-center justify-center transition-all duration-200 flex-shrink-0"
              aria-label="Next slide"
            >
              <Icon icon="mdi:chevron-right" width={20} className="sm:w-[22px]" />
            </button>
          </div>

          {/* Counter */}
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-3 text-xs text-gray-400 tabular-nums"
          >
            {String(currentIndex).padStart(2, '0')} / {String(professionals.length).padStart(2, '0')}
          </motion.p>
        </div>
      </div>
    </section>
  );
}