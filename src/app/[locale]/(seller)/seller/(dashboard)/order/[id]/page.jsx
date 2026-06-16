"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import moment from "moment";
import { Icon } from "@iconify/react";

// Custom Dropdown Component
const CustomDropdown = ({ options, value, onChange, disabled, isLoading, icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="flex items-center gap-2">
          {isLoading && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
          {selectedOption?.label || "Select Status"}
        </span>
        <Icon icon={icon || "mdi:chevron-down"} className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                option.value === value ? "bg-primary-50 text-primary-700" : "text-gray-700"
              }`}
            >
              {option.value === value && <Icon icon="mdi:check" className="w-4 h-4" />}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function SellerOrderDetailsPage() {
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null);

  const STATUS_CONFIG = {
    PLACED: { label: "Placed", color: "bg-blue-100 text-blue-700", icon: "mdi:clock-outline" },
    CONFIRMED: { label: "Confirmed", color: "bg-indigo-100 text-indigo-700", icon: "mdi:check-circle-outline" },
    SHIPPED: { label: "Shipped", color: "bg-amber-100 text-amber-700", icon: "mdi:truck-delivery-outline" },
    DELIVERED: { label: "Delivered", color: "bg-emerald-100 text-emerald-700", icon: "mdi:package-check" },
    CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: "mdi:cancel" },
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(
        `/seller/orders/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Fetched order details:", data);
      setOrder(data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

 const updateOrderStatus = async (newStatus) => {
    if (!order) return;

    try {
      setUpdatingItem(true);
      const { data } = await axiosInstance.put(
        "/seller/orders/status", // You can change endpoint if you have separate order status API
        { 
          orderId: order._id, 
          orderStatus: newStatus   // Note: using orderStatus instead of itemStatus
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Order status updated successfully");
        await fetchOrder();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingItem(false);
    }
  };
  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10 min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-500">
          <Icon icon="mdi:loading" className="w-6 h-6 animate-spin" />
          <span>Loading order details...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-10 text-center text-red-500">
        <Icon icon="mdi:alert-circle-outline" className="w-12 h-12 mx-auto mb-3" />
        <p>Order not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
   <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span className="hover:text-primary-600 cursor-pointer">Orders</span>
              <Icon icon="mdi:chevron-right" className="w-3.5 h-3.5" />
              <span className="text-gray-600">Order #{order.orderNumber}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Icon icon="mdi:calendar-outline" className="w-4 h-4" />
              {moment(order.createdAt).format("DD MMM YYYY, hh:mm A")}
            </p>
          </div>

          {/* === ORDER STATUS DROPDOWN (Now Updatable) === */}
          <div className="flex items-center gap-3">
            <div className="w-40">
              <CustomDropdown
                options={[
                  { label: "Placed", value: "PLACED" },
                  { label: "Confirmed", value: "CONFIRMED" },
                  { label: "Shipped", value: "SHIPPED" },
                  { label: "Delivered", value: "DELIVERED" },
                  { label: "Cancelled", value: "CANCELLED" },
                ]}
                value={order.orderStatus}
                disabled={updatingItem || order.orderStatus === "DELIVERED" || order.orderStatus === "CANCELLED"}
                isLoading={updatingItem}
                onChange={updateOrderStatus}
              />
            </div>

            <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
              STATUS_CONFIG[order.orderStatus]?.color || "bg-gray-100 text-gray-700"
            }`}>
              <Icon icon={STATUS_CONFIG[order.orderStatus]?.icon || "mdi:circle"} className="w-4 h-4" />
              {STATUS_CONFIG[order.orderStatus]?.label || order.orderStatus}
            </div>
          </div>
        </div>
      </div>

      {/* ORDER SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Icon icon="mdi:shopping-outline" className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Items</p>
              <p className="text-lg font-bold">{order.items?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-xl">
              <Icon icon="mdi:currency-usd" className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="text-lg font-bold">${order.totalAmount?.toFixed(2) || "0.00"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Icon icon="mdi:credit-card-outline" className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Payment</p>
              <p className="text-sm font-semibold">{order.paymentMethod}</p>
              <p className={`text-xs font-medium ${
                order.paymentStatus === "PAID" ? "text-green-600" : "text-yellow-600"
              }`}>
                {order.paymentStatus}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER + SHIPPING */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <Icon icon="mdi:account-outline" className="w-5 h-5 text-primary-600" />
            Customer Information
          </h2>

          <div className="space-y-2">
            <p className="font-medium text-gray-800">
              {order.userId?.firstName} {order.userId?.lastName}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Icon icon="mdi:email-outline" className="w-4 h-4" />
              {order.userId?.email}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Icon icon="mdi:phone-outline" className="w-4 h-4" />
              {order.userId?.phone}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <Icon icon="mdi:map-marker-outline" className="w-5 h-5 text-primary-600" />
            Shipping Address
          </h2>

          <div className="space-y-1.5">
            <p className="font-medium text-gray-800">{order.shippingAddress?.fullName}</p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Icon icon="mdi:phone-outline" className="w-4 h-4" />
              {order.shippingAddress?.phone}
            </p>
            <p className="text-sm text-gray-600">
              {order.shippingAddress?.addressLine}
            </p>
            <p className="text-sm text-gray-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.area}
            </p>
          </div>
        </div>
      </div>

      {/* ORDER ITEMS */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="font-semibold mb-4 flex items-center gap-2 text-gray-800">
          <Icon icon="mdi:package-variant" className="w-5 h-5 text-primary-600" />
          Order Items ({order.items?.length || 0})
        </h2>

        <div className="divide-y divide-gray-100">
          {order.items?.map((item, idx) => {
            const isUpdating = updatingItem === `${order._id}-${item.productId?._id}`;
            
            return (
              <div
                key={idx}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={item.productId?.images?.[0]?.url}
                    alt={item.productId?.title}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/64x64?text=No+Image";
                    }}
                  />

                  <div>
                    <p className="font-medium text-gray-800">
                      {item.productId?.title}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                      <span>Qty: {item.quantity}</span>
                      <span>×</span>
                      <span>${item.price?.toFixed(2)}</span>
                    </p>

                    {item.variant && (
                      <div className="flex gap-2 mt-1">
                        {item.variant.color && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span 
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ backgroundColor: item.variant.colorHex || "#666" }}
                            />
                            {item.variant.color}
                          </span>
                        )}
                        {item.variant.size && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                            Size: {item.variant.size}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 w-full sm:w-auto min-w-[180px]">
                  <p className="font-bold text-gray-900">
                    ${(item.price * item.quantity)?.toFixed(2)}
                  </p>

              
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ORDER SUMMARY / BREAKDOWN */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="font-semibold mb-4 flex items-center gap-2 text-gray-800">
          <Icon icon="mdi:receipt-text-outline" className="w-5 h-5 text-primary-600" />
          Order Summary
        </h2>

        <div className="max-w-md ml-auto space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${order.subTotal?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping Fee</span>
            <span className="font-medium">${order.shippingFee?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary-600">${order.totalAmount?.toFixed(2) || "0.00"}</span>
          </div>
        </div>
      </div>

    </div>
  );
}