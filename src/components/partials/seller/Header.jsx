"use client"
import Image from 'next/image';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname, Link } from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '@/store/auth';
import { getInitials } from '@/utils/functions';
import axiosInstance from '@/config/axiosInstance';

const primaryNavLinks = [
  {
    name: "Dashboard",
    path: "/seller/dashboard",
    icon: "solar:home-2-bold-duotone",
  },
  {
    name: "Product",
    path: "/seller/product",
    icon: "solar:clipboard-list-bold-duotone",
    // hasSubmenu: true,
    // submenu: [
    //   { name: "All Products",  path: "/seller/product",          icon: "solar:box-bold-duotone" },
    //   { name: "Add Product",   path: "/seller/product/add",      icon: "solar:add-square-bold-duotone" },
    // ],
  },
  {
    name: "Order Management",
    path: "#",
    icon: "solar:box-minimalistic-bold-duotone",
    hasSubmenu: true,
    submenu: [
      { name: "All Orders", path: "/seller/order", icon: "solar:clipboard-list-bold-duotone" },
      { name: "Cancelled Orders", path: "/seller/order/cancelled", icon: "solar:close-circle-bold-duotone" },
      { name: "Returns", path: "/seller/returns", icon: "solar:arrow-left-bold-duotone" },
    ],
  },
  {
    name: "Wallet",
    path: "/seller/wallet",
    icon: "solar:wallet-money-bold-duotone",
  },
  {
    name: "Ads",
    path: "/seller/ads",
    icon: "solar:ads-bold-duotone",
  },
  {
    name: "Reports",
    path: "/seller/reports",
    icon: "solar:document-text-bold-duotone",
  },
  {
    name: "Invoices",
    path: "/seller/invoice",
    icon: "solar:bill-list-bold-duotone",
  },
  {
    name: "Enquiries",
    path: "/seller/enquiries",
    icon: "solar:chat-round-dots-bold-duotone",
  },
];

const dropdownLinks = [
  { name: "Profile Settings", path: "/seller/profile", icon: "solar:user-id-bold-duotone" },
  { name: "Help & Support", path: "/help-support", icon: "solar:question-circle-bold-duotone" },
  { name: "Sign Out", path: "/auth/logout", icon: "solar:logout-3-bold-duotone", isLogout: true },
];

function Header() {
  const pathname = usePathname();
  const profileDropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null); // name of open submenu
  const submenuRefs = useRef({});

  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [enquiryUnread, setEnquiryUnread] = useState(0);

  const handleLogout = useCallback(() => dispatch(clearAuth()), [dispatch]);

  /* Fetch unread enquiry count for the badge */
  useEffect(() => {
    const fetchUnread = () => {
      if (!token) return;
      axiosInstance.get('/seller/queries/stats', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(({ data }) => {
        if (data.success) setEnquiryUnread(data.data?.unread || 0);
      }).catch(() => { });
    };

    fetchUnread();

    window.addEventListener('enquiry_read', fetchUnread);
    return () => window.removeEventListener('enquiry_read', fetchUnread);
  }, [token, pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) { }
      // close any submenu if clicked outside all submenu containers
      const clickedInsideSomeSubmenu = Object.values(submenuRefs.current).some(
        (ref) => ref && ref.contains(e.target)
      );
      if (!clickedInsideSomeSubmenu) setOpenSubmenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsProfileOpen(false);
    setOpenSubmenu(null);
  }, [pathname]);

  const isActiveLink = useCallback((linkPath) => {
    if (linkPath === '#') return false;
    return pathname === linkPath || pathname.startsWith(linkPath + '/');
  }, [pathname]);

  const isSubmenuActive = useCallback((submenu) => {
    return submenu?.some((item) => isActiveLink(item.path));
  }, [isActiveLink]);

  const toggleSubmenu = (name) => setOpenSubmenu((prev) => (prev === name ? null : name));

  const renderNavLink = (link) => {
    if (link.hasSubmenu) {
      const isOpen = openSubmenu === link.name;
      const isActive = isSubmenuActive(link.submenu);
      return (
        <div
          key={link.name}
          className="relative"
          ref={(el) => { submenuRefs.current[link.name] = el; }}
        >
          <button
            onClick={() => toggleSubmenu(link.name)}
            className={`relative px-2 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap
              ${(isActive || isOpen)
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-500 hover:text-primary-600 hover:bg-gray-50'
              }`}
          >
            <Icon icon={link.icon} className="w-4 h-4 flex-shrink-0" />
            <span>{link.name}</span>
            <Icon
              icon="solar:alt-arrow-down-bold"
              className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
            {isActive && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-600 rounded-full" />}
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
              {link.submenu.map((sub) => (
                <Link
                  key={sub.name}
                  href={sub.path}
                  className={`flex items-center gap-2.5 mx-1.5 px-3 py-2 rounded-lg text-sm transition-all duration-150
                    ${isActiveLink(sub.path)
                      ? 'text-primary-600 bg-primary-50 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Icon icon={sub.icon} className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    const isEnquiries = link.path === '/seller/enquiries';
    return (
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
        {isEnquiries && enquiryUnread > 0 && (
          <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-violet-500 text-white text-[10px] font-black leading-none">
            {enquiryUnread > 99 ? '99+' : enquiryUnread}
          </span>
        )}
        {isActiveLink(link.path) && (
          <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-600 rounded-full" />
        )}
      </Link>
    );
  };

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
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-start">
            {primaryNavLinks.map(renderNavLink)}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileOpen((p) => !p)}
                className={`flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl transition-all duration-200
                  ${isProfileOpen ? 'bg-gray-100 ring-1 ring-gray-200' : 'hover:bg-gray-50'}`}
                aria-label="Profile menu"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-white">{getInitials(user?.name)}</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>

                <div className="hidden md:block text-left min-w-0">
                  <p className="text-xs font-semibold text-gray-800 capitalize truncate max-w-[100px]">{user?.name}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{user?.role}</p>
                </div>

                <Icon
                  icon="solar:alt-arrow-down-bold"
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isProfileOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 mb-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">{getInitials(user?.name)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate text-sm capitalize">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    {dropdownLinks.map((link) => (
                      <React.Fragment key={link.name}>
                        {link.isLogout && <div className="border-t border-gray-100 my-1.5 mx-3" />}
                        <Link
                          href={link.path}
                          className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm transition-all duration-150
                            ${link.isLogout ? 'text-red-600 hover:bg-red-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
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
            {primaryNavLinks.map((link) => {
              if (link.hasSubmenu) {
                return link.submenu.map((sub) => (
                  <Link
                    key={sub.name}
                    href={sub.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200
                      ${isActiveLink(sub.path) ? 'text-primary-600 bg-primary-50 font-semibold' : 'text-gray-500 hover:text-primary-600 hover:bg-gray-50'}`}
                  >
                    <Icon icon={sub.icon} className="w-3.5 h-3.5 flex-shrink-0" />
                    {sub.name}
                  </Link>
                ));
              }
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200
                    ${isActiveLink(link.path) ? 'text-primary-600 bg-primary-50 font-semibold' : 'text-gray-500 hover:text-primary-600 hover:bg-gray-50'}`}
                >
                  <Icon icon={link.icon} className="w-3.5 h-3.5 flex-shrink-0" />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
