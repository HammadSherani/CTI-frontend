'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { useRouter } from '@/i18n/navigation';

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { label: 'Default Sorting', value: 'default' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
];

export default function RefurbishListingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Dynamic Options (fetched from DB)
  const [filterMetadata, setFilterMetadata] = useState({
    categories: [],
    brands: [],
    conditions: [],
    rams: [],
    storages: [],
    priceRange: { min: 0, max: 150000 }
  });

  // Selected Filter States
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrands, setSelectedBrands] = useState(() => {
    const urlBrand = searchParams.get('brand');
    return urlBrand ? [urlBrand] : [];
  });
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(150000);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedRams, setSelectedRams] = useState([]);
  const [selectedStorages, setSelectedStorages] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0); // 0 = all ratings

  // UI open/close states
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    price: true,
    condition: true,
    ram: true,
    storage: true,
    rating: true
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sort, setSort] = useState('default');

  // Fetch dynamic filters configuration on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get('/public/refurbished-devices/filters');
        if (res.data?.success) {
          const meta = res.data.data;
          setFilterMetadata(meta);
          // Set max price bound from DB dynamic range
          if (meta.priceRange) {
            setPriceMax(meta.priceRange.max);
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic filter configurations:', err);
      }
    })();
  }, []);

  // Sync category AND brand from URL query params (used by header dropdown links)
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlBrand = searchParams.get('brand');

    if (urlCategory !== null) {
      setSelectedCategory(urlCategory || '');
    }
    if (urlBrand) {
      // Set brand as a single-item selection — find slug match from filterMetadata
      setSelectedBrands([urlBrand]);
    }
  }, [searchParams]);

  // Fetch products based on filters
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
      if (priceMax < filterMetadata.priceRange.max) params.append('maxPrice', priceMax);
      if (selectedConditions.length > 0) params.append('condition', selectedConditions.join(','));
      if (selectedRams.length > 0) params.append('ram', selectedRams.join(','));
      if (selectedStorages.length > 0) params.append('storage', selectedStorages.join(','));
      if (selectedRating > 0) params.append('rating', selectedRating);

      const res = await axiosInstance.get(`/public/refurbished-devices/products?${params.toString()}`);
      if (res.data?.success) {
        setProducts(res.data.data);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalCount(res.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to load refurbished products:', err);
    } finally {
      setLoading(false);
    }
  }, [page, sort, selectedCategory, selectedBrands, priceMin, priceMax, selectedConditions, selectedRams, selectedStorages, selectedRating, filterMetadata.priceRange.max]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleBrand = (slug) => {
    setSelectedBrands(prev =>
      prev.includes(slug) ? prev.filter(b => b !== slug) : [...prev, slug]
    );
    setPage(1);
  };

  const toggleCondition = (val) => {
    setSelectedConditions(prev =>
      prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]
    );
    setPage(1);
  };

  const toggleRam = (val) => {
    setSelectedRams(prev =>
      prev.includes(val) ? prev.filter(r => r !== val) : [...prev, val]
    );
    setPage(1);
  };

  const toggleStorage = (val) => {
    setSelectedStorages(prev =>
      prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
    );
    setPage(1);
  };

  const handleCategoryChange = (slug) => {
    setSelectedCategory(slug);
    setPage(1);
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
    setPriceMax(filterMetadata.priceRange.max);
    setSelectedConditions([]);
    setSelectedRams([]);
    setSelectedStorages([]);
    setSelectedRating(0);
    setPage(1);
    router.push('/refurbish');
  };

  const formatPrice = (num) => `$${Number(num).toFixed(2)}`;

  const getShortDescription = (value, wordLimit = 12) => {
    if (!value) return 'Premium refurbished gadget with verified quality and reliable performance.';

    const plainText = String(value)
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!plainText) return 'Premium refurbished gadget with verified quality and reliable performance.';

    const words = plainText.split(' ');
    return words.length > wordLimit ? `${words.slice(0, wordLimit).join(' ')}...` : plainText;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 min-h-screen bg-gray-50/50">

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 font-medium">
        <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
        <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5 text-gray-400" />
        <Link href="/buy-refurbish-gadgets" className="hover:text-primary-500 transition-colors">Refurbished Store</Link>
        <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-gray-900 font-bold">All Gadgets</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* PREMIUM FILTER SIDEBAR */}
        <aside className="w-full lg:w-72 flex-shrink-0 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-6 h-fit sticky top-24">

          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <Icon icon="solar:filter-bold-duotone" className="w-5 h-5 text-primary-500" /> Filters
            </span>
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-primary-500 hover:text-primary-600 transition-all hover:underline"
            >
              Clear Filters
            </button>
          </div>

          {/* Categories Option */}
          {filterMetadata.categories.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={() => toggleSection('category')}
                className="w-full flex items-center justify-between font-black text-xs uppercase tracking-widest text-gray-450 hover:text-gray-700 transition-colors"
              >
                <span>Product Type</span>
                <Icon icon={openSections.category ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="w-4 h-4 text-gray-400" />
              </button>
              {openSections.category && (
                <div className="pt-2 space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  <div
                    onClick={() => handleCategoryChange('')}
                    className="flex items-center gap-2.5 cursor-pointer group text-sm select-none"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${!selectedCategory ? 'bg-primary-500 border-primary-500' : 'border-gray-250 group-hover:border-primary-400'}`}>
                      {!selectedCategory && <Icon icon="mdi:check" className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-[13px] transition-colors ${!selectedCategory ? 'text-primary-750 font-black' : 'text-gray-700'}`}>
                      All Types
                    </span>
                  </div>
                  {filterMetadata.categories.map((cat) => (
                    <div
                      key={cat._id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className="flex items-center gap-2.5 cursor-pointer group text-sm select-none"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedCategory === cat.slug ? 'bg-primary-500 border-primary-500' : 'border-gray-250 group-hover:border-primary-400'}`}>
                        {selectedCategory === cat.slug && <Icon icon="mdi:check" className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-[13px] transition-colors ${selectedCategory === cat.slug ? 'text-primary-750 font-black' : 'text-gray-700'}`}>
                        {cat.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Brands Option */}
          {filterMetadata.brands.length > 0 && (
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <button
                onClick={() => toggleSection('brand')}
                className="w-full flex items-center justify-between font-black text-xs uppercase tracking-widest text-gray-450 hover:text-gray-700 transition-colors"
              >
                <span>Brand</span>
                <Icon icon={openSections.brand ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="w-4 h-4 text-gray-400" />
              </button>
              {openSections.brand && (
                <div className="pt-2 space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {filterMetadata.brands.map((b) => (
                    <div
                      key={b._id}
                      onClick={() => toggleBrand(b.slug)}
                      className="flex items-center gap-2.5 cursor-pointer group text-sm select-none"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedBrands.includes(b.slug) ? 'bg-primary-500 border-primary-500' : 'border-gray-250 group-hover:border-primary-400'}`}>
                        {selectedBrands.includes(b.slug) && <Icon icon="mdi:check" className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-[13px] transition-colors ${selectedBrands.includes(b.slug) ? 'text-primary-750 font-black' : 'text-gray-700'}`}>
                        {b.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Price Range Slider */}
          <div className="space-y-2 border-t border-gray-100 pt-4">
            <button
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between font-black text-xs uppercase tracking-widest text-gray-450 hover:text-gray-700 transition-colors"
            >
              <span>Price Range</span>
              <Icon icon={openSections.price ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="w-4 h-4 text-gray-400" />
            </button>
            {openSections.price && (
              <div className="pt-3 space-y-4">
                <input
                  type="range"
                  min={filterMetadata.priceRange.min}
                  max={filterMetadata.priceRange.max}
                  step="1000"
                  value={priceMax}
                  onChange={(e) => { setPriceMax(parseInt(e.target.value)); setPage(1); }}
                  className="w-full accent-primary-500 cursor-pointer h-1 bg-gray-200 rounded appearance-none"
                />
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Min</span>
                    <div className="relative mt-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-450 text-xs">$</span>
                      <input
                        type="number"
                        value={priceMin}
                        onChange={(e) => { setPriceMin(Number(e.target.value)); setPage(1); }}
                        className="w-full pl-6 pr-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800 font-medium focus:outline-none focus:border-primary-450"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Max</span>
                    <div className="relative mt-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-450 text-xs">$</span>
                      <input
                        type="number"
                        value={priceMax}
                        onChange={(e) => { setPriceMax(Number(e.target.value)); setPage(1); }}
                        className="w-full pl-6 pr-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800 font-medium focus:outline-none focus:border-primary-455"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Condition Filter */}
          {filterMetadata.conditions.length > 0 && (
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <button
                onClick={() => toggleSection('condition')}
                className="w-full flex items-center justify-between font-black text-xs uppercase tracking-widest text-gray-450 hover:text-gray-700 transition-colors"
              >
                <span>Condition</span>
                <Icon icon={openSections.condition ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="w-4 h-4 text-gray-400" />
              </button>
              {openSections.condition && (
                <div className="pt-2 space-y-2.5">
                  {filterMetadata.conditions.map((cond) => (
                    <div
                      key={cond}
                      onClick={() => toggleCondition(cond)}
                      className="flex items-center gap-2.5 cursor-pointer group text-sm select-none"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedConditions.includes(cond) ? 'bg-primary-500 border-primary-500' : 'border-gray-250 group-hover:border-primary-400'}`}>
                        {selectedConditions.includes(cond) && <Icon icon="mdi:check" className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-[13px] transition-colors ${selectedConditions.includes(cond) ? 'text-primary-750 font-black' : 'text-gray-700'}`}>
                        {cond}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RAM Filter */}
          {filterMetadata.rams.length > 0 && (
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <button
                onClick={() => toggleSection('ram')}
                className="w-full flex items-center justify-between font-black text-xs uppercase tracking-widest text-gray-450 hover:text-gray-700 transition-colors"
              >
                <span>RAM</span>
                <Icon icon={openSections.ram ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="w-4 h-4 text-gray-400" />
              </button>
              {openSections.ram && (
                <div className="pt-2 space-y-2.5">
                  {filterMetadata.rams.map((ramOpt) => (
                    <div
                      key={ramOpt}
                      onClick={() => toggleRam(ramOpt)}
                      className="flex items-center gap-2.5 cursor-pointer group text-sm select-none"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedRams.includes(ramOpt) ? 'bg-primary-500 border-primary-500' : 'border-gray-250 group-hover:border-primary-400'}`}>
                        {selectedRams.includes(ramOpt) && <Icon icon="mdi:check" className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-[13px] transition-colors ${selectedRams.includes(ramOpt) ? 'text-primary-750 font-black' : 'text-gray-700'}`}>
                        {ramOpt}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Storage Filter */}
          {filterMetadata.storages.length > 0 && (
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <button
                onClick={() => toggleSection('storage')}
                className="w-full flex items-center justify-between font-black text-xs uppercase tracking-widest text-gray-450 hover:text-gray-700 transition-colors"
              >
                <span>Storage</span>
                <Icon icon={openSections.storage ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="w-4 h-4 text-gray-400" />
              </button>
              {openSections.storage && (
                <div className="pt-2 space-y-2.5">
                  {filterMetadata.storages.map((st) => (
                    <div
                      key={st}
                      onClick={() => toggleStorage(st)}
                      className="flex items-center gap-2.5 cursor-pointer group text-sm select-none"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedStorages.includes(st) ? 'bg-primary-500 border-primary-500' : 'border-gray-250 group-hover:border-primary-400'}`}>
                        {selectedStorages.includes(st) && <Icon icon="mdi:check" className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-[13px] transition-colors ${selectedStorages.includes(st) ? 'text-primary-750 font-black' : 'text-gray-700'}`}>
                        {st}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


        </aside>

        {/* PRODUCTS LIST */}
        <main className="flex-1 space-y-6">

          {/* Header & Sorter */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">
                {selectedCategory ? `${filterMetadata.categories.find(c => c.slug === selectedCategory)?.name || 'Refurbished'} Gadgets` : 'All Refurbished Gadgets'}
              </h2>
              <p className="text-xs text-gray-450 font-bold mt-0.5">Showing {totalCount} premium refurbished products</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-bold">Sort By:</span>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="bg-gray-50 border border-gray-200 text-xs font-semibold rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-primary-400 cursor-pointer"
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
            <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
              <Icon icon="fluent:box-search-16-regular" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base font-black text-gray-900">No matching gadgets found</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">We couldn't find any products in the DB matching those specific filters. Try resetting the filter selections.</p>
              <button
                onClick={clearAllFilters}
                className="mt-5 bg-primary-500 hover:bg-primary-600 text-black text-xs font-bold px-6 py-2.5 rounded-xl transition-all"
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
                const stock = defaultVar?.stock || 0;

                // Extract tags from attributes
                const specs = defaultVar?.attributes?.map(a => a.value).slice(0, 3) || [];
                const descriptionText = getShortDescription(p.description || p.shortDescription || p.metaDescription);

                return (
                  <div
                    key={p._id}
                    className="bg-white border border-gray-100 hover:border-primary-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-6 group relative overflow-hidden cursor-pointer"
                  >
                    {/* Main Link - Entire card clickable */}
                    <Link
                      href={`/refurbish/${p.slug}`}
                      className="absolute inset-0 z-10"
                      aria-label={`View ${p.title}`}
                    />

                    {/* Left: Product Image */}
                    <div className="relative w-full sm:w-40 h-40 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <Image
                        src={imageSrc}
                        alt={p.title}
                        width={140}
                        height={140}
                        className="object-contain p-2 max-h-36 group-hover:scale-105 transition-transform duration-300"
                      />
                      {stock > 0 && stock <= 3 && (
                        <span className="absolute bottom-2.5 left-2.5 bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow z-20">
                          {stock} Unit Left
                        </span>
                      )}
                    </div>

                    {/* Right: Info & Pricing Details */}
                    <div className="flex-1 flex flex-col justify-between py-1 relative z-0">
                      <div>
                        {/* Rating and Title */}
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <span className="bg-primary-50 text-primary-750 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider border border-primary-200">
                            {p.brandId?.name || 'Refurbished'}
                          </span>
                          <span className="text-xs text-gray-500 font-bold flex items-center gap-0.5 bg-gray-100 px-2 py-0.5 rounded">
                            <Icon icon="material-symbols:star-rounded" className="w-4 h-4 text-yellow-400" />
                            {p.ratings?.average ? p.ratings.average.toFixed(1) : '4.5'}
                          </span>
                        </div>

                        {/* Title - clickable */}
                        <Link
                          href={`/refurbish/${p.slug}`}
                          className="text-base font-bold text-gray-900 group-hover:text-primary-500 transition-colors line-clamp-1 mt-1.5 relative z-20 inline-block"
                        >
                          {p.title}
                        </Link>

                        {/* Price Details */}
                        <div className="flex items-baseline gap-2 mt-2 flex-wrap">
                          {discount > 0 && (
                            <span className="text-red-500 font-black text-sm">
                              -{discount}%
                            </span>
                          )}
                          <span className="text-xl font-black text-gray-905">
                            {formatPrice(price)}
                          </span>
                          {mrp > price && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrice(mrp)}
                            </span>
                          )}
                        </div>

                        {/* Short Description Preview */}
                        <p className="mt-3 text-[12px] leading-5 text-gray-600 line-clamp-2">
                          {descriptionText}
                        </p>
                      </div>

                      {/* Specs Tags & Actions */}
                      <div className="mt-4 pt-3.5 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-1.5">
                          {specs.map((spec, i) => (
                            <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                              {spec}
                            </span>
                          ))}
                        </div>

                        {/* Optional: Quick View Button */}
                        <Link
                          href={`/refurbish/${p.slug}`}
                          className="relative z-20 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        >
                          View Details
                          <Icon icon="ep:arrow-right-bold" className="w-3 h-3" />
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
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold transition-all ${page === i + 1 ? 'bg-primary-500 border-primary-500 text-black font-black' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
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

      </div >

    </div >
  );
}
