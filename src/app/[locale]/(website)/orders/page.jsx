'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import moment from 'moment';
import { useSelector } from 'react-redux';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector(s => s.auth);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('/e-commerce/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error('Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'PLACED': return { color: 'bg-blue-100 text-blue-700', icon: 'mdi:clock-outline' };
      case 'CONFIRMED': return { color: 'bg-indigo-100 text-indigo-700', icon: 'mdi:check-circle-outline' };
      case 'SHIPPED': return { color: 'bg-amber-100 text-amber-700', icon: 'mdi:truck-delivery-outline' };
      case 'DELIVERED': return { color: 'bg-emerald-100 text-emerald-700', icon: 'mdi:package-check' };
      case 'CANCELLED': return { color: 'bg-red-100 text-red-700', icon: 'mdi:cancel' };
      default: return { color: 'bg-gray-100 text-gray-600', icon: 'mdi:help-circle' };
    }
  };

  const formatVariant = (variant) => {
    if (!variant) return 'Default Variant';
    if (typeof variant === 'string') return variant;
    return Object.entries(variant)
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
      .join(' • ');
  };

  if (loading) {
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1">Track and manage all your purchases</p>
        </div>
        <Link 
          href="/product"
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <Icon icon="mdi:shopping" /> Continue Shopping
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 py-20 text-center">
          <Icon icon="mdi:package-variant-closed" className="mx-auto text-7xl text-gray-200 mb-6" />
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Orders Yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
            You haven't made any purchases yet. Start exploring our products!
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3.5 rounded-2xl transition-all active:scale-95"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.orderStatus);
            return (
              <div 
                key={order._id} 
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Order Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-mono text-sm font-semibold text-gray-900">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {moment(order.createdAt).format('DD MMMM YYYY • hh:mm A')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-2xl text-sm font-semibold ${statusConfig.color}`}>
                      <Icon icon={statusConfig.icon} className="w-4 h-4" />
                      {order.orderStatus}
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${order.totalAmount?.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.items?.length} item{order.items?.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100">
                  {order.items?.map((item, idx) => {
                    const product = item.productId;
                    const imageUrl = product?.images?.[0]?.url || 'https://via.placeholder.com/80';

                    return (
                      <div key={idx} className="p-6 flex gap-5 hover:bg-gray-50 transition-colors">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                          <img 
                            src={imageUrl} 
                            alt={product?.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link 
                            href={`/product/${product?.slug || product?._id}`}
                            className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-2 transition-colors"
                          >
                            {product?.title}
                          </Link>

                          <p className="text-sm text-gray-500 mt-1.5">
                            {formatVariant(item.variant)}
                          </p>

                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="font-medium text-gray-700">Qty: {item.quantity}</span>
                            <span className="text-gray-400">•</span>
                            <span className="font-semibold text-gray-900">
                              ${item.price?.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right self-center">
                          <div className="text-lg font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Paid via <span className="font-medium text-gray-700">{order.paymentMethod}</span>
                  </div>
                  
                  {/* <Link 
                    href={`/my-account/orders/${order._id}`}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm group"
                  >
                    View Order Details
                    <Icon icon="mdi:arrow-right" className="group-hover:translate-x-0.5 transition" />
                  </Link> */}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}