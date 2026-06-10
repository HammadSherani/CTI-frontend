'use client';

import { useState, useMemo } from 'react';
import FilterSidebar from '@/components/website/product/FilterSidebar';
import ProductCard from '@/components/website/product/productCard';
import { Dropdown } from '@/components/website/product/Dropdown';
import { useRouter } from '@/i18n/navigation';

const PAGE_SIZE = 8;

import { useEffect } from 'react';
import axiosInstance from "@/config/axiosInstance";
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlistItem } from '@/store/wishlist';
import { toast } from 'react-toastify';

export default function ProductListingPage() {
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector((state) => state.wishlist || { items: [] });
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("page", page);
        queryParams.append("limit", PAGE_SIZE);
        queryParams.append("sort", sort);

        if (filters.categoryIds?.length)    queryParams.append('categoryIds',    filters.categoryIds.join(','));
        if (filters.subCategoryIds?.length)  queryParams.append('subCategoryIds', filters.subCategoryIds.join(','));
        if (filters.brandIds?.length)        queryParams.append('brandIds',       filters.brandIds.join(','));
        if (filters.colors?.length)          queryParams.append('colors',         filters.colors.join(','));
        if (filters.rating > 0)              queryParams.append('rating',         filters.rating);
        // Only send price when user has actually changed from defaults
        if (filters.priceMin > 0)            queryParams.append('minPrice',       filters.priceMin);
        if (filters.priceMax && filters.priceMax < 2000) queryParams.append('maxPrice', filters.priceMax);

        const res = await axiosInstance.get(`/e-commerce/products?${queryParams.toString()}`);
        if (res.data.success) {
          setProducts(res.data.data);
          setTotalPages(res.data.pagination.pages);
        }
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters, sort, page]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const SORT_OPTIONS = [
    { label: "Default", value: "default" },
    { label: "Price: Low → High", value: "price-asc" },
    { label: "Price: High → Low", value: "price-desc" },
    { label: "Top Rated", value: "rating" },
    { label: "Most Discounted", value: "discount" },
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ── Sidebar ── */}
        <div className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-6">
          <FilterSidebar onFiltersChange={handleFiltersChange} />
        </div>

        {/* ── Main ── */}
        <div className="flex-1 min-w-0">

          {/* Header row */}
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4 ">
            <h2 className="text-2xl font-extrabold text-gray-900">
              Products
            </h2>
            <div className=''>
              <Dropdown
                icon="mdi:sort-variant"
                options={SORT_OPTIONS}
                value={sort}
                onChange={(val) => {
                  setSort(val);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <span className="animate-spin text-4xl text-primary-500">⏳</span>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
              {products.map(p => (
                <ProductCard
                  key={p._id}
                  title={p.title}
                  img={p.images?.[0]?.url || "/assets/placeholder.jpg"}
                  price={`$${(p.summary?.minSalePrice || p.summary?.minPrice || 0).toFixed(2)}`}
                  oldPrice={p.summary?.minSalePrice && p.summary?.minSalePrice < p.summary?.minPrice ? `$${p.summary.minPrice.toFixed(2)}` : null}
                  discountAmount={""}
                  discountPercent={p.summary?.minSalePrice && p.summary?.minSalePrice < p.summary?.minPrice ? Math.round(((p.summary.minPrice - p.summary.minSalePrice) / p.summary.minPrice) * 100) : ""}
                  reviews={"0"}
                  goldPrice={""}
                  badge={null}
                  isWishlisted={wishlistItems.some(w => w.productId?._id === p._id)}
                  onWishlist={() => {
                    dispatch(toggleWishlistItem({ product: p, variantId: null }));
                    const isW = wishlistItems.some(w => w.productId?._id === p._id);
                    if (isW) toast.info('Removed from wishlist');
                    else toast.success('Added to wishlist');
                  }}
                  onAdd={() => router.push(`/product/${p.slug}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-200">
              <div className="text-5xl mb-4">😕</div>
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
                const show = p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1);
                const ellipsis = p === page - 2 || p === page + 2;
                if (!show && !ellipsis) return null;
                if (ellipsis) return <span key={`e${p}`} className="text-gray-400 text-sm px-1">…</span>;
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${p === page
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'border-gray-200 hover:bg-gray-50'
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