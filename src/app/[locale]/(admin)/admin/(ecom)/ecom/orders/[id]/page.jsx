"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Image from "next/image";
import moment from "moment";

const STATUS_CONFIG = {
  pending:    { label: "Pending",    bg: "bg-blue-100",    text: "text-blue-700",    icon: "mdi:clock-outline" },
  processing: { label: "Processing", bg: "bg-indigo-100",  text: "text-indigo-700",  icon: "mdi:cogs" },
  shipped:    { label: "Shipped",    bg: "bg-amber-100",   text: "text-amber-700",   icon: "mdi:truck-delivery-outline" },
  delivered:  { label: "Delivered",  bg: "bg-emerald-100", text: "text-emerald-700", icon: "mdi:package-check" },
  on_hold:    { label: "On Hold",    bg: "bg-orange-100",  text: "text-orange-700",  icon: "mdi:pause-circle-outline" },
  cancelled:  { label: "Cancelled",  bg: "bg-red-100",     text: "text-red-700",     icon: "mdi:cancel" },
};

const PAYMENT_CONFIG = {
  PAID:    { label: "Paid",    bg: "bg-emerald-100", text: "text-emerald-700" },
  PENDING: { label: "Pending", bg: "bg-yellow-100",  text: "text-yellow-700" },
  FAILED:  { label: "Failed",  bg: "bg-red-100",     text: "text-red-700" },
};

const CANCELLED_BY_LABEL = {
  admin:  "Admin",
  seller: "Seller",
  user:   "Customer",
};

const ALLOWED_TRANSITIONS = {
  pending:    ["processing", "on_hold", "cancelled"],
  processing: ["shipped", "on_hold", "cancelled"],
  shipped:    ["delivered", "on_hold", "cancelled"],
  on_hold:    ["processing", "cancelled"],
  delivered:  [],
  cancelled:  [],
};

const STATUS_LABELS = {
  pending: "Pending", processing: "Processing", shipped: "Shipped",
  delivered: "Delivered", on_hold: "On Hold", cancelled: "Cancelled",
};

