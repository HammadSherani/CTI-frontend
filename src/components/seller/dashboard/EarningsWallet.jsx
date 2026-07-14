"use client";
import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Icon } from "@iconify/react";
import { earningsTrendData, walletSummary, recentTransactions } from "./mockData";

const ITEMS_PER_PAGE = 5;

const EarningsTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 px-4 py-3 rounded-xl shadow-lg">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: ${p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const txnTypeIcons = {
  "Order Payment": { icon: "solar:cart-check-bold-duotone", color: "text-emerald-600", bg: "bg-emerald-50" },
  "Withdrawal": { icon: "solar:card-send-bold-duotone", color: "text-blue-600", bg: "bg-blue-50" },
  "Refund": { icon: "solar:undo-left-bold-duotone", color: "text-red-600", bg: "bg-red-50" },
  "Commission": { icon: "solar:tag-price-bold-duotone", color: "text-amber-600", bg: "bg-amber-50" },
};

const txnStatusColors = {
  Completed: "bg-emerald-100 text-emerald-700",
  Processing: "bg-blue-100 text-blue-700",
  Pending: "bg-amber-100 text-amber-700",
};

export default function EarningsWallet() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState(30);

  const totalPages = Math.ceil(recentTransactions.length / ITEMS_PER_PAGE);
  const paginated = recentTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const filteredData = earningsTrendData.slice(-filter);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="bg-emerald-50 p-2.5 rounded-xl">
          <Icon icon="solar:wallet-money-bold-duotone" className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Earnings & Wallet</h3>
          <p className="text-xs text-gray-500">Track your earnings and wallet activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Earnings Chart — spans 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700">Earnings Trend</h4>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setFilter(d)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    filter === d
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%" className="focus:outline-none" style={{ outline: 'none' }}>
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} className="focus:outline-none" style={{ outline: 'none' }}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="commissionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  interval={filter > 14 ? 4 : 0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  tickFormatter={(v) => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`}
                />
                <Tooltip content={<EarningsTooltip />} />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  name="Earnings"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#earningsGrad)"
                  dot={false}
                  activeDot={{ r: 4, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="commission"
                  name="Commission"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#commissionGrad)"
                  dot={false}
                  activeDot={{ r: 4, stroke: "#f59e0b", strokeWidth: 2, fill: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wallet Balance Cards */}
        <div className="space-y-3">
          {[
            { label: "Available Balance", value: walletSummary.available, icon: "solar:wallet-bold-duotone", color: "from-emerald-500 to-emerald-600", textColor: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Pending Balance", value: walletSummary.pending, icon: "solar:clock-circle-bold-duotone", color: "from-amber-500 to-amber-600", textColor: "text-amber-600", bg: "bg-amber-50" },
            { label: "On Hold", value: walletSummary.hold, icon: "solar:lock-keyhole-bold-duotone", color: "from-gray-500 to-gray-600", textColor: "text-gray-600", bg: "bg-gray-100" },
            { label: "Total Withdrawn", value: walletSummary.totalWithdrawn, icon: "solar:card-transfer-bold-duotone", color: "from-blue-500 to-blue-600", textColor: "text-blue-600", bg: "bg-blue-50" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`${item.bg} p-2.5 rounded-xl`}>
                  <Icon icon={item.icon} className={`w-5 h-5 ${item.textColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-lg font-bold text-gray-900">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 pb-3 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700">Recent Transactions</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Method</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((txn, i) => {
                const typeStyle = txnTypeIcons[txn.type] || txnTypeIcons["Order Payment"];
                return (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`${typeStyle.bg} p-2 rounded-lg`}>
                          <Icon icon={typeStyle.icon} className={`w-4 h-4 ${typeStyle.color}`} />
                        </div>
                        <span className="font-medium text-gray-700">{txn.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{txn.type}</td>
                    <td className={`px-5 py-3.5 font-semibold ${
                      txn.amount.startsWith("+") ? "text-emerald-600" : "text-red-500"
                    }`}>
                      {txn.amount}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${txnStatusColors[txn.status]}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">{txn.method}</td>
                    <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">{txn.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, recentTransactions.length)} of {recentTransactions.length}
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
