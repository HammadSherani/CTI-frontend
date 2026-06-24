"use client";
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Icon } from "@iconify/react";
import { customerTypeData, topCustomers } from "./mockData";

const ITEMS_PER_PAGE = 5;

const CustomerTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 px-4 py-3 rounded-xl shadow-lg">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function CustomerAnalytics() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(topCustomers.length / ITEMS_PER_PAGE);
  const paginated = topCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Generate initials for avatar
  const getInitials = (name) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  // Consistent avatar colors based on name
  const avatarColors = [
    "from-blue-500 to-blue-600",
    "from-violet-500 to-violet-600",
    "from-emerald-500 to-emerald-600",
    "from-amber-500 to-amber-600",
    "from-rose-500 to-rose-600",
    "from-cyan-500 to-cyan-600",
    "from-indigo-500 to-indigo-600",
    "from-pink-500 to-pink-600",
  ];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="bg-cyan-50 p-2.5 rounded-xl">
          <Icon icon="solar:users-group-two-rounded-bold-duotone" className="w-5 h-5 text-cyan-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Customer Analytics</h3>
          <p className="text-xs text-gray-500">Customer segmentation & insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* New vs Returning Customers Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">New vs Returning Customers</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerTypeData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <Tooltip content={<CustomerTooltip />} cursor={{ fill: "#f3f4f6", radius: 6 }} />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="new" name="New Customers" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="returning" name="Returning Customers" fill="#10b981" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <p className="text-xs text-gray-500">New Customers</p>
              </div>
              <p className="text-xl font-bold text-gray-900">964</p>
              <p className="text-xs text-emerald-600 font-medium">+18.2% vs last period</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <p className="text-xs text-gray-500">Returning</p>
              </div>
              <p className="text-xl font-bold text-gray-900">2,200</p>
              <p className="text-xs text-emerald-600 font-medium">+8.5% vs last period</p>
            </div>
          </div>
        </div>

        {/* Top Customers Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 pb-3 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700">Top Customers</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((customer, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center`}>
                          <span className="text-xs font-bold text-white">{getInitials(customer.name)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{customer.name}</p>
                          <p className="text-xs text-gray-400 truncate">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
                        <Icon icon="solar:bag-bold-duotone" className="w-3.5 h-3.5 text-gray-400" />
                        {customer.orders}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{customer.totalSpent}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{customer.lastOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, topCustomers.length)} of {topCustomers.length}
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