function InfoRow({ label, value, mono = false, icon }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
        {icon && <Icon icon={icon} className="w-3 h-3" />}
        {label}
      </span>
      <span className={`text-sm font-semibold text-gray-800 break-all ${mono ? "font-mono" : ""}`}>
        {value || <span className="text-gray-400 font-normal italic">N/A</span>}
      </span>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useSelector((s) => s.auth);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Cancel modal state
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const fetchOrder = useCallback(async () => {
    if (!token || !id) return;
    try {
      const { data } = await axiosInstance.get(`/admin/e-commerce/order/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load order");
      router.push("/admin/ecom/orders");
    } finally {
      setLoading(false);
    }
  }, [id, token, router]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = async (newStatus, reason = "") => {
    setStatusUpdating(true);
    try {
      await axiosInstance.put(
        `/admin/e-commerce/order/${id}/status`,
        { status: newStatus, cancelReason: reason || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Order status updated to "${STATUS_LABELS[newStatus] || newStatus}"`);
      setCancelModal(false);
      setCancelReason("");
      fetchOrder();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus === "cancelled") {
      setCancelModal(true);
    } else {
      updateStatus(newStatus);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="mdi:loading" className="w-10 h-10 animate-spin text-primary-500" />
          <p className="text-sm text-gray-400">Loading order details…</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statusConf = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
  const payConf = PAYMENT_CONFIG[order.paymentStatus] || PAYMENT_CONFIG.PENDING;
  const nextStatuses = ALLOWED_TRANSITIONS[order.orderStatus] || [];
  const canChange = nextStatuses.length > 0;

  const totalPlatformFee = order.items?.reduce((a, i) => a + (i.platformFee || 0), 0) || 0;
  const totalSellerEarnings = order.items?.reduce((a, i) => a + (i.sellerEarnings || 0), 0) || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">

      {/* Cancel Reason Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:cancel" className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Cancel Order</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  This will cancel the order and record it as cancelled by Admin. Seller earnings will be reversed.
                </p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Cancel Reason <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="e.g. Customer requested cancellation, item out of stock..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setCancelModal(false); setCancelReason(""); }}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => updateStatus("cancelled", cancelReason)}
                disabled={statusUpdating}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {statusUpdating && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 mt-1 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Order Details</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-sm font-mono font-bold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-lg border border-primary-100">
                {order.orderId}
              </span>
              {order.orderNo && (
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                  {order.orderNo}
                </span>
              )}
              <span className="text-xs text-gray-400">
                {moment(order.createdAt).format("DD MMM YYYY [at] hh:mm A")}
              </span>
            </div>
          </div>
        </div>

        {/* Status + Change */}
        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusConf.bg} ${statusConf.text}`}>
            <Icon icon={statusConf.icon} className="w-3.5 h-3.5" />
            {statusConf.label}
            {order.cancelledBy && (
              <span className="ml-1 opacity-70">· {CANCELLED_BY_LABEL[order.cancelledBy] || order.cancelledBy}</span>
            )}
          </div>
          {canChange && (
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
              <Icon icon="mdi:swap-horizontal" className="w-4 h-4 text-gray-400" />
              <select
                disabled={statusUpdating}
                defaultValue=""
                onChange={(e) => { if (e.target.value) handleStatusChange(e.target.value); }}
                className="text-sm font-semibold text-gray-700 focus:outline-none bg-transparent pr-1 disabled:opacity-50"
              >
                <option value="">Change status…</option>
                {nextStatuses.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              {statusUpdating && (
                <Icon icon="mdi:loading" className="w-4 h-4 animate-spin text-primary-500" />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT: Items + Financial Summary */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Icon icon="mdi:package-variant-closed" className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">
                Order Items
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({order.items?.length} item{order.items?.length !== 1 ? "s" : ""})
                </span>
              </h2>
            </div>

            <div className="divide-y divide-gray-50">
              {order.items?.map((item, idx) => {
                const product = item.productId || {};
                const imageUrl = product.images?.[0]?.url;
                return (
                  <div key={idx} className="p-5 flex gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="w-20 h-20 flex-shrink-0 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden relative">
                      {imageUrl ? (
                        <Image src={imageUrl} alt={product.title || "Product"} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Icon icon="mdi:image-outline" className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">
                        {product.title || "Unknown Product"}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.variant?.color && (
                          <span className="text-xs bg-primary-50 text-primary-700 border border-primary-100 px-2 py-0.5 rounded-lg font-semibold">
                            {item.variant.color}
                          </span>
                        )}
                        {product.barcode && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-mono">
                            {product.barcode}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Unit Price</p>
                          <p className="text-sm font-bold text-gray-800">${(item.price || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Qty</p>
                          <p className="text-sm font-bold text-gray-800">× {item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-amber-500 uppercase font-bold">Platform Fee</p>
                          <p className="text-sm font-bold text-amber-600">+${(item.platformFee || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-emerald-600 uppercase font-bold">Seller Earnings</p>
                          <p className="text-sm font-bold text-emerald-700">${(item.sellerEarnings || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right self-start">
                      <p className="text-xs text-gray-400 mb-0.5">Total</p>
                      <p className="text-base font-extrabold text-gray-900">
                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block ${STATUS_CONFIG[item.itemStatus]?.bg || "bg-gray-100"} ${STATUS_CONFIG[item.itemStatus]?.text || "text-gray-500"}`}>
                        {item.itemStatus || "pending"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Icon icon="mdi:receipt-text-outline" className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">Financial Summary</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Icon icon="mdi:cart-outline" className="w-4 h-4" />
                  Subtotal
                </span>
                <span className="font-semibold text-gray-800">${(order.subTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Icon icon="mdi:truck-outline" className="w-4 h-4" />
                  Shipping
                </span>
                <span className="font-semibold text-gray-800">${(order.shippingFee || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                <span className="font-bold text-gray-700">Order Total</span>
                <span className="font-extrabold text-gray-900">${(order.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                  <Icon icon="mdi:percent" className="w-4 h-4" />
                  Platform Fees (collected)
                </span>
                <span className="font-extrabold text-amber-700">+${totalPlatformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <Icon icon="mdi:wallet-outline" className="w-4 h-4" />
                  Seller Earnings
                </span>
                <span className="font-extrabold text-emerald-700">${totalSellerEarnings.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Meta, Customer, Shipping, Payment */}
        <div className="flex flex-col gap-6">

          {/* Order Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="mdi:identifier" className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">Order Info</h2>
            </div>
            <div className="space-y-3">
              <InfoRow label="Order ID" value={order.orderId} mono icon="mdi:tag-outline" />
              <InfoRow label="Order No" value={order.orderNo} mono icon="mdi:pound" />
              <InfoRow label="Internal ID" value={order._id} mono icon="mdi:database-outline" />
              <InfoRow label="Placed On" value={moment(order.createdAt).format("DD MMM YYYY, hh:mm A")} icon="mdi:calendar-outline" />
              {order.completionDate && (
                <InfoRow label="Completed On" value={moment(order.completionDate).format("DD MMM YYYY")} icon="mdi:calendar-check-outline" />
              )}
              {order.cancelReason && (
                <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-xs font-bold text-red-600 mb-1">Cancel Reason</p>
                  <p className="text-xs text-red-700">{order.cancelReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="mdi:credit-card-outline" className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">Payment</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-gray-400">Status</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${payConf.bg} ${payConf.text}`}>
                  {payConf.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-gray-400">Method</span>
                <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <Icon icon={order.paymentMethod === "CARD" ? "mdi:credit-card-outline" : "mdi:cash"} className="w-4 h-4 text-gray-500" />
                  {order.paymentMethod}
                </span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="mdi:account-outline" className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">Customer</h2>
            </div>
            <div className="space-y-3">
              <InfoRow
                label="Name"
                value={
                  order.shippingAddress?.fullName ||
                  `${order.userId?.firstName || ""} ${order.userId?.lastName || ""}`.trim() ||
                  "Guest"
                }
                icon="mdi:account-circle-outline"
              />
              <InfoRow label="Email" value={order.userId?.email} icon="mdi:email-outline" />
              <InfoRow label="Phone" value={order.shippingAddress?.phone || order.userId?.phone} icon="mdi:phone-outline" />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="mdi:map-marker-outline" className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">Shipping Address</h2>
            </div>
            {order.shippingAddress ? (
              <div className="space-y-2 text-sm">
                <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
                <p className="text-gray-600 flex items-start gap-1.5">
                  <Icon icon="mdi:home-outline" className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  {order.shippingAddress.addressLine}
                </p>
                <p className="text-gray-600 flex items-center gap-1.5">
                  <Icon icon="mdi:city-variant-outline" className="w-4 h-4 text-gray-400" />
                  {[order.shippingAddress.area, order.shippingAddress.city].filter(Boolean).join(", ")}
                </p>
                <p className="text-gray-600 flex items-center gap-1.5 pt-1 border-t border-gray-100">
                  <Icon icon="mdi:phone-outline" className="w-4 h-4 text-gray-400" />
                  {order.shippingAddress.phone}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No shipping address provided.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
