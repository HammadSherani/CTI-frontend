"use client";

import React from 'react';
import SubHeader from '@/components/SubHeader';
import SectionTag from '@/components/website/home/sectoinTag';
import { Icon } from '@iconify/react';
import Image from 'next/image';

const PLACEHOLDER_IMG = "https://placehold.co/1200x600/1f2937/ffffff/png?text=Device+Repair";

export default function SmartphoneRepairGuideDetail() {
  return (
    <>
      <SubHeader 
        title="Ultimate Guide to Smartphone and Device Repairs" 
        subtitle="Tips, Tricks, and Solutions" 
      />

      <div className="max-w-4xl mx-auto px-4 py-10 bg-white">
        
        {/* Hero Image */}
        <div className="relative h-[420px] rounded-3xl overflow-hidden mb-10 shadow-xl">
          <Image
            src={PLACEHOLDER_IMG}
            alt="Smartphone Repair Guide"
            fill
            className="object-cover"
          />
          <div className="absolute top-6 left-6 bg-white text-primary-600 text-sm font-medium px-4 py-1.5 rounded-2xl flex items-center gap-2 shadow">
            <Icon icon="mdi:tools" className="text-xl" />
            Device Repairs
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-6">
          Ultimate Guide to Smartphone and Device Repairs: Tips, Tricks, and Solutions
        </h1>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-10">
          <div className="flex items-center gap-1">
            <Icon icon="mdi:calendar" />
            <span>7th Mar 2026</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="mdi:clock-outline" />
            <span>8 min read</span>
          </div>
        </div>

        {/* Introduction */}
        <div className="prose prose-lg max-w-none text-gray-700 mb-12">
          <p>
            Smartphones, tablets, and other electronic devices are essential in our daily lives, 
            but they can sometimes develop issues like battery drain, screen damage, or software glitches. 
            Understanding common problems and how to handle them can save time, prevent further damage, 
            and even reduce repair costs. This guide covers the most frequent issues, troubleshooting steps, 
            and maintenance tips.
          </p>
        </div>

        {/* Section 1 */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-3">
            <span className="text-orange-500">1.</span> 
            Battery Drain and Charging Issues
          </h2>
          <p className="text-gray-600 mb-4">
            Fast battery drain or charging problems are common.
          </p>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">●</span>
              Reduce screen brightness and turn on battery saver mode
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">●</span>
              Close unused apps running in the background
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">●</span>
              Update your device’s software regularly
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">●</span>
              Use original or certified chargers
            </li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-3">
            <span className="text-orange-500">2.</span> 
            Slow Device Performance
          </h2>
          <p className="text-gray-600 mb-4">
            Devices can become slow due to storage issues, too many apps, or outdated software.
          </p>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">●</span>
              Delete unnecessary apps and files
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">●</span>
              Clear app cache regularly
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">●</span>
              Restart your device periodically
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">●</span>
              Update apps and system software
            </li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-3">
            <span className="text-orange-500">3.</span> 
            Screen Problems
          </h2>
          <p className="text-gray-600 mb-4">
            Touchscreens may become unresponsive or flicker due to damage or software issues.
          </p>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">●</span>
              Clean the screen with a microfiber cloth
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">●</span>
              Remove damaged screen protectors
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">●</span>
              Restart the device
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1">●</span>
              Professional screen repair if the problem persists
            </li>
          </ul>
        </div>

        {/* Conclusion */}
        <div className="prose prose-lg max-w-none text-gray-700 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Conclusion</h2>
          <p>
            Proper care and timely troubleshooting can prevent most common device problems. 
            Regular maintenance and professional repair when necessary will keep your devices 
            running efficiently and extend their lifespan.
          </p>
        </div>

  
      </div>
            {/* Latest News Section */}
        <div className="mt-16 max-w-7xl mx-auto px-4 py-10" >
          <div className="flex items-center justify-between mb-6">
            <SectionTag title="Latest news" />
            <a href="#" className="text-orange-500 font-medium flex items-center gap-1 hover:underline">
              View All <Icon icon="mdi:arrow-right" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* You can reuse the same cards from previous page or keep 4 static for now */}
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition">
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={PLACEHOLDER_IMG}
                    alt="News"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-sm line-clamp-2">
                    Apple iPhone 13 Mini Refurbished Deal
                  </h4>
                  <p className="text-xs text-gray-500 mt-3">7th Mar 2026</p>
                </div>
              </div>
            ))}
          </div>
        </div>
    </>
  );
}