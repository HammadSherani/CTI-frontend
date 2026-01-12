'use client';

import Image from 'next/image';
import { Icon } from '@iconify/react';

function ShippingBadge({ kind = 'fast', text }) {
  const isFast = kind === 'fast';
  return (
    <div
      className={`absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-[12px] font-bold uppercase tracking-wide
      ${isFast ? 'bg-[#168848] text-white' : 'bg-[#2E3238] text-white'}`}
    >
      <Icon icon={'mdi:truck-fast-outline'} className="h-5 w-5" />
      <span className="font-medium leading-3.5 text-[13px]">
  {text.split(" ")[0]} <br /> {text.split(" ")[1]}
</span>

    </div>
  );
}

function DiscountBadge({ percent }) {
  if (!percent) return null;
  return (
    <div className="absolute right-3 top-3 z-10 rounded-md bg-[#FCE8EC] px-2 py-0.5 text-[12px] font-bold text-red-600">
      -{percent}% Off
    </div>
  );
}

export default function ProductCard({
  title,
  img,
  price,
  oldPrice,
  discountPercent,
  badge = { kind: 'fast', text: 'HIZLI TESLİMAT' },
  onAdd,
}) {
  return (
    <div className="relative flex h-full flex-col rounded-md border border-slate-200 bg-white transition">
      {badge && <ShippingBadge kind={badge.kind} text={badge.text} />}
      <DiscountBadge percent={discountPercent} />

      <div className="relative mx-auto mt-14 mb-4 h-56 w-[86%]">
        <Image
          src={img}
          alt={title}
          fill
          sizes="(min-width:1024px) 240px, 40vw"
          className="object-contain"
          priority
        />
      </div>

      <div className="flex-grow px-4 pb-4 flex flex-col">
        <p className="text-[13px] font-semibold text-red-600">Flash Sale</p>

        <h3
          title={title}
          className="mt-1 max-w-[260px] truncate text-[16px] font-semibold text-[#1e1e1e]"
        >
          {title}
        </h3>
        <div className="flex-grow" />
        <div className="mt-1 flex items-end gap-2">
          {oldPrice && <span className="text-[16px] text-gray-400 line-through">{oldPrice}</span>}
          <span className="text-[20px] font-medium text-[#1e1e1e]">{price}</span>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="mt-3 w-full rounded-lg border-none py-2 text-base font-medium text-gray-800 hover:bg-primary-100 cursor-pointer bg-primary-50 transition-all duration-300" 
        >
          Coming Soon
        </button>
      </div>
    </div>
  );
}