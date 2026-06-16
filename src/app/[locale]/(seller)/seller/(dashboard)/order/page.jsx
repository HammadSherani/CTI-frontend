'use client';

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
import moment from "moment";

export default function SellerOrdersPage() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  const debounceRef = useRef(null);
  const [loadingItem, setLoadingItem] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalEarnings: 0,
    pending: 0,
    shipped: 0,
  });

  const STATUS_CONFIG = {
    PLACED: { label: "Placed", color: "bg-blue-100 text-blue-700", icon: "mdi:clock-outline" },
    CONFIRMED: { label: "Confirmed", color: "bg-indigo-100 text-indigo-700", icon: "mdi:check-circle-outline" },
    SHIPPED: { label: "Shipped", color: "bg-amber-100 text-amber-700", icon: "mdi:truck-delivery-outline" },
    DELIVERED: { label: "Delivered", color: "bg-emerald-100 text-emerald-700", icon: "mdi:package-check" },
    CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: "mdi:cancel" },
  };

  const fetchOrders = useCallback(async (currentPage = 1, currentSearch = search, status = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 10 });
      if (currentSearch) params.set("search", currentSearch);
      if (status) params.set("status", status);

      const { data } = await axiosInstance.get(`/seller/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(data.data || []);
      setPagination(data.pagination || null);

      const totalEarnings = data.data?.reduce((sum, order) => sum + (order.sellerTotal || 0), 0) || 0;
      setSummary({
        totalOrders: data.pagination?.totalItems || 0,
        totalEarnings,
        pending: data.data?.filter(o => o.items.some(i => ["PLACED", "CONFIRMED"].includes(i.itemStatus))).length || 0,
        shipped: data.data?.filter(o => o.items.some(i => i.itemStatus === "SHIPPED")).length || 0,
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, token]);

  useEffect(() => {
    if (token) fetchOrders(page);
  }, [page, statusFilter, token, fetchOrders]);

  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchOrders(1, val, statusFilter);
    }, 400);
  };

  const updateItemStatus = async (orderId, productId, newStatus) => {
    const key = `${orderId}-${productId}`;

    try {
      setLoadingItem(key);

      const { data } = await axiosInstance.put(
        "/seller/orders/status",
        {
          orderId,
          productId,
          itemStatus: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success("Status updated");
        fetchOrders(page, search, statusFilter);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally {
      setLoadingItem(null);
    }
  };

  const viewOrderDetails = (orderId) => {
    router.push(`/seller/orders/${orderId}`);
  };
  const columns = [
    {
      key: "order",
      header: "Order",
      cell: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.orderNumber}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {moment(row.createdAt).format('DD MMM YYYY')}
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.shippingAddress?.fullName}</div>
          <div className="text-xs text-gray-500">{row.shippingAddress?.phone}</div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      cell: (row) => (
        <div className="space-y-2">
          {row.items?.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <img
                src={item.productId?.images?.[0]?.url || 'https://via.placeholder.com/40'}
                alt=""
                className="w-8 h-8 rounded-lg object-cover border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.productId?.title}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
          {row.items?.length > 2 && (
            <p className="text-xs text-gray-400">+{row.items.length - 2} more</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <div className="space-y-2">
          {row.items?.map((item, idx) => {
            const status = item.itemStatus || "PLACED";

            const config =
              STATUS_CONFIG[status] || {
                label: status,
                color: "bg-gray-100 text-gray-600",
                icon: "mdi:help",
              };

            const key = `${row._id}-${item.productId?._id}`;
            const isUpdating = loadingItem === key;

            return (
              <div key={idx} className="flex items-center gap-2">

                {/* STATUS BADGE */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold ${config.color}`}
                >
                  <Icon icon={config.icon} className="w-4 h-4" />
                  {config.label}
                </div>

                {/* DROPDOWN */}
                <div className="w-40">
                  <CustomDropdown
                    icon="mdi:chevron-down"
                    options={[
                      { label: "Placed", value: "PLACED" },
                      { label: "Confirmed", value: "CONFIRMED" },
                      { label: "Shipped", value: "SHIPPED" },
                      { label: "Delivered", value: "DELIVERED" },
                      { label: "Cancelled", value: "CANCELLED" },
                    ]}
                    value={status}
                    disabled={isUpdating}
                    isLoading={isUpdating}
                    onChange={(val) =>
                      updateItemStatus(row._id, item.productId?._id, val)
                    }
                  />

                </div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      key: "earnings",
      header: "Earnings",
      cell: (row) => (
        <div className="text-right font-bold text-emerald-600">
          ${row.sellerTotal?.toFixed(2)}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-1">
          <button
            onClick={() => viewOrderDetails(row._id)}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-700 transition-colors"
            title="View Order Details"
          >
            <Icon icon="mdi:eye-outline" className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  // Loading Skeleton
  const skeletonRows = Array(5).fill(0).map((_, i) => (
    <div key={i} className="animate-pulse p-6 border-b border-gray-100">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  ));

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-gray-500 mt-1">Track and manage all customer orders for your products</p>
        </div>
      </div>

      <SummaryCards data={[
        { label: "Total Orders", value: summary.totalOrders, icon: "mdi:cart-outline", color: "#6366f1" },
        { label: "Total Earnings", value: `$${summary.totalEarnings.toFixed(2)}`, icon: "mdi:cash-multiple", color: "#10b981" },
        { label: "Pending", value: summary.pending, icon: "mdi:clock-time-eight-outline", color: "#f59e0b" },
        { label: "Shipped", value: summary.shipped, icon: "mdi:truck-delivery-outline", color: "#8b5cf6" },
      ]} />

      {/* Filters */}
      <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by order number or customer..."
            />
          </div>
          <div className="w-full md:w-56">
            <CustomDropdown
              icon="mdi:filter-variant"
              placeholder="All Status"
              options={[
                { label: "All Status", value: "" },
                { label: "Placed", value: "PLACED" },
                { label: "Confirmed", value: "CONFIRMED" },
                { label: "Shipped", value: "SHIPPED" },
                { label: "Delivered", value: "DELIVERED" },
                { label: "Cancelled", value: "CANCELLED" },
              ]}
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="mt-6 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable
          data={orders}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          emptyIcon="mdi:cart-outline"
          emptyTitle="No orders yet"
          emptyDescription="New orders will appear here once customers purchase your products."
        />
      </div>
    </div>
  );
} 