'use client';

import { useState, useMemo } from 'react';
import FilterSidebar from '@/components/website/product/FilterSidebar';
import ProductCard from '@/components/website/product/productCard';
import { Dropdown } from '@/components/website/product/Dropdown';
import { useRouter } from '@/i18n/navigation';

const PAGE_SIZE = 8;

// ── Static demo products (swap for API call later) ──
export const DEMO_PRODUCTS = [
  { _id: '1',  title: 'Apple iPhone 14 Refurbished',  img: '/assets/product/prode1.jpg', price: 50.90,  oldPrice: 80.90,  discountAmount: '12,000', discountPercent: '37', reviews: '5k',  goldPrice: '$30.90', badge: 'Sale',  brand: 'Apple',   category: 'Smartphones', subcategory: 'Refurbished', colors: ['Black','White'], rating: 4.5 },
  { _id: '2',  title: 'Samsung Galaxy S23 Ultra',      img: '/assets/product/prode2.jpg', price: 120.00, oldPrice: 160.00, discountAmount: '8,000',  discountPercent: '25', reviews: '3.2k', goldPrice: '$90.00', badge: 'New',   brand: 'Samsung', category: 'Smartphones', subcategory: 'Brand New',  colors: ['Black','Gray'],  rating: 4.8 },
  { _id: '3',  title: 'Xiaomi 13 Pro Open Box',        img: '/assets/product/prode3.jpg', price: 75.00,  oldPrice: 110.00, discountAmount: '5,000',  discountPercent: '32', reviews: '1.8k', goldPrice: '$55.00', badge: 'Sale',  brand: 'Xiaomi',  category: 'Smartphones', subcategory: 'Open Box',   colors: ['Black','Blue'],  rating: 4.2 },
  { _id: '4',  title: 'Apple MacBook Air M2',           img: '/assets/product/prode4.jpg', price: 850.00, oldPrice: 1099.00,discountAmount: '',       discountPercent: '23', reviews: '9k',  goldPrice: '$720.00',badge: '',      brand: 'Apple',   category: 'Laptops',     subcategory: 'Brand New',  colors: ['Gray','Gold'],   rating: 4.9 },
  { _id: '5',  title: 'Samsung Galaxy Tab S9',          img: '/assets/product/prode5.jpg', price: 310.00, oldPrice: 399.00, discountAmount: '3,000',  discountPercent: '22', reviews: '2.4k', goldPrice: '$270.00',badge: 'Sale',  brand: 'Samsung', category: 'Tablets',     subcategory: 'Brand New',  colors: ['Gray','Pink'],   rating: 4.6 },
  { _id: '6',  title: 'Apple Watch Series 9',           img: '/assets/product/prode6.jpg', price: 280.00, oldPrice: 349.00, discountAmount: '',       discountPercent: '20', reviews: '7.1k', goldPrice: '$230.00',badge: '',      brand: 'Apple',   category: 'Wearables',   subcategory: 'Brand New',  colors: ['Black','White'], rating: 4.7 },
  { _id: '7',  title: 'OnePlus 12 Flagship Phone',      img: '/assets/product/prode1.jpg', price: 65.00,  oldPrice: 95.00,  discountAmount: '4,500',  discountPercent: '32', reviews: '980',  goldPrice: '$50.00', badge: 'Sale',  brand: 'OnePlus', category: 'Smartphones', subcategory: 'Brand New',  colors: ['Black','Green'], rating: 4.3 },
  { _id: '8',  title: 'Huawei MatePad Pro 12',          img: '/assets/product/prode2.jpg', price: 220.00, oldPrice: 299.00, discountAmount: '2,000',  discountPercent: '26', reviews: '540',  goldPrice: '$180.00',badge: 'Sale',  brand: 'Huawei',  category: 'Tablets',     subcategory: 'Refurbished',colors: ['Gray','Gold'],   rating: 4.1 },
  { _id: '9',  title: 'Samsung Galaxy Buds Pro',        img: '/assets/product/prode3.jpg', price: 35.00,  oldPrice: 55.00,  discountAmount: '',       discountPercent: '36', reviews: '12k',  goldPrice: '$25.00', badge: 'Sale',  brand: 'Samsung', category: 'Accessories', subcategory: 'Brand New',  colors: ['Black','White'], rating: 4.5 },
  { _id: '10', title: 'Apple AirPods Pro 2nd Gen',      img: '/assets/product/prode4.jpg', price: 180.00, oldPrice: 249.00, discountAmount: '',       discountPercent: '28', reviews: '21k',  goldPrice: '$140.00',badge: '',      brand: 'Apple',   category: 'Accessories', subcategory: 'Brand New',  colors: ['White'],         rating: 4.8 },
  { _id: '11', title: 'Xiaomi Smart Band 8',             img: '/assets/product/prode5.jpg', price: 22.00,  oldPrice: 35.00,  discountAmount: '800',    discountPercent: '37', reviews: '3.3k', goldPrice: '$15.00', badge: 'Sale',  brand: 'Xiaomi',  category: 'Wearables',   subcategory: 'Brand New',  colors: ['Black','Blue'],  rating: 4.0 },
  { _id: '12', title: 'Apple iPhone 13 Refurbished',    img: '/assets/product/prode6.jpg', price: 42.00,  oldPrice: 69.00,  discountAmount: '7,000',  discountPercent: '39', reviews: '6.5k', goldPrice: '$29.00', badge: 'Sale',  brand: 'Apple',   category: 'Smartphones', subcategory: 'Refurbished',colors: ['Black','Pink'],  rating: 4.4 },
  { _id: '13', title: 'Huawei MateBook D15',             img: '/assets/product/prode1.jpg', price: 420.00, oldPrice: 550.00, discountAmount: '',       discountPercent: '24', reviews: '1.1k', goldPrice: '$360.00',badge: '',      brand: 'Huawei',  category: 'Laptops',     subcategory: 'Brand New',  colors: ['Gray'],          rating: 4.2 },
  { _id: '14', title: 'OnePlus Nord CE 3 Lite',          img: '/assets/product/prode2.jpg', price: 28.00,  oldPrice: 45.00,  discountAmount: '3,000',  discountPercent: '38', reviews: '2.0k', goldPrice: '$19.00', badge: 'Sale',  brand: 'OnePlus', category: 'Smartphones', subcategory: 'Brand New',  colors: ['Black','Blue'],  rating: 3.9 },
  { _id: '15', title: 'Samsung Galaxy Watch 6',          img: '/assets/product/prode3.jpg', price: 150.00, oldPrice: 199.00, discountAmount: '',       discountPercent: '25', reviews: '4.7k', goldPrice: '$120.00',badge: '',      brand: 'Samsung', category: 'Wearables',   subcategory: 'Brand New',  colors: ['Black','Gold'],  rating: 4.6 },
  { _id: '16', title: 'Xiaomi Pad 6 Pro',                img: '/assets/product/prode4.jpg', price: 190.00, oldPrice: 260.00, discountAmount: '2,500',  discountPercent: '27', reviews: '1.6k', goldPrice: '$155.00',badge: 'Sale',  brand: 'Xiaomi',  category: 'Tablets',     subcategory: 'Brand New',  colors: ['Gray','Blue'],   rating: 4.4 },
];

