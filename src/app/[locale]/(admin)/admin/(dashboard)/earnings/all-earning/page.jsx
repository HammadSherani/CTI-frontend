"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "@/config/axiosInstance";
import handleError from "@/helper/handleError";
import { Icon } from "@iconify/react";
import Link from "next/link";

function AdminAllEarning() {
  const [earnings, setEarnings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    startDate: "",
    endDate: "",
    status: "",
    repairman: "",
    bookingId: "",
    minAmount: "",
    maxAmount: "",
    sort: "desc"
  });

  const { token } = useSelector((state) => state.auth);

  const fetchData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", filters.page);
      params.append("limit", filters.limit);
      params.append("sort", filters.sort);
      
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.status) params.append("status", filters.status);
      if (filters.repairman) params.append("repairman", filters.repairman);
      if (filters.bookingId) params.append("bookingId", filters.bookingId);
      if (filters.minAmount) params.append("minAmount", filters.minAmount);
      if (filters.maxAmount) params.append("maxAmount", filters.maxAmount);

      const response = await axiosInstance.get(
        `/admin/earnings/all-earning?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.success) {
        setEarnings(response.data.data || []);
        setPagination(response.data.pagination);
        setSummary(response.data.summary);
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
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      startDate: "",
      endDate: "",
      status: "",
      repairman: "",
      bookingId: "",
      minAmount: "",
      maxAmount: "",
      sort: "desc"
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      released: "bg-green-100 text-green-800",
      withdrawn: "bg-blue-100 text-blue-800",
      refunded: "bg-red-100 text-red-800"
    };
    return statusStyles[status] || "bg-gray-100 text-gray-800";
  };

  if (isLoading && !earnings.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Icon icon="svg-spinners:180-ring-with-bg" className="text-5xl text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">All Earnings</h1>
          <p className="text-gray-600 mt-1">Complete list of all earnings transactions</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon icon="solar:dollar-minimalistic-bold" className="text-xl text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">₺{summary.totalAmount?.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Icon icon="solar:wallet-money-bold" className="text-xl text-amber-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Total Commission</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">₺{summary.totalCommission?.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon icon="solar:money-bag-bold" className="text-xl text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Net Earnings</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">₺{summary.totalNetEarning?.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Icon icon="solar:chart-2-bold" className="text-xl text-violet-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Average Earning</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">₺{summary.averageEarning?.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon icon="solar:filter-bold" className="text-xl text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="released">Released</option>
                <option value="withdrawn">Withdrawn</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Repairman</label>
              <input
                type="text"
                value={filters.repairman}
                onChange={(e) => handleFilterChange("repairman", e.target.value)}
                placeholder="Name, email or ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Booking ID</label>
              <input
                type="text"
                value={filters.bookingId}
                onChange={(e) => handleFilterChange("bookingId", e.target.value)}
                placeholder="Enter booking ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                placeholder="999999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
            >
              <Icon icon="solar:magnifer-bold" className="text-lg" />
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              <Icon icon="solar:restart-bold" className="text-lg" />
              Reset
            </button>
          </div>
        </div>

        {/* Earnings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Repairman</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Booking</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amounts</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {earnings.length > 0 ? (
                  earnings.map((earning) => (
                    <tr key={earning._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{earning.repairman?.name || "N/A"}</p>
                          <p className="text-xs text-gray-500">{earning.repairman?.email || ""}</p>
                          {earning.repairman?.shopName && (
                            <p className="text-xs text-gray-500">Shop: {earning.repairman.shopName}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">#{earning.booking?.id?.slice(-8) || "N/A"}</p>
                          <p className="text-xs text-gray-500 capitalize">{earning.booking?.serviceType || ""}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            earning.booking?.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                            earning.booking?.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {earning.booking?.status || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">₺{earning.amounts?.total?.toLocaleString() || 0}</p>
                          <p className="text-xs text-gray-500">Commission: ₺{earning.amounts?.commission?.toLocaleString() || 0}</p>
                          <p className="text-xs text-green-600 font-medium">Net: ₺{earning.amounts?.netEarning?.toLocaleString() || 0}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(earning.status)}`}>
                          {earning.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">{new Date(earning.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{new Date(earning.createdAt).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-4 py-4">
                        <button className="text-primary-600 hover:text-primary-700">
                          <Icon icon="solar:eye-bold" className="text-xl" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center">
                      <Icon icon="solar:document-text-bold" className="text-5xl text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No earnings found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.total > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.perPage) + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm font-medium text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminAllEarning;