'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { toggleCart } from '@/store/cart';
import { toggleWishlistItem } from '@/store/wishlist';
import { useParams } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';

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
          <span key={i}
            className={`cursor-${interactive ? 'pointer' : 'default'} ${filled ? 'text-yellow-400' : half ? 'text-yellow-300' : 'text-gray-200'}`}
            onMouseEnter={() => interactive && setHovered(i)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onChange?.(i)}>
            ★
          </span>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   IMAGE ZOOM
────────────────────────────────────────────────────────── */
function ImageZoom({ src, alt }) {
  const containerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const ZOOM_FACTOR = 2.5;
  const LENS_SIZE = 130;

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPosition({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
    const lensX = Math.max(LENS_SIZE / 2, Math.min(rect.width - LENS_SIZE / 2, x)) - LENS_SIZE / 2;
    const lensY = Math.max(LENS_SIZE / 2, Math.min(rect.height - LENS_SIZE / 2, y)) - LENS_SIZE / 2;
    setLensPos({ x: lensX, y: lensY });
  }, []);

  return (
    <div className="relative">
      <div ref={containerRef}
        className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 cursor-crosshair select-none"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}>
        <img src={src} alt={alt} className="w-full h-full object-contain p-4" draggable={false} />
        {isHovering && (
          <div className="absolute border-2 border-blue-400 bg-blue-50/30 pointer-events-none"
            style={{ width: LENS_SIZE, height: LENS_SIZE, left: lensPos.x, top: lensPos.y }} />
        )}
      </div>
      {isHovering && (
        <div className="absolute left-[calc(100%+16px)] top-0 w-[400px] h-[400px] rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-2xl z-50 pointer-events-none hidden lg:block">
          <div className="w-full h-full" style={{
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${ZOOM_FACTOR * 100}%`,
            backgroundPosition: `${position.x}% ${position.y}%`,
          }} />
        </div>
      )}
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
      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
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
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  /* ── Per-attribute selection for multi-attribute variants ── */
  const [selectedAttributes, setSelectedAttributes] = useState({});

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
          setProductData(res.data.product);
          console.log('Product API Response:', res.data);
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
        }
        if (revRes.success) setReviews(revRes.data);
      } catch (err) {
        console.error('Error loading product', err);
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
  const selectedVariant = variants.find(v => v._id === selectedVariantId) || variants[0];

  const price = selectedVariant?.discountPrice || selectedVariant?.sellingPrice || selectedVariant?.price || productData.summary?.minSalePrice || productData.summary?.minPrice || 0;
  const oldPrice = selectedVariant?.sellingPrice || selectedVariant?.price || productData.summary?.minPrice || 0;
  const stockCount = selectedVariant?.stock ?? 0;
  const inStock = stockCount > 0;

  const discountPercent = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : null;
  const savings = oldPrice > price ? (oldPrice - price).toFixed(2) : null;

  // Match by productId+variantId, OR just productId if no variant was stored (e.g. wishlisted from listing page)
  const isWishlisted = wishlistItems.some(i => {
    const pMatch = (i.productId?._id || i.productId) === productData._id;
    const iVarId = i.variantId?._id || i.variantId || null;
    return pMatch && (iVarId === selectedVariant?._id || iVarId === null);
  });
  const isCartAdded = cartItems.some(i => {
    const pMatch = (i.productId?._id || i.productId) === productData?._id;
    const iVarId = i.variantId?._id || i.variantId || null;
    return pMatch && (iVarId === selectedVariant?._id || iVarId === null);
  });

  const currentUniqueId = selectedVariant?._id ? `${productData._id}-${selectedVariant._id}` : productData._id;
  const isWishlistLoading = wishlistLoadingIds.includes(currentUniqueId);
  const isCartLoading = cartLoadingIds.includes(currentUniqueId);

  if (!productData) return null;
  /* ── Build image gallery:
     First show images of selected variant, then the rest ── */
  const selectedVariantImages = (selectedVariant?.images || []).map(i => i.url);
  const otherImages = variants
    .filter(v => v._id !== selectedVariantId)
    .flatMap(v => (v.images || []).map(i => i.url));
  const allImages = [...new Set([...selectedVariantImages, ...otherImages])];
  if (!allImages.length) allImages.push('/assets/placeholder.jpg');

  const categoryName = productData.categoryId?.title || '';
  const brandName = productData.brandId?.title || '';

  /* ──────────────────────────────────────────────────────────
     ATTRIBUTE SELECTION LOGIC
     Builds dimension pickers from all variant attributes.
  ────────────────────────────────────────────────────────── */
  // Collect all unique attribute types across variants
  const attrTypes = Array.from(
    new Set(variants.flatMap(v => (v.attributes || []).map(a => a.name)))
  );

  // For each attribute type, collect all unique values across variants
  const attrOptions = {}; // { Color: [{value, hex, variantCount}], Size: [{value}], ... }
  attrTypes.forEach(type => {
    const map = new Map(); // value → { value, hex, count }
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

  /* When a user selects an attribute value, find the best matching variant */
  const handleAttrSelect = (attrName, value) => {
    const next = { ...selectedAttributes, [attrName]: value };
    setSelectedAttributes(next);

    // Find variant that matches all currently selected attributes
    const match = variants.find(v => {
      return Object.entries(next).every(([k, val]) =>
        v.attributes?.some(a => a.name === k && a.value === val)
      );
    });
    if (match) {
      setSelectedVariantId(match._id);
      setSelectedImage(0); // Reset to first image of new variant
    }
  };

  const handleAddToCart = () => {
    if (auth?.user && (auth.user._id === productData.sellerId || auth.user.id === productData.sellerId)) {
      toast.error('You cannot add your own product to cart');
      return;
    }
    if (isCartLoading) return; // guard against spam only
    dispatch(toggleCart({ product: productData, variantId: selectedVariant?._id, quantity }));
    if (isCartAdded) toast.info(`${productData.title} removed from cart!`);
    else toast.success(`${productData.title} added to cart!`);
  };

  const handleToggleWishlist = () => {
    if (auth?.user && (auth.user._id === productData.sellerId || auth.user.id === productData.sellerId)) {
      toast.error('You cannot add your own product to wishlist');
      return;
    }
    if (isWishlistLoading) return; // guard against spam only
    dispatch(toggleWishlistItem({ product: productData, variantId: selectedVariant?._id }));
    if (isWishlisted) toast.info('Removed from wishlist');
    else toast.success('Added to wishlist!');
  };

  const handleAddReview = async () => {
    if (!token) { toast.error('Please log in to submit a review'); return; }
    if (!reviewRating) { toast.error('Please select a rating'); return; }
    try {
      setSubmittingReview(true);
      const { data } = await axiosInstance.post(
        `/e-commerce/products/${params.slug}/reviews`,
        { rating: reviewRating, comment: reviewText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success('Review submitted!');
        setReviews([data.data, ...reviews]);
        setReviewText(''); setReviewRating(0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Rating breakdown
  const totalReviews = reviews.length;
  const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { if (r.rating) ratingBreakdown[r.rating]++; });
  for (let i = 1; i <= 5; i++) {
    ratingBreakdown[i] = totalReviews > 0 ? Math.round((ratingBreakdown[i] / totalReviews) * 100) : 0;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8 flex-wrap">
        <a href="/" className="hover:text-primary-500 transition-colors">Home</a>
        <Icon icon="mdi:chevron-right" className="w-4 h-4" />
        <a href="/product" className="hover:text-primary-500 transition-colors">Products</a>
        {categoryName && <>
          <Icon icon="mdi:chevron-right" className="w-4 h-4" />
          <span className="hover:text-primary-500 cursor-pointer">{categoryName}</span>
        </>}
        <Icon icon="mdi:chevron-right" className="w-4 h-4" />
        <span className="text-gray-700 font-medium truncate max-w-[200px]">{productData.title}</span>
      </nav>

      {/* ── Top Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-10 mb-16">

        {/* LEFT — Image Gallery */}
        <div className="flex col-span-3 gap-3">
          {/* Thumbnails — vertical, scrollable */}
       <div className="flex flex-col items-center gap-2 flex-shrink-0">

  {/* UP BUTTON (same size as image) */}
  <button
    onClick={() =>
      setSelectedImage((prev) =>
        prev > 0 ? prev - 1 : prev
      )
    }
    className="w-14 h-14 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200"
  >
   <Icon icon="mdi:arrow-up" className="text-lg" /> 
  </button>

  {/* 5 VISIBLE THUMBNAILS */}
  <div className="flex flex-col gap-2">
    {allImages
      .slice(
        Math.max(0, selectedImage - 2),
        Math.max(5, selectedImage + 3)
      )
      .slice(0, 5)
      .map((img, i) => {
        const realIndex =
          Math.max(0, selectedImage - 2) + i;

        return (
          <button
            key={realIndex}
            onClick={() => setSelectedImage(realIndex)}
            className={`w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all bg-gray-50 ${
              selectedImage === realIndex
                ? "border-primary-500 shadow-md shadow-primary-100"
                : "border-gray-100 hover:border-gray-300"
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

  {/* DOWN BUTTON (same size as image) */}
  <button
    onClick={() =>
      setSelectedImage((prev) =>
        prev < allImages.length - 1 ? prev + 1 : prev
      )
    }
    className="w-14 h-14 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200"
  >
   <Icon icon="mdi:arrow-down" className="text-lg" />
  </button>
</div>

          {/* Main image */}
          <div className="flex-1">

          <div className=" relative min-w-0">
            {discountPercent && (
              <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                -{discountPercent}%
              </span>
            )}
            <ImageZoom src={allImages[selectedImage] || '/assets/placeholder.jpg'} alt={productData.title} />
          </div>
            {/* Quantity + Actions */}
            <div className="flex  items-center gap-3 flex-wrap mt-5">
              {/* Qty */}
          

              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 ${isCartAdded
                  ? 'bg-gray-800 text-white flex-wrap text-wrap hover:bg-gray-900'
                  : 'bg-primary-500 flex-wrap text-wrap hover:bg-primary-600 text-white shadow-primary-200'
                  } font-bold py-3 px-3 rounded-xl flex-wrap text-wrap transition-all shadow-lg text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50`}
              >
                <Icon icon={isCartAdded ? 'mdi:cart-check' : 'mdi:shopping-cart'} className="w-5 h-5" />
                {isCartAdded ? 'Remove from Cart' : 'Add to Cart'}
              </button>

              <button onClick={() => {
                if (auth?.user && (auth.user._id === productData.sellerId || auth.user.id === productData.sellerId)) {
                  toast.error('You cannot buy your own product');
                  return;
                }
                const params = new URLSearchParams();
                params.append('buyNow', 'true');
                params.append('slug', productData.slug);
                if (selectedVariant?._id) params.append('variantId', selectedVariant._id);
                params.append('quantity', quantity);
                router.push(`/checkout?${params.toString()}`);
              }} disabled={!inStock}
                className="flex-1 bg-gray-900 hover:bg-gray-800 active:scale-95 text-white font-bold py-3 px-6 rounded-xl transition-all text-sm disabled:opacity-50">
                Buy Now
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all text-xl ${isWishlisted
                  ? 'border-red-400 bg-red-50 text-red-500 hover:bg-red-100'
                  : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400 bg-white'
                  }`}
              >
                <Icon
                  icon={isWishlisted ? 'mdi:heart' : 'mdi:heart-outline'}
                  className={`w-5 h-5 transition-transform ${isWishlisted ? 'scale-110' : 'scale-100'}`}
                />
              </button>
            </div>
                      </div>

        </div>

        {/* RIGHT — Product Info */}
        <div className="col-span-5 flex flex-row">

          <div className="flex flex-col px-1 gap-5 w-fit">

            {/* Brand + Title */}
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 mt-1 leading-tight">{productData.title}</h1>
              <p className="text-gray-600 text-sm w-fit ">{productData.shortDescription}</p>
            </div>

            <div className="flex flex-wrap p-1 shadow-md gap-2 border-gray-400 border w-fit">
              <div className='bg-green-600   rounded-lg w-fit px-3 py-1 flex justify-center items-center text-white font-semibold'>4.3 <Icon icon="mdi:star" className="w-4 h-4 text-yellow-400" /></div>
              <div className=' flex justify-center items-center text-gray-700  font-normal'>33 reviews</div>

            </div>

            <div className="flex rounded-2xl gap-2 ">
              {discountPercent && (
                <span className="text-3xl text-primary-500 font-bold rounded-full">-{discountPercent}%</span>
              )}
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-extrabold text-gray-800">${price.toFixed(2)}</span>
                {oldPrice > price && (
                  <span className="text-lg text-gray-400 line-through">${oldPrice.toFixed(2)}</span>
                )}
  <span className={`ml-2 w-fit text-xs font-semibold px-2.5 py-1 rounded-full ${inStock ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                {inStock ? `✓ In Stock (${stockCount} left)` : '✗ Out of Stock'}
              </span>
              </div>

            </div>

            <div className="flex items-center gap-3 flex-wrap text-white -mt-4 bg-black w-[27%] rounded-2xl px-2 py-1 justify-center">
              {savings && (
                <p className=" text-sm font-semibold">You save  <span className="font-bold text-yellow-500">${savings}</span></p>
              )}
            </div>
            {/* Ratings + Stock */}
           
 
            {/* Qty */}
    <div className={`flex items-center border rounded-xl  w-fit overflow-hidden ${inStock ? 'border-gray-200' : 'border-gray-100 opacity-50'}`}>
                <button disabled={!inStock || quantity <= 1}
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors disabled:opacity-50">
                  −
                </button>
                <span className="px-4 py-2.5 font-semibold text-gray-800 min-w-[3rem] text-center">
                  {inStock ? quantity : 0}
                </span>
                <button disabled={!inStock || quantity >= stockCount}
                  onClick={() => setQuantity(q => Math.min(stockCount, q + 1))}
                  className="px-4 py-2.5 text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors disabled:opacity-50">
                  +
                </button>
              </div>


            {/* ── Attribute Selectors ── */}
            {attrTypes.map(type => {
              const opts = attrOptions[type] || [];
              const isColor = type.toLowerCase() === 'color';
              const currentVal = selectedAttributes[type];
              return (
                <div key={type}>
                  <p className="text-sm font-bold text-gray-700 mb-2.5">
                    {type}:{' '}
                    <span className="text-gray-500 font-normal">{currentVal || 'Select'}</span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {opts.map(opt => {
                      const isSelected = currentVal === opt.value;
                      if (isColor) {
                        // Color swatch — use hex from variant attribute
                        const hex = opt.hex || '#ccc';
                        const isLight = hex === '#FFFFFF' || hex === '#f5f5f5' || hex === '#f0f0f0';
                        return (
                          <button key={opt.value} title={opt.value}
                            onClick={() => handleAttrSelect(type, opt.value)}
                            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                              ? 'border-primary-500 scale-110 shadow-lg shadow-primary-500/20'
                              : `${isLight ? 'border-gray-300' : 'border-transparent'} hover:scale-105 hover:border-gray-400`
                              }`}
                            style={{ backgroundColor: hex }}>
                            {isSelected && (
                              <Icon icon="mdi:check" className={`w-4 h-4 ${isLight ? 'text-gray-700' : 'text-white'}`} />
                            )}
                          </button>
                        );
                      }
                      return (
                        <button key={opt.value}
                          onClick={() => handleAttrSelect(type, opt.value)}
                          className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${isSelected
                            ? 'border-primary-500 bg-primary-500 text-white shadow-md shadow-primary-500/20'
                            : 'border-gray-200 text-gray-700 hover:border-primary-400 hover:bg-primary-50'
                            }`}>
                          {opt.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          

            {/* Share */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500 font-medium">Share:</span>
              {[
                { name: 'Facebook', icon: 'mdi:facebook' },
                { name: 'Instagram', icon: 'mdi:instagram' },
                { name: 'Twitter', icon: 'mdi:twitter' },
              ].map(s => (
                <button key={s.name} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-primary-100 hover:text-primary-500 flex items-center justify-center text-gray-500 transition-colors">
                  <Icon icon={s.icon} className="text-lg" />
                </button>
              ))}
            </div>
          </div>

          {/* Store */}
          <div>
            {/* Seller Information Section */}
            <div className=" space-y-4">

              {/* Shipping Campaign Banner */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon icon="mdi:gift" className="text-blue-600 text-2xl" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Free Shipping on Orders Over $350</p>
                  <p className="text-xs text-gray-500">(Seller Pays)</p>
                </div>
             
              </div>

              {/* Seller Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="bg-blue-50 w-full p-3 rounded-xl flex items-start  flex-col">
                    <div className="flex items-center gap-2 ">
                      <h3 className="font-bold text-lg">Panda Import</h3>
                      <div className="bg-green-600 text-white text-sm font-semibold px-2.5 py-0.5 rounded">
                        9.4 
                      </div>
                      {/* <span><Icon icon="mdi:info" className="text-blue-400 cursor-pointer" /></span> */}
                    </div>
                    <div className="flex items-center gap-2 mt-1 border-green-600 border rounded-full ">
                      <span className="bg-green-500 text-white text-xs font-medium py-1 px-1 rounded-full flex items-center gap-1">
                        <Icon icon="mdi:verified" className="text-lg bg-green-500 rounded-full" />
                      </span>
                      <span className="text-sm pr-3 text-gray-700 font-semibold">Verified Seller</span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 bg-green-100 text-green-600 rounded flex items-center justify-center">
                      <Icon icon="mdi:check-circle" className="text-lg" />
                    </div>
                    <span className="font-medium">Following</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition">
                    <div className="w-5 h-5 bg-gray-100 text-gray-600 rounded flex items-center justify-center">
                      <Icon icon="mdi:chat-question" className="text-lg" />
                    </div>
                    <span className="font-medium">Seller Questions (68)</span>
                    <span className="ml-auto text-gray-400">
                      <Icon icon="mdi:chevron-right" />
                    </span>
                  </div>
                </div>

                {/* Store Button */}
                <button className="mt-6 w-full bg-gray-900 hover:bg-black text-white font-semibold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2">
                  GO TO STORE
                  <Icon icon="mdi:arrow-right" className="text-lg" />
                </button>
              </div>
            </div>
          </div>

        </div>


      </div>

      {/* ── Tabs ── */}
      <div className="mb-16">
        <div className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto">
          {[
            { id: 'description', label: 'Description' },
            { id: 'specs', label: 'Specifications' },
            { id: 'variants', label: `All Variants (${variants.length})` },
            { id: 'reviews', label: `Reviews (${reviews.length})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="max-w-3xl">
            <p className="text-gray-600 leading-relaxed text-base whitespace-pre-wrap">
              {productData.description || 'No description available.'}
            </p>
          </div>
        )}

        {/* Specs Tab */}
        {activeTab === 'specs' && (
          <div className="max-w-2xl">
            <div className="rounded-2xl border border-gray-100 overflow-hidden">
              {[
                brandName && { label: 'Brand', value: brandName },
                { label: 'SKU', value: selectedVariant?.sku || productData.sku },
                { label: 'Category', value: categoryName },
                { label: 'Total Variants', value: variants.length },
                { label: 'Total Stock', value: productData.summary?.totalStock ?? variants.reduce((s, v) => s + (v.stock || 0), 0) },
                {
                  label: 'Price Range', value: productData.summary?.minPrice === productData.summary?.maxPrice
                    ? `$${productData.summary?.minPrice?.toFixed(2)}`
                    : `$${productData.summary?.minPrice?.toFixed(2)} – $${productData.summary?.maxPrice?.toFixed(2)}`
                },
                ...(selectedVariant?.attributes || []).map(a => ({ label: a.name, value: a.value })),
              ].filter(Boolean).map((row, i) => (
                <div key={row.label} className={`flex ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="w-44 px-5 py-3.5 text-sm font-semibold text-gray-500 border-r border-gray-100 flex-shrink-0">{row.label}</div>
                  <div className="px-5 py-3.5 text-sm text-gray-800 font-medium">{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Variants Tab */}
        {activeTab === 'variants' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              This product has <strong>{variants.length}</strong> variant{variants.length !== 1 ? 's' : ''}.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {variants.map(v => {
                const vPrice = v.discountPrice || v.price || 0;
                const vOldPrice = v.price || 0;
                const isActive = v._id === selectedVariantId;
                return (
                  <button key={v._id} type="button"
                    onClick={() => {
                      setSelectedVariantId(v._id);
                      setSelectedImage(0);
                      const attrs = {};
                      (v.attributes || []).forEach(a => { attrs[a.name] = a.value; });
                      setSelectedAttributes(attrs);
                    }}
                    className={`text-left p-4 rounded-2xl border-2 transition-all ${isActive ? 'border-primary-500 bg-primary-50/30 shadow-md shadow-primary-500/10' : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
                    <div className="flex items-start gap-3 mb-3">
                      {v.images?.[0]?.url ? (
                        <img src={v.images[0].url} className="w-12 h-12 rounded-xl object-cover border border-gray-100" alt="" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                          <Icon icon="mdi:image-off" className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-800 truncate">{v.title || 'Default Variant'}</p>
                        {v.isDefault && (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">
                            Default
                          </span>
                        )}
                      </div>
                      {isActive && (
                        <Icon icon="mdi:check-circle" className="w-5 h-5 text-primary-500 flex-shrink-0" />
                      )}
                    </div>
                    {/* Attributes */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(v.attributes || []).map(a => (
                        <span key={a.name} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-medium">
                          {a.name === 'Color' || a.name === 'color' ? (
                            <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: a.colorHex || '#ccc' }} />
                          ) : null}
                          {a.value}
                        </span>
                      ))}
                    </div>
                    {/* Price + Stock */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-black text-primary-600">${vPrice.toFixed(2)}</span>
                        {vOldPrice > vPrice && (
                          <span className="text-xs text-gray-400 line-through ml-1">${vOldPrice.toFixed(2)}</span>
                        )}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                        {v.stock > 0 ? `${v.stock} left` : 'Out of stock'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2 space-y-6">
              {/* Rating summary */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Ratings & <span className="text-primary-500">Reviews</span></h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-extrabold text-gray-900">{productData.ratings?.average?.toFixed(1) || '0.0'}</div>
                    <StarRating rating={productData.ratings?.average || 0} size="md" />
                    <div className="text-xs text-gray-400 mt-1">({reviews.length} reviews)</div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map(star => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-2">{star}</span>
                        <span className="text-yellow-400 text-xs">★</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${ratingBreakdown[star]}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8">{ratingBreakdown[star]}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Write review */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-1">Write a Review</h4>
                <p className="text-gray-400 text-xs mb-4">Share your experience with other customers</p>
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1.5">Your Rating</p>
                  <StarRating rating={reviewRating} size="lg" interactive onChange={setReviewRating} />
                </div>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
                  placeholder="Write your review…" rows={4}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 resize-none focus:outline-none focus:border-primary-400 transition-colors mt-2"
                />
                <button onClick={handleAddReview} disabled={submittingReview}
                  className="mt-3 w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                reviews.map(r => <ReviewCard key={r._id} review={r} />)
              )}
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
    </div>
  );
}