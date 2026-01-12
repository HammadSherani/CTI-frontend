'use client';

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import ProductCard from './productCard';
import { Icon } from '@iconify/react';

const demoProducts = [
  {
    title: 'Apple iPhone 14 Yenilenmiş',
    img: '/assets/product/prode2.jpg',
    price: '$49.50',
    oldPrice: '$55.50',
    discountPercent: 54,
    badge: { kind: 'fast', text: 'HIZLI TESLİMAT' },
  },
  {
    title: 'Apple iPhone 14 Yenilenmiş',
    img: '/assets/product/prode6.jpg',
    price: '$49.50',
    oldPrice: '$55.50',
    discountPercent: 54,
    badge: { kind: 'fast', text: 'HIZLI TESLİMAT' },
  },
  {
    title: 'Apple iPhone 14 Yenilenmiş',
    img: '/assets/product/prode2.jpg',
    price: '$49.50',
    oldPrice: '$55.50',
    discountPercent: 54,
    badge: { kind: 'free', text: 'KARGO BEDAVA' },
  },
  {
    title: 'Apple iPhone 14 Yenilenmiş',
    img: '/assets/product/prode5.jpg',
    price: '$49.50',
    oldPrice: '$55.50',
    discountPercent: 54,
    badge: { kind: 'fast', text: 'HIZLI TESLİMAT' },
  },
  {
    title: 'Apple iPhone 14 Yenilenmiş',
    img: '/assets/product/prode1.jpg',
    price: '$49.50',
    oldPrice: '$55.50',
    discountPercent: 54,
    badge: { kind: 'free', text: 'KARGO BEDAVA' },
  },
  {
    title: 'Apple iPhone 14 Yenilenmiş',
    img: '/assets/product/prode2.jpg',
    price: '$49.50',
    oldPrice: '$55.50',
    discountPercent: 54,
    badge: { kind: 'fast', text: 'HIZLI TESLİMAT' },
  },
];

export default function ProductsCarousel({ products = demoProducts, title = 'New Products', onAdd }) {
  const swiperRef = useRef(null);

  return (
    <section className="py-6">
      <div>
        <div
          className="rounded-2xl "
          // style={{ background: 'linear-gradient(to top, rgb(255,253,251), #fcefe7)' }}
        >
          {/* header */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-700">{title}</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Prev"
                onClick={() => swiperRef.current?.slidePrev()}
                className="grid h-10 w-10 place-items-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
              >
                <Icon icon="mdi:chevron-left" className="h-6 w-6 text-gray-700" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => swiperRef.current?.slideNext()}
                className="grid h-10 w-10 place-items-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
              >
                <Icon icon="mdi:chevron-right" className="h-6 w-6 text-gray-700" />
              </button>
            </div>
          </div>

          {/* swiper */}
          <Swiper
            onSwiper={(s) => (swiperRef.current = s)}
            spaceBetween={10}
            slidesPerView={'auto'}
            breakpoints={{
              0: { slidesPerView: 1.15 },
              480: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 5 },
            }}
          >
            {products.map((p, i) => (
              <SwiperSlide key={i} className="pb-2 h-auto">
                <ProductCard
                  title={p.title}
                  img={p.img}
                  price={p.price}
                  oldPrice={p.oldPrice}
                  discountPercent={p.discountPercent}
                  badge={p.badge}
                  onAdd={() => (onAdd ? onAdd(p) : null)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}