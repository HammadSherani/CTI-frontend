'use client';

// Full screen photo / video viewer. Arrow keys or the side buttons move, Esc closes.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';

export default function MediaViewer({ media, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const count = media.length;
  const current = media[index] || media[0];
  const move = (step) => setIndex((i) => (i + step + count) % count);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') setIndex((i) => (i + 1) % count);
      if (event.key === 'ArrowLeft') setIndex((i) => (i - 1 + count) % count);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // the page behind must not scroll
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [count, onClose]);

  if (!current) return null;

  const round = 'w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer';

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Media viewer" onClick={onClose}
      className="fixed inset-0 z-[99999] bg-black/95 flex flex-col">
      <div className="flex items-center justify-between p-4 text-white" onClick={(e) => e.stopPropagation()}>
        <span className="text-sm font-semibold">{index + 1} / {count}</span>
        <button type="button" onClick={onClose} aria-label="Close" className={round}>
          <Icon icon="mdi:close" className="w-6 h-6" />
        </button>
      </div>

      <div className="relative flex-1 min-h-0 flex items-center justify-center px-4 sm:px-20 pb-4">
        <div onClick={(e) => e.stopPropagation()} className="w-full h-full flex items-center justify-center">
          {current.type === 'video' ? (
            <video key={current.url} src={current.url} controls autoPlay className="max-w-full max-h-full" />
          ) : (
            <img src={current.url} alt={`Photo ${index + 1}`} className="max-w-full max-h-full object-contain" />
          )}
        </div>
        {count > 1 && (
          <>
            <button type="button" aria-label="Previous" onClick={(e) => { e.stopPropagation(); move(-1); }} className={`${round} absolute left-3 top-1/2 -translate-y-1/2`}>
              <Icon icon="mdi:chevron-left" className="w-7 h-7" />
            </button>
            <button type="button" aria-label="Next" onClick={(e) => { e.stopPropagation(); move(1); }} className={`${round} absolute right-3 top-1/2 -translate-y-1/2`}>
              <Icon icon="mdi:chevron-right" className="w-7 h-7" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex justify-center gap-2 p-4 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
          {media.map((item, i) => (
            <button key={item.url} type="button" onClick={() => setIndex(i)} aria-label={`Show ${i + 1}`}
              className={`relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer ${i === index ? 'border-primary-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
              {item.type === 'video' ? (
                <>
                  <video src={item.url} muted className="w-full h-full object-cover" />
                  <Icon icon="mdi:play-circle" className="absolute inset-0 m-auto w-6 h-6 text-white" />
                </>
              ) : (
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
