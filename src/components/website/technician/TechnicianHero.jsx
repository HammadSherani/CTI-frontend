import Image from 'next/image';
import { Icon } from '@iconify/react';

const TechnicianHero = ({ technician }) => {
  return (
    <section className="container mx-auto my-10 px-4 sm:px-6 lg:px-8 relative w-full h-[450px] bg-gray-200 overflow-hidden">
      {/* Background Image */}
      <Image
        src={technician.coverImageUrl}
        alt={`${technician.name} - cover photo`}
        fill
        className="object-cover"
        priority
      />
      
      {/* Overlay Card */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 z-10 container">
        <div className="bg-white rounded-lg shadow-2xl p-6 flex items-center gap-6 max-w-2xl">
          {/* Small Profile Image */}
          <div className="relative w-40 h-40 rounded-md overflow-hidden flex-shrink-0">
            <Image
              src={technician.imageUrl}
              alt={technician.name}
              fill
              className="object-cover"
            />
          </div>
          
          {/* Details */}
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold text-gray-800">{technician.name}</h1>
              <div className="flex items-center gap-4 text-sm font-semibold ml-4">
                {technician.isFeatured && <span className="text-green-600">Featured</span>}
                {technician.isMostPopular && <span className="text-gray-800">Most Popular</span>}
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
              <Icon icon="mdi:star" className="text-yellow-400 w-5 h-5" />
              <span className="font-semibold text-gray-700">{technician.rating}</span>
              <span>({technician.reviews} Review)</span>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {technician.description}
            </p>

            <div className="space-y-2 text-sm">
               <div className="flex items-center gap-2 text-gray-700">
                 <Icon icon="mdi:map-marker-outline" className="w-5 h-5 text-gray-500" />
                 <span>{technician.location}</span>
               </div>
               <div className="flex items-center gap-2 text-gray-700">
                 <Icon icon="mdi:briefcase-outline" className="w-5 h-5 text-gray-500" />
                 <span>{technician.experience}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnicianHero;