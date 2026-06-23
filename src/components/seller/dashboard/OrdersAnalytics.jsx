"use client";
import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Icon } from "@iconify/react";
import { orderStatusData, ordersTrendData, recentOrders } from "./mockData";

const statusColors = {
  Delivered: "bg-emerald-100 text-emerald-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-violet-100 text-violet-700",
  Pending: "bg-amber-100 text-amber-700",
  "On Hold": "bg-gray-100 text-gray-700",
  Cancelled: "bg-red-100 text-red-700",
};

const ITEMS_PER_PAGE = 5;

const OrdersTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 px-4 py-3 rounded-xl shadow-lg">
        <p className="text-sm font-semibold text-gray-900">{payload[0].payload.date}</p>
        <p className="text-sm text-primary-600 font-medium">{payload[0].value} orders</p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-xl shadow-lg">
        <p className="text-sm font-semibold" style={{ color: payload[0].payload.color }}>
          {payload[0].name}
        </p>
        <p className="text-sm text-gray-600">{payload[0].value} orders</p>
      </div>
    );
  }
  return null;
};

export default function OrdersAnalytics() {
  const [currentPage, setCurrentPage] = useState(1);
  const [trendFilter, setTrendFilter] = useState(30);

  const totalPages = Math.ceil(recentOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = recentOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const filteredTrend = ordersTrendData.slice(-trendFilter);
  const totalOrders = orderStatusData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="bg-violet-50 p-2.5 rounded-xl">
          <Icon icon="solar:box-bold-duotone" className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Orders Analytics</h3>
          <p className="text-xs text-gray-500">Order distribution & trends</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order Status Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Order Status Distribution</h4>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {orderStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-gray-900">{totalOrders.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total</p>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1">
              {orderStatusData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 truncate">{item.name}</p>
                    <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Trend Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700">Orders Trend</h4>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setTrendFilter(d)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    trendFilter === d
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredTrend} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  interval={trendFilter > 14 ? 4 : 0}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10 }} />
                <Tooltip content={<OrdersTooltip />} cursor={{ fill: "#f3f4f6", radius: 6 }} />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={trendFilter > 14 ? 8 : 16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 pb-3 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700">Recent Orders</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Product</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedOrders.map((order, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-primary-600">{order.id}</td>
                  <td className="px-5 py-3.5 text-gray-700">{order.customer}</td>
                  <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell max-w-[200px] truncate">{order.product}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-900">{order.amount}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, recentOrders.length)} of {recentOrders.length}
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  currentPage === i + 1
                    ? "bg-primary-600 text-white"
                    : "border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
