import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link, useRouter } from '@/i18n/navigation';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { toggleCart, addToCart } from '@/store/cart';
import { toggleWishlistItem } from '@/store/wishlist';
import axiosInstance from '@/config/axiosInstance';
import DOMPurify from 'isomorphic-dompurify';
import ProductCard from '@/components/website/product/productCard';
import { useSocket } from '@/contexts/SocketProvider';

import StarRating from '../StarRating';
import ImageZoom from '../ImageZoom';
import ReviewCard from '../ReviewCard';
import PlatformGuarantees from '../PlatformGuarantees';
import Breadcrumbs from '../Breadcrumbs';

export default function EcomProductDetail({ params }) {
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
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewVideo, setReviewVideo] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [showAskModal, setShowAskModal] = useState(false);
  const [askLoading, setAskLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const { socket } = useSocket() || {};
  const [isSellerOnline, setIsSellerOnline] = useState(false);

  // Sync initial online status
  useEffect(() => {
    if (seller?.isOnline !== undefined) {
      setIsSellerOnline(seller.isOnline);
    }
  }, [seller]);

  // Listen for real-time status changes
  useEffect(() => {
    if (!socket || !seller?.ownerId) return;

    const handleStatusChanged = (data) => {
      if (data.userId === seller.ownerId.toString()) {
        setIsSellerOnline(data.status === 'online');
      }
    };

    socket.on('user_status_changed', handleStatusChanged);
    return () => socket.off('user_status_changed', handleStatusChanged);
  }, [socket, seller]);

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
  const currentUserId = auth?.user?._id || auth?.user?.id || null;

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
          const catId = prod.categoryId?._id || prod.categoryId || prod.category?._id || prod.category;
          if (catId) {
            try {
              const rel = await axiosInstance.get(`/e-commerce/products?categoryIds=${catId}&limit=5`);
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
    if (!token) { toast.error('Please log in to purchase'); router.push('/auth/login'); return; }
    if (auth?.user && (auth.user._id === productData.sellerId || auth.user.id === productData.sellerId)) {
      toast.error('You cannot buy your own product');
      return;
    }
    if (!isCartAdded) {
      dispatch(addToCart({ product: productData, variantId: selectedVariant?._id, quantity }));
    }
    router.push('/checkout');
  };

  const handleAskSubmit = async (subject, message) => {
    if (!token) { toast.error('Please log in to send a message'); router.push('/auth/login'); return; }
    const sellerId = seller?.ownerId || seller?._id || productData?.sellerId;
    if (!sellerId) { toast.error('Seller details not found'); return; }
    setAskLoading(true);
    try {
      const { data } = await axiosInstance.post(
        '/customer/queries',
        { sellerId, queryType: 'customer', subject, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Your message has been sent to the seller!");
        setShowAskModal(false);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send message');
    } finally {
      setAskLoading(false);
    }
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const images = files.filter(f => f.type.startsWith('image/'));
    const videos = files.filter(f => f.type.startsWith('video/'));

    if (images.length > 0) {
      if (reviewImages.length + images.length > 5) {
        toast.error('Maximum 5 images allowed');
        return;
      }
      setReviewImages(prev => [...prev, ...images]);
    }

    if (videos.length > 0) {
      const file = videos[0];
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Video must be less than 50MB');
        return;
      }
      setReviewVideo(file);
    }
  };

  const handleAddReview = async () => {
    if (!token) { toast.error('Please log in to submit a review'); return; }
    if (!reviewRating) {
      toast.error('Please select a rating (stars)');
      return;
    }

    try {
      setSubmittingReview(true);
      const formData = new FormData();
      if (reviewRating) formData.append('rating', reviewRating);
      if (reviewText.trim()) formData.append('comment', reviewText);
      reviewImages.forEach(file => formData.append('images', file));
      if (reviewVideo) formData.append('video', reviewVideo);

      const { data } = await axiosInstance.post(
        `/e-commerce/products/${params.slug}/reviews`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
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

  const handleDeleteReview = async (reviewId) => {
    if (!token) return;
    setDeletingReviewId(reviewId);
    try {
      const { data } = await axiosInstance.delete(
        `/e-commerce/products/${params.slug}/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setReviews(prev => prev.filter(r => r._id !== reviewId));
        toast.success('Review deleted');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleUpdateReview = async ({ rating, comment, removeImages, removeVideo, newImages, newVideo }) => {
    if (!token || !editingReview) return;
    try {
      setSubmittingReview(true);
      const formData = new FormData();
      if (rating) formData.append('rating', rating);
      if (comment !== undefined) formData.append('comment', comment);
      if (removeVideo) formData.append('removeVideo', 'true');
      if (removeImages?.length) removeImages.forEach(url => formData.append('removeImages', url));
      if (newImages?.length) newImages.forEach(f => formData.append('images', f));
      if (newVideo) formData.append('video', newVideo);

      const { data } = await axiosInstance.patch(
        `/e-commerce/products/${params.slug}/reviews/${editingReview._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      if (data.success) {
        setReviews(prev => prev.map(r => r._id === editingReview._id ? data.data : r));
        setEditingReview(null);
        toast.success('Review updated');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitEnquiry = async (subject, message) => {
    const sellerId = productData?.sellerId;
    if (!sellerId) { toast.error('Seller information not available'); return; }
    setAskLoading(true);
    try {
      const { data } = await axiosInstance.post(
        `/customer/hire-repairman`,
        { sellerId, subject, message, productId: productData._id, hiringType: 'seller-enquiry' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success('Your enquiry was sent successfully!');
        setShowAskModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send enquiry');
    } finally {
      setAskLoading(false);
    }
  };

  // Rating breakdown
  const totalReviews = reviews.length;
  const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { if (r.rating) ratingBreakdown[r.rating]++; });
  for (let i = 1; i <= 5; i++) {
    ratingBreakdown[i] = totalReviews > 0 ? Math.round((ratingBreakdown[i] / totalReviews) * 100) : 0;
  }

  const userReview = currentUserId ? reviews.find(r => (r.userId?._id || r.userId)?.toString() === currentUserId.toString()) : null;

  return (
    <div className="max-w-7xl mx-auto px-10 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Store', href: '/product' }, { label: productData.title }]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-12">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gallery */}
            <div className="flex gap-3">
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
                        className={`w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all bg-gray-50 ${selectedImage === realIndex ? 'border-primary-500 shadow-md shadow-primary-100' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <img src={img} alt={`thumb-${realIndex}`} className="w-full h-full object-contain p-1" />
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

              <div className="flex-1 flex flex-col gap-3">
                <div className="relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 aspect-square">
                  {discountPercent && (
                    <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md pointer-events-none">
                      -{discountPercent}%
                    </span>
                  )}
                  <ImageZoom src={allImages[selectedImage] || '/assets/placeholder.jpg'} alt={productData.title} />
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-2xl font-extrabold text-gray-900 leading-snug">
                    {productData?.title}
                  </h1>
                  <button
                    onClick={handleToggleWishlist}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    className={`flex-shrink-0 w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${isWishlisted ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400 hover:bg-red-50'}`}
                  >
                    <Icon icon={isWishlisted ? 'mdi:heart' : 'mdi:heart-outline'} className="w-5 h-5" />
                  </button>
                </div>
                {productData?.shortDescription && (
                  <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
                    {productData.shortDescription}
                  </p>
                )}
              </div>

              <div className="flex items-baseline gap-3 flex-wrap">
                {discountPercent && (
                  <span className="text-lg font-bold text-primary-500">-{discountPercent}%</span>
                )}
                <span className="text-2xl font-extrabold text-gray-900">${price.toFixed(2)}</span>
                {oldPrice > price && (
                  <span className="text-base text-gray-400 line-through">${oldPrice.toFixed(2)}</span>
                )}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${inStock ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                  {inStock ? `✓ In Stock (${stockCount} left)` : '✗ Out of Stock'}
                </span>
              </div>

              {productData?.warranty?.type === 'yes' && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 w-fit">
                  <Icon icon="mdi:shield-check" className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs font-bold text-emerald-800">
                    {productData.warranty.months >= 12
                      ? `${Math.floor(productData.warranty.months / 12)} Year${productData.warranty.months >= 24 ? 's' : ''} Warranty`
                      : `${productData.warranty.months} Month${productData.warranty.months > 1 ? 's' : ''} Warranty`
                    } Included
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={`flex-1 font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${isCartAdded ? 'bg-gray-800 hover:bg-gray-900 text-white' : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-200'}`}
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

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Share:</span>
                {(() => {
                  const productUrl = typeof window !== 'undefined' ? window.location.href : '';
                  const shareText = encodeURIComponent(productData?.title || 'Check out this product!');
                  const shareUrl = encodeURIComponent(productUrl);
                  const shareItems = [
                    { name: 'Facebook', icon: 'mdi:facebook', hover: 'hover:bg-blue-600', url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
                    { name: 'X', icon: 'ri:twitter-x-fill', hover: 'hover:bg-black', url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}` },
                    { name: 'WhatsApp', icon: 'mdi:whatsapp', hover: 'hover:bg-green-500', url: `https://wa.me/?text=${shareText}%20${shareUrl}` },
                  ];
                  return (
                    <>
                      {shareItems.map(s => (
                        <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${s.name}`}
                          className={`w-8 h-8 rounded-full bg-gray-100 ${s.hover} hover:text-white flex items-center justify-center text-gray-400 transition-all`}>
                          <Icon icon={s.icon} className="text-base" />
                        </a>
                      ))}
                      <button onClick={() => { navigator.clipboard.writeText(productUrl); toast.success('Product link copied!'); }}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-700 hover:text-white flex items-center justify-center text-gray-400 transition-all">
                        <Icon icon="mdi:link-variant" className="text-base" />
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Specs & Description */}
          <div className="space-y-12">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-5 border-b border-gray-100 pb-2">Product Information</h2>
              <div
                className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-li:marker:text-primary-500 text-gray-600 leading-relaxed text-[13px]"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(productData?.description || '') }}
              />
            </div>

            <div>
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
                      ? `${productData.summary?.minPrice?.toFixed(2)}`
                      : `${productData.summary?.minPrice?.toFixed(2)} – ${productData.summary?.maxPrice?.toFixed(2)}`
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
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4 sticky top-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-4">
            <div className="flex gap-3 items-center">
              {seller?.profilePictureOrLogo ? (
                <img src={seller.profilePictureOrLogo} alt={seller.businessName} className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 font-black text-lg bg-indigo-50 flex-shrink-0">
                  {(seller?.businessName || 'S').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center flex-wrap gap-1.5">
                  <h1 className="font-extrabold text-sm text-gray-900 leading-tight truncate">{seller?.businessName || 'Store'}</h1>
                  {seller?.isApproved && <Icon icon="mdi:check-decagram" className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md flex items-center gap-1 border ${isSellerOnline ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSellerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                    {isSellerOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">E-commerce Seller</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <button
                onClick={() => {
                  if (!token) { toast.error('Please log in to send a message'); router.push('/auth/login'); return; }
                  setShowAskModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-300 rounded-xl transition-all text-sm font-semibold text-gray-700 hover:text-primary-700"
              >
                <Icon icon="solar:chat-round-dots-bold" className="w-4 h-4 text-primary-500" />
                Ask Seller
              </button>
            </div>
          </div>

          {/* Variants selection */}
          {variants.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon="mdi:tune-variant" className="text-primary-500 w-5 h-5" />
                Select Options
              </h3>
              <div className="flex gap-2 flex-wrap">
                {variants.map(v => {
                  const isSelected = v._id === selectedVariantId;
                  return (
                    <button
                      key={v._id}
                      onClick={() => setSelectedVariantId(v._id)}
                      className={`px-3.5 py-1.5 rounded-xl border-2 text-xs font-bold transition-all duration-200 ${isSelected ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-primary-300'}`}
                    >
                      {v.title || 'Default'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-16 space-y-16 mt-10">
        <PlatformGuarantees />

        {/* Reviews */}
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

              {!userReview && (
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
                      <Icon icon="mdi:folder-multiple-image" className="w-4 h-4" />
                      Add Media (Photos/Video)
                      <input type="file" multiple accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
                    </label>
                  </div>

                  {reviewImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {reviewImages.map((file, idx) => (
                        <div key={idx} className="relative w-12 h-12 rounded-lg border border-gray-200 overflow-hidden">
                          <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => setReviewImages(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
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

                  <button onClick={handleAddReview} disabled={submittingReview} className="mt-2.5 w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 rounded-xl text-xs transition-all disabled:opacity-75 flex items-center justify-center gap-2">
                    {submittingReview && <Icon icon="mdi:loading" className="animate-spin w-4 h-4" />}
                    {submittingReview ? 'Submitting Review...' : 'Submit Review'}
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-3 space-y-3">
              {reviews.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-500 text-xs">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                reviews.map(r => (
                  <ReviewCard
                    key={r._id}
                    review={r}
                    currentUserId={currentUserId}
                    onDelete={handleDeleteReview}
                    isDeletingThis={deletingReviewId === r._id}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
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
      </div>

      {showAskModal && (
        <AskSellerModal
          onClose={() => setShowAskModal(false)}
          onSubmit={handleAskSubmit}
          loading={askLoading}
          productTitle={productData?.title || ''}
          sellerName={seller?.businessName || 'Seller'}
        />
      )}
    </div>
  );
}

function AskSellerModal({ onClose, onSubmit, loading, productTitle, sellerName }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const ASK_QUICK_SUBJECTS = ['Warranty details?', 'Shipping to my city?', 'Stock availability', 'Condition details'];

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) return;
    onSubmit(subject.trim(), message.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-gray-900 text-base">Ask {sellerName}</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{productTitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <Icon icon="mdi:close" className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {ASK_QUICK_SUBJECTS.map(s => (
              <button key={s} onClick={() => setSubject(s)} className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${subject === s ? 'bg-primary-500 text-white border-primary-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'}`}>{s}</button>
            ))}
          </div>
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-sm text-gray-800" />
          <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)} placeholder="Message..." className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 text-sm text-gray-800 resize-none" />
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all text-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-1.5">
            {loading && <Icon icon="mdi:loading" className="animate-spin w-4 h-4" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
