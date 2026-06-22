"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "@/config/axiosInstance";
import handleError from "@/helper/handleError";
import { Icon } from "@iconify/react";

function SellerWalletPage() {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);

  const { token } = useSelector((state) => state.auth);

  const fetchWallet = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/seller/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.success) {
        setData(response.data.data);
      } else {
        toast.warn("Failed to load wallet data.");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Icon icon="svg-spinners:180-ring-with-bg" className="text-5xl text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
            <p className="text-gray-600 mt-1">Overview of your shop earnings and available balance</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <Icon icon="solar:wallet-money-bold" className="text-8xl text-primary-600" />
            </div>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shadow-inner">
                <Icon icon="solar:wallet-money-bold" className="text-2xl text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Available Balance</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-0.5">
                   Rs. {data?.balance?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
               <Icon icon="solar:chart-2-bold" className="text-8xl text-emerald-600" />
            </div>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shadow-inner">
                <Icon icon="solar:chart-2-bold" className="text-2xl text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Earnings</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-0.5">
                   Rs. {data?.totalEarnings?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 text-blue-800 rounded-2xl p-5 border border-blue-100 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
             <Icon icon="mdi:information-variant" className="text-2xl text-blue-600" />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-1">How earnings work</h4>
            <p className="text-sm opacity-90 leading-relaxed">
              When a customer purchases a product, the base price is instantly credited to your Total Earnings and Available Balance.
              The 10% platform fee is automatically deducted and sent to the platform administrators. 
              Currently, withdrawals are processed automatically at the end of the billing cycle.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SellerWalletPage;
