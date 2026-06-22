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

function ConfirmDialog({ message, onConfirm, onCancel, isLoading }) {
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
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BarcodeModal({ barcode, barcodeImage, onClose }) {
  if (!barcodeImage) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Barcode</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <Icon icon="mdi:close" className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <img src={barcodeImage} alt={barcode} className="w-full h-auto mx-auto mb-3" />
        <p className="text-sm font-mono text-gray-600 bg-gray-50 rounded-lg px-3 py-2 select-all">
          {barcode}
        </p>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  const debounceRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0 });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sellers, setSellers] = useState([]);

  const [confirm, setConfirm] = useState(null);
  const [barcodeModal, setBarcodeModal] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) return;
    Promise.all([
      axiosInstance.get("/admin/e-commerce/product/categories", { headers }),
      axiosInstance.get("/admin/e-commerce/product/brands", { headers }),
      axiosInstance.get("/admin/e-commerce/seller?limit=100", { headers }),
    ])
      .then(([catRes, brandRes, sellerRes]) => {
        setCategories(catRes.data.data || []);
        setBrands(brandRes.data.data || []);
        setSellers(sellerRes.data.data || []);
      })
      .catch(() => {});
  }, [token]);

  const fetchProducts = useCallback(
    async (
      currentPage = 1,
      currentSearch = search,
      status = statusFilter,
      category = categoryFilter,
      brand = brandFilter,
      seller = sellerFilter,
    ) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: currentPage, limit: 10 });
        if (currentSearch) params.set("search", currentSearch);
        if (status !== "") params.set("isActive", status);
        if (category) params.set("categoryId", category);
        if (brand) params.set("brandId", brand);
        if (seller) params.set("sellerId", seller);

        const { data } = await axiosInstance.get(
          `/admin/e-commerce/product?${params}`,
          { headers }
        );
        setProducts(data.data || []);
        setPagination(data.pagination || null);
        setSummary({
          total: data.summary?.total || 0,
          active: data.summary?.active || 0,
          inactive: data.summary?.inactive || 0,
        });
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter, categoryFilter, brandFilter, sellerFilter, token]
  );

  useEffect(() => {
    if (token) fetchProducts(page);
  }, [page, statusFilter, categoryFilter, brandFilter, sellerFilter, token, fetchProducts]);

  const debounce = (fn, delay = 400) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, delay);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    debounce(() => {
      setPage(1);
      fetchProducts(1, val, statusFilter, categoryFilter, brandFilter, sellerFilter);
    });
  };

  const handleToggleStatus = async (product) => {
    const oldStatus = product.isActive;
    setProducts((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, isActive: !oldStatus } : p))
    );
    try {
      await axiosInstance.patch(
        `/admin/e-commerce/product/${product._id}/toggle`,
        {},
        { headers }
      );
      toast.success(`Product ${!oldStatus ? "activated" : "deactivated"}`);
    } catch (err) {
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isActive: oldStatus } : p))
      );
      toast.error(err?.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      await axiosInstance.delete(`/admin/e-commerce/product/${id}`, { headers });
      toast.success("Product deleted");
      fetchProducts(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setIsDeleting(false);
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
            <p className="font-semibold text-gray-900 truncate max-w-[160px]">{row.title}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-mono">{row.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: "seller",
      header: "Seller",
      cell: (row) => row.sellerId?.name ? (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-gray-800">{row.sellerId.name}</span>
          {row.sellerId.email && <span className="text-[11px] text-gray-400 truncate max-w-[140px]">{row.sellerId.email}</span>}
        </div>
      ) : <span className="text-gray-300">—</span>,
    },
    {
      key: "modelNumber",
      header: "Model No.",
      cell: (row) => (
        <span className="text-sm text-gray-700 font-mono">
          {row.modelNumber || <span className="text-gray-300">—</span>}
        </span>
      ),
    },
    {
      key: "barcode",
      header: "Barcode",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.barcodeImage ? (
            <button
              onClick={() => setBarcodeModal({ barcode: row.barcode, barcodeImage: row.barcodeImage })}
              className="hover:opacity-80 transition-opacity"
            >
              <img src={row.barcodeImage} alt={row.barcode} className="h-8 w-auto rounded border border-gray-100" />
            </button>
          ) : (
            <span className="text-gray-300 text-xs">No barcode</span>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (row) => (
        <span className="text-sm text-gray-700">
          {row.categoryId?.title || <span className="text-gray-300">—</span>}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      cell: (row) => {
        const v = row.variants?.[0];
        return (
          <span className="font-bold text-gray-900">
            ${v?.sellingPrice?.toFixed(2) || v?.price?.toFixed(2) || "0.00"}
          </span>
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
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              stock === 0
                ? "bg-red-50 text-red-600"
                : stock < 5
                ? "bg-amber-50 text-amber-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {stock}
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
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 shadow-sm ${
            row.isActive ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ${
              row.isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-1">
          <button
            onClick={() => router.push(`/admin/ecom/products/${row._id}`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            title="Edit"
          >
            <Icon icon="mdi:pencil-outline" className="w-5 h-5" />
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
    { label: "Active", value: summary.active, icon: "mdi:check-decagram-outline", color: "#10b981" },
    { label: "Inactive", value: summary.inactive, icon: "mdi:eye-off-outline", color: "#f59e0b" },
  ];

  const categoryOptions = [
    { label: "All Categories", value: "" },
    ...categories.map((c) => ({ label: c.title, value: c._id })),
  ];
  const brandOptions = [
    { label: "All Brands", value: "" },
    ...brands.map((b) => ({ label: b.title, value: b._id })),
  ];
  const sellerOptions = [
    { label: "All Sellers", value: "" },
    ...sellers.map((s) => ({
      label: s.businessName || s.fullName || "Unnamed",
      value: s.userId?._id || s.userId,
    })),
  ];

  const hasFilters = search || statusFilter || categoryFilter || brandFilter || sellerFilter;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Products</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage all sellers&apos; product listings</p>
          </div>
        
        </div>
      </div>

      <SummaryCards data={summaryCards} />

      {/* Filters */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by title, barcode, model..."
            />
          </div>
          <div className="w-full md:w-36">
            <CustomDropdown
              icon="mdi:filter-variant"
              placeholder="Status"
              options={[
                { label: "All Status", value: "" },
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" },
              ]}
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setPage(1); }}
            />
          </div>
          <div className="w-full md:w-40">
            <CustomDropdown
              icon="mdi:shape-outline"
              placeholder="Category"
              options={categoryOptions}
              value={categoryFilter}
              onChange={(val) => { setCategoryFilter(val); setPage(1); }}
            />
          </div>
          <div className="w-full md:w-36">
            <CustomDropdown
              icon="mdi:tag-outline"
              placeholder="Brand"
              options={brandOptions}
              value={brandFilter}
              onChange={(val) => { setBrandFilter(val); setPage(1); }}
            />
          </div>
          <div className="w-full md:w-44">
            <CustomDropdown
              icon="mdi:storefront-outline"
              placeholder="Seller"
              options={sellerOptions}
              value={sellerFilter}
              onChange={(val) => { setSellerFilter(val); setPage(1); }}
            />
          </div>
          {hasFilters && (
            <button
              onClick={() => {
                setSearch(""); setStatusFilter(""); setCategoryFilter("");
                setBrandFilter(""); setSellerFilter(""); setPage(1);
                fetchProducts(1, "", "", "", "", "");
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-red-500 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors whitespace-nowrap"
            >
              <Icon icon="mdi:close-circle-outline" className="w-4 h-4" />
              Clear
            </button>
          )}
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
          emptyDescription="Add a product or adjust your filters."
          emptyAction={
            <button
              onClick={() => router.push("/admin/ecom/products/add")}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-semibold"
            >
              <Icon icon="mdi:plus" className="w-5 h-5" />
              Add Product
            </button>
          }
        />
      </div>

      {confirm && (
        <ConfirmDialog
          message={`Delete "${confirm.label}"? This cannot be easily reversed.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
          isLoading={isDeleting}
        />
      )}

      {barcodeModal && (
        <BarcodeModal
          barcode={barcodeModal.barcode}
          barcodeImage={barcodeModal.barcodeImage}
          onClose={() => setBarcodeModal(null)}
        />
      )}
    </div>
  );
}
