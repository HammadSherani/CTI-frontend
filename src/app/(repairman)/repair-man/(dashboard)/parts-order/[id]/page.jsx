"use client";
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import Image from 'next/image';
function PartOrderDetailPage() {
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const { token } = useSelector((state) => state.auth);
    const { id } = useParams();

    useEffect(() => {
        fetchOrderById();
    }, []);

    const fetchOrderById = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/repairman/parts/orders/${id}`, {
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

    const formatCurrency = (amount, currency = 'TRY') => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: 'bg-amber-50 text-amber-700 border border-amber-200',
            confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
            processing: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
            shipped: 'bg-purple-50 text-purple-700 border border-purple-200',
            delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            cancelled: 'bg-red-50 text-red-700 border border-red-200',
            booked: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
        };
        return map[status?.toLowerCase()] || 'bg-gray-50 text-gray-700 border border-gray-200';
    };

    const getPaymentBadge = (status) => {
        const map = {
            pending: 'bg-amber-50 text-amber-700 border border-amber-200',
            paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            failed: 'bg-red-50 text-red-700 border border-red-200',
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
                    <Link href="/admin/parts/parts-orders" className="text-primary-600 hover:underline">
                        ← Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const repairman = order.repairmanId?.repairmanProfile;
    const job = order.job_id;
    const device = job?.deviceInfo;
    const selectedOffer = job?.offers?.find(o => o._id === job.selectedOffer) || job?.offers?.[0];

    console.log("Order Details:", order);
    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/parts/parts-orders" className="text-gray-500 hover:text-gray-700">
                                <Icon icon="mdi:arrow-left" className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Order #{order.orderNumber}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Created {formatDate(order.createdAt)} • Job #{job?._id?.slice(-6)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${getStatusBadge(order.orderStatus)}`}>
                                {order.orderStatus.toUpperCase()}
                            </span>
                            <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${getPaymentBadge(order.paymentStatus)}`}>
                                PAYMENT {order.paymentStatus.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
                    <div className="lg:col-span-2 space-y-6">

                        {/* Job / Repair Information */}
                        {job && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Icon icon="mdi:tools" className="w-6 h-6 text-indigo-600" />
                                    Repair Job Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    <div>
                                        <p className="text-gray-500">Device</p>
                                        <p className="font-medium">{device?.brand} {device?.model} • {device?.color}</p>
                                        <p className="text-gray-500 mt-3">Warranty Status</p>
                                        <p className="font-medium">{device?.warrantyStatus}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Services Requested</p>
                                        <p className="font-medium">
                                            {job.services?.map(s => s.name).join(" + ") || "—"}
                                        </p>
                                        <p className="text-gray-500 mt-3">Urgency & Preference</p>
                                        <p className="font-medium capitalize">
                                            {job.urgency} • {job.servicePreference}
                                        </p>
                                    </div>
                                </div>

                                {job.description && (
                                    <div className="mt-5 pt-5 border-t">
                                        <p className="text-gray-500">Customer Description</p>
                                        <p className="mt-1 text-gray-800">{job.description}</p>
                                    </div>
                                )}

                                {selectedOffer?.description && (
                                    <div className="mt-5 pt-5 border-t">
                                        <p className="text-gray-500">Repairman Proposal</p>
                                        <p className="mt-1 text-gray-800">{selectedOffer.description}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Order Items (Parts) */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Parts Ordered</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px]">
                                    <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Part </th>
                                            <th className="px-6 py-3 text-left">Part Name</th>
                                            <th className="px-6 py-3 text-left">Price</th>
                                            <th className="px-6 py-3 text-center">Qty</th>
                                            <th className="px-6 py-3 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 text-sm">
                                        {order.items?.map((item) => (
                                            <tr key={item._id}>
                                                {console.log(" Item:", item.part)}
                                                <td className="px-6 py-4">
                                                    <Image src={item.part.images[0] || '/placeholder-part.png'} alt={item.partName} width={40} height={40} className="w-10 h-10 object-cover rounded" />
                                                </td>
                                                <td className="px-6 py-4 font-medium">{item.partName}</td>
                                                <td className="px-6 py-4">{formatCurrency(item.price)}</td>
                                                <td className="px-6 py-4 text-center">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right font-medium">
                                                    {formatCurrency(item.subtotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="bg-white px-6 py-5 border-t">
                                <div className="max-w-xs ml-auto space-y-2.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span>{formatCurrency(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax</span>
                                        <span>{formatCurrency(order.tax)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span>{order.shippingCharges ? formatCurrency(order.shippingCharges) : 'Free'}</span>
                                    </div>
                                    <div className="pt-3 border-t text-base font-bold flex justify-between">
                                        <span>Total</span>
                                        <span className="text-lg">{formatCurrency(order.totalAmount, 'TRY')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Warranty & Other */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4">Warranty & Notes</h3>
                            <p><strong>Warranty:</strong> {order.warranty} days</p>
                            {order.orderNotes && <p className="mt-3"><strong>Notes:</strong> {order.orderNotes}</p>}
                        </div>
                    </div>

                    <div className="space-y-6">

                        {/* Customer */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Icon icon="mdi:account" className="w-5 h-5 text-gray-500" />
                                Customer
                            </h3>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-gray-500">Name</dt>
                                    <dd className="font-medium">{order.job_id?.customerId?.name || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Email</dt>
                                    <dd>{order.job_id?.customerId?.email || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Phone</dt>
                                    <dd>{order.job_id?.customerId?.phone || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Country</dt>
                                    <dd>{order.job_id?.customerId?.address?.country || order.job_id?.customerId?.shippingAddress?.country || 'Turkey'}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Repairman */}
                        {repairman && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Icon icon="mdi:account-wrench" className="w-5 h-5 text-gray-500" />
                                    Repairman
                                </h3>
                                <dl className="space-y-3 text-sm">
                                    <div>
                                        <dt className="text-gray-500">Name</dt>
                                        <dd className="font-medium">{repairman.fullName || repairman.name || '—'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">Shop</dt>
                                        <dd>{repairman.shopName || '—'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">City</dt>
                                        <dd>{repairman.city} • {order.repairmanId?.country?.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">Specialization</dt>
                                        <dd>{repairman.specializations?.join(", ") || 'Mobile Phone Repair'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">Rating</dt>
                                        <dd>{repairman.rating} ★ ({repairman.totalJobs} jobs)</dd>
                                    </div>
                                </dl>
                            </div>
                        )}

                        {/* Payment */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Icon icon="mdi:credit-card" className="w-5 h-5 text-gray-500" />
                                Payment
                            </h3>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-gray-500">Method</dt>
                                    <dd className="font-medium">{order.paymentMethod}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Status</dt>
                                    <dd>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPaymentBadge(order.paymentStatus)}`}>
                                            {order.paymentStatus.toUpperCase()}
                                        </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Paid</dt>
                                    <dd className="font-bold text-emerald-700">{formatCurrency(order.paidAmount)}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Remaining</dt>
                                    <dd className="font-bold text-amber-700">{formatCurrency(order.remainingAmount)}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Shipping & Misc */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Icon icon="mdi:truck" className="w-5 h-5 text-gray-500" />
                                Shipping & Misc
                            </h3>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-gray-500">Method</dt>
                                    <dd className="font-medium">{order.shippingMethod}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Address Country</dt>
                                    <dd>{order.customer?.shippingAddress?.country || 'Turkey'}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Order Age</dt>
                                    <dd>{order.orderAge} day(s)</dd>
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