"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SearchInput from "@/components/partials/admin/ecom/SearchInput";
import { CustomDropdown } from "@/components/partials/admin/ecom/Dropdown";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useRouter } from '@/i18n/navigation';

function ApprovalDialog({ message, onConfirm, onCancel, isReject }) {
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    await onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isReject ? 'bg-red-100' : 'bg-primary-100'}`}>
            <Icon icon={isReject ? "mdi:close" : "mdi:check"} className={`w-5 h-5 ${isReject ? 'text-red-600' : 'text-primary-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{isReject ? 'Reject Product' : 'Approve Product'}</h3>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>

        {isReject && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason..."
            />
          </div>
        )}

        <div className="flex gap-3 justify-end mt-4">
          <button onClick={onCancel} disabled={isProcessing} className="px-5 py-2 text-sm bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-5 py-2 text-sm text-white rounded-xl disabled:opacity-50 ${isReject ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'}`}
          >
            {isProcessing && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
            {isReject ? 'Reject' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductApprovalsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("pending");
  const [approvalModal, setApprovalModal] = useState(null);
  const { token } = useSelector((s) => s.auth);
  const router = useRouter();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (approvalFilter !== "") params.set("adminApprovalStatus", approvalFilter);
      const { data } = await axiosInstance.get(`/admin/refurbish/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter out products added by admin to only show seller/repairman requests
      const nonAdminProducts = (data.data || []).filter(p => p.addedByRole !== 'admin');
      setProducts(nonAdminProducts);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [token, approvalFilter]);

  useEffect(() => { if (token) fetchProducts(); }, [token, approvalFilter, fetchProducts]);

  console.log(products, 'products')

  const handleUpdateApproval = async (id, status, reason = "") => {
    try {
      await axiosInstance.put(`/admin/refurbish/products/${id}/approval`, { status, reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Product ${status} successfully`);
      fetchProducts();
    } catch {
      toast.error("Failed to update approval status");
    } finally {
      setApprovalModal(null);
    }
  };

  const filtered = products.filter((p) => {
    const name = `${p.title || ""} ${p.sku || ""} ${p.categoryId?.name || ""} ${p.brandId?.name || ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const approvalOptions = [
    { label: "All Approvals", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  const columns = [
    {
      key: "product",
      header: "Product",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
            {row.images?.[0]?.url ? (
              <img src={row.images[0].url} alt={row.title} className="w-full h-full object-cover" />
            ) : (
              <Icon icon="mdi:cellphone" className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm line-clamp-1">
              {row.title ? row.title.split(' ').slice(0, 4).join(' ') + (row.title.split(' ').length > 4 ? '...' : '') : "—"}
            </p>            <p className="text-xs text-gray-400">SKU: {row.sku || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "model",
      header: "Model No.",
      cell: (row) => (
        <span className="text-sm font-medium text-gray-700">
          {row.modelNumber || "—"}
        </span>
      ),
    },
    {
      key: "seller",
      header: "Requested By",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-800">
            {row.sellerId?.name || 'Unknown User'}
          </span>
          {row.sellerId?.email && (
            <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Icon icon="mdi:email-outline" /> {row.sellerId.email}
            </span>
          )}
          {row.sellerId?.phone && (
            <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Icon icon="mdi:phone-outline" /> {row.sellerId.phone}
            </span>
          )}
          <span className="text-xs font-medium text-primary-600 flex items-center gap-1 mt-1 bg-primary-50 w-fit px-1.5 py-0.5 rounded">
            <Icon icon="mdi:account-badge-outline" /> {row.addedByRole || "unknown"}
          </span>
        </div>
      ),
    },
    {
      key: "approval",
      header: "Approval Status",
      cell: (row) => (
        <span
          className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider ${row.adminApprovalStatus === 'pending'
            ? 'bg-amber-50 text-amber-600 border border-amber-200'
            : row.adminApprovalStatus === 'rejected'
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-primary-50 text-primary-600 border border-primary-200'
            }`}
        >
          {row.adminApprovalStatus || 'approved'}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-1">
          {row.adminApprovalStatus === 'pending' && (
            <>
              <button onClick={() => setApprovalModal({ id: row._id, action: 'approved', label: row.title })} className="p-2 bg-primary-50 hover:bg-primary-100 rounded-xl text-primary-600" title="Approve">
                <Icon icon="mdi:check" className="w-4 h-4" />
              </button>
              <button onClick={() => setApprovalModal({ id: row._id, action: 'rejected', label: row.title })} className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600" title="Reject">
                <Icon icon="mdi:close" className="w-4 h-4" />
              </button>
            </>
          )}
          <button onClick={() => router.push(`/admin/refurbished/products/view/${row._id}`)} className="p-2 hover:bg-blue-50 rounded-xl text-blue-600" title="View Product Details">
            <Icon icon="mdi:eye-outline" className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50/50 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Product Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">Review and approve refurbished products submitted by sellers and repairmen</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/60 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <SearchInput value={search} onChange={(v) => setSearch(v)} placeholder="Search by title, SKU..." />
          </div>
          <div className="w-full sm:w-48">
            <CustomDropdown options={approvalOptions} value={approvalFilter} onChange={(v) => setApprovalFilter(v)} placeholder="All Approvals" />
          </div>
        </div>

        <DataTable
          data={filtered}
          columns={columns}
          loading={loading}
          emptyIcon="mdi:text-box-search-outline"
          emptyTitle="No approvals found"
          emptyDescription="You have reviewed all pending product approvals."
        />
      </div>

      {approvalModal && (
        <ApprovalDialog
          message={`Are you sure you want to ${approvalModal.action} "${approvalModal.label}"?`}
          isReject={approvalModal.action === 'rejected'}
          onConfirm={(reason) => handleUpdateApproval(approvalModal.id, approvalModal.action, reason)}
          onCancel={() => setApprovalModal(null)}
        />
      )}
    </div>
  );
}
