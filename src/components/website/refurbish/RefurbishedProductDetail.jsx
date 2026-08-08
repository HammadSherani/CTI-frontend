import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link, useRouter } from '@/i18n/navigation';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { addRefurbishedToCart } from '@/store/refurbishedCart';
import axiosInstance from '@/config/axiosInstance';
import DOMPurify from 'isomorphic-dompurify';

import StarRating from '../StarRating';
import ImageZoom from '../ImageZoom';
import ReviewCard from '../ReviewCard';
import PlatformGuarantees from '../PlatformGuarantees';
import Breadcrumbs from '../Breadcrumbs';
import RefurbishedSliderSection from './RefurbishedSliderSection';

export default function RefurbishedProductDetail({ params }) {
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
  const [reviewVideo, setReviewVideo] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedByBrand, setRelatedByBrand] = useState([]);
  const [topSellingFallback, setTopSellingFallback] = useState([]);

  /* Ask Platform Modal */
  const [showAskModal, setShowAskModal] = useState(false);
  const [askLoading, setAskLoading] = useState(false);

  /* Per-attribute selection */
  const [selectedAttributes, setSelectedAttributes] = useState({});

  // Thumbnail pagination
  const [thumbStart, setThumbStart] = useState(0);
  const THUMBS_PER_VIEW = 6;

  const auth = useSelector(s => s.auth);
  const token = auth?.token;
  const currentUserId = auth?.user?._id || auth?.user?.id || null;

  // Ref for scrolling to order section
  const orderRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [{ data: res }, { data: revRes }] = await Promise.all([
          axiosInstance.get(`/public/refurbished-devices/products/${params.slug}`),
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

          // Fetch related refurbished products by category slug
          let categoryList = [];
          if (prod.categoryId?.slug) {
            try {
              const rel = await axiosInstance.get(`/public/refurbished-devices/products/category/${prod.categoryId.slug}`);
              if (rel.data?.success || rel.data?.data) {
                const list = rel.data.data || [];
                categoryList = list.filter(p => p._id !== prod._id).slice(0, 4);
                setRelatedProducts(categoryList);
              }
            } catch (e) {
              console.error('Failed to fetch related refurbished products', e);
            }
          }

          // Fetch related refurbished products from the same brand
          let brandList = [];
          const brandSlug = prod.brandId?.slug || prod.brandId;
          if (brandSlug) {
            try {
              const rel = await axiosInstance.get('/public/refurbished-devices/products', { params: { brand: brandSlug, limit: 5 } });
              const list = rel.data?.data || [];
              if (Array.isArray(list)) {
                brandList = list.filter(p => p._id !== prod._id).slice(0, 4);
                setRelatedByBrand(brandList);
              }
            } catch (e) {
              console.error('Failed to fetch related products by brand', e);
            }
          }

          // If nothing related was found by category or brand, fall back to top-selling products
          if (categoryList.length === 0 && brandList.length === 0) {
            try {
              const topRes = await axiosInstance.get('/public/refurbished-devices/products/top-selling');
              const topList = topRes.data?.data || [];
              if (Array.isArray(topList)) {
                setTopSellingFallback(topList.filter(p => p._id !== prod._id).slice(0, 4));
              }
            } catch (e) {
              console.error('Failed to fetch top-selling fallback products', e);
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
    dispatch(addRefurbishedToCart({
      product: productData,
      variantId: selectedVariant._id,
      quantity,
    }));
    toast.success(`${productData.title} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    if (!token) { toast.error('Please log in to purchase'); router.push('/auth/login'); return; }
    router.push(`/checkout?type=refurbished&buyNow=true&slug=${productData.slug}&variantId=${selectedVariant._id}&quantity=${quantity}`);
  };

  const handleAskSubmit = async (subject, message) => {
    if (!token) { toast.error('Please log in to send a message'); router.push('/auth/login'); return; }
    setAskLoading(true);
    try {
      const { data } = await axiosInstance.post(
        '/refurbished/queries',
        { queryType: 'product', subject, message, productId: productData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Your message has been sent! We'll get back to you soon.");
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
    const imgs = files.filter(f => f.type.startsWith('image/'));
    const vids = files.filter(f => f.type.startsWith('video/'));

    if (imgs.length > 0) {
      if (reviewImages.length + imgs.length > 5) {
        toast.error('Maximum 5 images allowed');
        return;
      }
      setReviewImages(prev => [...prev, ...imgs]);
    }

    if (vids.length > 0) {
      const file = vids[0];
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Video must be less than 50MB');
        return;
      }
      setReviewVideo(file);
    }
  };

  const handleAddReview = async () => {
    if (!token) { toast.error('Please log in to submit a review'); return; }
    if (!reviewRating) { toast.error('Please select a rating (stars)'); return; }
    try {
      setSubmittingReview(true);
      const newReview = {
        _id: Date.now().toString(),
        rating: reviewRating,
        comment: reviewText,
        images: reviewImages.map(file => ({ url: URL.createObjectURL(file) })),
        video: reviewVideo ? { url: URL.createObjectURL(reviewVideo) } : null,
        userId: {
          _id: currentUserId || 'guest',
          name: auth?.user?.name || 'Anonymous',
          email: auth?.user?.email || 'anonymous@example.com'
        },
        createdAt: new Date().toISOString()
      };
      setReviews(prev => [newReview, ...prev]);
      toast.success('Review submitted successfully!');
      setReviewText('');
      setReviewRating(0);
      setReviewImages([]);
      setReviewVideo(null);
    } catch (err) {
      toast.error('Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    setReviews(prev => prev.filter(r => r._id !== reviewId));
    toast.success('Review deleted');
  };

  // Rating breakdown
  const totalReviews = reviews.length;
  const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { if (r.rating) ratingBreakdown[r.rating]++; });
  for (let i = 1; i <= 5; i++) {
    ratingBreakdown[i] = totalReviews > 0 ? Math.round((ratingBreakdown[i] / totalReviews) * 100) : 0;
  }

  const userReview = currentUserId ? reviews.find(r => (r.userId?._id || r.userId)?.toString() === currentUserId.toString()) : null;
  const formatPrice = (num) => `$${Number(num).toFixed(2)}`;

  return (
    <div className="max-w-7xl mx-auto px-10 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'Refurbished', href: '/buy-refurbish-gadgets' },
        { label: 'All Gadgets', href: '/refurbish' },
        { label: productData.title }
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-12">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-9 xl:col-span-9 space-y-10">
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
                  <span className="absolute top-3 right-3 z-10 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md pointer-events-none">
                    Refurbished
                  </span>
                  <ImageZoom src={allImages[selectedImage] || '/assets/placeholder.jpg'} alt={productData.title} />
                </div>
              </div>
            </div>

            {/* Details */}
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
              </div>

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

              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden w-fit">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500">
                  <Icon icon="mdi:minus" className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-gray-800">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(stockCount, q + 1))} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500">
                  <Icon icon="mdi:plus" className="w-4 h-4" />
                </button>
              </div>

              <div id="order-section" ref={orderRef} className="flex gap-2 rounded-xl transition-all duration-300">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 bg-primary-500 hover:bg-primary-600 text-black shadow-lg shadow-primary-200"
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
            </div>
          </div>

          {/* Sequential Content */}
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

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-4 sticky top-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col">
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-amber-500 font-black text-lg bg-amber-50 flex-shrink-0">
                <Icon icon="solar:stars-bold-duotone" className="w-7 h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center flex-wrap gap-1.5">
                  <h3 className="font-extrabold text-sm text-gray-900 leading-tight">CTI Refurbished</h3>
                  <Icon icon="mdi:check-decagram" className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Verified & certified gadgets</p>
              </div>
            </div>

            <div className="border-t border-gray-100 mt-4 pt-3">
              <button
                onClick={() => {
                  if (!token) { toast.error('Please log in to ask a question'); router.push('/auth/login'); return; }
                  setShowAskModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-300 rounded-xl transition-all text-sm font-semibold text-gray-700 hover:text-primary-700"
              >
                <Icon icon="solar:chat-round-dots-bold" className="w-4 h-4 text-primary-500" />
                Ask Platform
              </button>
            </div>
          </div>

          {/* Attribute selection */}
          {attrTypes.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon="mdi:tune-variant" className="text-primary-500 w-5 h-5" />
                Select Options
              </h3>
              <div className="space-y-4">
                {attrTypes.map(type => {
                  const opts = attrOptions[type] || [];
                  const currentVal = selectedAttributes[type];
                  return (
                    <div key={type}>
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">{type}</span>
                      <div className="flex gap-2 flex-wrap">
                        {opts.map(opt => {
                          const isSelected = currentVal === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => handleAttrSelect(type, opt.value)}
                              className={`px-3 py-1 rounded-lg border text-xs font-semibold ${isSelected ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-primary-300'}`}
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
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {(relatedProducts.length > 0 || relatedByBrand.length > 0 || topSellingFallback.length > 0) && (
          <div className="mt-12 pt-10 border-t border-gray-100">
            {relatedProducts.length > 0 && (
              <RefurbishedSliderSection
                title={`More in ${productData.categoryId?.name || 'this Category'}`}
                products={relatedProducts}
                viewAllHref={productData.categoryId?.slug ? `/refurbish?category=${productData.categoryId.slug}` : '/refurbish'}
              />
            )}

            {relatedByBrand.length > 0 && (
              <RefurbishedSliderSection
                title={`More from ${productData.brandId?.name || 'this Brand'}`}
                products={relatedByBrand}
                viewAllHref={productData.brandId?.slug ? `/refurbish?brand=${productData.brandId.slug}` : '/refurbish'}
              />
            )}

            {relatedProducts.length === 0 && relatedByBrand.length === 0 && topSellingFallback.length > 0 && (
              <RefurbishedSliderSection
                title="Top Selling Refurbished Products"
                products={topSellingFallback}
                viewAllHref="/refurbish"
              />
            )}
          </div>
        )}
      </div>

      {showAskModal && (
        <AskPlatformModal
          onClose={() => setShowAskModal(false)}
          onSubmit={handleAskSubmit}
          loading={askLoading}
          productTitle={productData?.title || ''}
        />
      )}
    </div>
  );
}

function AskPlatformModal({ onClose, onSubmit, loading, productTitle }) {
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
            <h3 className="font-extrabold text-gray-900 text-base">Ask the Platform</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{productTitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <Icon icon="mdi:close" className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {ASK_QUICK_SUBJECTS.map(s => (
              <button key={s} onClick={() => setSubject(s)} className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${subject === s ? 'bg-primary-500 text-white' : 'bg-gray-50 text-gray-600'}`}>{s}</button>
            ))}
          </div>
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="w-full px-4 py-2 bg-gray-50 border rounded-xl" />
          <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)} placeholder="Message..." className="w-full px-4 py-2 bg-gray-50 border rounded-xl" />
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl">Send</button>
        </div>
      </div>
    </div>
  );
}
