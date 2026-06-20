"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards from "@/components/partials/admin/ecom/SummaryCards";
import SearchInput from "@/components/partials/admin/ecom/SearchInput";
import { CustomDropdown } from "@/components/partials/admin/ecom/Dropdown";
import ProductCard from "@/components/website/product/productCard";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

/* ─── Delete Confirm Dialog ──────────────────────────── */
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

/* ─── Barcode Preview Modal ──────────────────────────── */
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
        <button
          onClick={() => {
            const a = document.createElement("a");
            a.href = barcodeImage;
            a.download = `barcode-${barcode}.png`;
            a.click();
          }}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-gray-900 text-white rounded-xl hover:bg-black transition-colors"
        >
          <Icon icon="mdi:download" className="w-4 h-4" />
          Download PNG
        </button>
      </div>
    </div>
  );
}

/* ─── CSV Template download helper ──────────────────── */
function downloadCSVTemplate() {
  const header = "title,modelNumber,barcode,categoryName,brandName,price,stock,discountPercentage,shortDescription";
  const example = "Example Product,MOD-001,,Electronics,Samsung,99.99,50,10,A great product";
  const content = [header, example].join("\r\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "products-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Main Products List Page ────────────────────────── */
export default function ProductsListPage() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  const debounceRef = useRef(null);
  const csvInputRef = useRef(null);

  /* ── Data state ── */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [importing, setImporting] = useState(false);

  /* ── Filter state ── */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [barcodeFilter, setBarcodeFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");

  /* ── Pagination ── */
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  /* ── Summary ── */
  const [summary, setSummary] = useState({ total: 0, active: 0, lowStock: 0 });

  /* ── Dropdown data ── */
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  /* ── Modals & Views ── */
  const [confirm, setConfirm] = useState(null);
  const [barcodeModal, setBarcodeModal] = useState(null); // { barcode, barcodeImage }
  const [viewMode, setViewMode] = useState("table"); // "table" or "grid"

  /* ── Load dropdown options once ── */
  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axiosInstance.get("/seller/product/categories", { headers }),
      axiosInstance.get("/seller/product/all-brands", { headers }),
    ]).then(([catRes, brandRes]) => {
      setCategories(catRes.data.data || []);
      setBrands(brandRes.data.data || []);
    }).catch(() => { });
  }, [token]);

  /* ── Fetch products ── */
  const fetchProducts = useCallback(
    async (
      currentPage = 1,
      currentSearch = search,
      status = statusFilter,
      barcode = barcodeFilter,
      model = modelFilter,
      category = categoryFilter,
      brand = brandFilter,
    ) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: currentPage, limit: 10 });
        if (currentSearch) params.set("search", currentSearch);
        if (status !== "") params.set("isActive", status);
        if (barcode) params.set("barcode", barcode);
        if (model) params.set("modelNumber", model);
        if (category) params.set("categoryId", category);
        if (brand) params.set("brandId", brand);

        const { data } = await axiosInstance.get(`/seller/product?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const list = data.data || [];
        setProducts(list);
        setPagination(data.pagination || null);
        setSummary({
          total: data.pagination?.totalItems || 0,
          active: list.filter((p) => p.isActive).length,
          lowStock: list.filter((p) => (p.variants?.[0]?.stock ?? 0) < 5).length,
        });
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter, barcodeFilter, modelFilter, categoryFilter, brandFilter, token]
  );

  useEffect(() => {
    if (token) fetchProducts(page);
  }, [page, statusFilter, categoryFilter, brandFilter, token, fetchProducts]);

  /* ── Debounced text searches ── */
  const debounce = (fn, delay = 400) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, delay);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    debounce(() => { setPage(1); fetchProducts(1, val, statusFilter, barcodeFilter, modelFilter, categoryFilter, brandFilter); });
  };

  const handleBarcodeFilter = (val) => {
    setBarcodeFilter(val);
    debounce(() => { setPage(1); fetchProducts(1, search, statusFilter, val, modelFilter, categoryFilter, brandFilter); });
  };

  const handleModelFilter = (val) => {
    setModelFilter(val);
    debounce(() => { setPage(1); fetchProducts(1, search, statusFilter, barcodeFilter, val, categoryFilter, brandFilter); });
  };

  /* ── Toggle status ── */
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

  /* ── Delete ── */
  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      await axiosInstance.delete(`/seller/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product deleted successfully");
      fetchProducts(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setIsDeleting(false);
      setConfirm(null);
    }
  };

  /* ── Export CSV ── */
  const handleExportCSV = async () => {
    try {
      const res = await axiosInstance.get("/seller/product/export-csv", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "products.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported successfully");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  /* ── Import CSV ── */
  const handleImportCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append("csv", file);
      const { data } = await axiosInstance.post("/seller/product/import-csv", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(`Imported ${data.created} product${data.created !== 1 ? "s" : ""}`);
      if (data.errors?.length) {
        toast.warning(`${data.errors.length} row${data.errors.length !== 1 ? "s" : ""} skipped — check console`);
        console.warn("CSV import errors:", data.errors);
      }
      fetchProducts(1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Import failed");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  /* ── Table columns ── */
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
            <p className="font-semibold text-gray-900 truncate max-w-[180px]">{row.title}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 font-mono">{row.sku}</p>
          </div>
        </div>
      ),
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
              title="Click to enlarge"
              className="hover:opacity-80 transition-opacity"
            >
              <img
                src={row.barcodeImage}
                alt={row.barcode}
                className="h-8 w-auto rounded border border-gray-100"
              />
            </button>
          ) : (
            <span className="text-gray-300 text-xs">No barcode</span>
          )}
          {row.barcode && (
            <span className="text-[10px] text-gray-400 font-mono hidden xl:block truncate max-w-[80px]">
              {row.barcode}
            </span>
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
      key: "subcategory",
      header: "Subcategory",
      cell: (row) => (
        <span className="text-sm text-gray-700">
          {row.subCategoryId?.title || <span className="text-gray-300">—</span>}
        </span>
      ),
    },
    {
      key: "brand",
      header: "Brand",
      cell: (row) => (
        <span className="text-sm text-gray-700">
          {row.brandId?.title || <span className="text-gray-300">—</span>}
        </span>
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
        <div className="flex gap-1">
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

  const categoryOptions = [
    { label: "All Categories", value: "" },
    ...categories.map((c) => ({ label: c.title, value: c._id })),
  ];

  const brandOptions = [
    { label: "All Brands", value: "" },
    ...brands.map((b) => ({ label: b.title, value: b._id })),
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">

      {/* ═══ Header ═══ */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Products</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage your store's inventory and listings</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Export */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <Icon icon="mdi:file-download-outline" className="w-4 h-4" />
              Export
            </button>

            {/* Import */}
            <button
              onClick={() => csvInputRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              {importing
                ? <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                : <Icon icon="mdi:file-upload-outline" className="w-4 h-4" />
              }
              {importing ? 'Importing...' : 'Import'}
            </button>
            <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />

            {/* View toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-semibold transition-colors ${viewMode === 'table' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Icon icon="mdi:table" className="w-4 h-4" />
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-semibold transition-colors ${viewMode === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Icon icon="mdi:view-grid" className="w-4 h-4" />
                Grid
              </button>
            </div>

            {/* Add Product */}
            <button
              onClick={() => router.push('/seller/product/add')}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-md shadow-primary-500/20 active:scale-[0.98]"
            >
              <Icon icon="mdi:plus" className="w-5 h-5" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Summary Cards ═══ */}
      <SummaryCards data={summaryCards} />

      {/* ═══ Filters ═══ */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">

          {/* Search */}
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by product name..."
            />
          </div>

          {/* Status */}
          <div className="w-full md:w-40">
            <CustomDropdown
              icon="mdi:filter-variant"
              placeholder="Status"
              options={[
                { label: 'All Status', value: '' },
                { label: 'Active', value: 'true' },
                { label: 'Inactive', value: 'false' },
              ]}
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setPage(1); }}
            />
          </div>

          {/* Category */}
          <div className="w-full md:w-44">
            <CustomDropdown
              icon="mdi:shape-outline"
              placeholder="Category"
              options={categoryOptions}
              value={categoryFilter}
              onChange={(val) => { setCategoryFilter(val); setPage(1); }}
            />
          </div>

          {/* Brand */}
          <div className="w-full md:w-44">
            <CustomDropdown
              icon="mdi:tag-outline"
              placeholder="Brand"
              options={brandOptions}
              value={brandFilter}
              onChange={(val) => { setBrandFilter(val); setPage(1); }}
            />
          </div>

          {/* Clear filters — only when active */}
          {(search || statusFilter || barcodeFilter || modelFilter || categoryFilter || brandFilter) && (
            <button
              onClick={() => {
                setSearch(''); setStatusFilter(''); setBarcodeFilter('');
                setModelFilter(''); setCategoryFilter(''); setBrandFilter('');
                setPage(1);
                fetchProducts(1, '', '', '', '', '', '');
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-red-500 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors whitespace-nowrap"
            >
              <Icon icon="mdi:close-circle-outline" className="w-4 h-4" />
              Clear
            </button>
          )}

        </div>
      </div>

      {/* Table / Grid View */}
      <div className="mt-6 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {viewMode === "table" ? (
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
        ) : (
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-20 text-gray-400">
                <Icon icon="mdi:loading" className="w-8 h-8 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <Icon icon="mdi:package-variant-closed" className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-900">No products found</h3>
                <p className="text-gray-500 mt-1 mb-6">Start selling by adding your first product to your store.</p>
                <button
                  onClick={() => router.push("/seller/product/add")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-semibold"
                >
                  <Icon icon="mdi:plus" className="w-5 h-5" />
                  Add Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="relative group">
                    <ProductCard product={product} />

                    {/* Seller Actions Overlay */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(product);
                        }}
                        className={`p-1.5 rounded-lg shadow-sm backdrop-blur-md transition-colors ${product.isActive ? "bg-green-500/90 text-white hover:bg-green-600" : "bg-gray-500/90 text-white hover:bg-gray-600"}`}
                        title={product.isActive ? "Deactivate" : "Activate"}
                      >
                        <Icon icon={product.isActive ? "mdi:eye-outline" : "mdi:eye-off-outline"} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/seller/product/${product._id}/edit`);
                        }}
                        className="p-1.5 bg-blue-500/90 text-white hover:bg-blue-600 rounded-lg shadow-sm backdrop-blur-md transition-colors"
                        title="Edit"
                      >
                        <Icon icon="mdi:pencil-outline" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirm({ id: product._id, label: product.title });
                        }}
                        className="p-1.5 bg-red-500/90 text-white hover:bg-red-600 rounded-lg shadow-sm backdrop-blur-md transition-colors"
                        title="Delete"
                      >
                        <Icon icon="mdi:trash-can-outline" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grid Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-200">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {confirm && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${confirm.label}"? This action can be undone by admin.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
          isLoading={isDeleting}
        />
      )}

      {/* Barcode Preview Modal */}
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
