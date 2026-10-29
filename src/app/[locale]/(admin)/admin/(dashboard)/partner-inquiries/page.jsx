"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import moment from "moment";
import axiosInstance from "@/config/axiosInstance";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards from "@/components/partials/admin/ecom/SummaryCards";
import SearchInput from "@/components/partials/admin/ecom/SearchInput";
import { CustomDropdown } from "@/components/partials/admin/ecom/Dropdown";

const statuses = ["pending", "contacted", "approved", "rejected"];
const statusConfig = {
  pending: { label: "Pending", bg: "bg-amber-100 text-amber-800 border-amber-200" },
  contacted: { label: "Contacted", bg: "bg-blue-100 text-blue-800 border-blue-200" },
  approved: { label: "Approved", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  rejected: { label: "Rejected", bg: "bg-rose-100 text-rose-800 border-rose-200" },
};

export default function AdminPartnerInquiriesPage() {
  const { token } = useSelector((state) => state.auth);

  const [inquiries, setInquiries] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal detail view
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const fetchInquiries = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set("search", search);
      if (status) params.set("status", status);

      const { data } = await axiosInstance.get(`/admin/partner-inquiries?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInquiries(data.data || []);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load partner inquiries");
    } finally {
      setLoading(false);
    }
  }, [token, page, search, status]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  // Handle status update
  const handleStatusChange = async (id, newStatus, notesToSave = null) => {
    if (!token) return;
    setUpdatingStatus(true);
    try {
      const payload = { status: newStatus };
      if (notesToSave !== null) {
        payload.notes = notesToSave;
      }

      const { data } = await axiosInstance.put(`/admin/partner-inquiries/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(data.message || `Status updated to ${newStatus}`);

      // Update in local state
      setInquiries((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: newStatus, notes: payload.notes ?? item.notes } : item))
      );

      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry((prev) => ({ ...prev, status: newStatus, notes: payload.notes ?? prev.notes }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const countByStatus = (val) => inquiries.filter((i) => i.status?.toLowerCase() === val).length;

  const columns = [
    {
      key: "partner",
      header: "Partner & Business",
      cell: (row) => (
        <div className="py-1">
          <p className="font-extrabold text-gray-900 text-sm">{row.fullName || "—"}</p>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-primary-700 font-semibold">
            <Icon icon="mdi:store-outline" className="text-sm shrink-0" />
            <span className="truncate max-w-[200px]">{row.businessName || "Individual"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact Details",
      cell: (row) => {
        const cleanPhone = String(row.phone || "").replace(/\D/g, "");
        return (
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <a
                href={`tel:${row.phone}`}
                className="font-bold text-gray-800 hover:text-primary-600 flex items-center gap-1"
                title="Call partner"
              >
                <Icon icon="mdi:phone-outline" className="text-gray-400" />
                <span>{row.phone}</span>
              </a>
              {cleanPhone && (
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-md hover:bg-emerald-100 font-bold"
                  title="Chat on WhatsApp"
                >
                  <Icon icon="mdi:whatsapp" className="text-xs mr-0.5 text-emerald-600" />
                  WA
                </a>
              )}
            </div>
            <a
              href={`mailto:${row.email}`}
              className="text-gray-500 hover:text-primary-600 block truncate max-w-[220px]"
            >
              {row.email}
            </a>
          </div>
        );
      },
    },
    {
      key: "city",
      header: "Location",
      cell: (row) => (
        <div className="flex items-center gap-1 text-xs text-gray-700 font-medium">
          <Icon icon="mdi:map-marker-outline" className="text-gray-400 text-sm shrink-0" />
          <span>{row.city || "Not specified"}</span>
        </div>
      ),
    },
    {
      key: "date",
      header: "Applied On",
      cell: (row) => (
        <span className="text-xs text-gray-500 font-medium">
          {row.createdAt ? moment(row.createdAt).format("DD MMM YYYY, hh:mm A") : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => {
        const current = statusConfig[row.status?.toLowerCase()] || {
          label: row.status || "Pending",
          bg: "bg-gray-100 text-gray-700 border-gray-200",
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${current.bg}`}
          >
            {current.label}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="View Details"
            onClick={() => {
              setSelectedInquiry(row);
              setAdminNotes(row.notes || "");
            }}
            className="p-2 rounded-xl text-primary-600 hover:bg-primary-50 transition cursor-pointer"
          >
            <Icon icon="mdi:eye-outline" className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen space-y-6 bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
            <Icon icon="mdi:handshake" className="text-primary-600" />
            <span>Partner Inquiries</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review, contact, and onboard business vendors & retail partners registered via the website.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchInquiries}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold shadow-xs cursor-pointer"
        >
          <Icon icon="mdi:refresh" className={`text-base ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <SummaryCards
        data={[
          {
            label: "Total Applications",
            value: inquiries.length,
            icon: "mdi:account-group-outline",
            color: "#6366f1",
          },
          {
            label: "Pending Review",
            value: countByStatus("pending"),
            icon: "mdi:clock-outline",
            color: "#f59e0b",
          },
          {
            label: "Contacted",
            value: countByStatus("contacted"),
            icon: "mdi:phone-outgoing-outline",
            color: "#3b82f6",
          },
          {
            label: "Approved Partners",
            value: countByStatus("approved"),
            icon: "mdi:check-decagram-outline",
            color: "#10b981",
          },
        ]}
      />

      {/* Main Table Card */}
      <section className="space-y-6 rounded-3xl border border-gray-200/60 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="w-full flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by name, business, phone, email, or city..."
            />
          </div>
          <div className="w-full sm:w-56">
            <CustomDropdown
              icon="mdi:filter-outline"
              placeholder="All Statuses"
              options={[
                { label: "All Statuses", value: "" },
                { label: "Pending", value: "pending" },
                { label: "Contacted", value: "contacted" },
                { label: "Approved", value: "approved" },
                { label: "Rejected", value: "rejected" },
              ]}
              value={status}
              onChange={setStatus}
            />
          </div>
        </div>

        <DataTable
          data={inquiries}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          emptyIcon="mdi:handshake-outline"
          emptyTitle="No Partner Inquiries Found"
          emptyDescription="Applications submitted from the Partner With Us portal will appear here in real time."
        />
      </section>

      {/* Detail Modal */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedInquiry(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative border border-gray-100 max-h-[90vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl">
                  <Icon icon="mdi:store" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 leading-tight">
                    {selectedInquiry.businessName}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Applied on {moment(selectedInquiry.createdAt).format("DD MMMM YYYY, hh:mm A")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <Icon icon="mdi:close" className="text-xl" />
              </button>
            </div>

            {/* Applicant Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-semibold block uppercase text-[10px]">Contact Person</span>
                <span className="font-bold text-gray-900 text-sm mt-0.5 block">{selectedInquiry.fullName}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-semibold block uppercase text-[10px]">City / Location</span>
                <span className="font-bold text-gray-900 text-sm mt-0.5 block">{selectedInquiry.city || "N/A"}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-semibold block uppercase text-[10px]">Phone Number</span>
                <a
                  href={`tel:${selectedInquiry.phone}`}
                  className="font-bold text-primary-600 text-sm mt-0.5 flex items-center gap-1 hover:underline"
                >
                  <Icon icon="mdi:phone" className="text-xs" />
                  <span>{selectedInquiry.phone}</span>
                </a>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-semibold block uppercase text-[10px]">Email Address</span>
                <a
                  href={`mailto:${selectedInquiry.email}`}
                  className="font-bold text-primary-600 text-sm mt-0.5 truncate block hover:underline"
                >
                  {selectedInquiry.email}
                </a>
              </div>
            </div>

            {/* Message from Partner */}
            <div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">
                Message / Business Description
              </span>
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-xs sm:text-sm text-gray-700 leading-relaxed min-h-[60px]">
                {selectedInquiry.message || "No additional message provided."}
              </div>
            </div>

            {/* Quick Action: Call & WhatsApp */}
            <div className="flex items-center gap-3">
              <a
                href={`tel:${selectedInquiry.phone}`}
                className="flex-1 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Icon icon="mdi:phone" className="text-sm" />
                <span>Call Partner</span>
              </a>
              <a
                href={`https://wa.me/${String(selectedInquiry.phone).replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Icon icon="mdi:whatsapp" className="text-base" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Status Change Buttons */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide block">
                Update Status
              </span>
              <div className="grid grid-cols-4 gap-2">
                {statuses.map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleStatusChange(selectedInquiry._id, st, adminNotes)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold capitalize transition cursor-pointer border ${
                      selectedInquiry.status?.toLowerCase() === st
                        ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Admin Notes (Internal follow-up)
              </label>
              <textarea
                rows="2"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Called on 29 Oct, agreed for trade-in buyback onboarding..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-primary-500 transition"
              />
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() =>
                  handleStatusChange(selectedInquiry._id, selectedInquiry.status || "pending", adminNotes)
                }
                className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

