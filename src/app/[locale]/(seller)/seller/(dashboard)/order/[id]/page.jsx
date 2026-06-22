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
  pending:    { label: "Pending",    bg: "bg-blue-100",   text: "text-blue-700",   icon: "mdi:clock-outline" },
  processing: { label: "Processing", bg: "bg-indigo-100", text: "text-indigo-700", icon: "mdi:cogs" },
  shipped:    { label: "Shipped",    bg: "bg-amber-100",  text: "text-amber-700",  icon: "mdi:truck-delivery-outline" },
  delivered:  { label: "Delivered",  bg: "bg-emerald-100",text: "text-emerald-700",icon: "mdi:package-check" },
  on_hold:    { label: "On Hold",    bg: "bg-orange-100", text: "text-orange-700", icon: "mdi:pause-circle-outline" },
  cancelled:  { label: "Cancelled",  bg: "bg-red-100",    text: "text-red-700",    icon: "mdi:cancel" },
};

const PAYMENT_CONFIG = {
  PAID:    { label: "Paid",    bg: "bg-emerald-100", text: "text-emerald-700" },
  PENDING: { label: "Pending", bg: "bg-yellow-100",  text: "text-yellow-700" },
  FAILED:  { label: "Failed",  bg: "bg-red-100",     text: "text-red-700" },
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

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useSelector((s) => s.auth);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    if (!token || !id) return;
    try {
      const res = await axiosInstance.get(`/seller/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(res.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load order details");
      router.push("/seller/order");
    } finally {
      setLoading(false);
    }
  }, [id, token, router]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const updateStatus = async (newStatus) => {
    setStatusUpdateLoading(true);
    try {
      await axiosInstance.put('/seller/orders/status', {
        orderId: order._id,
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Order status updated");
      fetchOrderDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdateLoading(false);
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

  const totalSellerEarnings = order.items?.reduce((a, i) => a + (i.sellerEarnings || 0), 0) || 0;
  const totalPlatformFee   = order.items?.reduce((a, i) => a + (i.platformFee || 0), 0) || 0;
  const canChangeStatus = !["delivered","cancelled"].includes(order.orderStatus);

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">

      {/* ── Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 mt-1 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Order Details
            </h1>
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

        {/* Status Dropdown */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusConf.bg} ${statusConf.text}`}>
            <Icon icon={statusConf.icon} className="w-3.5 h-3.5" />
            {statusConf.label}
          </div>
          {canChangeStatus && (
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
              <Icon icon="mdi:swap-horizontal" className="w-4 h-4 text-gray-400" />
              <select
                disabled={statusUpdateLoading}
                value={order.orderStatus}
                onChange={(e) => updateStatus(e.target.value)}
                className="text-sm font-semibold text-gray-700 focus:outline-none bg-transparent pr-1 disabled:opacity-50"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {statusUpdateLoading && (
                <Icon icon="mdi:loading" className="w-4 h-4 animate-spin text-primary-500" />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── LEFT: Items + Financial Summary ── */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Icon icon="mdi:package-variant-closed" className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">
                Order Items
                <span className="ml-2 text-sm font-normal text-gray-400">({order.items?.length} item{order.items?.length !== 1 ? "s" : ""})</span>
              </h2>
            </div>

            <div className="divide-y divide-gray-50">
              {order.items?.map((item, idx) => {
                const product = item.productId || {};
                const imageUrl = product.images?.[0]?.url;
                const variantLabel = item.variant?.color || "Default Variant";

                return (
                  <div key={idx} className="p-5 flex gap-4 hover:bg-gray-50/50 transition-colors">
                    {/* Product Image */}
                    <div className="w-20 h-20 flex-shrink-0 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden relative">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.title || "Product"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Icon icon="mdi:image-outline" className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 text-sm mb-1">
                        {product.title || "Unknown Product"}
                      </h3>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {/* Variant badge */}
                        <span className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 border border-primary-100 px-2 py-0.5 rounded-lg font-semibold">
                          <Icon icon="mdi:palette-outline" className="w-3 h-3" />
                          {variantLabel}
                        </span>
                        {/* Barcode */}
                        {product.barcode && (
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-mono">
                            <Icon icon="mdi:barcode" className="w-3 h-3" />
                            {product.barcode}
                          </span>
                        )}
                        {/* Slug */}
                        {product.slug && (
                          <span className="text-[11px] text-gray-400 font-mono truncate max-w-[200px]">
                            /{product.slug}
                          </span>
                        )}
                      </div>

                      {/* Variants available */}
                      {product.variants?.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1">
                          {product.variants.slice(0, 4).map((v, vi) => (
                            <span key={vi} className="text-[10px] bg-gray-50 border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-md">
                              {v.title}
                            </span>
                          ))}
                          {product.variants.length > 4 && (
                            <span className="text-[10px] text-gray-400">+{product.variants.length - 4} more</span>
                          )}
                        </div>
                      )}

                      {/* Pricing row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 p-2.5 bg-gray-50 rounded-xl">
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
                          <p className="text-sm font-bold text-amber-600">-${(item.platformFee || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-emerald-600 uppercase font-bold">Your Earnings</p>
                          <p className="text-sm font-bold text-emerald-700">${(item.sellerEarnings || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
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
                  Subtotal (customer paid)
                </span>
                <span className="font-semibold text-gray-800">${(order.subTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Icon icon="mdi:truck-outline" className="w-4 h-4" />
                  Shipping Fee
                </span>
                <span className="font-semibold text-gray-800">${(order.shippingFee || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                <span className="font-bold text-gray-700 flex items-center gap-1.5">
                  <Icon icon="mdi:sigma" className="w-4 h-4" />
                  Order Total
                </span>
                <span className="font-extrabold text-gray-900">${(order.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                  <Icon icon="mdi:percent" className="w-4 h-4" />
                  Platform Fee (deducted)
                </span>
                <span className="font-extrabold text-amber-700">-${totalPlatformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                  <Icon icon="mdi:wallet-outline" className="w-4 h-4" />
                  Your Earnings
                </span>
                <span className="text-xl font-extrabold text-emerald-700">${totalSellerEarnings.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Order Meta, Customer, Shipping, Payment ── */}
        <div className="flex flex-col gap-6">

          {/* Order Identifiers */}
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
            </div>
          </div>

          {/* Payment Info */}
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

          {/* Customer Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="mdi:account-outline" className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">Customer</h2>
            </div>
            <div className="space-y-3">
              <InfoRow
                label="Name"
                value={order.shippingAddress?.fullName || `${order.userId?.firstName || ""} ${order.userId?.lastName || ""}`.trim() || "Guest"}
                icon="mdi:account-circle-outline"
              />
              <InfoRow label="Email" value={order.userId?.email} icon="mdi:email-outline" />
              <InfoRow
                label="Phone"
                value={order.shippingAddress?.phone || order.userId?.phone}
                icon="mdi:phone-outline"
              />
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
                {order.shippingAddress.postalCode && (
                  <p className="text-gray-500 text-xs font-mono">
                    Postal: {order.shippingAddress.postalCode}
                  </p>
                )}
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