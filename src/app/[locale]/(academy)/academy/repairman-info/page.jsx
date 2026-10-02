"use client";

import React from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Icon } from "@iconify/react";

export default function RepairmanInfoPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <Breadcrumb />
          <h1 className="text-4xl font-bold mt-6 mb-4">Repairman Information Center</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Your guide to providing top-tier repair services on the CTI platform, managing repair requests, and building customer trust.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <Icon icon="mdi:account-hard-hat" className="w-12 h-12 text-blue-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Verification & Skills</h2>
            <p className="text-gray-600 leading-relaxed">
              All repairmen must pass a background check and verify their technical certifications. Your profile will display your expertise areas (e.g., Apple, Samsung, Motherboard).
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <Icon icon="mdi:tools" className="w-12 h-12 text-blue-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Genuine Parts Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We strictly enforce the use of OEM or high-grade aftermarket parts. Any repairman caught using sub-standard parts without customer consent will be banned from the platform.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <Icon icon="mdi:home-map-marker" className="w-12 h-12 text-blue-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Doorstep & Mail-in Repairs</h2>
            <p className="text-gray-600 leading-relaxed">
              You can choose to offer doorstep services (where you visit the customer) or mail-in services. Make sure your availability schedule is up to date in the dashboard.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <Icon icon="mdi:shield-check" className="w-12 h-12 text-blue-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Customer Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Respecting customer data is our highest priority. You must never access personal data on a device unless explicitly required for the repair and authorized by the customer.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
