"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect, useRef } from "react";
import logo from "../../../public/assets/logo.png";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import socketService from "@/utils/socketService";
import ButtonSection from "./ButtonSection";
import { usePathname, useRouter } from "next/navigation";
import Marquee from "react-fast-marquee";
import { motion, AnimatePresence } from 'framer-motion';
import {
  MobileRepairCategory,
  NewProductsCategory,
  RefurbishedProductsCategory,
  AcademyCategory,
  EmptyCategory
} from "./CategoryComponents";

export function TopHeader() {
  const [showSearch, setShowSearch] = useState(false);

  const { user } = useSelector((state) => state.auth);



  const marqueeData = [
    { text: "", icon: "" }
  ]


  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 border-b border-primary-800 py-3">
      <Marquee pauseOnHover speed={70} gradient={false}>
        {[
          {
            icon: "material-symbols:shield-outline",
            text: "1 Year Warranty",
          },
          {
            icon: "mdi:truck-outline",
            text: "Free Shipping & Fast Delivery",
          },
          {
            icon: "humbleicons:certificate",
            text: "Premium Quality Refurbished Product",
          },
          {
            icon: "material-symbols:shield-outline",
            text: "1 Year Warranty",
          },
          {
            icon: "mdi:truck-outline",
            text: "Free Shipping & Fast Delivery",
          },
          {
            icon: "humbleicons:certificate",
            text: "Premium Quality Refurbished Product",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-6 text-gray-100 text-sm font-medium
                   hover:text-white transition-colors duration-200"
          >
            <Icon icon={item.icon} className="w-5 h-5 opacity-90" />
            <span>{item.text}</span>

            {/* Divider */}
            <span className="mx-6 h-4 w-px bg-white/30 last:hidden" />
          </div>
        ))}
      </Marquee>
    </div>

  );
}

export function MidHeader() {
  const [searchFocused, setSearchFocused] = useState(false);

  // const { user } = useSelector((state) => state.auth);

  return (
    <div className=" max-w-7xl mx-auto  border-b border-gray-100 ">
      <div className="flex flex-col md:flex-row  items-center px-4 py-4 gap-16 container mx-auto">
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

        <div className="flex items-center w-full md:w-[70%] relative">
          <div className={`flex items-center bg-gray-100 rounded-full w-full px-4 transition-all duration-300 ${searchFocused ? 'ring-2 ring-orange-500 bg-white shadow-lg' : ''
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
          <ButtonSection />
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
    { label: "Repairmans", icon: "mdi:map-marker", path: "/repairmans", isVisible: true },
    { label: "Refurbished Products", icon: "mdi:store", path: "/repair-shops", isVisible: true },
    { label: "New Products", icon: "mdi:flash", path: "/quick-service", badge: "New", isVisible: true },
    { label: "Academy", icon: "mdi:tag", path: "/deals", isVisible: true },
    { label: "Contact Us", icon: "mdi:phone", path: "/contact", isVisible: true },
    { label: "About Us", icon: "mdi:account-group-outline", path: "/about-us", isVisible: true },
  ];

  const categories = [
    {
      icon: "mdi:cellphone",
      name: "Mobile Repair",
      component: MobileRepairCategory,
      link: "/mobile-repair"
    },
    {
      icon: "mdi:package-variant",
      name: "New Products",
      component: NewProductsCategory,
      link: "/products"
    },
    // {
    //   icon: "mdi:recycle",
    //   name: "Refurbished Products",
    //   component: RefurbishedProductsCategory,
    //   link: "/refurbished-products"
    // },
    // {
    //   icon: "mdi:school",
    //   name: "Academy",
    //   component: AcademyCategory,
    //   link: "/academy"
    // },
  ];

  const pathname = usePathname();

  useEffect(() => {
    setIsCategoryOpen(false);
  }, [pathname]);


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
    <nav className="bg-white  max-w-7xl mx-auto py-1" >
      <div className="container mx-auto flex items-center relative   px-0 py-3 text-gray-700">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center w-full gap-2 ">
            <div className="md:hidden ">
              <Icon
                icon="mdi:menu"
                className="text-2xl cursor-pointer hover:text-orange-500 transition-colors duration-200"
                onClick={() => setIsNavOpen(!isNavOpen)}
                aria-label="Toggle Navigation Menu"
              />
            </div>

            <div className="relative mr-1 hidden md:block" ref={dropdownRef}>
              <div
                className="flex items-center gap-2 cursor-pointer  text-base font-bold px-4 py-2 rounded-full hover:bg-gray-100/60 transition-all duration-200"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                // onMouseEnter={() => setIsCategoryOpen(true)}
                // onMouseLeave={() => setIsCategoryOpen(false)}
                aria-label="Toggle Categories Menu"
              >
                {/* <Icon icon="mdi:apps" className="text-xl" /> */}
                <span className="font-bold text-sm">ALL CATEGORIES</span>
                <Icon
                  icon={isCategoryOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
                  className="text-lg transition-transform duration-200"
                />
              </div>

            </div>

            <ul
              className={`${isNavOpen ? "flex" : "hidden"
                } md:flex flex-col md:flex-row gap-2  text-[12px] w-full md:w-auto transition-all duration-300`}
            >
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.path}
                    className="cursor-pointer hover:bg-gray-100/60 font-bold py-2 px-5 rounded-full hover:text-primary-600 transition-all duration-300 flex items-center gap-1 text-[15px] font-medium"
                  >
                    <span className="font-bold">{item.label}</span>

                  </Link>
                </li>
              ))}
            </ul>


          </div>
          <div className="flex px-7 cursor-pointer text-primary-600 bg-gray-100 items-center gap-2 text-nowrap  py-2 rounded-full hover:bg-gray-200/90 transition-all duration-200">
            <button>
              <Link href={'/auth/register'}>
                Get Started
              </Link>
            </button>

          </div>
        </div>

        {isCategoryOpen && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute w-full bg-white top-full h-[65vh] left-0 mt-2 bg-white shadow-sm rounded-lg w-80 z-50 border border-gray-200 overflow-hidden max-w-6xl ml-6"
            >

              <div className="grid grid-cols-3" onMouseLeave={() => setActiveCategory(null)}>
                <div className="p-2 flex flex-col gap-1">
                  {categories?.map((category, index) => (
                    <div
                      key={category.name}
                      className="relative group"
                      onMouseEnter={() => setActiveCategory(index)}
                    >
                      <Link href={category.link} className="flex items-center rounded-md bg-gray-100/80  gap-3 px-4 py-3 hover:bg-orange-50 hover:text-orange-600 cursor-pointer transition-all duration-200  border-gray-100 last:border-b-0">
                        {/* <Icon icon={category.icon} className="text-lg" /> */}
                        <span className="font-medium">{category.name}</span>
                        <Icon icon="mdi:chevron-right" className="ml-auto text-gray-400" />
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
                  <AnimatePresence mode="wait">
                    {activeCategory !== null && categories[activeCategory] && (
                      <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.15 }}
                        className="bg-white rounded-lg p-4 shadow-sm"
                      >
                        {(() => {
                          const CategoryComponent = categories[activeCategory].component;
                          return CategoryComponent ? (
                            <CategoryComponent />
                          ) : (
                            <EmptyCategory categoryName={categories[activeCategory].name} />
                          );
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </nav>
  );
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`border-b bg-white border-gray-200 transition-all duration-300 ${isScrolled ? 'shadow-xs' : ''
      }`}>
      <TopHeader />
      <MidHeader />
      <LowerHeader />
    </header>
  );
}