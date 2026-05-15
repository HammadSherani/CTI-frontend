"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

/* ─── Attribute icon map ──────────────────────────────────── */
const ATTR_ICON_MAP = {
  color: { icon: "mdi:palette-outline", color: "bg-pink-50 text-pink-500" },
  size: { icon: "mdi:ruler-square", color: "bg-blue-50 text-blue-500" },
  weight: { icon: "mdi:weight", color: "bg-amber-50 text-amber-500" },
  material: { icon: "mdi:texture-box", color: "bg-emerald-50 text-emerald-600" },
  dimensions: { icon: "mdi:cube-scan", color: "bg-violet-50 text-violet-500" },
  warranty: { icon: "mdi:shield-check-outline", color: "bg-green-50 text-green-600" },
  "brand model": { icon: "mdi:barcode-scan", color: "bg-gray-100 text-gray-600" },
};

function getAttrMeta(name = "") {
  return ATTR_ICON_MAP[name.toLowerCase()] || { icon: "mdi:tag-outline", color: "bg-indigo-50 text-indigo-500" };
}

/* ─── Confirm Delete Dialog ──────────────────────────────── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <Icon icon="mdi:trash-can-outline" className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base mb-1">Delete Product</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 text-sm font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton Loader ────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded-xl w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-3">
          <div className="aspect-square bg-gray-200 rounded-3xl" />
          <div className="grid grid-cols-4 gap-2">{[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-xl" />)}</div>
        </div>
        <div className="lg:col-span-3 space-y-5">
          <div className="h-8 bg-gray-200 rounded-xl w-3/4" />
          <div className="h-4 bg-gray-200 rounded-xl w-1/2" />
          <div className="h-20 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-2xl" />)}</div>
          <div className="h-40 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/* ─── Product Detail Page ────────────────────────────────── */
