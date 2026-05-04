"use client";
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';
import logo from "../../../../../public/assets/logo.png";
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '@/store/auth';

function EcomHeader() {
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const catalogDropdownRef = useRef(null);
  const ordersDropdownRef = useRef(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);
  const [isOrdersDropdownOpen, setIsOrdersDropdownOpen] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(clearAuth());
  };

  const primaryNavLinks = [
    {
      name: "Dashboard",
      path: "/admin/ecom/dashbaord",
      icon: "mdi:view-dashboard-outline",
    },
    {
      name: "Catalog",
      path: "#",
      icon: "mdi:folder-outline",
      hasSubmenu: true,
      submenu: [
        {
          category: "Categories",
          items: [
            { name: "Categories", icon: "mdi:shape-outline", path: "/admin/ecom/categories" },
            { name: "Sub Categories", icon: "mdi:shape-plus-outline", path: "/admin/ecom/sub-categories" },
          ],
        },
        {
          category: "Products",
          items: [
            { name: "All Products", icon: "mdi:package-variant-outline", path: "/admin/ecom/products" },
            { name: "Add Product", icon: "mdi:plus-box-outline", path: "/admin/ecom/products/add" },
          ],
        },
      ],
    },
    {
      name: "Orders",
      path: "#",
      icon: "mdi:cart-outline",
      hasSubmenu: true,
      submenu: [
        {
          category: "Order Management",
          items: [
            { name: "All Orders", icon: "mdi:clipboard-list-outline", path: "/admin/ecom/orders" },
            { name: "Pending Orders", icon: "mdi:clock-outline", path: "/admin/ecom/orders/pending" },
            { name: "Completed Orders", icon: "mdi:check-circle-outline", path: "/admin/ecom/orders/completed" },
          ],
        },
      ],
    },
    {
      name: "Sellers",
      path: "/admin/ecom/sellers",
      icon: "mdi:store-outline",
    },
    {
      name: "Transactions",
      path: "/admin/ecom/transactions",
      icon: "mdi:cash-multiple",
    },
  ];

  const dropdownLinks = [
    { name: "My Profile", path: "/admin/profile", icon: "mdi:account-cog-outline" },
    { name: "Settings", path: "/admin/settings", icon: "mdi:cog-outline" },
    { name: "Sign Out", path: "", icon: "mdi:logout", isLogout: true },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (catalogDropdownRef.current && !catalogDropdownRef.current.contains(event.target)) {
        setIsCatalogDropdownOpen(false);
      }
      if (ordersDropdownRef.current && !ordersDropdownRef.current.contains(event.target)) {
        setIsOrdersDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
    setIsCatalogDropdownOpen(false);
    setIsOrdersDropdownOpen(false);
  }, [pathname]);

  const isActiveLink = (linkPath) => {
    return pathname === linkPath || pathname.startsWith(linkPath + '/');
  };

  const isSubmenuActive = (submenu) => {
    return submenu?.some(group =>
      group.items?.some(item => isActiveLink(item.path))
    );
  };

  const renderNavLink = (link, dropdownOpen, setDropdownOpen, ref) => {
    if (link.hasSubmenu) {
      return (
        <div key={link.name} className="relative" ref={ref}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`relative px-4 py-5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
              ${(isSubmenuActive(link.submenu) || dropdownOpen)
                ? 'text-primary-600 '
                : 'text-gray-600 hover:text-primary-600 '
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
            <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {link.submenu.map((group, groupIndex) => (
                <div key={group.category}>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
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
        className={`relative px-4 py-5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
          ${isActiveLink(link.path)
            ? 'text-primary-600 '
            : 'text-gray-600 hover:text-primary-600 '
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
    <header className="bg-white sticky top-0 z-50 shadow-sm">

      {/* Top breadcrumb bar - main header se link */}
      <div className="bg-primary-600 px-6 py-1.5 flex items-center gap-2">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1.5 text-white hover:text-gray-100 text-xs transition-colors"
        >
          <Icon icon="mdi:arrow-left" className="w-3.5 h-3.5" />
          Admin Dashboard
        </Link>
        <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5 text-white" />
        <div className="flex items-center cursor-pointer gap-1.5 text-white text-xs">
          <Icon icon="mdi:store" className="w-3.5 h-3.5 text-white" />
          <span>Ecommerce Module</span>
        </div>
      </div>

      {/* Main nav bar */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto py-1 flex items-center justify-between">

          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-6">
            <Link href="/admin/ecom/dashboard" className="flex-shrink-0 flex items-center gap-2.5 pr-6 border-r border-gray-200">
              <Image
                src={logo}
                alt="RepairHub Logo"
                width={120}
                height={55}
                className="w-20 h-auto object-contain"
                priority
              />
              {/* <div className="hidden sm:block">
                <p className="text-xs font-semibold text-primary-600 leading-tight">Ecommerce</p>
                <p className="text-[10px] text-gray-400 leading-tight">Management Panel</p>
              </div> */}
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {primaryNavLinks.map((link) => {
                if (link.name === "Catalog") {
                  return renderNavLink(link, isCatalogDropdownOpen, setIsCatalogDropdownOpen, catalogDropdownRef);
                } else if (link.name === "Orders") {
                  return renderNavLink(link, isOrdersDropdownOpen, setIsOrdersDropdownOpen, ordersDropdownRef);
                }
                return renderNavLink(link);
              })}
            </nav>
          </div>

          {/* Right: User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200
                ${isDropdownOpen ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm ring-2 ring-white">
                  <span className="text-xs font-bold text-white">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AD'}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500 leading-tight">{user?.email || 'admin@example.com'}</p>
              </div>
              <Icon
                icon="mdi:chevron-down"
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-3 z-50">
                <div className="px-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AD'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{user?.name || 'Admin User'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
                      <p className="text-xs text-primary-600 font-medium mt-0.5">Ecom Administrator</p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  {dropdownLinks.map((link) => (
                    <div key={link.name}>
                      {link.isLogout && <div className="my-1 border-t border-gray-100" />}
                      <Link
                        href={link.path}
                        onClick={() => link.isLogout && handleLogout()}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                          ${link.isLogout
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <Icon icon={link.icon} className={`w-4 h-4 ${link.isLogout ? 'text-red-500' : 'text-gray-400'}`} />
                        <span className="font-medium">{link.name}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden border-t border-gray-100 bg-gray-50">
        <div className="container mx-auto px-4 py-3">
          <nav className="space-y-1">
            {primaryNavLinks.map((link) => (
              <div key={link.name}>
                {!link.hasSubmenu ? (
                  <Link
                    href={link.path}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                      ${isActiveLink(link.path) ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-white'}`}
                  >
                    <Icon icon={link.icon} className="w-4 h-4" />
                    {link.name}
                  </Link>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-gray-400 uppercase">
                      <Icon icon={link.icon} className="w-4 h-4" />
                      {link.name}
                    </div>
                    {link.submenu.map((group) => (
                      <div key={group.category} className="ml-4 space-y-1">
                        <p className="text-[10px] font-medium text-gray-400 px-4 uppercase">{group.category}</p>
                        {group.items.map((item) => (
                          <Link
                            key={item.name}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm
                              ${isActiveLink(item.path) ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-white'}`}
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

export default EcomHeader;