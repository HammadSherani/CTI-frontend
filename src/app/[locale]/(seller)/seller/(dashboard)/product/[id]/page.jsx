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
  storage: { icon: "mdi:harddisk", color: "bg-violet-50 text-violet-500" },
  ram: { icon: "mdi:memory", color: "bg-amber-50 text-amber-500" },
  material: { icon: "mdi:texture-box", color: "bg-emerald-50 text-emerald-600" },
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

/* ─── Variant Table Component ────────────────────────────── */
function VariantsTable({ variants = [] }) {
  if (!variants.length) return null;

  // Detect dimension name (assumes all variants share the same dimension)
  const dimensionName = variants[0]?.attributes?.[0]?.name || "Option";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Icon icon="mdi:layers-triple-outline" className="w-5 h-5 text-primary-500" />
          Product Variations ({dimensionName})
        </h3>
        <span className="px-3 py-1 bg-primary-100 text-primary-700 text-[10px] font-black uppercase rounded-full tracking-wider">
          {variants.length} Options
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">{dimensionName}</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Price</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Stock</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Disc%</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Sale Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {variants.map((v, i) => {
              const val = v.attributes?.[0]?.value || "—";
              const hex = v.attributes?.[0]?.colorHex;
              const salePrice = v.price - (v.price * (v.discountPercentage || 0) / 100);
              return (
                <tr key={i} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {hex && <span className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: hex }} />}
                      <span className="font-bold text-gray-800">{val}</span>
                      {v.isDefault && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter">Default</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-600">${v.price.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${v.stock < 5 ? "text-amber-600" : "text-gray-700"}`}>{v.stock}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-red-500">{v.discountPercentage > 0 ? `${v.discountPercentage}%` : "—"}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-black text-emerald-600">${salePrice.toFixed(2)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

  const hasVariants = product.hasVariants && product.variants?.length > 1;
  const minPrice = hasVariants ? Math.min(...product.variants.map(v => v.price)) : product.price;
  const maxPrice = hasVariants ? Math.max(...product.variants.map(v => v.price)) : product.price;

  const infoCards = [
    {
      label: "Inventory Type",
      value: product.hasVariants ? "Variant Product" : "Simple Product",
      sub: product.hasVariants ? "Multiple options" : "Single price/stock",
      icon: product.hasVariants ? "mdi:layers-triple-outline" : "mdi:cube-send",
      color: product.hasVariants ? "bg-primary-50 text-primary-600" : "bg-blue-50 text-blue-600",
    },
    {
      label: hasVariants ? "Price Range" : "Price",
      value: hasVariants
        ? `$${minPrice?.toFixed(2)} - $${maxPrice?.toFixed(2)}`
        : `$${product.price?.toFixed(2)}`,
      sub: product.discountPercentage > 0
        ? `${product.discountPercentage}% off applied`
        : "No active discount",
      icon: "mdi:tag-outline",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Total Stock",
      value: `${product.stock} units`,
      sub: product.stock === 0 ? "Out of stock" : product.stock < 5 ? "Low stock alert" : "Inventory healthy",
      icon: "mdi:package-variant",
      color: product.stock === 0 ? "bg-red-50 text-red-600" : product.stock < 10 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Brand & Category",
      value: product.brandId?.title || "No Brand",
      sub: product.categoryId?.title || "No Category",
      icon: "mdi:medal-outline",
      color: "bg-orange-50 text-orange-600",
    },
  ];

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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Product Overview</h1>
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

        {/* Images Left Col */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-square bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xl shadow-gray-200/40 group relative">
            {product.images?.[activeImage]?.url ? (
              <img src={product.images[activeImage].url} alt={product.title} className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Icon icon="mdi:image-outline" className="w-24 h-24" />
              </div>
            )}
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/50 shadow-sm">
              <span className={`text-[10px] font-black uppercase tracking-widest ${product.isActive ? "text-emerald-600" : "text-gray-500"}`}>
                {product.isActive ? "Live" : "Draft"}
              </span>
            </div>
          </div>

          {product.images?.length > 1 && (
            <div className="flex flex-wrap gap-3 p-2 bg-white/50 rounded-2xl border border-gray-100">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${activeImage === i ? "border-primary-500 scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Right Col */}
        <div className="lg:col-span-3 space-y-6">

          {/* Header Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">{product.brandId?.title || "Generic"}</span>
              <span className="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black rounded-lg uppercase tracking-wider">{product.categoryId?.title}</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 leading-none mb-3">{product.title}</h2>
            {product.shortDescription && <p className="text-gray-500 text-sm leading-relaxed max-w-xl">{product.shortDescription}</p>}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {infoCards.map((card, i) => (
              <div key={i} className="bg-white rounded-[1.5rem] border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${card.color} shadow-sm`}>
                    <Icon icon={card.icon} className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{card.label}</span>
                </div>
                <p className="font-black text-gray-900 text-xl leading-none mb-1">{card.value}</p>
                {card.sub && <p className="text-[11px] text-gray-400 font-medium leading-none">{card.sub}</p>}
              </div>
            ))}
          </div>

          {/* ── Variants Section ── */}
          {product.hasVariants && (
            <VariantsTable variants={product.variants} />
          )}

          {/* Description */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-7 shadow-sm">
            <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <Icon icon="mdi:text-box-outline" className="w-5 h-5 text-primary-500" />
              Product Description
            </h3>
            <div className="prose prose-sm prose-gray max-w-none text-gray-600 leading-relaxed">
              <p className="whitespace-pre-line text-sm">{product.description}</p>
            </div>
          </div>

          {/* Meta Info Mini-Table */}
          <div className="bg-gray-900 rounded-[2rem] p-7 text-white shadow-2xl shadow-gray-900/20">
            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
              <Icon icon="mdi:information-variant" className="w-4 h-4" />
              Technical Meta Info
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-8">
              {[
                { label: "SKU ID", value: product.sku || "N/A" },
                { label: "Created On", value: new Date(product.createdAt).toLocaleDateString() },
                { label: "Last Update", value: new Date(product.updatedAt).toLocaleDateString() },
                { label: "Slug", value: product.slug, full: true },
              ].map((m) => (
                <div key={m.label} className={m.full ? "col-span-2 sm:col-span-3" : ""}>
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">{m.label}</div>
                  <div className="text-sm font-bold truncate opacity-90">{m.value}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {confirm && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${product.title}"? This will move it to trash.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(false)}
        />
      )}
    </div>
  );
}