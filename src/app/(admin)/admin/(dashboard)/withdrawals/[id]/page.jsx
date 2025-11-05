"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "@/config/axiosInstance";
import handleError from "@/helper/handleError";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function WithdrawDetails() {
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);

  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchData = useCallback(async () => {
    if (!token || !id) return;

    setLoading(true);
    try {
      const { data: res } = await axiosInstance.get(
        `/admin/earnings/withdraw-request/${id}`,
        { headers }
      );

      if (res?.success) setData(res.data || null);
      else toast.warn("Failed to load withdrawal request details.");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (action, note = "") => {
    if (!id || !token) return;

    try {
      const { data: res } = await axiosInstance.patch(
        `/admin/earnings/withdraw-request/${id}/${action}`,
        { adminNote: note },
        { headers }
      );

      if (res?.success) {
        toast.success(`Withdrawal ${action}d successfully`);
        setShowNoteModal(false);
        setAdminNote("");
        fetchData();
      }
    } catch (err) {
      handleError(err);
    }
  };

  const openActionModal = (action) => {
    setActionType(action);
    setShowNoteModal(true);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Icon icon="svg-spinners:180-ring-with-bg" className="text-5xl text-primary-600" />
      </div>
    );

  if (!data)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Icon icon="solar:card-transfer-bold" className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No withdrawal request found</p>
          <Link
            href="/admin/withdrawals/all-withdrawal-request"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Icon icon="solar:arrow-left-bold" />
            Back to List
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <Link
            href="/admin/withdrawals/all-withdrawal-request"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <Icon icon="solar:arrow-left-bold" />
            Back to List
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Withdrawal Request Details</h1>
              <p className="text-gray-600 mt-1">Request ID: #{data.withdrawId?.slice(-8)}</p>
            </div>
            <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${data.statusBadge?.bgColor} ${data.statusBadge?.textColor}`}>
              <Icon icon={data.statusBadge?.icon} className="mr-2 text-lg" />
              {data.status}
            </span>
          </div>
        </header>

        {/* Verification Alerts */}
        {data.verification && (
          <div className="mb-6 space-y-3">
            {!data.verification.hasBankDetails && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <Icon icon="solar:danger-bold" className="text-xl text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">No Bank Details</p>
                  <p className="text-sm text-red-700">Repairman has not provided bank details yet.</p>
                </div>
              </div>
            )}
            {/* {!data.verification.amountMatches && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                <Icon icon="solar:danger-triangle-bold" className="text-xl text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900">Amount Mismatch</p>
                  <p className="text-sm text-yellow-700">
                    Withdrawal amount (₺{data.amount?.toLocaleString()}) doesn't match total net earnings (₺{data.earningsSummary?.totalNet?.toLocaleString()})
                  </p>
                </div>
              </div>
            )} */}
            {data.timeline?.isOverdue && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                <Icon icon="solar:clock-circle-bold" className="text-xl text-orange-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900">Overdue Request</p>
                  <p className="text-sm text-orange-700">This request is past the expected release date.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon icon="solar:money-bag-bold" className="text-2xl text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Withdrawal Amount</p>
                <p className="text-2xl font-bold text-gray-900">₺{data.amount?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon icon="solar:clock-circle-bold" className="text-2xl text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Days Since Request</p>
                <p className="text-2xl font-bold text-gray-900">{data.timeline?.daysSinceRequested}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                <Icon icon="solar:document-text-bold" className="text-2xl text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Jobs Included</p>
                <p className="text-2xl font-bold text-gray-900">{data.earningsSummary?.jobsCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Repairman Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon="solar:user-bold" className="text-xl text-primary-600" />
                Repairman Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{data.repairman?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{data.repairman?.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">{data.repairman?.phone}</span>
                </div>
                {data.repairman?.shopName && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Shop Name:</span>
                    <span className="font-medium text-gray-900">{data.repairman.shopName}</span>
                  </div>
                )}
                {data.repairman?.rating !== undefined && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Rating:</span>
                    <span className="font-medium text-gray-900">{data.repairman.rating || "N/A"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bank Details */}
            {data.bankDetails ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon icon="solar:card-bold" className="text-xl text-primary-600" />
                  Bank Details
                </h2>
                <div className="space-y-3">
                  {data.bankDetails.accountTitle && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Account Title:</span>
                      <span className="font-medium text-gray-900">{data.bankDetails.accountTitle}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Bank Name:</span>
                    <span className="font-medium text-gray-900">{data.bankDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-medium text-gray-900 font-mono text-sm">{data.bankDetails.accountNumber}</span>
                  </div>
                  {data.bankDetails.iban && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">IBAN:</span>
                      <span className="font-medium text-gray-900 font-mono text-sm break-all">{data.bankDetails.iban}</span>
                    </div>
                  )}
                  {data.bankDetails.branchName && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Branch:</span>
                      <span className="font-medium text-gray-900">{data.bankDetails.branchName}</span>
                    </div>
                  )}
                  {data.bankDetails.updatedAt && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium text-gray-900 text-sm">{new Date(data.bankDetails.updatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                <div className="flex items-center gap-3">
                  <Icon icon="solar:danger-bold" className="text-2xl text-red-600" />
                  <div>
                    <p className="font-semibold text-red-900">No Bank Details Available</p>
                    <p className="text-sm text-red-700 mt-1">The repairman needs to add bank details before approval.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Earnings Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon="solar:chart-2-bold" className="text-xl text-primary-600" />
                Earnings Summary
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs text-gray-600 mb-1">Total Gross</p>
                  <p className="text-xl font-bold text-gray-900">₺{data.earningsSummary?.totalGross?.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs text-gray-600 mb-1">Commission</p>
                  <p className="text-xl font-bold text-gray-900">₺{data.earningsSummary?.totalCommission?.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <p className="text-xs text-green-700 mb-1">Net Earnings</p>
                  <p className="text-xl font-bold text-green-700">₺{data.earningsSummary?.totalNet?.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs text-gray-600 mb-1">Average Per Job</p>
                  <p className="text-xl font-bold text-gray-900">₺{data.earningsSummary?.averagePerJob?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Earnings List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon="solar:document-text-bold" className="text-xl text-primary-600" />
                Included Earnings ({data.earnings?.length || 0})
              </h2>
              <div className="space-y-3">
                {data.earnings?.map((earning) => (
                  <div key={earning.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">Booking #{earning.booking?.id?.slice(-8)}</p>
                        <p className="text-sm text-gray-600 capitalize mt-1">{earning.booking?.serviceType}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        earning.status === 'released' ? 'bg-green-100 text-green-800' :
                        earning.status === 'withdrawn' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {earning.status}
                      </span>
                    </div>
                    {earning.customer && (
                      <p className="text-xs text-gray-600 mb-3 pb-3 border-b border-gray-100">
                        <Icon icon="solar:user-bold" className="inline mr-1" />
                        {earning.customer.name} ({earning.customer.email})
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Total</p>
                        <p className="font-medium text-gray-900">₺{earning.amounts?.total?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Commission</p>
                        <p className="font-medium text-gray-900">₺{earning.amounts?.commission?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-green-600 text-xs">Net Earning</p>
                        <p className="font-semibold text-green-600">₺{earning.amounts?.netEarning?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon="solar:clock-circle-bold" className="text-xl text-primary-600" />
                Timeline
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Requested</p>
                  <p className="font-medium text-gray-900 text-sm">{new Date(data.timeline?.requestedAt).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">{new Date(data.timeline?.requestedAt).toLocaleTimeString()}</p>
                </div>
                {data.timeline?.expectedReleaseDate && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-1">Expected Release</p>
                    <p className="font-medium text-gray-900 text-sm">{new Date(data.timeline.expectedReleaseDate).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{new Date(data.timeline.expectedReleaseDate).toLocaleTimeString()}</p>
                  </div>
                )}
                {data.timeline?.processedAt && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-1">Processed</p>
                    <p className="font-medium text-gray-900 text-sm">{new Date(data.timeline.processedAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{new Date(data.timeline.processedAt).toLocaleTimeString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Impact */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon="solar:wallet-bold" className="text-xl text-primary-600" />
                Wallet Impact
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Locked:</span>
                  <span className="font-bold text-yellow-600">₺{data.walletImpact?.lockedAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Will Withdraw:</span>
                  <span className="font-bold text-blue-600">₺{data.walletImpact?.willBeWithdrawn?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 text-sm">Will Release:</span>
                  <span className="font-bold text-green-600">₺{data.walletImpact?.willBeReleased?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Admin Note */}
            {data.adminNote && (
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
                <h2 className="text-base font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Icon icon="solar:note-bold" className="text-lg" />
                  Admin Note
                </h2>
                <p className="text-sm text-blue-800">{data.adminNote}</p>
              </div>
            )}

            {/* Action Buttons */}
            {data.actions && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>
                <div className="space-y-3">
                  {data.actions.canApprove && (
                    <button
                      onClick={() => openActionModal("approve")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                    >
                      <Icon icon="solar:check-circle-bold" className="text-lg" />
                      Approve Request
                    </button>
                  )}
                  {data.actions.canReject && (
                    <button
                      onClick={() => openActionModal("reject")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                    >
                      <Icon icon="solar:close-circle-bold" className="text-lg" />
                      Reject Request
                    </button>
                  )}
                  {/* <button
                    onClick={() => openActionModal("process")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                  >
                    <Icon icon="solar:refresh-circle-bold" className="text-lg" />
                    Mark as Processing
                  </button> */}
                </div>
              </div>
            )}
          </div>
        </div>

        {showNoteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 capitalize flex items-center gap-2">
                <Icon icon="solar:note-bold" className="text-xl text-primary-600" />
                {actionType} Withdrawal Request
              </h3>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Note (Optional)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows="4"
                  placeholder="Add a note for this action..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(actionType, adminNote)}
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-sm"
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setAdminNote("");
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}