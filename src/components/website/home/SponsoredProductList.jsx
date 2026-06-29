'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import axiosInstance from '@/config/axiosInstance';
import ProductCard from '../product/productCard';
import { Icon } from '@iconify/react';

export default function SponsoredProductList() {
  const router = useRouter();
  const [ads, setAds]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const { data } = await axiosInstance.get('/public/ads/placement?type=search&limit=4');
        if (data.success && data.data?.length > 0) {
          const expanded = [];
          const impressionEntries = [];

          data.data.forEach(ad => {
            if (ad.type === 'sponsored_product' && ad.products?.length > 0) {
              impressionEntries.push({ campaignId: ad.campaignId });
              ad.products.forEach(prod => {
                expanded.push({
                  campaignId: ad.campaignId,
                  ...prod,
                  isSponsored: true,
                  onCardClick: (e) => {
                    e.preventDefault();
                    axiosInstance.get(`/public/ads/click/${ad.campaignId}`).catch(() => {});
                    router.push(`/product/${prod.slug}`);
                  },
                });
              });
            }
          });

          const topAds = expanded.slice(0, 4);
          setAds(topAds);

          if (impressionEntries.length > 0) {
            axiosInstance.post('/public/ads/impression', { campaigns: impressionEntries }).catch(() => {});
          }
        }
      } catch (err) {
        console.error('Failed to load sponsored products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (ads.length === 0) return null;

  return (
    <div className="my-10 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Icon icon="mdi:star-four-points" className="text-yellow-500" />
          Sponsored Products
        </h3>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {ads.map((prod) => (
          <div key={prod._id} className="relative group">
            <div className="absolute -top-2 -right-2 z-30">
              <span className="inline-block px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase rounded shadow-sm">
                Ad
              </span>
            </div>
            <ProductCard product={prod} />
          </div>
        ))}
      </div>
    </div>
  );
}
