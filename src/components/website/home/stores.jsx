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
import SectionTag from "./sectoinTag";
import { filterFreshImpressions } from '@/utils/adImpressionTracker';

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ExclusiveStores() {
  const router = useRouter();
  const [progress, setProgress]             = useState(0);
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
            campaignId:  ad.campaignId,
            bannerUrl:   ad.bannerUrl   || null,
            tagline:     ad.storeTagline || null,
            seller:      ad.seller || null,
          }));
          setStores(fetchedStores);
          // Only count impressions not seen in the last 30 minutes
          const freshIds = filterFreshImpressions(fetchedStores.map(s => s.campaignId));
          if (freshIds.length > 0) {
            axiosInstance.post('/public/ads/impression', {
              campaigns: freshIds.map(id => ({ campaignId: id }))
            }).catch(() => {});
          }
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
    if (sellerId) router.push(`/store/${sellerId}`);
  };

  if (loading || stores.length === 0) return null;

  const enableLoop = stores.length >= 4;

  return (
    <section className="py-16 max-w-7xl mx-auto text-black">
      {/* Section header */}
      <div className="flex flex-col gap-6 mb-10 ml-10">
      </div>
         <div className="flex flex-col  gap-2 mb-10">
          <div>
            <div className="mt-">
                <SectionTag title="Our Top Sellers" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
               best rated <p className="text-primary-500"> stores </p>
            </h2>
            <p className="text-gray-600 w-96">
              We follow a simple, transparent process to ensure your device is repaired quickly, safely, and without hassle.
            </p>
          </div>

        
        </div>
      <div className="px-14  lg:px-10 bg-gray-100 rounded-3xl py-8 ">
        <div className="relative">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => swiperRef.current?.slidePrev()}
            className="w-9 h-9 absolute top-1/2 -translate-y-1/2 -left-8 z-20 flex items-center justify-center rounded-lg bg-black text-white shadow-sm hover:bg-gray-800 transition-all"
          >
            <Icon icon="mdi:chevron-left" className="w-5 h-5 text-white" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => swiperRef.current?.slideNext()}
            className="w-9 h-9 absolute top-1/2 -translate-y-1/2 -right-8 z-20 flex items-center justify-center rounded-lg bg-black text-white shadow-sm hover:bg-gray-800 transition-all"
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
              768:  { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 3 },
            }}
            loop={enableLoop}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
          >
            {stores.map((store) => {
              const seller = store.seller || {};
              const initials = (seller.name || 'S').charAt(0).toUpperCase();
              console.log('Rendering store:', store);
              return (
                <SwiperSlide key={store.campaignId} className="pb-1">
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg h-full flex flex-col cursor-pointer transition-shadow duration-300"
                    onClick={() => handleStoreClick(store.campaignId, seller._id)}
                  >
                    {/* Banner */}
                    <div className="relative h-36 bg-gradient-to-br from-primary-600 to-primary-800 overflow-hidden flex-shrink-0">
                      {store.bannerUrl ? (
                        <Image
                          src={store.bannerUrl}
                          alt={seller.name || 'Sponsored Store'}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                          <Icon icon="mdi:storefront" className="text-6xl text-white" />
                        </div>
                      )}
                      {/* Dark gradient at bottom for logo overlap */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
                      {/* Sponsored badge */}
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase">
                        Sponsored
                      </div>
                    </div>

                    {/* Logo + info */}
                    <div className="px-5 pb-5 flex flex-col flex-1 -mt-7 relative z-10">
                      {/* Logo circle */}
                      <div className="w-14 h-14 rounded-2xl border-2 border-white shadow-md bg-white overflow-hidden flex-shrink-0 mb-3">
                        {seller.logo ? (
                          <Image
                            src={seller.logo}
                            alt={seller.name || 'Store'}
                            width={56}
                            height={56}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary-600 flex items-center justify-center">
                            <span className="text-white text-xl font-black">{initials}</span>
                          </div>
                        )}
                      </div>

                      {/* Store name */}
                      <h3 className="font-bold text-base leading-tight text-slate-900 mb-0.5 line-clamp-1">
                        {seller.name || 'Sponsored Store'}
                      </h3>

                      {/* Campaign tagline */}
                      {store.tagline && (
                        <p className="text-primary-500 text-xs font-semibold mb-2 line-clamp-1">
                          {store.tagline}
                        </p>
                      )}

                      {/* Store description */}
                      {seller.description && (
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 flex-1">
                          {seller.description}
                        </p>
                      )}

                      {/* Address */}
                      {seller.address && (
                        <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-400">
                          <Icon icon="mdi:map-marker-outline" className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{seller.address}</span>
                        </div>
                      )}

                      {/* Working days */}
                      {seller.workingDays?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {DAYS_SHORT.map(day => (
                            <span
                              key={day}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                seller.workingDays.includes(day)
                                  ? 'bg-primary-100 text-primary-700'
                                  : 'bg-slate-100 text-slate-300'
                              }`}
                            >
                              {day}
                            </span>
                          ))}
                          {seller.workingHours?.start && seller.workingHours?.end && (
                            <span className="text-[10px] text-slate-400 px-1 self-center">
                              {seller.workingHours.start}–{seller.workingHours.end}
                            </span>
                          )}
                        </div>
                      )}

                      {/* CTA */}
                      <button className="mt-4 flex items-center gap-1.5 text-primary-600 hover:text-primary-500 font-semibold text-xs transition-colors self-start">
                        Visit Store <Icon icon="mdi:arrow-right" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <div className="mt-8 h-1 bg-white/40 rounded-full overflow-hidden">
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
