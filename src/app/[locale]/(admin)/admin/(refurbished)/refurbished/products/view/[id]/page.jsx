"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

export default function AdminViewRefurbishedProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useSelector((s) => s.auth);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;
    axiosInstance
      .get(`/admin/refurbish/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => setProduct(data.data))
      .catch(() => {
        toast.error("Failed to load product");
        router.push("/admin/refurbished/products");
      })
      .finally(() => setLoading(false));
  }, [id, token, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFB]">
        <Icon icon="mdi:loading" className="animate-spin w-8 h-8 text-primary-500" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">
      <div className="mb-7 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
        >
          <Icon icon="mdi:arrow-left" className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <div className="text-xs text-gray-400 mb-0.5 flex items-center gap-1.5">
            <span
              className="hover:text-primary-600 cursor-pointer"
              onClick={() => router.push("/admin/refurbished/products")}
            >
              Refurbished Products
            </span>
            <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5" />
            <span className="text-gray-600">Product Details</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{product.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-4">
              <Icon icon="mdi:information-outline" className="w-4 h-4 text-primary-500" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Category</p>
                <p className="text-sm font-bold text-gray-800">{product.categoryId?.name || "—"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Brand</p>
                <p className="text-sm font-bold text-gray-800">{product.brandId?.name || "—"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</p>
                <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {product.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">SKU</p>
                <p className="text-sm font-bold text-gray-800">{product.sku || "—"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Model No.</p>
                <p className="text-sm font-bold text-gray-800">{product.modelNumber || "—"}</p>
              </div>
            </div>

            {product.shortDescription && (
              <div className="mt-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Short Description</p>
                <p className="text-sm text-gray-700">{product.shortDescription}</p>
              </div>
            )}
            
            <div className="mt-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Description</p>
              <div className="text-sm text-gray-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          </div>

          {product.images && product.images.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-4">
                <Icon icon="mdi:image-multiple-outline" className="w-4 h-4 text-primary-500" />
                Product Images
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {product.images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl border border-gray-100 overflow-hidden bg-gray-50 relative">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    {img.isDefault && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] rounded font-medium">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.videos && product.videos.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-4">
                <Icon icon="mdi:video-outline" className="w-4 h-4 text-primary-500" />
                Product Videos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {product.videos.map((vid, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-900">
                    <video src={vid.url} className="w-full h-32 object-cover opacity-90" controls preload="metadata" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-4">
              <Icon icon="mdi:tag-multiple-outline" className="w-4 h-4 text-primary-500" />
              Tags & Warranty
            </h2>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Tags</p>
              {product.tags && product.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-primary-50 border border-primary-100 text-xs font-bold text-primary-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No tags added</p>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Warranty</p>
              {product.warranty?.type === 'yes' ? (
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:shield-check-outline" className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-bold text-emerald-700">{product.warranty.months} Months</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:shield-off-outline" className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">No Warranty</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-4">
              <Icon icon="mdi:format-list-bulleted" className="w-4 h-4 text-primary-500" />
              Specifications
            </h2>
            {product.attributes?.length > 0 ? (
              <div className="space-y-1.5">
                {product.attributes.map((attr, i) => (
                  <div key={i} className="flex flex-col px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{attr.key}</span>
                    <span className="text-sm font-bold text-gray-900 mt-0.5">
                      {Array.isArray(attr.values) ? attr.values.join(", ") : attr.value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No specifications added</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
