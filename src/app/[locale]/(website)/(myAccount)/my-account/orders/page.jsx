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

  console.log(token)
  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('/seller/orders', {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLACED': return 'bg-blue-100 text-blue-600';
      case 'CONFIRMED': return 'bg-indigo-100 text-indigo-600';
      case 'SHIPPED': return 'bg-orange-100 text-orange-600';
      case 'DELIVERED': return 'bg-green-100 text-green-600';
      case 'CANCELLED': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
      <Icon icon="mdi:loading" className="animate-spin text-3xl text-primary-500" />
    </div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-extrabold text-gray-900 mb-6">My Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Icon icon="mdi:package-variant" className="text-6xl text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No Orders Yet</h3>
          <p className="text-sm text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <Link href="/" className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-xl transition-all">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 transition-all hover:shadow-md">

              <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-gray-100 pb-5">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-900">{order.orderNumber || order._id.slice(-6).toUpperCase()}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Placed on {moment(order.createdAt).format('DD MMM YYYY, hh:mm A')}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-gray-900">${order.totalAmount?.toFixed(2)}</p>
                  <p className="text-xs font-semibold text-gray-500">{order.items?.length || 0} Items • {order.paymentMethod}</p>
                </div>
              </div>

              <div className="space-y-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <img
                      src={item.productId?.images?.[0] || 'https://via.placeholder.com/60'}
                      alt="Product"
                      className="w-16 h-16 rounded-lg object-cover border border-gray-100 bg-gray-50"
                    />
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.productId?.slug || item.productId?._id}`} className="text-sm font-bold text-gray-800 hover:text-primary-500 line-clamp-1 transition-colors">
                        {item.productId?.title || 'Unknown Product'}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        Variant: {item.variant?.name} {item.variant?.value}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">${item.price?.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-gray-100 flex justify-end">
                {/* 
                  // TODO: Add Order Details Link
                  <Link href={`/my-account/orders/${order._id}`} className="text-sm font-bold text-primary-500 hover:text-primary-600 transition-colors">
                    View Details & Track Order →
                  </Link> 
                */}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
