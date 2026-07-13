"use client";
import React from 'react';
import { Icon } from '@iconify/react';

function StatCard({ title, value, icon, colorClass, bgColorClass }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${bgColorClass} ${colorClass}`}>
        <Icon icon={icon} />
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardStats({ data }) {
  if (!data) return null;

  const users = data.users || {};
  const jobs = data.jobs || {};
  const bookings = data.bookings || {};
  const earnings = data.earnings || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Total Customers" 
        value={users.customers?.total || 0} 
        icon="ph:users-duotone" 
        colorClass="text-blue-600"
        bgColorClass="bg-blue-50"
      />
      <StatCard 
        title="Total Repairmen" 
        value={users.repairmen?.total || 0} 
        icon="ph:wrench-duotone" 
        colorClass="text-emerald-600"
        bgColorClass="bg-emerald-50"
      />
      <StatCard 
        title="Total Sellers" 
        value={users.sellers?.total || 0} 
        icon="ph:storefront-duotone" 
        colorClass="text-violet-600"
        bgColorClass="bg-violet-50"
      />
      <StatCard 
        title="Total Revenue" 
        value={`$${(earnings.total?.earnings || 0).toLocaleString()}`} 
        icon="ph:currency-dollar-duotone" 
        colorClass="text-amber-600"
        bgColorClass="bg-amber-50"
      />
      
      <StatCard 
        title="Total Jobs" 
        value={jobs.total || 0} 
        icon="ph:briefcase-duotone" 
        colorClass="text-indigo-600"
        bgColorClass="bg-indigo-50"
      />
      <StatCard 
        title="Pending Bookings" 
        value={bookings.pending || 0} 
        icon="ph:calendar-blank-duotone" 
        colorClass="text-orange-600"
        bgColorClass="bg-orange-50"
      />
      <StatCard 
        title="Active Jobs" 
        value={jobs.in_progress || 0} 
        icon="ph:activity-duotone" 
        colorClass="text-rose-600"
        bgColorClass="bg-rose-50"
      />
      <StatCard 
        title="Net Earnings" 
        value={`$${(earnings.total?.netEarnings || 0).toLocaleString()}`} 
        icon="ph:wallet-duotone" 
        colorClass="text-cyan-600"
        bgColorClass="bg-cyan-50"
      />
    </div>
  );
}
