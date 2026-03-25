'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import Marquee from 'react-fast-marquee';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12">
          
          {/* Left - Logo & Description */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-6">
              <Image 
                src="/assets/logo/logo-dark.png" 
                alt="CTI Logo" 
                width={140} 
                height={45} 
                className="object-contain" 
              />
            </div>
            
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              We provide fast, reliable, and trusted device repair, resale, and refurbished 
              solutions for all your gadgets.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 mt-8">
              <a href="#" className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center transition-all">
                <Icon icon="mdi:twitter" className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center transition-all">
                <Icon icon="mdi:facebook" className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center transition-all">
                <Icon icon="mdi:instagram" className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center transition-all">
                <Icon icon="mdi:youtube" className="text-xl" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-semibold mb-5">Services</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Sell Phone</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sell TV</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sell Smart Watch</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Repair Phone</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Buy Gadgets</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Recycle Phone</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Partner With Us</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-semibold mb-5">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Become Partner</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Corporate Info</a></li>
            </ul>
          </div>

          {/* Sell Device */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-semibold mb-5">Sell Device</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Mobile</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Laptop</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tablet</a></li>
              <li><a href="#" className="hover:text-white transition-colors">iMac</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Gaming Console</a></li>
            </ul>
          </div>

          {/* Support + Chat + Marquee */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-semibold mb-5">Support</h3>
            <ul className="space-y-3 text-sm mb-8">
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Warranty Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">E-Waste Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Device Safety</a></li>
            </ul>
        </div>
        </div>
<div className="flex flex-col lg:flex-row gap-4 items-start w-[45%] ml-[55%] mt-10">
              {/* Chat Button */}
              <div className="lg:w-auto w-full">
                <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-white font-medium py-2 pr-16  rounded-2xl flex items-center gap-3 shadow-lg w-full lg:w-auto group">
                  <Image 
                    src="/assets/footer/message.png" 
                    alt="Chat Icon" 
                    width={54} 
                    height={34} 
                    className="object-contain group-hover:scale-110 transition-transform duration-300" 
                  />
                  <div className="text-left">
                    <div className="font-semibold text-base">Chat With Us</div>
                    <div className="text-xs opacity-90">Got questions? Just ask.</div>
                  </div>
                </button>
              </div>

              {/* Marquees Container */}
              <div className="flex-1  sm:w-full lg:w-[40%]">
                <div className="mb-3">
                  <Marquee
                    gradient={false}
                    speed={30}
                    direction="right"
                    pauseOnHover
                    autoFill
                  >
                    <div className="flex items-center gap-8">
                      <Image
                        src="/assets/footer/f1.png"
                        alt="Partner 1"
                        width={70}
                        height={35}
                        className="h-9 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                      />
                      <Image
                        src="/assets/footer/f2.png"
                        alt="Partner 2"
                        width={70}
                        height={35}
                        className="h-9 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                      />
                      <Image
                        src="/assets/footer/f3.png"
                        alt="Partner 3"
                        width={70}
                        height={35}
                        className="h-9 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                      />
                      <Image
                        src="/assets/footer/f4.png"
                        alt="Partner 4"
                        width={70}
                        height={35}
                        className="h-9 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                  </Marquee>
                </div>

                <div>
                  <Marquee
                    gradient={false}
                    speed={35}
                    direction="left"
                    pauseOnHover
                    autoFill
                  >
                    <div className="flex items-center gap-8">
                      <Image
                        src="/assets/footer/f5.png"
                        alt="Partner 5"
                        width={70}
                        height={35}
                        className="h-9 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                      />
                      <Image
                        src="/assets/footer/f6.png"
                        alt="Partner 6"
                        width={70}
                        height={35}
                        className="h-9 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                      />
                      <Image
                        src="/assets/footer/f7.png"
                        alt="Partner 7"
                        width={70}
                        height={35}
                        className="h-9 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                      />
                      <Image
                        src="/assets/footer/f8.png"
                        alt="Partner 8"
                        width={70}
                        height={35}
                        className="h-9 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                  </Marquee>
                </div>
              </div>
            </div>

        {/* Bottom Section */}
        <div className="mt-10 pt-10 border-t border-gray-800 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Registered Office */}
          <div className="lg:col-span-8 text-sm text-gray-400">
            <p className="font-semibold text-gray-200 mb-3">Registered Office:</p>
            <p>
              Manak Waste Management Pvt Ltd, 55, 2nd Floor, Lane-2, Westend Marg, Saidullajab, Near 
              Saket Metro Station, New Delhi-110030, India. Support-7290068900 | CIN: 
              U46524DL2009PTC190441
            </p>
            <p className="mt-4">
              Manak Waste Management Pvt Ltd. is ISO 27001 & 27701 Compliance Certified. 
              Person who may be contacted in case of any compliance related queries or grievances: 
              Manoj Kumar (grievanceofficer@cashify.in)
            </p>
            <p className="mt-6 text-xs leading-relaxed">
              ** All product names, logos, and brands are property of their respective owners. 
              All company, product and service names used in this website are for identification 
              purposes only. Use of these names, logos, and brands does not imply endorsement.
            </p>
          </div>

            <div className="lg:col-span-4 w-full ">
            <div className="  bg-white   pr-12 gap-4 justify-center items-center flex border border-zinc-800 rounded-2xl p-2  max-w-[420px] hover:border-zinc-700 transition-all duration-300">
            <div>
              <Image src='/assets/footer/f9.png' alt='footer' width={160} height={100}/>
              </div>
                <div className="text-xs">
                  <p className="text-black font-semibold mb-1 text-md">Safeguarded by DeviceSafety.org</p>
                  <p className="text-gray-400 leading-relaxed text-md">
                    All devices are data-wiped using DeviceSafety.org certified tools, guaranteeing 
                    the highest standards of data security and privacy.
                  </p>
                </div>
              </div>
   
</div>        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-500 mt-16 pt-6 border-t border-gray-800">
          Copyright © 2026 Cashify All rights reserved
        </div>
      </div>
    </footer>
  );
}