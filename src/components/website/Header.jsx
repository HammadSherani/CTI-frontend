"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect, useRef } from "react";
import logo from "../../../public/assets/logo.png";
import Image from "next/image";
import Link from "next/link";
import { useNotifications } from "@/hooks/useNotifications";
import { useSelector } from "react-redux";
import socketService from "@/utils/socketService";

export function TopHeader() {
  const [language, setLanguage] = useState("English");
  const [showSearch, setShowSearch] = useState(false);
  const languages = [
    { name: "English", flag: "twemoji:flag-for-flag-united-states" },
    { name: "Türkçe", flag: "twemoji:flag-for-flag-turkey" },
  ];


  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
      <div className="flex flex-col container mx-auto md:flex-row justify-between items-center px-4 py-2 text-sm text-gray-600">
        {/* Social Icons */}
        <div className="flex gap-3 mb-2 md:mb-0 py-1.5">
          <Icon
            icon="mdi:facebook"
            className="hover:text-orange-500 hover:scale-110 cursor-pointer text-xl transition-all duration-200"
            aria-label="Facebook"
          />
          <Icon
            icon="mdi:twitter"
            className="hover:text-blue-400 hover:scale-110 cursor-pointer text-xl transition-all duration-200"
            aria-label="Twitter"
          />
          <Icon
            icon="mdi:instagram"
            className="hover:text-pink-500 hover:scale-110 cursor-pointer text-xl transition-all duration-200"
            aria-label="Instagram"
          />
          <Icon
            icon="mdi:linkedin"
            className="hover:text-blue-600 hover:scale-110 cursor-pointer text-xl transition-all duration-200"
            aria-label="LinkedIn"
          />
          <Icon
            icon="mdi:youtube"
            className="hover:text-red-500 hover:scale-110 cursor-pointer text-xl transition-all duration-200"
            aria-label="YouTube"
          />
        </div>

        {/* Mobile Search Toggle */}
        <div className="md:hidden">
          <Icon
            icon="mdi:magnify"
            className="hover:text-orange-500 cursor-pointer text-xl"
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Search"
          />
        </div>

        {/* Links and Language Selector */}
        <div className="flex flex-wrap gap-3 md:gap-5 items-center justify-center">
          <a href="#" className="hover:text-orange-500 transition-colors duration-200 flex items-center gap-1">
            <Icon icon="mdi:ticket-percent" className="text-sm" />

            Discount Couponn
          </a>
          <a href="#" className="hover:text-orange-500 transition-colors duration-200 flex items-center gap-1">
            <Icon icon="mdi:store" className="text-sm" />
            Sell on Platform
          </a>
          <a href="#" className="hover:text-orange-500 transition-colors duration-200 flex items-center gap-1">
            <Icon icon="mdi:information" className="text-sm" />
            About Us
          </a>
          <a href="#" className="hover:text-orange-500 transition-colors duration-200 flex items-center gap-1">
            <Icon icon="mdi:help-circle" className="text-sm" />
            Help & Support
          </a>

          {/* Currency Selector */}
          <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-md shadow-sm">
            <Icon icon="mdi:currency-usd" className="text-green-600" />
            <span className="font-medium">USD</span>
          </div>

          {/* Language Selector */}
          {/* <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-md px-3 py-1 text-gray-600 hover:text-orange-500 cursor-pointer pr-8 shadow-sm transition-all duration-200"
              aria-label="Select Language"
            >
              {languages.map((lang) => (
                <option key={lang.name} value={lang.name}>
                  {lang.name}
                </option>
              ))}
            </select>
            <Icon
              icon={languages.find((lang) => lang.name === language)?.flag || "twemoji:flag-for-flag-united-states"}
              className="w-5 h-5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div> */}

          {/* <LanguageSwitcher /> */}
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="md:hidden px-4 pb-3">
          <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
            <Icon icon="mdi:magnify" className="text-gray-400" />
            <input
              type="text"
              placeholder="Search for items..."
              className="bg-transparent outline-none px-3 w-full"
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function MidHeader() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [cartItems, setCartItems] = useState(3);
  const [wishlistItems, setWishlistItems] = useState(5);

  return (
    <div className="bg-white shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-center px-4 py-4 gap-4 container mx-auto">
        <div className="">
          <Link href={"/"} className="flex items-center gap-2">
            <Image
              src={logo}
              alt="Logo"
              className="w-32 h-auto hover:scale-105 transition-transform duration-200"
              height={1000}
              width={1000}
            />
          </Link>
        </div>

        <div className="flex items-center w-full md:w-2/4 relative">
          <div className={`flex items-center bg-gray-100 rounded-full w-full px-4 transition-all duration-300 ${searchFocused ? 'ring-2 ring-orange-500 bg-white shadow-lg' : 'hover:bg-gray-200'
            }`}>
            <Icon icon="mdi:magnify" className="text-gray-400" aria-label="Search Icon" />
            <input
              type="text"
              placeholder="Search for repair services, parts, or technicians..."
              className="bg-transparent outline-none px-3 py-3 w-full"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              aria-label="Search for items"
            />
            <Icon
              icon="mdi:microphone"
              className="text-gray-400 hover:text-orange-500 cursor-pointer ml-2"
              aria-label="Voice Search"
            />
          </div>

          {searchFocused && (
            <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg mt-2 z-50 border">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {['iPhone Repair', 'Screen Fix', 'Battery Replacement', 'Water Damage']?.map((term) => (
                    <span key={term} className="bg-gray-100 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-orange-100">
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 md:gap-5 text-xl items-center">
          {/* Wishlist */}
          <div className="relative group cursor-pointer" aria-label="Wishlist">
            <Icon
              icon="mdi:heart-outline"
              className="text-gray-600 hover:text-red-500 transition-colors duration-200"
            />
            {wishlistItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {wishlistItems}
              </span>
            )}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Wishlist ({wishlistItems})
            </div>

            {/* <LanguageSwitcher /> */}
          </div>

          <Link href="/my-account" className="relative group cursor-pointer" aria-label="Account">
            <Icon
              icon="mdi:account-circle"
              className="text-gray-600 hover:text-orange-500 transition-colors duration-200"
            />
          </Link>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">

            My Account

          </div>

          {/* Notifications */}
          <div className="relative group cursor-pointer" aria-label="Notifications">
            <Icon
              icon="mdi:bell-outline"
              className="text-gray-600 hover:text-blue-500 transition-colors duration-200"
            />
            <span className="absolute -top-1 -right-1 bg-blue-500 w-2 h-2 rounded-full"></span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Notifications
            </div>
          </div>

          {/* Enhanced Cart */}
          <div className="flex items-center gap-2 relative group cursor-pointer bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-lg transition-all duration-200" aria-label="Cart">
            <div className="relative">
              <Icon icon="mdi:cart-outline" className="text-orange-600" />
              {cartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {cartItems}
                </span>
              )}
            </div>
            <div className="hidden md:block">
              <span className="text-gray-700 text-sm block">My cart</span>
              <span className="text-orange-600 font-bold text-sm">$247.50</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LowerHeader() {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const dropdownRef = useRef(null);


 const navItems = [
  { label: "Home", icon: "mdi:home", path: "/" },
  { label: "Hire Repairman", icon: "mdi:map-marker", path: "/hire-repairman" },
  { label: "Quick Service", icon: "mdi:flash", path: "/quick-service", badge: "New" },
  { label: "Repair Shops", icon: "mdi:store", path: "/repair-shops" },
  { label: "Deals", icon: "mdi:tag", path: "/deals" },
  { label: "Contact", icon: "mdi:phone", path: "/contact" },
];

  const categories = [
    {
      icon: "mdi:cellphone",
      name: "Mobile Repair",
      subCategories: ["iPhone Repair", "Android Repair", "Screen Replacement", "Battery Service"],
      link: "/mobile-repair"
    },
    {
      icon: "mdi:cellphone",
      name: "Hire Repairman",
      // subCategories: ["iPhone Repair", "Android Repair", "Screen Replacement", "Battery Service"],
      link: "/hire-repairman"
    },

  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
        setActiveCategory(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-t border-gray-200 shadow-sm">
      <div className="container mx-auto flex items-center  px-4 py-3 text-gray-700">
        <div className="flex items-center w-full justify-between">
          {/* Mobile Hamburger */}
          <div className="md:hidden mr-4">
            <Icon
              icon="mdi:menu"
              className="text-2xl cursor-pointer hover:text-orange-500 transition-colors duration-200"
              onClick={() => setIsNavOpen(!isNavOpen)}
              aria-label="Toggle Navigation Menu"
            />
          </div>

          {/* Enhanced Categories Dropdown */}
          <div className="relative mr-6 hidden md:block" ref={dropdownRef}>
            <div
              className="flex items-center gap-2 cursor-pointer bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all duration-200"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              aria-label="Toggle Categories Menu"
            >
              <Icon icon="mdi:apps" className="text-xl" />
              <span className="font-medium">ALL CATEGORIES</span>
              <Icon
                icon={isCategoryOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
                className="text-lg transition-transform duration-200"
              />
            </div>

            {isCategoryOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white shadow-sm rounded-lg w-80 z-50 border border-gray-200 overflow-hidden">
                {categories?.map((category, index) => (
                  <div
                    key={category.name}
                    className="relative group"
                    onMouseEnter={() => setActiveCategory(index)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    <Link href={category.link} className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 hover:text-orange-600 cursor-pointer transition-all duration-200  border-gray-100 last:border-b-0">
                      <Icon icon={category.icon} className="text-lg" />
                      <span className="font-medium">{category.name}</span>
                      <Icon icon="mdi:chevron-right" className="ml-auto text-gray-400" />
                    </Link>

                    {/* Subcategories */}
                    {activeCategory === index && (
                      <div className="absolute left-full top-0 ml-1 bg-white shadow-xl rounded-lg w-64 border border-gray-200 z-60">
                        <div className="p-3">
                          <h4 className="font-semibold text-gray-800 mb-2">{category.name}</h4>
                          {category.subCategories?.map((sub) => (
                            <div key={sub} className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer text-sm transition-colors duration-200">
                              {sub}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links */}
        <ul
      className={`${
        isNavOpen ? "flex" : "hidden"
      } md:flex flex-col md:flex-row gap-4 md:gap-8 text-sm w-full md:w-auto transition-all duration-300`}
    >
      {navItems.map((item, index) => (
        <li key={index}>
          <Link
            href={item.path}
            className="cursor-pointer hover:text-orange-500 transition-colors duration-200 flex items-center gap-1 font-medium"
          >
            <Icon icon={item.icon} />
            <span>{item.label}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
          {/* Quick Actions */}
          {/* <div className="hidden lg:flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon icon="mdi:clock" className="text-green-500" />
              <span>24/7 Service</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon icon="mdi:shield-check" className="text-blue-500" />
              <span>Warranty</span>
            </div>
          </div> */}
        </div>
      </div>
    </nav>
  );
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  const { user, token } = useSelector((state) => state.auth);
  const { unreadCount, notifications } = useNotifications(token);

  console.log('Socket connected:', socketService.isConnected);
  useEffect(() => {
    if (token && user?.role === 'customer') {
      console.log('Connecting socket for repairman:', user.name);
      socketService.connect(token);
      socketService.requestNotificationPermission();
    }

    return () => {
      if (user?.role === 'repairman') {
        socketService.disconnect();
      }
    };
  }, [token, user?.role, user?.name]);

  // const handleLogout = useCallback(() => {
  //   socketService.disconnect();
  //   dispatch(clearAuth());
  // }, [dispatch]);

  console.log("Notifications in Header:", notifications);
  console.log("Notifications unreadCount:", unreadCount);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`border-b border-gray-200 transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''
      }`}>
      <TopHeader />
      <MidHeader />
      <LowerHeader />
    </header>
  );
}