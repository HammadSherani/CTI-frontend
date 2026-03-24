"use client";

import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import SectionTag from "./sectoinTag";



export default function HowItWorks() {
const steps = [
  {
    id: "01",
    title: "Tell Us Your Issue",
    description:
      "We carefully inspect your device to identify the exact issue. Our experts run detailed checks for accurate results. You get a clear explanation before we begin repair.",
    icon: "mdi:comment-question-outline",
  },
  {
    id: "02",
    title: "Bring or Send Your Device",
    description:
      "Choose a convenient option — drop off your device or schedule a secure pickup. We handle every device with professional care throughout the repair process.",
    icon: "mdi:truck-delivery",
  },
  {
    id: "03",
    title: "Get Your Device Back",
    description:
      "Once repaired and quality-checked, your device will be ready for pickup or safely delivered back to you — fully restored and ready to use.",
    icon: "mdi:cellphone-check",
  },
];
  return (
    <section className="py-16 max-w-7xl mx-auto text-black">

            <div className="flex flex-col  gap-6 mb-10">
                <SectionTag title="How It Works" />
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Who We Are & How <p className="text-primary-500"> We Work</p>
            </h2>
            <p className="text-gray-600 w-96">
              We follow a simple, transparent process to ensure your device is repaired quickly, safely, and without hassle.
            </p>
          </div>

        
        </div>

<div className="relative top-0">
    <div className="">
        <Image src="/assets/home/vector2.png" 
        alt="How It Works" width={1200} height={600} className="w-full h-auto rounded-lg" />
    </div>

    <div>
        <div className="absolute top-0 left-10">
           <div>
            <div className="bg-black rounded-lg text-white">01</div>
           </div>
        </div>
    </div>
</div>
 
    </section>
  );
}