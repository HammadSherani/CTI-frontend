'use client';
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import axiosInstance from '@/config/axiosInstance';
import ProductsCarousel from './product/ProductsCarousel';

export default function GoodProducts({ title = 'Products', titleHighlight = 'Sponsored' }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const { data } = await axiosInstance.get('/public/ads/placement?type=search&limit=10');
        if (data.success && data.data?.length > 0) {
          const expandedAds = [];
          const impressionEntries = [];

          data.data.forEach(ad => {
            if (ad.type === 'sponsored_product' && ad.products?.length > 0) {
              impressionEntries.push({ campaignId: ad.campaignId });
              ad.products.forEach(prod => {
                expandedAds.push({
                  ...prod,
                  campaignId: ad.campaignId,
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

          setProducts(expandedAds);

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

  if (loading || products.length === 0) return null;

  return (
    <div className="overflow-hidden">
      <ProductsCarousel
        products={products}
        title={title}
        titleHighlight={titleHighlight}
        viewMoreHref="/product"
      />
    </div>
  );
}
