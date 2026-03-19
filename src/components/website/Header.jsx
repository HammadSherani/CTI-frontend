"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import Marquee from "react-fast-marquee";

/* ════════════════════════════════════════════
   MOCK SEARCH DATA  (replace with real API)
════════════════════════════════════════════ */
const SEARCH_SUGGESTIONS = [
  { id: 1,  type: "product",  icon: "mdi:cellphone",        label: "iPhone 14 Pro Max",         category: "Smartphones" },
  { id: 2,  type: "product",  icon: "mdi:cellphone",        label: "Samsung Galaxy S24",         category: "Smartphones" },
  { id: 3,  type: "product",  icon: "mdi:laptop",           label: "MacBook Pro 14\" Refurbished",category: "Laptops"     },
  { id: 4,  type: "product",  icon: "mdi:tablet",           label: "iPad Air 5th Gen",           category: "Tablets"     },
  { id: 5,  type: "repair",   icon: "mdi:tools",            label: "Screen Repair – iPhone 13",  category: "Repair"      },
  { id: 6,  type: "repair",   icon: "mdi:battery-charging", label: "Battery Replacement",        category: "Repair"      },
  { id: 7,  type: "repair",   icon: "mdi:wrench",           label: "Water Damage Repair",        category: "Repair"      },
  { id: 8,  type: "product",  icon: "mdi:headphones",       label: "AirPods Pro 2nd Gen",        category: "Accessories" },
  { id: 9,  type: "product",  icon: "mdi:watch",            label: "Apple Watch Series 9",       category: "Wearables"   },
  { id: 10, type: "repair",   icon: "mdi:camera",           label: "Camera Lens Repair",         category: "Repair"      },
];

const TRENDING = ["iPhone 15", "Samsung S24", "Screen Repair", "MacBook", "AirPods"];

