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
  const catalogDropdownRef = useRef(null);
  const managementDropdownRef = useRef(null);
  const partsDropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);
  const [isManagementDropdownOpen, setIsManagementDropdownOpen] = useState(false);
  const [isPartsDropdownOpen, setIsPartsDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const {user} = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(clearAuth());
  };

  const primaryNavLinks = [
    { name: "Dashboard", path: `/admin/dashboard`, icon: "mdi:view-dashboard-outline" },
    { 
      name: "Catalog", 
      path: `#`, 
      icon: "mdi:folder-outline",
      hasSubmenu: true,
      submenu: [
        {
          category: "Content Management",
          items: [
            { name: "Banners", icon: "mdi:image-outline", path: "/admin/banners" },
            { name: "Brand", icon: "mdi:tag-outline", path: "/admin/brand" },
            { name: "Models", icon: "mdi:cube-outline", path: "/admin/models" },
            { name: "Blog", icon: "mdi:post-outline", path: "/admin/blogs" },
          ]
        },
        {
          category: "Location Management",
          items: [
            { name: "City", icon: "mdi:city-variant-outline", path: "/admin/cities" },
            { name: "State", icon: "mdi:map-marker-outline", path: "/admin/states" },
            { name: "Country", icon: "mdi:earth", path: "/admin/countries" },
          ]
        }
      ]
    },
    { 
      name: "Repairman-Management", 
      path: `#`, 
      icon: "mdi:cog-outline",
      hasSubmenu: true,
      submenu: [
        {
          category: "Staff Management",
          items: [
            { name: "Repair Man", icon: "mdi:account-wrench-outline", path: "/admin/repair-man" },
            { name: "KYC Management", icon: "mdi:shield-account-outline", path: "/admin/kyc-management" },
          ]
        },
        {
          category: "Operations",
          items: [
            { name: "Job Board", icon: "mdi:briefcase-outline", path: "/admin/job-board" },
            { name: "Rating & Reviews", icon: "mdi:star-outline", path: "/admin/rating-and-reviews" },
          ]
        }
      ]
    },

     { 
      name: "Parts Management", 
      path: `#`, 
      icon: "mdi:package-variant",
      hasSubmenu: true,
      submenu: [
        {
          category: "Inventory",
          items: [
            // { name: "Parts Catalog", icon: "mdi:archive-outline", path: "/admin/parts-catalog" },
            { name: "Parts Categories", icon: "mdi:shape-outline", path: "/admin/parts/parts-categories" },
            { name: "Stock Management", icon: "mdi:warehouse", path: "/admin/parts/stock-management" },
            { name: "Low Stock Alerts", icon: "mdi:alert-outline", path: "/admin/low-stock-alerts" },
          ]
        },
        {
          category: "Orders",
          items: [
            { name: "Parts Orders", icon: "mdi:cart-outline", path: "/admin/parts-orders" },
            // { name: "Suppliers", icon: "mdi:truck-delivery-outline", path: "/admin/suppliers" },
            // { name: "Purchase History", icon: "mdi:history", path: "/admin/purchase-history" },
            // { name: "Pricing Management", icon: "mdi:currency-usd", path: "/admin/parts-pricing" },
          ]
        }
      ]
    },
  ];

  const dropdownLinks = [
    { name: "Profile Settings", path: "/profile", icon: "mdi:account-cog-outline" },
    { name: "Service Catalog", path: "/admin/service-catalog", icon: "mdi:tools" },
    { name: "Disputes", path: "/admin/disputes", icon: "mdi:gavel" },
    { name: "Earnings", path: "/admin/earnings", icon: "mdi:gavel" },
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
      if (catalogDropdownRef.current && !catalogDropdownRef.current.contains(event.target)) {
        setIsCatalogDropdownOpen(false);
      }
      if (managementDropdownRef.current && !managementDropdownRef.current.contains(event.target)) {
        setIsManagementDropdownOpen(false);
      }
      if (partsDropdownRef.current && !partsDropdownRef.current.contains(event.target)) {
        setIsPartsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsCatalogDropdownOpen(false);
    setIsManagementDropdownOpen(false);
    setIsPartsDropdownOpen(false);
  }, [pathname]);

  const isActiveLink = (linkPath) => {
    return pathname === linkPath || pathname.startsWith(linkPath + '/');
  };

  const isSubmenuActive = (submenu) => {
    return submenu?.some(group => 
      group.items?.some(item => isActiveLink(item.path))
    );
  };

  const renderNavLink = (link, dropdownOpen, setDropdownOpen, dropdownRef) => {
    if (link.hasSubmenu) {
      return (
        <div key={link.name} className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`relative px-4 py-5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 group
              ${isSubmenuActive(link.submenu) || dropdownOpen
                ? 'text-primary-600 bg-primary-50' 
                : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
              }`}
          >
            <Icon icon={link.icon} className="w-4 h-4" />
            {link.name}
            <Icon 
              icon="mdi:chevron-down" 
              className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
            />
            {isSubmenuActive(link.submenu) && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
            )}
          </button>

          {/* Dropdown Menu with Categories */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {link.submenu.map((group, groupIndex) => (
                <div key={group.category}>
                  {/* Category Header */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {group.category}
                    </p>
                  </div>
                  
                  {/* Category Items */}
                  <div className="py-1">
                    {group.items.map((subLink) => (
                      <Link
                        key={subLink.name}
                        href={subLink.path}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150
                          ${isActiveLink(subLink.path)
                            ? 'text-primary-600 bg-primary-50 font-medium'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                      >
                        <Icon icon={subLink.icon} className="w-4 h-4" />
                        {subLink.name}
                      </Link>
                    ))}
                  </div>
                  
                  {/* Divider between categories (except last one) */}
                  {groupIndex < link.submenu.length - 1 && (
                    <div className="border-t border-gray-100 my-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
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
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto py-1 flex items-center justify-between">
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
            {primaryNavLinks.map((link) => {
              if (link.name === "Catalog") {
                return renderNavLink(link, isCatalogDropdownOpen, setIsCatalogDropdownOpen, catalogDropdownRef);
              } else if (link.name === "Repairman-Management") {
                return renderNavLink(link, isManagementDropdownOpen, setIsManagementDropdownOpen, managementDropdownRef);
              } else if (link.name === "Parts Management") {
                return renderNavLink(link, isPartsDropdownOpen, setIsPartsDropdownOpen, partsDropdownRef);
              }
              return renderNavLink(link);
            })}
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
                {dropdownLinks.map((link) => (
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
          <div className="flex flex-col gap-2">
            {primaryNavLinks.map((link) => (
              <div key={link.name}>
                {link.hasSubmenu ? (
                  <div className="space-y-3">
                    {link.submenu.map((group) => (
                      <div key={group.category} className="space-y-1">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1 px-3">
                          {group.category}
                        </div>
                        {group.items.map((subLink) => (
                          <Link
                            key={subLink.name}
                            href={subLink.path}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                              ${isActiveLink(subLink.path) 
                                ? 'text-primary-600 bg-primary-100' 
                                : 'text-gray-600 hover:text-primary-600 hover:bg-white'
                              }`}
                          >
                            <Icon icon={subLink.icon} className="w-4 h-4" />
                            {subLink.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Link
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
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;