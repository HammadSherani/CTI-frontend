"use client";

import { useEffect, useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";

const TABS = [
  { id: "", label: "All Orders", icon: "mdi:format-list-bulleted" },
  { id: "new", label: "New Orders", icon: "mdi:new-box" },
  { id: "shipping", label: "In Transport", icon: "mdi:truck-delivery-outline" },
  { id: "delivered", label: "Delivered", icon: "mdi:check-circle-outline" },
  { id: "on_hold", label: "On Hold", icon: "mdi:pause-circle-outline" },
];

export default function SellerOrderPage() {
  const { token } = useSelector((s) => s.auth);

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const limit = 10;

  // Filters
  const [statusTab, setStatusTab] = useState("");
  const [search, setSearch] = useState("");
  
  const [orderDateFrom, setOrderDateFrom] = useState("");
  const [orderDateTo, setOrderDateTo] = useState("");
  const [completionDateFrom, setCompletionDateFrom] = useState("");
  const [completionDateTo, setCompletionDateTo] = useState("");

  const [debouncedFilters, setDebouncedFilters] = useState({});
  const [exporting, setExporting] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(null);

  // Debounce simple text inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        search,
        orderDateFrom, orderDateTo, completionDateFrom, completionDateTo
      });
      setPage(1); // reset to page 1 on search change
    }, 500);
    return () => clearTimeout(timer);
  }, [search, orderDateFrom, orderDateTo, completionDateFrom, completionDateTo]);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        status: statusTab,
        ...debouncedFilters
      });
      
      // Clean up empty params
      for (const [key, value] of Array.from(params.entries())) {
        if (!value) params.delete(key);
      }

      const res = await axiosInstance.get(`/seller/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, statusTab, debouncedFilters, token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        status: statusTab,
        ...debouncedFilters
      });
      for (const [key, value] of Array.from(params.entries())) {
        if (!value) params.delete(key);
      }

      const res = await axiosInstance.get(`/seller/orders/csv/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Orders_Export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      toast.error("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  const updateStatus = async (oId, newStatus) => {
    setStatusUpdateLoading(oId);
    try {
      await axiosInstance.put('/seller/orders/status', {
        orderId: oId,
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Order status updated");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "new": return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider">New</span>;
      case "processing": return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold uppercase tracking-wider">Processing</span>;
      case "shipping": return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold uppercase tracking-wider">Shipping</span>;
      case "delivered": return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wider">Delivered</span>;
      case "on_hold": return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold uppercase tracking-wider">On Hold</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const columns = [
    {
      header: "Order Info",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-gray-900">{row.orderNo || "N/A"}</span>
          <span className="text-[10px] text-gray-500 font-mono">{row.orderId}</span>
          <span className="text-xs text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      header: "Customer",
      cell: (row) => (
        <span className="font-medium text-gray-800">{row.customerName}</span>
      )
    },
    {
      header: "Items Summary",
      cell: (row) => {
        const count = row.items?.length || 0;
        const firstItem = row.items?.[0];
        return (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 line-clamp-1" title={firstItem?.product?.title}>
              {firstItem?.product?.title || "Unknown Product"}
            </span>
            <div className="flex items-center gap-2 mt-1">
              {count > 1 && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold">+{count - 1} more</span>}
              <span className="text-xs text-gray-500 font-mono" title="Barcode">
                 {firstItem?.product?.barcode || "No Barcode"}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: "Total",
      cell: (row) => (
        <span className="font-bold text-emerald-600">${(row.sellerTotal || 0).toFixed(2)}</span>
      )
    },
    {
      header: "Status",
      cell: (row) => getStatusBadge(row.orderStatus)
    },
    {
      header: "Completion",
      cell: (row) => (
        <span className="text-xs text-gray-500">
          {row.completionDate ? new Date(row.completionDate).toLocaleDateString() : "-"}
        </span>
      )
    },
    {
      header: "Actions",
      cell: (row) => {
        const s = row.orderStatus;
        const isL = statusUpdateLoading === row._id;

        return (
          <div className="flex gap-2 items-center">
            <button
              onClick={() => router.push(`/seller/order/${row._id}`)}
              className="p-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors" title="View Details"
            >
              <Icon icon="mdi:eye-outline" className="w-5 h-5" />
            </button>
            {s === "new" && (
              <>
                <button disabled={isL} onClick={() => updateStatus(row._id, "shipping")} className="p-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors" title="Move to Shipping">
                  <Icon icon="mdi:truck-fast-outline" className="w-5 h-5" />
                </button>
                <button disabled={isL} onClick={() => updateStatus(row._id, "on_hold")} className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors" title="Put On Hold">
                  <Icon icon="mdi:pause-circle-outline" className="w-5 h-5" />
                </button>
              </>
            )}
            {s === "shipping" && (
              <>
                <button disabled={isL} onClick={() => updateStatus(row._id, "delivered")} className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors" title="Mark Delivered">
                  <Icon icon="mdi:check-circle-outline" className="w-5 h-5" />
                </button>
                <button disabled={isL} onClick={() => updateStatus(row._id, "on_hold")} className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors" title="Put On Hold">
                  <Icon icon="mdi:pause-circle-outline" className="w-5 h-5" />
                </button>
              </>
            )}
            {s === "on_hold" && (
              <>
                <button disabled={isL} onClick={() => updateStatus(row._id, "new")} className="p-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors" title="Resume to New">
                  <Icon icon="mdi:play-circle-outline" className="w-5 h-5" />
                </button>
                <button disabled={isL} onClick={() => updateStatus(row._id, "shipping")} className="p-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors" title="Resume to Shipping">
                  <Icon icon="mdi:truck-fast-outline" className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        )
      }
    }
  ];

  const clearFilters = () => {
    setSearch("");
    setOrderDateFrom("");
    setOrderDateTo("");
    setCompletionDateFrom("");
    setCompletionDateTo("");
    setStatusTab("");
    setPage(1);
  };

  const hasFilters = search || orderDateFrom || orderDateTo || completionDateFrom || completionDateTo || statusTab;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">
      
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Orders & Shipping</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage and track your customer orders</p>
        </div>
        <div>
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 border border-emerald-200 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-sm disabled:opacity-50"
          >
            {exporting ? <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" /> : <Icon icon="mdi:file-excel" className="w-5 h-5" />}
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex overflow-x-auto gap-2 pb-2 hide-scrollbar border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setStatusTab(tab.id); setPage(1); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold transition-all ${
              statusTab === tab.id 
                ? "bg-white text-primary-600 border-t-2 border-primary-600 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]" 
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <Icon icon={tab.icon} className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 sticky top-4 z-10">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search by Order No, Customer, Product, Barcode..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
          </div>
          <div className="w-full sm:w-48 relative">
            <select value={statusTab} onChange={e => { setStatusTab(e.target.value); setPage(1); }} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none appearance-none font-medium text-gray-700">
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="processing">Processing</option>
              <option value="shipping">Shipping</option>
              <option value="delivered">Delivered</option>
              <option value="on_hold">On Hold</option>
            </select>
            <Icon icon="mdi:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-500">Order Date:</label>
              <input type="date" value={orderDateFrom} onChange={e=>setOrderDateFrom(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
              <span className="text-gray-400">-</span>
              <input type="date" value={orderDateTo} onChange={e=>setOrderDateTo(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            </div>
            {statusTab === "delivered" && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-500">Completion:</label>
                <input type="date" value={completionDateFrom} onChange={e=>setCompletionDateFrom(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                <span className="text-gray-400">-</span>
                <input type="date" value={completionDateTo} onChange={e=>setCompletionDateTo(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
              </div>
            )}
          </div>
          
          {hasFilters && (
            <button onClick={clearFilters} className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg text-sm hover:bg-red-100 transition-colors shrink-0">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
        />
      </div>

    </div>
  );
}