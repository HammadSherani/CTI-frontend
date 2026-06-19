"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";

export default function ViewProductPage({ params }) {
  const { token } = useSelector((s) => s.auth);
  // Unwrapping params for Next.js 15+
  const unwrappedParams = React.use ? React.use(params) : params;
  const productId = unwrappedParams.id;
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Derive allImages from all variants (product.images is only a 1-image cache)
  const allImages = React.useMemo(() => {
    const seen = new Set();
    const imgs = [];
    variants.forEach((v) => {
      (v.images || []).forEach((img) => {
        if (img.url && !seen.has(img.url)) {
          seen.add(img.url);
          imgs.push(img);
        }
      });
    });
    // Fallback to product.images if no variant images
    if (imgs.length === 0 && product?.images?.length) {
      return product.images;
    }
    return imgs;
  }, [variants, product]);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const [prodRes, varRes] = await Promise.all([
          axiosInstance.get(`/seller/product/${productId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axiosInstance.get(`/seller/product/${productId}/variants`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setProduct(prodRes.data.data);
        setVariants(varRes.data.data || []);
      } catch (err) {
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFB]">
        <Icon icon="mdi:loading" className="animate-spin w-8 h-8 text-primary-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFB]">
        <Icon icon="mdi:alert-circle-outline" className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Product Not Found</h2>
        <button onClick={() => router.push("/seller/product")} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl">Back to Products</button>
      </div>
    );
  }

  const defaultVariant = variants.find(v => v.isDefault) || variants[0];
  // hasVariants: true if any variant has attributes (product model has no hasVariants field)
  const hasVariants = variants.some((v) => v.attributes?.length > 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors">
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="text-xs text-gray-400 mb-0.5 flex items-center gap-1.5">
              <span className="hover:text-primary-600 cursor-pointer" onClick={() => router.push("/seller/product")}>Products</span>
              <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5" />
              <span className="text-gray-600">View</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 truncate max-w-xl">
              {product.title}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/seller/product/${product._id}/edit`)}
            className="px-5 py-2.5 text-sm font-semibold bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Icon icon="mdi:pencil-outline" className="w-4 h-4" />
            Edit Info
          </button>
          <button onClick={() => router.push(`/seller/product/${product._id}/variants`)}
            className="px-5 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all flex items-center gap-2 shadow-lg shadow-primary-500/20">
            <Icon icon="mdi:layers-triple-outline" className="w-4 h-4" />
            Manage Variants
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Icon icon="mdi:information-outline" className="w-5 h-5 text-primary-500" />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Title</span>
                <p className="font-medium text-gray-800">{product.title}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Description</span>
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{product.description}</p>
              </div>
              {/* Tags */}
              {product.tags?.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-primary-50 border border-primary-100 text-xs font-bold text-primary-600">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Category</span>
                  <p className="font-medium text-gray-800">{product.categoryId?.title || "—"}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">SKU</span>
                  <p className="font-medium text-gray-800">{product.sku || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Variants Table or Simple Pricing */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
               <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Icon icon="mdi:tag-outline" className="w-5 h-5 text-primary-500" />
                Pricing & Variants
              </h2>
            </div>
            
            {hasVariants ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/80 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Variant</th>
                      <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Attributes</th>
                      <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Price</th>
                      <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Stock</th>
                      <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Specs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {variants.map(v => (
                      <tr key={v._id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {v.images?.[0]?.url ? (
                              <img src={v.images[0].url} alt={v.title} className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Icon icon="mdi:image-outline" className="text-gray-400 w-4 h-4" />
                              </div>
                            )}
                            <span className="font-semibold text-gray-800">{v.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {(v.attributes || []).map(a => (
                              <span key={a.name} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                                {a.name}: {a.value}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">${v.price?.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${v.stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                            {v.stock} in stock
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {v.specs?.length > 0 ? (
                            <div className="space-y-0.5">
                              {v.specs.map(s => (
                                <div key={s.name} className="flex gap-1 text-xs">
                                  <span className="font-bold text-violet-700">{s.name}:</span>
                                  <span className="text-gray-600">{s.value}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-3 gap-4">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Price</span>
                  <p className="text-xl font-bold text-gray-900">${defaultVariant?.price || "0.00"}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Stock</span>
                  <p className="text-lg font-semibold text-gray-800">{defaultVariant?.stock || 0}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Discount</span>
                  <p className="text-lg font-semibold text-emerald-600">{defaultVariant?.discountPercentage || 0}%</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/80 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Variant</th>
                      <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Price</th>
                      <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {variants.map(v => (
                      <tr key={v._id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {v.images?.[0]?.url ? (
                              <img src={v.images[0].url} alt={v.title} className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Icon icon="mdi:image-outline" className="text-gray-400 w-4 h-4" />
                              </div>
                            )}
                            <span className="font-semibold text-gray-800">{v.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">${v.price?.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${v.stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                            {v.stock} in stock
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            )}
          </div>
        </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Images */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Icon icon="mdi:image-multiple-outline" className="w-4 h-4 text-primary-500" />
                Images
                {allImages.length > 0 && (
                  <span className="ml-auto text-xs font-medium text-gray-400">{allImages.length} photo{allImages.length !== 1 ? 's' : ''}</span>
                )}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {allImages.map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl border border-gray-100 overflow-hidden bg-gray-50 relative">
                    <img src={img.url} alt="Product" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] rounded font-medium">Main</span>
                    )}
                  </div>
                ))}
              </div>
              {allImages.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No images available</p>
              )}
            </div>

          {/* Videos card — shown only if product has videos */}
          {product?.videos?.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Icon icon="mdi:video-outline" className="w-4 h-4 text-primary-500" />
                Videos
                <span className="ml-auto text-xs font-medium text-gray-400">
                  {product.videos.length} video{product.videos.length !== 1 ? 's' : ''}
                </span>
              </h2>
              <div className="space-y-3">
                {product.videos.map((vid, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-gray-100 bg-gray-900">
                    <video
                      src={vid.url}
                      controls
                      className="w-full max-h-48 object-contain"
                      preload="metadata"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Icon icon="mdi:chart-box-outline" className="w-4 h-4 text-primary-500" />
              Summary
            </h2>
            <div className="space-y-3">
               <div className="flex justify-between items-center py-2 border-b border-gray-50">
                 <span className="text-xs font-semibold text-gray-400 uppercase">Status</span>
                 <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                   {product.isActive ? "Active" : "Inactive"}
                 </span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-gray-50">
                 <span className="text-xs font-semibold text-gray-400 uppercase">Total Stock</span>
                 <span className="text-sm font-bold text-gray-800">{product.summary?.totalStock || 0}</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-gray-50">
                 <span className="text-xs font-semibold text-gray-400 uppercase">Variants</span>
                 <span className="text-sm font-bold text-gray-800">{variants.length}</span>
               </div>
               {/* Warranty badge */}
               <div className="flex justify-between items-center py-2">
                 <span className="text-xs font-semibold text-gray-400 uppercase">Warranty</span>
                 {product.warranty?.type === "yes" ? (
                   <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                     <Icon icon="mdi:shield-check" className="w-3.5 h-3.5" />
                     {product.warranty.months}m warranty
                   </span>
                 ) : (
                   <span className="px-2 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-400">None</span>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
