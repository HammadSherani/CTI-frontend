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

export default function EcomStats({ data }) {
  if (!data || !data.stats) return null;

  const { stats } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Total Products" 
        value={stats.totalProducts || 0} 
        icon="ph:package-duotone" 
        colorClass="text-blue-600"
        bgColorClass="bg-blue-50"
      />
      <StatCard 
        title="Total Orders" 
        value={stats.totalOrders || 0} 
        icon="ph:shopping-cart-duotone" 
        colorClass="text-emerald-600"
        bgColorClass="bg-emerald-50"
      />
      <StatCard 
        title="Active Sellers" 
        value={stats.totalSellers || 0} 
        icon="ph:storefront-duotone" 
        colorClass="text-violet-600"
        bgColorClass="bg-violet-50"
      />
      <StatCard 
        title="E-commerce Revenue" 
        value={`$${(stats.totalRevenue || 0).toLocaleString()}`} 
        icon="ph:currency-circle-dollar-duotone" 
        colorClass="text-amber-600"
        bgColorClass="bg-amber-50"
      />
    </div>
  );
}
