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

export default function TopSellers() {
  const swiperRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const { sellers, loading } = useSelector((state) => state.home || {});
  const professionals = Array.isArray(sellers) ? sellers : [];
  console.log(sellers, 'seller')
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

      const fullName = pro.businessName || pro.name || "Premium Store";
      const imageSrc = pro.profilePictureOrLogo || pro.profileImage || `https://placehold.co/400x300/0d9488/ffffff?text=${encodeURIComponent(fullName.charAt(0).toUpperCase())}`;

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
          <SectionTag title="Top Sellers" />
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
              <SectionTag title="Top Sellers" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">
              Meet Our Verified{' '}
              <p className="text-primary-500 relative ">
                Stores
              </p>
            </h2>
          </div>
          <p className="max-w-lg text-gray-500 text-sm sm:text-base leading-relaxed lg:self-end">
            Our top sellers offer high-quality products and excellent customer service. Each store is verified to ensure authentic parts and devices.
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
              640: { slidesPerView: 2, spaceBetween: 20 },
              768: { slidesPerView: 3, spaceBetween: 24 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
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
              const fullName = pro.businessName || pro.name || "Premium Store";
              const rawBio = pro.storeDescription || "Top rated seller offering authentic products with fast delivery.";
              const bio = rawBio.length > 120 ? rawBio.slice(0, 120) + '...' : rawBio;
              const imageSrc = pro.profilePictureOrLogo || `https://placehold.co/400x300/0d9488/ffffff?text=${encodeURIComponent(fullName.charAt(0).toUpperCase())}`;

              return (
                <SwiperSlide key={pro._id || idx}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="h-[420px]"
                  >
                    {/* Card Container - Vertical Design */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group">

                      {/* Image Section */}
                      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50">
                        <Image
                          src={imageSrc}
                          alt={fullName}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
                          priority={idx < 4}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />

                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                          <span className="bg-primary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                            Top Seller
                          </span>
                          {pro.city && (
                            <span className="text-white capitalize text-xs flex items-center gap-1 drop-shadow-md">
                              <Icon icon="mdi:map-marker-outline" width={14} />
                              {pro.city.name || pro.city}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg capitalize font-bold text-gray-900 leading-tight group-hover:text-primary-600 transition-colors line-clamp-1 mb-1">
                          {fullName}
                        </h3>
                        {/* <p className="text-primary-500 capitalize text-xs font-medium uppercase tracking-wider line-clamp-1 mb-3">
                          {specialization}
                        </p> */}

                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-5 flex-1 min-h-[60px]">
                          {bio}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-auto">
                          <button
                            onClick={() => router.push(`/store/${pro._id}`)}
                            className="flex-1 bg-gray-50 hover:bg-primary-500 text-gray-700 hover:text-white transition-all duration-300 py-2 rounded-xl text-sm font-semibold border border-gray-200 hover:border-primary-500"
                            aria-label="Visit Store"
                          >
                            Visit Store
                          </button>
                          <button
                            onClick={() => handleChat(pro)}
                            className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center transition-colors border border-gray-200"
                            aria-label="Chat with seller"
                          >
                            <Icon icon="mdi:chat-outline" width={18} />
                          </button>
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