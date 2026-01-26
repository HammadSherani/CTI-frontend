 'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
// import Button from '@components/ui/button';
import Button from '@/components/ui/button';

const iosProducts = Array.from({ length: 6 }).map(() => ({
  title: 'Yenilenmiş iPhone 13 Pro',
  price: '44.599,00 TL',
  img: '/assets/product/prode6.jpg',
}));

const androidProducts = Array.from({ length: 6 }).map(() => ({
  title: 'Yenilenmiş Galaxy S23',
  price: '44.599,00 TL',
  img: '/assets/product/prode2.jpg',
}));

function ProductCard({ title, price, img }) {
  return (
    <div className="w-full">
      <div className="rounded-lg bg-white  border border-black/5">
        <div className="relative w-full h-48 sm:h-52 px-3 pt-3">
          <Image
            src={img}
            alt={title}
            fill
            className="object-contain"
            sizes="(min-width:1024px) 200px, 33vw"
            priority
          />
        </div>
        <div className="px-4 pb-4 text-center">
          <h6 className="text-base font-semibold text-gray-900">{title}</h6>
        </div>
      </div>

      <div className="text-center p-1">
        <p className="font-medium text-gray-900 text-lg">{price}</p>
        <small className="text-gray-500">'den başlayan fiyatlarla</small>
      </div>
    </div>
  );
}

export default function RefurbishedTabs() {
  const [tab, setTab] = useState('ios');
  const isIOS = tab === 'ios';
  const products = isIOS ? iosProducts : androidProducts;

  return (
    <section className="py-5">
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-lg text-start p-4 sm:p-6"
          style={{ background: 'linear-gradient(to top,rgb(255,253,251), #fcefe7)' }}
        >
          {/* Tabs */}
          <div className="flex justify-end items-start gap-2 mb-4">
            <Button
              size="sm"
              variant={isIOS ? 'primary' : 'ghost'}
              className="rounded-md"
              onClick={() => setTab('ios')}
              aria-pressed={isIOS}
            >
              <span className="inline-flex items-center gap-2">
                <Icon icon="mdi:apple" className="h-4 w-4" />
                iOS Cihazlar
              </span>
            </Button>

            <Button
              size="sm"
              variant={!isIOS ? 'primary' : 'ghost'}
              className="rounded-md"
              onClick={() => setTab('android')}
              aria-pressed={!isIOS}
            >
              <span className="inline-flex items-center gap-2">
                <Icon icon="mdi:android" className="h-4 w-4" />
                Android Cihazlar
              </span>
            </Button>
          </div>

          {/* Content */}
          {isIOS ? (
            <>
              <h2 className="text-3xl font-bold text-gray-700 mb-3">
                Mükemmellikte Bir Adım Önde: iPhone ve Android&#39;de Yenilenmiş Cihazlarla Tanışın!
              </h2>
              <p className="text-gray-600 mb-6 max-w-5xl">
                İster iPhone&#39;un sofistike zarafetiyle tanışın, ister Android&#39;in dinamik performansına
                adım atın. Mükemmellik ve çok iyi kategorisindeki cihazlarımız, aynı sıfır gibi!
              </p>
            </>
          ) : (
            <p className="text-gray-700 mb-6">
              Android&#39;in güçlü performansını keşfedin. Tüm cihazlar özenle yenilenmiş, garantili ve sıfır gibi!
            </p>
          )}

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center">
            {products.map((p, i) => (
              <ProductCard key={i} title={p.title} price={p.price} img={p.img} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
