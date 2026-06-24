'use client';

import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { CustomDropdown } from '@/components/partials/admin/ecom/Dropdown';
import SearchInput from '@/components/SearchInput';

const RETURN_STATUS_CFG = {
  requested: { label: 'Pending Review', bg: 'bg-blue-100 text-blue-700' },
  shipped:   { label: 'Shipped Back',   bg: 'bg-amber-100 text-amber-700' },
  approved:  { label: 'Approved',       bg: 'bg-emerald-100 text-emerald-700' },
  rejected:  { label: 'Rejected',       bg: 'bg-red-100 text-red-700' },
};

function ReturnRequestModal({ order, onClose, onSubmit, loading }) {
  const [reason, setReason] = useState('');
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Request Return</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <Icon icon="mdi:close" className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
            <p className="font-semibold">{order.orderId}</p>
            <p className="text-gray-500 mt-0.5">{order.items?.length || 0} item(s) · Rs. {(order.totalAmount || 0).toLocaleString()}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
              Reason for Return <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe why you want to return this order (e.g. damaged item, wrong size, not as described)..."
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm">
              Cancel
            </button>
            <button
              onClick={() => onSubmit(order._id, reason)}
              disabled={loading || !reason.trim()}
              className="flex-1 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-sm disabled:opacity-50"
            >
              {loading ? <Icon icon="mdi:loading" className="animate-spin w-4 h-4 mx-auto" /> : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const { token } = useSelector((s) => s.auth);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [returnModal, setReturnModal]       = useState(null);
  const [returnLoading, setReturnLoading]   = useState(false);
  const [existingReturns, setExistingReturns] = useState({});

  const fetchExistingReturns = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axiosInstance.get('/e-commerce/orders/my-returns', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const map = {};
        (res.data.data || []).forEach((r) => {
          if (r.orderId) map[r.orderId.toString()] = r;
        });
        setExistingReturns(map);
      }
    } catch {}
  }, [token]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/e-commerce/orders', {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          status,
          paymentStatus,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setOrders(res.data.data || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, paymentStatus, token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchExistingReturns();
  }, [fetchExistingReturns]);

  const handleRequestReturn = async (orderId, reason) => {
    setReturnLoading(true);
    try {
      const res = await axiosInstance.post(`/e-commerce/orders/${orderId}/return`, { reason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        toast.success('Return request submitted successfully');
        setReturnModal(null);
        fetchExistingReturns();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit return request');
    } finally {
      setReturnLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const statusMap = {
      pending: { color: 'bg-blue-100 text-blue-700', icon: 'mdi:clock-outline' },
      processing: { color: 'bg-indigo-100 text-indigo-700', icon: 'mdi:check-circle-outline' },
      shipping: { color: 'bg-amber-100 text-amber-700', icon: 'mdi:truck-delivery-outline' },
      delivered: { color: 'bg-emerald-100 text-emerald-700', icon: 'mdi:package-check' },
      cancelled: { color: 'bg-red-100 text-red-700', icon: 'mdi:cancel' },
      on_hold: { color: 'bg-orange-100 text-orange-700', icon: 'mdi:pause-circle' },
    };
    return (
      statusMap[status?.toLowerCase()] || {
        color: 'bg-gray-100 text-gray-600',
        icon: 'mdi:help-circle',
      }
    );
  };

  const getPaymentConfig = (status) => {
    const map = {
      PAID: 'bg-emerald-100 text-emerald-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      FAILED: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  const formatVariant = (variant) => {
    if (!variant) return 'Default Variant';
    if (typeof variant === 'string') return variant;
    return Object.entries(variant)
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
      .join(' • ');
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await axiosInstance.put(`/e-commerce/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchOrders();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Icon icon="mdi:loading" className="animate-spin text-5xl text-primary-500" />
          <p className="text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1">Track and manage all your purchases</p>
        </div>
        <Link
          href="/product"
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          <Icon icon="mdi:shopping" />
          Continue Shopping
        </Link>
      </div>
         {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 p-6 border-b border-gray-100">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search Order ID..."
              />
            </div>

            <div className="w-full lg:w-56">
              <CustomDropdown
                icon="mdi:package"
                placeholder="Order Status"
                value={status}
                onChange={setStatus}
                options={[
                  { label: 'All', value: '' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Processing', value: 'processing' },
                  { label: 'Shipping', value: 'shipping' },
                  { label: 'Delivered', value: 'delivered' },
                  { label: 'On Hold', value: 'on_hold' },
                ]}
              />
            </div>

            <div className="w-full lg:w-56">
              <CustomDropdown
                icon="mdi:credit-card"
                placeholder="Payment"
                value={paymentStatus}
                onChange={setPaymentStatus}
                options={[
                  { label: 'All', value: '' },
                  { label: 'Paid', value: 'PAID' },
                  { label: 'Pending', value: 'PENDING' },
                  { label: 'Failed', value: 'FAILED' },
                ]}
              />
            </div>
          </div>

      {/* Empty State */}
      {orders.length === 0 && !loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 py-20 text-center">
          <Icon
            icon="mdi:package-variant-closed"
            className="mx-auto text-7xl text-gray-200 mb-6"
          />
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Orders Yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
            You haven&apos;t made any purchases yet. Start exploring our products!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3.5 rounded-2xl transition-all active:scale-95"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
       
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-6 py-4 w-12" />
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const statusConfig = getStatusConfig(order.orderStatus);
                  const displayOrderNumber =
                    order.orderId || order.orderNo || order.orderNumber || 'N/A';
                  const isExpanded = expandedOrderId === order._id;

                  return (
                    <>
                      {/* Main Row */}
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                        onClick={() => toggleExpand(order._id)}
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(order._id);
                            }}
                            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label={isExpanded ? 'Collapse order' : 'Expand order'}
                          >
                            <Icon
                              icon={isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                              className="w-5 h-5 text-gray-600"
                            />
                          </button>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-mono text-sm font-semibold text-gray-900">
                            {displayOrderNumber}
                          </p>
                          {order.orderNo && order.orderId !== order.orderNo && (
                            <p className="text-xs text-gray-400 mt-0.5">{order.orderNo}</p>
                          )}
                          <Link
                            href={`/orders/${order._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] text-primary-600 hover:text-primary-700 font-semibold mt-0.5 inline-flex items-center gap-0.5 transition-colors"
                          >
                            View Details
                            <Icon icon="mdi:arrow-right" className="w-3 h-3" />
                          </Link>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900">
                            {moment(order.createdAt).format('DD MMM YY')}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {moment(order.createdAt).format('hh:mm A')}
                          </p>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {order.items?.length || 0} item
                            {order.items?.length !== 1 ? 's' : ''}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.color}`}
                          >
                            <Icon icon={statusConfig.icon} className="w-3.5 h-3.5" />
                            <span className="capitalize">{order.orderStatus}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-semibold text-gray-900">
                            ${(order.totalAmount || 0).toFixed(2)}
                          </p>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentConfig(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentStatus || 'PENDING'}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr key={`${order._id}-expanded`} className="bg-gray-50/50">
                          <td colSpan={7} className="px-6 py-6">
                            <div className="space-y-6">
                              {/* Order Items */}
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-4">
                                  Order Items
                                </h4>
                                <div className="space-y-3">
                                  {order.items?.map((item, idx) => {
                                    const product = item.productId;
                                    const imageUrl =
                                      product?.images?.[0]?.url ||
                                      'https://via.placeholder.com/80';

                                    return (
                                      <div
                                        key={idx}
                                        className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100"
                                      >
                                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                          <img
                                            src={imageUrl}
                                            alt={product?.title || 'Product'}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                          <Link
                                            href={`/product/${product?.slug || product?._id}`}
                                            className="font-medium text-gray-900 hover:text-primary-600 line-clamp-1 transition-colors text-sm"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            {product?.title || 'Unknown Product'}
                                          </Link>

                                          <p className="text-xs text-gray-500 mt-1">
                                            {formatVariant(item.variant)}
                                          </p>

                                          <div className="flex items-center gap-3 mt-2 text-xs">
                                            <span className="font-medium text-gray-700">
                                              Qty: {item.quantity}
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span className="font-semibold text-gray-900">
                                              ${(item.price || 0).toFixed(2)} each
                                            </span>
                                          </div>
                                        </div>

                                        <div className="text-right self-center flex-shrink-0">
                                          <p className="text-sm font-semibold text-gray-900">
                                            $
                                            {(
                                              (item.price || 0) * (item.quantity || 0)
                                            ).toFixed(2)}
                                          </p>
                                          <p className="text-xs text-gray-400 mt-0.5">subtotal</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Order Summary */}
                              <div className="flex flex-col sm:flex-row gap-4">
                                {/* Shipping Address */}
                                {order.shippingAddress && (
                                  <div className="flex-1 p-4 bg-white rounded-2xl border border-gray-100">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                      <Icon icon="mdi:map-marker-outline" className="w-4 h-4" />
                                      Shipping Address
                                    </h4>
                                    <div className="text-sm text-gray-700 space-y-0.5">
                                      {order.shippingAddress.name && (
                                        <p className="font-medium">
                                          {order.shippingAddress.name}
                                        </p>
                                      )}
                                      {order.shippingAddress.street && (
                                        <p>{order.shippingAddress.street}</p>
                                      )}
                                      {(order.shippingAddress.city ||
                                        order.shippingAddress.state) && (
                                        <p>
                                          {[
                                            order.shippingAddress.city,
                                            order.shippingAddress.state,
                                          ]
                                            .filter(Boolean)
                                            .join(', ')}
                                        </p>
                                      )}
                                      {order.shippingAddress.country && (
                                        <p>{order.shippingAddress.country}</p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Price Breakdown */}
                                <div className="flex-1 p-4 bg-white rounded-2xl border border-gray-100">
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Icon icon="mdi:receipt-text-outline" className="w-4 h-4" />
                                    Price Summary
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                      <span>Subtotal</span>
                                      <span>
                                        $
                                        {(
                                          order.items?.reduce(
                                            (sum, i) => sum + (i.price || 0) * (i.quantity || 0),
                                            0
                                          ) || 0
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                    {order.shippingCost !== undefined && (
                                      <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span>
                                          {order.shippingCost === 0
                                            ? 'Free'
                                            : `$${order.shippingCost.toFixed(2)}`}
                                        </span>
                                      </div>
                                    )}
                                    {order.discount !== undefined && order.discount > 0 && (
                                      <div className="flex justify-between text-emerald-600">
                                        <span>Discount</span>
                                        <span>-${order.discount.toFixed(2)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
                                      <span>Total</span>
                                      <span>${(order.totalAmount || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 mt-4 flex flex-col gap-2">
                                      {order.orderStatus === 'pending' && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleCancelOrder(order._id); }}
                                          className="w-full bg-red-50 text-red-600 hover:bg-red-100 font-medium py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                                        >
                                          <Icon icon="mdi:cancel" className="w-4 h-4" />
                                          Cancel Order
                                        </button>
                                      )}
                                      {order.orderStatus === 'delivered' && (() => {
                                        const existingReturn = existingReturns[order._id?.toString()];
                                        if (existingReturn) {
                                          const cfg = RETURN_STATUS_CFG[existingReturn.returnStatus] || { label: existingReturn.returnStatus, bg: 'bg-gray-100 text-gray-600' };
                                          return (
                                            <div className={`w-full py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 ${cfg.bg}`}>
                                              <Icon icon="mdi:package-variant-closed-remove" className="w-4 h-4" />
                                              Return: {cfg.label}
                                            </div>
                                          );
                                        }
                                        return (
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setReturnModal(order); }}
                                            className="w-full bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                                          >
                                            <Icon icon="mdi:package-variant-closed-remove" className="w-4 h-4" />
                                            Request Return
                                          </button>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-6 border-t border-gray-100">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Icon icon="mdi:chevron-left" className="w-4 h-4" />
                Previous
              </button>

              <span className="px-4 py-2 text-sm text-gray-600">
                Page{' '}
                <span className="font-semibold text-gray-900">{pagination.currentPage}</span> of{' '}
                <span className="font-semibold text-gray-900">{pagination.totalPages}</span>
              </span>

              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <Icon icon="mdi:chevron-right" className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Footer Summary */}
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-semibold text-gray-900">{orders.length}</span> order
              {orders.length !== 1 ? 's' : ''} &nbsp;·&nbsp; Total spent:{' '}
              <span className="font-semibold text-gray-900">
                ${orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      )}

      <ReturnRequestModal
        order={returnModal}
        onClose={() => setReturnModal(null)}
        onSubmit={handleRequestReturn}
        loading={returnLoading}
      />
    </div>
  );
}