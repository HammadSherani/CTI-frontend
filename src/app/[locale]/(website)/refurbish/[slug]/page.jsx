'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import { Link, useRouter } from '@/i18n/navigation';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, toggleCart } from '@/store/cart';
import { useParams } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';
import DOMPurify from 'isomorphic-dompurify';

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
function ReviewCard({ review, currentUserId, onEdit, onDelete, isDeletingThis }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const name = review.userId ? review.userId.name : 'Anonymous';
  const email = review.userId ? review.userId.email : '';
  const isOwner = currentUserId && review.userId?._id &&
    review.userId._id.toString() === currentUserId.toString();

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
        <div className="flex items-center gap-2">
          {review.rating != null && <StarRating rating={review.rating} />}
          {isOwner && (
            <div className="flex items-center gap-1.5 ml-2">
              <button onClick={() => onEdit(review)} className="p-1.5 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors" title="Edit review">
                <Icon icon="solar:pen-bold-duotone" className="w-4 h-4" />
              </button>
              {confirmingDelete ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => { onDelete(review._id); setConfirmingDelete(false); }} disabled={isDeletingThis} className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold hover:bg-red-600 transition-colors disabled:opacity-50">
                    {isDeletingThis ? <Icon icon="mdi:loading" className="animate-spin w-3 h-3" /> : 'Confirm'}
                  </button>
                  <button onClick={() => setConfirmingDelete(false)} className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmingDelete(true)} disabled={isDeletingThis} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50" title="Delete review">
                  {isDeletingThis ? <Icon icon="mdi:loading" className="animate-spin w-4 h-4 text-red-400" /> : <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-4 h-4" />}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {review.comment && <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>}
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
   EDIT REVIEW MODAL
────────────────────────────────────────────────────────── */
function EditReviewModal({ review, onClose, onSubmit, loading }) {
  const [rating, setRating] = useState(review.rating || 0);
  const [comment, setComment] = useState(review.comment || '');
  const [newImages, setNewImages] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [newVideo, setNewVideo] = useState(null);

  const existingImages = (review.images || []).filter(img => !removeImages.includes(img.url));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-extrabold text-gray-900 text-base">Edit Review</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <Icon icon="mdi:close" className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <p className="text-[11px] font-semibold text-gray-600 mb-1.5">Rating</p>
            <StarRating rating={rating} size="md" interactive onChange={setRating} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-600 mb-1.5">Comment</p>
            <textarea value={comment} onChange={e => setComment(e.target.value.slice(0, 1000))} rows={3}
              placeholder="Write your review…" className="w-full border border-gray-200 rounded-xl p-2.5 text-xs text-gray-700 resize-none focus:outline-none focus:border-primary-400 transition-colors" />
            <p className="text-[11px] text-right text-gray-300">{comment.length}/1000</p>
          </div>
          {existingImages.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-gray-600 mb-1.5">Current Images <span className="text-gray-400 font-normal">(click to remove)</span></p>
              <div className="flex flex-wrap gap-2">
                {(review.images || []).map((img, idx) => {
                  const marked = removeImages.includes(img.url);
                  return (
                    <button key={idx} onClick={() => setRemoveImages(prev => prev.includes(img.url) ? prev.filter(u => u !== img.url) : [...prev, img.url])}
                      className={`relative w-14 h-14 rounded-lg border-2 overflow-hidden transition-all ${marked ? 'border-red-400 opacity-50' : 'border-gray-200'}`}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      {marked && <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center"><Icon icon="mdi:close" className="w-4 h-4 text-red-600" /></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <label className="cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 hover:text-primary-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-primary-200 transition-colors">
              <Icon icon="mdi:camera-outline" className="w-4 h-4" />
              Add Photos
              <input type="file" multiple accept="image/*" className="hidden" onChange={e => setNewImages(prev => [...prev, ...Array.from(e.target.files)].slice(0, 5))} />
            </label>
          </div>
          {newImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {newImages.map((file, idx) => (
                <div key={idx} className="relative w-14 h-14 rounded-lg border border-gray-200 overflow-hidden">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setNewImages(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                    <Icon icon="mdi:close" className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 pb-5 pt-3 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors">Cancel</button>
          <button onClick={() => onSubmit({ rating, comment, removeImages, removeVideo, newImages, newVideo })} disabled={loading} className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors">
            {loading ? <Icon icon="mdi:loading" className="animate-spin w-4 h-4 mx-auto" /> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   MAIN REFURBISHED PRODUCT DETAIL PAGE
────────────────────────────────────────────────────────── */
export default function RefurbishedProductDetailPage() {
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
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  /* Per-attribute selection */
  const [selectedAttributes, setSelectedAttributes] = useState({});

  // Thumbnail pagination
  const [thumbStart, setThumbStart] = useState(0);
  const THUMBS_PER_VIEW = 6;

  const auth = useSelector(s => s.auth);
  const token = auth?.token;
  const currentUserId = auth?.user?._id || auth?.user?.id || null;

  // Ref for scrolling to order section (must be at top level, before any early returns)
  const orderRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [{ data: res }, { data: revRes }] = await Promise.all([
          axiosInstance.get(`/public/sell-device/refurbished/products/${params.slug}`),
          // Reviews placeholder — you can hook up a refurbished reviews endpoint later
          Promise.resolve({ data: { success: true, data: [] } }),
        ]);

        if (res.success) {
          const prod = res.data;
          setProductData(prod);
          const vList = prod.variants || [];
          setVariants(vList);
          if (vList.length) {
            const def = vList.find(v => v.isDefault) || vList[0];
            setSelectedVariantId(def._id);
            const attrs = {};
            (def.attributes || []).forEach(a => { attrs[a.name] = a.value; });
            setSelectedAttributes(attrs);
          }

          // Fetch related refurbished products by same category
          if (prod.categoryId) {
            try {
              const rel = await axiosInstance.get(`/public/sell-device/refurbished/products?category=${prod.categoryId?.slug || ''}&limit=5`);
              if (rel.data?.success) {
                setRelatedProducts((rel.data.data || []).filter(p => p._id !== prod._id).slice(0, 4));
              }
            } catch (e) {
              console.error('Failed to fetch related refurbished products', e);
            }
          }
        }
        if (revRes.success) setReviews(revRes.data);
      } catch (err) {
        console.error('Error loading refurbished product', err);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.slug]);

  /* ─────────────────────────────────────────────────────────
     LOADING / NOT FOUND
  ───────────────────────────────────────────────────────── */
  if (loading || !productData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse space-y-8">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="h-[420px] bg-gray-200 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-12 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded w-2/3" />
                <div className="h-12 bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            <div className="h-40 bg-gray-200 rounded-2xl" />
            <div className="h-32 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const selectedVariant = variants.find(v => v._id === selectedVariantId) || variants[0] || {};
  const price = selectedVariant?.discountPrice || selectedVariant?.sellingPrice || 0;
  const oldPrice = selectedVariant?.sellingPrice || 0;
  const stockCount = selectedVariant?.stock ?? 0;
  const inStock = stockCount > 0;

  const discountPercent = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : null;
  const goldPrice = price ? Math.round(price * 0.97) : null;
  const monthlyEmi = price ? Math.round(price / 24) : null;

  /* ── Build image gallery ── */
  const selectedVariantImages = (selectedVariant?.images || []).map(i => i.url);
  const otherImages = variants.filter(v => v._id !== selectedVariantId).flatMap(v => (v.images || []).map(i => i.url));
  let allImages = [...new Set([...selectedVariantImages, ...otherImages])];
  if (!allImages.length) allImages = ['/assets/placeholder.jpg'];

  const visibleThumbs = allImages.slice(thumbStart, thumbStart + THUMBS_PER_VIEW);
  const canScrollUp = thumbStart > 0;
  const canScrollDown = thumbStart + THUMBS_PER_VIEW < allImages.length;

  /* ── Attribute selectors ── */
  const attrTypes = Array.from(new Set(variants.flatMap(v => (v.attributes || []).map(a => a.name))));
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
    if (isAlreadySelected) delete next[attrName]; else next[attrName] = value;
    setSelectedAttributes(next);
    if (Object.keys(next).length === 0) {
      const def = variants.find(v => v.isDefault) || variants[0];
      setSelectedVariantId(def?._id || null);
      setSelectedImage(0);
      setThumbStart(0);
      return;
    }
    const match = variants.find(v => Object.entries(next).every(([k, val]) => v.attributes?.some(a => a.name === k && a.value === val)));
    if (match) {
      setSelectedVariantId(match._id);
      setSelectedImage(0);
      setThumbStart(0);
      // Scroll to order section when a complete variant is matched
      setTimeout(() => {
        if (orderRef.current) {
          orderRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          orderRef.current.style.transition = 'box-shadow 0.3s ease';
          orderRef.current.style.boxShadow = '0 0 0 3px rgba(234, 179, 8, 0.5)';
          setTimeout(() => {
            if (orderRef.current) orderRef.current.style.boxShadow = '';
          }, 1200);
        }
      }, 80);
    }
    else setSelectedVariantId(null);
  };

  const handleAddToCart = () => {
    if (!inStock) { toast.warn('Out of stock!'); return; }
    dispatch(addToCart({
      id: selectedVariant._id,
      productId: productData._id,
      title: productData.title,
      variantTitle: selectedVariant.title,
      price,
      image: allImages[0] || '/assets/placeholder.jpg',
      quantity,
      stock: stockCount,
    }));
    toast.success(`${productData.title} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    if (!token) { toast.error('Please log in to purchase'); router.push('/auth/login'); return; }
    handleAddToCart();
    router.push('/checkout');
  };

  const handleAddReview = async () => {
    if (!token) { toast.error('Please log in to submit a review'); return; }
    if (!reviewRating && !reviewText.trim() && reviewImages.length === 0) { toast.error('Please add a rating or comment'); return; }
    try {
      setSubmittingReview(true);
      // Would post to refurbished reviews endpoint when ready
      toast.info('Review submission will be available soon!');
      setReviewText('');
      setReviewRating(0);
      setReviewImages([]);
    } catch (err) {
      toast.error('Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!token) return;
    setDeletingReviewId(reviewId);
    try {
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      toast.success('Review deleted');
    } finally {
      setDeletingReviewId(null);
    }
  };

  // Rating breakdown
  const totalReviews = reviews.length;
  const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { if (r.rating) ratingBreakdown[r.rating]++; });
  for (let i = 1; i <= 5; i++) {
    ratingBreakdown[i] = totalReviews > 0 ? Math.round((ratingBreakdown[i] / totalReviews) * 100) : 0;
  }

  const userReview = currentUserId ? reviews.find(r => r.userId?._id?.toString() === currentUserId.toString()) : null;

  const formatPrice = (num) => `₹${Math.round(num).toLocaleString('en-IN')}`;

  // Scroll to order section helper
  const scrollToOrder = () => {
    if (orderRef.current) {
      orderRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-8 font-medium">
        <Link href="/" className="hover:text-primary-500">Home</Link>
        <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5 text-gray-400" />
        <Link href="/buy-refurbish-gadgets" className="hover:text-primary-500">Refurbished</Link>
        <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5 text-gray-400" />
        <Link href="/refurbish" className="hover:text-primary-500">All Gadgets</Link>
        <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-gray-900 font-semibold line-clamp-1">{productData.title}</span>
      </div>

      {/* ── Top Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-12">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-9   xl:col-span-9 space-y-10">

          {/* Image & Core Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* LEFT — Image Gallery */}
            <div className="flex gap-3">
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

              {/* Main Image */}
              <div className="flex-1 flex flex-col gap-3">
                <div className="relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 aspect-square">
                  {discountPercent && (
                    <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md pointer-events-none">
                      -{discountPercent}%
                    </span>
                  )}
                  <span className="absolute top-3 right-3 z-10 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md pointer-events-none">
                    Refurbished
                  </span>
                  <ImageZoom
                    src={allImages[selectedImage] || '/assets/placeholder.jpg'}
                    alt={productData?.title || 'Product'}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT — Product Details */}
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary-50 text-primary-700 text-xs font-black uppercase px-2.5 py-0.5 rounded border border-primary-200 tracking-wide">
                        {productData.brandId?.name}
                      </span>
                      {productData.categoryId?.name && (
                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded">
                          {productData.categoryId.name}
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 leading-snug">
                      {productData?.title}
                    </h1>
                  </div>
                </div>

                {/* Rating display */}
                {productData.ratings?.average > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={productData.ratings.average} />
                    <span className="text-xs text-gray-500 font-medium">
                      {productData.ratings.average.toFixed(1)} ({reviews.length} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 flex-wrap">
                {discountPercent && (
                  <span className="text-lg font-bold text-red-500">-{discountPercent}%</span>
                )}
                <span className="text-2xl font-extrabold text-gray-900">{formatPrice(price)}</span>
                {oldPrice > price && (
                  <span className="text-base text-gray-400 line-through">MRP {formatPrice(oldPrice)}</span>
                )}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${inStock ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                  {inStock ? `✓ In Stock (${stockCount} left)` : '✗ Out of Stock'}
                </span>
              </div>

              {/* Gold Club Price */}
              {goldPrice && (
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <Icon icon="solar:crown-minimalistic-bold" className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-black text-amber-900 uppercase tracking-wide">CTI Gold Club Price</p>
                    <p className="text-sm font-black text-amber-800">{formatPrice(goldPrice)} <span className="text-[10px] font-medium text-amber-700">(Save extra 3%)</span></p>
                  </div>
                </div>
              )}

              {/* EMI */}
              {monthlyEmi && (
                <p className="text-xs text-gray-500 flex items-center gap-1.5 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                  <Icon icon="material-symbols:credit-card" className="w-4 h-4 text-primary-500" />
                  No Cost EMI available from <strong className="text-gray-800 font-bold">{formatPrice(monthlyEmi)}/month</strong>
                </p>
              )}

              {/* Quantity & Actions */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500">
                    <Icon icon="mdi:minus" className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-gray-800">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(stockCount, q + 1))} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500">
                    <Icon icon="mdi:plus" className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div id="order-section" ref={orderRef} className="flex gap-2 rounded-xl transition-all duration-300">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={`flex-1 font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 bg-primary-500 hover:bg-primary-600 text-black shadow-lg shadow-primary-200`}
                >
                  <Icon icon="solar:cart-large-minimalistic-bold" className="w-5 h-5" />
                  Add to Cart
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
                {(() => {
                  const productUrl = typeof window !== 'undefined' ? window.location.href : '';
                  const shareText = encodeURIComponent(productData?.title || 'Check out this refurbished product!');
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

          {/* Description & Specs */}
          <div className="space-y-12">
            {productData?.description && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-5 border-b border-gray-100 pb-2">Product Information</h2>
                <div
                  className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-li:marker:text-primary-500 text-gray-600 leading-relaxed text-[13px]"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(productData.description) }}
                />
              </div>
            )}

            {/* Specifications Table */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-5 border-b border-gray-100 pb-2">Specifications</h2>
              <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {[
                  productData.brandId?.name && { label: 'Brand', value: productData.brandId.name },
                  productData.categoryId?.name && { label: 'Category', value: productData.categoryId.name },
                  selectedVariant?.sku && { label: 'SKU', value: selectedVariant.sku },
                  { label: 'Total Variants', value: variants.length },
                  { label: 'Condition', value: selectedVariant?.attributes?.find(a => a.name.toLowerCase() === 'condition')?.value || 'Refurbished' },
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

        {/* RIGHT COLUMN (Variant Selectors & Refurb Info) */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-4 sticky top-6">

          {/* Refurb Condition Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-4">
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-amber-500 font-black text-lg bg-amber-50 flex-shrink-0">
                <Icon icon="solar:stars-bold-duotone" className="w-7 h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center flex-wrap gap-1.5">
                  <h3 className="font-extrabold text-sm text-gray-900 leading-tight">CTI Refurbished</h3>
                  <Icon icon="mdi:check-decagram" className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md flex items-center gap-1 border bg-emerald-50 text-emerald-600 border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Verified
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Professionally tested & certified</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 rounded-xl p-2 border border-gray-100">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-0.5 text-xs font-black text-gray-800">
                {productData.ratings?.average ? productData.ratings.average.toFixed(1) : '—'}
                {productData.ratings?.average > 0 && <Icon icon="mdi:star" className="w-3 h-3 text-yellow-500" />}
              </div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Rating</p>
            </div>
            <div className="flex flex-col items-center justify-center border-l border-r border-gray-200">
              <p className="text-xs font-black text-gray-800">{variants.length}</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Variants</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="text-xs font-black text-gray-800">{variants.reduce((s, v) => s + (v.stock || 0), 0)}</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">In Stock</p>
            </div>
          </div>

          {/* Attribute Selectors */}
          {attrTypes.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  <Icon icon="mdi:tune-variant" className="text-primary-500 w-5 h-5" />
                  Select Options
                </h3>
                {Object.keys(selectedAttributes).length > 0 && (
                  <button
                    onClick={() => { setSelectedAttributes({}); setSelectedVariantId(variants.find(v => v.isDefault)?._id || variants[0]?._id || null); }}
                    className="text-[10px] text-gray-400 hover:text-red-500 font-semibold flex items-center gap-0.5 transition-colors"
                  >
                    <Icon icon="mdi:close-circle-outline" className="w-3.5 h-3.5" />
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-5">
                {attrTypes.map(type => {
                  const opts = attrOptions[type] || [];
                  const isColor = type.toLowerCase() === 'color';
                  const currentVal = selectedAttributes[type];
                  return (
                    <div key={type}>
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{type}</span>
                        {currentVal && (
                          <span className="text-[10px] font-extrabold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100 flex items-center gap-1">
                            <Icon icon="mdi:check" className="w-3 h-3" />
                            {currentVal}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {opts.map(opt => {
                          const isSelected = currentVal === opt.value;
                          const testAttrs = { ...selectedAttributes, [type]: opt.value };
                          const compatible = variants.some(v =>
                            Object.entries(testAttrs).every(([k, val]) =>
                              v.attributes?.some(a => a.name === k && a.value === val)
                            )
                          );
                          if (isColor) {
                            const hex = opt.hex || '#ccc';
                            const isLight = ['#ffffff', '#f5f5f5', '#f0f0f0', '#fff'].includes(hex.toLowerCase());
                            return (
                              <button key={opt.value} title={compatible ? opt.value : `${opt.value} — not available`}
                                onClick={() => compatible && handleAttrSelect(type, opt.value)} disabled={!compatible}
                                className={`relative w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected ? 'border-primary-500 scale-110 shadow-md shadow-primary-500/30 ring-2 ring-primary-200' : compatible ? `${isLight ? 'border-gray-300' : 'border-transparent'} hover:scale-105 hover:shadow-md cursor-pointer` : 'border-gray-200 opacity-35 cursor-not-allowed'}`}
                                style={{ backgroundColor: hex }}>
                                {isSelected && <Icon icon="mdi:check" className={`w-4 h-4 ${isLight ? 'text-gray-700' : 'text-white'}`} />}
                              </button>
                            );
                          }
                          return (
                            <button key={opt.value} onClick={() => compatible && handleAttrSelect(type, opt.value)} disabled={!compatible}
                              className={`px-3.5 py-1.5 rounded-xl border-2 text-xs font-bold transition-all duration-200 ${isSelected ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm scale-105' : compatible ? 'border-gray-200 bg-gray-50 text-gray-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 cursor-pointer' : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'}`}>
                              {opt.value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected variant summary */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                {selectedVariantId ? (() => {
                  const v = variants.find(vv => vv._id === selectedVariantId);
                  const vPrice = v?.discountPrice || v?.sellingPrice || 0;
                  const vOld = v?.sellingPrice || 0;
                  const vStock = v?.stock ?? 0;
                  return (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-base font-black text-gray-900">{formatPrice(vPrice)}</span>
                        {vOld > vPrice && <span className="text-xs text-gray-400 line-through ml-1.5">{formatPrice(vOld)}</span>}
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${vStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {vStock > 0 ? `${vStock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  );
                })() : Object.keys(selectedAttributes).length > 0 ? (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
                    <Icon icon="mdi:alert-circle-outline" className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[11px] font-semibold">This combination is not available</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 text-center">Select options to see price & stock</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Full Screen Content ── */}
      <div className="mb-16 space-y-16 mt-10">

        {/* Platform Guarantee Banners */}
        <div className="max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:shield-check" className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary-900 mb-1.5">Platform Guarantee & Buyer Protection</h3>
              <p className="text-xs text-primary-800/80 leading-relaxed">
                Every refurbished product on CTI undergoes rigorous quality testing. Your payment is protected and released only after you verify the product is exactly as described. Shop with complete confidence.
              </p>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:refresh-circle" className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900 mb-1.5">Easy Returns & Refund Policy</h3>
              <p className="text-xs text-emerald-800/80 leading-relaxed">
                Not satisfied with your refurbished purchase? Return eligible items within 7 days of delivery for a full refund or exchange. Hassle-free returns with swift processing. Terms apply.
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

              {/* Write Review Form */}
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
                      <Icon icon="mdi:camera-outline" className="w-4 h-4" />
                      Add Photos
                      <input type="file" multiple accept="image/*" onChange={e => setReviewImages(prev => [...prev, ...Array.from(e.target.files)].slice(0, 5))} className="hidden" />
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
                  <button onClick={handleAddReview} disabled={submittingReview} className="mt-2.5 w-full bg-primary-500 hover:bg-primary-600 text-black font-semibold py-2 rounded-xl text-xs transition-colors disabled:opacity-50">
                    {submittingReview ? 'Submitting…' : 'Submit Review'}
                  </button>
                </div>
              )}
            </div>

            {/* Review list */}
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
                    onEdit={setEditingReview}
                    onDelete={handleDeleteReview}
                    isDeletingThis={deletingReviewId === r._id}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Related Refurbished Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 pt-10 border-t border-gray-100 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Similar Refurbished Products</h2>
              <Link href="/refurbish" className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                View All Similar →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map(rp => {
                const defVar = rp.variants?.find(v => v.isDefault) || rp.variants?.[0];
                const rPrice = defVar?.discountPrice || defVar?.sellingPrice || 0;
                const imgSrc = defVar?.images?.[0]?.url || rp.images?.[0]?.url || '/assets/placeholder.jpg';
                return (
                  <Link key={rp._id} href={`/refurbish/${rp.slug}`}
                    className="bg-white border border-gray-100 hover:border-primary-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group flex flex-col">
                    <div className="w-full aspect-square bg-gray-50 rounded-xl mb-3 overflow-hidden flex items-center justify-center">
                      <img src={imgSrc} alt={rp.title} className="object-contain max-h-32 p-2 group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <p className="text-xs font-bold text-gray-900 group-hover:text-primary-500 transition-colors line-clamp-2">{rp.title}</p>
                    <p className="text-sm font-black text-gray-900 mt-1.5">{formatPrice(rPrice)}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Delivery Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-10 border-t border-gray-100">
          {[
            { icon: '/assets/product/icons/1.png', label: 'Seasonal Sales', sub: 'Exclusive seasonal offers on selected refurbished items.' },
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

      {editingReview && (
        <EditReviewModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onSubmit={({ rating, comment, removeImages, removeVideo, newImages, newVideo }) => {
            setReviews(prev => prev.map(r => r._id === editingReview._id ? { ...r, rating, comment } : r));
            setEditingReview(null);
            toast.success('Review updated');
          }}
          loading={submittingReview}
        />
      )}
    </div>
  );
}
