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

// Date Range Picker Component
const DateRangePicker = ({ startDate, endDate, onStartChange, onEndChange, onClear }) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          className="h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          placeholder="Start Date"
        />
      </div>
      <span className="text-gray-400">to</span>
      <div className="relative">
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          className="h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          placeholder="End Date"
        />
      </div>
      {(startDate || endDate) && (
        <button
          onClick={onClear}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon icon="mdi:close-circle" className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalEarnings: 0,
    pending: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  const STATUS_CONFIG = {
    PLACED: { label: "Placed", color: "bg-blue-100 text-blue-700", icon: "mdi:clock-outline" },
    CONFIRMED: { label: "Confirmed", color: "bg-indigo-100 text-indigo-700", icon: "mdi:check-circle-outline" },
    SHIPPED: { label: "Shipped", color: "bg-amber-100 text-amber-700", icon: "mdi:truck-delivery-outline" },
    DELIVERED: { label: "Delivered", color: "bg-emerald-100 text-emerald-700", icon: "mdi:package-check" },
    CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: "mdi:cancel" },
  };

  const fetchOrders = useCallback(async (currentPage = 1, currentSearch = search, status = statusFilter, from = startDate, to = endDate) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        page: currentPage, 
        limit: 10 
      });
      if (currentSearch) params.set("search", currentSearch);
      if (status) params.set("status", status);
      if (from) params.set("startDate", from);
      if (to) params.set("endDate", to);

      const { data } = await axiosInstance.get(`/seller/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(data.data || []);
      setPagination(data.pagination || null);

      // Calculate summary stats
      const allOrders = data.data || [];
      const totalEarnings = allOrders.reduce((sum, order) => sum + (order.sellerTotal || 0), 0);
      
      const pending = allOrders.filter(o => 
        o.items.some(i => ["PLACED", "CONFIRMED"].includes(i.itemStatus))
      ).length;
      
      const shipped = allOrders.filter(o => 
        o.items.some(i => i.itemStatus === "SHIPPED")
      ).length;
      
      const delivered = allOrders.filter(o => 
        o.items.every(i => i.itemStatus === "DELIVERED")
      ).length;
      
      const cancelled = allOrders.filter(o => 
        o.items.every(i => i.itemStatus === "CANCELLED")
      ).length;

      setSummary({
        totalOrders: data.pagination?.totalItems || 0,
        totalEarnings,
        pending,
        shipped,
        delivered,
        cancelled,
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, startDate, endDate, token]);

  useEffect(() => {
    if (token) fetchOrders(page);
  }, [page, statusFilter, startDate, endDate, token, fetchOrders]);

  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchOrders(1, val, statusFilter, startDate, endDate);
    }, 400);
  };

  const handleDateChange = (type, value) => {
    if (type === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchOrders(1, search, statusFilter, 
        type === 'start' ? value : startDate,
        type === 'end' ? value : endDate
      );
    }, 400);
  };

  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
    setPage(1);
    fetchOrders(1, search, statusFilter, '', '');
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
        fetchOrders(page, search, statusFilter, startDate, endDate);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally {
      setLoadingItem(null);
    }
  };

  const viewOrderDetails = (orderId) => {
    router.push(`/seller/order/${orderId}`);
  };

  // CSV Export Function
  const exportCSV = () => {
    if (!orders.length) {
      toast.warning("No orders to export");
      return;
    }

    // Flatten orders for CSV
    const csvData = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        csvData.push({
          'Order Number': order.orderNumber,
          'Order Date': moment(order.createdAt).format('DD MMM YYYY HH:mm'),
          'Customer Name': order.shippingAddress?.fullName || '',
          'Customer Phone': order.shippingAddress?.phone || '',
          'Customer Email': order.userId?.email || '',
          'Product': item.productId?.title || '',
          'Quantity': item.quantity,
          'Price': item.price,
          'Total': (item.price * item.quantity).toFixed(2),
          'Status': item.itemStatus,
          'Payment Status': order.paymentStatus,
          'Order Status': order.orderStatus,
          'City': order.shippingAddress?.city || '',
          'Area': order.shippingAddress?.area || '',
          'Address': order.shippingAddress?.addressLine || '',
        });
      });
    });

    // Convert to CSV
    const headers = Object.keys(csvData[0]);
    const csvRows = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => 
          `"${(row[header] || '').toString().replace(/"/g, '""')}"`
        ).join(',')
      )
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${moment().format('YYYY-MM-DD_HH-mm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  const columns = [
    {
      key: "orderInfo",
      header: "Order Information",
      cell: (row) => (
        <div>
          <div className="font-semibold text-gray-900 cursor-pointer hover:text-primary-600" onClick={() => viewOrderDetails(row._id)}>
            #{row.orderNumber}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {moment(row.createdAt).format('DD MMM YYYY')}
          </div>
          <div className="text-xs text-gray-400">
            {moment(row.createdAt).format('hh:mm A')}
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer Name",
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.shippingAddress?.fullName || 'N/A'}</div>
          <div className="text-xs text-gray-500">{row.shippingAddress?.phone || 'N/A'}</div>
          <div className="text-xs text-gray-400 truncate max-w-[120px]">{row.userId?.email || ''}</div>
        </div>
      ),
    },
    {
      key: "productName",
      header: "Product Name",
      cell: (row) => (
        <div className="space-y-2 max-w-[180px]">
          {row.items?.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <img
                src={item.productId?.images?.[0]?.url || 'https://via.placeholder.com/32'}
                alt=""
                className="w-8 h-8 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/32?text=No+Image';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.productId?.title || 'Unknown Product'}</p>
                <div className="flex items-center gap-2">
                  {item.variant?.color && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <span 
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: item.variant.colorHex || '#666' }}
                      />
                      {item.variant.color}
                    </span>
                  )}
                  {item.variant?.size && (
                    <span className="text-xs text-gray-500">Size: {item.variant.size}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {row.items?.length > 2 && (
            <p className="text-xs text-gray-400">+{row.items.length - 2} more items</p>
          )}
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      cell: (row) => (
        <div className="space-y-1">
          {row.items?.map((item, idx) => (
            <div key={idx} className="text-sm">
              <span className="font-medium">${item.price?.toFixed(2)}</span>
              <span className="text-xs text-gray-400"> × {item.quantity}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      cell: (row) => (
        <div className="font-bold text-emerald-600">
          ${row.sellerTotal?.toFixed(2)}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <div className="space-y-2 min-w-[180px]">
          {row.items?.map((item, idx) => {
            const status = item.itemStatus || "PLACED";
            const config = STATUS_CONFIG[status] || { label: status, color: "bg-gray-100 text-gray-600", icon: "mdi:help" };
            const key = `${row._id}-${item.productId?._id}`;
            const isUpdating = loadingItem === key;

            return (
              <div key={idx} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap ${config.color}`}>
                  <Icon icon={config.icon} className="w-4 h-4" />
                  {config.label}
                </div>
                <div className="w-36">
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
                    disabled={isUpdating || status === "DELIVERED" || status === "CANCELLED"}
                    isLoading={isUpdating}
                    onChange={(val) => updateItemStatus(row._id, item.productId?._id, val)}
                  />
                </div>
              </div>
            );
          })}
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
          <button
            onClick={() => {
              // Generate invoice or print
              window.print();
            }}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-700 transition-colors"
            title="Print Invoice"
          >
            <Icon icon="mdi:printer-outline" className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-gray-500 mt-1">Track and manage all customer orders for your products</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Icon icon="mdi:file-export-outline" className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>

      <SummaryCards data={[
        { label: "Total Orders", value: summary.totalOrders, icon: "mdi:cart-outline", color: "#6366f1" },
        { label: "Pending", value: summary.pending, icon: "mdi:clock-time-eight-outline", color: "#f59e0b" },
        { label: "Shipped", value: summary.shipped, icon: "mdi:truck-delivery-outline", color: "#8b5cf6" },
        { label: "Delivered", value: summary.delivered, icon: "mdi:package-check", color: "#34d399" },
      ]} />

      {/* Filters */}
      <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <SearchInput
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by order number, customer name, product name, or barcode..."
              />
            </div>
            <div>
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
                onChange={(val) => { 
                  setStatusFilter(val); 
                  setPage(1);
                  fetchOrders(1, search, val, startDate, endDate);
                }}
              />
            </div>
            <div>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartChange={(val) => handleDateChange('start', val)}
                onEndChange={(val) => handleDateChange('end', val)}
                onClear={clearDateFilters}
              />
            </div>
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