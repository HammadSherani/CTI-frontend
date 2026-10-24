
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";

export default function VideoSection() {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;

    if (!video || !section) return;

    video.muted = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          video.muted = true;
          video.play().catch(() => {
            setIsPlaying(false);
          });
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.5] }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, []);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.muted = true;
      try {
        await video.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      video.pause();
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  return (
    <section className="bg-white px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div
          ref={sectionRef}
          className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-xl"
        >
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-contain md:object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={handlePlay}
            onPause={handlePause}
          >
            <source
              src="/assets/home/home-video.mp4"
              type="video/mp4"
            />
            Your browser does not support HTML video.
          </video>

          {!isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label="Play video"
              className="absolute inset-0 flex items-center justify-center bg-black/30 transition hover:bg-black/40"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary-600 shadow-lg transition hover:scale-110">
                <Icon icon="mdi:play" className="text-3xl" />
              </span>
            </button>
          )}

          {isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label="Pause video"
              className="absolute right-4 top-4 rounded-full bg-black/50 p-3 text-white transition hover:bg-black/70"
            >
              <Icon icon="mdi:pause" className="text-xl" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
