'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axiosInstance from '@/config/axiosInstance';
import ProductCard from '@/components/website/product/productCard';
import { toggleWishlistItem } from '@/store/wishlist';
import { useSocket } from '@/contexts/SocketProvider';

/* ── Banner carousel ──────────────────────────────────────── */
function BannerCarousel({ images }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  const start = useCallback(() => {
    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % images.length);
    }, 4000);
  }, [images.length]);

  useEffect(() => {
    if (images.length > 1) start();
    return () => clearInterval(timerRef.current);
  }, [start, images.length]);

  const go = (idx) => {
    setActive(idx);
    clearInterval(timerRef.current);
    start();
  };

  if (!images.length) return null;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden mb-8 shadow-sm border border-gray-200 group">
      {/* Slides */}
      <div className="relative w-full" style={{ paddingBottom: '28%', minHeight: 160 }}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img.url}
            alt={`Store banner ${i + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          />
        ))}
      </div>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => go((active - 1 + images.length) % images.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
          >
            <Icon icon="mdi:chevron-left" className="w-5 h-5" />
          </button>
          <button
            onClick={() => go((active + 1) % images.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
          >
            <Icon icon="mdi:chevron-right" className="w-5 h-5" />
          </button>
          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`rounded-full transition-all duration-300 ${i === active ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const SORT_OPTIONS = [
  { label: 'Newest',       value: 'default'     },
  { label: 'Top Rated',    value: 'rating'      },
  { label: 'Price: Low',   value: 'price-asc'   },
  { label: 'Price: High',  value: 'price-desc'  },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function SellerStorePage() {
  const { sellerId } = useParams();
  const dispatch    = useDispatch();

  const [seller,   setSeller]   = useState(null);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [sort,     setSort]     = useState('default');
  const [search,   setSearch]   = useState('');
  const [query,    setQuery]    = useState('');

  const { socket } = useSocket() || {};
  const [isSellerOnline, setIsSellerOnline] = useState(false);

  // Sync initial online status
  useEffect(() => {
    if (seller?.isOnline !== undefined) {
      setIsSellerOnline(seller.isOnline);
    }
  }, [seller]);

  // Listen for real-time status changes
  useEffect(() => {
    const sId = seller?.ownerId || seller?.owner?._id;
    if (!socket || !sId) return;

    const handleStatusChanged = (data) => {
      if (data.userId === sId.toString()) {
        setIsSellerOnline(data.status === 'online');
      }
    };

    socket.on('user_status_changed', handleStatusChanged);
    return () => socket.off('user_status_changed', handleStatusChanged);
  }, [socket, seller]);

  const wishlistItems     = useSelector(s => s.wishlist?.items     || []);
  const wishlistLoadingIds = useSelector(s => s.wishlist?.loadingIds || []);

  const fetchStore = useCallback(async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, sort, limit: 12 });
      if (query) params.set('q', query);
      const { data } = await axiosInstance.get(`/e-commerce/sellers/${sellerId}?${params}`);
      if (data.success) {
        setSeller(data.data.seller);
        setProducts(data.data.products);
        setPages(data.data.pagination.pages);
      }
    } catch {
      toast.error('Failed to load store');
    } finally {
      setLoading(false);
    }
  }, [sellerId, page, sort, query]);

  useEffect(() => { fetchStore(); }, [fetchStore]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(search);
    setPage(1);
  };

  const handleSortChange = (val) => {
    setSort(val);
    setPage(1);
  };

  const isWishlisted = (product) =>
    wishlistItems.some(i => (i.productId?._id || i.productId) === product._id);

  const handleWishlist = (product) => {
    dispatch(toggleWishlistItem({ product }));
    if (isWishlisted(product)) toast.info('Removed from wishlist');
    else toast.success('Added to wishlist!');
  };

  /* ── Loading skeleton ── */
  if (loading && !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="mdi:loading" className="animate-spin text-4xl text-primary-500" />
          <p className="text-sm text-gray-400">Loading store…</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Store not found.</p>
      </div>
    );
  }

  const initials = (seller.businessName || 'S').charAt(0).toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* ── Store Header ── */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm mb-10">
        {/* Banner */}
        <div
          className="relative h-44 flex items-end"
          style={seller.coverPhoto ? { background: `url(${seller.coverPhoto}) center/cover no-repeat` } : { background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)' }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 60%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%)' }}
          />
          {seller.isApproved && (
            <span className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <Icon icon="mdi:check-decagram" className="w-4 h-4" />
              Verified Seller
            </span>
          )}
          {/* Avatar */}
          <div className="absolute -bottom-8 left-6">
            {seller.profilePictureOrLogo ? (
              <img
                src={seller.profilePictureOrLogo}
                alt={seller.businessName}
                className="w-20 h-20 rounded-2xl object-cover shadow-xl"
                style={{ border: '3px solid white' }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: '3px solid white' }}
              >
                {initials}
              </div>
            )}
          </div>
        </div>

        {/* Info row */}
        <div className="bg-white pt-12 pb-6 px-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-extrabold text-gray-900 leading-none">{seller.businessName}</h1>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-lg flex items-center gap-1.5 border ${
                  isSellerOnline
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-gray-50 text-gray-500 border-gray-100'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isSellerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                  {isSellerOnline ? 'Online' : 'Offline'}
                </span>
                {seller.sellerId && (
                  <span className="px-2 py-1 text-[10px] font-bold rounded-lg flex items-center gap-1 bg-gray-900 text-white border border-gray-800">
                    <Icon icon="mdi:identifier" className="w-3.5 h-3.5 opacity-70" />
                    ID: {seller.sellerId}
                  </span>
                )}
              </div>
              {seller.storeAddress && (
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
                  <Icon icon="mdi:map-marker-outline" className="w-4 h-4" />
                  {seller.storeAddress}
                </p>
              )}
              {seller.storeDescription && (
                <p className="text-sm text-gray-600 mt-2 max-w-xl leading-relaxed">
                  {seller.storeDescription}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-3 flex-wrap sm:flex-nowrap">
              {[
                { icon: 'mdi:star',           label: 'Rating',  value: seller.avgRating ? `${seller.avgRating}★` : '—' },
                { icon: 'mdi:package-variant', label: 'Products', value: seller.productCount ?? '—' },
                { icon: 'mdi:check-circle',   label: 'Orders',  value: seller.completedOrders ?? '—' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-center min-w-[80px]">
                  <Icon icon={s.icon} className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                  <p className="text-base font-extrabold text-gray-900">{s.value}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Working hours / days */}
          {(seller.workingDays?.length > 0 || seller.workingHours?.start) && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              {seller.workingDays?.length > 0 && (
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:calendar-week" className="w-4 h-4 text-gray-400" />
                  <div className="flex gap-1">
                    {DAYS.map(d => (
                      <span
                        key={d}
                        className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          seller.workingDays.some(wd => wd.toLowerCase().startsWith(d.toLowerCase()))
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-300'
                        }`}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {seller.workingHours?.start && seller.workingHours?.end && (
                <div className="flex items-center gap-1.5">
                  <Icon icon="mdi:clock-outline" className="w-4 h-4 text-gray-400" />
                  <span>{seller.workingHours.start} – {seller.workingHours.end}</span>
                </div>
              )}
            </div>
          )}

          {/* Social Links */}
          {seller?.socialLinks && Object.values(seller.socialLinks).some(link => link) && (
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Follow:</span>
              {Object.entries(seller.socialLinks).map(([platform, link]) => {
                if (!link) return null;
                const iconMap = {
                  facebook: 'mdi:facebook',
                  instagram: 'mdi:instagram',
                  twitter: 'mdi:twitter',
                  linkedin: 'mdi:linkedin',
                  whatsapp: 'mdi:whatsapp',
                  youtube: 'mdi:youtube',
                  tiktok: 'ic:baseline-tiktok',
                  website: 'mdi:web'
                };
                const colorMap = {
                  facebook: 'text-blue-600 hover:text-white hover:bg-blue-600',
                  instagram: 'text-pink-600 hover:text-white hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600',
                  twitter: 'text-sky-500 hover:text-white hover:bg-sky-500',
                  linkedin: 'text-blue-700 hover:text-white hover:bg-blue-700',
                  whatsapp: 'text-green-500 hover:text-white hover:bg-green-500',
                  youtube: 'text-red-600 hover:text-white hover:bg-red-600',
                  tiktok: 'text-black hover:text-white hover:bg-black',
                  website: 'text-gray-600 hover:text-white hover:bg-gray-700'
                };
                const absoluteLink = link.startsWith('http') || platform === 'whatsapp' ? link : `https://${link}`;

                return (
                  <a
                    key={platform}
                    href={platform === 'whatsapp' ? `https://wa.me/${link.replace(/\D/g, '')}` : absoluteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center transition-all duration-200 ${colorMap[platform] || 'text-gray-500 hover:bg-gray-100'}`}
                    title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                  >
                    <Icon icon={iconMap[platform] || 'mdi:link'} className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Sponsor / Promotional Banners ── */}
      {seller.bannerImages?.length > 0 && (
        <BannerCarousel images={seller.bannerImages} />
      )}

      {/* ── Products ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-bold text-gray-800">
          Products
          {seller.productCount > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">({seller.productCount})</span>
          )}
        </h2>

        <div className="flex gap-3 flex-wrap">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="border border-gray-200 rounded-l-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400 w-48"
            />
            <button
              type="submit"
              className="bg-primary-500 hover:bg-primary-600 text-white px-3 rounded-r-xl transition-colors"
            >
              <Icon icon="mdi:magnify" className="w-4 h-4" />
            </button>
          </form>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => handleSortChange(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400 bg-white"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-72" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl">
          <Icon icon="mdi:package-variant-remove" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No products found</p>
          {query && (
            <button
              onClick={() => { setQuery(''); setSearch(''); setPage(1); }}
              className="mt-3 text-sm text-primary-500 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                isWishlisted={isWishlisted(product)}
                onWishlist={() => handleWishlist(product)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <Icon icon="mdi:chevron-left" />
              </button>

              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`dots-${i}`} className="px-1 text-gray-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl border text-sm font-semibold transition-colors ${
                        page === p
                          ? 'bg-primary-500 border-primary-500 text-white'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <Icon icon="mdi:chevron-right" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
