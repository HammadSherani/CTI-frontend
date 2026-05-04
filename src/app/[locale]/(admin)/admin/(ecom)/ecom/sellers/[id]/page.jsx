"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function KycBadge({ status }) {
  const map = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500", label: "Pending" },
    approved: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", label: "Approved" },
    rejected: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "Rejected" },
    revision: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500", label: "Revision" },
  };
  const s = map[status] || { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", label: status || "—" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="py-3 border-b border-gray-50 last:border-0">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
          <Icon icon={icon} className="w-4 h-4 text-primary-600" />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

function DocumentCard({ label, url }) {
  if (!url) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Icon icon="mdi:file-outline" className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-xs text-gray-400">Not uploaded</p>
          </div>
        </div>
        <span className="text-xs text-gray-300 font-medium">N/A</span>
      </div>
    );
  }

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon icon={isImage ? "mdi:image-outline" : "mdi:file-pdf-box"} className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-primary-600 font-medium hover:text-primary-700">
        
          <Icon icon="mdi:open-in-new" className="w-3.5 h-3.5" />
          Open
        </a>
      </div>
      {isImage && (
        <div className="relative bg-gray-100">
          <img
            src={url}
            alt={label}
            className="w-full h-48 object-contain"
          />
        </div>
      )}
      {!isImage && (
        <div className="p-4 flex items-center justify-center gap-3">
          <Icon icon="mdi:file-document-outline" className="w-8 h-8 text-gray-400" />
          
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:underline font-medium"
          <a>
            View Document
          </a>
        </div>
      )}
    </div>
  );
}

