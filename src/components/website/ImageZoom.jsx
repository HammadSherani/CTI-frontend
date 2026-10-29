import Image from 'next/image';
import { useState, useRef, useCallback } from 'react';

export default function ImageZoom({ src, alt }) {
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: '50%', y: '50%' });
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(2) + '%';
    const y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(2) + '%';
    setOrigin({ x, y });
  }, []);


  const imageSrc = src || '/assets/placeholder.jpg';

  return (
    <div
      ref={ref}
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMouseMove}
      className="w-full h-full overflow-hidden cursor-zoom-in flex items-center justify-center relative select-none"
    >
      <Image
        key={imageSrc}
        src={imageSrc}
        alt={alt || 'Product image'}
        width={800}
        height={600}
        unoptimized
        className="w-full h-full object-contain transition-transform duration-200 ease-out will-change-transform pointer-events-none p-3"
        style={{
          transform: zoom ? 'scale(1.8)' : 'scale(1)',
          transformOrigin: `${origin.x} ${origin.y}`,
        }}
      />
    </div>
  );
}
