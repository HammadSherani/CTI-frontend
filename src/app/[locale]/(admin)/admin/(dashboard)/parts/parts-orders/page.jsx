"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import handleError from '@/helper/handleError';
import { nextPartsOrderStatuses, PARTS_ORDER_STATUS_LABELS } from '@/constant/partsOrderStatus';

function PartsOrderPage() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPayment, setFilterPayment] = useState('all');
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    const { token } = useSelector((state) => state.auth);
const [actionLoading, setActionLoading] = useState(null);
    // Server-side pagination: filters/search run on the backend, counts feed the stats cards
    const PAGE_SIZE = 10;
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [counts, setCounts] = useState({});
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
        return () => clearTimeout(t);
    }, [searchTerm]);

    // A new filter/search starts again from page 1
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, filterStatus, filterPayment]);

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearch, filterStatus, filterPayment]);

    // `orders` and `filteredOrders` both hold the current page (kept for the existing table code)
    useEffect(() => {
        setFilteredOrders(orders);
    }, [orders]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/admin/parts-orders`, {
                params: {
                    page,
                    limit: PAGE_SIZE,
                    status: filterStatus,
                    paymentStatus: filterPayment,
                    search: debouncedSearch || undefined,
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setOrders(response.data.data || []);
            setPagination(response.data.pagination || { page: 1, totalPages: 1, total: (response.data.data || []).length });
            setCounts(response.data.counts || {});
        } catch (error) {
            console.error('Error fetching orders:', error);
            handleError(error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

   
    const updateOrderStatus = async (orderId, newStatus) => {
    try {
        setActionLoading(orderId);

        const res = await axiosInstance.put(
            `/admin/parts-orders/${orderId}`,
            { orderStatus: newStatus },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        toast.success(res.data.message || "Order status updated!");
        fetchOrders(); // refresh counts

        // ✅ Update locally instead of refetch
        setOrders(prev =>
            prev.map(order =>
                order._id === orderId
                    ? { ...order, orderStatus: newStatus }
                    : order
            )
        );

    } catch (error) {
        // Show the server reason (e.g. a status step that is not allowed)
        toast.error(error?.response?.data?.message || "Failed to update order status");
    } finally {
        setActionLoading(null);
    }
};

    const updatePaymentStatus = async (orderId, newPaymentStatus) => {
        try {
            const res = await axiosInstance.put(`/admin/parts-orders/${orderId}`,
                { paymentStatus: newPaymentStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            toast.success(res.data.message || 'Payment status updated!');
            fetchOrders();
        } catch (error) {
            console.error('Update payment status error:', error);
            setSubmitError('Failed to update payment status. Please try again.');
            toast.error(error?.response?.data?.message || "Failed to update payment status");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const getStatusColor = (status) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-teal-100 text-teal-800',
        processing: 'bg-blue-100 text-blue-800',
        'ready-for-pickup': 'bg-indigo-100 text-indigo-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        returned: 'bg-orange-100 text-orange-800'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};  

    const getPaymentStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            refunded: 'bg-gray-100 text-gray-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
        setActionLoading(orderId);

        const res = await axiosInstance.delete(
            `/admin/parts-orders/${orderId}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        toast.success(res.data.message || "Order deleted successfully!");

        // Reload the page so counts and pagination stay correct
        fetchOrders();

    } catch (error) {
        toast.error("Failed to delete order");
    } finally {
        setActionLoading(null);
    }
};
    return (
        <div className="min-h-screen bg-gray-50">
            {actionLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white/90 p-6 rounded-lg shadow-lg flex items-center gap-3">
                        <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin" />
                        <div className="text-sm font-medium text-gray-900">Updating order status...</div>
                    </div>
                </div>
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Parts Orders</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Manage and track all parts orders
                            </p>
                        </div>
                        {/* <Link
                            href="/admin/parts/parts-orders/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-colors"
                        >
                            <Icon icon="mdi:plus" className="w-5 h-5 mr-2" />
                            Create New Order
                        </Link> */}
                    </div>
                </div>

                {/* Success/Error Messages */}
                {submitSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                        <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-600 mr-3" />
                        <span className="text-green-800">{submitSuccess}</span>
                    </div>
                )}
                {submitError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                        <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-600 mr-3" />
                        <span className="text-red-800">{submitError}</span>
                    </div>
                )}

                {/* Stats */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:receipt-text-outline" className="w-8 h-8 text-primary-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : (counts.all ?? 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:clock-outline" className="w-8 h-8 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pending</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : (counts.pending ?? 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:package-variant" className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Confirmed</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : (counts.confirmed ?? 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:check-circle" className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Delivered</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : (counts.delivered ?? 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:currency-usd" className="w-8 h-8 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : formatCurrency(orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0))}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Icon icon="mdi:magnify" className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by order number, customer name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Order Status Filter */}
                        <div className="sm:w-48">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className={`block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-sm ${getStatusColor(filterStatus)}`}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Payment Status Filter */}
                        <div className="sm:w-48">
                            <select
                                value={filterPayment}
                                onChange={(e) => setFilterPayment(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            >
                                <option value="all">All Payments</option>
                                <option value="pending">Payment Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {(searchTerm || filterStatus !== 'all' || filterPayment !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterStatus('all');
                                    setFilterPayment('all');
                                }}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <Icon icon="mdi:filter-off" className="w-4 h-4 mr-2" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white mb-5 shadow-sm rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex flex-col items-center">
                                <Icon icon="mdi:loading" className="w-12 h-12 text-primary-600 animate-spin" />
                                <p className="mt-4 text-gray-600">Loading orders...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Order #
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Customer
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Order Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Payment
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Order Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredOrders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        #{order.orderNumber}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {order.customer.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {order.customerEmail}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {formatCurrency(order.totalAmount)}
                                                    </div>
                                                    {order.itemCount && (
                                                        <div className="text-xs text-gray-500">
                                                            {order.itemCount} item(s)
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={order.orderStatus}
                                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                        disabled={actionLoading === order._id}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)} border-0 ${actionLoading === order._id ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                                    >
                                                        {/* Only the current status and the allowed next steps */}
                                                        {[order.orderStatus, ...nextPartsOrderStatuses(order.orderStatus)].map((s) => (
                                                            <option key={s} value={s}>{PARTS_ORDER_STATUS_LABELS[s] || s}</option>
                                                        ))}
                                                    </select>
                                                    {order.isReceived && (
                                                        <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-green-700">
                                                            <Icon icon="mdi:hand-okay" className="w-3.5 h-3.5" />
                                                            Received by repairman
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`text-sm text-center p-1 rounded-md text-gray-500 ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                        {order.paymentStatus}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {formatDate(order.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/admin/parts/parts-orders/${order._id}`}
                                                            className="text-primary-600 hover:text-primary-900 transition-colors"
                                                            title="View order details"
                                                        >
                                                            <Icon icon="mdi:eye" className="w-5 h-5" />
                                                        </Link>
                                                        {/* <Link
                                                            href={`/admin/parts/parts-orders/${order._id}/edit`}
                                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                                            title="Edit order"
                                                        >
                                                            <Icon icon="mdi:pencil" className="w-5 h-5" />
                                                        </Link> */}
                                                       <button
    onClick={() => handleDelete(order._id)}
    disabled={actionLoading === order._id}
    className="text-red-600 hover:text-red-900 transition-colors"
>
    {actionLoading === order._id ? (
        <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
    ) : (
        <Icon icon="mdi:trash-can" className="w-5 h-5" />
    )}
</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {!loading && filteredOrders.length === 0 && (
                                    <div className="text-center py-12">
                                        <Icon icon="mdi:receipt-text-outline" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                                        <p className="text-gray-500">
                                            {searchTerm || filterStatus !== 'all' || filterPayment !== 'all'
                                                ? 'Try adjusting your search or filters.'
                                                : 'No orders have been placed yet.'
                                            }
                                        </p>
                                        {(!searchTerm && filterStatus === 'all' && filterPayment === 'all') && (
                                            <Link
                                                href="/admin/parts/parts-orders/create"
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 mt-4"
                                            >
                                                <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                                                Create your first order
                                            </Link>
                                        )}
                                    </div>
                                )}

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
                                        <p className="text-sm text-gray-500">
                                            Page {pagination.page} of {pagination.totalPages} · {pagination.total} orders
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                                disabled={loading || page <= 1}
                                                className="px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                                                disabled={loading || page >= pagination.totalPages}
                                                className="px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PartsOrderPage;