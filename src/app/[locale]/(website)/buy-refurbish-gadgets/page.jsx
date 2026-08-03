'use client'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation, Thumbs } from 'swiper/modules'
import { useRef, useState } from 'react'
// import { Star, ChevronRight } from 'lucide-react'
import { Icon } from '@iconify/react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import Link from 'next/link'

export default function Refurbish() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const mainSwiperRef = useRef(null)
  const flashSaleSwiperRef = useRef(null)

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
  const flashSaleProducts = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&q=80&w=600',
      title: 'Samsung Galaxy S23 Ultra 5G - Refurbished',
      rating: 4.5,
      badge: 'Lowest Price',
      discount: 17,
      mrp: 61680,
      price: 51199,
      goldPrice: 49587,
      href: '#',
      isVideo: false,
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1595941069915-4ebc5197c14a?auto=format&fit=crop&q=80&w=600',
      title: 'Samsung Galaxy Z Flip7 FE 5G - Refurbished',
      rating: 4.6,
      badge: 'Lowest Price',
      discount: 35,
      mrp: 98614,
      price: 64099,
      goldPrice: 62229,
      href: '#',
      isVideo: false,
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600',
      videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-smart-phone-in-a-sunny-day-41619-large.mp4',
      title: 'OPPO Find X8 5G - Refurbished',
      rating: 5.0,
      badge: 'Lowest Price',
      discount: 44,
      mrp: 96784,
      price: 54199,
      goldPrice: 52527,
      href: '#',
      isVideo: true,
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600',
      title: 'Apple Watch Series 10 (46mm, GPS+Cellular)',
      rating: 4.9,
      badge: 'Lowest Price',
      discount: 43,
      mrp: 51928,
      price: 29599,
      goldPrice: 35671,
      href: '#',
      isVideo: false,
    },
    {
      id: 5,
      src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600',
      videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-in-a-coffee-shop-41618-large.mp4',
      title: 'Apple Macbook Air 13 A3241 (Apple M4 15)',
      rating: null,
      badge: 'Lowest Price',
      discount: 26,
      mrp: 136485,
      price: 100999,
      goldPrice: 98391,
      href: '#',
      isVideo: true,
    },
    {
      id: 6,
      src: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600',
      title: 'iPhone 15 Pro Max 5G - Refurbished',
      rating: 4.7,
      badge: 'Lowest Price',
      discount: 22,
      mrp: 115000,
      price: 89999,
      goldPrice: 86999,
      href: '#',
      isVideo: false,
    },
  ]


  // Categories Data
  // Categories Data with Images
  const categories = [
    {
      id: 1,
      name: 'Smartphones',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop&q=80',
      href: '/category/smartphones',
      bgColor: 'bg-blue-50',
    },
    {
      id: 2,
      name: 'Laptops',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop&q=80',
      href: '/category/laptops',
      bgColor: 'bg-indigo-50',
    },
    {
      id: 3,
      name: 'Smartwatches',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop&q=80',
      href: '/category/smartwatches',
      bgColor: 'bg-amber-50',
    },
    {
      id: 4,
      name: 'Tablets',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&h=200&fit=crop&q=80',
      href: '/category/tablets',
      bgColor: 'bg-green-50',
    },
    {
      id: 5,
      name: 'Gaming Consoles',
      image: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=200&h=200&fit=crop&q=80',
      href: '/category/gaming',
      bgColor: 'bg-pink-50',
    },
    {
      id: 6,
      name: 'Cameras & Lenses',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop&q=80',
      href: '/category/cameras',
      bgColor: 'bg-slate-100',
    },
    {
      id: 7,
      name: 'Audio Devices',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&h=200&fit=crop&q=80',
      href: '/category/audio',
      bgColor: 'bg-orange-50',
    },
    {
      id: 8,
      name: 'Amazon Devices',
      image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=200&h=200&fit=crop&q=80',
      href: '/category/amazon',
      bgColor: 'bg-amber-50',
    },
    // {
    //   id: 9,
    //   name: 'New Accessories',
    //   image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=200&h=200&fit=crop&q=80',
    //   href: '/category/accessories',
    //   bgColor: 'bg-blue-50',
    // },
    // {
    //   id: 10,
    //   name: 'Openbox Accessories',
    //   image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=200&h=200&fit=crop&q=80',
    //   href: '/category/openbox',
    //   bgColor: 'bg-orange-50',
    // },
    // {
    //   id: 11,
    //   name: 'Fitbit Band & Watches',
    //   image: 'https://images.unsplash.com/photo-1575311373937-7dd8ff5a9c6f?w=200&h=200&fit=crop&q=80',
    //   href: '/category/fitbit',
    //   bgColor: 'bg-cyan-50',
    // },
  ]

  const section1 = [
    {
      id: 1,
      title: 'Best Selling',
      highlight: 'Android Phones',
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=500&fit=crop&q=80',
      bgGradient: 'from-emerald-50 via-green-50 to-lime-50',
      href: '/category/android-phones',
    },
    {
      id: 2,
      title: 'Best Selling',
      highlight: 'Apple Phones',
      image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=600&h=500&fit=crop&q=80',
      bgGradient: 'from-slate-50 via-indigo-50 to-violet-50',
      href: '/category/apple-phones',
    },
  ]

  const formatPrice = (num) => `₹${num.toLocaleString('en-IN')}`

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
          className="custom-prev absolute left-4 top-1/2 z-10 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all duration-200 hover:scale-110"
          aria-label="Previous slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          className="custom-next absolute right-4 top-1/2 z-10 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all duration-200 hover:scale-110"
          aria-label="Next slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Categories Grid with Images */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 mt-4 lg:grid-cols-8 xl:grid-cols-6 gap-4 pb-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className={`${category.bgColor} rounded-2xl px-1 py-3 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group border border-transparent hover:border-orange-200 flex flex-col items-center gap-3`}
          >
            <span className="text-[10px] font-semibold text-gray-800 group-hover:text-orange-500 transition-colors text-center leading-snug  flex items-center">
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
        ))}
      </div>

      {/* Flash Sale Strip Banner */}
      <div className="relative mt-6 rounded-lg overflow-hidden bg-gradient-to-r from-[#0b1229] via-[#141b3d] to-[#0b1229] h-14 flex items-center justify-center gap-4 px-6">
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

      {/* Flash Sale Products Section */}
      <div className="mt-6 relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Flash Sale</h2>
          <Link
            href="#"
            className="text-sm font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1"
          >
            View All
            {/* <ChevronRight className="w-4 h-4" /> */}
          </Link>
        </div>

        <div className="relative">
          <Swiper
            modules={[Navigation]}
            spaceBetween={16}
            slidesPerView={2}
            navigation={{
              prevEl: '.flash-prev',
              nextEl: '.flash-next',
            }}
            onSwiper={(swiper) => (flashSaleSwiperRef.current = swiper)}
            breakpoints={{
              480: { slidesPerView: 2 },
              640: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 5 },
            }}
            className="!pb-2"
          >
            {flashSaleProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <Link
                  href={product.href}
                  className="group block border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Image */}
                  <div className="relative w-full h-[320px] bg-gray-50">
                    <span className="absolute top-2 left-2 z-10 bg-primary-600 text-white text-[11px] font-medium px-2 py-0.5 rounded">
                      {product.badge}
                    </span>
                    {product.rating && (
                      <span className="absolute top-2 right-2 z-10 bg-white/90 text-[11px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        {product.rating.toFixed(1)}
                        {/* <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> */}
                      </span>
                    )}
                    <Image
                      src={product.src}
                      alt={product.title}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300 group-hover:opacity-0"
                    />
                    {product.isVideo && product.videoSrc && (
                      <video
                        src={product.videoSrc}
                        className="absolute inset-0 w-full h-full object-cover hidden group-hover:block"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    )}
                    {product.isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center group-hover:hidden">
                        <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[10px] border-l-white border-y-[6px] border-y-transparent ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px]">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-red-500 text-xs font-semibold">
                        -{product.discount}%
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <div className="mt-2 inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded">
                      {formatPrice(product.goldPrice)} with GOLD
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Flash Sale Nav Buttons */}
          <button
            className="flash-prev absolute left-0 top-1/3 z-10 -translate-y-1/2 -translate-x-3 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 hidden md:flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Previous products"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="flash-next absolute right-0 top-1/3 z-10 -translate-y-1/2 translate-x-3 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 hidden md:flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Next products"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>


      {/* Flash Sale Products Section */}
      <div className="mt-6 relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Top Selling Devices</h2>
          <Link
            href="#"
            className="text-sm font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1"
          >
            View All
            {/* <ChevronRight className="w-4 h-4" /> */}
          </Link>
        </div>

        <div className="relative">
          <Swiper
            modules={[Navigation]}
            spaceBetween={16}
            slidesPerView={2}
            navigation={{
              prevEl: '.flash-prev',
              nextEl: '.flash-next',
            }}
            onSwiper={(swiper) => (flashSaleSwiperRef.current = swiper)}
            breakpoints={{
              480: { slidesPerView: 2 },
              640: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 5 },
            }}
            className="!pb-2"
          >
            {flashSaleProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <Link
                  href={product.href}
                  className="group block border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Image */}
                  <div className="relative w-full h-[320px] bg-gray-50">
                    <span className="absolute top-2 left-2 z-10 bg-primary-600 text-white text-[11px] font-medium px-2 py-0.5 rounded">
                      {product.badge}
                    </span>
                    {product.rating && (
                      <span className="absolute top-2 right-2 z-10 bg-white/90 text-[11px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        {product.rating.toFixed(1)}
                        {/* <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> */}
                      </span>
                    )}
                    <Image
                      src={product.src}
                      alt={product.title}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300 group-hover:opacity-0"
                    />
                    {product.isVideo && product.videoSrc && (
                      <video
                        src={product.videoSrc}
                        className="absolute inset-0 w-full h-full object-cover hidden group-hover:block"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    )}
                    {product.isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center group-hover:hidden">
                        <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[10px] border-l-white border-y-[6px] border-y-transparent ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px]">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-red-500 text-xs font-semibold">
                        -{product.discount}%
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <div className="mt-2 inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded">
                      {formatPrice(product.goldPrice)} with GOLD
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Flash Sale Nav Buttons */}
          <button
            className="flash-prev absolute left-0 top-1/3 z-10 -translate-y-1/2 -translate-x-3 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 hidden md:flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Previous products"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="flash-next absolute right-0 top-1/3 z-10 -translate-y-1/2 translate-x-3 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 hidden md:flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Next products"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 mt-20 md:grid-cols-2 gap-4">
        <div>
          <Image src='/assets/refurbish/sections/1.webp' width={500} height={500} alt="1" className='rounded-lg' />
        </div>
        <div>
          <Image src='/assets/refurbish/sections/2.avif' width={500} height={500} alt="1" className='rounded-lg' />
        </div>
      </div>

      {/* EMI Strip Banner */}
      {/* <div className="relative mt-4 rounded-xl overflow-hidden bg-gradient-to-r from-white via-blue-50 to-blue-100 border border-blue-100 h-[110px] flex items-center justify-between px-8">
        <div>
          <p className="text-base md:text-lg text-gray-800">
            Shop latest smartphones on{' '}
            <span className="text-amber-600 font-semibold">Easy EMIs</span> with{' '}
            <span className="text-blue-700 font-semibold">Insta EMI Card</span>
          </p>
          <p className="text-sm md:text-base font-bold text-gray-900 mt-1">
            Limit up to ₹3 Lakhs | ₹1,000 Cashback
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <button className="bg-blue-800 hover:bg-blue-900 text-white text-sm font-bold px-6 py-3 rounded-full transition-colors whitespace-nowrap">
            APPLY NOW
          </button>

          <div className="relative w-20 h-20 shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=200&h=200&fit=crop&q=80"
              alt="Smartphones"
              fill
              className="object-contain"
            />
          </div>

          <div className="flex flex-col items-start shrink-0">
            <span className="text-2xl font-bold text-blue-700 leading-none">B</span>
            <span className="text-[10px] font-semibold text-gray-700 tracking-wide -mt-1">
              FINANCE
            </span>
            <span className="text-[9px] text-gray-400">*T&C apply</span>
          </div>
        </div>
      </div> */}

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
    </div >
  )
}