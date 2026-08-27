'use client'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation, Thumbs } from 'swiper/modules'
import { useRef, useState, useEffect } from 'react'
import axiosInstance from '@/config/axiosInstance'
// import { Star, ChevronRight } from 'lucide-react'
import { Icon } from '@iconify/react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import RefurbishedSliderSection from '@/components/website/refurbish/RefurbishedSliderSection'
import RefurbishedReviewSection from '@/components/website/refurbish/RefurbishedReviewSection'
import RefurbishedProductCard from '@/components/website/refurbish/RefurbishedProductCard'
import { Link } from '@/i18n/navigation'

export default function Refurbish() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const mainSwiperRef = useRef(null)
  const flashSaleSwiperRef = useRef(null)

  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [phones, setPhones] = useState([]);
  const [laptops, setLaptops] = useState([]);
  const [watches, setWatches] = useState([]);
  const [gamingConsoles, setGamingConsoles] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const mapProduct = (p) => {
    if (!p) return null;
    const defaultVar = p.variants?.find(v => v.isDefault) || p.variants?.[0];
    const src = defaultVar?.images?.[0]?.url || p.images?.[0]?.url || '/assets/placeholder.jpg';
    const price = defaultVar ? (defaultVar.discountPrice || defaultVar.sellingPrice || 0) : 0;
    const mrp = defaultVar ? (defaultVar.sellingPrice || 0) : 0;
    const discount = defaultVar?.discountPercentage || 0;
    const videoSrc = defaultVar?.videos?.[0]?.url || p.videos?.[0]?.url || null;
    const isVideo = !!videoSrc;
    const stock = defaultVar ? (defaultVar.stock || 0) : 0;

    return {
      id: p._id,
      src,
      title: p.title,
      brand: p.brandId?.name || '',
      categoryName: p.categoryId?.name || '',
      shortDescription: p.shortDescription || '',
      rating: p.ratings?.average || 5.0,
      discount,
      mrp,
      price,
      href: `/refurbish/${p.slug}`,
      isVideo,
      videoSrc,
      stock,
    };
  };

  const mapFlashProduct = (p, discountPercentage, isFlashDeal = true) => {
    if (!p) return null;
    const defaultVar = p.variants?.find(v => v.isDefault) || p.variants?.[0];
    const src = defaultVar?.images?.[0]?.url || p.images?.[0]?.url || '/assets/placeholder.jpg';
    const storePrice = defaultVar ? (defaultVar.discountPrice || defaultVar.sellingPrice || 0) : 0;
    const mrp = defaultVar ? (defaultVar.sellingPrice || 0) : 0;

    const price = storePrice * (1 - discountPercentage / 100);
    const discount = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : discountPercentage;

    const videoSrc = defaultVar?.videos?.[0]?.url || p.videos?.[0]?.url || null;
    const isVideo = !!videoSrc;
    const stock = defaultVar ? (defaultVar.stock || 0) : 0;

    return {
      id: p._id,
      src,
      title: p.title,
      brand: p.brandId?.name || '',
      categoryName: p.categoryId?.name || '',
      shortDescription: p.shortDescription || '',
      rating: p.ratings?.average || 5.0,
      discount,
      mrp: storePrice,
      price,
      href: `/refurbish/${p.slug}`,
      isVideo,
      videoSrc,
      stock,
      isFlashDeal,
      flashDiscount: discountPercentage,
    };
  };

  useEffect(() => {
    (async () => {
      try {
        const catRes = await axiosInstance.get('/public/refurbished-devices/categories');
        const activeCategories = catRes.data?.data || [];
        setDynamicCategories(activeCategories);

        const topRes = await axiosInstance.get('/public/refurbished-devices/products/top-selling');
        setTopSellingProducts((topRes.data?.data || []).map(mapProduct).filter(Boolean));

        const phoneCat = activeCategories.find(c => {
          const s = c.slug.toLowerCase();
          return s.includes('phone') || s.includes('mobile');
        });
        if (phoneCat) {
          const phoneRes = await axiosInstance.get(`/public/refurbished-devices/products/category/${phoneCat.slug}`);
          setPhones((phoneRes.data?.data || []).map(phone => mapProduct(phone)).filter(Boolean));
        }

        const laptopCat = activeCategories.find(c => {
          const s = c.slug.toLowerCase();
          return s.includes('laptop') || s.includes('notebook');
        });
        if (laptopCat) {
          const laptopRes = await axiosInstance.get(`/public/refurbished-devices/products/category/${laptopCat.slug}`);
          setLaptops((laptopRes.data?.data || []).map(laptop => mapProduct(laptop)).filter(Boolean));
        }

        const watchCat = activeCategories.find(c => {
          const s = c.slug.toLowerCase();
          return s.includes('watch');
        });
        if (watchCat) {
          const watchRes = await axiosInstance.get(`/public/refurbished-devices/products/category/${watchCat.slug}`);
          setWatches((watchRes.data?.data || []).map(watch => mapProduct(watch)).filter(Boolean));
        }

        const gamingCat = activeCategories.find(c => {
          const s = c.slug.toLowerCase();
          return s.includes('gaming-console') || s.includes('gaming');
        });
        if (gamingCat) {
          const gamingRes = await axiosInstance.get(`/public/refurbished-devices/products/category/${gamingCat.slug}`);
          setGamingConsoles((gamingRes.data?.data || []).map(game => mapProduct(game)).filter(Boolean));
        }

        try {
          const flashRes = await axiosInstance.get('/public/refurbished-devices/flash-deals');
          setFlashDeals(flashRes.data?.data || []);
        } catch (flashErr) {
          console.error("Error loading flash deals:", flashErr);
        }
      } catch (err) {
        console.error("Error loading refurbished dynamic data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  const banners = [
    { id: 1, src: '/assets/refurbish/banners/1.avif', alt: 'Refurbished Gadgets 1', href: '#' },
    { id: 2, src: '/assets/refurbish/banners/2.avif', alt: 'Refurbished Gadgets 2', href: '#' },
    { id: 3, src: '/assets/refurbish/banners/3.avif', alt: 'Refurbished Gadgets 3', href: '#' },
    { id: 4, src: '/assets/refurbish/banners/4.avif', alt: 'Refurbished Gadgets 4', href: '#' },
    { id: 5, src: '/assets/refurbish/banners/5.avif', alt: 'Refurbished Gadgets 5', href: '#' },
    { id: 6, src: '/assets/refurbish/banners/6.avif', alt: 'Refurbished Gadgets 6', href: '#' },
    { id: 7, src: '/assets/refurbish/banners/7.avif', alt: 'Refurbished Gadgets 7', href: '#' },
    { id: 8, src: '/assets/refurbish/banners/8.avif', alt: 'Refurbished Gadgets 8', href: '#' },
  ]

  // Replace src paths with your actual product image paths
  const formatPrice = (num) => `$${Number(num).toFixed(2)}`

  const displayCategories = dynamicCategories.map((cat, idx) => ({
    id: cat._id,
    name: cat.name,
    image: cat.image || '/assets/placeholder.jpg',
    href: `/refurbish?category=${cat.slug}`,
    bgColor: ['bg-blue-50', 'bg-indigo-50', 'bg-amber-50', 'bg-green-50', 'bg-pink-50', 'bg-slate-100', 'bg-primary-50'][idx % 7]
  })).slice(0, 10);

  const displayFlashSale = topSellingProducts;
  const displayTopSelling = topSellingProducts;
  const displayPhones = phones;
  const displayLaptops = laptops;
  const displaySmartwatches = watches;
  const displayGamingConsoles = gamingConsoles;

  return (

    <div className="w-[80%] mx-auto relative">
      {/* Main Slider */}
      <div className="relative mt-5">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, Thumbs]}
          thumbs={{ swiper: thumbsSwiper }}
          spaceBetween={0}
          slidesPerView={1}
          navigation={{
            prevEl: '.custom-prev',
            nextEl: '.custom-next',
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
          className="relative w-full h-[300px] rounded-lg overflow-hidden"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <div className="relative w-full h-full">
                <Link href={banner.href} className="absolute inset-0 z-10" aria-label={`Go to ${banner.alt}`} />
                <Image
                  src={banner.src}
                  alt={banner.alt}
                  fill
                  className="object-cover"
                  priority={banner.id === 1}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons - Placed outside Swiper but inside the relative container */}
        <button
          className="custom-prev absolute left-4 top-1/2 z-10 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center hover:bg-primary-500 hover:text-black transition-all duration-200 hover:scale-110"
          aria-label="Previous slide"
        >
          <Icon icon="ep:arrow-left-bold" className="w-5 h-5" />
        </button>

        <button
          className="custom-next absolute right-4 top-1/2 z-10 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center hover:bg-primary-500 hover:text-black transition-all duration-200 hover:scale-110"
          aria-label="Next slide"
        >
          <Icon icon="ep:arrow-right-bold" className="w-5 h-5" />
        </button>
      </div>

      {/* Categories Grid with Images */}
      <div className="grid grid-cols-2 mt-10 mb-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-6 gap-4 pb-2">
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => (
            <div key={`cat-sk-${idx}`} className="animate-pulse bg-gray-100/50 border border-gray-100 rounded-2xl px-1 py-3 text-center h-24 flex flex-col items-center justify-center gap-3">
              <div className="h-3 w-16 bg-gray-200 rounded-md"></div>
              <div className="w-12 h-10 bg-gray-200 rounded-lg"></div>
            </div>
          ))
          : displayCategories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className={`${category.bgColor} rounded-2xl px-1 py-3 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group border border-transparent hover:border-primary-200 flex flex-col items-center gap-3`}
            >
              <span className="text-[10px] font-semibold text-gray-800 group-hover:text-primary-500 transition-colors text-center leading-snug  flex items-center">
                {category.name}
              </span>
              <div className="w-12 h-10 flex items-center justify-center overflow-hidden rounded-lg">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={64}
                  height={64}
                  className="w-12 h-10 object-cover rounded-md group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </Link>
          ))
        }
      </div>


      {/* Active Flash Deals Section */}
      {flashDeals.map((deal) => {
        const mappedProducts = (deal.products || []).map(p => mapFlashProduct(p, deal.discountPercentage)).filter(Boolean);
        if (mappedProducts.length === 0) return null;

        return (
          <div key={deal._id} className="mt-8 mb-12 relative rounded-3xl">

            {/* Header with Title and Countdown */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                  <Icon icon="mdi:flash" className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2 flex-wrap">
                    {deal.title}
                    <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-600 text-white text-slate-950 px-3 py-1 rounded-full font-extrabold shadow-md uppercase tracking-wider">
                      ⚡ {deal.discountPercentage}% OFF
                    </span>
                  </h2>
                  {deal.description && (
                    <p className="text-xs text-gray-400 mt-1 font-medium max-w-xl">{deal.description}</p>
                  )}
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="shrink-0">
                <CountdownTimer targetDate={deal.endDate} />
              </div>
            </div>

            {/* Slider */}
            <div className="relative z-10 px-1">
              <Swiper
                modules={[Navigation]}
                spaceBetween={16}
                slidesPerView={2}
                navigation={{
                  prevEl: `.prev-flash-${deal._id}`,
                  nextEl: `.next-flash-${deal._id}`,
                }}
                breakpoints={{
                  480: { slidesPerView: 2 },
                  640: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 },
                  1280: { slidesPerView: 5 },
                }}
                className="!pb-2"
              >
                {mappedProducts.map((product) => (
                  <SwiperSlide key={product.id}>
                    <RefurbishedProductCard product={product} />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Navigation Buttons */}
              <button
                className={`prev-flash-${deal._id} absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-3 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 hidden md:flex items-center justify-center hover:bg-gray-50 transition-colors`}
                aria-label="Previous products"
              >
                <svg className="w-4 h-4 text-gray-650" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className={`next-flash-${deal._id} absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-3 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 hidden md:flex items-center justify-center hover:bg-gray-50 transition-colors`}
                aria-label="Next products"
              >
                <svg className="w-4 h-4 text-gray-650" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}




      {/* Top Selling Devices Section */}
      <RefurbishedSliderSection
        title="Top Selling Devices"
        products={displayTopSelling}
        viewAllHref="/refurbish"
        loading={loading}
      />

      {/* Top Selling Phones Section */}
      <RefurbishedSliderSection
        title="Top Selling Phones"
        products={displayPhones}
        viewAllHref="/refurbish"
        loading={loading}
      />

      <div className="grid grid-cols-1 mt-10 md:grid-cols-2 gap-4">
        <div>
          <Image src='/assets/refurbish/sections/1.webp' width={500} height={500} alt="1" className='rounded-lg' />
        </div>
        <div>
          <Image src='/assets/refurbish/sections/2.avif' width={500} height={500} alt="1" className='rounded-lg' />
        </div>
      </div>



      {/* EMI Section */}
      <div className="mt-10 mb-10 relative">
        <Link href="/buy-refurbish-gadgets">
          <Image
            width={2000}
            height={800}
            className="w-full rounded-xl"
            alt="CTI Tradebulls Sell Device Banner"
            src="/assets/refurbish/sections/emi.avif"
            priority
          />
        </Link>
      </div>


      <div>
        <div className='grid grid-cols-4 gap-4'>
          <Link href="/buy-refurbish-gadgets">
            <Image
              width={2000}
              height={800}
              className="w-full rounded-xl"
              alt="CTI Tradebulls Sell Device Banner"
              src="/assets/refurbish/sections/4.avif"
              priority
            />
          </Link>
          <Link href="/buy-refurbish-gadgets">
            <Image
              width={2000}
              height={800}
              className="w-full rounded-xl"
              alt="CTI Tradebulls Sell Device Banner"
              src="/assets/refurbish/sections/3.avif"
              priority
            />
          </Link>
          <Link href="/buy-refurbish-gadgets">
            <Image
              width={2000}
              height={800}
              className="w-full rounded-xl"
              alt="CTI Tradebulls Sell Device Banner"
              src="/assets/refurbish/sections/6.webp"
              priority
            />
          </Link>
          <Link href="/buy-refurbish-gadgets">
            <Image
              width={2000}
              height={800}
              className="w-full rounded-xl"
              alt="CTI Tradebulls Sell Device Banner"
              src="/assets/refurbish/sections/5.avif"
              priority
            />
          </Link>
        </div>

      </div>



      {/* Top Selling Laptops Section */}
      <RefurbishedSliderSection
        title="Top Selling Laptops"
        products={displayLaptops}
        viewAllHref="/refurbish"
        loading={loading}
      />



      {/* Laptops */}
      <div>
        <div className='grid grid-cols-2 gap-4'>
          <Link href="/buy-refurbish-gadgets">
            <Image
              width={2000}
              height={800}
              className="w-full rounded-xl"
              alt="CTI Tradebulls Sell Device Banner"
              src="/assets/refurbish/sections/l1.webp"
              priority
            />
          </Link>
          <Link href="/buy-refurbish-gadgets">
            <Image
              width={2000}
              height={800}
              className="w-full rounded-xl"
              alt="CTI Tradebulls Sell Device Banner"
              src="/assets/refurbish/sections/l2.webp"
              priority
            />
          </Link>

        </div>

      </div>


      {/* In-Demand Smartwatches Section */}
      <RefurbishedSliderSection
        title="In-Demand Smartwatches"
        products={displaySmartwatches}
        viewAllHref="/refurbish"
        loading={loading}
      />


      <div className="grid grid-cols-2 gap-4 mt-10 mb-10">
        <Link href="/buy-refurbish-gadgets">
          <Image
            width={2000}
            height={800}
            className="w-full rounded-xl"
            alt="CTI Tradebulls Sell Device Banner"
            src="/assets/refurbish/sections/w1.avif"
            priority
          />
        </Link>
        <Link href="/buy-refurbish-gadgets">
          <Image
            width={2000}
            height={800}
            className="w-full rounded-xl"
            alt="CTI Tradebulls Sell Device Banner"
            src="/assets/refurbish/sections/w2.avif"
            priority
          />
        </Link>
      </div>



      {/* Trending Gamer Essentials Section */}
      <RefurbishedSliderSection
        title="Trending Gamer Essentials"
        products={displayGamingConsoles}
        viewAllHref="/refurbish"
        loading={loading}
      />

      <div className="mt-10 mb-10 relative">
        <Link href='/buy-refurbish-gadgets'>
          <Image src='/assets/refurbish/sections/wht.avif' width={1500} height={800} className='rounded-xl' />
        </Link>
      </div>


      <div className="mt-10 mb-10  gap-4 relative">
        <Link href='/buy-refurbish-gadgets'>
          <Image src='/assets/refurbish/sections/eft.avif' width={1500} height={800} className='rounded-xl' />
        </Link>

      </div>


      <div>
        <RefurbishedReviewSection />
      </div>

    </div >

  )
}

function CountdownTimer({ targetDate }) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeftObj = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        timeLeftObj = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return timeLeftObj;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) return null;

  const pad = (num) => String(num).padStart(2, '0');

  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
      <span className="text-[10px] md:text-xs uppercase tracking-wider text-gray-500 font-semibold mr-1">Ends In:</span>
      <div className="flex gap-1 text-xs md:text-sm font-bold">
        {timeLeft.days > 0 && (
          <>
            <span className="bg-red-500 text-white rounded px-1.5 py-0.5 min-w-[28px] text-center shadow-sm">
              {pad(timeLeft.days)}
            </span>
            <span className="text-red-500 self-center font-bold">:</span>
          </>
        )}
        <span className="bg-red-500 text-white rounded px-1.5 py-0.5 min-w-[28px] text-center shadow-sm">
          {pad(timeLeft.hours)}
        </span>
        <span className="text-red-500 self-center font-bold">:</span>
        <span className="bg-red-500 text-white rounded px-1.5 py-0.5 min-w-[28px] text-center shadow-sm">
          {pad(timeLeft.minutes)}
        </span>
        <span className="text-red-500 self-center font-bold">:</span>
        <span className="bg-red-500 text-white rounded px-1.5 py-0.5 min-w-[28px] text-center shadow-sm">
          {pad(timeLeft.seconds)}
        </span>
      </div>
    </div>
  );
}