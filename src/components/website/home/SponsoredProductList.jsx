'use client';

import { useState, useEffect } from 'react';
import axiosInstance from '@/config/axiosInstance';
import ProductCard from '../product/productCard';
import { Icon } from '@iconify/react';
import { useRouter } from '@/i18n/navigation';

export default function SponsoredProductList() {
  const router = useRouter();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const { data } = await axiosInstance.get('/public/ad-tracking/placement?type=search&limit=4');
        if (data.success && data.data?.length > 0) {
          
          // Expand ads to individual products
          const expandedAds = [];
          data.data.forEach(ad => {
            if (ad.type === 'sponsored_product' && ad.products?.length > 0) {
              ad.products.forEach(prod => {
                expandedAds.push({
                  campaignId: ad.campaignId,
                  ...prod,
                  // inject the click handler for ProductCard
                  onCardClick: (e) => {
                    e.preventDefault();
                    // trigger click tracking, then navigate
                    window.location.href = `/api/public/ad-tracking/click/${ad.campaignId}?product=${prod._id}&redirect=/product/${prod.slug}`;
                  }
                });
              });
            }
          });

          // Limit to showing 4 sponsored products max
          const topAds = expandedAds.slice(0, 4);
          setAds(topAds);
          
          if (topAds.length > 0) {
            // Record impressions
            const campaignEntries = topAds.map(a => ({ campaignId: a.campaignId, productId: a._id }));
            axiosInstance.post('/public/ad-tracking/impression', {
              campaigns: campaignEntries,
              type: 'sponsored_product',
              source: window.location.pathname
            }).catch(() => {});
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
            {/* Ad Badge */}
            <div className="absolute -top-2 -right-2 z-30">
              <span className="inline-block px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase rounded shadow-sm border border-black/20">
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
