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





/* ─── Main Page ──────────────────────────────────────────── */
export default function RefurbishedProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirm, setConfirm] = useState(null);
  const { token } = useSelector((s) => s.auth);
  const router = useRouter();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "") params.set("isActive", statusFilter);
      const { data } = await axiosInstance.get(`/seller/refurbished-products/products?${params}`, {
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
      await axiosInstance.patch(`/seller/refurbished-products/products/toggle/${product._id}`, {}, {
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
      await axiosInstance.delete(`/seller/refurbished-products/products/${id}`, {
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
    const name = `${p.title || ""} ${p.sku || ""} ${p.categoryId?.name || ""} ${p.brandId?.name || ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const summaryCards = [
    { label: "Total Products", value: products.length, icon: "mdi:package-variant", color: "#6366f1" },
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
            {row.images?.[0]?.url ? (
              <img src={row.images[0].url} alt={row.title} className="w-full h-full object-cover" />
            ) : (
              <Icon icon="mdi:cellphone" className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm line-clamp-1">
              {row.title ? row.title.split(' ').slice(0, 4).join(' ') + (row.title.split(' ').length > 4 ? '...' : '') : "—"}
            </p>            <p className="text-xs text-gray-400">SKU: {row.sku || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "model",
      header: "Model No.",
      cell: (row) => (
        <span className="text-sm font-medium text-gray-700">
          {row.modelNumber || "—"}
        </span>
      ),
    },
    // {
    //   key: "barcode",
    //   header: "Barcode",
    //   cell: (row) => (
    //     <span className="text-sm font-medium text-gray-700">
    //       {row.barcode || "—"}
    //     </span>
    //   ),
    // },
    {
      key: "categoryBrand",
      header: "Category & Brand",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-800">{row.categoryId?.name || "—"}</span>
          <span className="text-xs text-gray-500">{row.brandId?.name || "—"}</span>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      cell: (row) => {
        const v = row.variants?.[0];
        return (
          <div>
            <span className="font-bold text-gray-900">${v?.sellingPrice?.toFixed(2) || "0.00"}</span>
            {v?.discountPrice && (
              <p className="text-[11px] text-emerald-600 font-medium">${v.discountPrice.toFixed(2)} discounted</p>
            )}
          </div>
        );
      },
    },
    {
      key: "stock",
      header: "Stock",
      cell: (row) => {
        const stock = row.variants?.[0]?.stock ?? 0;
        return (
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${stock === 0
              ? "bg-red-50 text-red-600"
              : stock < 5
                ? "bg-amber-50 text-amber-600"
                : "bg-emerald-50 text-emerald-600"
              }`}
          >
            {stock} in stock
          </span>
        );
      },
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
          <button onClick={() => router.push(`/seller/refurbished/products/view/${row._id}`)} className="p-2 hover:bg-green-50 rounded-xl text-green-600" title="View Details">
            <Icon icon="mdi:eye-outline" className="w-4 h-4" />
          </button>
          <button onClick={() => router.push(`/seller/refurbished/products/edit/${row._id}`)} className="p-2 hover:bg-blue-50 rounded-xl text-blue-600" title="Edit">
            <Icon icon="mdi:pencil-outline" className="w-4 h-4" />
          </button>
          <button onClick={() => router.push(`/seller/refurbished/products/${row._id}/variants`)} className="p-2 hover:bg-purple-50 rounded-xl text-purple-600" title="Manage Variants">
            <Icon icon="mdi:layers-triple-outline" className="w-4 h-4" />
          </button>
          <button onClick={() => setConfirm({ id: row._id, label: row.title })} className="p-2 hover:bg-red-50 rounded-xl text-red-600" title="Delete">
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
          <h1 className="text-3xl font-black text-gray-900">Refurbished Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage refurbished device listings</p>
        </div>
        <Button onClick={() => router.push("/seller/refurbished/products/create")} variant="primary" className="h-11">
          <Icon icon="mdi:plus" className="w-5 h-5 mr-1" />
          Add Product
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
