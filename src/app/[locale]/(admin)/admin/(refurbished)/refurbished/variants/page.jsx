"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards from "@/components/partials/admin/ecom/SummaryCards";
import SearchInput from "@/components/partials/admin/ecom/SearchInput";
import { CustomDropdown } from "@/components/partials/admin/ecom/Dropdown";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Button from "@/components/partials/admin/ecom/myButton";
import { useRouter } from '@/i18n/navigation';

/* ─── Confirm Dialog ─────────────────────────────────────── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Icon icon="mdi:alert-outline" className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Confirm Delete</h3>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-5 py-2 text-sm bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
          <button onClick={onConfirm} className="px-5 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}



/* ─── View Modal ─────────────────────────────────────────── */
function ViewProductModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl">
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Category / Brand / Model */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Category</p>
              <p className="text-sm font-bold text-gray-800">{item.categoryId?.name || "—"}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Brand</p>
              <p className="text-sm font-bold text-gray-800">{item.brandId?.name || "—"}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Model</p>
              <p className="text-sm font-bold text-gray-800">{item.modelId?.name || "—"}</p>
            </div>
          </div>

          {/* Attributes */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Specifications</p>
            {item.attributes?.length > 0 ? (
              <div className="space-y-1.5">
                {item.attributes.map((attr, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">{attr.key}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {Array.isArray(attr.values) ? attr.values.join(", ") : attr.value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No attributes added</p>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Status</span>
            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              {item.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <div className="p-4 flex justify-end border-t">
          <button onClick={onClose} className="px-5 py-2 text-sm bg-gray-100 rounded-xl hover:bg-gray-200">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function RefurbishVariantsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { token } = useSelector((s) => s.auth);
  const router = useRouter();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "") params.set("isActive", statusFilter);
      const { data } = await axiosInstance.get(`/admin/refurbish/variants?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(data.data || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => { if (token) fetchProducts(); }, [token, statusFilter, fetchProducts]);

  const handleToggleStatus = async (product) => {
    const old = product.isActive;
    setProducts((p) => p.map((x) => x._id === product._id ? { ...x, isActive: !old } : x));
    try {
      await axiosInstance.patch(`/admin/refurbish/variants/toggle/${product._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Product ${!old ? "activated" : "deactivated"}`);
    } catch {
      setProducts((p) => p.map((x) => x._id === product._id ? { ...x, isActive: old } : x));
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/refurbish/variants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product deleted");
      fetchProducts();
    } catch {
      toast.error("Delete failed");
    } finally {
      setConfirm(null);
    }
  };

  const filtered = products.filter((p) => {
    const name = `${p.categoryId?.name || ""} ${p.brandId?.name || ""} ${p.modelId?.name || ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const summaryCards = [
    { label: "Total Variants", value: products.length, icon: "mdi:package-variant", color: "#6366f1" },
    { label: "Active", value: products.filter((p) => p.isActive).length, icon: "mdi:check-circle-outline", color: "#10b981" },
    { label: "Inactive", value: products.filter((p) => !p.isActive).length, icon: "mdi:minus-circle-outline", color: "#f59e0b" },
  ];

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ];

  const columns = [
    {
      key: "product",
      header: "Product",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
            {row.modelId?.imageUrl ? (
              <img src={row.modelId.imageUrl} alt={row.modelId?.name} className="w-full h-full object-contain" />
            ) : (
              <Icon icon="mdi:cellphone" className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">{row.modelId?.name || "—"}</p>
            <p className="text-xs text-gray-400">{row.brandId?.name} · {row.categoryId?.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: "attributes",
      header: "Specs",
      cell: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.attributes?.slice(0, 3).map((a, i) => (
            <span key={i} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {a.key}: {Array.isArray(a.values) ? a.values.join(", ") : a.value || "—"}
            </span>
          ))}
          {row.attributes?.length > 3 && (
            <span className="text-[10px] font-bold bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
              +{row.attributes.length - 3} more
            </span>
          )}
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Active",
      cell: (row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${row.isActive ? "bg-green-500" : "bg-gray-300"}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-300 ${row.isActive ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-1">
          <button onClick={() => setModal({ mode: "view", item: row })} className="p-2 hover:bg-green-50 rounded-xl text-green-600">
            <Icon icon="mdi:eye-outline" className="w-4 h-4" />
          </button>
          <button onClick={() => router.push(`/admin/refurbished/variants/edit/${row._id}`)} className="p-2 hover:bg-blue-50 rounded-xl text-blue-600">
            <Icon icon="mdi:pencil-outline" className="w-4 h-4" />
          </button>
          <button onClick={() => setConfirm({ id: row._id, label: `${row.brandId?.name} ${row.modelId?.name}` })} className="p-2 hover:bg-red-50 rounded-xl text-red-600">
            <Icon icon="mdi:delete-outline" className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50/50 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Refurbish Variants</h1>
          <p className="text-gray-500 text-sm mt-1">Manage refurbished device listings with dynamic specifications</p>
        </div>
        <Button onClick={() => router.push("/admin/refurbished/variants/create")} variant="primary" className="h-11">
          <Icon icon="mdi:plus" className="w-5 h-5 mr-1" />
          Add Variant
        </Button>
      </div>

      <SummaryCards data={summaryCards} />

      <div className="bg-white rounded-3xl border border-gray-200/60 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <SearchInput value={search} onChange={(v) => setSearch(v)} placeholder="Search by brand, model, category..." />
          </div>
          <div className="w-full sm:w-48">
            <CustomDropdown icon="mdi:filter-outline" placeholder="Status" options={statusOptions} value={statusFilter} onChange={(v) => setStatusFilter(v)} />
          </div>
        </div>

        <DataTable
          data={filtered}
          columns={columns}
          loading={loading}
          emptyIcon="mdi:package-variant"
          emptyTitle="No products found"
          emptyDescription="Add your first refurbish variant"
        />
      </div>

      {modal && modal.mode === "view" ? (
        <ViewProductModal item={modal.item} onClose={() => setModal(null)} />
      ) : null}

      {confirm && (
        <ConfirmDialog
          message={`Delete "${confirm.label}"?`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
