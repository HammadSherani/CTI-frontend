"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards from "@/components/partials/admin/ecom/SummaryCards";
import SearchInput from "@/components/partials/admin/ecom/SearchInput";
import { CustomDropdown } from "@/components/partials/admin/ecom/Dropdown";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

/* ─── Confirm Delete Dialog ──────────────────────────────── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
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
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Products List Page ────────────────────────────── */
export default function ProductsListPage() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  const debounceRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState({ total: 0, active: 0, lowStock: 0 });
  const [confirm, setConfirm] = useState(null);

  const fetchProducts = useCallback(
    async (currentPage = 1, currentSearch = search, status = statusFilter) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: currentPage, limit: 10 });
        if (currentSearch) params.set("search", currentSearch);
        if (status !== "") params.set("isActive", status);

        const { data } = await axiosInstance.get(`/seller/product?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const list = data.data || [];
        setProducts(list);
        setPagination(data.pagination || null);
        setSummary({
          total: data.pagination?.totalItems || 0,
          active: list.filter((p) => p.isActive).length,
          lowStock: list.filter((p) => p.stock < 5).length,
        });
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter, token]
  );

  useEffect(() => {
    if (token) fetchProducts(page);
  }, [page, statusFilter, token, fetchProducts]);

  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchProducts(1, val, statusFilter);
    }, 400);
  };

  const handleToggleStatus = async (product) => {
    const oldStatus = product.isActive;
    setProducts((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, isActive: !oldStatus } : p))
    );
    try {
      await axiosInstance.patch(
        `/seller/product/${product._id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Product ${!oldStatus ? "activated" : "deactivated"} successfully`);
    } catch (err) {
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isActive: oldStatus } : p))
      );
      toast.error(err?.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/seller/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product deleted successfully");
      fetchProducts(page, search, statusFilter);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setConfirm(null);
    }
  };

  const columns = [
    {
      key: "product",
      header: "Product",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
            {row.images?.[0]?.url ? (
              <img src={row.images[0].url} alt={row.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Icon icon="mdi:image-outline" className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate max-w-[200px]">{row.title}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{row.categoryId?.title || "No Category"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      cell: (row) => (
        <div>
          <span className="font-bold text-gray-900">${row.summary?.minPrice?.toFixed(2) || "0.00"}</span>
          {row.summary?.minSalePrice && (
            <p className="text-[11px] text-emerald-600 font-medium">${row.summary?.minSalePrice?.toFixed(2)} discounted</p>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      cell: (row) => {
        const stock = row.summary?.totalStock || 0;
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
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 shadow-sm ${row.isActive ? "bg-green-500" : "bg-gray-300"
            }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ${row.isActive ? "translate-x-6" : "translate-x-1"
              }`}
          />
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-1  transition-opacity">
          <button
            onClick={() => router.push(`/seller/product/${row._id}`)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            title="View Details"
          >
            <Icon icon="mdi:eye-outline" className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push(`/seller/product/${row._id}/edit`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            title="Edit"
          >
            <Icon icon="mdi:pencil-outline" className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push(`/seller/product/${row._id}/variants`)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
            title="Manage Variants"
          >
            <Icon icon="mdi:layers-triple-outline" className="w-5 h-5" />
          </button>
          <button
            onClick={() => setConfirm({ id: row._id, label: row.title })}
            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            title="Delete"
          >
            <Icon icon="mdi:trash-can-outline" className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  const summaryCards = [
    { label: "Total Products", value: summary.total, icon: "mdi:package-variant", color: "#6366f1" },
    { label: "Active Products", value: summary.active, icon: "mdi:check-decagram-outline", color: "#10b981" },
    { label: "Low Stock", value: summary.lowStock, icon: "mdi:alert-circle-outline", color: "#f59e0b" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Products</h1>
          <p className="text-gray-500 mt-1">Manage your store's inventory and listings</p>
        </div>
        <button
          onClick={() => router.push("/seller/product/add")}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25 active:scale-[0.98]"
        >
          <Icon icon="mdi:plus" className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {/* Summary Cards */}
      <SummaryCards data={summaryCards} />

      {/* Filters */}
      <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by product title..."
            />
          </div>
          <div className="w-full md:w-48">
            <CustomDropdown
              icon="mdi:filter-variant"
              placeholder="Status"
              options={[
                { label: "All Status", value: "" },
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" },
              ]}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable
          data={products}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          emptyIcon="mdi:package-variant-closed"
          emptyTitle="No products found"
          emptyDescription="Start selling by adding your first product to your store."
          emptyAction={
            <button
              onClick={() => router.push("/seller/product/add")}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-semibold"
            >
              <Icon icon="mdi:plus" className="w-5 h-5" />
              Add Product
            </button>
          }
        />
      </div>

      {/* Delete Confirm */}
      {confirm && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${confirm.label}"? This action can be undone by admin.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}