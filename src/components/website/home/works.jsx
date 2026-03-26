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

  return (
    <section className="py-16 max-w-7xl md:h-[100vh] h-auto mx-auto mb-10 p-4 text-black">

            <div className="flex flex-col  gap-2 mb-10">
          <div>
            <div className="mt-">
                <SectionTag title="How It Works" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Who We Are & How <p className="text-primary-500"> We Work</p>
            </h2>
            <p className="text-gray-600 w-96">
              We follow a simple, transparent process to ensure your device is repaired quickly, safely, and without hassle.
            </p>
          </div>

        
        </div>
<div className="relative md:block hidden w-full max-w-7xl mx-auto">

  {/* Background Image */}
  <Image
    src="/assets/home/vector.png"
    alt="How It Works"
    width={1200}
    height={600}
    className="w-full h-20"
  />

  {/* Steps */}
  <div className="absolute inset-0 flex flex-col md:flex-row justify-between items-start md:items-center px-6 md:px-20 py-10">

    {/* Step 01 */}
    <div className="max-w-xs text-left absolute top-4 left-2 flex flex-col items-center justify-centerw-[400px] p-6 rounded-lg">
      <div className="bg-black hover:opacity-80 text-white w-22 h-18 flex items-center justify-center rounded-full text-lg font-bold mb-4">
        01
      </div>
      <div className="">
      <h3 className="text-gray-900 font-semibold text-lg mb-2 text-center">
        Tell Us Your Issue
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed text-center">
        We carefully inspect your device to identify the exact issue. Our experts run detailed checks for accurate results.
      </p>
      </div>
    </div>

    {/* Step 02 */}
    <div className="max-w-xs text-left absolute -top-12 left-[36%] flex flex-col items-center justify-centerw-[400px] p-6 rounded-lg">
      <div className="bg-black hover:opacity-80 text-white w-22 h-18 flex items-center justify-center rounded-full text-lg font-bold mb-4">
        02
      </div>
      <div className="">
      <h3 className="text-gray-900 font-semibold text-lg mb-2 text-center">
Bring or Send 
Your Device      </h3>
      <p className="text-gray-600 text-sm leading-relaxed text-center">
        Choose a convenient option — drop off your device or schedule a secure pickup. We handle every device with professional care throughout the repair process.
      </p>
      </div>
    </div>

    {/* Step 03 */}
    <div className="max-w-xs text-left absolute -top-3    -right-12 flex flex-col items-center justify-centerw-[400px] p-6 rounded-lg">
      <div className="bg-black hover:opacity-80 text-white w-22 h-18 flex items-center justify-center rounded-full text-lg font-bold mb-4">
        03
      </div>
      <div className="">
      <h3 className="text-gray-900 font-semibold text-lg mb-2 text-center">
Get Your Device Back    </h3>
      <p className="text-gray-600 text-sm leading-relaxed text-center">
        Once repaired and quality-checked, your device will be ready for pickup or safely delivered back to you — fully restored and ready to use.
      </p>
      </div>
    </div>


{/* CTA Button */}
        {/* <div className="flex justify-center items-end absolute top-70 left-1/2 -translate-x-1/2">
          <button className="bg-orange-600 hover:bg-orange-700 transition-colors text-white font-semibold text-md px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
            Talk With Us
            <span className="text-md">→</span>
          </button>
        </div> */}
  </div>
</div>
 

 <div>
    {/* Mobile Version */}
    <div className="md:hidden block w-full max-w-7xl mx-auto">
        <div className="flex flex-col gap-2 space-y-10">
            {/* Step 01 */}
            <div className="flex flex-col items-start    p-4 bg-gray-100 rounded-lg">

                <div className="bg-black text-white w-14 h-12 flex items-center justify-center rounded-full text-lg font-bold mb-4">
                    01
                </div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">
                    Tell Us Your Issue
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                    We carefully inspect your device to identify the exact issue. Our experts run detailed checks for accurate results.
                </p>
            </div>
{/* step2  */}
                   <div className="flex flex-col items-start    p-4 bg-gray-100 rounded-lg">

                <div className="bg-black text-white w-14 h-12 flex items-center justify-center rounded-full text-lg font-bold mb-4">
                    02
                </div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">
Bring or Send 
Your Device                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
Choose a convenient option — drop off your device or schedule a secure pickup. We handle every device with professional care throughout the repair process.                </p>
            </div>

{/* step3 */}
                   <div className="flex flex-col items-start    p-4 bg-gray-100 rounded-lg">

                <div className="bg-black text-white w-14 h-12 flex items-center justify-center rounded-full text-lg font-bold mb-4">
                    03
                </div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">
Get Your Device Back                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
Once repaired and quality-checked, your device will be ready for pickup or safely delivered back to you — fully restored and ready to use.                </p>
            </div>
 </div>
 {/* CTA Button */}
        <div className="flex justify-center mt-16">
          <button className="bg-orange-600 hover:bg-orange-700 transition-colors text-white font-semibold text-sm px-6 py-2 rounded-2xl shadow-xl flex items-center gap-3">
            Talk With Us
            <span className="text-sm">→</span>
          </button>
        </div>
 </div>
 </div>
    </section>
  );
}