'use client'

import { clearAuth } from '@/store/auth';
import { getInitials } from '@/utils/functions';
import { Icon } from '@iconify/react';
import { useRouter, Link } from '@/i18n/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const IconButton = ({
  icon,
  label,
  count = 0,
  showCount = false,
  href,
  onClick
}) => {
  const button = (
    <div className="relative group cursor-pointer" aria-label={label}>
      <Icon
        icon={icon}
        className="text-gray-600 hover:text-orange-500 transition-colors duration-200"
        width={24}
        height={24}
      />
      {showCount && count > 0 && (
        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
          {count}
        </span>
      )}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
        {label} {showCount && `(${count})`}
      </div>
    </div>
  );

  if (href) return <Link href={href}>{button}</Link>;
  return <div onClick={onClick}>{button}</div>;
};

const DashboardLink = ({ link }) => (
  <Link href={link}>
    <button className="relative ml-1 text-sm group px-6 cursor-pointer py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors duration-200 font-medium shadow-sm">
      Dashboard
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
        Go to Dashboard
      </div>
    </button>
  </Link>
);

function ButtonSection() {
  const [cartItems] = useState(1);
  const [wishlistItems] = useState(1);
  const [notificationCount] = useState(4);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    { name: "Account", path: "/my-account", icon: "mdi:account-cog-outline" },
    { name: "Help & Support", path: "/help-support", icon: "mdi:help-circle-outline" },
    { name: "Sign Out", path: "/", icon: "mdi:logout", isLogout: true },
  ];

  if (!user) {
    return (
      <div className="flex items-center">
        <Link href="/wishlist">
          <button className="p-3 hover:bg-gray-100/60 w-12 h-12 flex justify-center rounded-full">
            <Icon icon="mdi:heart-outline" width="22" height="22" />
          </button>
        </Link>

        <Link href="/cart">
          <button className="p-3 hover:bg-gray-100/60 w-12 h-12 flex justify-center rounded-full">
            <Icon icon="proicons:cart" width="22" height="22" />
          </button>
        </Link>

        <Link
          href="/auth/register"
          className="hidden sm:inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-[13px] font-semibold"
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
      <IconButton icon="mdi:bell-outline" label="Notifications" count={notificationCount} showCount onClick={handleNotificationClick} />
      <IconButton icon="mdi:cart-outline" label="My Cart" count={cartItems} showCount onClick={handleCartClick} />

      <div className="relative" ref={dropdownRef}>
        <button onClick={toggleDropdown} className="flex items-center gap-2 px-2 py-1.5 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-xs text-white">{getInitials(user?.name)}</span>
          </div>
          <Icon icon="mdi:chevron-down" className={`${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 z-40 bg-white rounded-xl shadow-xl py-2">
            {dropdownLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={link.isLogout ? handleLogout : undefined}
                className="flex items-center gap-3 text-gray-600 px-4 py-2 text-sm hover:bg-gray-100"
              >
                <Icon icon={link.icon} className="w-4 h-4" />
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const renderRepairmanButtons = () => (
    <>
      <IconButton icon="mdi:bell-outline" label="Notifications" count={notificationCount} showCount onClick={handleNotificationClick} />
      <DashboardLink link="/repair-man/dashboard" />
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