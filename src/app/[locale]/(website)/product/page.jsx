'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import FilterSidebar from '@/components/website/product/FilterSidebar';
import ProductCard from '@/components/website/product/productCard';
import { Dropdown } from '@/components/website/product/Dropdown';
import { useRouter } from '@/i18n/navigation';
import axiosInstance from "@/config/axiosInstance";
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlistItem } from '@/store/wishlist';
import { toggleCart } from '@/store/cart';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';

const PAGE_SIZE = 30;

const SORT_OPTIONS = [
  { label: "Default",             value: "default"    },
  { label: "Price: Low → High",   value: "price-asc"  },
  { label: "Price: High → Low",   value: "price-desc" },
  { label: "Top Rated",           value: "rating"     },
];

/* Reads URL params and returns initial filter object */
function parseUrlFilters(searchParams) {
  return {
    categoryIds:    searchParams.get('categoryIds')?.split(',').filter(Boolean)  || [],
    subCategoryIds: searchParams.get('subCategoryIds')?.split(',').filter(Boolean) || [],
    brandIds:       searchParams.get('brandIds')?.split(',').filter(Boolean)     || [],
    colors:         [],
    dynamicFilters: {},
    rating:         0,
    priceMin:       0,
    priceMax:       2000,
    q:              searchParams.get('q') || '',
  };
}

export default function ProductListingPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const dispatch     = useDispatch();

  /* Initialise filters directly from URL so first fetch uses them */
  const [filters,     setFilters]     = useState(() => parseUrlFilters(searchParams));
  const [sort,        setSort]        = useState('default');
  const [page,        setPage]        = useState(1);
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);

  const { items: wishlistItems } = useSelector(s => s.wishlist || { items: [] });
  const auth = useSelector(s => s.auth);

  /* Re-sync filters if URL changes (e.g. user clicks header search again) */
  useEffect(() => {
    const next = parseUrlFilters(searchParams);
    setFilters(next);
    setPage(1);
  }, [searchParams.toString()]);

  /* Fetch products whenever filters / sort / page change */
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const p = new URLSearchParams();
        p.append('page',  page);
        p.append('limit', PAGE_SIZE);
        p.append('sort',  sort);

        if (filters.categoryIds?.length)    p.append('categoryIds',    filters.categoryIds.join(','));
        if (filters.subCategoryIds?.length) p.append('subCategoryIds', filters.subCategoryIds.join(','));
        if (filters.brandIds?.length)       p.append('brandIds',       filters.brandIds.join(','));
        if (filters.colors?.length)         p.append('colors',         filters.colors.join(','));
        if (filters.dynamicFilters && Object.keys(filters.dynamicFilters).length)
          p.append('dynamicFilters', JSON.stringify(filters.dynamicFilters));
        if (filters.rating > 0)             p.append('rating',   filters.rating);
        if (filters.priceMin > 0)           p.append('minPrice', filters.priceMin);
        if (filters.priceMax < 2000)        p.append('maxPrice', filters.priceMax);
        if (filters.q)                      p.append('q',        filters.q);

        const res = await axiosInstance.get(`/e-commerce/products?${p.toString()}`);
        if (res.data.success) {
          setProducts(res.data.data);
          setTotalPages(res.data.pagination.pages);
          setTotalCount(res.data.pagination.total);
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filters, sort, page]);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Active filter chips — derived from current filters */
  const activeChips = [
    ...(filters.q ? [{ label: `"${filters.q}"`, key: 'q' }] : []),
  ];

  const clearChip = (key) => {
    if (key === 'q') {
      const next = new URLSearchParams(searchParams.toString());
      next.delete('q');
      router.push(`/product?${next.toString()}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-10 py-10">

      {/* Active search query banner */}
      {filters.q && (
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-500">Results for:</span>
          <span className="flex items-center gap-1.5 bg-primary-50 border border-primary-200 text-primary-700 text-sm font-semibold px-3 py-1 rounded-full">
            "{filters.q}"
            <button onClick={() => clearChip('q')} className="ml-1 hover:text-primary-900">
              <Icon icon="mdi:close" className="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-6">
          <FilterSidebar
            onFiltersChange={handleFiltersChange}
            initialCategoryIds={filters.categoryIds}
            initialBrandIds={filters.brandIds}
            initialSubCategoryIds={filters.subCategoryIds}
          />
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">

          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h2 className="text-2xl font-extrabold text-gray-900">
              Products
              {totalCount > 0 && (
                <span className="ml-2 text-base font-normal text-gray-400">({totalCount})</span>
              )}
            </h2>
            <Dropdown
              icon="mdi:sort-variant"
              options={SORT_OPTIONS}
              value={sort}
              onChange={(val) => { setSort(val); setPage(1); }}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-72" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(p => (
                <ProductCard
                  key={p._id}
                  product={p}
                  isWishlisted={wishlistItems.some(w => (w.productId?._id || w.productId) === p._id)}
                  onWishlist={() => {
                    if (auth?.user && (auth.user._id === p.sellerId || auth.user.id === p.sellerId)) {
                      toast.error('You cannot add your own product to wishlist');
                      return;
                    }
                    dispatch(toggleWishlistItem({ product: p, variantId: null }));
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-200">
              <Icon icon="mdi:package-variant-remove" className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-700">No products found</h3>
              <p className="text-gray-400 mt-1 text-sm">Try adjusting your filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
              <button
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                if (p !== 1 && p !== totalPages && Math.abs(p - page) > 1) {
                  if (p === page - 2 || p === page + 2)
                    return <span key={`e${p}`} className="text-gray-400 text-sm px-1">…</span>;
                  return null;
                }
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                      p === page ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
