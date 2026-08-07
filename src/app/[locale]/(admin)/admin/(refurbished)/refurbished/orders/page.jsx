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

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const ORDER_STATUS_STYLES = {
  pending: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  shipped: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

/* ─── Detail Modal ───────────────────────────────────────── */
function OrderDetailModal({ order, onClose, onStatusUpdate }) {
  const [updating, setUpdating] = useState(false);

  if (!order) return null;

  const allowedTransitions = {
    pending: ["processing", "shipped", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
  };

  const transitions = allowedTransitions[order.orderStatus] || [];

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to '${newStatus}'?`)) return;
    setUpdating(true);
    try {
      await onStatusUpdate(order._id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg">Order Details</h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{order.orderNo || order._id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <Icon icon="solar:close-circle-bold" className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Customer & Shipping info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Customer Details</p>
              <p className="font-bold text-gray-800 text-sm">
                {order.userId?.firstName} {order.userId?.lastName}
              </p>
              <p className="text-xs text-gray-500 mt-1">{order.userId?.email}</p>
              <p className="text-xs text-gray-500 mt-0.5">{order.userId?.phone || "No phone number"}</p>
            </div>
            <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Shipping Address</p>
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state}, {order.shippingAddress?.country}
              </p>
              <p className="text-xs text-gray-400 mt-1">Postal: {order.shippingAddress?.postalCode}</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Order Items</p>
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Variant</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.items?.map((item, idx) => {
                    const prod = item.productId || {};
                    const variant = item.variantId || {};
                    return (
                      <tr key={idx} className="hover:bg-gray-50/30">
                        <td className="px-4 py-3 font-semibold text-gray-800">{prod.title || "Refurbished Device"}</td>
                        <td className="px-4 py-3 text-gray-500">{variant.title || "Default"}</td>
                        <td className="px-4 py-3 text-center font-bold text-gray-700">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-800">${item.price.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Row */}
          <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <div>
              <p className="text-xs text-gray-400">Payment Status</p>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase mt-1 ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {order.paymentStatus}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Total Paid</p>
              <p className="text-lg font-black text-gray-900 mt-0.5">${order.totalAmount?.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          {transitions.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase mr-1">Update Status:</span>
              {transitions.map((t) => (
                <button
                  key={t}
                  disabled={updating}
                  onClick={() => handleStatusChange(t)}
                  className="px-3.5 py-2 text-xs font-bold border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-gray-700 uppercase"
                >
                  {t}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-xs font-bold text-gray-400 uppercase italic">No further status updates possible</span>
          )}

          <button onClick={onClose} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function RefurbishedOrdersPage() {
  const { token } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });
  const [summary, setSummary] = useState({ total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 });
  const [activeOrder, setActiveOrder] = useState(null);

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
    } catch (err) {
      toast.error("Failed to load refurbished orders");
    } finally {
      setLoading(false);
    }
  }, [token, page, search, status]);

  console.log("orders", orders);
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const { data } = await axiosInstance.put(
        `/admin/refurbish/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(`Order status updated to '${newStatus}'`);
        fetchOrders();
        setActiveOrder(null);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
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
        <p className="text-gray-500 text-xs">
          {moment(row.createdAt).format("DD MMM YYYY")}
        </p>
      ),
    },
    {
      header: "Items",
      accessor: (row) => (
        <span className="font-semibold text-gray-700 text-xs">
          {row.items?.length || 0} item(s)
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => {
        const cls = ORDER_STATUS_STYLES[row.orderStatus] || "bg-gray-50 text-gray-600 border-gray-200";
        return (
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${cls}`}>
            {row.orderStatus}
          </span>
        );
      },
    },
    {
      header: "Total",
      accessor: (row) => (
        <span className="font-black text-gray-800 text-xs">
          ${row.totalAmount?.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <button
          onClick={() => setActiveOrder(row)}
          className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-bold transition-colors"
        >
          <Icon icon="solar:eye-bold" className="w-4 h-4" />
          View Details
        </button>
      ),
    },
  ];

  const cards = [
    { title: "Total Orders", count: summary.total, icon: "solar:box-minimalistic-linear", color: "border-l-4 border-l-blue-500" },
    { title: "Pending", count: summary.pending, icon: "solar:clock-circle-linear", color: "border-l-4 border-l-orange-500" },
    { title: "Processing", count: summary.processing, icon: "solar:settings-linear", color: "border-l-4 border-l-indigo-500" },
    { title: "Shipped", count: summary.shipped, icon: "solar:delivery-linear", color: "border-l-4 border-l-violet-500" },
    { title: "Delivered", count: summary.delivered, icon: "solar:check-circle-linear", color: "border-l-4 border-l-emerald-500" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Refurbished Device Orders</h1>
          <p className="text-xs text-gray-400 mt-1">Manage platform-direct refurbished product sales and deliveries</p>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards cards={cards} />

      {/* Filters Row */}
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

      {/* Main Table */}
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

      {/* Detail Modal */}
      {activeOrder && (
        <OrderDetailModal
          order={activeOrder}
          onClose={() => setActiveOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
