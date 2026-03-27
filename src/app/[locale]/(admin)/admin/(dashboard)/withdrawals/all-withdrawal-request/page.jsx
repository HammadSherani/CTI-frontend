"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "@/config/axiosInstance";
import handleError from "@/helper/handleError";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

function GetAllWithdrawRequest() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    startDate: "",
    endDate: "",
    repairman: "",
    minAmount: "",
    maxAmount: "",
    sort: "desc"
  });

  const router = useRouter()
  const { token } = useSelector((state) => state.auth);

  const fetchData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", filters.page);
      params.append("limit", filters.limit);
      params.append("sort", filters.sort);

      if (filters.status) params.append("status", filters.status);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.repairman) params.append("repairman", filters.repairman);
      if (filters.minAmount) params.append("minAmount", filters.minAmount);
      if (filters.maxAmount) params.append("maxAmount", filters.maxAmount);

      const response = await axiosInstance.get(
        `/admin/earnings/withdraw-request?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.success) {
        setWithdrawals(response.data.data || []);
        setPagination(response.data.pagination);
        setSummary(response.data.summary);
      } else {
        toast.warn("Failed to load withdrawal requests.");
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
      status: "",
      startDate: "",
      endDate: "",
      repairman: "",
      minAmount: "",
      maxAmount: "",
      sort: "desc"
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleAction = async (requestId, action, note = "") => {
    try {
      const response = await axiosInstance.post(
        `/admin/earnings/withdraw-request/${requestId}/${action}`,
        { adminNote: note },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.success) {
        toast.success(`Withdrawal ${action} successfully`);
        fetchData();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getStatusBadgeStyle = (statusBadge) => {
    if (!statusBadge) return "bg-gray-100 text-gray-800";
    return `${statusBadge.bgColor} ${statusBadge.textColor}`;
  };

  if (isLoading && !withdrawals.length) {
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
          <h1 className="text-3xl font-bold text-gray-900">Withdrawal Requests</h1>
          <p className="text-gray-600 mt-1">Manage all repairman withdrawal requests</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon icon="solar:money-bag-bold" className="text-xl text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">₺{summary.totalAmount?.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{summary.count} requests</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Icon icon="solar:wallet-money-bold" className="text-xl text-amber-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Average Amount</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">₺{summary.averageAmount?.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Icon icon="solar:clock-circle-bold" className="text-xl text-yellow-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Requested</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{summary.byStatus?.requested?.count || 0}</p>
              <p className="text-xs text-gray-500 mt-1">₺{summary.byStatus?.requested?.amount?.toLocaleString() || 0}</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon icon="solar:check-circle-bold" className="text-xl text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{summary.byStatus?.completed?.count || 0}</p>
              <p className="text-xs text-gray-500 mt-1">₺{summary.byStatus?.completed?.amount?.toLocaleString() || 0}</p>
            </div>
          </div>
        )}

        {/* Status Summary Row */}
        {summary?.byStatus && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <p className="text-xs font-medium text-gray-600">Requested</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{summary.byStatus.requested?.count || 0}</p>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-xs font-medium text-gray-600">Processing</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{summary.byStatus.processing?.count || 0}</p>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs font-medium text-gray-600">Completed</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{summary.byStatus.completed?.count || 0}</p>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-xs font-medium text-gray-600">Rejected</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{summary.byStatus.rejected?.count || 0}</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="">All Status</option>
                <option value="requested">Requested</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Items Per Page</label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange("limit", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
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

        {/* Withdrawal Requests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Repairman</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Earnings Summary</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Requested</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {withdrawals.length > 0 ? (
                  withdrawals.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{request.repairman?.name || "N/A"}</p>
                          <p className="text-xs text-gray-500">{request.repairman?.email || ""}</p>
                          {request.repairman?.shopName && (
                            <p className="text-xs text-gray-500">Shop: {request.repairman.shopName}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-lg font-bold text-gray-900">₺{request.amount?.toLocaleString()}</p>
                        {request.timeMetrics?.isOverdue && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs">
                          <p className="text-gray-600">Jobs: <span className="font-medium text-gray-900">{request.earningsSummary?.jobsCount || 0}</span></p>
                          <p className="text-gray-600">Gross: <span className="font-medium">₺{request.earningsSummary?.totalGross?.toLocaleString() || 0}</span></p>
                          <p className="text-gray-600">Commission: <span className="font-medium">₺{request.earningsSummary?.totalCommission?.toLocaleString() || 0}</span></p>
                          <p className="text-green-600">Net: <span className="font-semibold">₺{request.earningsSummary?.totalNet?.toLocaleString() || 0}</span></p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(request.statusBadge)}`}>
                          {request.statusBadge?.icon && (
                            <Icon icon={request.statusBadge.icon} className="mr-1" />
                          )}
                          {request.status}
                        </span>
                        {request.timeMetrics && (
                          <p className="text-xs text-gray-500 mt-1">
                            {request.timeMetrics.daysSinceRequested} days ago
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">{new Date(request.requestedAt).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{new Date(request.requestedAt).toLocaleTimeString()}</p>
                        {request.expectedReleaseDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Expected: {new Date(request.expectedReleaseDate).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {request.canApprove && (
                            <button
                              onClick={() => handleAction(request._id, "approve")}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Icon icon="solar:check-circle-bold" className="text-xl" />
                            </button>
                          )}
                          {request.canReject && (
                            <button
                              onClick={() => handleAction(request._id, "reject")}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <Icon icon="solar:close-circle-bold" className="text-xl" />
                            </button>
                          )}
                          <button
                            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="View Details"
                            onClick={() => router.push(`/admin/withdrawals/${request._id}`)}
                          >
                            <Icon icon="solar:eye-bold" className="text-xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center">
                      <Icon icon="solar:card-transfer-bold" className="text-5xl text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No withdrawal requests found</p>
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

export default GetAllWithdrawRequest;