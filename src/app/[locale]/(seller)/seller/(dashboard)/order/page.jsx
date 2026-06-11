'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import moment from 'moment';
import { useSelector } from 'react-redux';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector(state => state.auth);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('/seller/orders', {
        headers: { Authorization: `Bearer ${token}` }
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

  const updateItemStatus = async (orderId, productId, newStatus) => {
    try {
      const res = await axiosInstance.put('/seller/orders/status', {
        orderId,
        productId,
        itemStatus: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        toast.success('Status updated successfully');
        fetchOrders();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
      <Icon icon="mdi:loading" className="animate-spin text-3xl text-primary-500" />
    </div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Order Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and track your customer orders.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="solar:box-minimalistic-bold-duotone" className="text-4xl text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-500">You haven't received any orders yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Order Details</th>
                  <th className="px-6 py-4">Customer Info</th>
                  <th className="px-6 py-4">Items (Your Products)</th>
                  <th className="px-6 py-4 text-right">Total Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/30 transition-colors">
                    
                    {/* Order Details */}
                    <td className="px-6 py-5 align-top">
                      <div className="font-bold text-gray-900">{order.orderNumber || order._id.slice(-6).toUpperCase()}</div>
                      <div className="text-xs text-gray-500 mt-1">{moment(order.createdAt).format('DD MMM YYYY, hh:mm A')}</div>
                      <div className="mt-2 inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
                        Payment: {order.paymentMethod} ({order.paymentStatus})
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="px-6 py-5 align-top">
                      <div className="font-semibold text-gray-900">{order.shippingAddress?.fullName}</div>
                      <div className="text-xs text-gray-500 mt-1">{order.userId?.email || 'Guest'}</div>
                      <div className="text-xs text-gray-500">{order.shippingAddress?.phone}</div>
                      <div className="text-xs text-gray-400 mt-2 line-clamp-2 max-w-[200px]" title={order.shippingAddress?.addressLine}>
                        {order.shippingAddress?.addressLine}, {order.shippingAddress?.city}
                      </div>
                    </td>

                    {/* Items */}
                    <td className="px-6 py-5 align-top min-w-[300px]">
                      <div className="space-y-4">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                            <img 
                              src={item.productId?.images?.[0] || 'https://via.placeholder.com/40'} 
                              alt="" 
                              className="w-10 h-10 rounded border border-gray-200 object-cover bg-white"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate text-sm">{item.productId?.title || 'Unknown Product'}</p>
                              <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                              <p className="text-[11px] text-gray-400">Variant: {item.variant?.name} {item.variant?.value}</p>
                            </div>
                            <div className="w-32 flex-shrink-0 flex flex-col items-end gap-2">
                              {/* Status Dropdown */}
                              <select 
                                value={item.itemStatus || 'PLACED'} 
                                onChange={(e) => updateItemStatus(order._id, item.productId?._id, e.target.value)}
                                className={`text-xs font-semibold rounded-lg px-2 py-1.5 border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors w-full ${
                                  item.itemStatus === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                                  item.itemStatus === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                                  'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                <option value="PLACED">Placed</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Total Earnings */}
                    <td className="px-6 py-5 align-top text-right">
                      <div className="text-lg font-extrabold text-green-600">
                        ${order.sellerTotal?.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Excluding platform fees</div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
