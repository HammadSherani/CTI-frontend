'use client';

import Image from 'next/image';

const promos = [
  { src: '/assets/logo/promo3.png', alt: 'iPhone – up to 80% off' },
  { src: '/assets/logo/promo4.png', alt: 'Realme – up to 80% off' },
  { src: '/assets/logo/promo5.png', alt: 'Xiaomi – up to 80% off' },
  { src: '/assets/logo/promo10.png', alt: 'iPhone – up to 80% off' },
  { src: '/assets/logo/promo3.png', alt: 'Realme – up to 80% off' },
  { src: '/assets/logo/promo8.png', alt: 'Xiaomi – up to 80% off' },
  { src: '/assets/logo/promo7.png', alt: 'iPhone – up to 80% off' },
  { src: '/assets/logo/promo8.png', alt: 'Realme – up to 80% off' },
  { src: '/assets/logo/promo9.png', alt: 'Xiaomi – up to 80% off' },
];

export default function BottomPromoImages() {
  return (
    <section className="py-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {promos.map((p, i) => (
            <div
              key={i}
              className="relative h-[180px] sm:h-[200px] lg:h-[230px] rounded-xl overflow-hidden"
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                priority={i === 0}
                className="object-cover"
                sizes="(min-width:1024px) 33vw, 100vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
