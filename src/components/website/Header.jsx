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
import { formatCurrency } from "@/helper/currencyFormatter";

/* ════════════════════════════════════════════
   SHARED CONTAINER — single source of truth for
   left/right alignment across every header row
════════════════════════════════════════════ */
function Container({ children, className = "" }) {
  return (
    <div className={`max-w-7xl mx-auto px-6 ${className}`}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════
   SEARCH SUGGESTIONS DROPDOWN
════════════════════════════════════════════ */
function SearchSuggestions({ query, data, loading, onSelect, visible }) {
  if (!visible) return null;

  const productsList = data?.products || [];
  const categoriesList = data?.categories || [];
  const brandsList = data?.brands || [];
  const sellersList = data?.sellers || [];

  const hasResults =
    productsList.length > 0 ||
    categoriesList.length > 0 ||
    brandsList.length > 0 ||
    sellersList.length > 0;

  // Safe highlight helper that handles spaces and special regex characters without throwing
  const highlight = (text) => {
    if (!text || !query?.trim()) return text;
    try {
      const cleanQ = query.trim().replace(/\s+/g, " ");
      const escaped = cleanQ.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escaped})`, "gi");
      const parts = String(text).split(regex);
      return parts.map((part, i) =>
        part.toLowerCase() === cleanQ.toLowerCase() ? (
          <mark key={i} className="bg-orange-100 text-orange-600 rounded px-0.5 not-italic font-semibold">
            {part}
          </mark>
        ) : part
      );
    } catch {
      return text;
    }
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1.5 z-[200] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
          <Icon icon="mdi:loading" className="animate-spin w-4 h-4 text-primary-600" />
          <span>Searching products & brands…</span>
        </div>
      )}

      {/* No query — show hint */}
      {!loading && !query.trim() && (
        <div className="px-4 py-4 text-sm text-gray-400 text-center">
          Start typing to search store products, refurbished devices, brands…
        </div>
      )}

      {/* Has results */}
      {!loading && query.trim() && hasResults && (
        <div className="py-2 max-h-[460px] overflow-y-auto divide-y divide-gray-50">

          {/* Products (E-Commerce + Refurbished) */}
          {productsList.length > 0 && (
            <div className="pb-1">
              <div className="px-4 pt-3 pb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Products ({productsList.length})
                </span>
                <span className="text-[10px] text-gray-400">Store & Refurbished</span>
              </div>
              {productsList.map((item) => (
                <button
                  key={`${item.type || 'p'}-${item._id}`}
                  onMouseDown={() => onSelect(item)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group text-left cursor-pointer"
                >
                  <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 p-0.5">
                    <img
                      src={item.image || 'https://placehold.co/100x100/f3f4f6/9ca3af?text=No+Image'}
                      alt={item.title}
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/f3f4f6/9ca3af?text=No+Image'; }}
                    />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-medium text-gray-800 leading-tight block truncate">
                        {highlight(item.title)}
                      </span>
                      {item.isRefurbished ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                          Refurbished
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
                          Store
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                      {item.brand && <span>{item.brand}</span>}
                      {item.brand && item.category && <span>•</span>}
                      {item.category && <span>{item.category}</span>}
                      {item.modelNumber && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-gray-500">{item.modelNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {item.minPrice > 0 && (
                    <span className="text-[12px] font-bold text-primary-600 flex-shrink-0">
                      {formatCurrency(item.minPrice)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Brands (E-Commerce + Refurbished) */}
          {brandsList.length > 0 && (
            <div className="pb-1">
              <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Brands
              </p>
              {brandsList.map((item) => (
                <button
                  key={`${item.type || 'b'}-${item._id}`}
                  onMouseDown={() => onSelect(item)}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors group text-left cursor-pointer"
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center p-1 border border-gray-100">
                    {item.icon ? (
                      <img src={item.icon} alt={item.title} className="w-full h-full object-contain" />
                    ) : (
                      <Icon icon="mdi:tag-outline" className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </span>
                  <span className="text-[13px] font-medium text-gray-800 truncate flex-1">
                    {highlight(item.title)}
                  </span>
                  {item.isRefurbished && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                      Refurbished Brand
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Categories */}
          {categoriesList.length > 0 && (
            <div className="pb-1">
              <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Categories
              </p>
              {categoriesList.map((item) => (
                <button
                  key={`${item.type || 'c'}-${item._id}`}
                  onMouseDown={() => onSelect(item)}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors group text-left cursor-pointer"
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-purple-50 overflow-hidden flex items-center justify-center p-1 border border-purple-100">
                    {item.icon ? (
                      <img src={item.icon} alt={item.title} className="w-full h-full object-contain" />
                    ) : (
                      <Icon icon="mdi:tag" className="w-3.5 h-3.5 text-purple-500" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium text-gray-800 block truncate">
                      {highlight(item.title)}
                    </span>
                  </div>
                  {item.isRefurbished && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                      Refurbished
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Sellers / Stores */}
          {sellersList.length > 0 && (
            <div className="pb-1">
              <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Stores
              </p>
              {sellersList.map((item) => (
                <button
                  key={item._id}
                  onMouseDown={() => onSelect({ ...item, type: "seller" })}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors group text-left cursor-pointer"
                >
                  {item.logo ? (
                    <img src={item.logo} alt={item.businessName} className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center font-bold text-orange-500 text-xs">
                      {item.businessName?.charAt(0).toUpperCase()}
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
          <p className="text-[13px] text-gray-500 font-medium">
            No products found for <strong className="text-gray-800">"{query.trim()}"</strong>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Try checking spelling or searching for a brand like Apple, Samsung, Canon, Lenovo…
          </p>
        </div>
      )}

      {/* Footer — view all */}
      {!loading && query.trim() && hasResults && (
        <div className="border-t border-gray-100 px-4 py-2.5">
          <button
            onMouseDown={() => onSelect({ type: "all", value: query.trim() })}
            className="text-[12px] font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 cursor-pointer"
          >
            <Icon icon="mdi:magnify" className="w-4 h-4" />
            See all results for "{query.trim()}"
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
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const cleanQ = (debouncedQuery || "").trim().replace(/\s+/g, " ");
    if (!cleanQ) {
      setResults(EMPTY_RESULTS);
      return;
    }
    let cancelled = false;
    setLoading(true);
    axiosInstance
      .get(`/e-commerce/search?q=${encodeURIComponent(cleanQ)}`)
      .then(({ data }) => {
        if (!cancelled && data.success) setResults(data.data || EMPTY_RESULTS);
      })
      .catch(() => { })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const handleSelect = useCallback((item) => {
    if (!item) return;
    const value = item.title || item.businessName || item.value || "";
    setQuery(value);
    setFocused(false);
    inputRef.current?.blur();

    if (item.url) {
      router.push(item.url);
    } else if (item.isRefurbished || item.type === "refurbished") {
      router.push(`/refurbish/${item.slug}`);
    } else if (item.type === "refurbishedBrand") {
      router.push(`/top-selling-brands/${item.slug}`);
    } else if (item.type === "refurbishedCategory") {
      router.push(`/refurbish?category=${item.slug}`);
    } else if (item.type === "product" && item.slug) {
      router.push(`/product/${item.slug}`);
    } else if (item.type === "category" && (item.id || item._id)) {
      router.push(`/product?categoryIds=${item.id || item._id}`);
    } else if (item.type === "brand" && (item.id || item._id)) {
      router.push(`/product?brandIds=${item.id || item._id}`);
    } else if (item.type === "seller" && (item.id || item._id)) {
      router.push(`/store/${item.id || item._id}`);
    } else {
      router.push(`/product?q=${encodeURIComponent(value.trim())}`);
    }
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = query.trim();
    if (clean) handleSelect({ type: "all", value: clean });
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className={`flex items-center bg-white border rounded-lg px-3 py-1.5 transition-all duration-200 ${focused ? "border-primary-500 shadow-sm shadow-primary-500/10" : "border-gray-200 hover:border-gray-300"
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
          onBlur={() => setTimeout(() => setFocused(false), 200)}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setResults(EMPTY_RESULTS); }}
            className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
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
      <p className="text-[11px] font-black uppercase tracking-widest text-gray-900 flex items-center gap-1.5">
        Top Categories
      </p>

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
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-gray-800 block truncate">{cat.title}</span>
              </div>
            </Link>
          ))}
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
      <Container className="flex justify-between items-center gap-2">
        <p className="hidden sm:block truncate min-w-0">
          {t.rich("message", {
            hours: (chunks) => (
              <span className="text-red-500 font-semibold whitespace-nowrap">{chunks}</span>
            ),
          })}
        </p>
        <div className="flex items-center gap-3 sm:gap-4 ml-auto shrink-0">
          <Link
            href="/auth/login"
            className="hover:text-orange-600 transition-colors whitespace-nowrap"
          >
            {t("login")}
          </Link>
          <a
            href="tel:+234567890"
            className="hover:text-orange-600 transition-colors hidden md:inline whitespace-nowrap"
          >
            +234 567 890
          </a>
          <CustomTranslate />
        </div>
      </Container>
    </div>
  );
}

