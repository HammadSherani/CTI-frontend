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
import {
  topSellingProducts,
  productPerformanceData,
  lowStockProducts,
  outOfStockProducts,
} from "./mockData";

const ITEMS_PER_PAGE = 5;

const PerfTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 px-4 py-3 rounded-xl shadow-lg">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {p.name === "revenue" ? `$${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProductAnalytics() {
  const [topPage, setTopPage] = useState(1);
  const [activeTab, setActiveTab] = useState("low"); // "low" | "out"

  const topPages = Math.ceil(topSellingProducts.length / ITEMS_PER_PAGE);
  const paginatedTop = topSellingProducts.slice(
    (topPage - 1) * ITEMS_PER_PAGE,
    topPage * ITEMS_PER_PAGE
  );

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Icon
            key={i}
            icon={
              i < full
                ? "solar:star-bold"
                : i === full && hasHalf
                ? "solar:star-bold"
                : "solar:star-line-duotone"
            }
            className={`w-3.5 h-3.5 ${i < full || (i === full && hasHalf) ? "text-amber-400" : "text-gray-300"}`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">{rating}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="bg-amber-50 p-2.5 rounded-xl">
          <Icon icon="solar:clipboard-list-bold-duotone" className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Product Analytics</h3>
          <p className="text-xs text-gray-500">Performance & inventory insights</p>
        </div>
      </div>

      <div className="grid grid-cols-2  gap-4">
        {/* Top Selling Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 pb-3 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700">Top Selling Products</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Sold</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedTop.map((product, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        product.rank <= 3
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {product.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 truncate max-w-[180px]">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.category}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium hidden sm:table-cell">{product.sold}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{product.revenue}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{renderStars(product.rating)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {(topPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(topPage * ITEMS_PER_PAGE, topSellingProducts.length)} of {topSellingProducts.length}
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setTopPage(p => Math.max(1, p - 1))}
                disabled={topPage === 1}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => setTopPage(p => Math.min(topPages, p + 1))}
                disabled={topPage === topPages}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>

     {/* Low Stock & Out of Stock */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 pb-0 border-b border-gray-100">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("low")}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "low"
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon icon="solar:danger-triangle-bold-duotone" className="w-4 h-4" />
                Low Stock ({lowStockProducts.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("out")}
              className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "out"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon icon="solar:close-circle-bold-duotone" className="w-4 h-4" />
                Out of Stock ({outOfStockProducts.length})
              </div>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === "low" ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">SKU</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Threshold</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lowStockProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800 truncate max-w-[200px]">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.category}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs hidden sm:table-cell">{p.sku}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-amber-600">{p.stock}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">{p.threshold}</td>
                    <td className="px-5 py-3.5">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[80px]">
                        <div
                          className="bg-amber-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min((p.stock / p.threshold) * 100, 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">SKU</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last In Stock</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Demand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {outOfStockProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800 truncate max-w-[200px]">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.category}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs hidden sm:table-cell">{p.sku}</td>
                    <td className="px-5 py-3.5 text-gray-600">{p.lastInStock}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                        p.demandLevel === "High"
                          ? "bg-red-100 text-red-700"
                          : p.demandLevel === "Medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {p.demandLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </div>

   
    </div>
  );
}
