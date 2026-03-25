import React from 'react'
import SectionTag from './sectoinTag'
import { Icon } from '@iconify/react'
import Image from 'next/image'

export default function OurDeals() {

  const data = [
    {
      title: "Refurbished Device Offers",
      img: "/assets/home/deals.png",
      gradient: "from-yellow-400 via-yellow-500 to-yellow-600"
    },
    {
      title: "Exchange Offers",
      img: "/assets/home/deals.png",
      gradient: "from-orange-500 via-orange-600 to-orange-700"
    },
    {
      title: "Buyback Offers",
      img: "/assets/home/deals.png",
      gradient: "from-gray-800 via-gray-900 to-black"
    },
    {
      title: "Special Offers",
      img: "/assets/home/deals.png",
      gradient: "from-orange-400 via-orange-500 to-orange-600"
    }
  ]

  return (
    <div className="py-12">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-6 mb-12 px-4">
        <div className="lg:max-w-xl">
          <SectionTag title="Our Deals" />
          <h2 className="text-3xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
            Hot <span className="text-primary-500">Deals</span>
          </h2>
          <p className="text-gray-600 mt-2">
            Exciting offers for more value
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        
        {data.map((item, i) => (
          <div
            key={i}
            className={`relative rounded-2xl overflow-hidden p-6 bg-gradient-to-br ${item.gradient}`}
          >
            {/* decorative circles */}
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/10" />

            {/* Content */}
            <div className="flex flex-col justify-between h-full">
              
              {/* Top */}
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-white text-lg font-bold leading-snug max-w-[60%]">
                  {item.title}
                </h3>

                <Image
                  src={item.img}
                  alt={item.title||"deal"}
                  width={120}
                  height={160}
                  className="object-contain"
                />
              </div>

              {/* Button */}
              <button className="mt-6 flex items-center gap-1 w-fit bg-white text-orange-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-orange-50 active:scale-95 transition">
                Explore
                <Icon icon="mdi:chevron-right" />
              </button>

            </div>
          </div>
        ))}

      </div>
    </div>
  )
}