export default function ProductListingPage() {
  const [filters, setFilters]   = useState({});
  const [sort, setSort]         = useState('default');
  const [page, setPage]         = useState(1);
const router = useRouter();
  // ── Filter + Sort ──
  const filtered = useMemo(() => {
    let list = [...DEMO_PRODUCTS];

    if (filters.brands?.length)       list = list.filter(p => filters.brands.includes(p.brand));
    if (filters.categories?.length)   list = list.filter(p => filters.categories.includes(p.category));
    if (filters.subcategories?.length) list = list.filter(p => filters.subcategories.includes(p.subcategory));
    if (filters.colors?.length)       list = list.filter(p => filters.colors.some(c => p.colors.includes(c)));
    if (filters.rating > 0)           list = list.filter(p => p.rating >= filters.rating);
    if (filters.priceMin != null)     list = list.filter(p => p.price >= filters.priceMin);
    if (filters.priceMax != null)     list = list.filter(p => p.price <= filters.priceMax);

    if (sort === 'price-asc')  list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'rating')     list.sort((a, b) => b.rating - a.rating);
    if (sort === 'discount')   list.sort((a, b) => parseFloat(b.discountPercent || 0) - parseFloat(a.discountPercent || 0));

    return list;
  }, [filters, sort]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
              Products{' '}
              <span className="text-primary-500">({filtered.length})</span>
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
          {paginated.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
              {paginated.map(p => (
                <ProductCard
                  key={p._id}
                  title={p.title}
                  img={p.img}
                  price={`$${p.price.toFixed(2)}`}
                  oldPrice={p.oldPrice ? `$${p.oldPrice.toFixed(2)}` : null}
                  discountAmount={p.discountAmount}
                  discountPercent={p.discountPercent}
                  reviews={p.reviews}
                  goldPrice={p.goldPrice}
                  badge={p.badge}
                  onAdd={() => router.push(`/product/${p._id}`)}
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
                    className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                      p === page
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