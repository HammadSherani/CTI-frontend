"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards from "@/components/partials/admin/ecom/SummaryCards";
import SearchInput from "@/components/partials/admin/ecom/SearchInput";
import { CustomDropdown } from "@/components/partials/admin/ecom/Dropdown";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useRouter } from '@/i18n/navigation';
import moment from "moment";

export default function SellRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { token } = useSelector((s) => s.auth);
  const router = useRouter();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "") params.set("status", statusFilter);
      if (search !== "") params.set("search", search);

      const { data } = await axiosInstance.get(`/admin/refurbish/sell-requests?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(data.data || []);
    } catch {
      toast.error("Failed to load sell requests");
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, search]);

  useEffect(() => {
    if (token) fetchRequests();
  }, [token, statusFilter, search, fetchRequests]);

  const summaryCards = [
    { label: "Total Requests", value: requests.length, icon: "mdi:file-document-multiple-outline", color: "#6366f1" },
    { label: "Pending", value: requests.filter((r) => r.status === 'pending').length, icon: "mdi:clock-outline", color: "#f59e0b" },
    { label: "Completed", value: requests.filter((r) => r.status === 'completed').length, icon: "mdi:check-circle-outline", color: "#10b981" },
  ];

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Evaluating", value: "evaluating" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const columns = [
    {
      key: "trackingId",
      header: "Tracking ID",
      cell: (row) => (
        <span className="font-bold text-gray-800 text-sm">{row.trackingId}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (row) => (
        <div>
          <p className="font-bold text-gray-800 text-sm">{row.customerInfo?.name || "—"}</p>
          <p className="text-xs text-gray-400">{row.customerInfo?.phone || row.customerInfo?.email}</p>
        </div>
      ),
    },
    {
      key: "device",
      header: "Device",
      cell: (row) => (
        <div>
          <p className="font-bold text-gray-800 text-sm">{row.modelId?.name || "—"}</p>
          <p className="text-xs text-gray-400">{row.brandId?.name}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (row) => (
        <span className="text-sm text-gray-600">
          {moment(row.createdAt).format("DD MMM YYYY, hh:mm A")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => {
        const colors = {
          pending: "bg-yellow-100 text-yellow-700",
          evaluating: "bg-blue-100 text-blue-700",
          approved: "bg-green-100 text-green-700",
          rejected: "bg-red-100 text-red-700",
          completed: "bg-purple-100 text-purple-700",
          cancelled: "bg-gray-100 text-gray-700",
        };
        return (
          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full capitalize ${colors[row.status] || colors.pending}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <button
          onClick={() => router.push(`/admin/refurbished/requests/${row._id}`)}
          className="p-2 hover:bg-primary-50 rounded-xl text-primary-600"
          title="View Details"
        >
          <Icon icon="mdi:eye-outline" className="w-5 h-5" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50/50 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Sell Requests</h1>
          <p className="text-gray-500 text-sm mt-1">Manage user requests to sell their old phones</p>
        </div>
      </div>

      <SummaryCards data={summaryCards} />

      <div className="bg-white rounded-3xl border border-gray-200/60 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <SearchInput value={search} onChange={(v) => setSearch(v)} placeholder="Search by tracking ID, name, email or phone..." />
          </div>
          <div className="w-full sm:w-48">
            <CustomDropdown icon="mdi:filter-outline" placeholder="Status" options={statusOptions} value={statusFilter} onChange={(v) => setStatusFilter(v)} />
          </div>
        </div>

        <DataTable
          data={requests}
          columns={columns}
          loading={loading}
          emptyIcon="mdi:cellphone-arrow-down"
          emptyTitle="No sell requests found"
          emptyDescription="There are no requests matching your criteria"
        />
      </div>
    </div>
  );
}
