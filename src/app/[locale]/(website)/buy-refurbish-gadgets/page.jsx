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
  const [loading, setLoading] = useState(true);

  const mapProduct = (p) => {
    if (!p) return null;
    const defaultVar = p.variants?.find(v => v.isDefault) || p.variants?.[0];
    const src = defaultVar?.images?.[0]?.url || p.images?.[0]?.url || '/assets/placeholder.jpg';
    const price = defaultVar ? (defaultVar.discountPrice || defaultVar.sellingPrice || 0) : 0;
    const mrp = defaultVar ? (defaultVar.sellingPrice || 0) : 0;
    const discount = defaultVar?.discountPercentage || 0;
    const goldPrice = price ? Math.round(price * 0.97) : null;
    const videoSrc = defaultVar?.videos?.[0]?.url || p.videos?.[0]?.url || null;
    const isVideo = !!videoSrc;
    const stock = defaultVar ? (defaultVar.stock || 0) : 0;

    return {
      id: p._id,
      src,
      title: p.title,
      rating: p.ratings?.average || 5.0,
      badge: 'Lowest Price',
      discount,
      mrp,
      price,
      goldPrice,
      href: `/product/${p.slug}`,
      isVideo,
      videoSrc,
      stock,
    };
  };

  useEffect(() => {
    (async () => {
      try {
        const catRes = await axiosInstance.get('/public/sell-device/refurbished/categories');
        const activeCategories = catRes.data?.data || [];
        setDynamicCategories(activeCategories);

        const topRes = await axiosInstance.get('/public/sell-device/refurbished/products/top-selling');
        setTopSellingProducts((topRes.data?.data || []).map(mapProduct).filter(Boolean));

        const phoneCat = activeCategories.find(c => {
          const s = c.slug.toLowerCase();
          return s.includes('phone') || s.includes('mobile');
        });
        if (phoneCat) {
          const phoneRes = await axiosInstance.get(`/public/sell-device/refurbished/products/category/${phoneCat.slug}`);
          setPhones((phoneRes.data?.data || []).map(phone => mapProduct(phone)).filter(Boolean));
        }

        const laptopCat = activeCategories.find(c => {
          const s = c.slug.toLowerCase();
          return s.includes('laptop') || s.includes('notebook');
        });
        if (laptopCat) {
          const laptopRes = await axiosInstance.get(`/public/sell-device/refurbished/products/category/${laptopCat.slug}`);
          setLaptops((laptopRes.data?.data || []).map(laptop => mapProduct(laptop)).filter(Boolean));
        }

        const watchCat = activeCategories.find(c => {
          const s = c.slug.toLowerCase();
          return s.includes('watch');
        });
        if (watchCat) {
          const watchRes = await axiosInstance.get(`/public/sell-device/refurbished/products/category/${watchCat.slug}`);
          setWatches((watchRes.data?.data || []).map(watch => mapProduct(watch)).filter(Boolean));
        }

        const gamingCat = activeCategories.find(c => {
          const s = c.slug.toLowerCase();
          return s.includes('gaming-console') || s.includes('gaming');
        });
        if (gamingCat) {
          const gamingRes = await axiosInstance.get(`/public/sell-device/refurbished/products/category/${gamingCat.slug}`);
          setGamingConsoles((gamingRes.data?.data || []).map(game => mapProduct(game)).filter(Boolean));
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
  const formatPrice = (num) => `₹${num.toLocaleString('en-IN')}`

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
      <div className="relative">
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

      {/* Flash Sale Strip Banner */}
      <div className="relative mt-6 mb-10 rounded-lg overflow-hidden bg-gradient-to-r from-[#0b1229] via-[#141b3d] to-[#0b1229] h-14 flex items-center justify-center gap-4 px-6">
        <span className="text-white font-semibold text-sm md:text-base">
          The Clock and Stock Are Running Low!
        </span>
        <span className="text-primary-400 font-extrabold italic text-lg tracking-wide">
          FLASH SALE
        </span>
        <Link
          href="#"
          className="bg-primary-500 hover:bg-primary-600 text-white text-xs md:text-sm font-semibold px-4 py-1.5 rounded-md transition-colors"
        >
          Shop Fast
        </Link>
      </div>




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