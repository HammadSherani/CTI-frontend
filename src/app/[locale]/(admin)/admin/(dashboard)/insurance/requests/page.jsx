"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "@/i18n/navigation";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import moment from "moment";
import axiosInstance from "@/config/axiosInstance";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards from "@/components/partials/admin/ecom/SummaryCards";
import SearchInput from "@/components/partials/admin/ecom/SearchInput";
import { CustomDropdown } from "@/components/partials/admin/ecom/Dropdown";

const statuses = ["Pending", "Contacted", "Approved", "Rejected", "Completed"];
const statusClass = { Pending: "bg-yellow-100 text-yellow-700", Contacted: "bg-blue-100 text-blue-700", Approved: "bg-indigo-100 text-indigo-700", Completed: "bg-green-100 text-green-700", Rejected: "bg-red-100 text-red-700" };

export default function InsuranceRequestsPage() {
  const { token } = useSelector((state) => state.auth);
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const { data } = await axiosInstance.get(`/admin/insurance?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      setRequests(data.data || []);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load insurance requests");
    } finally { setLoading(false); }
  }, [token, page, search, status]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { setPage(1); }, [search, status]);

  const counts = (value) => requests.filter((request) => request.status === value).length;
  const columns = [
    { key: "customer", header: "Customer", cell: (row) => <div><p className="font-bold text-gray-800">{row.customer?.fullName}</p><p className="text-xs text-gray-400">{row.customer?.phone}</p></div> },
    { key: "device", header: "Device", cell: (row) => <div><p className="font-semibold text-gray-800">{row.device?.brand} {row.device?.model}</p><p className="text-xs text-gray-400">{row.device?.type}</p></div> },
    { key: "insurance", header: "Insurance", cell: (row) => <div><p className="text-sm font-semibold text-gray-700">{row.insuranceCategory || "Legacy request"}</p><p className="text-xs text-gray-400">{row.insuranceTypeName || row.insuranceType}</p></div> },
    { key: "date", header: "Submitted", cell: (row) => <span className="text-sm text-gray-600">{moment(row.createdAt).format("DD MMM YYYY")}</span> },
    { key: "status", header: "Status", cell: (row) => <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass[row.status] || "bg-gray-100 text-gray-700"}`}>{row.status}</span> },
    { key: "actions", header: "Actions", cell: (row) => <button type="button" title="View details" onClick={() => router.push(`/admin/insurance/requests/${row._id}`)} className="rounded-xl p-2 text-primary-600 hover:bg-primary-50"><Icon icon="mdi:eye-outline" className="h-5 w-5" /></button> },
  ];

  return <div className="min-h-screen space-y-6 bg-gray-50/50 p-4 sm:p-6 lg:p-8">
    <div><h1 className="text-3xl font-black text-gray-900">Insurance Requests</h1><p className="mt-1 text-sm text-gray-500">Review and manage customer device insurance enquiries.</p></div>
    <SummaryCards data={[{ label: "Total on page", value: requests.length, icon: "mdi:shield-check-outline", color: "#6366f1" }, { label: "Pending", value: counts("Pending"), icon: "mdi:clock-outline", color: "#f59e0b" }, { label: "Contacted", value: counts("Contacted"), icon: "mdi:phone-outline", color: "#3b82f6" }, { label: "Completed", value: counts("Completed"), icon: "mdi:check-circle-outline", color: "#10b981" }]} />
    <section className="space-y-6 rounded-3xl border border-gray-200/60 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row"><div className="w-full flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search customer, device or IMEI..." /></div><div className="w-full sm:w-52"><CustomDropdown icon="mdi:filter-outline" placeholder="All statuses" options={[{ label: "All statuses", value: "" }, ...statuses.map((item) => ({ label: item, value: item }))]} value={status} onChange={setStatus} /></div></div>
      <DataTable data={requests} columns={columns} loading={loading} pagination={pagination} onPageChange={setPage} emptyIcon="mdi:shield-off-outline" emptyTitle="No insurance requests found" emptyDescription="New customer requests will appear here." />
    </section>
  </div>;
}