/* ════════════════════════════════════════════
   SEARCH SUGGESTIONS DROPDOWN
════════════════════════════════════════════ */
function SearchSuggestions({ query, results, onSelect, onClose, visible }) {
  if (!visible) return null;

  const typeColor = { product: "text-blue-500", repair: "text-orange-500" };
  const typeBg    = { product: "bg-blue-50",    repair: "bg-orange-50"   };

  return (
    <div className="absolute top-full left-0 right-0 mt-1.5 z-[200] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">

      {/* ── No query → show trending ── */}
      {!query.trim() && (
        <div className="p-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Icon icon="mdi:fire" className="text-orange-500 w-3.5 h-3.5" /> Trending Searches
          </p>
          <div className="flex flex-wrap gap-2">
            {TRENDING.map((t) => (
              <button
                key={t}
                onMouseDown={() => onSelect(t)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-[12px] font-medium rounded-full transition-colors"
              >
                <Icon icon="mdi:trending-up" className="w-3.5 h-3.5" /> {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Has query → show results ── */}
      {query.trim() && results.length > 0 && (
        <div className="py-2 max-h-72 overflow-y-auto">
          {results.map((item, i) => (
            <button
              key={item.id}
              onMouseDown={() => onSelect(item.label)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group text-left"
            >
              {/* Icon bubble */}
              <span className={`flex-shrink-0 w-8 h-8 rounded-lg ${typeBg[item.type]} flex items-center justify-center`}>
                <Icon icon={item.icon} className={`w-4 h-4 ${typeColor[item.type]}`} />
              </span>
              <div className="flex-1 min-w-0">
                {/* Highlight matching text */}
                <span className="text-[13px] font-medium text-gray-800 leading-tight block truncate">
                  {item.label.split(new RegExp(`(${query})`, 'gi')).map((part, j) =>
                    part.toLowerCase() === query.toLowerCase()
                      ? <mark key={j} className="bg-orange-100 text-orange-600 rounded px-0.5">{part}</mark>
                      : part
                  )}
                </span>
                <span className="text-[11px] text-gray-400">{item.category}</span>
              </div>
              <Icon icon="mdi:arrow-top-left" className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* ── Has query but no results ── */}
      {query.trim() && results.length === 0 && (
        <div className="px-4 py-6 text-center">
          <Icon icon="mdi:magnify-remove-outline" className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-[13px] text-gray-400">No results for <strong className="text-gray-600">"{query}"</strong></p>
        </div>
      )}

      {/* ── Footer ── */}
      {query.trim() && results.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-2.5">
          <button
            onMouseDown={() => onSelect(query)}
            className="text-[12px] font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1"
          >
            <Icon icon="mdi:magnify" className="w-4 h-4" />
            Search for "{query}"
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   SEARCH BAR
════════════════════════════════════════════ */
function SearchBar({ className = "" }) {
  const [query, setQuery]       = useState("");
  const [focused, setFocused]   = useState(false);
  const [results, setResults]   = useState([]);
  const router                  = useRouter();
  const inputRef                = useRef(null);
  const wrapRef                 = useRef(null);

  // Filter suggestions on query change
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(SEARCH_SUGGESTIONS.filter(
      (s) => s.label.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    ));
  }, [query]);

  const handleSelect = (value) => {
    setQuery(value);
    setFocused(false);
    inputRef.current?.blur();
    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) handleSelect(query.trim());
  };

  const showDropdown = focused;

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`} ref={wrapRef}>
      <div className={`flex items-center bg-white border-2 rounded-xl px-4 py-2.5 transition-all duration-200 ${
        focused ? "border-orange-500 shadow-lg shadow-orange-100" : "border-gray-200 hover:border-gray-300"
      }`}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, repairs, brands…"
          className="flex-1 bg-transparent outline-none text-[14px] placeholder-gray-400 text-gray-800 mx-3"
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="text-gray-300 hover:text-gray-500 transition-colors mr-1">
            <Icon icon="mdi:close-circle" className="w-4.5 h-4.5" />
          </button>
        )}

  <button type="button" className="text-gray-400 hover:text-orange-500 transition-colors ml-1">
                <Icon icon="mdi:magnify" className="w-5 h-5" />
        </button>
        <button type="button" className="text-gray-400 hover:text-orange-500 transition-colors ml-1">
          <Icon icon="mdi:microphone-outline" className="w-5 h-5" />
        </button>
      </div>

      <SearchSuggestions
        query={query}
        results={results}
        onSelect={handleSelect}
        visible={showDropdown}
      />
    </form>
  );
}

/* ════════════════════════════════════════════
   ANNOUNCEMENT BAR
════════════════════════════════════════════ */
function AnnouncementBar() {
  return (
    <div className="bg-gray-50 border-b border-gray-100 py-2 text-[12px] font-medium text-gray-600">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-center sm:text-left">
          Get your gadgets repaired in{" "}
          <span className="text-orange-600 font-bold">24 hours</span>! Free doorstep pickup in select cities.
        </p>
        <div className="flex items-center gap-5">
          <Link href="/login" className="flex items-center gap-1 hover:text-orange-600 transition-colors">
            <Icon icon="mdi:account-circle-outline" className="w-4 h-4" /> Login
          </Link>
          <a href="tel:+234567890" className="flex items-center gap-1 hover:text-orange-600 transition-colors">
            <Icon icon="mdi:phone" className="w-4 h-4" /> +234 567 890
          </a>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MID HEADER
════════════════════════════════════════════ */
function MidHeader({ mobileMenuOpen, setMobileMenuOpen }) {
  const { user } = useSelector((state) => state.auth) || {};
  const cartCount = useSelector((state) => state.cart?.items?.length) || 0;

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3 md:gap-6">

          {/* ── Hamburger (mobile only) ── */}
          <button
            className="md:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-orange-50 transition-colors"
            onClick={() => setMobileMenuOpen((p) => !p)}
            aria-label="Menu"
          >
            <Icon icon={mobileMenuOpen ? "mdi:close" : "mdi:menu"} className="w-6 h-6 text-gray-700" />
          </button>

          {/* ── Logo ── */}
          <Link href="/" className="flex-shrink-0">
            <div className="relative w-14 h-12 md:w-20 md:h-16">
              <Image src="/assets/logo.png" alt="Click To Integrate" fill className="object-contain" />
            </div>
          </Link>

          {/* ── Search (desktop: inline, mobile: hidden here → shown below) ── */}
          <SearchBar className="hidden md:block flex-1 max-w-2xl" />

          {/* ── Right Icons ── */}
          <div className="flex items-center gap-2 md:gap-4 ml-auto md:ml-0">
            {/* Wishlist */}
            <button aria-label="Wishlist" className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl hover:bg-orange-50 hover:text-orange-500 transition-colors text-gray-600">
              <Icon icon="mdi:heart-outline" className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Cart */}
            <button aria-label="Cart" className="relative flex w-9 h-9 items-center justify-center rounded-xl hover:bg-orange-50 hover:text-orange-500 transition-colors text-gray-600">
              <Icon icon="mdi:cart-outline" className="w-5 h-5 md:w-6 md:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] px-1 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User avatar / Get Started */}
            {user ? (
              <button className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Icon icon="mdi:account" className="w-5 h-5 text-orange-600" />
              </button>
            ) : (
              <Link
                href="/auth/register"
                className="hidden sm:inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-200 shadow-sm"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>

        {/* ── Mobile Search (below logo row) ── */}
        <div className="md:hidden mt-3">
          <SearchBar />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MOBILE MENU DRAWER
════════════════════════════════════════════ */
function MobileMenu({ open, onClose }) {
  const navLinks = [
    { label: "Home",          href: "/",           icon: "mdi:home-outline"         },
    { label: "Mobile Repair", href: "/repair",     icon: "mdi:cellphone-wrench"     },
    { label: "Buy Devices",   href: "/products",   icon: "mdi:shopping-outline"     },
    { label: "Academy",       href: "/academy",    icon: "mdi:school-outline"       },
    { label: "Track Order",   href: "/orders",     icon: "mdi:map-marker-path"      },
    { label: "Contact",       href: "/contact",    icon: "mdi:phone-outline"        },
  ];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 left-0 h-full w-72 z-[100] bg-white shadow-2xl transform transition-transform duration-300 md:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-[15px] font-bold text-gray-800">Menu</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
            <Icon icon="mdi:close" className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Links */}
        <nav className="py-3 px-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-orange-50 hover:text-orange-600 text-gray-700 text-[14px] font-medium transition-colors group"
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-orange-100 transition-colors">
                <Icon icon={link.icon} className="w-4.5 h-4.5" />
              </span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <Link
            href="/auth/register"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-[14px] font-semibold transition-colors"
          >
            <Icon icon="mdi:rocket-launch-outline" className="w-4.5 h-4.5" />
            Get Started Free
          </Link>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   PROMO MARQUEE
════════════════════════════════════════════ */
function PromoMarquee() {
  const items = [
    { icon: "mdi:truck-fast-outline",  text: "Free Shipping & Fast Delivery" },
    { icon: "mdi:shield-check-outline",text: "1 Year Warranty"               },
    { icon: "mdi:certificate-outline", text: "Premium Quality Refurbished"   },
    { icon: "mdi:headset",             text: "24/7 Customer Support"         },
    { icon: "mdi:lock-outline",        text: "Secure Payments"               },
  ];

  return (
    <div className="bg-orange-500 text-white py-2.5 overflow-hidden">
      <Marquee speed={55} pauseOnHover gradient={false}>
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-2 mx-8 text-[13px] font-semibold">
            <Icon icon={item.icon} className="w-4.5 h-4.5 opacity-90" />
            <span>{item.text}</span>
            <span className="ml-6 text-orange-200">✦</span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN HEADER EXPORT
════════════════════════════════════════════ */
export default function Header() {
  const [scrolled, setScrolled]           = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? "shadow-md" : ""}`}>
        <AnnouncementBar />
        <MidHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      </header>

      {/* Marquee sits below sticky header */}
      <PromoMarquee />

      {/* Mobile Drawer */}
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}