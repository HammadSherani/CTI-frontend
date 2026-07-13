"use client";
import React from 'react';

const Badge = ({ children, variant }) => {
  const variants = {
    pending: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-teal-100 text-teal-800",
    cancelled: "bg-red-100 text-red-800",
    default: "bg-gray-100 text-gray-800"
  };

  const selectedVariant = variants[variant?.toLowerCase()] || variants.default;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${selectedVariant}`}>
      {children}
    </span>
  );
};

export default function EcomTables({ data }) {
  if (!data) return null;

  const recentOrders = data.recentOrders || [];
  const newProducts = data.newProducts || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length > 0 ? (
                recentOrders.map((order, idx) => (
                  <tr key={order._id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">
                      #{order.orderId || order._id?.toString().slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {order.customerId?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={order.orderStatus}>{order.orderStatus}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                      ${order.totalAmount || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Recently Added Products</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Product Name</th>
                <th className="px-6 py-3 font-medium">Seller</th>
                <th className="px-6 py-3 font-medium">Stock</th>
                <th className="px-6 py-3 font-medium">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {newProducts.length > 0 ? (
                newProducts.map((product, idx) => (
                  <tr key={product._id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium truncate max-w-[150px]" title={product.name}>
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {product.sellerId?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                      ${product.price || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No recent products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
