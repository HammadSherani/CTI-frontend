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
import moment from "moment";
import { useRouter } from "@/i18n/navigation";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipping", value: "shipping" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const ALL_STATUSES = [
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipping", value: "shipping" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const ORDER_STATUS_STYLES = {
  pending:    "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  shipping:   "bg-cyan-50 text-cyan-700 border-cyan-200",
  shipped:    "bg-violet-50 text-violet-700 border-violet-200",
  delivered:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled:  "bg-red-50 text-red-700 border-red-200",
};

const ALLOWED_TRANSITIONS = {
  pending:    ["processing", "shipping", "shipped", "cancelled"],
  processing: ["shipping", "shipped", "cancelled"],
  shipping:   ["shipped", "cancelled"],
  shipped:    ["delivered", "cancelled"],
  delivered:  [],
  cancelled:  [],
};

/* ─── Inline Status Dropdown ─────────────────────────────────── */
function InlineStatusDropdown({ row, onUpdate, updatingId }) {
  const transitions = ALLOWED_TRANSITIONS[row.orderStatus] || [];
  const isUpdating = updatingId === row._id;
  const cls = ORDER_STATUS_STYLES[row.orderStatus] || "bg-gray-50 text-gray-600 border-gray-200";

  if (transitions.length === 0) {
    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${cls}`}>
        {row.orderStatus}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${cls}`}>
        {row.orderStatus}
      </span>
      <div className="relative flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-1.5 py-0.5 shadow-sm">
        {isUpdating ? (
          <Icon icon="mdi:loading" className="animate-spin w-3 h-3 text-gray-400" />
        ) : (
          <Icon icon="mdi:swap-horizontal" className="w-3 h-3 text-gray-400" />
        )}
        <select
          disabled={isUpdating}
          value=""
          onChange={(e) => { if (e.target.value) onUpdate(row._id, e.target.value); }}
          className="text-[10px] font-semibold text-gray-600 focus:outline-none bg-transparent cursor-pointer disabled:opacity-50 pr-0.5"
        >
          <option value="">Change…</option>
          {transitions.map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function RefurbishedOrdersPage() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });
  const [summary, setSummary] = useState({ total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 });
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/admin/refurbish/orders", {
        params: { page, limit: 12, search: search.trim() || undefined, status: status || undefined },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setOrders(data.data || []);
        setPagination(data.pagination || { totalPages: 1, totalItems: 0 });
        if (data.summary) setSummary(data.summary);
      }
    } catch {
      toast.error("Failed to load refurbished orders");
    } finally {
      setLoading(false);
    }
  }, [token, page, search, status]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const { data } = await axiosInstance.put(
        `/admin/refurbish/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(`Status updated to '${newStatus}'`);
        setOrders((prev) =>
          prev.map((o) => o._id === orderId ? { ...o, orderStatus: newStatus } : o)
        );
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      header: "Order No",
      accessor: (row) => (
        <span className="font-mono font-bold text-gray-800 text-xs">
          {row.orderNo || row.orderId || row._id}
        </span>
      ),
    },
    {
      header: "Customer",
      accessor: (row) => (
        <div>
          <p className="font-bold text-gray-800 text-xs">
            {row.userId?.firstName} {row.userId?.lastName}
          </p>
          <p className="text-[10px] text-gray-400">{row.userId?.email}</p>
        </div>
      ),
    },
    {
      header: "Date",
      accessor: (row) => (
        <p className="text-gray-500 text-xs">{moment(row.createdAt).format("DD MMM YYYY")}</p>
      ),
    },
    {
      header: "Items",
      accessor: (row) => (
        <span className="font-semibold text-gray-700 text-xs">{row.items?.length || 0} item(s)</span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <InlineStatusDropdown row={row} onUpdate={handleStatusUpdate} updatingId={updatingId} />
      ),
    },
    {
      header: "Total",
      accessor: (row) => (
        <span className="font-black text-gray-800 text-xs">${row.totalAmount?.toFixed(2)}</span>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <button
          onClick={() => router.push(`/admin/refurbished/orders/${row._id}`)}
          className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-bold transition-colors"
        >
          <Icon icon="solar:eye-bold" className="w-4 h-4" />
          View Details
        </button>
      ),
    },
  ];

  const cards = [
    { title: "Total Orders",  count: summary.total,      icon: "solar:box-minimalistic-linear",  color: "border-l-4 border-l-blue-500" },
    { title: "Pending",       count: summary.pending,    icon: "solar:clock-circle-linear",      color: "border-l-4 border-l-orange-500" },
    { title: "Processing",    count: summary.processing, icon: "solar:settings-linear",          color: "border-l-4 border-l-indigo-500" },
    { title: "Shipped",       count: summary.shipped,    icon: "solar:delivery-linear",          color: "border-l-4 border-l-violet-500" },
    { title: "Delivered",     count: summary.delivered,  icon: "solar:check-circle-linear",      color: "border-l-4 border-l-emerald-500" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Refurbished Device Orders</h1>
          <p className="text-xs text-gray-400 mt-1">Manage platform-direct refurbished product sales and deliveries</p>
        </div>
      </div>

      <SummaryCards cards={cards} />

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by Order ID..." />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="w-44">
            <CustomDropdown
              icon="mdi:filter-variant"
              placeholder="Filter Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(val) => { setStatus(val); setPage(1); }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Icon icon="mdi:loading" className="animate-spin text-3xl text-primary-500 mb-2" />
            <p className="text-xs text-gray-400">Loading orders...</p>
          </div>
        ) : (
          <DataTable
            data={orders}
            columns={columns}
            page={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
