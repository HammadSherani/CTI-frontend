import Image from 'next/image';

// An array to hold the partner logo data for easy management.
const partnerLogos = [
  { src: '/assets/marque/image1.png', alt: 'Nokia' },
  { src: '/assets/marque/image2.png', alt: 'Motorola' },
  { src: '/assets/marque/image3.png', alt: 'Xiaomi' },
  { src: '/assets/marque/image4.png', alt: 'Realme' },
  { src: '/assets/marque/image5.png', alt: 'OnePlus' },
  { src: '/assets/marque/image6.png', alt: 'Oppo' },
  { src: '/assets/marque/image7.png', alt: 'Vivo' },
  { src: '/assets/marque/image8.png', alt: 'Samsung' },
  { src: '/assets/marque/image9.png', alt: 'Apple' },
  { src: '/assets/marque/image10.png', alt: 'Honor' },
];

export default function OurPartners() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-8 md:p-10 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Text Content Section */}
          <div className="lg:w-5/12 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2.5 mb-2">
              <span className="w-3 h-3 bg-black rounded-full"></span>
              <span className="text-gray-500 font-semibold tracking-widest text-xs">
                OUR PARTNERS
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Our reliable partner for device
            </h2>
          </div>

          {/* Logos Section */}
          <div className="lg:w-7/12 w-full">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-x-8 gap-y-6">
              {partnerLogos.map((logo, index) => (
                <div key={index} className="relative flex items-center justify-center h-12">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    fill
                    sizes="(max-width: 768px) 10vw, 8vw"
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}