"use client"
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import logo from "../../../../../public/assets/logo.png";
import { Icon } from '@iconify/react';

function Header() {
  const prefix = "/repair-man";
  const primaryNavLinks = [
    { name: "Dashboard", path: `/repair-man/dashboard`},
    { name: "Job Board", path: "/job-board" },
    { name: "My Offer", path: "/my-offer" },
    { name: "My jobs", path: "/my-jobs" },
    { name: "Chat", path: "/chat" },
    { name: "Earning & Reviews", path: "/earning-reviews" },
  ];
  const dropdownLinks = [
    { name: "Disputes", path: "/disputes" },
    { name: "Notification Center", path: "/notification-center" },
    { name: "Help and Support", path: "/help-support" },
    { name: "Profile and Account Setting", path: "/profile" },
    { name: "Service Catalog", path: "/service-catalog" },
  ];
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Image 
            src={logo} 
            alt="logo" 
            width={1000} 
            height={1000} 
            className="w-20 h-auto object-contain" 
          />
          <nav className="hidden md:flex items-center gap-10">
            {primaryNavLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Icon icon="mdi:user" className="w-5 h-5 text-white" />
            </div>
            <Icon 
              icon="mdi:chevron-down" 
              className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2">
              {dropdownLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden border-t border-gray-100 py-2 px-4">
        {primaryNavLinks.map((link) => (
          <Link
            key={link.name}
            href={link.path}
            className="block py-2 text-gray-600 hover:text-blue-600"
          >
            {link.name}
          </Link>
        ))}
      </div>
    </header>
  );
}

export default Header;