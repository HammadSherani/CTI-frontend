import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import Image from 'next/image';

export default function ProductGalleryModal({ isOpen, onClose, mediaList, initialIndex = 0 }) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync index if it changes externally
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(initialIndex);
    }
  }, [initialIndex, isOpen]);

  if (!isOpen || !mounted) return null;

  const currentMedia = mediaList[selectedIndex] || mediaList[0];

  const renderMedia = (media, isMain = false) => {
    const isVideo = typeof media === 'string'
      ? media.match(/\.(mp4|webm|ogg|mov)$/i)
      : media?.type?.startsWith('video');

    const url = typeof media === 'string' ? media : media?.url;

    if (isVideo) {
      return (
        <video
          src={url}
          controls={isMain}
          autoPlay={isMain}
          muted={!isMain}
          loop
          className={`w-full h-full ${isMain ? 'object-contain' : 'object-cover'}`}
        />
      );
    }

    return (
      <Image
        width={300}
        height={300}
        src={url || '/assets/placeholder.jpg'}
        alt="Gallery media"
        className={`w-full h-full ${isMain ? 'object-contain' : 'object-cover'}`}
      />
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-8">
      <div className="bg-white rounded-[24px] w-full max-w-6xl h-[85vh] flex flex-col md:flex-row overflow-hidden relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        {/* Left Side: Main Media View */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-4 md:p-8 relative">
          <div className="w-full h-full relative rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 flex items-center justify-center">
            {renderMedia(currentMedia, true)}
          </div>
        </div>

        {/* Right Side: Thumbnails */}
        <div className="w-full md:w-[400px] bg-white flex flex-col border-l border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-extrabold text-gray-900">Product Gallery</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
            >
              <Icon icon="mdi:close" className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-thin-scroll">
            <div className="grid grid-cols-3 gap-3">
              {mediaList.map((media, idx) => {
                const isSelected = selectedIndex === idx;
                const isVideo = typeof media === 'string'
                  ? media.match(/\.(mp4|webm|ogg|mov)$/i)
                  : media?.type?.startsWith('video');

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${isSelected
                      ? 'border-primary-500 shadow-md ring-2 ring-primary-100'
                      : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
                      }`}
                  >
                    {renderMedia(media, false)}
                    {isVideo && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-colors hover:bg-black/30">
                        <Icon icon="solar:play-circle-bold" className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
