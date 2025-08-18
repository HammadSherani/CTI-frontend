import Image from 'next/image';

const bannerData = [
  {
    title: 'Protective Sleeves',
    description: 'It is a long established fact that a reader will be distracted.',
    imgSrc: '/assets/home/add1.png',
    alt: 'A silver laptop',
    link: '#',
  },
  {
    title: 'Nutrillet Blender',
    description: 'It is a long established fact that a reader will be distracted.',
    imgSrc: '/assets/home/add2.png',
    alt: 'A modern black smartphone',
    link: '#',
  },
];

export default function PromotionalBanners() {
  return (
    <section className="bg-[#f8f9fa] py-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {bannerData.map((banner, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 py-6"
            >
              <div className="text-center sm:text-left flex-shrink-0 max-w-sm">
                <h3 className="text-3xl font-semibold text-gray-800 mb-3">{banner.title}</h3>
                <p className="text-gray-500 mb-8">{banner.description}</p>
                <a
                  href={banner.link}
                  className="font-bold text-gray-800 text-sm tracking-widest hover:text-gray-600 transition-colors"
                >
                  SHOP NOW
                </a>
              </div>
              <div className="relative w-52 h-40 sm:w-64 sm:h-52 flex-shrink-0">
                <Image
                  src={banner.imgSrc}
                  alt={banner.alt}
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 640px) 208px, 256px"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}