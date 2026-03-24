"use client";
import React, { useRef, useState } from "react";
import { Icon } from "@iconify/react";

export default function VideoSection() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 bg-white">
      <div className="relative rounded-2xl overflow-hidden shadow-xl">

        {/* Video */}
        <video
          ref={videoRef}
          className="w-full h-[300px] md:h-[450px] object-cover"
        >
          <source src="/assets/home/home-page-video.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-primary-600 shadow-lg hover:scale-110 transition"
            >
              <Icon icon="mdi:play" className="text-3xl" />
            </button>
          </div>
        )}

        {/* Pause Button (top right) */}
        {isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black transition"
          >
            <Icon icon="mdi:pause" className="text-xl" />
          </button>
        )}
      </div>
    </div>
  );
}