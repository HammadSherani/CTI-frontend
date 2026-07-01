"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import Marquee from "react-fast-marquee";
import ButtonSection from "./ButtonSection";
import { AnimatePresence, motion } from "framer-motion";
import CustomTranslate from "../Translate";
import { useLocale, useTranslations } from "next-intl";
import axiosInstance from "@/config/axiosInstance";
import useDebounce from "@/hooks/useDebounce";

/* ════════════════════════════════════════════
   SEARCH SUGGESTIONS DROPDOWN
════════════════════════════════════════════ */
function SearchSuggestions({ query, data, loading, onSelect, visible }) {
  if (!visible) return null;

  const hasResults =
    data.products.length > 0 ||
    data.categories.length > 0 ||
    data.brands.length > 0 ||
    data.sellers.length > 0;

  const highlight = (text) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-orange-100 text-orange-600 rounded px-0.5 not-italic">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1.5 z-[200] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
          <Icon icon="mdi:loading" className="animate-spin w-4 h-4" />
          Searching…
        </div>
      )}

      {/* No query — show hint */}
      {!loading && !query.trim() && (
        <div className="px-4 py-4 text-sm text-gray-400 text-center">
          Start typing to search products, stores, categories…
        </div>
      )}

      {/* Has results */}
      {!loading && query.trim() && hasResults && (
        <div className="py-2 max-h-[420px] overflow-y-auto divide-y divide-gray-50">

          {/* Products */}
          {data.products.length > 0 && (
            <div className="pb-1">
              <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Products
              </p>
              {data.products.map((item) => (
                <button
                  key={item._id}
                  onMouseDown={() => onSelect({ type: "product", value: item.title, slug: item.slug })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group text-left"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Icon icon="mdi:cellphone" className="w-4 h-4 text-blue-500" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium text-gray-800 leading-tight block truncate">
                      {highlight(item.title)}
                    </span>
                    {item.category && (
                      <span className="text-[11px] text-gray-400">{item.category}</span>
                    )}
                  </div>
                  {item.minPrice > 0 && (
                    <span className="text-[12px] font-bold text-orange-500 flex-shrink-0">
                      ${item.minPrice.toFixed(2)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Categories */}
          {data.categories.length > 0 && (
            <div className="pb-1">
              <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Categories
              </p>
              {data.categories.map((item) => (
                <button
                  key={item._id}
                  onMouseDown={() => onSelect({ type: "category", value: item.title, id: item._id })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group text-left"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-50 overflow-hidden flex items-center justify-center">
                    {item.icon ? (
                      <img src={item.icon} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <Icon icon="mdi:tag" className="w-4 h-4 text-purple-500" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium text-gray-800 block truncate">
                      {highlight(item.title)}
                    </span>
                    {item.productCount > 0 && (
                      <span className="text-[11px] text-gray-400">{item.productCount} products</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Brands */}
          {data.brands.length > 0 && (
            <div className="pb-1">
              <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Brands
              </p>
              {data.brands.map((item) => (
                <button
                  key={item._id}
                  onMouseDown={() => onSelect({ type: "brand", value: item.title, id: item._id })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group text-left"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-50 overflow-hidden flex items-center justify-center">
                    {item.icon ? (
                      <img src={item.icon} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <Icon icon="mdi:tag-outline" className="w-4 h-4 text-green-500" />
                    )}
                  </span>
                  <span className="text-[13px] font-medium text-gray-800 truncate">
                    {highlight(item.title)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Sellers */}
          {data.sellers.length > 0 && (
            <div className="pb-1">
              <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Stores
              </p>
              {data.sellers.map((item) => (
                <button
                  key={item._id}
                  onMouseDown={() => onSelect({ type: "seller", value: item.businessName, id: item._id })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group text-left"
                >
                  {item.logo ? (
                    <img src={item.logo} alt={item.businessName} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center font-bold text-orange-500 text-sm">
                      {item.businessName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium text-gray-800 block truncate">
                      {highlight(item.businessName)}
                    </span>
                    {item.address && (
                      <span className="text-[11px] text-gray-400 truncate block">{item.address}</span>
                    )}
                  </div>
                  <Icon icon="mdi:store" className="w-4 h-4 text-gray-300 group-hover:text-orange-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {!loading && query.trim() && !hasResults && (
        <div className="px-4 py-6 text-center">
          <Icon icon="mdi:magnify-remove-outline" className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-[13px] text-gray-400">
            No results for <strong className="text-gray-600">"{query}"</strong>
          </p>
        </div>
      )}

      {/* Footer — view all */}
      {!loading && query.trim() && hasResults && (
        <div className="border-t border-gray-100 px-4 py-2.5">
          <button
            onMouseDown={() => onSelect({ type: "all", value: query })}
            className="text-[12px] font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1"
          >
            <Icon icon="mdi:magnify" className="w-4 h-4" />
            See all results for "{query}"
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   SEARCH BAR
════════════════════════════════════════════ */
const EMPTY_RESULTS = { products: [], categories: [], brands: [], sellers: [] };

function SearchBar({ className = "" }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(EMPTY_RESULTS);
      return;
    }
    let cancelled = false;
    setLoading(true);
    axiosInstance
      .get(`/e-commerce/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(({ data }) => {
        if (!cancelled && data.success) setResults(data.data);
      })
      .catch(() => { })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const handleSelect = useCallback(({ type, value, slug, id }) => {
    setQuery(value);
    setFocused(false);
    inputRef.current?.blur();

    if (type === "product" && slug) router.push(`/product/${slug}`);
    else if (type === "category" && id) router.push(`/product?categoryIds=${id}`);
    else if (type === "brand" && id) router.push(`/product?brandIds=${id}`);
    else if (type === "seller" && id) router.push(`/store/${id}`);
    else router.push(`/product?q=${encodeURIComponent(value)}`);
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) handleSelect({ type: "all", value: query.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className={`flex items-center bg-white border rounded-lg px-3 py-1.5 transition-all duration-200 ${focused ? "border-orange-400 shadow-sm shadow-orange-100" : "border-gray-200 hover:border-gray-300"
        }`}>
        <Icon icon="mdi:magnify" className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, brands, stores…"
          className="flex-1 bg-transparent outline-none text-[13px] placeholder-gray-400 text-gray-800 mx-2"
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setResults(EMPTY_RESULTS); }}
            className="text-gray-300 hover:text-gray-500 transition-colors"
          >
            <Icon icon="mdi:close-circle" className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <SearchSuggestions
        query={query}
        data={results}
        loading={loading}
        onSelect={handleSelect}
        visible={focused}
      />
    </form>
  );
}

/* ════════════════════════════════════════════
   PRODUCTS DROPDOWN (with live top-categories)
════════════════════════════════════════════ */
function ProductsDropdown({ isHome, isScrolled, onClose }) {
  const [cats, setCats] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axiosInstance
      .get("/e-commerce/products/top-categories")
      .then(({ data }) => { if (data.success) setCats(data.data); })
      .catch(() => { })
      .finally(() => setLoadingCats(false));
  }, []);

  const textClass = "text-gray-900";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-0 mt-2 w-72 rounded-xl shadow-xl border bg-white border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
          <Icon icon="mdi:fire" className="w-3.5 h-3.5 text-orange-500" />
          Top Categories
        </p>
      </div>

      {loadingCats ? (
        <div className="py-6 flex items-center justify-center gap-2 text-sm text-gray-400">
          <Icon icon="mdi:loading" className="animate-spin w-4 h-4" />
        </div>
      ) : (
        <div className="py-1">
          {cats.map((cat, i) => (
            <Link
              key={cat._id}
              href={`/product?categoryIds=${cat._id}`}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 hover:bg-gray-50 group ${textClass}`}
            >
              {/* Rank badge */}
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black flex items-center justify-center">
                {i + 1}
              </span>
              {/* Category icon / image */}
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-orange-50 overflow-hidden flex items-center justify-center transition-colors">
                {cat.icon ? (
                  <img src={cat.icon} alt={cat.title} className="w-full h-full object-cover" />
                ) : (
                  <Icon icon="mdi:tag" className="w-4 h-4 text-gray-500 group-hover:text-orange-500" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-gray-800 block truncate">{cat.title}</span>
                <span className="text-[10px] text-gray-400">
                  {cat.productCount} product{cat.productCount !== 1 ? "s" : ""}
                  {cat.avgRating > 0 && ` · ${cat.avgRating}★`}
                </span>
              </div>
              {/* <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-300 group-hover:text-orange-400 flex-shrink-0" /> */}
            </Link>
          ))}

          {/* View all products */}
          <div className="border-t border-gray-100 mt-1">
            <Link
              href="/product"
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-orange-500 hover:bg-orange-50 transition-colors"
            >
              <Icon icon="mdi:shopping" className="w-4 h-4" />
              Browse all products
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ════════════════════════════════════════════
   ANNOUNCEMENT BAR
════════════════════════════════════════════ */
function AnnouncementBar() {
  const t = useTranslations("Home.AnnouncementBar");

  return (
    <div className="bg-gray-50 border-b border-gray-100 py-1 text-[11px] font-medium text-gray-500">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center gap-2">
        <p className="hidden sm:block">
          {t.rich("message", {
            hours: (chunks) => (
              <span className="text-red-500 font-semibold">{chunks}</span>
            ),
          })}
        </p>
        <div className="flex items-center gap-4 ml-auto">
          <Link
            href="/auth/login"
            className="hover:text-orange-600 transition-colors"
          >
            {t("login")}
          </Link>
          <a
            href="tel:+234567890"
            className="hover:text-orange-600 transition-colors"
          >
            +234 567 890
          </a>
          <CustomTranslate />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MID HEADER
════════════════════════════════════════════ */
function MidHeader({ mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between gap-3 md:gap-5 py-2">
          {/* Hamburger (mobile) */}
          <button
            className="md:hidden flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-50 transition-colors"
            onClick={() => setMobileMenuOpen((p) => !p)}
            aria-label="Menu"
          >
            <Icon icon={mobileMenuOpen ? "mdi:close" : "mdi:menu"} className="w-5 h-5 text-gray-700" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="relative w-12 h-10 md:w-[90px] md:h-[38px]">
              <Image src="/assets/logo.png" alt="Click To Integrate" fill className="object-contain" />
            </div>
          </Link>

          {/* Search (desktop) */}
          <SearchBar className="hidden md:block flex-1 max-w-xl" />

          <div className="flex gap-2 md:gap-4 items-center">
            <ButtonSection />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-2">
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
  const { user } = useSelector((state) => state.auth) || {};
  const navLinks = [
    { label: "Home", href: "/", icon: "mdi:home-outline" },
    { label: "Buy Devices", href: "/coming", icon: "mdi:shopping-outline" },
    { label: "Academy", href: "/academy", icon: "mdi:school-outline" },
    { label: "Track Order", href: "/coming", icon: "mdi:map-marker-path" },
    { label: "Contact", href: "/contact", icon: "mdi:phone-outline" },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      <div className={`fixed top-0 left-0 h-full w-72 z-[100] bg-white shadow-2xl transform transition-transform duration-300 md:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-[15px] font-bold text-gray-800">Menu</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
            <Icon icon="mdi:close" className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <nav className="py-3 px-3">
          {navLinks.map((link, index) => (
            <Link
              key={`${link.href}-${index}`}
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
        {!user && (
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
        )}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   PROMO MARQUEE
════════════════════════════════════════════ */
function PromoMarquee() {
  const t = useTranslations("Home.PromoMarquee");
  const items = [
    { icon: "mdi:truck-fast-outline", text: t("shipping") },
    { icon: "mdi:shield-check-outline", text: t("warranty") },
    { icon: "mdi:certificate-outline", text: t("quality") },
    { icon: "mdi:headset", text: t("support") },
    { icon: "mdi:lock-outline", text: t("payments") },
  ];

  return (
    <div className="bg-orange-500 text-white py-1.5 overflow-hidden">
      <Marquee speed={50} pauseOnHover gradient={false}>
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 mx-6 text-[11px] font-semibold">
            <Icon icon={item.icon} className="w-3.5 h-3.5 opacity-90" />
            <span>{item.text}</span>
            <span className="ml-5 text-orange-200">✦</span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}

/* ════════════════════════════════════════════
   NAVIGATION BAR (not fixed — lives inside sticky header)
════════════════════════════════════════════ */
function NavigationBar({ isHome, isScrolled }) {
  const [openDropdown, setOpenDropdown] = useState(null);

  const mainNav = [
    { name: "Home", href: "/", hasDropdown: false },
    {
      name: "Services", href: "/mobile-repair", hasDropdown: true,
      dropdownItems: [
        { name: "Mobile Repair", href: "/mobile-repair" },
        { name: "Battery Replacement", href: "/mobile-repair" },
        { name: "Motherboard Repair", href: "/mobile-repair" },
        { name: "Screen Repair", href: "/mobile-repair" },
        { name: "Water Damage", href: "/mobile-repair" },
        { name: "Software Issues", href: "/mobile-repair" },
      ],
    },
    { name: "Products", href: "/product", hasDropdown: true, isProductsMenu: true },
    { name: "Experts / Top Repairmen", href: "/repairmans", hasDropdown: false },
    { name: "Academy", href: "/academy", hasDropdown: false },
    { name: "About", href: "/about-us", hasDropdown: false },
    {
      name: "Support", href: "/live-support", hasDropdown: true,
      dropdownItems: [
        { name: "Privacy Policy", href: "/privacy-policy" },
        { name: "Terms of Service", href: "/terms-of-service" },
        { name: "Environmental Policy", href: "/e-waste-policy" },
        { name: "How to return", href: "/how-to-return" },
        { name: "FAQ", href: "/faq" },
        { name: "Refund Policy", href: "/refund-policy" },
      ],
    },
    { name: "Blog", href: "/blog", hasDropdown: false },
  ];

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest(".nav-dropdown")) setOpenDropdown(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const onNav = isHome && !isScrolled;

  const linkCls = `flex items-center gap-1 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors duration-150 ${onNav ? "text-white hover:bg-white/15" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <div className={`w-full transition-colors duration-300 ${onNav
      ? "bg-[linear-gradient(87.19deg,rgba(247,151,87,0.92)_1.48%,#F64B00_92.88%)]"
      : "bg-white"
      }`}>
      <div className="max-w-7xl mx-auto px-6">
        <nav className="hidden lg:flex items-center justify-center gap-0.5 py-1">
          {mainNav.map((item) => (
            <div
              key={item.name}
              className="relative nav-dropdown"
              onMouseEnter={() => item.hasDropdown && setOpenDropdown(item.name)}
              onMouseLeave={() => item.hasDropdown && setOpenDropdown(null)}
            >
              <Link href={item.href} className={linkCls}>
                {item.name}
                {item.hasDropdown && (
                  <Icon
                    icon="mdi:chevron-down"
                    width={14}
                    className={`transition-transform duration-200 ${openDropdown === item.name ? "rotate-180" : ""}`}
                  />
                )}
              </Link>

              <AnimatePresence>
                {item.hasDropdown && openDropdown === item.name && (
                  item.isProductsMenu ? (
                    <ProductsDropdown
                      key="products-dd"
                      isHome={isHome}
                      isScrolled={isScrolled}
                      onClose={() => setOpenDropdown(null)}
                    />
                  ) : (
                    <motion.div
                      key="generic-dd"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50"
                    >
                      {item.dropdownItems?.map((di) => (
                        <Link
                          key={di.name}
                          href={di.href}
                          onClick={() => setOpenDropdown(null)}
                          className="block px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          {di.name}
                        </Link>
                      ))}
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

/* re-export so any existing import of NavigationHeader still works */
export function NavigationHeader() { return null; }

/* ════════════════════════════════════════════
   MAIN HEADER EXPORT
════════════════════════════════════════════ */
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAnyScrolled, setIsAnyScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const isHome = pathname === "/" || pathname === `/${locale}` || pathname === "";

  useEffect(() => {
    const checkScroll = () => {
      const y = window.scrollY;
      setIsAnyScrolled(y > 50);
      setIsScrolled(y > window.innerHeight * 0.65);
    };
    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const showMarquee = isHome && !isAnyScrolled;

  return (
    <>
      {/* One sticky block — all rows stick together */}
      <header className="sticky top-0 z-30 shadow-sm">
        <AnnouncementBar />
        <MidHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${showMarquee ? "max-h-12 opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <PromoMarquee />
        </div>
        <NavigationBar isHome={isHome} isScrolled={isScrolled} />
      </header>
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
