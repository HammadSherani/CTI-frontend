"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "@/config/axiosInstance";
import { Icon } from "@iconify/react";
import moment from "moment";

const TYPE_CONFIG = {
  credit:  { label: "Credit",  bg: "bg-emerald-100", text: "text-emerald-700", icon: "mdi:arrow-down-circle-outline" },
  debit:   { label: "Debit",   bg: "bg-red-100",     text: "text-red-700",     icon: "mdi:arrow-up-circle-outline" },
  hold:    { label: "Hold",    bg: "bg-amber-100",   text: "text-amber-700",   icon: "mdi:lock-outline" },
  release: { label: "Release", bg: "bg-blue-100",    text: "text-blue-700",    icon: "mdi:lock-open-outline" },
};

function StatCard({ label, value, icon, iconBg, iconColor, accent }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Icon icon={icon} className={`text-8xl ${iconColor}`} />
      </div>
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shadow-inner`}>
          <Icon icon={icon} className={`text-2xl ${iconColor}`} />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-extrabold mt-0.5 ${accent || "text-gray-900"}`}>
            Rs. {(value || 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminWalletPage() {
  const { token } = useSelector((s) => s.auth);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWallet = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/admin/e-commerce/wallet", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setWallet(data.data);
      else toast.warn("Failed to load wallet data");
    } catch {
      toast.error("Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Icon icon="svg-spinners:180-ring-with-bg" className="text-5xl text-primary-600" />
      </div>
    );
  }

  const history = wallet?.paymentHistory || [];

  return (
    <div className="min-h-screen bg-[#F8FAFB] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin Wallet</h1>
          <p className="text-gray-400 text-sm mt-0.5">Platform earnings overview and payment history</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-3 gap-5 mb-8">
          <StatCard
            label="Available Balance"
            value={wallet?.balance}
            icon="solar:wallet-money-bold"
            iconBg="bg-primary-100"
            iconColor="text-primary-600"
          />
          <StatCard
            label="Total Held"
            value={wallet?.totalHeld}
            icon="mdi:lock-clock"
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            accent="text-amber-700"
          />
          <StatCard
            label="Total Earnings"
            value={wallet?.totalEarnings}
            icon="solar:chart-2-bold"
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            accent="text-emerald-700"
          />
          {/* <StatCard
            label="Platform Fees Collected"
            value={wallet?.totalPlatformFees}
            icon="mdi:percent-circle-outline"
            iconBg="bg-indigo-100"
            iconColor="text-indigo-600"
            accent="text-indigo-700"
          /> */}
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Icon icon="mdi:history" className="w-5 h-5 text-gray-400" />
            <h2 className="font-bold text-gray-900">Payment History</h2>
            <span className="ml-auto text-xs text-gray-400">{history.length} entries</span>
          </div>

          {history.length === 0 ? (
            <div className="py-16 text-center">
              <Icon icon="mdi:history" className="w-12 h-12 mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500 font-semibold">No payment history yet</p>
              <p className="text-gray-400 text-sm mt-1">Transactions will appear here once orders are processed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase">Date</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase">Description</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase">Type</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...history].reverse().map((entry, idx) => {
                    const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.credit;
                    const isPositive = entry.type === "credit" || entry.type === "release";
                    return (
                      <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                          {entry.date
                            ? moment(entry.date).format("DD MMM YYYY, hh:mm A")
                            : "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-700 max-w-[260px]">
                          <p className="line-clamp-2 text-xs">{entry.description || "—"}</p>
                          {entry.paymentId && (
                            <p className="text-[10px] font-mono text-gray-400 mt-0.5">{entry.paymentId}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                            <Icon icon={cfg.icon} className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${isPositive ? "text-emerald-700" : "text-red-600"}`}>
                            {isPositive ? "+" : "-"}Rs. {(entry.amount || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                            entry.status === "success"
                              ? "bg-emerald-50 text-emerald-600"
                              : entry.status === "cancelled"
                              ? "bg-red-50 text-red-600"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {entry.status || "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
