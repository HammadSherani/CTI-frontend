"use client";

import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import Link from 'next/link';

function PartOrderDetailPage() {
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState(null);
    const { token } = useSelector((state) => state.auth);
    const { id } = useParams();

    useEffect(() => {
        fetchOrderById();
    }, []);

    const fetchOrderById = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/admin/parts-orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrder(response.data.data || null);
        } catch (error) {
            handleError(error);
            toast.error("Failed to load order");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
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

    const getStatusBadge = (status) => {
        const map = {
            pending: 'bg-amber-50 text-amber-700 border border-amber-200',
            confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
            processing: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
            shipped: 'bg-purple-50 text-purple-700 border border-purple-200',
            delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            cancelled: 'bg-red-50 text-red-700 border border-red-200'
        };
        return map[status?.toLowerCase()] || 'bg-gray-50 text-gray-700 border border-gray-200';
    };

    const getPaymentBadge = (status) => {
        const map = {
            pending: 'bg-amber-50 text-amber-700 border border-amber-200',
            paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            failed: 'bg-red-50 text-red-700 border border-red-200',
            refunded: 'bg-gray-50 text-gray-700 border border-gray-200'
        };
        return map[status?.toLowerCase()] || 'bg-gray-50 text-gray-700 border border-gray-200';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="mdi:loading" className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center bg-white rounded-xl shadow-sm p-8">
                    <Icon icon="mdi:alert-circle-outline" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h3>
                    <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or has been removed.</p>
                    <Link
                        href="/admin/parts/parts-orders"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                        <Icon icon="mdi:arrow-left" className="w-4 h-4" />
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py that-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin/parts/parts-orders"
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <Icon icon="mdi:arrow-left" className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
                                <p className="text-sm text-gray-500 mt-1">Created on {formatDate(order.createdAt)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusBadge(order.orderStatus)}`}>
                                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                            </span>
                            <Link
                                href={`/admin/parts/parts-orders/${order._id}/edit`}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                <Icon icon="mdi:pencil" className="w-4 h-4" />
                                Edit Order
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Part</th>
                                            <th className="px-6 py-3 text-left">SKU</th>
                                            <th className="px-6 py-3 text-left">Price</th>
                                            <th className="px-6 py-3 text-left">Qty</th>
                                            <th className="px-6 py-3 text-left">Discount</th>
                                            <th className="px-6 py-3 text-left text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {order.items?.map((item) => (
                                            <tr key={item._id} className="text-sm">
                                                <td className="px-6 py-4 font-medium text-gray-900">{item.partName}</td>
                                                <td className="px-6 py-4 text-gray-600">{item.partSku}</td>
                                                <td className="px-6 py-4 text-gray-900">{formatCurrency(item.price)}</td>
                                                <td className="px-6 py-4 text-gray-900">{item.quantity}</td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {item.discount > 0 ? formatCurrency(item.discount) : '—'}
                                                </td>
                                                <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                    {formatCurrency(item.subtotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="bg-gray-50 px-6 py-5 border-t border-gray-200">
                                <div className="max-w-xs ml-auto space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-red-600">
                                            <span>Discount</span>
                                            <span className="font-medium">−{formatCurrency(order.discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax</span>
                                        <span className="font-medium">{formatCurrency(order.tax)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">
                                            {order.shippingCharges > 0 ? formatCurrency(order.shippingCharges) : 'Free'}
                                        </span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-300 flex justify-between text-base font-bold">
                                        <span>Total</span>
                                        <span>{formatCurrency(order.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Notes */}
                        {order.orderNotes && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Notes</h3>
                                <p className="text-gray-600 leading-relaxed">{order.orderNotes}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Customer */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                                <Icon icon="mdi:account" className="w-5 h-5 text-gray-500" />
                                Customer Details
                            </h3>
                            <dl className="space-y-4 text-sm">
                                <div>
                                    <dt className="text-gray-500">Name</dt>
                                    <dd className="font-medium text-gray-900">{order.customer?.name || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Email</dt>
                                    <dd className="text-gray-900">{order.customer?.email || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Phone</dt>
                                    <dd className="text-gray-900">{order.customer?.phone || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Type</dt>
                                    <dd className="text-gray-900">{order.customerType || 'N/A'}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Shipping */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                                <Icon icon="mdi:truck" className="w-5 h-5 text-gray-500" />
                                Shipping Address
                            </h3>
                            <div className="text-sm text-gray-900 space-y-1">
                                <p>{order.customer?.shippingAddress?.city || 'N/A'}</p>
                                <p>{order.customer?.shippingAddress?.country || 'N/A'}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <dt className="text-xs text-gray-500 uppercase tracking-wider">Method</dt>
                                <dd className="mt-1 font-medium text-gray-900">{order.shippingMethod || 'N/A'}</dd>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                                <Icon icon="mdi:credit-card" className="w-5 h-5 text-gray-500" />
                                Payment
                            </h3>
                            <dl className="space-y-4 text-sm">
                                <div>
                                    <dt className="text-gray-500">Method</dt>
                                    <dd className="font-medium text-gray-900">{order.paymentMethod || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Status</dt>
                                    <dd>
                                        <span className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full ${getPaymentBadge(order.paymentStatus)}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Paid</dt>
                                    <dd className="font-semibold text-emerald-600">{formatCurrency(order.paidAmount)}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Remaining</dt>
                                    <dd className="font-semibold text-red-600">
                                        {order.remainingAmount > 0 ? formatCurrency(order.remainingAmount) : '$0.00'}
                                    </dd>
                                </div>
                                {order.paymentPercentage !== undefined && (
                                    <div>
                                        <dt className="text-gray-500 mb-2">Progress</dt>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-emerald-600 h-2 rounded-full transition-all"
                                                style={{ width: `${order.paymentPercentage}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">{order.paymentPercentage}% paid</p>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Meta */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                                <Icon icon="mdi:information-outline" className="w-5 h-5 text-gray-500" />
                                Order Info
                            </h3>
                            <dl className="space-y-4 text-sm">
                                <div>
                                    <dt className="text-gray-500">Source</dt>
                                    <dd className="text-gray-900">{order.source || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Age</dt>
                                    <dd className="text-gray-900">{order.orderAge} day(s)</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Last Updated</dt>
                                    <dd className="text-gray-900">{formatDate(order.updatedAt)}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PartOrderDetailPage;