export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axiosInstance.get(`/seller/product/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProduct(data.data);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to fetch product");
        router.push("/seller/product");
      } finally {
        setLoading(false);
      }
    };
    if (token && id) fetchProduct();
  }, [id, token, router]);

  const handleToggleStatus = async () => {
    setToggling(true);
    try {
      const { data } = await axiosInstance.patch(`/seller/product/toggle/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setProduct((prev) => ({ ...prev, isActive: data.data.isActive }));
      toast.success(data.message || "Status updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to toggle status");
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/seller/product/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Product deleted successfully");
      router.push("/seller/product");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
      setConfirm(false);
    }
  };

  if (loading) return <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]"><DetailSkeleton /></div>;
  if (!product) return null;

  const infoCards = [
    {
      label: "Price",
      value: `$${product.price?.toFixed(2)}`,
      sub: product.isDiscounted ? `Discounted: $${product.discountPrice?.toFixed(2)}` : "No discount",
      icon: "mdi:tag-outline",
      color: "bg-violet-50 text-violet-600",
      highlight: product.isDiscounted,
    },
    {
      label: "Stock",
      value: `${product.stock} units`,
      sub: product.stock === 0 ? "Out of stock" : product.stock < 5 ? "Low stock" : "In stock",
      icon: "mdi:cube-outline",
      color: product.stock === 0 ? "bg-red-50 text-red-600" : product.stock < 5 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Category",
      value: product.categoryId?.title || "—",
      sub: product.subCategoryId?.title || "No subcategory",
      icon: "mdi:shape-outline",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Brand",
      value: product.brandId?.title || "—",
      sub: product.sku ? `SKU: ${product.sku}` : null,
      icon: "mdi:medal-outline",
      color: "bg-orange-50 text-orange-600",
    },
  ];

  const validAttributes = (product.attributes || []).filter(
    (a) => a.name && (a.value !== undefined && a.value !== null && String(a.value).trim() !== "")
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/seller/product")} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-0.5">
              <span className="hover:text-primary-600 cursor-pointer transition-colors" onClick={() => router.push("/seller/product")}>Products</span>
              <Icon icon="mdi:chevron-right" className="w-4 h-4" />
              <span className="text-gray-600 truncate max-w-[200px]">{product.title}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Product Details</h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button onClick={handleToggleStatus} disabled={toggling}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            {toggling ? <Icon icon="mdi:loading" className="animate-spin w-4 h-4" /> : <Icon icon={product.isActive ? "mdi:eye-off-outline" : "mdi:eye-outline"} className="w-4 h-4" />}
            {product.isActive ? "Deactivate" : "Activate"}
          </button>
          <button onClick={() => router.push(`/seller/product/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
          >
            <Icon icon="mdi:pencil-outline" className="w-4 h-4" />
            Edit Product
          </button>
          <button onClick={() => setConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all"
          >
            <Icon icon="mdi:trash-can-outline" className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Images */}
        <div className="lg:col-span-2 space-y-3">
          <div className="aspect-square bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            {product.images?.[activeImage]?.url ? (
              <img src={product.images[activeImage].url} alt={product.title} className="w-full h-full object-contain p-4" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Icon icon="mdi:image-outline" className="w-20 h-20" />
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`aspect-square rounded-xl border-2 overflow-hidden transition-all ${activeImage === i ? "border-primary-500 shadow-md" : "border-gray-100 hover:border-gray-300"}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:col-span-3 space-y-6">
          {/* Title + Status */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">{product.title}</h2>
              <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold mt-1 ${product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {product.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            {product.shortDescription && <p className="text-gray-500 text-sm leading-relaxed">{product.shortDescription}</p>}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            {infoCards.map((card, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.color}`}>
                    <Icon icon={card.icon} className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-gray-400">{card.label}</span>
                </div>
                <p className="font-bold text-gray-900 text-lg">{card.value}</p>
                {card.sub && <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>}
              </div>
            ))}
          </div>

          {/* ── ATTRIBUTES SECTION ── */}
          {validAttributes.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Icon icon="mdi:tune-variant" className="w-5 h-5 text-primary-500" />
                  Product Specifications
                </h3>
                <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs font-bold rounded-full">
                  {validAttributes.length} specs
                </span>
              </div>

              {/* Grid view */}
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {validAttributes.map((attr, i) => {
                    const meta = getAttrMeta(attr.name);
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                          <Icon icon={meta.icon} className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide leading-none mb-0.5">{attr.name}</p>
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {String(attr.value)}{attr.unit ? <span className="text-gray-400 font-normal ml-1">{attr.unit}</span> : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Table view (full breakdown) */}
              <div className="border-t border-gray-50 mx-5 mb-5">
                <table className="w-full text-sm mt-4">
                  <tbody>
                    {validAttributes.map((attr, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-transparent" : "bg-gray-50/50"}>
                        <td className="py-2 pr-4 text-gray-500 font-medium w-1/3 text-xs">{attr.name}</td>
                        <td className="py-2 text-gray-800 font-semibold text-xs">
                          {String(attr.value)}{attr.unit ? <span className="text-gray-400 font-normal ml-1">{attr.unit}</span> : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Icon icon="mdi:text-box-outline" className="w-5 h-5 text-gray-400" />
              Description
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Icon icon="mdi:label-multiple-outline" className="w-5 h-5 text-gray-400" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Icon icon="mdi:information-outline" className="w-5 h-5 text-gray-400" />
              Meta Info
            </h3>
            <div className="space-y-2.5">
              {[
                { label: "Slug", value: product.slug || "—", mono: true },
                { label: "SKU", value: product.sku || "—", mono: true },
                { label: "Created", value: new Date(product.createdAt).toLocaleDateString() },
                { label: "Updated", value: new Date(product.updatedAt).toLocaleDateString() },
                { label: "Ratings", value: `⭐ ${product.ratings?.average?.toFixed(1) || "0.0"} (${product.ratings?.count || 0} reviews)` },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{label}</span>
                  <span className={`text-gray-700 ${mono ? "font-mono bg-gray-50 px-2 py-0.5 rounded text-xs" : ""}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {confirm && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${product.title}"? This action can be undone by admin.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(false)}
        />
      )}
    </div>
  );
}