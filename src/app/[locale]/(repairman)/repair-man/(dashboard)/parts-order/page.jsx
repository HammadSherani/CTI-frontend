"use client"

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link } from '@/i18n/navigation';
import SummaryCards, { SummaryCardSkeleton } from '@/components/SumamryCards';
import SearchInput from '@/components/SearchInput';
import { CustomDropdown } from '@/components/dropdown';


// ─── Table Skeleton ───────────────────────────────────────────────
function TableSkeleton() {
    return (
        <div className="divide-y divide-gray-100">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 0.07}s` }} />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 0.07 + 0.05}s` }} />
                        <div className="h-2.5 w-40 bg-gray-100 rounded animate-pulse" style={{ animationDelay: `${i * 0.07 + 0.1}s` }} />
                    </div>
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 0.07}s` }} />
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 0.07 + 0.05}s` }} />
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.07 + 0.1}s` }} />
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.07}s` }} />
                    <div className="h-3 w-14 bg-gray-100 rounded animate-pulse" style={{ animationDelay: `${i * 0.07 + 0.05}s` }} />
                    <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" style={{ animationDelay: `${i * 0.07 + 0.1}s` }} />
                    <div className="h-7 w-14 bg-gray-100 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.07}s` }} />
                </div>
            ))}
        </div>
    );
}


// ─── Status Badge ─────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        pending:          'bg-amber-50 text-amber-700',
        processing:       'bg-blue-50 text-blue-700',
        shipped:          'bg-purple-50 text-purple-700',
        delivered:        'bg-green-50 text-green-700',
        cancelled:        'bg-red-50 text-red-700',
        confirmed:        'bg-teal-50 text-teal-700',
        'ready-for-pickup': 'bg-orange-50 text-orange-700',
    };
    const cls = map[status?.toLowerCase()] || 'bg-gray-100 text-gray-600';
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </span>
    );
}

function PaymentBadge({ status }) {
    const map = {
        pending:  'bg-amber-50 text-amber-700',
        partial:  'bg-orange-50 text-orange-700',
        paid:     'bg-green-50 text-green-700',
        refunded: 'bg-red-50 text-red-700',
    };
    const cls = map[status?.toLowerCase()] || 'bg-gray-100 text-gray-600';
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
            {status}
        </span>
    );
}


