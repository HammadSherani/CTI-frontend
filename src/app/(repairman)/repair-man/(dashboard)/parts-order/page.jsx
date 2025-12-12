"use client"

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Link from 'next/link';

function PartsOrder() {
    const [isLoading, setLoading] = useState(false);
    const [partsOrders, setPartsOrders] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
        hasNext: false,
        hasPrev: false
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
    const [filterShippingMethod, setFilterShippingMethod] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState(null);
    const { token } = useSelector(state => state.auth);

    useEffect(() => {
        fetchPartsOrders();
    }, [currentPage, searchTerm, filterStatus, filterPaymentStatus, filterShippingMethod]);

    const fetchPartsOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(searchTerm && { search: searchTerm }),
                ...(filterStatus !== 'all' && { orderStatus: filterStatus }),
                ...(filterPaymentStatus !== 'all' && { paymentStatus: filterPaymentStatus }),
                ...(filterShippingMethod !== 'all' && { shippingMethod: filterShippingMethod })
            });

            const { data } = await axiosInstance.get(`/repairman/parts/orders?${params}`, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                }
            });

            if (data.success) {
                setPartsOrders(data.parts || []);
                setPagination(data.pagination || {});
                setError(null);
            } else {
                setError('Failed to load parts orders');
                toast.error('Failed to load parts orders');
            }
        } catch (error) {
            console.error('Error fetching parts orders:', error);
            setError('Failed to load parts orders. Please try again.');
            toast.error('Failed to load parts orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            partial: 'bg-orange-100 text-orange-800',
            paid: 'bg-green-100 text-green-800',
            refunded: 'bg-red-100 text-red-800'
        };
        return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        pages.push(
            <button
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
        );

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 text-sm font-medium border-t border-b border-gray-300 hover:bg-gray-50 ${currentPage === i
                            ? 'bg-primary-50 text-primary-600 border-primary-500'
                            : 'bg-white text-gray-500'
                        }`}
                >
                    {i}
                </button>
            );
        }

        pages.push(
            <button
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        );

        return (
            <div className="flex items-center justify-between mt-6 px-8 py-2">
                <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to{' '}
                    <span className="font-medium">
                        {Math.min(currentPage * 10, pagination.totalOrders)}
                    </span> of{' '}
                    <span className="font-medium">{pagination.totalOrders}</span> results
                </div>
                <div className="flex">{pages}</div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Parts Orders</h1>
                            <p className="text-gray-600 mt-1">Manage and track parts orders</p>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-600 mr-2" />
                            <p className="text-red-800">{error}</p>
                        </div>
                    </div>
                )}

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="xl:col-span-1">
                            <div className="relative">
                                <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by order number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        {/* Order Status Filter */}
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:package-variant" className="text-gray-400 w-5 h-5" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="all">All Orders</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Payment Status Filter */}
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:cash" className="text-gray-400 w-5 h-5" />
                            <select
                                value={filterPaymentStatus}
                                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                                className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="all">All Payments</option>
                                <option value="Pending">Pending</option>
                                <option value="Partial">Partial</option>
                                <option value="Paid">Paid</option>
                                <option value="Refunded">Refunded</option>
                            </select>
                        </div>

                        {/* Shipping Method Filter */}
                        <div className="flex items-center gap-2">
                            <Icon icon="mdi:truck" className="text-gray-400 w-5 h-5" />
                            <select
                                value={filterShippingMethod}
                                onChange={(e) => setFilterShippingMethod(e.target.value)}
                                className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="all">All Methods</option>
                                <option value="Pickup">Pickup</option>
                                <option value="Delivery">Delivery</option>
                                <option value="Courier">Courier</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
                                <p className="text-gray-600">Loading orders...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Order #
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Customer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Items
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Payment
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Shipping
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {partsOrders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {order.orderNumber}
                                                    </div>

                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {order.customer?.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {order.customer?.email}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {order.customer?.phone}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {order.items?.length} item(s)
                                                    </div>
                                                    {order.items?.slice(0, 2).map((item, idx) => (
                                                        <div key={idx} className="text-xs text-gray-500 truncate max-w-xs">
                                                            {item.partName} x{item.quantity}
                                                        </div>
                                                    ))}
                                                    {order.items?.length > 2 && (
                                                        <div className="text-xs text-gray-500">
                                                            +{order.items.length - 2} more
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        ${order.totalAmount?.toLocaleString()}
                                                    </div>
                                                    {order.discount > 0 && (
                                                        <div className="text-xs text-green-600">
                                                            -${order.discount} discount
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-gray-500">
                                                        Subtotal: ${order.subtotal?.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-1 ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                        {order.paymentStatus}
                                                    </div>
                                                    {/* <div className="text-xs text-gray-500">
                                                        Paid: ${order.paidAmount?.toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Due: ${order.remainingAmount?.toLocaleString()}
                                                    </div>
                                                    <div className="text-xs font-medium text-primary-600">
                                                        {order.paymentPercentage}% paid
                                                    </div> */}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                                        {order.orderStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <Icon
                                                            icon={order.shippingMethod === 'Pickup' ? 'mdi:store' : 'mdi:truck'}
                                                            className="w-4 h-4 mr-1"
                                                        />
                                                        {order.shippingMethod}
                                                    </div>
                                                    {/* <div className="text-xs text-gray-500">
                                                        {order.paymentMethod}
                                                    </div> */}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/repair-man/parts-order/${order?._id}`}>
                                                        <button
                                                            className="text-primary-600 hover:text-primary-900 transition-colors"
                                                            title="View details"
                                                        >
                                                            <Icon icon="mdi:eye" className="w-5 h-5" />
                                                        </button>
                                                        </Link>
                                                        {/* <Link href={`/repair-man/parts-order/${order?._id}`}>
                                                            <button
                                                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                                                title="Edit order"
                                                            >
                                                                <Icon icon="mdi:pencil" className="w-5 h-5" />
                                                            </button>
                                                        </Link> */}

                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {!isLoading && partsOrders.length === 0 && (
                                    <div className="text-center py-12">
                                        <Icon icon="mdi:package-variant" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                                        <p className="text-gray-500">
                                            {searchTerm || filterStatus !== 'all' || filterPaymentStatus !== 'all' || filterShippingMethod !== 'all'
                                                ? 'Try adjusting your search or filters.'
                                                : 'No orders have been placed yet.'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {!isLoading && renderPagination()}
                        </>
                    )}
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:package-variant" className="w-8 h-8 text-primary-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {isLoading ? '...' : pagination.totalOrders || partsOrders.length}
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
                                <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {isLoading ? '...' : partsOrders.filter(order => order.orderStatus === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:cash-check" className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {isLoading ? '...' : `$${partsOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toLocaleString()}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Icon icon="mdi:truck-delivery" className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Delivered</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {isLoading ? '...' : partsOrders.filter(order => order.orderStatus === 'delivered').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PartsOrder;