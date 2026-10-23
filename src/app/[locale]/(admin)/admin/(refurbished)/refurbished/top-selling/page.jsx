"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

// ─── Currency Formatter ──────────────────────────────────────────────────────
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₺0';
  return `₺${Number(amount).toLocaleString('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

// ─── Confirm Delete Dialog ───────────────────────────────────────────────────
function ConfirmDialog({ open, brandName, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-7 w-full max-w-md border border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
            <Icon icon="lucide:alert-triangle" className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Remove Top Selling Brand?</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Are you sure you want to remove <strong className="text-gray-800">{brandName}</strong> and its curated products from the top selling section?
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
          >
            {loading && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
            Remove Brand
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Brand Picker Modal ──────────────────────────────────────────────
function SelectBrandModal({ open, onClose, onBrandSelected }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchBrands = useCallback(async (searchTerm = '') => {
    if (!open) return;
    setLoading(true);
    try {
      const trimmed = searchTerm.trim().replace(/\s+/g, ' ');
      const url = trimmed
        ? `/admin/refurbish/top-selling-brands/brands?search=${encodeURIComponent(trimmed)}`
        : '/admin/refurbish/top-selling-brands/brands';
      const res = await axiosInstance.get(url);
      setBrands(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load refurbish brands:', err);
      toast.error('Failed to load refurbish brands');
    } finally {
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      fetchBrands(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, open, fetchBrands]);

  const filtered = brands;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Icon icon="mdi:tag-outline" className="text-primary-600 w-6 h-6" />
              Select Refurbish Brand
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Pick a brand you have added to configure its top selling products
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition cursor-pointer"
          >
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="relative">
            <Icon
              icon="lucide:search"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search refurbish brand by name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Brands List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin" />
              <span className="text-sm text-gray-500">Loading your brands...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Icon icon="mdi:tag-off-outline" className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">No brands found matching "{search}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filtered.map((brand) => (
                <button
                  key={brand._id}
                  onClick={() => onBrandSelected(brand)}
                  className="p-4 rounded-2xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50/40 hover:shadow-md transition duration-200 text-left flex items-center gap-3.5 group cursor-pointer bg-white"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 p-1 group-hover:bg-white">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Icon icon="mdi:cellphone" className="text-2xl text-gray-400 group-hover:text-primary-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-800 text-sm truncate group-hover:text-primary-700">
                        {brand.name}
                      </h4>
                      {brand.isConfigured && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full">
                          Configured
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {brand.availableProductsCount} available products
                    </p>
                  </div>
                  <Icon
                    icon="lucide:arrow-right"
                    className="w-4 h-4 text-gray-300 group-hover:text-primary-600 group-hover:translate-x-1 transition flex-shrink-0"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Product Picker Modal for Selected Brand ─────────────────────────
function SelectProductsModal({ open, onClose, brand, onSaveSuccess }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Fetch products from DB (with optional search)
  const fetchProducts = useCallback(
    async (searchTerm = '', initialLoad = false) => {
      if (!open || !brand?._id) return;
      setLoading(true);
      try {
        const trimmed = searchTerm.trim().replace(/\s+/g, ' ');
        const url = trimmed
          ? `/admin/refurbish/top-selling-brands/brands/${brand._id}/products?search=${encodeURIComponent(trimmed)}`
          : `/admin/refurbish/top-selling-brands/brands/${brand._id}/products`;
        const res = await axiosInstance.get(url);
        const prodList = res.data?.data?.products || [];
        setProducts(prodList);

        if (initialLoad) {
          const preSelected = new Set(
            prodList.filter((p) => p.isSelected).map((p) => p._id)
          );
          setSelectedIds(preSelected);
        }
      } catch (err) {
        console.error('Failed to load brand products:', err);
        toast.error('Failed to load products for this brand');
      } finally {
        setLoading(false);
      }
    },
    [open, brand]
  );

  // Initial load
  useEffect(() => {
    if (open && brand?._id) {
      setSearch('');
      fetchProducts('', true);
    }
  }, [open, brand?._id]);

  // Debounced DB search when user types in product search
  useEffect(() => {
    if (!open || !brand?._id) return;
    const timer = setTimeout(() => {
      fetchProducts(search, false);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleProduct = (productId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      products.forEach((p) => next.add(p._id));
      return next;
    });
  };

  const handleDeselectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      products.forEach((p) => next.delete(p._id));
      return next;
    });
  };

  const handleSave = async () => {
    if (!brand?._id) return;
    setSaving(true);
    try {
      const productIds = Array.from(selectedIds);
      await axiosInstance.post('/admin/refurbish/top-selling-brands', {
        brandId: brand._id,
        productIds,
        isActive: true,
      });

      toast.success(
        `Top selling products for ${brand.name} saved successfully!`
      );
      onSaveSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save top selling products:', err);
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products;

  if (!open || !brand) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center p-1.5 shadow-sm">
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Icon icon="mdi:tag" className="w-6 h-6 text-primary-600" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Select Products for {brand.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Showing only products associated with <strong className="text-gray-800">{brand.name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition cursor-pointer"
          >
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Icon
              icon="lucide:search"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by title or model number..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
              {selectedIds.size} of {products.length} selected
            </span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 px-2.5 py-1.5 hover:bg-primary-50 rounded-lg transition cursor-pointer"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-2.5 py-1.5 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin" />
              <span className="text-sm text-gray-500">Loading products for {brand.name}...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 p-8">
              <Icon icon="mdi:package-variant-closed" className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-700 font-semibold">No associated products found</p>
              <p className="text-gray-400 text-xs mt-1">
                There are no active products added under {brand.name} yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredProducts.map((prod) => {
                const isSelected = selectedIds.has(prod._id);
                return (
                  <div
                    key={prod._id}
                    onClick={() => toggleProduct(prod._id)}
                    className={`relative rounded-2xl p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary-500 bg-white ring-2 ring-primary-500/20 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Top Row: Checkbox */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition border ${
                          isSelected
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <Icon icon="lucide:check" className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      {prod.stock !== undefined && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          Stock: {prod.stock}
                        </span>
                      )}
                    </div>

                    {/* Image & Title */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Icon icon="mdi:cellphone" className="text-2xl text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate" title={prod.title}>
                          {prod.title}
                        </h4>
                        {prod.modelNumber && (
                          <p className="text-xs text-gray-400 font-mono truncate mt-0.5">
                            {prod.modelNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Prices */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                          Price
                        </span>
                        <span className="font-bold text-primary-700">
                          {formatCurrency(prod.price)}
                        </span>
                      </div>
                      {prod.stock > 0 && (
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                            Stock
                          </span>
                          <span className="font-medium text-gray-600">
                            {prod.stock}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-white flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <span className="font-bold text-gray-900">{selectedIds.size}</span> products selected
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {saving && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
              Save Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────
export default function TopSellingBrandsPage() {
  const [configuredBrands, setConfiguredBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // Modals state
  const [isSelectBrandOpen, setIsSelectBrandOpen] = useState(false);
  const [selectedBrandForProducts, setSelectedBrandForProducts] = useState(null);
  const [deleteConfirmBrand, setDeleteConfirmBrand] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [expandedBrandIds, setExpandedBrandIds] = useState(new Set());

  // Fetch all configured top selling brands (with DB-level search)
  const fetchTopSellingBrands = useCallback(async (searchTerm = '') => {
    setLoading(true);
    try {
      const trimmed = searchTerm.trim().replace(/\s+/g, ' ');
      const url = trimmed
        ? `/admin/refurbish/top-selling-brands?search=${encodeURIComponent(trimmed)}`
        : '/admin/refurbish/top-selling-brands';
      const res = await axiosInstance.get(url);
      const data = res.data?.data || [];
      setConfiguredBrands(data);

      // Auto expand first brand if available
      if (data.length > 0) {
        setExpandedBrandIds(new Set([data[0].brandId]));
      }
    } catch (err) {
      console.error('Failed to load top selling brands:', err);
      toast.error('Failed to load top selling brands');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTopSellingBrands(searchFilter);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchFilter, fetchTopSellingBrands]);

  // Toggle active/inactive
  const handleToggleStatus = async (brand) => {
    try {
      const res = await axiosInstance.patch(
        `/admin/refurbish/top-selling-brands/${brand.brandId}/toggle`
      );
      toast.success(res.data?.message || 'Status updated');
      fetchTopSellingBrands(searchFilter);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      toast.error('Failed to toggle brand status');
    }
  };

  // Remove brand
  const handleConfirmDelete = async () => {
    if (!deleteConfirmBrand) return;
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(
        `/admin/refurbish/top-selling-brands/${deleteConfirmBrand.brandId}`
      );
      toast.success(`${deleteConfirmBrand.brandName} removed from top selling!`);
      setDeleteConfirmBrand(null);
      fetchTopSellingBrands(searchFilter);
    } catch (err) {
      console.error('Failed to delete brand:', err);
      toast.error('Failed to delete brand from top selling');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Quick remove product from a brand
  const handleRemoveProduct = async (brandId, productId) => {
    try {
      await axiosInstance.delete(
        `/admin/refurbish/top-selling-brands/${brandId}/products/${productId}`
      );
      toast.success('Product removed from brand');
      fetchTopSellingBrands(searchFilter);
    } catch (err) {
      console.error('Failed to remove product:', err);
      toast.error('Failed to remove product');
    }
  };

  const toggleExpand = (brandId) => {
    setExpandedBrandIds((prev) => {
      const next = new Set(prev);
      if (next.has(brandId)) {
        next.delete(brandId);
      } else {
        next.add(brandId);
      }
      return next;
    });
  };

  const filtered = configuredBrands;

  const totalCuratedProducts = useMemo(() => {
    return configuredBrands.reduce((sum, b) => sum + (b.totalProducts || 0), 0);
  }, [configuredBrands]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Icon icon="mdi:star-circle" className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Top Selling Refurbished Brands & Models
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Select your added refurbish brands and curate multiple products to feature on the website
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={fetchTopSellingBrands}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Icon icon="lucide:refresh-cw" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setIsSelectBrandOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg shadow-primary-600/20"
          >
            <Icon icon="lucide:plus" className="w-4 h-4" />
            Add Top Selling Brand
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <Icon icon="mdi:tag-multiple-outline" className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{configuredBrands.length}</div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Top Brands</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Icon icon="mdi:cellphone-check" className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{totalCuratedProducts}</div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Curated Products</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Icon icon="mdi:check-decagram" className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">
              {configuredBrands.filter((b) => b.isActive).length}
            </div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active In Front</div>
          </div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Icon
            icon="lucide:search"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
          />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search configured top selling brands..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>

        <div className="text-xs text-gray-500 font-semibold">
          Showing {filtered.length} brands
        </div>
      </div>

      {/* ── Configured Brands List ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-3xl border border-gray-100">
          <Icon icon="mdi:loading" className="w-10 h-10 text-primary-600 animate-spin" />
          <span className="text-sm font-semibold text-gray-500">Loading top selling brands...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <Icon icon="mdi:star-outline" className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">No Top Selling Brands Added Yet</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
              Click the button below to pick a brand from your refurbish brands and select its top selling products.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsSelectBrandOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Icon icon="lucide:plus" className="w-4 h-4" />
            Add First Brand
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((brand) => {
            const isExpanded = expandedBrandIds.has(brand.brandId);
            const productList = brand.products || [];

            return (
              <div
                key={brand.brandId}
                className="bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition duration-200 overflow-hidden"
              >
                {/* Brand Card Header */}
                <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-50/60 to-white">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center p-1.5 shadow-xs flex-shrink-0">
                      {brand.brandLogo ? (
                        <img
                          src={brand.brandLogo}
                          alt={brand.brandName}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Icon icon="mdi:tag" className="w-7 h-7 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900">{brand.brandName}</h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-mono">
                          /{brand.brandSlug}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                            brand.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              brand.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                            }`}
                          />
                          {brand.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <strong className="text-gray-800">{productList.length}</strong> Selected Products
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(brand)}
                      title={brand.isActive ? 'Deactivate brand' : 'Activate brand'}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        brand.isActive ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          brand.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>

                    {/* Manage Products Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedBrandForProducts({
                          _id: brand.brandId,
                          name: brand.brandName,
                          slug: brand.brandSlug,
                          logoUrl: brand.brandLogo,
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Icon icon="lucide:edit-3" className="w-3.5 h-3.5" />
                      Manage Products ({productList.length})
                    </button>

                    {/* Remove Brand Button */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmBrand(brand)}
                      className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                      title="Remove Brand"
                    >
                      <Icon icon="lucide:trash-2" className="w-4 h-4" />
                    </button>

                    {/* Expand/Collapse */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(brand.brandId)}
                      className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition cursor-pointer"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      <Icon
                        icon="lucide:chevron-down"
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Selected Products Grid (Expandable) */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Icon icon="mdi:cellphone-check" className="text-primary-600 w-4 h-4" />
                        Selected Products for {brand.brandName} ({productList.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedBrandForProducts({
                            _id: brand.brandId,
                            name: brand.brandName,
                            slug: brand.brandSlug,
                            logoUrl: brand.brandLogo,
                          })
                        }
                        className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Icon icon="lucide:plus" className="w-3.5 h-3.5" />
                        Add / Change Products
                      </button>
                    </div>

                    {productList.length === 0 ? (
                      <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-6">
                        <Icon icon="mdi:package-variant-closed" className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">
                          No products selected for this brand yet. Click "Manage Products" to select products.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {productList.map((prod) => (
                          <div
                            key={prod._id}
                            className="relative group rounded-2xl p-3.5 border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-primary-200 hover:shadow-sm transition flex flex-col justify-between"
                          >
                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(brand.brandId, prod._id)}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                              title="Remove this product"
                            >
                              <Icon icon="lucide:x" className="w-3.5 h-3.5" />
                            </button>

                            {/* Product Info */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                                {prod.image ? (
                                  <img
                                    src={prod.image}
                                    alt={prod.title}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <Icon icon="mdi:cellphone" className="text-xl text-gray-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0 pr-4">
                                <h5 className="font-bold text-gray-900 text-xs truncate" title={prod.title}>
                                  {prod.title}
                                </h5>
                                {prod.modelNumber && (
                                  <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5">
                                    {prod.modelNumber}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Price */}
                            <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                              <div>
                                <span className="text-[9px] text-gray-400 uppercase font-semibold block">
                                  Price
                                </span>
                                <span className="font-bold text-primary-700 text-xs">
                                  {formatCurrency(prod.price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Step 1 Modal: Select Brand ── */}
      <SelectBrandModal
        open={isSelectBrandOpen}
        onClose={() => setIsSelectBrandOpen(false)}
        onBrandSelected={(brand) => {
          setIsSelectBrandOpen(false);
          setSelectedBrandForProducts(brand);
        }}
      />

      {/* ── Step 2 Modal: Select Products for Brand ── */}
      <SelectProductsModal
        open={!!selectedBrandForProducts}
        onClose={() => setSelectedBrandForProducts(null)}
        brand={selectedBrandForProducts}
        onSaveSuccess={fetchTopSellingBrands}
      />

      {/* ── Confirm Delete Brand Modal ── */}
      <ConfirmDialog
        open={!!deleteConfirmBrand}
        brandName={deleteConfirmBrand?.brandName}
        onCancel={() => setDeleteConfirmBrand(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
