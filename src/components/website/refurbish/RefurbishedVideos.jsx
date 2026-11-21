'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';

// Add or replace YouTube video IDs here.
const VIDEOS = [
  { id: 'w4WfBYH9YQA', title: 'All about refurbished phones' },
  { id: 'gMaInDX9tZE', title: 'Refurbished phone unboxing' },
  { id: 'RgmSWi_vhXA', title: 'Used phone review' },
];

function VideoCard({ video, onOpen }) {
  const [thumb, setThumb] = useState(`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`);

  return (
    <button
      type="button"
      onClick={() => onOpen(video)}
      aria-label={`Play video: ${video.title}`}
      className="group relative w-full aspect-video rounded-xl overflow-hidden bg-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <img
        src={thumb}
        alt={video.title}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        // maxres thumbnails don't exist for every video; fall back to hqdefault
        onError={() => setThumb(`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`)}
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon icon="mdi:play-outline" className="w-7 h-7 text-gray-900" />
        </span>
      </span>
    </button>
  );
}

function VideoModal({ video, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
    >
      <div
        className="relative bg-white rounded-2xl p-3 sm:p-5 w-full max-w-4xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 cursor-pointer"
        >
          <Icon icon="mdi:close" className="w-5 h-5 text-gray-900" />
        </button>
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function RefurbishedVideos() {
  const [active, setActive] = useState(null);

  return (
    <section className="w-full">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-5">Why Choose CTI?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {VIDEOS.map((v) => (
          <VideoCard key={v.id} video={v} onOpen={setActive} />
        ))}
      </div>
      {active && <VideoModal video={active} onClose={() => setActive(null)} />}
    </section>
  );
}
