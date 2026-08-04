'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { useRouter } from '@/i18n/navigation';

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Price: Low → High', value: 'price-asc' },
  { label: 'Price: High → Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
];

const STATIC_CONDITIONS = ['Superb', 'Good', 'Fair'];
const STATIC_RAMS = ['4 GB', '6 GB', '8 GB', '12 GB', '16 GB'];
const STATIC_STORAGES = ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'];

export default function RefurbishListingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter States
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(150000);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedRams, setSelectedRams] = useState([]);
  const [selectedStorages, setSelectedStorages] = useState([]);

  // UI States
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    price: true,
    condition: true,
    ram: true,
    storage: true
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sort, setSort] = useState('default');

  // Fetch static data (categories, brands) on mount
  useEffect(() => {
    (async () => {
      try {
        const catRes = await axiosInstance.get('/public/sell-device/refurbished/categories');
        if (catRes.data?.success) {
          setCategories(catRes.data.data);
        }
        const brandRes = await axiosInstance.get('/public/sell-device/brands');
        if (brandRes.data?.success) {
          setBrands(brandRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load filter options', err);
      }
    })();
  }, []);

  // Sync category from URL if it changes
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory !== null) {
      setSelectedCategory(urlCategory);
    }
  }, [searchParams]);

  // Fetch matching filtered products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', PAGE_SIZE);
      params.append('sort', sort);

      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedBrands.length > 0) params.append('brand', selectedBrands.join(','));
      if (priceMin > 0) params.append('minPrice', priceMin);
      if (priceMax < 150000) params.append('maxPrice', priceMax);
      if (selectedConditions.length > 0) params.append('condition', selectedConditions.join(','));
      if (selectedRams.length > 0) params.append('ram', selectedRams.join(','));
      if (selectedStorages.length > 0) params.append('storage', selectedStorages.join(','));

      const res = await axiosInstance.get(`/public/sell-device/refurbished/products?${params.toString()}`);
      if (res.data?.success) {
        setProducts(res.data.data);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalCount(res.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch refurbished products:', err);
    } finally {
      setLoading(false);
    }
  }, [page, sort, selectedCategory, selectedBrands, priceMin, priceMax, selectedConditions, selectedRams, selectedStorages]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Collapsible toggle helper
  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Toggle brand selection
  const toggleBrand = (slug) => {
    setSelectedBrands(prev => 
      prev.includes(slug) ? prev.filter(b => b !== slug) : [...prev, slug]
    );
    setPage(1);
  };

  // Toggle condition selection
  const toggleCondition = (val) => {
    setSelectedConditions(prev =>
      prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]
    );
    setPage(1);
  };

  // Toggle RAM selection
  const toggleRam = (val) => {
    setSelectedRams(prev =>
      prev.includes(val) ? prev.filter(r => r !== val) : [...prev, val]
    );
    setPage(1);
  };

  // Toggle Storage selection
  const toggleStorage = (val) => {
    setSelectedStorages(prev =>
      prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
    );
    setPage(1);
  };

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    setPage(1);
    // Sync URL parameter silently
    const url = new URL(window.location.href);
    if (slug) {
      url.searchParams.set('category', slug);
    } else {
      url.searchParams.delete('category');
    }
    router.push(url.pathname + url.search);
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedBrands([]);
    setPriceMin(0);
    setPriceMax(150000);
    setSelectedConditions([]);
    setSelectedRams([]);
    setSelectedStorages([]);
    setPage(1);
    router.push('/refurbish');
  };

  const formatPrice = (num) => `₹${Math.round(num).toLocaleString('en-IN')}`;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 min-h-screen bg-gray-50/50">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-500">Home</Link>
        <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5" />
        <Link href="/buy-refurbish-gadgets" className="hover:text-primary-500">Refurbished</Link>
        <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">All Refurbished Gadgets</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR FILTER PANEL */}
        <aside className="w-full lg:w-72 flex-shrink-0 bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-6 h-fit sticky top-24">
          
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Icon icon="mi:filter" className="w-4 h-4 text-primary-500" /> Filters
            </span>
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>

          {/* 1. Category / Product Type Filter */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('category')}
              className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span>Product Type</span>
              <Icon icon={openSections.category ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="w-4 h-4 text-gray-400" />
            </button>
            {openSections.category && (
              <div className="pt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                <div
                  onClick={() => handleCategoryChange('')}
                  className="flex items-center gap-2 cursor-pointer group text-sm"
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${!selectedCategory ? 'bg-primary-500 border-primary-500' : 'border-gray-350'}`}>
                    {!selectedCategory && <Icon icon="mdi:check" className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className={`text-[13px] ${!selectedCategory ? 'text-primary-700 font-semibold' : 'text-gray-700'}`}>
                    All Categories
                  </span>
                </div>
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className="flex items-center gap-2 cursor-pointer group text-sm"
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${selectedCategory === cat.slug ? 'bg-primary-500 border-primary-500' : 'border-gray-350'}`}>
                      {selectedCategory === cat.slug && <Icon icon="mdi:check" className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className={`text-[13px] ${selectedCategory === cat.slug ? 'text-primary-700 font-semibold' : 'text-gray-700'}`}>
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Brand Filter */}
          <div className="space-y-2 border-t border-gray-150 pt-4">
            <button
              onClick={() => toggleSection('brand')}
              className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span>Brand</span>
              <Icon icon={openSections.brand ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="w-4 h-4 text-gray-400" />
            </button>
            {openSections.brand && (
              <div className="pt-2 space-y-2 max-h-52 overflow-y-auto pr-1">
                {brands.map((b) => (
                  <div
                    key={b._id}
                    onClick={() => toggleBrand(b.slug)}
                    className="flex items-center gap-2 cursor-pointer group text-sm"
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${selectedBrands.includes(b.slug) ? 'bg-primary-500 border-primary-500' : 'border-gray-355'}`}>
                      {selectedBrands.includes(b.slug) && <Icon icon="mdi:check" className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className={`text-[13px] ${selectedBrands.includes(b.slug) ? 'text-primary-700 font-semibold' : 'text-gray-700'}`}>
                      {b.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Price Filter */}
          <div className="space-y-2 border-t border-gray-150 pt-4">
            <button
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span>Price Range</span>
              <Icon icon={openSections.price ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="w-4 h-4 text-gray-400" />
            </button>
            {openSections.price && (
              <div className="pt-3 space-y-4">
                <input
                  type="range"
                  min="0"
                  max="150000"
                  step="2000"
                  value={priceMax}
                  onChange={(e) => { setPriceMax(parseInt(e.target.value)); setPage(1); }}
                  className="w-full accent-primary-500 cursor-pointer h-1.5 bg-gray-205 rounded-lg appearance-none"
                />
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-450 font-semibold uppercase">Min</span>
                    <div className="relative mt-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-450 text-xs">₹</span>
                      <input
                        type="number"
                        value={priceMin}
                        onChange={(e) => { setPriceMin(Number(e.target.value)); setPage(1); }}
                        className="w-full pl-6 pr-2 py-1 bg-gray-50 border border-gray-205 rounded text-xs text-gray-800 focus:outline-none focus:border-primary-400"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-450 font-semibold uppercase">Max</span>
                    <div className="relative mt-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-450 text-xs">₹</span>
                      <input
                        type="number"
                        value={priceMax}
                        onChange={(e) => { setPriceMax(Number(e.target.value)); setPage(1); }}
                        className="w-full pl-6 pr-2 py-1 bg-gray-50 border border-gray-205 rounded text-xs text-gray-800 focus:outline-none focus:border-primary-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Condition Filter */}
          <div className="space-y-2 border-t border-gray-150 pt-4">
            <button
              onClick={() => toggleSection('condition')}
              className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span>Condition</span>
              <Icon icon={openSections.condition ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="w-4 h-4 text-gray-400" />
            </button>
            {openSections.condition && (
              <div className="pt-2 space-y-2">
                {STATIC_CONDITIONS.map((cond) => (
                  <div
                    key={cond}
                    onClick={() => toggleCondition(cond)}
                    className="flex items-center gap-2 cursor-pointer group text-sm"
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${selectedConditions.includes(cond) ? 'bg-primary-500 border-primary-500' : 'border-gray-350'}`}>
                      {selectedConditions.includes(cond) && <Icon icon="mdi:check" className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className={`text-[13px] ${selectedConditions.includes(cond) ? 'text-primary-700 font-semibold' : 'text-gray-700'}`}>
                      {cond}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. RAM Filter */}
          <div className="space-y-2 border-t border-gray-150 pt-4">
            <button
              onClick={() => toggleSection('ram')}
              className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span>RAM</span>
              <Icon icon={openSections.ram ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="w-4 h-4 text-gray-400" />
            </button>
            {openSections.ram && (
              <div className="pt-2 space-y-2">
                {STATIC_RAMS.map((ramOpt) => (
                  <div
                    key={ramOpt}
                    onClick={() => toggleRam(ramOpt)}
                    className="flex items-center gap-2 cursor-pointer group text-sm"
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${selectedRams.includes(ramOpt) ? 'bg-primary-500 border-primary-500' : 'border-gray-350'}`}>
                      {selectedRams.includes(ramOpt) && <Icon icon="mdi:check" className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className={`text-[13px] ${selectedRams.includes(ramOpt) ? 'text-primary-700 font-semibold' : 'text-gray-700'}`}>
                      {ramOpt}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. Storage Filter */}
          <div className="space-y-2 border-t border-gray-150 pt-4">
            <button
              onClick={() => toggleSection('storage')}
              className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span>Storage</span>
              <Icon icon={openSections.storage ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="w-4 h-4 text-gray-400" />
            </button>
            {openSections.storage && (
              <div className="pt-2 space-y-2">
                {STATIC_STORAGES.map((st) => (
                  <div
                    key={st}
                    onClick={() => toggleStorage(st)}
                    className="flex items-center gap-2 cursor-pointer group text-sm"
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${selectedStorages.includes(st) ? 'bg-primary-500 border-primary-500' : 'border-gray-350'}`}>
                      {selectedStorages.includes(st) && <Icon icon="mdi:check" className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className={`text-[13px] ${selectedStorages.includes(st) ? 'text-primary-700 font-semibold' : 'text-gray-700'}`}>
                      {st}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </aside>

        {/* PRODUCTS GRID / ROWS LIST */}
        <main className="flex-1 space-y-6">
          
          {/* Header & Sorter */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {selectedCategory ? `${categories.find(c => c.slug === selectedCategory)?.name || 'Refurbished'} Gadgets` : 'All Refurbished Gadgets'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Showing {totalCount} matching results</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">Sort By:</span>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="bg-gray-50 border border-gray-200 text-xs rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:border-primary-400 cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Cards Container */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-xl p-5 flex flex-col md:flex-row gap-6 h-fit md:h-[200px]">
                  <div className="w-full md:w-40 h-36 bg-gray-200 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
              <Icon icon="fluent:box-search-16-regular" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base font-bold text-gray-900">No Refurbished Products Found</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">We couldn't find any products matching your selected filters. Try broadening your filter selections or clearing filters.</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 bg-primary-500 hover:bg-primary-600 text-black text-xs font-semibold px-5 py-2 rounded-lg transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((p) => {
                const defaultVar = p.variants?.find(v => v.isDefault) || p.variants?.[0];
                const imageSrc = defaultVar?.images?.[0]?.url || p.images?.[0]?.url || '/assets/placeholder.jpg';
                const price = defaultVar ? (defaultVar.discountPrice || defaultVar.sellingPrice || 0) : 0;
                const mrp = defaultVar ? (defaultVar.sellingPrice || 0) : 0;
                const discount = defaultVar?.discountPercentage || 0;
                const goldPrice = price ? Math.round(price * 0.97) : null;
                const monthlyEmi = price ? Math.round(price / 24) : null;
                const stock = defaultVar?.stock || 0;

                // Extract tags from attributes (e.g. Type, Specs)
                const specs = defaultVar?.attributes?.map(a => a.value).slice(0, 3) || [];

                return (
                  <div
                    key={p._id}
                    className="bg-white border border-gray-100 hover:border-primary-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-6 group relative overflow-hidden"
                  >
                    {/* Left: Product Image */}
                    <div className="relative w-full sm:w-36 h-36 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <Image
                        src={imageSrc}
                        alt={p.title}
                        width={128}
                        height={128}
                        className="object-contain p-2 max-h-32 group-hover:scale-105 transition-transform duration-300"
                      />
                      {stock > 0 && stock <= 3 && (
                        <span className="absolute bottom-2 left-2 bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow">
                          {stock} Left
                        </span>
                      )}
                    </div>

                    {/* Right: Info & Pricing Details */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        {/* Rating and Title */}
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <span className="bg-primary-50 text-primary-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                            {p.brandId?.name || 'Refurbished'}
                          </span>
                          <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                            <Icon icon="material-symbols:star-rounded" className="w-4.5 h-4.5 text-yellow-400" />
                            {p.ratings?.average ? p.ratings.average.toFixed(1) : '4.5'}
                          </span>
                        </div>

                        <Link
                          href={`/refurbish/${p.slug}`}
                          className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1"
                        >
                          {p.title}
                        </Link>

                        {/* Price Details */}
                        <div className="flex items-baseline gap-2 mt-2 flex-wrap">
                          {discount > 0 && (
                            <span className="text-red-500 font-extrabold text-sm">
                              -{discount}%
                            </span>
                          )}
                          <span className="text-lg font-black text-gray-900">
                            {formatPrice(price)}
                          </span>
                          {mrp > price && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrice(mrp)}
                            </span>
                          )}
                        </div>

                        {/* Special Badges: Gold Price, EMI */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {goldPrice && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded">
                              <Icon icon="solar:crown-minimalistic-bold" className="w-3.5 h-3.5 text-amber-500" />
                              {formatPrice(goldPrice)} with CTI GOLD
                            </span>
                          )}
                          {monthlyEmi && (
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                              No Cost EMI from {formatPrice(monthlyEmi)}/mo
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Specs Tags & Actions */}
                      <div className="mt-4 pt-3 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-1.5">
                          {specs.map((spec, i) => (
                            <span key={i} className="bg-gray-150/60 text-gray-600 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              {spec}
                            </span>
                          ))}
                        </div>

                        <Link
                          href={`/refurbish/${p.slug}`}
                          className="bg-primary-500 hover:bg-primary-600 text-black text-xs font-bold px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                        >
                          View Details
                          <Icon icon="material-symbols:arrow-right-alt-rounded" className="w-4 h-4" />
                        </Link>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <Icon icon="mdi:chevron-left" className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold transition-all ${page === i + 1 ? 'bg-primary-500 border-primary-500 text-black' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <Icon icon="mdi:chevron-right" className="w-4 h-4" />
              </button>
            </div>
          )}

        </main>

      </div>

    </div>
  );
}
