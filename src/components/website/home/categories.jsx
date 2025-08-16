'use client';

import Image from 'next/image';

const categoriesData = [
  { name: 'Yemek', label: 'Web Sitesi Açıldı', bg: 'bg-[#FEA621]', outline: 'outline-[#FEA621]', image: null },
  { name: 'Dizüstü Bilgisayar Acer', label: null, bg: 'bg-[#C2EEFF]', outline: 'outline-[#FEA621]', image: '/assets/category/cat-11.png' },
  { name: 'I Phone 16 Pro', label: null, bg: 'bg-[#FDE7E7]', outline: 'outline-[#FEA621]', image: '/assets/category/cat-10.png' },
  { name: 'Dizüstü bilgisayar', label: null, bg: 'bg-[#E9F4CF]', outline: 'outline-[#FEA621]', image: '/assets/category/cat-7.png' },
  { name: 'Mobil narzo', label: null, bg: 'bg-[#C2EEFF]', outline: 'outline-[#FEA621]', image: '/assets/category/cat-9.png' },
  { name: 'I Phone 13 Pro', label: null, bg: 'bg-[#FDEBEF]', outline: 'outline-[#FEA621]', image: '/assets/category/cat-13.png' },
  { name: "Macbook'um", label: null, bg: 'bg-[#E9F4CF]', outline: 'outline-[#FEA621]', image: '/assets/category/cat-8.png' },
  { name: 'Akıllı Saat', label: null, bg: 'bg-[#FEE7D9]', outline: 'outline-[#FEA621]', image: '/assets/category/cat-12.png' },
];

export default function Categories() {
  return (
    <section className="py-6">
      <div className='max-w-7xl mx-auto'>
        <div className="bg-white py-6 px-6 rounded-[1.25rem] shadow-sm">
          <h3 className="font-semibold text-gray-600 text-lg md:text-xl mb-5">
            Kategoriler
          </h3>

          {/* GRID - all items in 1 row on large screens */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
            {categoriesData.map((c, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center cursor-pointer"
              >
                <div
                  className={`flex justify-center items-center w-[96px] h-[96px] rounded-full outline outline-1 outline-offset-4 ${c.bg} ${c.outline} mb-3`}
                >
                  {c.image ? (
                    <div className="relative w-[70%] h-[70%]">
                      <Image
                        src={c.image}
                        alt={c.name}
                        fill
                        className="object-contain"
                        sizes="96px"
                      />
                    </div>
                  ) : (
                    <span className="px-3 py-1 rounded-md bg-white text-black text-xs font-bold leading-tight shadow-sm">
                      {c.label}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-900">{c.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
