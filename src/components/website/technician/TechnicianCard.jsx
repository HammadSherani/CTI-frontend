'use client';
import Image from 'next/image';
import { Icon } from '@iconify/react';

const TechnicianCard = ({ technician }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200/80 shadow-sm hover:shadow-lg transition-all duration-300 flex overflow-hidden">
      {/* Image Section */}
      <div className="w-1/3 min-w-[150px] relative">
        <Image
          src={technician.imageUrl}
          alt={technician.name}
          fill
          className="object-cover"
        />
      </div>
      
      {/* Details Section */}
      <div className="w-2/3 p-5 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{technician.name}</h3>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
              <Icon icon="mdi:star" className="text-yellow-400 w-5 h-5" />
              <span className="font-semibold text-gray-700">{technician.rating}</span>
              <span>({technician.reviews} Review)</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            {technician.isFeatured && <span className="text-green-600">Featured</span>}
            {technician.isMostPopular && <span className="text-gray-800">Most Popular</span>}
          </div>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed my-3">
          {technician.description}
        </p>
        
        <div className="mt-auto space-y-2 text-sm">
           <div className="flex items-center gap-2 text-gray-700">
             <Icon icon="mdi:map-marker-outline" className="w-5 h-5 text-gray-500" />
             <span>{technician.location}</span>
           </div>
           <div className="flex items-center gap-2 text-gray-700">
             <Icon icon="mdi:briefcase-outline" className="w-5 h-5 text-gray-500" />
             <span>{technician.experience}</span>
           </div>
        </div>
        
        <a href="#" className="text-primary-600 font-semibold text-sm mt-4 hover:underline self-start">
          Select
        </a>
      </div>
    </div>
  );
};

export default TechnicianCard;