'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DOMPurify from 'isomorphic-dompurify';
import axiosInstance from '@/config/axiosInstance';
import { addToCart } from '@/store/cart';
import RefurbishedReviewSection from '@/components/website/refurbish/RefurbishedReviewSection';

export default function RefurbishedProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Attributes chosen by the user
  const [selectedAttrs, setSelectedAttrs] = useState({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/public/sell-device/refurbished/products/${slug}`);
        if (res.data?.success) {
          const pData = res.data.data;
          setProduct(pData);
          
          // Default variant
          const defVar = pData.variants?.find(v => v.isDefault) || pData.variants?.[0];
          setSelectedVariant(defVar);
          
          if (defVar) {
            // Set initial selected attributes from the default variant
            const initialAttrs = {};
            defVar.attributes?.forEach(a => {
              initialAttrs[a.name] = a.value;
            });
            setSelectedAttrs(initialAttrs);

            if (defVar.images?.length > 0) {
              setActiveImage(defVar.images[0].url);
            } else if (pData.images?.length > 0) {
              setActiveImage(pData.images[0].url);
            } else {
              setActiveImage('/assets/placeholder.jpg');
            }
          }
        }
      } catch (err) {
        console.error('Failed to load refurbished product details:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 animate-pulse space-y-8">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-[400px] bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-200 rounded w-1/2" />
            <div className="h-[150px] bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 text-center">
        <Icon icon="lucide:alert-circle" className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Product Not Found</h2>
        <p className="text-gray-500 mt-2">The refurbished product you are looking for does not exist or has been removed.</p>
        <Link href="/refurbish" className="mt-6 inline-block bg-primary-500 hover:bg-primary-600 text-black text-xs font-bold px-6 py-2.5 rounded-lg transition-all">
          Go Back to Listing
        </Link>
      </div>
    );
  }

  // Group all possible attribute values from all variants to build variant selection chips
  const allAttributes = {};
  product.variants?.forEach(v => {
    v.attributes?.forEach(a => {
      if (!allAttributes[a.name]) {
        allAttributes[a.name] = new Set();
      }
      allAttributes[a.name].add(a.value);
    });
  });

  const handleAttributeSelect = (name, value) => {
    const nextAttrs = { ...selectedAttrs, [name]: value };
    setSelectedAttrs(nextAttrs);

    // Find the variant that matches the new selection best
    const matched = product.variants?.find(v => {
      return v.attributes?.every(a => nextAttrs[a.name] === a.value);
    });

    if (matched) {
      setSelectedVariant(matched);
      if (matched.images?.length > 0) {
        setActiveImage(matched.images[0].url);
      }
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    if (selectedVariant.stock <= 0) {
      toast.warn("Out of stock!");
      return;
    }

    // Add to cart dispatch
    dispatch(
      addToCart({
        id: selectedVariant._id,
        productId: product._id,
        title: product.title,
        variantTitle: selectedVariant.title,
        price: selectedVariant.discountPrice || selectedVariant.sellingPrice,
        image: selectedVariant.images?.[0]?.url || product.images?.[0]?.url || '/assets/placeholder.jpg',
        quantity: 1,
        stock: selectedVariant.stock,
      })
    );
    toast.success("Added to cart successfully!");
  };

  const formatPrice = (num) => `₹${Math.round(num).toLocaleString('en-IN')}`;

  const price = selectedVariant ? (selectedVariant.discountPrice || selectedVariant.sellingPrice || 0) : 0;
  const mrp = selectedVariant ? (selectedVariant.sellingPrice || 0) : 0;
  const discount = selectedVariant ? selectedVariant.discountPercentage : 0;
  const goldPrice = price ? Math.round(price * 0.97) : null;
  const emiPrice = price ? Math.round(price / 24) : null;
  const imagesList = selectedVariant?.images?.length > 0 ? selectedVariant.images : (product.images || []);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 min-h-screen bg-gray-50/50">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-8">
        <Link href="/" className="hover:text-primary-500">Home</Link>
        <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5" />
        <Link href="/buy-refurbish-gadgets" className="hover:text-primary-500">Refurbished</Link>
        <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5" />
        <Link href="/refurbish" className="hover:text-primary-500">Products</Link>
        <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium line-clamp-1">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
        
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative w-full aspect-square bg-gray-50 border border-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
            <Image
              src={activeImage || '/assets/placeholder.jpg'}
              alt={product.title}
              fill
              className="object-contain p-6"
              priority
            />
          </div>

          {/* Thumbnails */}
          {imagesList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {imagesList.map((img, i) => (
                <button
                  key={img._id || i}
                  onClick={() => setActiveImage(img.url)}
                  className={`relative w-20 h-20 bg-gray-50 border rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center transition-all ${activeImage === img.url ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-200 hover:border-primary-300'}`}
                >
                  <img
                    src={img.url}
                    alt={`${product.title} view ${i + 1}`}
                    className="object-contain p-1 w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Variant Selectors */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-primary-50 text-primary-750 text-xs font-black uppercase px-2.5 py-0.5 rounded tracking-wide border border-primary-200">
                {product.brandId?.name}
              </span>
              <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded">
                Refurbished
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
              {product.title}
            </h1>
            <p className="text-xs text-gray-400">Model Ref: REF-{product._id?.toString().slice(-6).toUpperCase()}</p>
          </div>

          {/* Pricing Box */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3.5">
            <div className="flex items-baseline gap-2.5 flex-wrap">
              {discount > 0 && (
                <span className="text-red-500 font-black text-xl">
                  -{discount}%
                </span>
              )}
              <span className="text-2xl font-black text-gray-900">
                {formatPrice(price)}
              </span>
              {mrp > price && (
                <span className="text-sm text-gray-400 line-through">
                  MRP {formatPrice(mrp)}
                </span>
              )}
            </div>

            {/* Gold Membership Discount Strip */}
            {goldPrice && (
              <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:crown-minimalistic-bold" className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-[11px] font-black text-amber-900 uppercase tracking-wide">CTI Gold Club Price</p>
                    <p className="text-[10px] text-amber-700 mt-0.5">Save an extra 3% on every refurbished purchase</p>
                  </div>
                </div>
                <span className="text-base font-black text-amber-800">{formatPrice(goldPrice)}</span>
              </div>
            )}

            {emiPrice && (
              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                <Icon icon="material-symbols:credit-card" className="w-4 h-4 text-primary-500" />
                No Cost EMI available from <strong className="text-gray-800 font-bold">{formatPrice(emiPrice)}/month</strong>
              </p>
            )}
          </div>

          {/* Dynamic Variant Selectors */}
          {Object.entries(allAttributes).length > 0 && (
            <div className="space-y-4 py-4 border-y border-gray-100">
              {Object.entries(allAttributes).map(([name, values]) => (
                <div key={name} className="space-y-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{name}</span>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(values).map((val) => {
                      const isSelected = selectedAttrs[name] === val;
                      return (
                        <button
                          key={val}
                          onClick={() => handleAttributeSelect(name, val)}
                          className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all ${isSelected ? 'bg-primary-500 border-primary-500 text-black font-bold' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'}`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stock and Purchase Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${selectedVariant?.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-gray-600">
                {selectedVariant?.stock > 0 ? `In Stock (Only ${selectedVariant.stock} units left)` : 'Out of Stock'}
              </span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-black font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Icon icon="solar:cart-large-minimalistic-bold" className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={() => { handleAddToCart(); router.push('/cart'); }}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                className="flex-1 bg-black hover:bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Description Section */}
          {product.description && (
            <div className="pt-4 space-y-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Product Description</h3>
              <div 
                className="text-xs text-gray-500 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
              />
            </div>
          )}

        </div>

      </div>

      {/* Review Section */}
      <div className="mt-10">
        <RefurbishedReviewSection />
      </div>

    </div>
  );
}
