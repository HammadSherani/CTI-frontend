"use client";

import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import axiosInstance from '@/config/axiosInstance';
import { useRouter } from "@/i18n/navigation";
import SectionTag from "./sectoinTag";
import { filterFreshImpressions } from '@/utils/adImpressionTracker';

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ExclusiveStores() {
  const router = useRouter();
  const swiperRef = useRef(null);
  const [stores, setStores]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [total, setTotal] = useState(0);

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
          setTotal(fetchedStores.length);
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

  const handleStoreClick = (campaignId, sellerId) => {
    axiosInstance.get(`/public/ads/click/${campaignId}`).catch(() => {});
    if (sellerId) router.push(`/store/${sellerId}`);
  };

  if (loading || stores.length === 0) return null;

  const enableLoop = stores.length >= 4;

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <SectionTag title="Sponsored" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
            Best Rated <span className="text-primary-500">Stores</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1 max-w-sm">
            Discover top-rated shops handpicked for you — quality guaranteed.
          </p>
        </div>
        {/* Slide counter */}
        <div className="flex items-center gap-2 mb-1">
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all"
          >
            <Icon icon="mdi:chevron-left" className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-xs text-gray-400 font-medium min-w-[40px] text-center">
            {activeIndex + 1} / {total}
          </span>
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all"
          >
            <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Swiper */}
      <Swiper
        modules={[Navigation, Autoplay]}
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        spaceBetween={16}
        slidesPerView={1}
        breakpoints={{
          640:  { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        loop={enableLoop}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
      >
        {stores.map((store) => {
          const seller = store.seller || {};
          const initials = (seller.name || 'S').charAt(0).toUpperCase();

          return (
            <SwiperSlide key={store.campaignId} className="pb-1">
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md h-full flex flex-col cursor-pointer transition-shadow duration-300"
                onClick={() => handleStoreClick(store.campaignId, seller._id)}
              >
                {/* Banner */}
                <div className="relative h-40 bg-gradient-to-br from-primary-500 to-primary-700 overflow-hidden flex-shrink-0">
                  {store.bannerUrl ? (
                    <img
                      src={store.bannerUrl}
                      alt={seller.name || 'Sponsored Store'}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon icon="mdi:storefront" className="text-5xl text-white/25" />
                    </div>
                  )}
                  {/* Bottom gradient for logo overlap */}
                  <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* Sponsored badge */}
                  <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase">
                    Sponsored
                  </div>
                </div>

                {/* Logo + info */}
                <div className="px-4 pb-4 flex flex-col flex-1 -mt-6 relative z-10">
                  {/* Logo */}
                  <div className="w-12 h-12 rounded-xl border-2 border-white shadow-md bg-white overflow-hidden flex-shrink-0 mb-2.5">
                    {seller.logo ? (
                      <img
                        src={seller.logo}
                        alt={seller.name || 'Store'}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-600 flex items-center justify-center">
                        <span className="text-white text-lg font-black">{initials}</span>
                      </div>
                    )}
                  </div>

                  {/* Store name */}
                  <h3 className="font-bold text-[15px] leading-tight text-gray-900 mb-0.5 line-clamp-1">
                    {seller.name || 'Sponsored Store'}
                  </h3>

                  {/* Campaign tagline */}
                  {store.tagline && (
                    <p className="text-primary-500 text-xs font-semibold mb-1.5 line-clamp-1">
                      {store.tagline}
                    </p>
                  )}

                  {/* Description */}
                  {seller.description && (
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 flex-1">
                      {seller.description}
                    </p>
                  )}

                  {/* Address */}
                  {seller.address && (
                    <div className="flex items-center gap-1 mt-2 text-[11px] text-gray-400">
                      <Icon icon="mdi:map-marker-outline" className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{seller.address}</span>
                    </div>
                  )}

                  {/* Working days */}
                  {seller.workingDays?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {DAYS_SHORT.map(day => (
                        <span
                          key={day}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            seller.workingDays.includes(day)
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-gray-100 text-gray-300'
                          }`}
                        >
                          {day}
                        </span>
                      ))}
                      {seller.workingHours?.start && seller.workingHours?.end && (
                        <span className="text-[9px] text-gray-400 px-1 self-center">
                          {seller.workingHours.start}–{seller.workingHours.end}
                        </span>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-3 flex items-center gap-1 text-primary-600 hover:text-primary-500 font-semibold text-xs transition-colors self-start">
                    Visit Store <Icon icon="mdi:arrow-right" className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
