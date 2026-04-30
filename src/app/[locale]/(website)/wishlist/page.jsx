'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';

// ── Demo Wishlist Items ──
const INITIAL_WISHLIST = [
  { _id: '1', title: 'Apple iPhone 14 Refurbished', subtitle: 'Smartphones · Refurbished', img: '/assets/product/prode1.jpg', price: 50.90, oldPrice: 80.90, discountPercent: '37', rating: 4.5, reviews: '5k', inStock: true,  badge: 'Sale' },
  { _id: '2', title: 'Samsung Galaxy S23 Ultra',    subtitle: 'Smartphones · Brand New',   img: '/assets/product/prode2.jpg', price: 120.00, oldPrice: 160.00, discountPercent: '25', rating: 4.8, reviews: '3.2k', inStock: true,  badge: 'New' },
  { _id: '3', title: 'Xiaomi 13 Pro Open Box',      subtitle: 'Smartphones · Open Box',    img: '/assets/product/prode3.jpg', price: 75.00, oldPrice: 110.00, discountPercent: '32', rating: 4.2, reviews: '1.8k', inStock: false, badge: 'Sale' },
  { _id: '4', title: 'Apple MacBook Air M2',         subtitle: 'Laptops · Brand New',       img: '/assets/product/prode4.jpg', price: 850.00, oldPrice: 1099.00, discountPercent: '23', rating: 4.9, reviews: '9k', inStock: true, badge: '' },
  { _id: '5', title: 'Samsung Galaxy Tab S9',        subtitle: 'Tablets · Brand New',       img: '/assets/product/prode5.jpg', price: 310.00, oldPrice: 399.00, discountPercent: '22', rating: 4.6, reviews: '2.4k', inStock: true, badge: 'Sale' },
  { _id: '6', title: 'Apple Watch Series 9',         subtitle: 'Wearables · Brand New',     img: '/assets/product/prode6.jpg', price: 280.00, oldPrice: 349.00, discountPercent: '20', rating: 4.7, reviews: '7.1k', inStock: true, badge: '' },
];

// ── Star Rating ──
function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Icon
          key={i}
          icon={i <= Math.floor(rating) ? 'mdi:star' : i - 0.5 <= rating ? 'mdi:star-half-full' : 'mdi:star-outline'}
          className={`text-sm ${i <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}

// ── Wishlist Card ──
function WishlistCard({ item, onRemove, onAddToCart }) {
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    await new Promise(r => setTimeout(r, 800));
    onAddToCart(item._id);
    setAdding(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={item.img}
          alt={item.title}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badge */}
        {item.badge && (
          <span className={`absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full ${item.badge === 'New' ? 'bg-blue-500' : 'bg-red-500'}`}>
            {item.badge}
          </span>
        )}
        {/* Discount */}
        {item.discountPercent && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{item.discountPercent}%
          </span>
        )}
        {/* Remove button */}
        <button
          onClick={() => onRemove(item._id)}
          title="Remove from wishlist"
          className="absolute bottom-3 right-3 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm opacity-0 group-hover:opacity-100"
        >
          <Icon icon="mdi:heart-off-outline" className="text-sm" />
        </button>
        {/* Stock badge */}
        {!item.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-1">{item.subtitle}</p>
        <Link href={`/products/${item._id}`}>
          <h3 className="font-bold text-gray-800 text-sm leading-tight hover:text-primary-500 transition-colors line-clamp-2 mb-2">
            {item.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <StarRating rating={item.rating} />
          <span className="text-xs text-gray-400">({item.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-base font-extrabold text-primary-600">${item.price.toFixed(2)}</span>
          {item.oldPrice && (
            <span className="text-xs text-gray-400 line-through">${item.oldPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            disabled={!item.inStock || adding}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              item.inStock
                ? 'bg-primary-500 hover:bg-primary-600 active:scale-95 text-white shadow-md shadow-primary-100'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {adding ? (
              <Icon icon="mdi:loading" className="animate-spin text-sm" />
            ) : (
              <Icon icon="mdi:cart-plus" className="text-sm" />
            )}
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
          <button
            onClick={() => onRemove(item._id)}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all flex-shrink-0"
            title="Remove"
          >
            <Icon icon="mdi:trash-can-outline" className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Wishlist Page ──
export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(INITIAL_WISHLIST);
  const [cartAdded, setCartAdded] = useState([]);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRemove = (id) => {
    setWishlist(prev => prev.filter(item => item._id !== id));
    showNotification('Item removed from wishlist', 'info');
  };

  const handleAddToCart = (id) => {
    setCartAdded(prev => [...prev, id]);
    showNotification('Item added to cart!', 'success');
  };

  const handleAddAll = () => {
    const inStockIds = wishlist.filter(i => i.inStock).map(i => i._id);
    setCartAdded(prev => [...new Set([...prev, ...inStockIds])]);
    showNotification(`${inStockIds.length} items added to cart!`, 'success');
  };

  const handleClearAll = () => {
    setWishlist([]);
    showNotification('Wishlist cleared', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* ── Notification Toast ── */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold transition-all ${notification.type === 'success' ? 'bg-green-500' : 'bg-gray-700'}`}>
          <Icon icon={notification.type === 'success' ? 'mdi:check-circle' : 'mdi:information'} className="text-lg" />
          {notification.msg}
        </div>
      )}

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
        <Icon icon="mdi:chevron-right" />
        <span className="text-gray-700 font-medium">Wishlist</span>
      </nav>

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Icon icon="mdi:heart" className="text-red-500" />
            My Wishlist
            {wishlist.length > 0 && (
              <span className="text-base font-semibold text-gray-400">({wishlist.length} items)</span>
            )}
          </h1>
          <p className="text-sm text-gray-400 mt-1">Items you love, saved for later</p>
        </div>

        {wishlist.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleAddAll}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-primary-100"
            >
              <Icon icon="mdi:cart-arrow-down" className="text-base" />
              Add All to Cart
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Icon icon="mdi:trash-can-outline" className="text-base" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* ── Stats Bar ── */}
      {wishlist.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: 'mdi:heart',            label: 'Saved Items',   value: wishlist.length,                               color: 'text-red-500',   bg: 'bg-red-50'   },
            { icon: 'mdi:check-circle',     label: 'In Stock',      value: wishlist.filter(i => i.inStock).length,        color: 'text-green-500', bg: 'bg-green-50' },
            { icon: 'mdi:tag-outline',      label: 'On Sale',       value: wishlist.filter(i => i.badge === 'Sale').length,color: 'text-orange-500',bg: 'bg-orange-50'},
            { icon: 'mdi:cart-check',       label: 'Added to Cart', value: cartAdded.length,                              color: 'text-blue-500',  bg: 'bg-blue-50'  },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3`}>
              <Icon icon={s.icon} className={`${s.color} text-2xl`} />
              <div>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                <p className="text-xl font-extrabold text-gray-800">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {wishlist.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon icon="mdi:heart-off-outline" className="text-5xl text-red-300" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-700 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
            Save items you love by clicking the heart icon on any product page
          </p>
          <Link href="/products">
            <button className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-primary-100 text-sm flex items-center gap-2 mx-auto">
              <Icon icon="mdi:shopping-outline" className="text-base" />
              Explore Products
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* ── Grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
            {wishlist.map(item => (
              <WishlistCard
                key={item._id}
                item={item}
                onRemove={handleRemove}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* ── Continue Shopping ── */}
          <div className="mt-10 text-center">
            <Link href="/products">
              <button className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 hover:text-primary-500 hover:border-primary-300 font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                <Icon icon="mdi:arrow-left" />
                Continue Shopping
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}