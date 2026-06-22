"use client";

import { useEffect, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards from "@/components/partials/admin/ecom/SummaryCards";
import { useRouter } from "@/i18n/navigation";
import moment from "moment";

const TABS = [
  { id: "", label: "All Cancellations", icon: "mdi:format-list-bulleted" },
  { id: "user", label: "Customer Cancelled", icon: "mdi:account-cancel-outline" },
  { id: "seller", label: "My Cancellations", icon: "mdi:store-remove-outline" },
  { id: "system", label: "Admin Cancelled", icon: "mdi:robot-dead-outline" },
];

const CANCEL_TYPE_CONFIG = {
  user: { label: "Customer", bg: "bg-blue-100", text: "text-blue-700" },
  seller: { label: "Seller", bg: "bg-amber-100", text: "text-amber-700" },
  system: { label: "System", bg: "bg-purple-100", text: "text-purple-700" },
  admin: { label: "Admin", bg: "bg-red-100", text: "text-red-700" },
};

const PAYMENT_BADGE = {
  PAID: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  FAILED: "bg-red-100 text-red-700",
};

export default function SellerCancelledOrdersPage() {
  const router = useRouter();
  const { token } = useSelector((s) => s.auth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState({ total: 0, user: 0, seller: 0, system: 0 });

  const [activeTab, setActiveTab] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (activeTab) params.set("cancelledBy", activeTab);
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const { data } = await axiosInstance.get(`/seller/orders/cancelled?${params}`, { headers });
      setOrders(data.data || []);
      setPagination(data.pagination || null);
      setSummary(data.summary || { total: 0, user: 0, seller: 0, system: 0 });
    } catch {
      toast.error("Failed to load cancelled orders");
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, debouncedSearch, dateFrom, dateTo, token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const hasFilters = search || dateFrom || dateTo;

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (activeTab) params.set("cancelledBy", activeTab);
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await axiosInstance.get(`/seller/orders/cancelled/export?${params}`, {
        headers,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Cancelled_Orders_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    {
      header: "Order Info",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-gray-900 text-sm">{row.orderNo || "—"}</span>
          <span className="text-[10px] text-gray-500 font-mono">{row.orderId}</span>
          <span className="text-xs text-gray-400">{moment(row.createdAt).format("DD MMM YYYY")}</span>
        </div>
      ),
    },
    {
      header: "Barcode",
      cell: (row) => (
        <span className="text-xs font-mono text-gray-600">
          {row.items?.[0]?.barcode || "—"}
        </span>
      ),
    },
    {
      header: "Customer",
      cell: (row) => (
        <span className="font-medium text-gray-800 text-sm">{row.customerName || "—"}</span>
      ),
    },
    {
      header: "Product",
      cell: (row) => {
        const count = row.items?.length || 0;
        const first = row.items?.[0];
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-gray-900 line-clamp-1" title={first?.product?.title}>
              {first?.product?.title || "Unknown"}
            </span>
            {count > 1 && (
              <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold w-fit">
                +{count - 1} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Qty",
      cell: (row) => (
        <span className="text-sm text-gray-700">{row.items?.[0]?.quantity ?? "—"}</span>
      ),
    },
    {
      header: "Price",
      cell: (row) => (
        <span className="font-bold text-gray-900 text-sm">
          Rs. {(row.items?.[0]?.price || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Cancel Type",
      cell: (row) => {
        const cfg = CANCEL_TYPE_CONFIG[row.cancelledBy] || { label: row.cancelledBy || "—", bg: "bg-gray-100", text: "text-gray-700" };
        return (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      header: "Cancel Reason",
      cell: (row) => (
        <span
          className="text-xs text-gray-600 line-clamp-2 max-w-[160px]"
          title={row.cancelReason || ""}
        >
          {row.cancelReason || "—"}
        </span>
      ),
    },
    {
      header: "Cancelled On",
      cell: (row) => (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {row.cancelledAt ? moment(row.cancelledAt).format("DD MMM YYYY, hh:mm A") : "—"}
        </span>
      ),
    },
    {
      header: "Payment",
      cell: (row) => (
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${PAYMENT_BADGE[row.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
          {row.paymentStatus || "—"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <button
          onClick={() => router.push(`/seller/order/${row._id}`)}
          className="p-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          title="View Order"
        >
          <Icon icon="mdi:eye-outline" className="w-5 h-5" />
        </button>
      ),
    },
  ];

  const summaryCards = [
    { label: "Total Cancelled", value: summary.total, icon: "mdi:cancel", color: "#ef4444" },
    { label: "Customer Cancelled", value: summary.user, icon: "mdi:account-cancel-outline", color: "#3b82f6" },
    { label: "My Cancellations", value: summary.seller, icon: "mdi:store-remove-outline", color: "#f59e0b" },
    { label: "System Cancelled", value: summary.system, icon: "mdi:robot-dead-outline", color: "#8b5cf6" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/seller/order")}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            title="Back to Orders"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Cancelled Orders</h1>
            <p className="text-gray-400 text-sm mt-0.5">View and analyse all cancellation records</p>
          </div>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 border border-emerald-200 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-sm disabled:opacity-50"
        >
          {exporting
            ? <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
            : <Icon icon="mdi:file-excel" className="w-5 h-5" />}
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <SummaryCards data={summaryCards} />

      {/* Tabs */}
      <div className="mt-6 flex overflow-x-auto gap-1 pb-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                ? "bg-white text-primary-600 border-t-2 border-primary-600 shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
          >
            <Icon icon={tab.icon} className="w-4 h-4" />
            {tab.label}
            {tab.id === "" && summary.total > 0 && <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">{summary.total}</span>}
            {tab.id === "user" && summary.user > 0 && <span className="ml-1 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">{summary.user}</span>}
            {tab.id === "seller" && summary.seller > 0 && <span className="ml-1 text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">{summary.seller}</span>}
            {tab.id === "system" && summary.system > 0 && <span className="ml-1 text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-bold">{summary.system}</span>}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order no, barcode, customer name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          {/* Cancellation date range */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs font-bold text-gray-500 whitespace-nowrap">Cancelled:</label>
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
          emptyIcon="mdi:cancel"
          emptyTitle="No cancelled orders"
          emptyDescription={
            activeTab === "system"
              ? "No system-triggered cancellations yet."
              : "No orders match the current filters."
          }
        />
      </div>
    </div>
  );
}
