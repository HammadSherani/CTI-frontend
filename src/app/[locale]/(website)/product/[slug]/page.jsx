'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import { Link, useRouter } from '@/i18n/navigation';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { toggleCart } from '@/store/cart';
import { toggleWishlistItem } from '@/store/wishlist';
import { useParams } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';
import DOMPurify from 'isomorphic-dompurify';
import ProductCard from '@/components/website/product/productCard';

/* ──────────────────────────────────────────────────────────
   STAR RATING
────────────────────────────────────────────────────────── */
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

function ImageZoom({ src, alt }) {
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: '50%', y: '50%' });
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(2) + '%';
    const y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(2) + '%';
    setOrigin({ x, y });
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMouseMove}
      className="w-full h-full overflow-hidden cursor-zoom-in"
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: zoom ? 'scale(2)' : 'scale(1)',
          transformOrigin: `${origin.x} ${origin.y}`,
        }}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   REVIEW CARD
────────────────────────────────────────────────────────── */
function ReviewCard({ review }) {
  const name = review.userId ? review.userId.name : 'Anonymous';
  const email = review.userId ? review.userId.email : '';
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{name}</p>
            <p className="text-gray-400 text-xs">{email}</p>
            <p className="text-gray-400 text-xs">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>

      {/* Media Rendering */}
      {(review.images?.length > 0 || review.video) && (
        <div className="flex flex-wrap gap-3 mt-3">
          {review.images?.map((img, idx) => (
            <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
              <img src={img.url} alt={`Review ${idx}`} className="w-full h-full object-cover" />
            </div>
          ))}
          {review.video && (
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative bg-black flex items-center justify-center">
              <video src={review.video.url} className="w-full h-full object-cover opacity-60" />
              <Icon icon="mdi:play-circle" className="w-8 h-8 text-white absolute z-10" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   ASK SELLER MODAL
────────────────────────────────────────────────────────── */
const ASK_QUICK_SUBJECTS = [
  'Is this available?',
  'Shipping to my city?',
  'Stock availability',
  'Custom order possible?',
  'Warranty details',
];

function AskSellerModal({ onClose, onSubmit, loading, sellerName, productTitle }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!subject.trim()) { toast.error('Subject is required'); return; }
    if (!message.trim()) { toast.error('Message is required'); return; }
    onSubmit(subject.trim(), message.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-gray-900 text-base">Ask the Seller</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
              {sellerName} · {productTitle}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <Icon icon="mdi:close" className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Common Questions</p>
            <div className="flex flex-wrap gap-1.5">
              {ASK_QUICK_SUBJECTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${subject === s
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What would you like to know?"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
              placeholder="Describe your question in detail…"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
            <p className="text-[11px] text-right text-gray-300 mt-0.5">{message.length}/1000</p>
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !subject.trim() || !message.trim()}
            className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {loading
              ? <Icon icon="mdi:loading" className="animate-spin w-4 h-4 mx-auto" />
              : 'Send Message'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   MAIN PAGE
────────────────────────────────────────────────────────── */
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const [productData, setProductData] = useState(null);
  const [variants, setVariants] = useState([]);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewVideo, setReviewVideo] = useState(null);
  const [showAskModal, setShowAskModal] = useState(false);
  const [askLoading, setAskLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  /* ── Per-attribute selection for multi-attribute variants ── */
  const [selectedAttributes, setSelectedAttributes] = useState({});

  // Thumbnail pagination
  const [thumbStart, setThumbStart] = useState(0);
  const THUMBS_PER_VIEW = 6;

  const wishlistItems = useSelector(s => s.wishlist?.items || []);
  const wishlistLoadingIds = useSelector(s => s.wishlist?.loadingIds || []);
  const cartItems = useSelector(s => s.cart?.items || []);
  const cartLoadingIds = useSelector(s => s.cart?.loadingIds || []);
  const auth = useSelector(s => s.auth);
  const token = auth?.token;

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [{ data: res }, { data: revRes }] = await Promise.all([
          axiosInstance.get(`/e-commerce/products/${params.slug}`),
          axiosInstance.get(`/e-commerce/products/${params.slug}/reviews`),
        ]);
        if (res.success) {
          const prod = res.data.product;
          setProductData(prod);
          if (res.data.seller) setSeller(res.data.seller);
          const vList = res.data.variants || [];
          setVariants(vList);
          if (vList.length) {
            const def = vList.find(v => v.isDefault) || vList[0];
            setSelectedVariantId(def._id);
            // Pre-fill attribute selections from default variant
            const attrs = {};
            (def.attributes || []).forEach(a => { attrs[a.name] = a.value; });
            setSelectedAttributes(attrs);
          }

          // Fetch related products
          if (prod && prod.category) {
            try {
              const rel = await axiosInstance.get(`/e-commerce/products?categoryIds=${prod.category._id || prod.category}&limit=5`);
              if (rel.data && rel.data.success) {
                setRelatedProducts((rel.data.data.products || []).filter(p => p._id !== prod._id).slice(0, 4));
              }
            } catch (e) {
              console.error("Failed to fetch related products", e);
            }
          }
        }
        if (revRes.success) setReviews(revRes.data);
      } catch (err) {
        console.error('Error loading product', err);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.slug]);

  /* ─────────────────────────────────────────────────────────
     DERIVED STATE
  ───────────────────────────────────────────────────────── */
  if (loading || !productData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="mdi:loading" className="animate-spin text-4xl text-primary-500" />
          <p className="text-sm text-gray-400">Loading product…</p>
        </div>
      </div>
    );
  }

  const selectedVariant = variants.find(v => v._id === selectedVariantId) || variants[0] || productData;

  const price = selectedVariant?.discountPrice || selectedVariant?.sellingPrice || selectedVariant?.price || productData.summary?.minSalePrice || productData.summary?.minPrice || 0;
  const oldPrice = selectedVariant?.sellingPrice || selectedVariant?.price || productData.summary?.minPrice || 0;
  const stockCount = selectedVariant?.stock ?? 0;
  const inStock = stockCount > 0;

  const discountPercent = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : null;
  const savings = oldPrice > price ? (oldPrice - price).toFixed(2) : null;

  // Match by productId+variantId
  const isWishlisted = wishlistItems.some(i => {
    const pMatch = (i.productId?._id || i.productId) === productData._id;
    const iVarId = i.variantId?._id || i.variantId || null;
    return pMatch && (iVarId === selectedVariant?._id || !iVarId);
  });

  const isCartAdded = cartItems.some(i => {
    const pMatch = (i.productId?._id || i.productId) === productData?._id;
    const iVarId = i.variantId?._id || i.variantId || null;
    return pMatch && (iVarId === selectedVariant?._id || !iVarId);
  });

  const currentUniqueId = selectedVariant?._id ? `${productData._id}-${selectedVariant._id}` : productData._id;
  const isWishlistLoading = wishlistLoadingIds.includes(currentUniqueId);
  const isCartLoading = cartLoadingIds.includes(currentUniqueId);

  /* ── Build image gallery ── */
  const selectedVariantImages = (selectedVariant?.images || []).map(i => i.url);
  const otherImages = variants
    .filter(v => v._id !== selectedVariantId)
    .flatMap(v => (v.images || []).map(i => i.url));
  let allImages = [...new Set([...selectedVariantImages, ...otherImages])];
  if (!allImages.length) allImages = ['/assets/placeholder.jpg'];

  // Visible thumbnails
  const visibleThumbs = allImages.slice(thumbStart, thumbStart + THUMBS_PER_VIEW);
  const canScrollUp = thumbStart > 0;
  const canScrollDown = thumbStart + THUMBS_PER_VIEW < allImages.length;

  const categoryName = productData.categoryId?.title || '';
  const brandName = productData.brandId?.title || '';

  /* ──────────────────────────────────────────────────────────
     ATTRIBUTE SELECTION LOGIC
  ────────────────────────────────────────────────────────── */
  const attrTypes = Array.from(
    new Set(variants.flatMap(v => (v.attributes || []).map(a => a.name)))
  );

  const attrOptions = {};
  attrTypes.forEach(type => {
    const map = new Map();
    variants.forEach(v => {
      const a = v.attributes?.find(a => a.name === type);
      if (a) {
        const existing = map.get(a.value) || { value: a.value, hex: a.colorHex || null, count: 0 };
        existing.count += 1;
        map.set(a.value, existing);
      }
    });
    attrOptions[type] = Array.from(map.values());
  });

  const handleAttrSelect = (attrName, value) => {
    const isAlreadySelected = selectedAttributes[attrName] === value;
    const next = { ...selectedAttributes };

    if (isAlreadySelected) {
      delete next[attrName];
    } else {
      next[attrName] = value;
    }

    setSelectedAttributes(next);

    if (Object.keys(next).length === 0) {
      const def = variants.find(v => v.isDefault) || variants[0];
      setSelectedVariantId(def?._id || null);
      setSelectedImage(0);
      setThumbStart(0);
      return;
    }

    const match = variants.find(v => {
      return Object.entries(next).every(([k, val]) =>
        v.attributes?.some(a => a.name === k && a.value === val)
      );
    });

    if (match) {
      setSelectedVariantId(match._id);
      setSelectedImage(0);
      setThumbStart(0);
    } else {
      setSelectedVariantId(null);
    }
  };

  const handleAddToCart = () => {
    if (auth?.user && (auth.user._id === productData.sellerId || auth.user.id === productData.sellerId)) {
      toast.error('You cannot add your own product to cart');
      return;
    }
    if (isCartLoading) return;
    dispatch(toggleCart({ product: productData, variantId: selectedVariant?._id, quantity }));
    if (isCartAdded) toast.info(`${productData.title} removed from cart!`);
    else toast.success(`${productData.title} added to cart!`);
  };

  const handleToggleWishlist = () => {
    if (auth?.user && (auth.user._id === productData.sellerId || auth.user.id === productData.sellerId)) {
      toast.error('You cannot add your own product to wishlist');
      return;
    }
    if (isWishlistLoading) return;
    dispatch(toggleWishlistItem({ product: productData, variantId: selectedVariant?._id }));
    if (isWishlisted) toast.info('Removed from wishlist');
    else toast.success('Added to wishlist!');
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    if (auth?.user && (auth.user._id === productData.sellerId || auth.user.id === productData.sellerId)) {
      toast.error('You cannot buy your own product');
      return;
    }
    // Add to cart then go to checkout
    dispatch(toggleCart({ product: productData, variantId: selectedVariant?._id, quantity }));
    router.push('/checkout');
  };

  const handleAddReview = async () => {
    if (!token) { toast.error('Please log in to submit a review'); return; }
    if (!reviewRating) { toast.error('Please select a rating'); return; }
    if (!reviewText.trim()) { toast.error('Please write a comment'); return; }

    try {
      setSubmittingReview(true);
      const formData = new FormData();
      formData.append('rating', reviewRating);
      formData.append('comment', reviewText);
      reviewImages.forEach(file => formData.append('images', file));
      if (reviewVideo) formData.append('video', reviewVideo);

      const { data } = await axiosInstance.post(
        `/e-commerce/products/${params.slug}/reviews`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      if (data.success) {
        toast.success('Review submitted successfully!');
        setReviews([data.data, ...reviews]);
        setReviewText('');
        setReviewRating(0);
        setReviewImages([]);
        setReviewVideo(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (reviewImages.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setReviewImages(prev => [...prev, ...files]);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Video must be less than 50MB');
        return;
      }
      setReviewVideo(file);
    }
  };

  const removeImage = (index) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitEnquiry = async (subject, message) => {
    const sellerId = productData?.sellerId;
    if (!sellerId) { toast.error('Seller information not available'); return; }
    setAskLoading(true);
    try {
      const { data } = await axiosInstance.post(
        '/customer/queries',
        { sellerId, queryType: 'customer', subject, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success('Message sent! The seller will reply shortly.');
        setShowAskModal(false);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send message');
    } finally {
      setAskLoading(false);
    }
  };

  // Rating breakdown
  const totalReviews = reviews.length;
  const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (r.rating) ratingBreakdown[r.rating]++;
  });
  for (let i = 1; i <= 5; i++) {
    ratingBreakdown[i] = totalReviews > 0 ? Math.round((ratingBreakdown[i] / totalReviews) * 100) : 0;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* ── Top Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-8 mb-16">
        {/* LEFT — Image Gallery */}
        <div className="flex lg:col-span-3 gap-3">
          {/* Vertical Thumbnails */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setThumbStart(p => Math.max(0, p - 1))}
              disabled={!canScrollUp}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors disabled:opacity-40"
            >
              <Icon icon="mdi:chevron-up" className="text-lg text-gray-600" />
            </button>

            <div className="flex flex-col gap-2">
              {visibleThumbs.map((img, i) => {
                const realIndex = thumbStart + i;
                return (
                  <button
                    key={realIndex}
                    onClick={() => setSelectedImage(realIndex)}
                    className={`w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all bg-gray-50 ${selectedImage === realIndex
                      ? 'border-primary-500 shadow-md shadow-primary-100'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`thumb-${realIndex}`}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setThumbStart(p => Math.min(allImages.length - THUMBS_PER_VIEW, p + 1))}
              disabled={!canScrollDown}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors disabled:opacity-40"
            >
              <Icon icon="mdi:chevron-down" className="text-lg text-gray-600" />
            </button>
          </div>

          {/* Main Image + Actions */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 aspect-square">
              {discountPercent && (
                <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md pointer-events-none">
                  -{discountPercent}%
                </span>
              )}
              <ImageZoom
                src={allImages[selectedImage] || '/assets/placeholder.jpg'}
                alt={productData?.title || 'Product'}
              />
            </div>

            {/* Add to Cart + Buy Now */}
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${isCartAdded
                  ? 'bg-gray-800 hover:bg-gray-900 text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-200'
                  }`}
              >
                <Icon icon={isCartAdded ? 'mdi:cart-check' : 'mdi:shopping-cart'} className="w-5 h-5" />
                {isCartAdded ? 'Remove' : 'Add to Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <Icon icon="mdi:flash" className="w-5 h-5" />
                Buy Now
              </button>
            </div>

            {/* Share */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Share:</span>
              {[
                { name: 'Facebook', icon: 'mdi:facebook', hover: 'hover:bg-blue-600' },
                { name: 'Instagram', icon: 'mdi:instagram', hover: 'hover:bg-pink-500' },
                { name: 'Twitter', icon: 'mdi:twitter', hover: 'hover:bg-sky-500' },
              ].map(s => (
                <button
                  key={s.name}
                  aria-label={`Share on ${s.name}`}
                  className={`w-8 h-8 rounded-full bg-gray-100 ${s.hover} hover:text-white flex items-center justify-center text-gray-400 transition-all`}
                >
                  <Icon icon={s.icon} className="text-base" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Product Info + Seller */}
        <div className="lg:col-span-5 grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Product Details */}
          <div className="xl:col-span-3 flex flex-col gap-5">
            <div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-extrabold text-gray-900 leading-snug">
                  {productData?.title}
                </h1>
                {/* <button
                  onClick={handleToggleWishlist}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={`flex-shrink-0 w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                    isWishlisted
                      ? 'border-red-400 bg-red-50 text-red-500'
                      : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400 hover:bg-red-50'
                  }`}
                >
                  <Icon icon={isWishlisted ? 'mdi:heart' : 'mdi:heart-outline'} className="w-5 h-5" />
                </button> */}
              </div>
              {productData?.shortDescription && (
                <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
                  {productData.shortDescription}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              {discountPercent && (
                <span className="text-lg font-bold text-primary-500">-{discountPercent}%</span>
              )}
              <span className="text-2xl font-extrabold text-gray-900">${price.toFixed(2)}</span>
              {oldPrice > price && (
                <span className="text-base text-gray-400 line-through">${oldPrice.toFixed(2)}</span>
              )}
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${inStock ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                }`}>
                {inStock ? `✓ In Stock (${stockCount} left)` : '✗ Out of Stock'}
              </span>
            </div>

            {/* Attribute Selectors */}
            {attrTypes.length > 0 && (
              <div className="space-y-4">
                {attrTypes.map(type => {
                  const opts = attrOptions[type] || [];
                  const isColor = type.toLowerCase() === 'color';
                  const currentVal = selectedAttributes[type];

                  return (
                    <div key={type}>
                      <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2.5">
                        {type}
                        {currentVal && (
                          <span className="text-primary-600 normal-case font-bold ml-2">· {currentVal}</span>
                        )}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {opts.map(opt => {
                          const isSelected = currentVal === opt.value;
                          if (isColor) {
                            const hex = opt.hex || '#ccc';
                            const isLight = ['#FFFFFF', '#f5f5f5', '#f0f0f0', '#ffffff'].includes(hex.toLowerCase());
                            return (
                              <button
                                key={opt.value}
                                title={opt.value}
                                onClick={() => handleAttrSelect(type, opt.value)}
                                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                  ? 'border-primary-500 scale-110 shadow-lg shadow-primary-500/25'
                                  : `${isLight ? 'border-gray-300' : 'border-transparent'} hover:scale-105 hover:border-gray-400`
                                  }`}
                                style={{ backgroundColor: hex }}
                              >
                                {isSelected && (
                                  <Icon
                                    icon="mdi:check"
                                    className={`w-4 h-4 ${isLight ? 'text-gray-700' : 'text-white'}`}
                                  />
                                )}
                              </button>
                            );
                          }
                          return (
                            <button
                              key={opt.value}
                              onClick={() => handleAttrSelect(type, opt.value)}
                              className={`px-3.5 py-1.5 rounded-lg border-2 text-sm font-bold transition-all ${isSelected
                                ? 'border-primary-500 bg-primary-500 text-white shadow-md shadow-primary-500/20'
                                : 'border-gray-200 text-gray-700 hover:border-primary-400 hover:bg-primary-50'
                                }`}
                            >
                              {opt.value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Warranty */}
            {productData?.warranty?.type === 'yes' && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 w-fit">
                <Icon icon="mdi:shield-check" className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="text-xs font-bold text-emerald-800">
                  {productData.warranty.months >= 12
                    ? `${Math.floor(productData.warranty.months / 12)} Year${productData.warranty.months >= 24 ? 's' : ''}`
                    : `${productData.warranty.months} Month${productData.warranty.months > 1 ? 's' : ''}`
                  } Warranty Included
                </span>
              </div>
            )}
          </div>

          {/* Seller Card */}
          <div className="xl:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              {/* Header banner */}
              <div
                className="relative h-14"
                style={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}
              >
                {seller?.isApproved && (
                  <span className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    <Icon icon="mdi:check-decagram" className="w-2.5 h-2.5" />
                    VERIFIED
                  </span>
                )}
                <div className="absolute -bottom-5 left-3">
                  {seller?.profilePictureOrLogo ? (
                    <img
                      src={seller.profilePictureOrLogo}
                      alt={seller.businessName}
                      className="w-11 h-11 rounded-xl object-cover"
                      style={{ border: '2.5px solid white' }}
                    />
                  ) : (
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: '2.5px solid white',
                      }}
                    >
                      {(seller?.businessName || 'S').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-8 px-3 pb-3 flex flex-col gap-3">
                {/* Name + address */}
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 leading-tight truncate">
                    {seller?.businessName || 'Unknown Store'}
                  </h3>
                  {seller?.storeAddress && (
                    <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                      <Icon icon="mdi:map-marker-outline" className="w-3 h-3 flex-shrink-0" />
                      {seller.storeAddress}
                    </p>
                  )}
                </div>

                {/* Stats: Rating / Items / Orders */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-gray-50 rounded-lg py-1.5 px-1">
                    <p className="text-xs font-extrabold text-gray-800">
                      {seller?.avgRating ? `${seller.avgRating}★` : '—'}
                    </p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wide">Rating</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg py-1.5 px-1">
                    <p className="text-xs font-extrabold text-gray-800">
                      {seller?.productCount ?? '—'}
                    </p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wide">Items</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg py-1.5 px-1">
                    <p className="text-xs font-extrabold text-gray-800">
                      {seller?.completedOrders ?? '—'}
                    </p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wide">Orders</p>
                  </div>
                </div>

                {/* Top 3 products */}
                {seller?.topProducts?.length > 0 && (
                  <div className="border-t border-gray-100 pt-2.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
                      Top Products
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {seller.topProducts.map(p => (
                        <Link
                          key={p._id}
                          href={`/product/${p.slug}`}
                          className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <p className="text-[11px] text-gray-700 font-medium truncate group-hover:text-primary-600 flex-1">
                            {p.title}
                          </p>
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-500 flex-shrink-0">
                            ★ {p.rating > 0 ? p.rating.toFixed(1) : '—'}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href={seller ? `/store/${seller._id}` : '#'}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs"
                >
                  <Icon icon="mdi:store" className="w-3.5 h-3.5" />
                  Visit Store
                </Link>
                <button
                  onClick={() => {
                    if (!token) { toast.error('Please log in to ask the seller'); return; }
                    setShowAskModal(true);
                  }}
                  className="w-full bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs"
                >
                  <Icon icon="mdi:message-question-outline" className="w-3.5 h-3.5" />
                  Ask Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sequential Content ── */}
      <div className="mb-16 space-y-16 px-8 mt-10">

        {/* Description Section */}
        <div className="max-w-4xl">
          <h2 className="text-lg font-bold text-gray-900 mb-5 border-b border-gray-100 pb-2">Product Information</h2>
          <div
            className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-li:marker:text-primary-500 text-gray-600 leading-relaxed text-[13px]"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(productData?.description || '') }}
          />
        </div>

        {/* Specifications Section */}
        <div className="max-w-4xl">
          <h2 className="text-lg font-bold text-gray-900 mb-5 border-b border-gray-100 pb-2">Specifications</h2>
          <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {[
              brandName && { label: 'Brand', value: brandName },
              { label: 'SKU', value: selectedVariant?.sku || productData.sku },
              { label: 'Category', value: categoryName },
              { label: 'Total Variants', value: variants.length },
              { label: 'Total Stock', value: productData.summary?.totalStock ?? variants.reduce((s, v) => s + (v.stock || 0), 0) },
              {
                label: 'Price Range',
                value: productData.summary?.minPrice === productData.summary?.maxPrice
                  ? `$${productData.summary?.minPrice?.toFixed(2)}`
                  : `$${productData.summary?.minPrice?.toFixed(2)} – $${productData.summary?.maxPrice?.toFixed(2)}`
              },
              productData.warranty?.type === 'yes' && {
                label: 'Warranty',
                value: productData.warranty.months >= 12
                  ? `${Math.floor(productData.warranty.months / 12)} year${productData.warranty.months >= 24 ? 's' : ''}`
                  : `${productData.warranty.months} months`,
              },
              ...(selectedVariant?.attributes || []).map(a => ({ label: a.name, value: a.value })),
              ...(selectedVariant?.specs || []).map(s => ({ label: s.name, value: s.value })),
            ].filter(Boolean).map((row, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                <div className="w-1/3 max-w-[200px] px-5 py-2.5 text-xs font-semibold text-gray-500 border-r border-gray-100 flex-shrink-0">{row.label}</div>
                <div className="px-5 py-2.5 text-xs text-gray-800 font-medium">{row.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Variants Section */}
        <div className="max-w-6xl">
          <h2 className="text-lg font-bold text-gray-900 mb-5 border-b border-gray-100 pb-2">Available Variants</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {variants.map(v => {
              const vPrice = v.discountPrice || v.price || 0;
              const vOldPrice = v.price || 0;
              const isActive = v._id === selectedVariantId;
              return (
                <button
                  key={v._id}
                  type="button"
                  onClick={() => {
                    setSelectedVariantId(v._id);
                    setSelectedImage(0);
                    setThumbStart(0);
                    const attrs = {};
                    (v.attributes || []).forEach(a => { attrs[a.name] = a.value; });
                    setSelectedAttributes(attrs);
                  }}
                  className={`text-left p-3 rounded-2xl border transition-all ${isActive ? 'border-primary-500 bg-primary-50/30 shadow-md shadow-primary-500/10' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                >
                  <div className="flex items-start gap-2.5 mb-2.5">
                    {v.images?.[0]?.url ? (
                      <img src={v.images[0].url} className="w-10 h-10 rounded-xl object-cover border border-gray-100" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Icon icon="mdi:image-off" className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-gray-800 truncate">{v.title || 'Default Variant'}</p>
                      {v.isDefault && (
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded uppercase mt-0.5 inline-block">
                          Default
                        </span>
                      )}
                    </div>
                    {isActive && (
                      <Icon icon="mdi:check-circle" className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(v.attributes || []).map(a => (
                      <span key={a.name} className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-lg font-medium">
                        {a.name.toLowerCase() === 'color' ? (
                          <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: a.colorHex || '#ccc' }} />
                        ) : null}
                        {a.value}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-sm text-primary-600">${vPrice.toFixed(2)}</span>
                      {vOldPrice > vPrice && (
                        <span className="text-[10px] text-gray-400 line-through ml-1">${vOldPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${v.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                      {v.stock > 0 ? `${v.stock} left` : 'Out of stock'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Static Platform Sections */}
        <div className="max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:shield-check" className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary-900 mb-1.5">
                Platform Guarantee & Buyer Protection
              </h3>
              <p className="text-xs text-primary-800/80 leading-relaxed">
                We stand behind every transaction on our platform. With our secure escrow system, your payment is protected and is only released to the seller once you receive the product exactly as described. Shop with confidence knowing our 24/7 support team is here to assist you with any disputes or issues.
              </p>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:refresh-circle" className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900 mb-1.5">
                Easy Returns & Refund Policy
              </h3>
              <p className="text-xs text-emerald-800/80 leading-relaxed">
                Not satisfied with your purchase? You can return eligible items within 7 days of delivery for a full refund or exchange. We provide hassle-free return shipping labels and process refunds swiftly back to your original payment method. Terms and conditions apply.
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-6xl">
          <h2 className="text-lg font-bold text-gray-900 mb-5 border-b border-gray-100 pb-2">Ratings & Reviews</h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Overall Rating</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-4xl font-extrabold text-gray-900">{productData.ratings?.average?.toFixed(1) || '0.0'}</div>
                    <StarRating rating={productData.ratings?.average || 0} size="sm" />
                    <div className="text-[10px] text-gray-400 mt-0.5">({reviews.length} reviews)</div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map(star => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 w-2">{star}</span>
                        <span className="text-yellow-400 text-[10px]">★</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-1 overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${ratingBreakdown[star]}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400 w-6">{ratingBreakdown[star]}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h4 className="text-xs font-bold text-gray-800 mb-1">Write a Review</h4>
                <p className="text-gray-400 text-[10px] mb-3">Share your experience with other customers</p>
                <div className="mb-2.5">
                  <p className="text-[11px] text-gray-600 mb-1">Your Rating</p>
                  <StarRating rating={reviewRating} size="md" interactive onChange={setReviewRating} />
                </div>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Write your review…"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-gray-700 resize-none focus:outline-none focus:border-primary-400 transition-colors mb-2"
                />

                <div className="flex items-center gap-3 mb-3">
                  <label className="cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 hover:text-primary-500 transition-colors bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-primary-200">
                    <Icon icon="mdi:camera-outline" className="w-4 h-4" />
                    Add Photos
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <label className="cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 hover:text-primary-500 transition-colors bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-primary-200">
                    <Icon icon="mdi:video-outline" className="w-4 h-4" />
                    Add Video
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                  </label>
                </div>

                {reviewImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {reviewImages.map((file, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded-lg border border-gray-200 overflow-hidden">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                        >
                          <Icon icon="mdi:close" className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {reviewVideo && (
                  <div className="flex items-center gap-2 mb-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <Icon icon="mdi:video" className="w-4 h-4 text-gray-500" />
                    <span className="text-[10px] text-gray-600 truncate flex-1">{reviewVideo.name}</span>
                    <button onClick={() => setReviewVideo(null)}>
                      <Icon icon="mdi:close" className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                )}
                <button
                  onClick={handleAddReview}
                  disabled={submittingReview || !reviewText.trim()}
                  className="mt-2.5 w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 rounded-xl text-xs transition-colors disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-3">
              {reviews.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-500 text-xs">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                reviews.map(r => <ReviewCard key={r._id} review={r} />)
              )}
            </div>
          </div>

        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 pt-10 border-t border-gray-100 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Similar Products You Might Like</h2>
              <Link href={`/product?category=${productData.category?._id || productData.category}`} className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                View All Similar →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map(rp => (
                <ProductCard key={rp._id} product={rp} />
              ))}
            </div>
          </div>
        )}

        {/* Delivery Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-10 border-t border-gray-100">
          {[
            { icon: '/assets/product/icons/1.png', label: 'Seasonal Sales', sub: 'Exclusive seasonal offers on selected items.' },
            { icon: '/assets/product/icons/2.png', label: 'Money Back Guarantee', sub: 'Love it or return it within 7 days — no questions asked.' },
            { icon: '/assets/product/icons/3.png', label: 'Free Shipping', sub: 'On all orders within 7 days delivery.' },
          ].map(d => (
            <div key={d.label} className="rounded-2xl p-6 text-center bg-gray-50/50 border border-gray-100 hover:shadow-md transition-shadow">
              <Image src={d.icon} alt={d.label} width={48} height={48} className="mx-auto mb-3" />
              <p className="font-bold text-gray-800 text-sm">{d.label}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{d.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {showAskModal && (
        <AskSellerModal
          onClose={() => setShowAskModal(false)}
          onSubmit={handleSubmitEnquiry}
          loading={askLoading}
          sellerName={seller?.businessName || seller?.name || 'Seller'}
          productTitle={productData?.title || ''}
        />
      )}
    </div>
  );
}