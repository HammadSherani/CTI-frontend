"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Button from "@/components/partials/admin/ecom/myButton";
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';

/* ─── Product Selector Modal ─────────────────────────────── */
function ProductSelectorModal({ open, onClose, onSelect, selectedIds, token }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [localSelected, setLocalSelected] = useState([...selectedIds]);

  useEffect(() => {
    if (open) {
      setLocalSelected([...selectedIds]);
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/admin/refurbish/products?isActive=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(data.data || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (id) => {
    setLocalSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filtered = products.filter((p) => {
    const text = `${p.title || ""} ${p.sku || ""} ${p.categoryId?.name || ""} ${p.brandId?.name || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Select Products</h3>
              <p className="text-sm text-gray-500">{localSelected.length} products selected</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
              <Icon icon="mdi:close" className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="relative">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Icon icon="mdi:loading" className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Icon icon="mdi:package-variant" className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No products found</p>
            </div>
          ) : (
            filtered.map((product) => {
              const isSelected = localSelected.includes(product._id);
              return (
                <button
                  key={product._id}
                  onClick={() => toggleProduct(product._id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${isSelected
                      ? "border-primary-300 bg-primary-50 ring-1 ring-primary-200"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? "bg-primary-600 border-primary-600" : "border-gray-300"
                    }`}>
                    {isSelected && <Icon icon="mdi:check" className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <Icon icon="mdi:cellphone" className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{product.title}</p>
                    <p className="text-xs text-gray-400">SKU: {product.sku || "—"} • {product.categoryId?.name || "—"}</p>
                  </div>
                  {product.brandId?.name && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600 flex-shrink-0">{product.brandId.name}</span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm bg-gray-100 rounded-xl hover:bg-gray-200 font-medium">
            Cancel
          </button>
          <button
            onClick={() => { onSelect(localSelected); onClose(); }}
            className="px-5 py-2.5 text-sm text-white bg-primary-600 rounded-xl hover:bg-primary-700 font-medium"
          >
            Confirm Selection ({localSelected.length})
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function EditFlashDealPage() {
  const { id: dealId } = useParams();

  const [form, setForm] = useState({
    title: "",
    description: "",
    discountPercentage: 10,
    startDate: "",
    endDate: "",
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productDetails, setProductDetails] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((s) => s.auth);
  const router = useRouter();

  // Fetch deal data
  useEffect(() => {
    if (token && dealId) fetchDeal();
  }, [token, dealId]);

  const fetchDeal = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/admin/refurbish/flash-deals/${dealId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const deal = data.data;
      if (deal) {
        const toLocalDatetime = (dateStr) => {
          const d = new Date(dateStr);
          const offset = d.getTimezoneOffset() * 60000;
          return new Date(d - offset).toISOString().slice(0, 16);
        };
        setForm({
          title: deal.title || "",
          description: deal.description || "",
          discountPercentage: deal.discountPercentage || 10,
          startDate: deal.startDate ? toLocalDatetime(deal.startDate) : "",
          endDate: deal.endDate ? toLocalDatetime(deal.endDate) : "",
        });
        const productIds = (deal.products || []).map((p) => (typeof p === "string" ? p : p._id));
        setSelectedProducts(productIds);
      }
    } catch {
      toast.error("Failed to load flash deal");
    } finally {
      setLoading(false);
    }
  };

  // Fetch selected product details for preview
  const fetchProductDetails = useCallback(async (ids) => {
    if (ids.length === 0) {
      setProductDetails([]);
      return;
    }
    try {
      const { data } = await axiosInstance.get('/admin/refurbish/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const all = data.data || [];
      setProductDetails(all.filter((p) => ids.includes(p._id)));
    } catch {
      /* silently fail */
    }
  }, [token]);

  useEffect(() => {
    if (!loading) fetchProductDetails(selectedProducts);
  }, [selectedProducts, fetchProductDetails, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Please enter a deal title");
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast.error("Please select start and end dates");
      return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      toast.error("End date must be after start date");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.put(`/admin/refurbish/flash-deals/${dealId}`, {
        title: form.title,
        description: form.description,
        discountPercentage: Number(form.discountPercentage),
        startDate: form.startDate,
        endDate: form.endDate,
        products: selectedProducts,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Flash Deal updated successfully!");
      router.push("/admin/refurbished/flash-deals");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update flash deal");
    } finally {
      setSubmitting(false);
    }
  };

  const removeProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((x) => x !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icon icon="mdi:loading" className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3 text-sm">
          <Icon icon="mdi:arrow-left" className="w-4 h-4" />
          Back to Flash Deals
        </button>
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
          <Icon icon="mdi:flash" className="w-8 h-8 text-amber-500" />
          Edit Flash Deal
        </h1>
        <p className="text-gray-500 text-sm mt-1">Update flash deal details and products</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Deal Info Card */}
        <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Icon icon="mdi:information-outline" className="w-5 h-5 text-primary-500" />
            Deal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deal Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Summer Sale, Eid Special"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (Optional)</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Brief description of the deal..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Discount & Schedule Card */}
        <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Icon icon="mdi:percent-outline" className="w-5 h-5 text-emerald-500" />
            Discount & Schedule
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Percentage *</label>
              <div className="relative">
                <input
                  type="number"
                  name="discountPercentage"
                  value={form.discountPercentage}
                  onChange={handleChange}
                  min="1"
                  max="90"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">%</span>
              </div>
              {/* Slider */}
              <input
                type="range"
                min="1"
                max="90"
                value={form.discountPercentage}
                onChange={(e) => setForm((prev) => ({ ...prev, discountPercentage: e.target.value }))}
                className="w-full mt-2 accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>1%</span>
                <span className="font-bold text-primary-600">{form.discountPercentage}%</span>
                <span>90%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date *</label>
              <input
                type="datetime-local"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date *</label>
              <input
                type="datetime-local"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Icon icon="mdi:package-variant" className="w-5 h-5 text-purple-500" />
              Products
              {selectedProducts.length > 0 && (
                <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {selectedProducts.length}
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={() => setShowProductModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
            >
              <Icon icon="mdi:plus" className="w-4 h-4" />
              Select Products
            </button>
          </div>

          {/* Selected Products Preview */}
          {productDetails.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <Icon icon="mdi:package-variant" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">No products selected yet</p>
              <p className="text-gray-400 text-xs mt-1">Click "Select Products" to add products to this deal</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {productDetails.map((product) => (
                <div key={product._id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-gray-50/50 group">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex-shrink-0 flex items-center justify-center border border-gray-100">
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <Icon icon="mdi:cellphone" className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-xs truncate">{product.title}</p>
                    <p className="text-[10px] text-gray-400">SKU: {product.sku || "—"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProduct(product._id)}
                    className="p-1 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Icon icon="mdi:close" className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 text-sm bg-gray-100 rounded-xl hover:bg-gray-200 font-medium"
          >
            Cancel
          </button>
          <Button type="submit" variant="primary" disabled={submitting} className="h-11 px-8">
            {submitting ? (
              <span className="flex items-center gap-2">
                <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                Updating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Icon icon="mdi:flash" className="w-4 h-4" />
                Update Flash Deal
              </span>
            )}
          </Button>
        </div>
      </form>

      {/* Product Selector Modal */}
      <ProductSelectorModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSelect={setSelectedProducts}
        selectedIds={selectedProducts}
        token={token}
      />
    </div>
  );
}