export default function SellerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);

  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState("pending");
  const [kycReason, setKycReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const needsReason = kycStatus === "rejected" || kycStatus === "revision";

  const fetchSeller = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/admin/e-commerce/seller/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const s = data.data || data;
      setSeller(s);
      setKycStatus(s.kycStatus || "pending");
      setKycReason(s.kycReason || "");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load seller");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchSeller();
  }, [fetchSeller]);

  const handleKycSubmit = async () => {
    if (needsReason && !kycReason.trim()) {
      toast.error("Reason is required for rejected / revision.");
      return;
    }
    setSubmitting(true);
    try {
      await axiosInstance.post(
        `/admin/e-commerce/seller/kyc/${id}`,
        {
          kycStatus,
          kycReason: needsReason ? kycReason : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`KYC status updated to ${kycStatus}`);
      fetchSeller();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update KYC");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      await axiosInstance.post(
        `/admin/e-commerce/seller/toggle/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Seller ${seller.isActive ? "deactivated" : "activated"}`);
      fetchSeller();
    } catch (err) {
      toast.error("Failed to update seller status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="mdi:loading" className="w-10 h-10 text-primary-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading seller details...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="mdi:store-off-outline" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">Seller not found</h2>
          <button
            onClick={() => router.push("/admin/ecom/sellers")}
            className="mt-4 text-sm text-primary-600 hover:underline"
          >
            Back to Sellers
          </button>
        </div>
      </div>
    );
  }

  const sellerName = seller.fullName || seller.userId?.name || "Unknown";
  const sellerEmail = seller.emailAddress || seller.userId?.email || "—";
  const initials = sellerName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/ecom/sellers")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Icon icon="mdi:arrow-left" className="w-4 h-4" />
              Back to Sellers
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-medium text-gray-900">{sellerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <KycBadge status={seller.kycStatus} />
            <button
              onClick={handleToggleActive}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${seller.isActive
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
            >
              <Icon icon={seller.isActive ? "mdi:account-off-outline" : "mdi:account-check-outline"} className="w-3.5 h-3.5" />
              {seller.isActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seller Hero Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
            {seller.profilePictureOrLogo ? (
              <img src={seller.profilePictureOrLogo} alt={sellerName} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{sellerName}</h1>
              {seller.isActive ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Inactive
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{seller.businessName || "—"}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <Icon icon="mdi:email-outline" className="w-3.5 h-3.5" />
                {sellerEmail}
              </span>
              {seller.phoneNumber && (
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Icon icon="mdi:phone-outline" className="w-3.5 h-3.5" />
                  {seller.phoneNumber}
                </span>
              )}
              {seller.country?.name && (
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Icon icon="mdi:map-marker-outline" className="w-3.5 h-3.5" />
                  {seller.country.name}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <Icon icon="mdi:calendar-outline" className="w-3.5 h-3.5" />
                Joined {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Personal Info */}
            <SectionCard title="Personal Information" icon="mdi:account-outline">
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="sm:pr-4">
                  <InfoRow label="Full Name" value={seller.fullName} />
                  <InfoRow label="Email" value={sellerEmail} />
                  <InfoRow label="Phone" value={seller.phoneNumber} />
                  <InfoRow label="Gender" value={seller.gender} />
                </div>
                <div className="sm:pl-4 sm:border-l sm:border-gray-50">
                  <InfoRow label="Date of Birth" value={seller.dob ? new Date(seller.dob).toLocaleDateString() : null} />
                  <InfoRow label="Store Address" value={seller.storeAddress} />
                  <InfoRow label="Zip Code" value={seller.zipCode} />
                  <InfoRow label="Country" value={seller.country?.name} />
                </div>
              </div>
            </SectionCard>

            {/* Business Info */}
            <SectionCard title="Business Information" icon="mdi:briefcase-outline">
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="sm:pr-4">
                  <InfoRow label="Business Name" value={seller.businessName} />
                  <InfoRow label="National ID / Tax No" value={seller.nationalIdOrTaxNumber} />
                  <InfoRow label="Shipping Method" value={seller.shippingMethod} />
                </div>
                <div className="sm:pl-4 sm:border-l sm:border-gray-50">
                  <InfoRow label="Refurbished Devices" value={seller.sellsRefurbishedDevices ? "Yes" : "No"} />
                  <InfoRow label="Working Days" value={seller.workingDays?.join(", ")} />
                  <InfoRow
                    label="Working Hours"
                    value={seller.workingHours ? `${seller.workingHours.start} – ${seller.workingHours.end}` : null}
                  />
                </div>
              </div>
              {seller.storeDescription && (
                <div className="py-3 border-t border-gray-50">
                  <p className="text-xs text-gray-400 mb-1">Store Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{seller.storeDescription}</p>
                </div>
              )}
            </SectionCard>

            {/* Documents */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Icon icon="mdi:folder-outline" className="w-4 h-4 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Documents</h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DocumentCard label="National ID / Passport" url={seller.nationalIdOrPassport} />
                <DocumentCard label="Shop License / Tax Certificate" url={seller.shopLicenseOrTaxCertificate} />
                <DocumentCard label="Proof of Address" url={seller.proofOfAddress} />
                <DocumentCard label="Profile / Logo" url={seller.profilePictureOrLogo} />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* KYC Review */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Icon icon="mdi:shield-check-outline" className="w-4 h-4 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">KYC Review</h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Current Status</p>
                  <KycBadge status={seller.kycStatus} />
                </div>
                {seller.kycReason && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-xs font-medium text-amber-700 mb-1">Previous Reason</p>
                    <p className="text-xs text-amber-600">{seller.kycReason}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Update KYC Status</label>
                  <select
                    value={kycStatus}
                    onChange={(e) => setKycStatus(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-colors"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                    <option value="revision">Request Revision</option>
                  </select>
                </div>
                {needsReason && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">
                      Reason <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={kycReason}
                      onChange={(e) => setKycReason(e.target.value)}
                      placeholder="Enter reason for rejection or revision..."
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-primary-400 focus:bg-white transition-colors resize-none"
                    />
                  </div>
                )}
                <button
                  onClick={handleKycSubmit}
                  disabled={submitting}
                  className="w-full py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {submitting && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
                  {submitting ? "Saving…" : "Update KYC Status"}
                </button>
              </div>
            </div>

            {/* Bank Details */}
            {seller.bankDetails && (
              <SectionCard title="Bank Details" icon="mdi:bank-outline">
                <InfoRow label="Account Title" value={seller.bankDetails.accountTitle} />
                <InfoRow label="Account Number" value={seller.bankDetails.accountNumber} />
                <InfoRow label="Bank Name" value={seller.bankDetails.bankName} />
                <InfoRow label="Branch Name" value={seller.bankDetails.branchName} />
                <InfoRow label="IBAN" value={seller.bankDetails.iban} />
              </SectionCard>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Icon icon="mdi:chart-box-outline" className="w-4 h-4 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Quick Info</h3>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-xs text-gray-500">Account Status</span>
                  <span className={`text-xs font-semibold ${seller.isActive ? "text-green-600" : "text-gray-400"}`}>
                    {seller.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-xs text-gray-500">KYC Status</span>
                  <span className="text-xs font-semibold text-gray-700 capitalize">{seller.kycStatus || "—"}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-xs text-gray-500">Sells Refurbished</span>
                  <span className="text-xs font-semibold text-gray-700">
                    {seller.sellsRefurbishedDevices ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-gray-500">Member Since</span>
                  <span className="text-xs font-semibold text-gray-700">
                    {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}