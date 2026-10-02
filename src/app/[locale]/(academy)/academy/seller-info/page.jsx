"use client";

import React from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Icon } from "@iconify/react";

export default function SellerInfoPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-orange-500 to-orange-700 text-white py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <Breadcrumb />
          <h1 className="text-4xl font-bold mt-6 mb-4">Seller Information Center</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Everything you need to know about selling devices on CTI, managing your inventory, and reaching millions of customers.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <Icon icon="mdi:check-decagram" className="w-12 h-12 text-orange-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Onboarding Process</h2>
            <p className="text-gray-600 leading-relaxed">
              To become a verified seller, you must complete the KYC process. Upload your business details, ID proof, and bank information. Once approved, you can start listing products.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <Icon icon="mdi:shield-star" className="w-12 h-12 text-orange-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Quality Standards</h2>
            <p className="text-gray-600 leading-relaxed">
              Every refurbished phone must undergo a 32-point inspection. You must accurately declare battery health, screen condition, and any minor scratches.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <Icon icon="mdi:truck-fast" className="w-12 h-12 text-orange-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Fulfillment & Shipping</h2>
            <p className="text-gray-600 leading-relaxed">
              When an order is placed, you must ship the item within 48 hours. Use CTI's integrated logistics partners to ensure safe and trackable deliveries.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <Icon icon="mdi:cash-multiple" className="w-12 h-12 text-orange-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Payments & Fees</h2>
            <p className="text-gray-600 leading-relaxed">
              Payments are disbursed to your registered bank account weekly. CTI charges a nominal platform fee per successful sale. Check the dashboard for detailed breakdowns.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
