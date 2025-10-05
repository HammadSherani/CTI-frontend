"use client"
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import logo from "../../../../../public/assets/logo.png";
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '@/store/auth';
import { getInitials } from '@/utils/functions';
import NotificationPanel from '../NotificationPanel';
// import socketService from '@/utils/socketService';
import { useNotifications } from '@/hooks/useNotifications';

function Header() {
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dispatch = useDispatch();

  const { user, token } = useSelector((state) => state.auth);
  const { unreadCount } = useNotifications(token);

  // Socket connection for repairmen only
  // useEffect(() => {
  //   if (token && user?.role === 'repairman') {
  //     console.log('Connecting socket for repairman:', user.name);
  //     socketService.connect(token);
  //     socketService.requestNotificationPermission();
  //   }
    
  //   return () => {
  //     if (user?.role === 'repairman') {
  //       socketService.disconnect();
  //     }
  //   };
  // }, [token, user?.role, user?.name]);

  const handleLogout = useCallback(() => {
    // socketService.disconnect();
    dispatch(clearAuth());
  }, [dispatch]);

  const primaryNavLinks = [
    { name: "Dashboard", path: `/repair-man/dashboard`, icon: "mdi:view-dashboard-outline" },
    { name: "Job Board", path: "/repair-man/job-board", icon: "mdi:clipboard-list-outline" },
    { name: "My Offer", path: "/repair-man/my-offers", icon: "mdi:handshake-outline" },
    { name: "My Jobs", path: "/repair-man/my-jobs", icon: "mdi:briefcase-outline" },
    // { name: "Chat", path: "/chat", icon: "mdi:chat-outline" },
    { name: "Earning & Reviews", path: "/earning-reviews", icon: "mdi:star-outline" },
  ];

  const dropdownLinks = [
    { name: "Profile Settings", path: "/repair-man/profile", icon: "mdi:account-cog-outline" },
    { name: "Service Catalog", path: "/repair-man/service-catalog", icon: "mdi:tools" },
    { name: "Disputes", path: "/disputes", icon: "mdi:gavel" },
    // { name: "Notifications", path: "/notification-center", icon: "mdi:bell-outline" },
    { name: "Help & Support", path: "/help-support", icon: "mdi:help-circle-outline" },
    { name: "Sign Out", path: "/auth/logout", icon: "mdi:logout", isLogout: true },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setIsDropdownOpen(false);
    setShowNotifications(false);
  }, [pathname]);

  const isActiveLink = useCallback((linkPath) => {
    return pathname === linkPath || pathname.startsWith(linkPath + '/');
  }, [pathname]);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

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

        {/* Right Side - Notifications + Profile */}
        <div className="flex items-center gap-2">
          <Icon icon="fluent:chat-24-regular" width="24" height="24" />
          {/* Notification Bell - Only show for repairmen */}
          {user?.role === 'repairman' && (
            <div className="relative" ref={notificationRef}>
              <button
                onClick={toggleNotifications}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Icon icon="mdi:bell-outline" className="w-6 h-6" />
                
                {/* Notification Badge */}
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </button>

              

              {/* Notification Panel */}
              {showNotifications && (
                <NotificationPanel 
                  isOpen={showNotifications}
                  onClose={() => setShowNotifications(false)}
                  userToken={token}
                />
              )}
            </div>
          )}

          

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group
                ${isDropdownOpen
                  ? 'bg-gray-100 shadow-sm'
                  : 'hover:bg-gray-50'
                }`}
              aria-label="Profile menu"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm ring-2 ring-white">
                  <span className="text-xs font-semibold text-white">
                    {getInitials(user?.name)}
                  </span>
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </div>

              {/* User Info - Hidden on mobile */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 capitalize">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
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
                      <span className="text-sm font-semibold text-white">
                        {getInitials(user?.name)}
                      </span>
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