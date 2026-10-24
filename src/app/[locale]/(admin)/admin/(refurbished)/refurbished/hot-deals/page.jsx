"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/helper/currencyFormatter';

// ─── Product Picker Modal ───────────────────────────────────────────────────
function SelectProductModal({ open, onClose, onSelect, currentProductIds = [] }) {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/admin/refurbish/hot-deals/search-products?search=${encodeURIComponent(query)}&limit=30`
      );
      setProducts(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      fetchProducts(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, open, fetchProducts]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Icon icon="mdi:fire" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Select Refurbished Product</h3>
              <p className="text-xs text-gray-500 mt-0.5">Pick a product to feature in Hot Deals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"
          >
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative">
            <Icon icon="lucide:search" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, model number or slug..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Product List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <Icon icon="mdi:loading" className="w-8 h-8 animate-spin mx-auto text-primary-500 mb-2" />
              <p className="text-sm">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Icon icon="lucide:package-open" className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-medium">No refurbished products found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          ) : (
            products.map((prod) => {
              const isAlreadySelected = currentProductIds.includes(prod._id);
              return (
                <div
                  key={prod._id}
                  onClick={() => !isAlreadySelected && onSelect(prod)}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isAlreadySelected
                      ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                      : 'bg-white border-gray-100 hover:border-primary-300 hover:bg-primary-50/20 cursor-pointer shadow-xs hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-white border border-gray-150 p-1 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img
                        src={prod.image || '/assets/placeholder.jpg'}
                        alt={prod.title}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => { e.currentTarget.src = '/assets/placeholder.jpg'; }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">{prod.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        {prod.brandName && <span className="bg-gray-100 px-2 py-0.5 rounded-md">{prod.brandName}</span>}
                        {prod.modelNumber && <span>Model: {prod.modelNumber}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 flex items-center gap-3">
                    <span className="font-bold text-gray-900 text-sm">{formatCurrency(prod.price)}</span>
                    <button
                      type="button"
                      disabled={isAlreadySelected}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        isAlreadySelected
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-primary-600 hover:bg-primary-700 text-white shadow-xs'
                      }`}
                    >
                      {isAlreadySelected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Hot Deals Page ──────────────────────────────────────────────
export default function AdminHotDealsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [title, setTitle] = useState('Hot Deals');

  // Slots array: always 3 items: [slot0, slot1, slot2]
  const [slots, setSlots] = useState([null, null, null]);

  // Modal control
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(null);

  // Fetch initial data
  const fetchHotDeals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/admin/refurbish/hot-deals');
      if (res.data?.success) {
        const data = res.data.data;
        setIsActive(data.isActive ?? true);
        setTitle(data.title || 'Hot Deals');

        const initialSlots = [null, null, null];
        (data.items || []).slice(0, 3).forEach((item, idx) => {
          initialSlots[idx] = {
            productId: item.productId,
            title: item.title,
            slug: item.slug,
            image: item.image,
            modelNumber: item.modelNumber,
            originalPrice: item.originalPrice || 0,
            discountPercentage: item.discountPercentage || 20,
            customBadge: item.customBadge || `% ${item.discountPercentage || 20} İNDİRİM`,
          };
        });
        setSlots(initialSlots);
      }
    } catch (err) {
      console.error('Failed to load hot deals:', err);
      toast.error('Failed to load hot deals data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotDeals();
  }, [fetchHotDeals]);

  // Slot handlers
  const handleOpenPicker = (index) => {
    setActiveSlotIndex(index);
    setModalOpen(true);
  };

  const handleSelectProduct = (product) => {
    if (activeSlotIndex === null) return;

    setSlots((prev) => {
      const copy = [...prev];
      const existingDiscount = copy[activeSlotIndex]?.discountPercentage || 30;
      copy[activeSlotIndex] = {
        productId: product._id,
        title: product.title,
        slug: product.slug,
        image: product.image,
        modelNumber: product.modelNumber,
        originalPrice: product.price || 0,
        discountPercentage: existingDiscount,
        customBadge: `% ${existingDiscount} İNDİRİM`,
      };
      return copy;
    });

    setModalOpen(false);
    setActiveSlotIndex(null);
  };

  const handleRemoveSlot = (index) => {
    setSlots((prev) => {
      const copy = [...prev];
      copy[index] = null;
      return copy;
    });
  };

  const handleDiscountChange = (index, value) => {
    const num = Math.max(1, Math.min(99, Number(value) || 1));
    setSlots((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = {
          ...copy[index],
          discountPercentage: num,
          customBadge: `% ${num} İNDİRİM`,
        };
      }
      return copy;
    });
  };

  // Save handler
  const handleSave = async () => {
    const filledSlots = slots
      .map((s, idx) => (s ? { ...s, sortOrder: idx } : null))
      .filter(Boolean);

    if (filledSlots.length === 0) {
      toast.warn('Please select at least 1 product for Hot Deals.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        isActive,
        items: filledSlots.map((s, idx) => ({
          productId: s.productId,
          discountPercentage: s.discountPercentage,
          customBadge: s.customBadge || `% ${s.discountPercentage} İNDİRİM`,
          sortOrder: idx,
        })),
      };

      const res = await axiosInstance.post('/admin/refurbish/hot-deals', payload);
      if (res.data?.success) {
        toast.success('Hot Deals saved successfully!');
        fetchHotDeals();
      } else {
        toast.error(res.data?.message || 'Failed to save hot deals');
      }
    } catch (err) {
      console.error('Error saving hot deals:', err);
      toast.error(err.response?.data?.message || 'Error saving hot deals');
    } finally {
      setSaving(false);
    }
  };

  const currentSelectedIds = slots.filter(Boolean).map((s) => s.productId);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Icon icon="mdi:loading" className="w-10 h-10 animate-spin text-primary-600" />
        <p className="text-sm font-medium text-gray-500">Loading Hot Deals configuration...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              <Icon icon="mdi:fire" className="w-4 h-4 text-amber-200" />
              <span>Special Offer Showcase</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hot Deals (Voucher / Coupon Cards)
            </h1>
            <p className="text-sm text-white/90 max-w-2xl font-normal leading-relaxed">
              Curate exactly 3 refurbished products with custom discount percentages. They are rendered directly as voucher cards on the Buy Refurbished Gadgets page.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-white text-orange-600 hover:bg-orange-50 font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Icon icon="lucide:check-circle-2" className="w-5 h-5 text-orange-600" />
                  <span>Save Hot Deals</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Bar */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-bold text-gray-800">Status:</label>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors cursor-pointer ${
              isActive ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-xs font-semibold ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
            {isActive ? 'Active on store page' : 'Disabled (Hidden on store)'}
          </span>
        </div>

        <div className="text-xs text-gray-500 flex items-center gap-1.5">
          <Icon icon="lucide:info" className="w-4 h-4 text-gray-400" />
          <span>Each deal renders in the 3-column voucher ticket section.</span>
        </div>
      </div>

      {/* 3 Hot Deal Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[0, 1, 2].map((index) => {
          const item = slots[index];
          const effectivePrice = item
            ? Math.round(item.originalPrice * (1 - item.discountPercentage / 100))
            : 0;

          return (
            <div
              key={index}
              className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 flex flex-col justify-between space-y-6 relative overflow-hidden"
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                    #{index + 1}
                  </span>
                  <h3 className="font-bold text-gray-900 text-base">Hot Deal Slot {index + 1}</h3>
                </div>
                {item && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(index)}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition"
                  >
                    <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>

              {/* Slot Content */}
              {item ? (
                <div className="space-y-5 flex-1">
                  {/* Selected Product Info */}
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 p-1 flex items-center justify-center flex-shrink-0">
                      <img
                        src={item.image || '/assets/placeholder.jpg'}
                        alt={item.title}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => { e.currentTarget.src = '/assets/placeholder.jpg'; }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-900 text-sm truncate" title={item.title}>
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Base: <strong className="text-gray-800">{formatCurrency(item.originalPrice)}</strong>
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenPicker(index)}
                        className="text-xs text-primary-600 hover:text-primary-700 font-semibold mt-1 flex items-center gap-1"
                      >
                        <Icon icon="lucide:refresh-cw" className="w-3 h-3" />
                        Change Product
                      </button>
                    </div>
                  </div>

                  {/* Discount Input & Presets */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-700">Discount Percentage (%):</label>
                      <span className="text-xs font-extrabold text-emerald-600">
                        {item.discountPercentage}% OFF
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={item.discountPercentage}
                          onChange={(e) => handleDiscountChange(index, e.target.value)}
                          className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">%</span>
                      </div>
                    </div>

                    {/* Quick discount presets */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {[15, 25, 43, 49, 76].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleDiscountChange(index, pct)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                            item.discountPercentage === pct
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Ticket Voucher Preview */}
                  <div className="pt-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Live Store Preview:</p>
                    
                    {/* The Ticket Coupon Preview Card */}
                    <div className="relative rounded-2xl border-2 border-purple-200 bg-[#FAF7FE] p-4 flex items-center gap-3 overflow-hidden shadow-xs">
                      {/* Ticket cutouts on edges */}
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border border-purple-200" />
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border border-purple-200" />

                      {/* Left: Product Image */}
                      <div className="w-20 h-20 rounded-xl bg-white p-1.5 flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <img
                          src={item.image || '/assets/placeholder.jpg'}
                          alt={item.title}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => { e.currentTarget.src = '/assets/placeholder.jpg'; }}
                        />
                      </div>

                      {/* Right: Content */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="inline-block bg-[#22c55e] text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-xs uppercase">
                          % {item.discountPercentage} İNDİRİM
                        </span>
                        <h5 className="font-bold text-gray-900 text-xs line-clamp-1 leading-snug">
                          {item.title}
                        </h5>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 line-through">
                          <span>{formatCurrency(item.originalPrice)}</span>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 leading-none">Etkin Fiyat</p>
                          <p className="text-base font-black text-gray-950 tracking-tight leading-tight">
                            {formatCurrency(effectivePrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-2xl hover:border-orange-300 hover:bg-orange-50/10 transition-colors p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                    <Icon icon="mdi:ticket-percent-outline" className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm">Empty Hot Deal Slot</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                    Assign a refurbished product to this slot and configure its discount.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenPicker(index)}
                    className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Icon icon="lucide:plus" className="w-4 h-4" />
                    <span>Select Product</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Product Selection Modal */}
      <SelectProductModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setActiveSlotIndex(null);
        }}
        onSelect={handleSelectProduct}
        currentProductIds={currentSelectedIds}
      />
    </div>
  );
}
