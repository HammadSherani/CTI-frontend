'use client';

import { useState, useEffect } from 'react';
import axiosInstance from '@/config/axiosInstance';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';

export default function SponsoredAdsBanner() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const { data } = await axiosInstance.get('/public/ad-tracking/placement?type=sponsored_store&limit=3');
        if (data.success && data.data?.length > 0) {
          setAds(data.data);
          
          // Record impressions
          data.data.forEach(ad => {
            axiosInstance.post('/public/ad-tracking/impression', {
              campaignId: ad._id,
              type: 'sponsored_store',
              source: window.location.pathname
            }).catch(() => {});
          });
        }
      } catch (err) {
        console.error('Failed to load sponsored banners:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  const handleClick = (campaignId, e) => {
    // Record click asynchronously without awaiting
    axiosInstance.get(`/public/ad-tracking/click/${campaignId}`).catch(() => {});
  };

  if (loading) {
    return (
      <div className="w-full h-32 md:h-48 bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center">
        <Icon icon="mdi:image-outline" className="w-8 h-8 text-slate-300" />
      </div>
    );
  }

  if (!ads || ads.length === 0) return null;

  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Icon icon="mdi:star-four-points" className="text-yellow-500" />
          Sponsored Stores
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.map((ad) => (
          <Link
            key={ad._id}
            href={`/store/${ad.sellerId}`} // Assuming this is the seller's public store page
            onClick={(e) => handleClick(ad._id, e)}
            className="group block relative w-full h-32 md:h-40 rounded-2xl overflow-hidden bg-slate-100 shadow-sm hover:shadow-md transition-shadow border border-slate-200"
          >
            {ad.bannerUrl ? (
              <Image 
                src={ad.bannerUrl} 
                alt={ad.storeTagline || ad.name} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105" 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-violet-50 text-violet-300">
                <Icon icon="mdi:storefront" className="w-12 h-12" />
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
              <span className="inline-block px-1.5 py-0.5 bg-black/50 backdrop-blur text-[9px] font-bold text-white uppercase rounded w-fit mb-1 border border-white/20">
                Ad
              </span>
              <p className="text-white font-bold truncate">{ad.storeTagline || ad.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
