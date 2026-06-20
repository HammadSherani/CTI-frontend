"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Image from "next/image";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useSelector((s) => s.auth);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Icon icon="mdi:loading" className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!order) return null;

  const sellerTotal = order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Order {order.orderNo || order.orderId}
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm font-bold text-gray-700">
          Status: <span className="text-primary-600 uppercase tracking-wide ml-1">{order.orderStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Items */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icon icon="mdi:package-variant-closed" className="w-5 h-5 text-gray-400" />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-20 h-20 bg-white rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden relative">
                    {item.productId?.images?.[0]?.url ? (
                      <Image src={item.productId.images[0].url} alt={item.productId.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <Icon icon="mdi:image-outline" className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{item.productId?.title}</h3>
                    <div className="text-xs text-gray-500 font-mono mt-1">Barcode: {item.productId?.barcode || "N/A"}</div>
                    
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="text-sm font-medium text-gray-600">Qty: {item.quantity}</div>
                      <div className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="font-semibold text-gray-600">Total (Your Items)</span>
              <span className="text-xl font-extrabold text-emerald-600">${sellerTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Shipping */}
        <div className="flex flex-col gap-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icon icon="mdi:account-outline" className="w-5 h-5 text-gray-400" />
              Customer Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs font-semibold uppercase">Name</span>
                <span className="font-medium text-gray-900">
                  {order.shippingAddress?.fullName || `${order.userId?.firstName || ""} ${order.userId?.lastName || ""}`.trim() || "Guest"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs font-semibold uppercase">Email</span>
                <span className="font-medium text-gray-900">{order.userId?.email || "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs font-semibold uppercase">Phone</span>
                <span className="font-medium text-gray-900">{order.shippingAddress?.phone || order.userId?.phone || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icon icon="mdi:map-marker-outline" className="w-5 h-5 text-gray-400" />
              Shipping Address
            </h2>
            {order.shippingAddress ? (
              <div className="text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold block mb-1">{order.shippingAddress.fullName}</span>
                {order.shippingAddress.addressLine}<br />
                {order.shippingAddress.area}, {order.shippingAddress.city}<br />
                Phone: {order.shippingAddress.phone}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No shipping address provided.</p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}