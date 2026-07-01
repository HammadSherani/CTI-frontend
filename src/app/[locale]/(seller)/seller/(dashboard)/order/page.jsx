"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";

const TABS = [
  { id: "", label: "All Orders", icon: "mdi:format-list-bulleted" },
  { id: "pending", label: "Pending", icon: "mdi:new-box" },
  { id: "processing", label: "Processing", icon: "mdi:cogs" },
  { id: "shipped", label: "Shipped", icon: "mdi:truck-delivery-outline" },
  { id: "delivered", label: "Delivered", icon: "mdi:check-circle-outline" },
  { id: "on_hold", label: "On Hold", icon: "mdi:pause-circle-outline" },
  { id: "cancelled", label: "Cancelled", icon: "mdi:cancel" },
];

/* ─────────────────────────────────────────────────────────
   DELIVERY INVOICE MODAL
───────────────────────────────────────────────────────── */
function DeliveryInvoiceModal({ order, onClose, onUploadNow }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();
  const token = useSelector((state) => state.auth.token);

  const handleUpload = async () => {
    if (!file) { setError('Please select a PDF file.'); return; }
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('orderId', order._id);

      const { data } = await axiosInstance.post('/seller/invoices/upload', fd, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': undefined
        }
      });
      
      if (data.success) {
        toast.success('Invoice uploaded and submitted to platform for review.');
        onUploadNow(data.data); // reuse callback for success handling
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white relative">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Icon icon="solar:bill-list-bold-duotone" className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black leading-tight">Order Delivered!</h2>
              <p className="text-emerald-100 text-sm mt-1 font-medium">
                {order?.orderNo || order?.orderId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Icon icon="mdi:close" className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="mt-4 text-white/90 text-sm leading-relaxed">
            You can now upload your invoice to submit to the platform for review and payment processing.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-2xl p-6 text-center cursor-pointer hover:bg-emerald-50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Icon icon="mdi:file-pdf-box" className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            {file ? (
              <p className="text-sm font-bold text-emerald-700">{file.name}</p>
            ) : (
              <>
                <p className="text-sm font-bold text-emerald-700">Click to select PDF</p>
                <p className="text-xs text-emerald-600/70 mt-1">PDF only — max 10 MB</p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={e => { setFile(e.target.files[0]); setError(''); }}
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl text-center font-medium">{error}</p>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors text-sm"
            >
              Skip for now
            </button>
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20 text-sm disabled:opacity-50"
            >
              {loading ? (
                <><Icon icon="svg-spinners:180-ring-with-bg" className="w-4 h-4" /> Uploading...</>
              ) : (
                <><Icon icon="solar:upload-bold-duotone" className="w-5 h-5" /> Upload & Submit</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */
export default function SellerOrderPage() {
  const { token } = useSelector((s) => s.auth);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const limit = 10;

  // Read ?status= from URL so dashboard "Pending Orders" link lands on the right tab
  const [statusTab, setStatusTab] = useState(() => {
    const s = searchParams?.get("status") || "";
    const valid = ["", "pending", "processing", "shipped", "delivered", "on_hold", "cancelled"];
    return valid.includes(s) ? s : "";
  });
  const [search, setSearch] = useState("");
  const [orderDateFrom, setOrderDateFrom] = useState("");
  const [orderDateTo, setOrderDateTo] = useState("");
  const [completionDateFrom, setCompletionDateFrom] = useState("");
  const [completionDateTo, setCompletionDateTo] = useState("");
  const [debouncedFilters, setDebouncedFilters] = useState({});
  const [exporting, setExporting] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(null);

  /* Delivery invoice popup */
  const [deliveryModal, setDeliveryModal] = useState(null); // { _id, orderNo, orderId }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({ search, orderDateFrom, orderDateTo, completionDateFrom, completionDateTo });
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, orderDateFrom, orderDateTo, completionDateFrom, completionDateTo]);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit, status: statusTab, ...debouncedFilters });
      for (const [key, value] of Array.from(params.entries())) {
        if (!value) params.delete(key);
      }
      const res = await axiosInstance.get(`/seller/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, statusTab, debouncedFilters, token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ status: statusTab, ...debouncedFilters });
      for (const [key, value] of Array.from(params.entries())) if (!value) params.delete(key);
      const res = await axiosInstance.get(`/seller/orders/csv/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Orders_Export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  const updateStatus = async (row, newStatus) => {
    setStatusUpdateLoading(row._id);
    try {
      await axiosInstance.put(
        "/seller/orders/status",
        { orderId: row._id, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Order status updated");
      fetchOrders();
      /* Show invoice upload popup when marked as delivered */
      if (newStatus === "delivered") {
        setDeliveryModal(row);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const cfg = {
      pending:    { bg: "bg-blue-100",    text: "text-blue-700"    },
      processing: { bg: "bg-purple-100",  text: "text-purple-700"  },
      shipped:    { bg: "bg-orange-100",  text: "text-orange-700"  },
      delivered:  { bg: "bg-emerald-100", text: "text-emerald-700" },
      on_hold:    { bg: "bg-red-100",     text: "text-red-700"     },
      cancelled:  { bg: "bg-gray-100",    text: "text-gray-700"    },
    }[status] || { bg: "bg-gray-100", text: "text-gray-700" };
    return (
      <span className={`px-2 py-1 ${cfg.bg} ${cfg.text} rounded-lg text-xs font-bold uppercase tracking-wider`}>
        {status?.replace("_", " ") || status}
      </span>
    );
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
      ),
    },
    {
      header: "Customer",
      cell: (row) => <span className="font-medium text-gray-800">{row.customerName}</span>,
    },
    {
      header: "Items Summary",
      cell: (row) => {
        const count = row.items?.length || 0;
        const first = row.items?.[0];
        return (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 line-clamp-1">{first?.product?.title || "Unknown Product"}</span>
            <div className="flex items-center gap-2 mt-1">
              {count > 1 && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold">+{count - 1} more</span>}
              <span className="text-xs text-gray-500 font-mono">{first?.product?.barcode || "No Barcode"}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Total",
      cell: (row) => <span className="font-bold text-emerald-600">${(row.sellerTotal || 0).toFixed(2)}</span>,
    },
    {
      header: "Status",
      cell: (row) => getStatusBadge(row.orderStatus),
    },
    {
      header: "Completion",
      cell: (row) => (
        <span className="text-xs text-gray-500">
          {row.completionDate ? new Date(row.completionDate).toLocaleDateString() : "-"}
        </span>
      ),
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
              className="p-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              title="View Details"
            >
              <Icon icon="mdi:eye-outline" className="w-5 h-5" />
            </button>
            {/* Upload invoice shortcut for delivered orders */}
            {s === "delivered" && (
              <button
                onClick={() => router.push(`/seller/order/${row._id}#invoice`)}
                className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                title="Upload Invoice"
              >
                <Icon icon="solar:bill-list-bold-duotone" className="w-5 h-5" />
              </button>
            )}
            <select
              disabled={isL || s === "delivered" || s === "cancelled"}
              value={s}
              onChange={(e) => updateStatus(row, e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        );
      },
    },
  ];

  const clearFilters = () => {
    setSearch(""); setOrderDateFrom(""); setOrderDateTo("");
    setCompletionDateFrom(""); setCompletionDateTo(""); setStatusTab(""); setPage(1);
  };
  const hasFilters = search || orderDateFrom || orderDateTo || completionDateFrom || completionDateTo || statusTab;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">

      {/* Delivery Invoice Modal */}
      {deliveryModal && (
        <DeliveryInvoiceModal
          order={deliveryModal}
          onClose={() => setDeliveryModal(null)}
          onUploadNow={() => {
            setDeliveryModal(null);
            // optionally reload orders if we want to show invoice status, but it's fine as is
          }}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Orders & Shipping</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage and track your customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/seller/order/cancelled")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-50 transition-all shadow-sm"
          >
            <Icon icon="mdi:cancel" className="w-5 h-5" />
            Cancelled Orders
          </button>
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
        {TABS.map((tab) => (
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
            <input
              type="text"
              placeholder="Search by Order No, Customer, Product, Barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
          <div className="w-full sm:w-48 relative">
            <select
              value={statusTab}
              onChange={(e) => { setStatusTab(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none appearance-none font-medium text-gray-700"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Icon icon="mdi:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-500">Order Date:</label>
              <input type="date" value={orderDateFrom} onChange={(e) => setOrderDateFrom(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
              <span className="text-gray-400">-</span>
              <input type="date" value={orderDateTo} onChange={(e) => setOrderDateTo(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            </div>
            {statusTab === "delivered" && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-500">Completion:</label>
                <input type="date" value={completionDateFrom} onChange={(e) => setCompletionDateFrom(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                <span className="text-gray-400">-</span>
                <input type="date" value={completionDateTo} onChange={(e) => setCompletionDateTo(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
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
