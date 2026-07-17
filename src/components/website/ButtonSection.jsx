'use client'

import { clearAuth } from '@/store/auth';
import { getInitials } from '@/utils/functions';
import { Icon } from '@iconify/react';
import { useRouter, Link } from '@/i18n/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useNotifications from '@/hooks/useNotifications';
import NotificationPanel from '../partials/repairman/NotificationPanel';
import axiosInstance from '@/config/axiosInstance';

const IconButton = ({
  icon,
  label,
  count = 0,
  showCount = false,
  href,
  onClick
}) => {
  const button = (
    <div className="relative group cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label={label}>
      <Icon
        icon={icon}
        className="text-gray-600 group-hover:text-orange-500 transition-colors duration-200"
        width={20}
        height={20}
      />
      {showCount && count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[9px] min-w-[16px] h-[16px] px-0.5 rounded-full flex items-center justify-center font-bold leading-none">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </div>
  );

  if (href) return <Link href={href}>{button}</Link>;
  return <div onClick={onClick}>{button}</div>;
};

const DashboardLink = ({ link }) => (
  <Link href={link}>
    <button className="text-[12px] font-semibold px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
      Dashboard
    </button>
  </Link>
);

function ButtonSection() {
  // const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart?.items?.length) || 0;
  const wishlistItems = useSelector((state) => state.wishlist?.items?.length) || 0;
  const [notificationCount] = useState(0); // Keep static for now
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

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

     const toggleNotifications = useCallback(() => {
        setShowNotifications(prev => !prev);
      }, []);

  const dispatch = useDispatch();
  const router = useRouter();

  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { unreadCount, notifications } = useNotifications();
  const { user, token } = useSelector((state) => state.auth);
  const [sellerIdDisplay, setSellerIdDisplay] = useState(null);

  useEffect(() => {
    if (user?.role === 'seller' && token && !sellerIdDisplay) {
      axiosInstance.get('/seller/profile/me-seller', { headers: { Authorization: `Bearer ${token}` } })
        .then(({ data }) => {
          if (data.success && data.data?.sellerId) setSellerIdDisplay(data.data.sellerId);
        })
        .catch(() => {});
    }
  }, [user?.role, token]);


  console.log("unreadCount", unreadCount);
  console.log("notifications", notifications);
  
  

  const handleLogout = useCallback(() => {
    dispatch(clearAuth());
  }, [dispatch]);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleCartClick = () => router.push("/cart");
  const handleWishlistClick = () => router.push("/wishlist");
  const handleNotificationClick = () => router.push("/coming");

  const dropdownLinks = [
    { name: "My Account",     path: "/my-account"    },
    { name: "My Orders",      path: "/orders"        },
    { name: "My Messages",    path: "/messages"      },
    { name: "Help & Support", path: "/help-support"  },
    { name: "Sign Out",       path: "/", isLogout: true },
  ];

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <IconButton icon="mdi:heart-outline" label="Wishlist" count={wishlistItems} showCount onClick={handleWishlistClick} />
        <IconButton icon="mdi:cart-outline" label="My Cart" count={cartItems} showCount onClick={handleCartClick} />
        <Link
          href="/auth/register"
          className="hidden sm:inline-flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-[12px] font-semibold"
        >
          Get Started
        </Link>
      </div>
    );
  }

  // Role-based UI
  const renderCustomerButtons = () => (
    <>
      <IconButton icon="mdi:heart-outline" label="Wishlist" count={wishlistItems} showCount onClick={handleWishlistClick} />

      {/* Notifications */}
      <div className="relative" ref={notificationRef}>
        <button
          onClick={toggleNotifications}
          className={`relative p-1.5 rounded-lg transition-all duration-200 ${
            showNotifications ? 'text-orange-500 bg-orange-50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
          }`}
          aria-label="Notifications"
        >
          <Icon icon={showNotifications ? "solar:bell-bold-duotone" : "solar:bell-linear"} className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        {showNotifications && (
          <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} userToken={token} />
        )}
      </div>

      <IconButton icon="mdi:cart-outline" label="My Cart" count={cartItems} showCount onClick={handleCartClick} />

      {/* Profile dropdown — My Orders + My Messages live here */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-white">{getInitials(user?.name)}</span>
          </div>
          <span className="hidden sm:block text-[12px] font-semibold text-gray-700 max-w-[80px] truncate">
            {user?.name?.split(" ")[0]}
          </span>
          <Icon icon="mdi:chevron-down" className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-1.5 w-52 z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden">
            {/* user info row */}
            <div className="px-4 py-2.5 border-b border-gray-50">
              <p className="text-[12px] font-bold text-gray-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
            </div>
            <div className="py-1">
              {dropdownLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={link.isLogout ? handleLogout : () => setIsDropdownOpen(false)}
                  className={`block px-4 py-2 text-[13px] font-medium transition-colors ${
                    link.isLogout
                      ? 'text-red-500 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );

  const renderRepairmanButtons = () => (
    <>
      <IconButton icon="mdi:heart-outline" label="Wishlist" count={wishlistItems} showCount onClick={handleWishlistClick} />
      <IconButton icon="mdi:bell-outline" label="Notifications" count={notificationCount} showCount onClick={handleNotificationClick} />
      <IconButton icon="mdi:cart-outline" label="My Cart" count={cartItems} showCount onClick={handleCartClick} />

      <DashboardLink link="/repair-man/dashboard" />
    </>
  );

  const renderSellerButtons = () => (
    <>
      <IconButton icon="mdi:heart-outline" label="Wishlist" count={wishlistItems} showCount onClick={handleWishlistClick} />
      <IconButton icon="mdi:cart-outline" label="My Cart" count={cartItems} showCount onClick={handleCartClick} />

      {/* Seller profile dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-white">{getInitials(user?.name)}</span>
          </div>
          <span className="hidden sm:block text-[12px] font-semibold text-gray-700 max-w-[80px] truncate">
            {user?.name?.split(" ")[0]}
          </span>
          <Icon icon="mdi:chevron-down" className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-1.5 w-56 z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-50">
              <p className="text-[12px] font-bold text-gray-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
              {sellerIdDisplay ? (
                <div className="mt-1.5 flex items-center gap-1.5 bg-primary-50 border border-primary-100 rounded-lg px-2 py-1">
                  <Icon icon="mdi:identifier" className="w-3 h-3 text-primary-500 flex-shrink-0" />
                  <span className="text-[10px] text-primary-500 font-semibold">Seller ID</span>
                  <span className="text-[11px] font-mono font-black text-primary-700 ml-auto">#{sellerIdDisplay}</span>
                </div>
              ) : (
                <div className="mt-1.5 h-5 w-24 bg-gray-100 rounded animate-pulse" />
              )}
            </div>
            <div className="py-1">
              <Link
                href="/seller/dashboard"
                onClick={() => setIsDropdownOpen(false)}
                className="block px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => { handleLogout(); setIsDropdownOpen(false); }}
                className="block w-full text-left px-4 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  const renderAdminButtons = () => (
    <>
      <IconButton icon="mdi:bell-outline" label="Notifications" count={notificationCount} showCount onClick={handleNotificationClick} />
      <DashboardLink link="/admin/dashboard" />
    </>
  );

  const roleButtons = {
    customer: renderCustomerButtons,
    repairman: renderRepairmanButtons,
    seller: renderSellerButtons,
    admin: renderAdminButtons,
  };

  const renderButtons = roleButtons[user.role];

  return (
    <div className="flex items-center gap-4">
      {renderButtons ? renderButtons() : <h3>Login</h3>}
    </div>
  );
}

export default ButtonSection;