/* ════════════════════════════════════════════
   MID HEADER
════════════════════════════════════════════ */
function MidHeader({ mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <div className="bg-white border-b border-gray-100">
      <Container>
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
            <div className="relative w-12 h-10 -ml-3 md:w-[95px] md:h-[38px]">
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
      </Container>
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
    { label: "Insurance", href: "/insurance", icon: "mdi:shield-check-outline" },
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
  const [productCategories, setProductCategories] = useState([]);
  const [loadingProductCategories, setLoadingProductCategories] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredL1, setHoveredL1] = useState(null);
  const [hoveredL2, setHoveredL2] = useState(null);
  const [topBrands, setTopBrands] = useState([]);
  const [sellGadgetsData, setSellGadgetsData] = useState([]);
  const [buyRefurbishedData, setBuyRefurbishedData] = useState([]);

  useEffect(() => {
    setLoadingProductCategories(true);

    Promise.all([
      axiosInstance.get("/e-commerce/products/top-categories"),
      axiosInstance.get('/public/sell-device/header-data')
    ])
      .then(([categoriesResponse, headerResponse]) => {
        if (categoriesResponse.data.success) {
          setProductCategories(categoriesResponse.data.data || []);
        } else {
          setProductCategories([]);
        }

        if (headerResponse.data.success) {
          const { mobileBrands, sellGadgets, buyRefurbished } = headerResponse.data.data;
          setTopBrands(mobileBrands || []);
          setSellGadgetsData(sellGadgets || []);
          setBuyRefurbishedData(buyRefurbished || []);
        } else {
          setTopBrands([]);
          setSellGadgetsData([]);
          setBuyRefurbishedData([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setProductCategories([]);
        setTopBrands([]);
        setSellGadgetsData([]);
        setBuyRefurbishedData([]);
      })
      .finally(() => setLoadingProductCategories(false));
  }, []);

  const SERVICES = [
    { name: "Mobile Repair", href: "/mobile-repair" },
    { name: "Battery Replacement", href: "/mobile-repair" },
    { name: "Motherboard Repair", href: "/mobile-repair" },
    { name: "Screen Repair", href: "/mobile-repair" },
    { name: "Water Damage", href: "/mobile-repair" },
    { name: "Software Issues", href: "/mobile-repair" },
  ];

  const SELL_PHONE = topBrands.length > 0 ? [
    { sectionTitle: "Top Brands", href: "/sell-devices/phone" },
    ...topBrands.map(b => ({ name: b.name, href: `/sell-devices/phone/brands/${b.slug}` }))
  ] : [];

  const SELL_GADGETS = sellGadgetsData.map(cat => ({
    name: cat.name,
    href: `/sell-devices/${cat.slug}`,
    brands: (cat.brands || []).map(b => ({
      name: b.name,
      href: `/sell-devices/${cat.slug}/brands/${b.slug}`
    }))
  }));

  const REFURBISHED = buyRefurbishedData.map(cat => ({
    name: cat.name,
    href: `/refurbish?category=${cat.slug}`,
    brands: (cat.brands || []).map(b => ({
      name: b.name,
      href: `/refurbish?category=${cat.slug}&brand=${b.slug}`
    }))
  }));

  const SUPPORT = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Environmental Policy", href: "/e-waste-policy" },
    { name: "How to return", href: "/how-to-return" },
    { name: "FAQ", href: "/faq" },
    { name: "Refund Policy", href: "/refund-policy" },
  ];

  const mainNav = [
    {
      name: "All", href: "/", hasDropdown: true,
      dropdownItems: [
        // sell phones
        { name: "Sell Phone", href: "/sell-devices/phone", hasDropdown: true, dropdownItems: SELL_PHONE },
        // sell gadgets
        { name: "Sell Gadgets", href: "/sell-devices", hasDropdown: true, dropdownItems: SELL_GADGETS },
        // buy refurbished devices
        { name: "Buy Refurbished Devices", href: "/refurbish", hasDropdown: true, dropdownItems: REFURBISHED },
        // Services
        { name: "insurance", href: "/insurance", hasDropdown: false },
        { name: "Services", href: "/mobile-repair", hasDropdown: true, dropdownItems: SERVICES },
      ],
    },
    {
      name: "Services",
      href: "/mobile-repair",
      hasDropdown: true,
      dropdownItems: SERVICES,
    },
    {
      name: "Sell Phone",
      href: "/sell-devices/phone",
      hasDropdown: true,
      dropdownItems: SELL_PHONE,
      isLoading: loadingProductCategories,
    },
    {
      name: "Buy Refurbished",
      href: "/buy-refurbish-gadgets",
      hasDropdown: true,
      dropdownItems: REFURBISHED,
      isNested: true,
      isLoading: loadingProductCategories,
    },
    {
      name: "Sell Gadgets",
      href: "/sell-devices",
      hasDropdown: true,
      dropdownItems: SELL_GADGETS,
      isNested: true,
      isLoading: loadingProductCategories,
    },
    {
      name: "Products",
      href: "/product",
      hasDropdown: true,
      isLoading: loadingProductCategories,
      dropdownItems: productCategories.length > 0 ? [
        {
          sectionTitle: "Top Categories",
          href: "/product",
        },
        ...productCategories.map((category) => ({
          name: category.title,
          href: `/product?categoryIds=${category._id}`,
        })),
      ] : [],
    },
    {
      name: "Top Repairmen",
      href: "/repairmans",
      hasDropdown: false,
    },

    {
      name: "Academy/Docs", href: "/academy", hasDropdown: true,
      dropdownItems: [
        // sell phones
        { name: "Academy Listing", href: "/academy/academy-listing", hasDropdown: true, dropdownItems: SELL_GADGETS },

        { name: "Documentation", href: "/docs", hasDropdown: true, dropdownItems: SELL_GADGETS },
        { name: "Seller Info", href: "/academy/seller-info-center", hasDropdown: true, dropdownItems: SELL_PHONE },
      ],
    },
    // {
    //   name: "Insurance",
    //   href: "/insurance",
    //   hasDropdown: false,
    // },
    {
      name: "About",
      href: "/about-us",
      hasDropdown: false,
    },

    {
      name: "Support",
      href: "/live-support",
      hasDropdown: true,
      dropdownItems: SUPPORT,
    },
    {
      name: "Blog",
      href: "/blog",
      hasDropdown: false,
    },
  ];

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest(".nav-dropdown")) {
        setOpenDropdown(null);
        setHoveredCategory(null);
        setHoveredL1(null);
        setHoveredL2(null);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const onNav = isHome && !isScrolled;

  const linkCls = `flex items-center gap-0.5 px-1.5 xl:px-2.5 2xl:px-3 py-1 rounded-md text-[11px] xl:text-[12.5px] 2xl:text-[13px] font-medium transition-colors duration-150 whitespace-nowrap ${onNav ? "text-white hover:bg-white/15" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    }`;

  const renderDropdownContent = (item) => {
    if (item.isLoading) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          className={`absolute top-full ${item.name === "Support" ? "right-0" : "left-0"} mt-1 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-gray-100 py-4 px-4 z-50`}
        >
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          </div>
        </motion.div>
      );
    }

    if (item.dropdownItems.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          className={`absolute top-full ${item.name === "Support" ? "right-0" : "left-0"} mt-1 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-gray-100 py-4 px-4 z-50`}
        >
          <p className="text-sm text-gray-500 text-center">No data available</p>
        </motion.div>
      );
    }

    if (item.name === "All") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 nav-dropdown-menu"
          style={{ minWidth: "250px" }}
        >
          {item.dropdownItems.map((l1Item, idx) => {
            const hasL2 = l1Item.dropdownItems && l1Item.dropdownItems.length > 0;
            const isExpanded = hoveredL1 === l1Item.name;

            return (
              <div
                key={idx}
                className="relative"
                onMouseEnter={() => {
                  setHoveredL1(l1Item.name);
                  setHoveredL2(null);
                }}
              >
                <div className="flex items-center justify-between px-4 py-2.5 hover:bg-orange-50 cursor-pointer transition-colors duration-150 group/l1">
                  <Link
                    href={l1Item.href}
                    onClick={() => {
                      setOpenDropdown(null);
                      setHoveredL1(null);
                      setHoveredL2(null);
                    }}
                    className="text-[13px] font-semibold text-gray-700 group-hover/l1:text-orange-600 transition-colors flex-1"
                  >
                    {l1Item.name}
                  </Link>
                  {hasL2 && (
                    <Icon
                      icon="mdi:chevron-right"
                      width={16}
                      className="text-gray-400 group-hover/l1:text-orange-500 transition-all duration-150 ml-2 group-hover/l1:translate-x-0.5"
                    />
                  )}
                </div>

                {/* LEVEL 2 (FLYOUT TO THE RIGHT) */}
                {isExpanded && hasL2 && (
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-full top-0 ml-1 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                    style={{ minWidth: "240px" }}
                  >
                    {l1Item.dropdownItems.map((l2Item, l2Idx) => {
                      const isSection = !!l2Item.sectionTitle;
                      const hasL3 = l2Item.brands && l2Item.brands.length > 0;

                      if (isSection) {
                        return (
                          <Link
                            key={l2Idx}
                            href={l2Item.href}
                            onClick={() => {
                              setOpenDropdown(null);
                              setHoveredL1(null);
                              setHoveredL2(null);
                            }}
                            className="block px-4 py-2 text-[13px] font-bold text-gray-900 border-b border-gray-100 pb-1.5 mb-1.5 hover:text-orange-600 transition-colors"
                          >
                            {l2Item.sectionTitle}
                          </Link>
                        );
                      }

                      return (
                        <div
                          key={l2Idx}
                          className="relative"
                          onMouseEnter={() => {
                            if (hasL3) setHoveredL2(l2Item.name);
                            else setHoveredL2(null);
                          }}
                        >
                          <div className="flex items-center justify-between px-4 py-2 hover:bg-orange-50 cursor-pointer transition-colors duration-150 group/l2">
                            <Link
                              href={l2Item.href}
                              onClick={() => {
                                setOpenDropdown(null);
                                setHoveredL1(null);
                                setHoveredL2(null);
                              }}
                              className="text-[13px] font-medium text-gray-700 group-hover/l2:text-orange-600 transition-colors flex-1"
                            >
                              {l2Item.name}
                            </Link>
                            {hasL3 && (
                              <Icon
                                icon="mdi:chevron-right"
                                width={16}
                                className="text-gray-400 group-hover/l2:translate-x-0.5 group-hover/l2:text-orange-500 transition-all duration-150 ml-2"
                              />
                            )}
                          </div>

                          {/* LEVEL 3 (FLYOUT FOR L2 BRAND LINKS WHERE APPLICABLE) */}
                          {hoveredL2 === l2Item.name && hasL3 && (
                            <motion.div
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -5 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-full top-0 ml-1 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                              style={{ minWidth: "200px" }}
                            >
                              {l2Item.brands.map((brand, brandIdx) => (
                                <Link
                                  key={brandIdx}
                                  href={brand.href}
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    setHoveredL1(null);
                                    setHoveredL2(null);
                                  }}
                                  className="block px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                >
                                  {brand.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}
        </motion.div>
      );
    }

    if (item.isNested) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
          style={{ minWidth: "240px" }}
        >
          {item.dropdownItems.map((category, idx) => (
            <div
              key={idx}
              className="relative group"
              onMouseEnter={() => setHoveredCategory(category.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="flex items-center justify-between px-4 py-2 hover:bg-orange-50 cursor-pointer">
                <Link
                  href={category.href}
                  onClick={() => {
                    setOpenDropdown(null);
                    setHoveredCategory(null);
                  }}
                  className="text-[13px] font-medium text-gray-700 hover:text-orange-600 transition-colors flex-1"
                >
                  {category.name}
                </Link>
                <Icon
                  icon="mdi:chevron-right"
                  width={16}
                  className="text-gray-400 ml-2"
                />
              </div>

              {hoveredCategory === category.name && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-full top-0 ml-1 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                  style={{ minWidth: "200px" }}
                >
                  {category.brands && category.brands.length > 0 ? (
                    category.brands.map((brand, brandIdx) => (
                      <Link
                        key={brandIdx}
                        href={brand.href}
                        onClick={() => {
                          setOpenDropdown(null);
                          setHoveredCategory(null);
                        }}
                        className="block px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        {brand.name}
                      </Link>
                    ))
                  ) : (
                    <p className="text-[13px] text-gray-500 text-center px-4 py-3">No brands available</p>
                  )}
                </motion.div>
              )}
            </div>
          ))}
        </motion.div>
      );
    }

    const hasSections = item.dropdownItems?.some((di) => di.sectionTitle);
    if (hasSections) {
      const groups = [];
      let currentGroup = null;
      item.dropdownItems.forEach((di) => {
        if (di.sectionTitle) {
          currentGroup = { title: di.sectionTitle, href: di.href, items: [] };
          groups.push(currentGroup);
        } else if (currentGroup) {
          currentGroup.items.push(di);
        } else {
          if (!groups.length) groups.push({ items: [] });
          groups[0].items.push(di);
        }
      });

      return (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-50 flex gap-8"
        >
          {groups.map((g, i) => (
            <div key={i} className="min-w-[140px]">
              {g.title && (
                <Link
                  href={g.href || "#"}
                  onClick={() => setOpenDropdown(null)}
                  className="block mb-3 text-sm font-bold text-gray-900 text-nowrap hover:text-orange-600 transition-colors"
                >
                  {g.title}
                </Link>
              )}
              <div className="space-y-1.5">
                {g.items.map((di, j) => (
                  <Link
                    key={j}
                    href={di.href}
                    onClick={() => setOpenDropdown(null)}
                    className="block py-1 text-[13px] font-medium text-gray-500 hover:text-orange-600 transition-colors"
                  >
                    {di.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.15 }}
        className={`absolute top-full ${item.name === "Support" ? "right-0" : "left-0"} mt-1 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50`}
      >
        {item.dropdownItems?.map((di, idx) => (
          <Link
            key={idx}
            href={di.href}
            onClick={() => setOpenDropdown(null)}
            className="block px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
          >
            {di.name}
          </Link>
        ))}
      </motion.div>
    );
  };

  return (
    <div className={`w-full transition-colors duration-300 ${onNav
      ? "bg-[linear-gradient(87.19deg,rgba(247,151,87,0.92)_1.48%,#F64B00_92.88%)]"
      : "bg-white"
      }`}>
      <Container>
        <nav className="hidden lg:flex items-center -ml-3 justify-between gap-0.5 py-1">
          {mainNav.map((item) => (
            <div
              key={item.name}
              className="relative nav-dropdown"
              onMouseEnter={() => {
                if (item.hasDropdown) {
                  setOpenDropdown(item.name);
                  if (item.name === "All") {
                    setHoveredL1(null);
                    setHoveredL2(null);
                  }
                }
              }}
              onMouseLeave={() => {
                if (item.hasDropdown) {
                  setOpenDropdown(null);
                  setHoveredCategory(null);
                  setHoveredL1(null);
                  setHoveredL2(null);
                }
              }}
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
                {item.hasDropdown && openDropdown === item.name && renderDropdownContent(item)}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </Container>
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