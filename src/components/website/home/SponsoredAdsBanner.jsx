'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import axiosInstance from '@/config/axiosInstance';
import { Icon } from '@iconify/react';

export default function SponsoredAdsBanner() {
  const router = useRouter();
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    axiosInstance.get('/public/ads/placement?type=store&limit=3')
      .then(({ data }) => {
        if (!data.success) return;
        const withBanners = (data.data || []).filter(ad => ad.bannerUrl);
        if (withBanners.length === 0) return;
        setBanners(withBanners.map(ad => ({
          campaignId: ad.campaignId,
          bannerUrl:  ad.bannerUrl,
          name:       ad.seller?.storeName || `${ad.seller?.firstName ?? ''} ${ad.seller?.lastName ?? ''}`.trim() || 'Sponsored',
          tagline:    ad.storeTagline || '',
          sellerId:   ad.seller?._id || null,
        })));
        // Record impressions
        axiosInstance.post('/public/ads/impression', {
          campaigns: withBanners.map(ad => ({ campaignId: ad.campaignId }))
        }).catch(() => {});
      })
      .catch(() => {});
  }, []);

  if (banners.length === 0) return null;

  const handleClick = (campaignId, sellerId) => {
    axiosInstance.get(`/public/ads/click/${campaignId}`).catch(() => {});
    if (sellerId) router.push(`/seller/${sellerId}`);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
      <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
        <Icon icon="mdi:star-four-points" className="text-yellow-500 w-3.5 h-3.5" />
        Sponsored
      </div>
      <div className={`grid gap-4 ${banners.length === 1 ? 'grid-cols-1' : banners.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
        {banners.map((b) => (
          <div
            key={b.campaignId}
            onClick={() => handleClick(b.campaignId, b.sellerId)}
            className="relative h-36 sm:h-44 rounded-2xl overflow-hidden cursor-pointer group border border-slate-100"
          >
            <Image
              src={b.bannerUrl}
              alt={b.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <p className="text-xs font-bold opacity-70 uppercase tracking-wider">Sponsored</p>
              <p className="font-bold text-sm leading-tight">{b.name}</p>
              {b.tagline && <p className="text-xs opacity-70 mt-0.5 truncate">{b.tagline}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
