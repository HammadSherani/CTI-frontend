"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "@/config/axiosInstance";
import handleError from "@/helper/handleError";
import { Icon } from "@iconify/react";
import Link from "next/link";

function AdminEarningPage() {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "all",
    withdrawalStatus: "all"
  });

  const { token } = useSelector((state) => state.auth);

  const fetchData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.withdrawalStatus !== "all") params.append("withdrawalStatus", filters.withdrawalStatus);

      const response = await axiosInstance.get(
        `/admin/earnings/overview?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.success) {
        setData(response.data.data || null);
      } else {
        toast.warn("Failed to load earnings data.");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      status: "all",
      withdrawalStatus: "all"
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Icon icon="svg-spinners:180-ring-with-bg" className="text-5xl text-primary-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">No earnings data found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Earnings Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of platform revenue and repairman earnings</p>
          </div>
          
          {/* Quick Action Links */}
          <div className="flex gap-3">
            <Link
              href="/admin/earnings/all-earning"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Icon icon="solar:document-text-bold" className="text-lg" />
              <span className="font-medium">All Earnings</span>
            </Link>
            <Link
              href="/admin/withdrawals/all-withdrawal-request"
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-sm"
            >
              <Icon icon="solar:card-transfer-bold" className="text-lg" />
              <span className="font-medium">All Withdrawals Request</span>
            </Link>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                <Icon icon="solar:dollar-minimalistic-bold" className="text-xl text-rose-600" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">Rs. {data.revenue.total.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Icon icon="solar:wallet-money-bold" className="text-xl text-amber-600" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Platform Commission</p>
            <p className="text-2xl font-bold text-gray-900">Rs. {data.revenue.platformCommission.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                <Icon icon="solar:users-group-rounded-bold" className="text-xl text-sky-600" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Repairman Share</p>
            <p className="text-2xl font-bold text-gray-900">Rs. {data.revenue.repairmanShare.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <Icon icon="solar:chart-2-bold" className="text-xl text-violet-600" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Total Earnings</p>
            <p className="text-2xl font-bold text-gray-900">{data.quickStats.totalEarnings}</p>
          </div>
        </div>

        {/* Earnings Status */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Earnings Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl p-5 shadow-sm  border-yellow-500 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Icon icon="solar:clock-circle-bold" className="text-xl text-yellow-600" />
                </div>
                <Link
                  href="/admin/earnings/all-earning"
                  className="text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Icon icon="solar:arrow-right-bold" className="text-xl" />
                </Link>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Pending Earnings</h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">Rs. {data.earnings.pending.amount.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{data.earnings.pending.count} transactions</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm  border-green-500 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon icon="solar:check-circle-bold" className="text-xl text-green-600" />
                </div>
                <Link
                  href="/admin/earnings/all-earning?status=released"
                  className="text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Icon icon="solar:arrow-right-bold" className="text-xl" />
                </Link>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Released Earnings</h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">Rs. {data.earnings.released.amount.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{data.earnings.released.count} transactions</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm  border-primary-500 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Icon icon="solar:card-transfer-bold" className="text-xl text-primary-600" />
                </div>
                <Link
                  href="/admin/earnings/all?status=withdrawn"
                  className="text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Icon icon="solar:arrow-right-bold" className="text-xl" />
                </Link>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Withdrawn Earnings</h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">Rs. {data.earnings.withdrawn.amount.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{data.earnings.withdrawn.count} transactions</p>
            </div>
          </div>
        </div>

        {/* Withdrawal Overview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Withdrawal Overview</h2>
            <Link
              href="/admin/withdrawals/all"
              className="flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium transition-colors"
            >
              View All
              <Icon icon="solar:arrow-right-bold" className="text-lg" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon icon="solar:document-add-bold" className="text-lg text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">Requested</h3>
                  <p className="text-xs text-gray-500">Total requests</p>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{data.withdrawals.requested}</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Icon icon="solar:refresh-circle-bold" className="text-lg text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">Processing</h3>
                  <p className="text-xs text-gray-500">In progress</p>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{data.withdrawals.processing}</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon icon="solar:check-circle-bold" className="text-lg text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">Completed</h3>
                  <p className="text-xs text-gray-500">Successfully done</p>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{data.withdrawals.completed}</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Icon icon="solar:close-circle-bold" className="text-lg text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">Rejected</h3>
                  <p className="text-xs text-gray-500">Declined</p>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{data.withdrawals.rejected}</p>
            </div>
          </div>

          {/* Withdrawal Amounts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Icon icon="solar:money-bag-bold" className="text-2xl text-primary-600" />
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">Rs. {data.withdrawals.totalAmount.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Icon icon="solar:wallet-money-bold" className="text-2xl text-green-600" />
                <p className="text-sm font-medium text-gray-600">Completed Amount</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">Rs. {data.withdrawals.completedAmount.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Icon icon="solar:hourglass-bold" className="text-2xl text-yellow-600" />
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">Rs. {data.withdrawals.pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminEarningPage;