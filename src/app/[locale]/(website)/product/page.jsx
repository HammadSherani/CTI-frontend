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
import { toggleCart } from '@/store/cart';
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
  const { items: wishlistItems, loadingIds: wishlistLoadingIds } = useSelector((state) => state.wishlist || { items: [], loadingIds: [] });
  const { items: cartItems, loadingIds: cartLoadingIds } = useSelector((state) => state.cart || { items: [], loadingIds: [] });
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("page", page);
        queryParams.append("limit", PAGE_SIZE);
        queryParams.append("sort", sort);

        if (filters.categoryIds?.length) queryParams.append('categoryIds', filters.categoryIds.join(','));
        if (filters.subCategoryIds?.length) queryParams.append('subCategoryIds', filters.subCategoryIds.join(','));
        if (filters.brandIds?.length) queryParams.append('brandIds', filters.brandIds.join(','));
        if (filters.colors?.length) queryParams.append('colors', filters.colors.join(','));
        if (filters.dynamicFilters && Object.keys(filters.dynamicFilters).length > 0) {
          queryParams.append('dynamicFilters', JSON.stringify(filters.dynamicFilters));
        }
        if (filters.rating > 0) queryParams.append('rating', filters.rating);
        // Only send price when user has actually changed from defaults
        if (filters.priceMin > 0) queryParams.append('minPrice', filters.priceMin);
        if (filters.priceMax && filters.priceMax < 2000) queryParams.append('maxPrice', filters.priceMax);

        const res = await axiosInstance.get(`/e-commerce/products?${queryParams.toString()}`);
        if (res.data.success) {
          setProducts(res.data.data);
          console.log("Fetched products:", res.data.data);
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
    <div className="max-w-7xl mx-auto px-10 py-10">
      <div className='mb-10'>
        <h1 className='font-semibold text-xl mb-3' >Neque porro quisquam est qui dolorem ipsum quia </h1>
        <p className='font-normal text-gray-700 text-sm leading-6'>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum'Ut nec justo arcu. Mauris eget dolor neque. Vivamus sit amet molestie velit. Mauris sed ex iaculis, viverra sem eget, dictum nunc. Phasellus eleifend lacus at mi tempor tincidunt. Nunc  will uncover many web sites still in theiulla facilisi. Fusce hendrerit malesuada orci, at lobortis nibh vulputate sodales. Sed at tellus sit amet nunc faucibus congue non a eros.r infancy. Various versions have evolved over Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla egestas ipsum eu leo luctus, eu imperdiet sapien ornare. Praesent semper ante id orci semper sodales. Sed vitae erat ipsum. Aenean congue eget metus quis fringilla. Nulla rutrum viverra quam et hendrerit. Donec sit amet lectus urna. Morbi sed scelerisque odio. Donec commodo tellus magna, eget porta est venenatis eget. Donec leo purus, eleifend pulvinar mattis vel, fermentum ut leo. Nullam in semper augue, at viverra arcu. Nullam dolor est, semper eu aliquet eget, scelerisque vel nulla. Suspendisse venenatis diam felis, et consectetur nunc dignissim at. Praesent eu nisi ac nisi placerat placerat eget eu orci. Donec eget leo sit amet odio porttitor efficitur vitae vel lacus. Aenean interdum lectus faucibus neque rhoncus, id elementum turpis ultrices..</p>
      </div>
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
                  product={p}
                  isWishlisted={wishlistItems.some(w =>
                    (w.productId?._id || w.productId) === p._id
                  )}
                  isWishlistLoading={wishlistLoadingIds.includes(p._id)}
                  onWishlist={() => {
                    if (auth?.user && (auth.user._id === p.sellerId || auth.user.id === p.sellerId)) {
                      toast.error('You cannot add your own product to wishlist');
                      return;
                    }
                    const isW = wishlistItems.some(w =>
                      (w.productId?._id || w.productId) === p._id
                    );
                    dispatch(toggleWishlistItem({ product: p, variantId: null }))
                      .unwrap()
                      .then(() => {
                        if (isW) toast.info('Removed from wishlist');
                        else toast.success('Added to wishlist!');
                      })
                      .catch(() => toast.error('Failed to update wishlist'));
                  }}
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