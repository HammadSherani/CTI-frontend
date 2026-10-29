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
    </div>
  );
}

/**
 * ThumbnailVideoPreview:
 * Plays muted snippet inside gallery thumbnail on hover without play icon overlay
 */
export function ThumbnailVideoPreview({ url }) {
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={url}
        muted
        playsInline
        loop
        preload="auto"
        className="w-full h-full object-cover pointer-events-none"
      />
    </div>
  );
}

/**
 * MainVideoHoverPlayer:
 * Main display video player with hover snippet playback without any play/pause icon overlay
 */
export function MainVideoHoverPlayer({ url, onOpenGallery }) {
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      className="w-full h-full relative cursor-pointer group flex items-center justify-center bg-gray-950 overflow-hidden"
      onClick={onOpenGallery}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={url}
        muted
        playsInline
        loop
        preload="auto"
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
}

