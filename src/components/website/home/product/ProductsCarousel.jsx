'use client';

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import ProductCard from './productCard';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';

const demoProducts = [
  {
    title: 'Apple iPhone 14 Yenilenmiş',
    img: '/assets/product/prode2.jpg',
    price: '$50.90',
    oldPrice: '$80.90',
    discountAmount: '12,000',
    discountPercent: '61',
    reviews: '5k',
    goldPrice: '$30.90',
    badge: 'Sale',
  },
  {
    title: 'Apple iPhone 14 Yenilenmiş',
    img: '/assets/product/prode6.jpg',
    price: '$50.90',
    oldPrice: '$80.90',
    discountAmount: '12,000',
    discountPercent: '61',
    reviews: '5k',
    goldPrice: '$30.90',
    badge: 'Sale',
  },
  {
    title: 'Apple iPhone 14 Yenilenmiş',
    img: '/assets/product/prode5.jpg',
    price: '$50.90',
    oldPrice: '$80.90',
    discountAmount: '12,000',
    discountPercent: '61',
    reviews: '5k',
    goldPrice: '$30.90',
    badge: 'Sale',
  },
  {
    title: 'Apple iPhone 14 Yenilenmiş',
    img: '/assets/product/prode1.jpg',
    price: '$50.90',
    oldPrice: '$80.90',
    discountAmount: '12,000',
    discountPercent: '61',
    reviews: '5k',
    goldPrice: '$30.90',
    badge: 'Sale',
  },
  {
    title: 'Apple iPhone 14 Yenilenmiş',
    img: '/assets/product/prode3.jpg',
    price: '$50.90',
    oldPrice: '$80.90',
    discountAmount: '12,000',
    discountPercent: '61',
    reviews: '5k',
    goldPrice: '$30.90',
    badge: 'Sale',
  },
  {
    title: 'Apple iPhone 14 Yenilenmiş',
    img: '/assets/product/prode4.jpg',
    price: '$50.90',
    oldPrice: '$80.90',
    discountAmount: '12,000',
    discountPercent: '61',
    reviews: '5k',
    goldPrice: '$30.90',
    badge: 'Sale',
  },
];

export default function ProductsCarousel({
  products = demoProducts,
  title = 'New',
  titleHighlight = 'Products',
  viewMoreHref = '/coming',
  onAdd,
}) {
  const swiperRef = useRef(null);
const router = useRouter();
  const handleCardClick = (product) => {
    router.push("/coming")
    console.log('Product clicked:', product);
  }
 
  return (
    <section className="py-6 px-2 max-w-7xl mx-auto">
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-extrabold text-gray-800">
          <span className="text-orange-500">{titleHighlight}</span>
          {" "}
          {title}{' '}
        </h2>

        <a
          href={viewMoreHref}
          className="text-sm font-semibold text-orange-500 hover:text-orange-600 hover:underline transition-colors"
        >
          View More
        </a>
      </div>

      {/* ── Carousel Wrapper ── */}
      <div className="relative">
        {/* Left / Right Buttons */}
        <button
          type="button"
          aria-label="Previous"
          onClick={() => swiperRef.current?.slidePrev()}
          className="w-9 h-9 absolute top-1/2 -translate-y-1/2 -left-4 z-20 flex items-center justify-center rounded-lg bg-black text-white border border-gray-200 shadow-sm hover:bg-gray-800 hover:border-orange-300 transition-all"
        >
          <Icon icon="mdi:chevron-left" className="w-5 h-5 text-white" />
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => swiperRef.current?.slideNext()}
          className="w-9 h-9 absolute top-1/2 -translate-y-1/2 -right-4 z-20 flex items-center justify-center rounded-lg bg-black text-white border border-gray-200 shadow-sm hover:bg-gray-800 hover:border-orange-300 transition-all"
        >
          <Icon icon="mdi:chevron-right" className="w-5 h-5 text-white" />
        </button>

        {/* ── Swiper ── */}
        <Swiper
          onSwiper={(s) => (swiperRef.current = s)}
          spaceBetween={12}
          breakpoints={{
            0:    { slidesPerView: 1.2 },
            480:  { slidesPerView: 2 },
            640:  { slidesPerView: 2.5 },
            768:  { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 4.5 },
          }}
          className="!pb-3"
        >
          {products.map((p, i) => (
            <SwiperSlide key={i} style={{ height: 'auto' }}>
              <ProductCard
                title={p.title}
                img={p.img}
                price={p.price}
                oldPrice={p.oldPrice}
                discountAmount={p.discountAmount}
                discountPercent={p.discountPercent}
                reviews={p.reviews}
                goldPrice={p.goldPrice}
                badge={p.badge}
                onAdd={() =>handleCardClick(p)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}