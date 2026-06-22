"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards from "@/components/partials/admin/ecom/SummaryCards";

const TABS = [
  { id: "", label: "All", icon: "mdi:format-list-bulleted" },
  { id: "pending", label: "Pending", icon: "mdi:clock-outline" },
  { id: "processing", label: "Processing", icon: "mdi:cogs" },
  { id: "shipped", label: "Shipped", icon: "mdi:truck-delivery-outline" },
  { id: "delivered", label: "Delivered", icon: "mdi:check-circle-outline" },
  { id: "on_hold", label: "On Hold", icon: "mdi:pause-circle-outline" },
  { id: "cancelled", label: "Cancelled", icon: "mdi:cancel" },
];

const STATUS_BADGE = {
  pending:    "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped:    "bg-amber-100 text-amber-700",
  delivered:  "bg-emerald-100 text-emerald-700",
  on_hold:    "bg-orange-100 text-orange-700",
  cancelled:  "bg-red-100 text-red-700",
};

const CANCELLED_BY_LABEL = {
  admin:  "Admin",
  seller: "Seller",
  user:   "Customer",
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { token } = useSelector((s) => s.auth);
  const debounceRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState({ total: 0, pending: 0, processing: 0, delivered: 0, cancelled: 0 });

  const [statusTab, setStatusTab] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");

  const [sellers, setSellers] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) return;
    axiosInstance
      .get("/admin/e-commerce/seller?limit=100", { headers })
      .then(({ data }) => setSellers(data.data || []))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusTab) params.set("status", statusTab);
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (sellerFilter) params.set("sellerId", sellerFilter);

      const { data } = await axiosInstance.get(
        `/admin/e-commerce/order?${params}`,
        { headers }
      );
      setOrders(data.data || []);
      setPagination(data.pagination || null);
      setSummary(data.summary || { total: 0, pending: 0, processing: 0, delivered: 0, cancelled: 0 });
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, statusTab, debouncedSearch, dateFrom, dateTo, sellerFilter, token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const clearFilters = () => {
    setSearch(""); setDateFrom(""); setDateTo("");
    setSellerFilter(""); setStatusTab(""); setPage(1);
  };

  const hasFilters = search || dateFrom || dateTo || sellerFilter || statusTab;

  const columns = [
    {
      header: "Order Info",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-gray-900 text-sm">{row.orderNo || "—"}</span>
          <span className="text-[11px] text-gray-500 font-mono">{row.orderId}</span>
          <span className="text-xs text-gray-400">{new Date(row.createdAt).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      header: "Customer",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-gray-800 text-sm">
            {row.userId?.firstName
              ? `${row.userId.firstName} ${row.userId.lastName || ""}`.trim()
              : "—"}
          </span>
          <span className="text-xs text-gray-400">{row.userId?.email || ""}</span>
        </div>
      ),
    },
    {
      header: "Items",
      cell: (row) => {
        const count = row.items?.length || 0;
        const first = row.items?.[0];
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-gray-900 line-clamp-1">
              {first?.productId?.title || "Unknown Product"}
            </span>
            {count > 1 && (
              <span className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold w-fit">
                +{count - 1} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Total",
      cell: (row) => (
        <span className="font-bold text-gray-900">${(row.totalAmount || 0).toFixed(2)}</span>
      ),
    },
    {
      header: "Payment",
      cell: (row) => {
        const cfg = {
          PAID: "bg-emerald-100 text-emerald-700",
          PENDING: "bg-yellow-100 text-yellow-700",
          FAILED: "bg-red-100 text-red-700",
        };
        return (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${cfg[row.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
            {row.paymentStatus}
          </span>
        );
      },
    },
    {
      header: "Status",
      cell: (row) => {
        const base = STATUS_BADGE[row.orderStatus] || "bg-gray-100 text-gray-700";
        const by = row.cancelledBy ? ` · ${CANCELLED_BY_LABEL[row.cancelledBy] || row.cancelledBy}` : "";
        return (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide ${base}`}>
            {row.orderStatus.replace("_", " ")}{by}
          </span>
        );
      },
    },
    {
      header: "Actions",
      cell: (row) => (
        <button
          onClick={() => router.push(`/admin/ecom/orders/${row._id}`)}
          className="p-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          title="View Details"
        >
          <Icon icon="mdi:eye-outline" className="w-5 h-5" />
        </button>
      ),
    },
  ];

  const summaryCards = [
    { label: "Total Orders", value: summary.total, icon: "mdi:shopping-outline", color: "#6366f1" },
    { label: "Pending", value: summary.pending, icon: "mdi:clock-outline", color: "#f59e0b" },
    { label: "Processing", value: summary.processing, icon: "mdi:cogs", color: "#8b5cf6" },
    { label: "Delivered", value: summary.delivered, icon: "mdi:check-circle-outline", color: "#10b981" },
    { label: "Cancelled", value: summary.cancelled, icon: "mdi:cancel", color: "#ef4444" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Orders</h1>
        <p className="text-gray-400 text-sm mt-0.5">View and manage all platform orders</p>
      </div>

      <SummaryCards data={summaryCards} />

      {/* Tabs */}
      <div className="mt-6 flex overflow-x-auto gap-1 pb-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setStatusTab(tab.id); setPage(1); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap ${
              statusTab === tab.id
                ? "bg-white text-primary-600 border-t-2 border-primary-600 shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <Icon icon={tab.icon} className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[180px] relative">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order no, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          {/* Seller */}
          <div className="w-full sm:w-48">
            <select
              value={sellerFilter}
              onChange={(e) => { setSellerFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">All Sellers</option>
              {sellers.map((s) => (
                <option key={s._id} value={s.userId?._id || s.userId}>
                  {s.businessName || s.fullName || "Unnamed"}
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-500 whitespace-nowrap">Date:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
            <span className="text-gray-400">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl text-sm hover:bg-red-100 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100">
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          emptyIcon="mdi:shopping-outline"
          emptyTitle="No orders found"
          emptyDescription="No orders match your current filters."
        />
      </div>
    </div>
  );
}
