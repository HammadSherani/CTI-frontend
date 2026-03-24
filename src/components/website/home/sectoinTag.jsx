import { Icon } from '@iconify/react';
import React from 'react';

export default function SectionTag({
  title,
  bgColor = 'bg-transparent',
  borderColor = 'border-primary-600',
  dotColor = 'bg-primary-600',
  textColor = 'text-black',
}) {
  return (
    <div
      className={`inline-flex items-center justify-start gap-1 ${bgColor} ${borderColor} border px-2 py-1 rounded-full mb-4 max-w-max`}
    >
      {/* Animated Dot */}
      <span className={`w-3 h-3 ${dotColor} rounded-full animate-pulse`} />
      
      {/* Title */}
      <span className={`font-medium ${textColor} text-[12px]  `}>{title}</span>
    </div>
  );
}