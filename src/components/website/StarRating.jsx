import { useState } from 'react';

export default function StarRating({ rating, size = 'sm', interactive = false, onChange }) {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm';
  return (
    <div className={`flex gap-0.5 ${sz}`}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = i <= (interactive ? (hovered || rating) : rating);
        const half = !filled && i - 0.5 <= rating;
        return (
          <span
            key={i}
            className={`cursor-${interactive ? 'pointer' : 'default'} ${filled ? 'text-yellow-400' : half ? 'text-yellow-300' : 'text-gray-200'}`}
            onMouseEnter={() => interactive && setHovered(i)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onChange?.(i)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
