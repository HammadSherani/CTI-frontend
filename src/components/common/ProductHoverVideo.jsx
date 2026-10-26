'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';

/**
 * Extract first playable video URL from product or variant
 */
export function extractProductVideo(product, defaultVariant) {
  if (!product && !defaultVariant) return null;

  const sources = [
    // 1. Direct video property on product
    typeof product?.videoSrc === 'string' && product.videoSrc.trim() ? product.videoSrc : null,
    typeof product?.video === 'string' && product.video.trim() ? product.video : null,
    product?.video?.url,

    // 2. Videos array on defaultVariant
    Array.isArray(defaultVariant?.videos) && defaultVariant.videos.length > 0
      ? (typeof defaultVariant.videos[0] === 'string' ? defaultVariant.videos[0] : defaultVariant.videos[0]?.url)
      : null,

    // 3. Videos array on product
    Array.isArray(product?.videos) && product.videos.length > 0
      ? (typeof product.videos[0] === 'string' ? product.videos[0] : product.videos[0]?.url)
      : null,

    // 4. Any variant on product that has a video
    Array.isArray(product?.variants)
      ? (() => {
          for (const v of product.variants) {
            if (Array.isArray(v?.videos) && v.videos.length > 0) {
              const u = typeof v.videos[0] === 'string' ? v.videos[0] : v.videos[0]?.url;
              if (u) return u;
            }
          }
          return null;
        })()
      : null,
  ];

  return sources.find(Boolean) || null;
}

/**
 * ProductHoverVideo:
 * Displays product image by default with a subtle video indicator badge.
 * When hovered (or when isCardHovered is true), smoothly fades in and plays
 * the muted video snippet preview. Resets and pauses on mouse leave.
 */
export default function ProductHoverVideo({
  videoSrc,
  posterSrc,
  alt = 'Product image',
  isCardHovered = false,
  className = '',
  imageClassName = '',
  fill = false,
  width = 280,
  height = 280,
  onError,
}) {
  const [internalHover, setInternalHover] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const videoRef = useRef(null);

  const activeHover = isCardHovered || internalHover;
  const canPlayVideo = Boolean(videoSrc && !hasVideoError);

  // Synchronize playback with hover state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !canPlayVideo) return;

    // Ensure audio is muted so browser autoplay policy is never violated
    video.muted = true;

    if (activeHover) {
      try {
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(() => {
              // Hover quickly exited or autoplay prevented
              setIsPlaying(false);
            });
        }
      } catch (err) {
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
      try {
        video.pause();
        video.currentTime = 0;
      } catch (err) {}
    }
  }, [activeHover, canPlayVideo]);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      {/* ── Base Poster Image ── */}
      {fill ? (
        <Image
          src={posterSrc || '/assets/placeholder.jpg'}
          alt={alt}
          fill
          className={`${imageClassName} transition-opacity duration-300 ${
            isPlaying ? 'opacity-0' : 'opacity-100'
          }`}
          onError={onError}
        />
      ) : (
        <Image
          src={posterSrc || '/assets/placeholder.jpg'}
          alt={alt}
          width={width}
          height={height}
          className={`${imageClassName} transition-opacity duration-300 ${
            isPlaying ? 'opacity-0' : 'opacity-100'
          }`}
          onError={onError}
        />
      )}

      {/* ── Hover Video Preview ── */}
      {canPlayVideo && (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          playsInline
          loop
          preload="metadata"
          onError={() => setHasVideoError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${
            isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* ── Video Badge Indicator ── */}
      {canPlayVideo && (
        <div className="absolute bottom-2 right-2 z-10 pointer-events-none transition-all duration-300">
          {isPlaying ? (
            <span className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-md border border-white/20 animate-in fade-in duration-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span>Preview</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm border border-white/10 hover:bg-black/80 transition-colors">
              <Icon icon="solar:videocamera-record-bold" className="w-3 h-3 text-amber-400" />
              <span>Video</span>
            </span>
          )}
        </div>
      )}

      {/* ── Subtle animated progress bar while playing ── */}
      {canPlayVideo && isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/20 z-10 overflow-hidden pointer-events-none">
          <div className="h-full bg-primary-500 animate-[pulse_1.5s_ease-in-out_infinite] w-full" />
        </div>
      )}
    </div>
  );
}

/**
 * ThumbnailVideoPreview:
 * Plays muted snippet inside gallery thumbnail on hover
 */
export function ThumbnailVideoPreview({ url }) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    if (hovered) {
      try {
        video.currentTime = 0;
        const p = video.play();
        if (p !== undefined) p.catch(() => {});
      } catch (e) {}
    } else {
      try {
        video.pause();
        video.currentTime = 0;
      } catch (e) {}
    }
  }, [hovered]);

  return (
    <div
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <video
        ref={videoRef}
        src={url}
        muted
        playsInline
        loop
        preload="metadata"
        className={`w-full h-full object-cover transition-opacity duration-200 pointer-events-none ${
          hovered ? 'opacity-100' : 'opacity-50'
        }`}
      />
      {!hovered ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
          <Icon icon="solar:play-circle-bold" className="w-6 h-6 text-white drop-shadow" />
        </div>
      ) : (
        <div className="absolute top-1 right-1 pointer-events-none z-10">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * MainVideoHoverPlayer:
 * Main display video player with hover snippet playback
 */
export function MainVideoHoverPlayer({ url, onOpenGallery }) {
  const [hovered, setHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    if (hovered) {
      try {
        const p = video.play();
        if (p !== undefined) {
          p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      } catch (e) {}
    } else {
      setIsPlaying(false);
      try {
        video.pause();
        video.currentTime = 0;
      } catch (e) {}
    }
  }, [hovered]);

  return (
    <div
      className="w-full h-full relative cursor-pointer group flex items-center justify-center bg-black/90 overflow-hidden"
      onClick={onOpenGallery}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <video
        ref={videoRef}
        src={url}
        muted
        playsInline
        loop
        preload="metadata"
        className="w-full h-full object-contain pointer-events-none"
      />
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 pointer-events-none ${
          isPlaying ? 'bg-black/10 opacity-0 group-hover:opacity-100' : 'bg-black/25'
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
          <Icon
            icon={isPlaying ? 'solar:pause-bold' : 'solar:play-circle-bold'}
            className="w-10 h-10 drop-shadow-md"
          />
        </div>
        <span className="mt-2 text-xs font-semibold text-white/90 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
          {isPlaying ? 'Playing Preview' : 'Hover to preview snippet'}
        </span>
      </div>
    </div>
  );
}