// ─── Main Component ───────────────────────────────────────────────
function PartsOrder() {
    const [isLoading, setLoading] = useState(false);
    const [partsOrders, setPartsOrders] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1, totalPages: 1, totalOrders: 0, hasNext: false, hasPrev: false
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
    const [filterShippingMethod, setFilterShippingMethod] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState(null);
    const { token } = useSelector(state => state.auth);
    const [summaryData, setSummaryData] = useState(null);

    useEffect(() => { fetchPartsOrders(); }, [currentPage, searchTerm, filterStatus, filterPaymentStatus, filterShippingMethod]);

    const fetchPartsOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '5',
                ...(searchTerm && { search: searchTerm }),
                ...(filterStatus !== 'all' && { orderStatus: filterStatus }),
                ...(filterPaymentStatus !== 'all' && { paymentStatus: filterPaymentStatus }),
                ...(filterShippingMethod !== 'all' && { shippingMethod: filterShippingMethod })
            });

            const { data } = await axiosInstance.get(`/repairman/parts/orders?${params}`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (data.success) {
                setPartsOrders(data.parts || []);
                setPagination(data.pagination || {});
                setSummaryData(data.summary || null);
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

    const summaryCards = [
        { label: 'Total Orders',    value: summaryData?.totalOrders || 0,              icon: 'mdi:clipboard-text-outline' },
        { label: 'Pending Orders',  value: summaryData?.pendingOrders || 0,            icon: 'mdi:progress-clock' },
        { label: 'Delivered Orders',value: summaryData?.deliveredOrders || 0,          icon: 'mdi:truck-delivery-outline' },
        { label: 'Total Amount',    value: `$${(summaryData?.totalAmount || 0).toLocaleString()}`, icon: 'mdi:cash-multiple' },
    ];

    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const paymentStatusOptions = [
        { value: 'all', label: 'All Payments' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Partial', label: 'Partial' },
        { value: 'Paid', label: 'Paid' },
        { value: 'Refunded', label: 'Refunded' },
    ];

    const shippingOptions = [
        { value: 'all', label: 'All Methods' },
        { value: 'Pickup', label: 'Pickup' },
        { value: 'Delivery', label: 'Delivery' },
        { value: 'Courier', label: 'Courier' },
    ];

      const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterPaymentStatus('all');
    setFilterShippingMethod('all');
};
    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;

        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(pagination.totalPages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

        return (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                    Showing{' '}
                    <span className="font-medium text-gray-700">{((currentPage - 1) * 10) + 1}</span>
                    {' '}to{' '}
                    <span className="font-medium text-gray-700">{Math.min(currentPage * 10, pagination.totalOrders)}</span>
                    {' '}of{' '}
                    <span className="font-medium text-gray-700">{pagination.totalOrders}</span> results
                </p>
                <div className="flex gap-1">
                    <button
                        onClick={() => setCurrentPage(p => p - 1)}
                        disabled={!pagination.hasPrev}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(p => (
                        <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                                currentPage === p
                                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={!pagination.hasNext}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-4">

                {/* Header */}
                <div className="bg-white rounded-xl border border-gray-200 px-6 py-4">
                    <h1 className="text-2xl font-semibold text-gray-900">Parts Orders</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage and track parts orders</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        <Icon icon="mdi:alert-circle" className="w-4 h-4 text-red-500 shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Summary Cards */}
                {isLoading ? <SummaryCardSkeleton /> : <SummaryCards data={summaryCards} />}

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 px-6 py-4">
                    <div className="grid grid-cols-12  gap-3">
                        <div className="col-span-4">
                            <SearchInput
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="Search parts, customer..."
                            />
                        </div>
                        <div className="col-span-2">
                            <CustomDropdown label="Status" options={statusOptions} value={filterStatus} onChange={setFilterStatus} />
                        </div>
                            <div className="col-span-2">
                        <CustomDropdown label="All Payments" options={paymentStatusOptions} value={filterPaymentStatus} onChange={setFilterPaymentStatus} />
                        </div>
                        <div className="col-span-2">
                        <CustomDropdown label="All Methods" options={shippingOptions} value={filterShippingMethod} onChange={setFilterShippingMethod} />
                        </div>
                        <div className='col-span-2'>
                    <button
      onClick={handleClearFilters}
      className="w-full py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition text-sm shadow-sm"
      >
      Clear Filters
    </button>
        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border mb-10 border-gray-200 overflow-hidden">
                    {isLoading ? (
                        <TableSkeleton />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            {['Order #', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Shipping', 'Date', 'Actions'].map(h => (
                                                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {partsOrders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50 transition-colors">

                                                {/* Order # */}
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className="text-xs font-medium text-gray-500">{order.orderNumber}</span>
                                                </td>

                                                {/* Customer */}
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-medium text-gray-900 leading-tight">{order.customer?.name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{order.customer?.email}</p>
                                                    <p className="text-xs text-gray-400">{order.customer?.phone}</p>
                                                </td>

                                                {/* Items */}
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-medium text-gray-900">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                                                    {order.items?.slice(0, 2).map((item, idx) => (
                                                        <p key={idx} className="text-xs text-gray-500 truncate max-w-[140px]">
                                                            {item.partName} ×{item.quantity}
                                                        </p>
                                                    ))}
                                                    {order.items?.length > 2 && (
                                                        <p className="text-xs text-gray-400">+{order.items.length - 2} more</p>
                                                    )}
                                                </td>

                                                {/* Amount */}
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <p className="text-sm font-semibold text-gray-900">${order.totalAmount?.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-400">Sub: ${order.subtotal?.toLocaleString()}</p>
                                                    {order.discount > 0 && (
                                                        <p className="text-xs text-green-600">-${order.discount} off</p>
                                                    )}
                                                </td>

                                                {/* Payment */}
                                                <td className="px-5 py-4">
                                                    <PaymentBadge status={order.paymentStatus} />
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <StatusBadge status={order.orderStatus} />
                                                </td>

                                                {/* Shipping */}
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                                        <Icon
                                                            icon={order.shippingMethod === 'Pickup' ? 'mdi:store-outline' : 'mdi:truck-outline'}
                                                            className="w-4 h-4 text-gray-400 shrink-0"
                                                        />
                                                        <span className="text-xs">{order.shippingMethod}</span>
                                                    </div>
                                                </td>

                                                {/* Date */}
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(order.createdAt).toLocaleDateString('en-GB', {
                                                            day: '2-digit', month: 'short', year: 'numeric'
                                                        })}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <Link href={`/repair-man/parts-order/${order?._id}`}>
                                                        <button className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                                                            <Icon icon="mdi:eye-outline" className="w-3.5 h-3.5" />
                                                            View
                                                        </button>
                                                    </Link>
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {partsOrders.length === 0 && (
                                    <div className="text-center py-16">
                                        <Icon icon="mdi:package-variant-closed" className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-gray-600">No orders found</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {searchTerm || filterStatus !== 'all' || filterPaymentStatus !== 'all' || filterShippingMethod !== 'all'
                                                ? 'Try adjusting your filters.'
                                                : 'No orders have been placed yet.'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {renderPagination()}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}

export default PartsOrder;