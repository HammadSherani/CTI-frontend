"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import SummaryCards from "@/components/partials/admin/ecom/SummaryCards";
import { summaryCardsData } from "@/components/seller/dashboard/mockData";

// Dynamically import chart components to avoid SSR issues with Recharts
const DashboardSummaryCards = dynamic(
  () => import("@/components/seller/dashboard/SummaryCards"),
  { ssr: false, loading: () => <SectionSkeleton height="h-32" /> }
);

const SalesAnalytics = dynamic(
  () => import("@/components/seller/dashboard/SalesAnalytics"),
  { ssr: false, loading: () => <SectionSkeleton height="h-96" /> }
);

const OrdersAnalytics = dynamic(
  () => import("@/components/seller/dashboard/OrdersAnalytics"),
  { ssr: false, loading: () => <SectionSkeleton height="h-96" /> }
);

const EarningsWallet = dynamic(
  () => import("@/components/seller/dashboard/EarningsWallet"),
  { ssr: false, loading: () => <SectionSkeleton height="h-96" /> }
);

const ProductAnalytics = dynamic(
  () => import("@/components/seller/dashboard/ProductAnalytics"),
  { ssr: false, loading: () => <SectionSkeleton height="h-96" /> }
);

const CustomerAnalytics = dynamic(
  () => import("@/components/seller/dashboard/CustomerAnalytics"),
  { ssr: false, loading: () => <SectionSkeleton height="h-96" /> }
);

const CalendarActivities = dynamic(
  () => import("@/components/seller/dashboard/CalendarActivities"),
  { ssr: false, loading: () => <SectionSkeleton height="h-96" /> }
);

// Loading skeleton placeholder
function SectionSkeleton({ height = "h-64" }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse ${height}`}>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-xl" />
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-1.5" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-5/6" />
          <div className="h-3 bg-gray-100 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
}

export default function SellerDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Monitor your store performance and analytics
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Icon icon="solar:clock-circle-bold-duotone" className="w-4 h-4 text-primary-500" />
            <span>Last updated: {new Date().toLocaleString("en-US", {
              month: "short", day: "numeric", year: "numeric",
              hour: "2-digit", minute: "2-digit"
            })}</span>
          </div>
        </div>

        {/* 1. Summary Cards */}
        <DashboardSummaryCards />

        {/* 2. Sales Analytics */}
        <SalesAnalytics />

        {/* 3. Orders Analytics */}
        <OrdersAnalytics />

        {/* 4. Earnings & Wallet */}
        <EarningsWallet />
   {/* 6. Customer Analytics */}
        <CustomerAnalytics />

        {/* 5. Product Analytics */}
        <ProductAnalytics />

     
        {/* 7. Calendar & Upcoming Activities */}
        <CalendarActivities />

        {/* Footer spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
}
