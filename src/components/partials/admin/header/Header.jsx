"use client";
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
  const usersDropdownRef = useRef(null);        // Renamed for clarity
  const partsDropdownRef = useRef(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // User profile dropdown
  const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);
  const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);
  const [isPartsDropdownOpen, setIsPartsDropdownOpen] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(clearAuth());
  };

  const primaryNavLinks = [
    { name: "Dashboard", path: `/admin/dashboard`, icon: "mdi:view-dashboard-outline" },
    
    { 
      name: "Catalog", 
      path: "#", 
      icon: "mdi:folder-outline",
      hasSubmenu: true,
      submenu: [
        {
          category: "Content Management",
          items: [
            { name: "Services", icon: "mdi:post-outline", path: "/admin/services" },
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
      name: "Users", 
      path: "#", 
      icon: "mdi:account-multiple-outline", // Better icon for user management
      hasSubmenu: true,
      submenu: [
        {
          category: "User Management",
          items: [
            { name: "All Users", icon: "mdi:account-group-outline", path: "/admin/users" },
            { name: "Repairmen", icon: "mdi:account-wrench-outline", path: "/admin/repair-man" },
            { name: "KYC Management", icon: "mdi:shield-account-outline", path: "/admin/kyc-management" },
          ]
        },
        {
          category: "Operations",
          items: [
            { name: "Job Board", icon: "mdi:briefcase-outline", path: "/admin/job-board" },
            { name: "Ratings & Reviews", icon: "mdi:star-outline", path: "/admin/rating-and-reviews" },
            { name: "Disputes", icon: "mdi:gavel", path: "/admin/disputes" },
          ]
        }
      ]
    },  

    { 
      name: "Parts Management", 
      path: "#", 
      icon: "mdi:package-variant",
      hasSubmenu: true,
      submenu: [
        {
          category: "Inventory",
          items: [
            { name: "Parts Categories", icon: "mdi:shape-outline", path: "/admin/parts/parts-categories" },
            { name: "Stock Management", icon: "mdi:warehouse", path: "/admin/parts/stock-management" },
          ]
        },
        {
          category: "Orders",
          items: [
            { name: "Parts Orders", icon: "mdi:cart-outline", path: "/admin/parts/parts-orders" },
          ]
        }
      ]
    },
  ];

  // Updated user dropdown links (more admin-focused)
  const dropdownLinks = [
    { name: "My Profile", path: "/admin/profile", icon: "mdi:account-cog-outline" },
    { name: "Notifications", path: "/admin/notifications", icon: "mdi:bell-outline" },
    { name: "Activity Log", path: "/admin/activity", icon: "mdi:history" },
    { name: "Settings", path: "/admin/settings", icon: "mdi:cog-outline" },
    { name: "Help & Support", path: "/help-support", icon: "mdi:help-circle-outline" },
    { name: "Sign Out", path: "", icon: "mdi:logout", isLogout: true },
  ];

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (catalogDropdownRef.current && !catalogDropdownRef.current.contains(event.target)) {
        setIsCatalogDropdownOpen(false);
      }
      if (usersDropdownRef.current && !usersDropdownRef.current.contains(event.target)) {
        setIsUsersDropdownOpen(false);
      }
      if (partsDropdownRef.current && !partsDropdownRef.current.contains(event.target)) {
        setIsPartsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsCatalogDropdownOpen(false);
    setIsUsersDropdownOpen(false);
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
              ${(isSubmenuActive(link.submenu) || dropdownOpen)
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

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {link.submenu.map((group, groupIndex) => (
                <div key={group.category}>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {group.category}
                    </p>
                  </div>
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
        <div className="flex items-center gap-8">
          <Link href="/admin/dashboard" className="flex-shrink-0">
            <Image 
              src={logo} 
              alt="RepairHub Logo" 
              width={80} 
              height={40} 
              className="w-20 h-auto object-contain hover:opacity-80 transition-opacity" 
              priority
            />
          </Link>
          
          <nav className="hidden lg:flex items-center gap-1">
            {primaryNavLinks.map((link) => {
              if (link.name === "Catalog") {
                return renderNavLink(link, isCatalogDropdownOpen, setIsCatalogDropdownOpen, catalogDropdownRef);
              } else if (link.name === "Users") {
                return renderNavLink(link, isUsersDropdownOpen, setIsUsersDropdownOpen, usersDropdownRef);
              } else if (link.name === "Parts Management") {
                return renderNavLink(link, isPartsDropdownOpen, setIsPartsDropdownOpen, partsDropdownRef);
              }
              return renderNavLink(link);
            })}
          </nav>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group
              ${isDropdownOpen ? 'bg-gray-100 shadow-sm' : 'hover:bg-gray-50'}`}
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm ring-2 ring-white">
                <span className="text-sm font-bold text-white">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AD'}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
            </div>

            <Icon 
              icon="mdi:chevron-down" 
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-3 z-50">
              <div className="px-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AD'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                    <p className="text-sm text-gray-500">{user?.email || 'admin@example.com'}</p>
                    <p className="text-xs text-primary-600 font-medium mt-1">Administrator</p>
                  </div>
                </div>
              </div>

              <div className="py-2">
                {dropdownLinks.map((link) => (
                  <div key={link.name}>
                    {link.isLogout && <div className="my-2 border-t border-gray-200" />}
                    <Link
                      href={link.path}
                      onClick={() => link.isLogout && handleLogout()}
                      className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors
                        ${link.isLogout 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <Icon icon={link.icon} className={`w-5 h-5 ${link.isLogout ? 'text-red-500' : 'text-gray-400'}`} />
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation - Simplified grouped view */}
      <div className="lg:hidden border-t border-gray-100 bg-gray-50/50">
        <div className="container mx-auto px-4 py-4">
          <nav className="space-y-4">
            {primaryNavLinks.map((link) => (
              <div key={link.name} className="space-y-2">
                {!link.hasSubmenu ? (
                  <Link
                    href={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                      ${isActiveLink(link.path) ? 'bg-primary-100 text-primary-600' : 'text-gray-700 hover:bg-white'}`}
                  >
                    <Icon icon={link.icon} className="w-5 h-5" />
                    {link.name}
                  </Link>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                      <Icon icon={link.icon} className="w-4 h-4" />
                      {link.name}
                    </div>
                    {link.submenu.map((group) => (
                      <div key={group.category} className="ml-4 mt-2 space-y-1">
                        <p className="text-xs font-medium text-gray-400 px-4">{group.category}</p>
                        {group.items.map((item) => (
                          <Link
                            key={item.name}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm
                              ${isActiveLink(item.path) ? 'bg-primary-100 text-primary-600 font-medium' : 'text-gray-600 hover:bg-white'}`}
                          >
                            <Icon icon={item.icon} className="w-4 h-4" />
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;