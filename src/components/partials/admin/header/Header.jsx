"use client"
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import logo from "../../../../../public/assets/logo.png";
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '@/store/auth';

function Header() {
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const {user} = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(clearAuth());
  };

  const primaryNavLinks = [
  { name: "Dashboard", path: `/admin/dashboard`, icon: "mdi:view-dashboard-outline" },
  { name: "Banners", path: "/admin/banners", icon: "mdi:image-outline" },
  { name: "Brand", path: "/admin/brand", icon: "mdi:tag-outline" },
  { name: "Models", path: "/admin/models", icon: "mdi:cube-outline" },
  { name: "Repair Man", path: "/admin/repair-man", icon: "mdi:account-wrench-outline" },
  { name: "Job Board", path: "/admin/job-board", icon: "mdi:briefcase-outline" },
  { name: "KYC Management", path: "/admin/kyc-management", icon: "mdi:shield-account-outline" },
  { name: "Rating & Reviews", path: "/admin/rating-and-reviews", icon: "mdi:star-outline" },
];


  const dropdownLinks = [
    { name: "Profile Settings", path: "/profile", icon: "mdi:account-cog-outline" },
    { name: "Service Catalog", path: "/admin/service-catalog", icon: "mdi:tools" },
    { name: "Disputes", path: "/admin/disputes", icon: "mdi:gavel" },
    { name: "Notifications", path: "/notification-center", icon: "mdi:bell-outline" },
    { name: "Help & Support", path: "/help-support", icon: "mdi:help-circle-outline" },
    { name: "Sign Out", path: "", icon: "mdi:logout", isLogout: true },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [pathname]);

  const isActiveLink = (linkPath) => {
    return pathname === linkPath || pathname.startsWith(linkPath + '/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto py-1  flex items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/repair-man/dashboard" className="flex-shrink-0">
            <Image 
              src={logo} 
              alt="RepairHub Logo" 
              width={80} 
              height={40} 
              className="w-20 h-auto object-contain hover:opacity-80 transition-opacity" 
              priority
            />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {primaryNavLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`relative px-4 py-5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 group
                  ${isActiveLink(link.path) 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
              >
                <Icon icon={link.icon} className="w-4 h-4" />
                {link.name}
                {isActiveLink(link.path) && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                )}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group
              ${isDropdownOpen 
                ? 'bg-gray-100 shadow-sm' 
                : 'hover:bg-gray-50'
              }`}
          >
            {/* Minimalist Avatar */}
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm ring-2 ring-white">
                <span className="text-xs font-semibold text-white">JD</span>
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>

            {/* User Info - Hidden on mobile */}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            <Icon 
              icon="mdi:chevron-down" 
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 
                ${isDropdownOpen ? 'rotate-180' : 'group-hover:text-gray-700'}`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">JD</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {dropdownLinks.map((link, index) => (
                  <React.Fragment key={link.name}>
                    {link.isLogout && <div className="border-t border-gray-100 my-2" />}
                    <Link
                      href={link.path}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150
                        ${link.isLogout 
                          ? 'text-red-600 hover:bg-red-50 hover:text-red-700' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      onClick={() => link.isLogout && handleLogout()}
                    >
                      <Icon 
                        icon={link.icon} 
                        className={`w-4 h-4 ${link.isLogout ? 'text-red-500' : 'text-gray-400'}`} 
                      />
                      {link.name}
                    </Link>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-gray-100 bg-gray-50/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-1 overflow-x-auto">
            {primaryNavLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200
                  ${isActiveLink(link.path) 
                    ? 'text-primary-600 bg-primary-100' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-white'
                  }`}
              >
                <Icon icon={link.icon} className="w-4 h-4" />
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;