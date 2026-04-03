"use client"
import Image from 'next/image';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname, Link } from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '@/store/auth';
import { getInitials } from '@/utils/functions';
import NotificationPanel from '../NotificationPanel';
import useNotifications from '@/hooks/useNotifications';
import CurrencySelector from '@/components/CurrencySelector';

function Header() {
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dispatch = useDispatch();

  const { user, token } = useSelector((state) => state.auth);
  const { unreadCount } = useNotifications();

  const handleLogout = useCallback(() => {
    dispatch(clearAuth());
  }, [dispatch]);

  const primaryNavLinks = [
  { name: "Dashboard",   path: "/repair-man/dashboard",   icon: "solar:home-2-bold-duotone" },

  { name: "Job Board",   path: "/repair-man/job-board",   icon: "solar:clipboard-list-bold-duotone" },

  { name: "My Offers",   path: "/repair-man/my-offers",   icon: "solar:hand-shake-bold-duotone" },

  { name: "My Jobs",     path: "/repair-man/my-jobs",     icon: "solar:case-bold-duotone" },

  { name: "Reviews",     path: "/repair-man/reviews",     icon: "solar:star-bold-duotone" },

  { name: "Earnings",    path: "/repair-man/earning",     icon: "solar:wallet-2-bold-duotone" },

  { name: "Parts Order", path: "/repair-man/parts-order", icon: "solar:box-minimalistic-bold-duotone" },

  { name: "Ads",         path: "/repair-man/ads",         icon: "solar:tag-price-bold-duotone" },
];

  const dropdownLinks = [
    { name: "Profile Settings", path: "/repair-man/profile",       icon: "solar:user-id-bold-duotone" },
    { name: "Service Catalog",  path: "/repair-man/service-catalog",icon: "solar:settings-bold-duotone" },
    { name: "Disputes",         path: "/disputes",                  icon: "solar:shield-warning-bold-duotone" },
    { name: "Earnings",         path: "/earning",                   icon: "solar:graph-new-up-bold-duotone" },
    { name: "Help & Support",   path: "/help-support",              icon: "solar:question-circle-bold-duotone" },
    { name: "Sign Out",         path: "/auth/logout",               icon: "solar:logout-3-bold-duotone", isLogout: true },
  ];

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
    <header className="border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-[#F8FAFB]">
      <div className="flex items-center p-3 gap-2 justify-start">

        {/* Welcome Card */}
        <div className="bg-white px-6 py-3 rounded-xl shadow-sm flex-shrink-0">
          <h5 className="text-gray-400 text-[13px] font-medium uppercase tracking-wide leading-none mb-1">
            Welcome Back
          </h5>
          <h1 className="text-primary-600 font-semibold text-[17px] text-nowrap capitalize leading-none">
            {user?.name}
          </h1>
        </div>

        {/* Main Nav + Actions */}
        <div className="bg-white rounded-xl w-full flex items-center px-4 py-2 gap-3 shadow-sm min-w-0">

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-start overflow-x-auto scrollbar-hide">
            {primaryNavLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`relative px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 flex items-center gap-1.5 group whitespace-nowrap flex-shrink-0
                  ${isActiveLink(link.path)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-primary-600 hover:bg-gray-50'
                  }`}
              >
                <Icon icon={link.icon} className="w-4 h-4 flex-shrink-0" />
                <span>{link.name}</span>
                {isActiveLink(link.path) && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-600 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">

            {/* Currency Selector */}
            <div className="flex items-center">
              <CurrencySelector />
            </div>

            {/* Notification Bell */}
            {user?.role === 'repairman' && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={toggleNotifications}
                  className={`relative p-2 rounded-lg transition-all duration-200
                    ${showNotifications
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  aria-label="Notifications"
                >
                  <Icon
                    icon={showNotifications ? "solar:bell-bold-duotone" : "solar:bell-linear"}
                    className="w-5 h-5"
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

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
                className={`flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl transition-all duration-200
                  ${isDropdownOpen ? 'bg-gray-100 ring-1 ring-gray-200' : 'hover:bg-gray-50'}`}
                aria-label="Profile menu"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-white">
                      {getInitials(user?.name)}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>

                {/* User Info — md+ only */}
                <div className="hidden md:block text-left min-w-0">
                  <p className="text-xs font-semibold text-gray-800 capitalize truncate max-w-[100px]">
                    {user?.name}
                  </p>
                  <p className="text-[10px] text-gray-400 capitalize">{user?.role}</p>
                </div>

                <Icon
                  icon="solar:alt-arrow-down-bold"
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 flex-shrink-0
                    ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50
                  animate-in fade-in slide-in-from-top-2 duration-200">

                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100 mb-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">
                          {getInitials(user?.name)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate text-sm capitalize">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    {dropdownLinks.map((link) => (
                      <React.Fragment key={link.name}>
                        {link.isLogout && <div className="border-t border-gray-100 my-1.5 mx-3" />}
                        <Link
                          href={link.path}
                          className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm transition-all duration-150
                            ${link.isLogout
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          onClick={() => link.isLogout && handleLogout()}
                        >
                          <Icon
                            icon={link.icon}
                            className={`w-4.5 h-4.5 flex-shrink-0 ${link.isLogout ? 'text-red-500' : 'text-gray-400'}`}
                          />
                          <span className="truncate font-medium">{link.name}</span>
                        </Link>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-gray-200 bg-white">
        <div className="px-3 py-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 min-w-max">
            {primaryNavLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200
                  ${isActiveLink(link.path)
                    ? 'text-primary-600 bg-primary-50 font-semibold'
                    : 'text-gray-500 hover:text-primary-600 hover:bg-gray-50'
                  }`}
              >
                <Icon icon={link.icon} className="w-3.5 h-3.5 flex-shrink-0" />
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