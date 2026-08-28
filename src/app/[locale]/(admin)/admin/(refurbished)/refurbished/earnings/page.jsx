"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import moment from "moment";

const RANGE_OPTIONS = [
  { label: "This Month",   value: "month"   },
  { label: "Last 3 Months",value: "3months" },
  { label: "Last 6 Months",value: "6months" },
  { label: "All Time",     value: "all"     },
];

const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmt(n) {
  if (!n) return "₺0";
  return `₺${Number(n).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ── Summary Card ── */
function EarningCard({ icon, label, value, sub, color, loading }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-start gap-4 ${color}`}>
      <div className="w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center flex-shrink-0">
        <Icon icon={icon} className="w-5 h-5" style={{ color: 'inherit' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        {loading ? (
          <div className="h-7 w-28 bg-gray-200 animate-pulse rounded mt-1" />
        ) : (
          <p className="text-2xl font-extrabold text-gray-900 mt-0.5 truncate">{value}</p>
        )}
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Order Status Badge ── */
const STATUS_STYLES = {
  pending:    "bg-gray-100 text-gray-600",
  processing: "bg-blue-50 text-blue-600",
  shipping:   "bg-violet-50 text-violet-600",
  shipped:    "bg-amber-50 text-amber-600",
  delivered:  "bg-emerald-50 text-emerald-700",
  cancelled:  "bg-red-50 text-red-500",
};

export default function RefurbishedEarningsPage() {
  const { token } = useSelector((s) => s.auth);
  const [range, setRange]           = useState("all");
  const [overview, setOverview]     = useState(null);
  const [monthly, setMonthly]       = useState([]);
  const [orders, setOrders]         = useState([]);
  const [loadingOv, setLoadingOv]   = useState(true);
  const [loadingMo, setLoadingMo]   = useState(true);
  const [loadingOrd, setLoadingOrd] = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchOverview = useCallback(async () => {
    if (!token) return;
    setLoadingOv(true);
    try {
      const { data } = await axiosInstance.get("/admin/refurbish/earnings/overview", {
        params: { range }, headers,
      });
      if (data.success) setOverview(data.data);
    } catch { toast.error("Failed to load earnings overview"); }
    finally { setLoadingOv(false); }
  }, [token, range]);

  const fetchMonthly = useCallback(async () => {
    if (!token) return;
    setLoadingMo(true);
    try {
      const { data } = await axiosInstance.get("/admin/refurbish/earnings/monthly", {
        params: { range }, headers,
      });
      if (data.success) setMonthly(data.data || []);
    } catch { /* silent */ }
    finally { setLoadingMo(false); }
  }, [token, range]);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoadingOrd(true);
    try {
      const { data } = await axiosInstance.get("/admin/refurbish/earnings/orders", {
        params: { range, page, limit: 15 }, headers,
      });
      if (data.success) {
        setOrders(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch { /* silent */ }
    finally { setLoadingOrd(false); }
  }, [token, range, page]);

  useEffect(() => { setPage(1); }, [range]);
  useEffect(() => { fetchOverview(); fetchMonthly(); }, [fetchOverview, fetchMonthly]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Refurbished Earnings</h1>
          <p className="text-xs text-gray-400 mt-1">Revenue overview for all platform-owned refurbished device sales</p>
        </div>

        {/* Range selector */}
        <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                range === opt.value
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <EarningCard
          icon="solar:dollar-minimalistic-bold"
          label="Gross Revenue"
          value={fmt(overview?.grossRevenue)}
          sub="Delivered orders"
          color="text-emerald-600"
          loading={loadingOv}
        />
        <EarningCard
          icon="solar:delivery-bold"
          label="Shipping Costs"
          value={fmt(overview?.shippingCosts)}
          sub="Aras Cargo shipment fees"
          color="text-amber-500"
          loading={loadingOv}
        />
        <EarningCard
          icon="solar:wallet-bold"
          label="Net Earnings"
          value={fmt(overview?.netEarnings)}
          sub="Revenue minus shipping"
          color="text-primary-600"
          loading={loadingOv}
        />
        <EarningCard
          icon="solar:clock-circle-bold"
          label="On Hold"
          value={fmt(overview?.onHoldRevenue)}
          sub="Pending clearance"
          color="text-purple-500"
          loading={loadingOv}
        />
        <EarningCard
          icon="solar:box-bold"
          label="Paid Orders"
          value={loadingOv ? "—" : (overview?.totalOrders ?? 0)}
          sub="Total fulfilled orders"
          color="text-blue-600"
          loading={loadingOv}
        />
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Icon icon="solar:calendar-bold" className="w-4 h-4 text-gray-400" />
          <h2 className="font-bold text-gray-800 text-sm">Monthly Breakdown</h2>
        </div>
        {loadingMo ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : monthly.length === 0 ? (
          <div className="py-14 text-center">
            <Icon icon="solar:chart-linear" className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No data for this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Month</th>
                  <th className="px-6 py-3 text-right">Orders</th>
                  <th className="px-6 py-3 text-right">Gross Revenue</th>
                  <th className="px-6 py-3 text-right">Shipping Costs</th>
                  <th className="px-6 py-3 text-right">Net Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {monthly.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-3 font-semibold text-gray-800">
                      {MONTH_NAMES[row.month]} {row.year}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-600 font-bold">{row.orderCount}</td>
                    <td className="px-6 py-3 text-right text-gray-700 font-semibold">{fmt(row.grossRevenue)}</td>
                    <td className="px-6 py-3 text-right text-amber-600 font-semibold">−{fmt(row.shippingCosts)}</td>
                    <td className="px-6 py-3 text-right font-extrabold text-emerald-700">{fmt(row.netEarnings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Icon icon="solar:box-bold" className="w-4 h-4 text-gray-400" />
          <h2 className="font-bold text-gray-800 text-sm">Paid Orders</h2>
        </div>

        {loadingOrd ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-14 text-center">
            <Icon icon="solar:box-linear" className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No paid orders in this period</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">Order No</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Sub Total</th>
                    <th className="px-6 py-3 text-right">Shipping</th>
                    <th className="px-6 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-6 py-3 font-mono font-bold text-gray-700 text-[10px]">
                        {ord.orderNo || ord.orderId}
                      </td>
                      <td className="px-6 py-3">
                        <p className="font-semibold text-gray-800">
                          {ord.userId?.firstName} {ord.userId?.lastName}
                        </p>
                        <p className="text-[10px] text-gray-400">{ord.userId?.email}</p>
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {moment(ord.createdAt).format("DD MMM YYYY")}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${STATUS_STYLES[ord.orderStatus] || 'bg-gray-100 text-gray-500'}`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right text-gray-600">{fmt(ord.subTotal)}</td>
                      <td className="px-6 py-3 text-right text-amber-600">{fmt(ord.shippingFee)}</td>
                      <td className="px-6 py-3 text-right font-extrabold text-gray-900">{fmt(ord.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    <Icon icon="solar:arrow-left-linear" className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    <Icon icon="solar:arrow-right-linear" className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
