"use client";

import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import axiosInstance from '@/config/axiosInstance';
import { useRouter } from "@/i18n/navigation";

export default function ExclusiveStores() {
  const router = useRouter();
  const [progress, setProgress]           = useState(0);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const swiperRef = useRef(null);
  const [stores, setStores]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const { data } = await axiosInstance.get('/public/ads/placement?type=store&limit=10');
        if (data.success && data.data?.length > 0) {
          const fetchedStores = data.data.map(ad => ({
            id:         ad.campaignId,
            campaignId: ad.campaignId,
            name:       ad.seller?.storeName || `${ad.seller?.firstName ?? ''} ${ad.seller?.lastName ?? ''}`.trim() || 'Sponsored Store',
            tagline:    ad.storeTagline || 'Featured Store',
            description:'Explore top deals and refurbished products exclusively from this seller.',
            bannerUrl:  ad.bannerUrl || null,
            sellerId:   ad.seller?._id || null,
          }));
          setStores(fetchedStores);

          const impressionEntries = fetchedStores.map(s => ({ campaignId: s.campaignId }));
          axiosInstance.post('/public/ads/impression', { campaigns: impressionEntries }).catch(() => {});
        }
      } catch (err) {
        console.error('Failed to load sponsored stores:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  useEffect(() => {
    if (!swiperInstance) return;
    const updateProgress = () => {
      const total = swiperInstance.slides.length - (swiperInstance.loopedSlides || 0) * 2;
      setProgress(Math.min(((swiperInstance.realIndex + 1) / Math.max(total, 1)) * 100, 100));
    };
    swiperInstance.on("slideChange", updateProgress);
    updateProgress();
    return () => swiperInstance.off("slideChange", updateProgress);
  }, [swiperInstance]);

  const handleStoreClick = (campaignId, sellerId) => {
    axiosInstance.get(`/public/ads/click/${campaignId}`).catch(() => {});
    if (sellerId) router.push(`/seller/${sellerId}`);
  };

  if (loading || stores.length === 0) return null;

  const enableLoop = stores.length >= 4;

  return (
    <section className="py-16 max-w-7xl mx-auto text-black">
      <div className="flex flex-col gap-6 mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            <span className="text-primary-500">Sponsored</span> Stores
          </h2>
          <p className="text-sm text-gray-500 mt-1">Featured sellers on our platform</p>
        </div>
        <div className="flex flex-wrap gap-8 md:gap-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center">
              <Icon icon="mdi:storefront" className="text-3xl text-white" />
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
              <span className="text-sm text-black tracking-wide">Star Ratings</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 lg:px-8 bg-gray-100 rounded-3xl py-8">
        <div className="relative">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => swiperRef.current?.slidePrev()}
            className="w-9 h-9 absolute top-1/2 -translate-y-1/2 -left-4 z-20 flex items-center justify-center rounded-lg bg-black text-white border border-gray-200 shadow-sm hover:bg-gray-800 transition-all"
          >
            <Icon icon="mdi:chevron-left" className="w-5 h-5 text-white" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => swiperRef.current?.slideNext()}
            className="w-9 h-9 absolute top-1/2 -translate-y-1/2 -right-4 z-20 flex items-center justify-center rounded-lg bg-black text-white border border-gray-200 shadow-sm hover:bg-gray-800 transition-all"
          >
            <Icon icon="mdi:chevron-right" className="w-5 h-5 text-white" />
          </button>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            onSwiper={(swiper) => { setSwiperInstance(swiper); swiperRef.current = swiper; }}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640:  { slidesPerView: 2 },
              768:  { slidesPerView: 3 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            loop={enableLoop}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
          >
            {stores.map((store) => (
              <SwiperSlide key={store.id}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl overflow-hidden border border-white/10 h-full flex flex-col hover:border-primary-500/50 transition-all duration-300 cursor-pointer"
                  onClick={() => handleStoreClick(store.campaignId, store.sellerId)}
                >
                  {/* Banner / header */}
                  <div className="relative h-32 bg-gradient-to-br from-primary-600 to-primary-800 overflow-hidden flex-shrink-0">
                    {store.bannerUrl ? (
                      <Image
                        src={store.bannerUrl}
                        alt={store.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon icon="mdi:storefront" className="text-5xl text-white/30" />
                      </div>
                    )}
                    {/* Sponsored badge */}
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Sponsored
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-semibold text-lg leading-tight mb-1 text-slate-900">
                      {store.name}
                    </h3>
                    <p className="text-primary-500 text-sm font-medium mb-2">{store.tagline}</p>
                    <p className="text-gray-400 text-sm leading-relaxed flex-1">{store.description}</p>
                    <button className="mt-4 flex items-center gap-2 text-primary-500 hover:text-primary-400 font-medium text-sm transition-colors">
                      Visit Store <Icon icon="mdi:arrow-right" />
                    </button>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="mt-8 h-1 bg-white/30 rounded-full overflow-hidden">
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
