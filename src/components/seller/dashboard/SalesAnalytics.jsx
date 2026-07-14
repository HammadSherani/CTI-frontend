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
import { salesTrendData, salesSummary } from "./mockData";

const filterOptions = [
  { label: "7 Days", value: 7 },
  { label: "14 Days", value: 14 },
  { label: "30 Days", value: 30 },
];

const SalesTooltip = ({ active, payload, label }) => {
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

export default function SalesAnalytics() {
  const [filter, setFilter] = useState(30);
  const [chartType, setChartType] = useState("sales"); // "sales" | "revenue"

  const filteredData = salesTrendData.slice(-filter);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-xl">
              <Icon icon="solar:chart-2-bold-duotone" className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sales Analytics</h3>
              <p className="text-xs text-gray-500">Track your sales & revenue trends</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Chart Type Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setChartType("sales")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  chartType === "sales"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Sales
              </button>
              <button
                onClick={() => setChartType("revenue")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  chartType === "revenue"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Revenue
              </button>
            </div>

            {/* Date Filter */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    filter === opt.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Today", value: salesSummary.today, icon: "solar:calendar-bold-duotone", color: "text-blue-600" },
            { label: "Last 7 Days", value: salesSummary.last7Days, icon: "solar:calendar-date-bold-duotone", color: "text-violet-600" },
            { label: "Last 30 Days", value: salesSummary.last30Days, icon: "solar:calendar-minimalistic-bold-duotone", color: "text-emerald-600" },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
              <Icon icon={stat.icon} className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-base font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%" className="focus:outline-none" style={{ outline: 'none' }}>
          <AreaChart data={filteredData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} className="focus:outline-none" style={{ outline: 'none' }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              interval={filter > 14 ? 4 : 0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickFormatter={(v) => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`}
            />
            <Tooltip content={<SalesTooltip />} />

            {chartType === "sales" && (
              <Area
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#salesGradient)"
                dot={false}
                activeDot={{ r: 5, stroke: "#3b82f6", strokeWidth: 2, fill: "#fff" }}
              />
            )}
            {chartType === "revenue" && (
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 5, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
