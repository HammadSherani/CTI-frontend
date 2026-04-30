'use client';

import { useState, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import ProductsCarousel from '@/components/website/home/product/ProductsCarousel';
import { DEMO_PRODUCTS } from '../page';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'react-toastify';

// ── Demo product data (same structure as listing page) ──
const DEMO_PRODUCT = {
  _id: '1',
  title: 'Apple iPhone 14 Refurbished',
  brand: 'Apple',
  category: 'Smartphones',
  subcategory: 'Refurbished',
  rating: 4.6,
  reviews: '3,248',
  price: 50.90,
  oldPrice: 80.90,
  discountPercent: '37',
  goldPrice: '$30.90',
  badge: 'Sale',
  inStock: true,
  stockCount: 12,
  colors: ['Black', 'White', 'Blue', 'Red'],
  tags: ['Mechanical', 'Wireless', 'Bluetooth', 'Silent Keys', 'Compact', 'Seamless'],
  images: [
    '/assets/product/prode1.jpg',
    '/assets/product/prode2.jpg',
    '/assets/product/prode3.jpg',
    '/assets/product/prode4.jpg',
    '/assets/product/prode5.jpg',
  ],
  description: `Upgrade your living space with this beautifully crafted modern lounge chair. Designed for both comfort and style, it features a sturdy frame, soft cushioning, and a modern finish that fits perfectly in any home. Built with premium materials to ensure durability and long-lasting performance for everyday use.`,
  specs: [
    { label: 'Brand', value: 'Apple' },
    { label: 'Model', value: 'iPhone 14' },
    { label: 'Condition', value: 'Refurbished' },
    { label: 'Storage', value: '128GB' },
    { label: 'RAM', value: '6GB' },
    { label: 'Display', value: '6.1" Super Retina XDR' },
    { label: 'Battery', value: '3279 mAh' },
    { label: 'OS', value: 'iOS 17' },
    { label: 'Warranty', value: '6 Months' },
  ],
  ratingBreakdown: { 5: 70, 4: 15, 3: 8, 2: 4, 1: 3 },
  customerReviews: [
    { id: 1, name: 'Muhammad Ahmad', date: '12 Dec, 2026', rating: 5, comment: 'This keyboard completely upgraded my setup. The keys feel super smooth and responsive — perfect for both work and gaming. Highly recommended!', img: '/assets/avatars/a1.jpg', likes: 12 },
    { id: 2, name: 'Muhammad Ahmad', date: '12 Dec, 2026', rating: 4, comment: 'This keyboard completely upgraded my setup. The keys feel super smooth and responsive — perfect for both work and gaming. Highly recommended!', img: '/assets/avatars/a2.jpg', likes: 8 },
    { id: 3, name: 'Muhammad Ahmad', date: '12 Dec, 2026', rating: 5, comment: 'This keyboard completely upgraded my setup. The keys feel super smooth and responsive — perfect for both work and gaming. Highly recommended!', img: '/assets/avatars/a3.jpg', likes: 5 },
  ],
};

// ── Star Rating Component ──
function StarRating({ rating, size = 'sm', interactive = false, onChange }) {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm';
  return (
    <div className={`flex gap-0.5 ${sz}`}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = i <= (hovered || rating);
        const half = !filled && i - 0.5 <= rating;
        return (
          <span
            key={i}
            className={`cursor-${interactive ? 'pointer' : 'default'} ${filled ? 'text-yellow-400' : half ? 'text-yellow-300' : 'text-gray-200'}`}
            onMouseEnter={() => interactive && setHovered(i)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onChange?.(i)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

// ── Amazon-style Image Zoom Component ──
function ImageZoom({ src, alt }) {
  const containerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const ZOOM_FACTOR = 2.5;
  const LENS_SIZE = 140;

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;
    setPosition({ x: pctX, y: pctY });

    const lensX = Math.max(LENS_SIZE / 2, Math.min(rect.width - LENS_SIZE / 2, x)) - LENS_SIZE / 2;
    const lensY = Math.max(LENS_SIZE / 2, Math.min(rect.height - LENS_SIZE / 2, y)) - LENS_SIZE / 2;
    setLensPos({ x: lensX, y: lensY });
  }, []);

  return (
    <div className="relative flex gap-4">
      {/* Main Image Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 cursor-crosshair select-none"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain p-4"
          draggable={false}
        />

        {/* Lens overlay */}
        {isHovering && (
          <div
            className="absolute border-2 border-blue-400 bg-blue-50/30 pointer-events-none"
            style={{
              width: LENS_SIZE,
              height: LENS_SIZE,
              left: lensPos.x,
              top: lensPos.y,
              boxShadow: '0 0 0 1px rgba(59,130,246,0.3)',
            }}
          />
        )}
      </div>

      {/* Zoomed Panel — appears to the right */}
      {isHovering && (
        <div
          className="absolute left-[calc(100%+16px)] top-0 w-[420px] h-[420px] rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-2xl z-50 pointer-events-none"
          style={{ minWidth: 420 }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${src})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${ZOOM_FACTOR * 100}%`,
              backgroundPosition: `${position.x}% ${position.y}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── Color Dot ──
const COLOR_MAP = {
  Black: '#1a1a1a',
  White: '#f0f0f0',
  Blue: '#3b82f6',
  Red: '#ef4444',
  Gray: '#9ca3af',
  Gold: '#f59e0b',
  Green: '#22c55e',
  Pink: '#ec4899',
};

// ── Review Card ──
function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
            {review.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{review.name}</p>
            <p className="text-gray-400 text-xs">{review.date}</p>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
        <button className="flex items-center gap-1.5 text-gray-400 hover:text-primary-500 text-xs font-medium transition-colors">
          <Icon icon="mdi:thumb-up-outline" className="w-4 h-4" />
          Helpful ({review.likes})
        </button>
        <button className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 text-xs font-medium transition-colors">
          <Icon icon="mdi:thumb-down-outline" className="w-4 h-4" />
          Not helpful
        </button>
      </div>
    </div>
  );
}

// ── Main Product Detail Page ──
export default function ProductDetailPage({ product = DEMO_PRODUCT }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
const router=useRouter()
  const savings = product.oldPrice ? (product.oldPrice - product.price).toFixed(2) : null;
 const addToCart = (product, qty) => {
  console.log(`Adding to cart: ${product.title} (Qty: ${qty})`);
  toast.success(`${product.title} added to cart!`);
 }
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <a href="/" className="hover:text-primary-500 transition-colors">Home</a>
        <span>/</span>
        <a href="/products" className="hover:text-primary-500 transition-colors">{product.category}</a>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate max-w-xs">{product.title}</span>
      </nav>

      {/* ── Top Section: Images + Info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

        {/* LEFT — Image Gallery */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          <div className="flex flex-col gap-3 flex-shrink-0">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-gray-50 ${
                  selectedImage === i
                    ? 'border-primary-500 shadow-md shadow-primary-100'
                    : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <img src={img} alt={`thumb-${i}`} className="w-full h-full object-contain p-1" />
              </button>
            ))}
          </div>

          {/* Main Zoom Image */}
          <div className="flex-1 relative">
            {product.badge && (
              <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {product.badge}
              </span>
            )}
            <ImageZoom src={product.images[selectedImage]} alt={product.title} />
          </div>
        </div>

        {/* RIGHT — Product Info */}
        <div className="flex flex-col gap-5">

          {/* Brand + Title */}
          <div>
            <span className="text-primary-500 text-sm font-semibold uppercase tracking-wider">{product.brand}</span>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-1 leading-tight">{product.title}</h1>
          </div>

          {/* Rating Row */}
          <div className="flex items-center gap-3 flex-wrap">
            <StarRating rating={product.rating} size="md" />
            <span className="text-yellow-500 font-bold">{product.rating}</span>
            <span className="text-gray-400 text-sm">({product.reviews} Reviews)</span>
            <span className={`ml-2 text-xs font-semibold px-2.5 py-1 rounded-full ${product.inStock ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
              {product.inStock ? `✓ In Stock (${product.stockCount} left)` : '✗ Out of Stock'}
            </span>
          </div>

          {/* Price Block */}
          <div className="bg-gradient-to-r from-primary-50 to-orange-50 rounded-2xl p-4 border border-primary-100">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-extrabold text-primary-600">${product.price.toFixed(2)}</span>
              {product.oldPrice && (
                <span className="text-lg text-gray-400 line-through">${product.oldPrice.toFixed(2)}</span>
              )}
              {product.discountPercent && (
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {product.discountPercent}% OFF
                </span>
              )}
            </div>
            {savings && (
              <p className="text-green-600 text-sm font-semibold mt-1.5">
                 You save ${savings} on this product
              </p>
            )}
            {product.goldPrice && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-600 text-xs font-bold bg-yellow-100 px-2 py-0.5 rounded-full">GOLD</span>
                <span className="text-yellow-700 text-sm font-semibold">{product.goldPrice} for Gold members</span>
              </div>
            )}
          </div>

          {/* Description preview */}
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{product.description}</p>

          {/* Colors */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2.5">
              Colours: <span className="text-gray-500 font-normal">{selectedColor}</span>
            </p>
            <div className="flex gap-2.5 flex-wrap">
              {product.colors.map(c => (
                <button
                  key={c}
                  title={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === c ? 'border-primary-500 scale-110 shadow-md' : 'border-gray-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: COLOR_MAP[c] || '#ccc' }}
                />
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2.5">Tags:</p>
            <div className="flex gap-2 flex-wrap">
              {product.tags.map(tag => (
                <span key={tag} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-500 cursor-pointer transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Quantity + Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Qty */}
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors"
              >
                −
              </button>
              <span className="px-4 py-2.5 font-semibold text-gray-800 min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stockCount, q + 1))}
                className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors"
              >
                +
              </button>
            </div>

            {/* Add to Cart */}
            <button onClick={() => addToCart(product, quantity)} className="flex-1 bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-primary-200 text-sm flex items-center justify-center gap-2">
              <Icon icon="mdi:shopping-cart" /> Add to Cart
            </button>

            {/* Buy Now */}
            <button onClick={()=>router.push(`/checkout`)} className="flex-1 bg-gray-900 hover:bg-gray-800 active:scale-95 text-white font-bold py-3 px-6 rounded-xl transition-all text-sm">
              Buy Now
            </button>

            {/* Wishlist */}
            <button
              onClick={() => setIsWishlisted(w => !w)}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all text-xl ${
                isWishlisted ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400'
              }`}
            >
              <Icon icon={isWishlisted ? 'mdi:heart' : 'mdi:heart-outline'} className="w-5 h-5" />
            </button>
          </div>

          {/* Share */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-500 font-medium">Share:</span>
            {[
              { name: 'Facebook', icon: 'mdi:facebook' },
              { name: 'Instagram', icon: 'mdi:instagram' },
              { name: 'Twitter', icon: 'mdi:twitter' },
            ].map((s) => (
              <button key={s.name} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-primary-100 hover:text-primary-500 flex items-center justify-center text-gray-500 transition-colors">
                <Icon icon={s.icon} className="text-lg" />
              </button>
            ))}
          </div>

    
        </div>
      </div>

      {/* ── Tabs Section ── */}
      <div className="mb-16">
        <div className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto">
          {[
            { id: 'description', label: 'Description' },
            { id: 'specs', label: 'Specifications' },
            { id: 'reviews', label: `Reviews (${product.reviews})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="max-w-3xl">
            <p className="text-gray-600 leading-relaxed text-base">{product.description}</p>
            <ul className="mt-6 space-y-2">
              {['Premium build quality with durable materials', 'Optimized for both performance and aesthetics', 'Backed by official manufacturer warranty', 'Compatible with all major accessories'].map(f => (
                <li key={f} className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Specs Tab */}
        {activeTab === 'specs' && (
          <div className="max-w-2xl">
            <div className="rounded-2xl border border-gray-100 overflow-hidden">
              {product.specs.map((spec, i) => (
                <div key={spec.label} className={`flex ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="w-40 px-5 py-3.5 text-sm font-semibold text-gray-500 border-r border-gray-100 flex-shrink-0">{spec.label}</div>
                  <div className="px-5 py-3.5 text-sm text-gray-800 font-medium">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Rating Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Ratings &amp; <span className="text-primary-500">Reviews</span>
                </h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-extrabold text-gray-900">{product.rating}</div>
                    <StarRating rating={product.rating} size="md" />
                    <div className="text-xs text-gray-400 mt-1">({product.reviews} Reviews)</div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map(star => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-2">{star}</span>
                        <span className="text-yellow-400 text-xs">★</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${product.ratingBreakdown[star]}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8">{product.ratingBreakdown[star]}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Write a Review */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-1">Review this product</h4>
                <p className="text-gray-400 text-xs mb-4">Share your thought with other customers</p>
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1.5">Your Rating</p>
                  <StarRating rating={reviewRating} size="lg" interactive onChange={setReviewRating} />
                </div>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Write your review here..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 resize-none focus:outline-none focus:border-primary-400 transition-colors mt-2"
                />
                <button className="mt-3 w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  Write a Customer Review
                </button>
              </div>
            </div>

            {/* Review Cards */}
            <div className="lg:col-span-3 space-y-4">
              {product.customerReviews.map(r => (
                <ReviewCard key={r.id} review={r} />
              ))}
              <button className="w-full py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-primary-500 transition-colors">
                Load More Reviews →
              </button>
            </div>
          </div>
        )}

<div className="mt-8">
              <ProductsCarousel products={DEMO_PRODUCTS} titleHighlight='Similar' title='Products'  />
</div>
        
              {/* Delivery Info */}
          <div className="grid grid-cols-3 gap-10 mt-10">
            {[
              { icon: '/assets/product/icons/1.png', label: 'Seasonal Sales', sub: 'Celebrate your style with exclusive seasonal offers.' },
              { icon: '/assets/product/icons/2.png', label: 'Money Back Guarantee', sub: 'Love it or return it within 7 days — no questions asked.' },
              { icon: '/assets/product/icons/3.png', label: 'Free Shipping', sub: 'Available on all items within 7 days.' },
            ].map(d => (
              <div key={d.label} className=" rounded-xl p-10 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xl mb-1"><Image src={d.icon} alt={d.label} className="inline-block" width={48} height={48} /></div>
                <p className="text-md font-semibold  text-gray-800">{d.label}</p>
                <p className="text-sm text-gray-600 w-48 text-center mx-auto ">{d.sub}</p>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}