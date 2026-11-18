"use client"

// Full-screen image viewer for chat pictures (instead of opening a new tab), WhatsApp style:
// thumbnail shows at once and the full image replaces it when loaded, arrows / ← → move through
// the chat's images, click to zoom, Esc / ✕ / backdrop to close, download button.
import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';

export default function ImageViewer({ images, index, onIndexChange, onClose, captionFor }) {
    const item = images[index];
    const [fullLoaded, setFullLoaded] = useState(false);
    const [zoomed, setZoomed] = useState(false);
    const [touchX, setTouchX] = useState(null);

    const full = item?.localUrl || item?.mediaUrl;
    const preview = item?.thumbnailUrl || item?.blurDataUrl;

    useEffect(() => {
        setFullLoaded(false);
        setZoomed(false);
    }, [index]);

    const go = useCallback((delta) => {
        const next = index + delta;
        if (next >= 0 && next < images.length) onIndexChange(next);
    }, [index, images.length, onIndexChange]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowLeft') go(-1);
            else if (e.key === 'ArrowRight') go(1);
        };
        window.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [go, onClose]);

    const download = async () => {
        if (!full) return;
        try {
            // fetch -> blob so the browser saves it instead of opening it
            const res = await fetch(full);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = item.fileName || full.split('/').pop().split('?')[0] || 'image';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch {
            // storage may not allow fetch from the page: fall back to opening it
            window.open(full, '_blank', 'noopener');
        }
    };

    if (!item || typeof document === 'undefined') return null;
    const caption = captionFor?.(item);

    return createPortal(
        <div
            className="fixed inset-0 z-[1000] bg-black/90 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            onClick={onClose}
        >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 text-white" onClick={(e) => e.stopPropagation()}>
                <div className="min-w-0">
                    {caption?.title && <p className="text-sm font-semibold truncate">{caption.title}</p>}
                    {caption?.subtitle && <p className="text-xs text-white/60 truncate">{caption.subtitle}</p>}
                </div>
                <div className="flex items-center gap-1">
                    {images.length > 1 && (
                        <span className="text-xs text-white/70 mr-2">{index + 1} / {images.length}</span>
                    )}
                    <button type="button" onClick={() => setZoomed((z) => !z)} className="p-2 rounded-full hover:bg-white/10" aria-label={zoomed ? 'Zoom out' : 'Zoom in'}>
                        <Icon icon={zoomed ? 'mdi:magnify-minus-outline' : 'mdi:magnify-plus-outline'} width={22} />
                    </button>
                    <button type="button" onClick={download} className="p-2 rounded-full hover:bg-white/10" aria-label="Download">
                        <Icon icon="mdi:download" width={22} />
                    </button>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/10" aria-label="Close">
                        <Icon icon="mdi:close" width={24} />
                    </button>
                </div>
            </div>

            {/* Image */}
            <div
                className={`relative flex-1 min-h-0 flex items-center justify-center px-2 sm:px-14 pb-4 ${zoomed ? 'overflow-auto' : 'overflow-hidden'}`}
                onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
                onTouchEnd={(e) => {
                    if (touchX == null || zoomed) return;
                    const dx = e.changedTouches[0].clientX - touchX;
                    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
                    setTouchX(null);
                }}
            >
                {/* small preview while the full image downloads */}
                {!fullLoaded && preview && (
                    <img src={preview} alt="" aria-hidden className="absolute max-w-[90%] max-h-[85%] object-contain blur-sm opacity-80" />
                )}
                {!fullLoaded && (
                    <span className="absolute animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white" />
                )}
                {full && (
                    <img
                        key={full}
                        src={full}
                        alt={item.fileName || 'Image'}
                        onLoad={() => setFullLoaded(true)}
                        onClick={(e) => {
                            e.stopPropagation();
                            setZoomed((z) => !z);
                        }}
                        className={`relative select-none transition-opacity duration-200 ${fullLoaded ? 'opacity-100' : 'opacity-0'} ${zoomed
                            ? 'max-w-none cursor-zoom-out'
                            : 'max-w-full max-h-full object-contain cursor-zoom-in'}`}
                        draggable={false}
                    />
                )}

                {images.length > 1 && index > 0 && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); go(-1); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center"
                        aria-label="Previous image"
                    >
                        <Icon icon="mdi:chevron-left" width={28} />
                    </button>
                )}
                {images.length > 1 && index < images.length - 1 && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); go(1); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center"
                        aria-label="Next image"
                    >
                        <Icon icon="mdi:chevron-right" width={28} />
                    </button>
                )}
            </div>

            {caption?.text && (
                <p className="text-center text-sm text-white/90 px-6 pb-5 max-h-24 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    {caption.text}
                </p>
            )}
        </div>,
        document.body
    );
}
