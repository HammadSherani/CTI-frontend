import Image from 'next/image'
import React from 'react'
import Marquee from 'react-fast-marquee'

export default function BrandsMarque() {
  return (
  <div className="w-full p-6 bg-primary-600">
  <Marquee speed={40} gradient={false} pauseOnHover autoFill >
  <div className="flex items-center gap-24">
    
    {[
      "/assets/marque/image1.png",
      "/assets/marque/image2.png",
      "/assets/marque/image3.png",
      "/assets/marque/image4.png",
      "/assets/marque/image5.png",
      "/assets/marque/image6.png",
      "/assets/marque/image7.png",
    ].map((src, i) => (
      <div key={i} className="flex items-center justify-center h-12">
        <Image
          src={src}
          alt={`brand-${i}`}
          width={120} // fallback (required by Next)
          height={40}
          className="h-8 w-auto gap-8 object-contain grayscale hover:grayscale-0 transition-all duration-300"
        />
      </div>
    ))}

  </div>
</Marquee>
    </div>
  )
}
