"use client"
import SummaryCards, { SummaryCardSkeleton } from '@/components/SumamryCards';
import React, { useState } from 'react'
import CustomBarChart from '@/components/WeeklyEarningsChart';
import BookingsTable from '@/components/BookingsTable';
import RecentOffers from '@/components/RecentOffers';
import MonthlyPerformanceChart from '@/components/MonthlyPerformanceChart';
import WeeklyEarningsChart from '@/components/WeeklyEarningsChart';
import JobDistributionChart from '@/components/JobDistributionChart';
export default function page() {
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const chartData = [
  { name: "Page A", uv: 4000, pv: 2400 },
  { name: "Page B", uv: 3000, pv: 1398 },
  { name: "Page C", uv: 2000, pv: 9800 },
  { name: "Page D", uv: 2780, pv: 3908 },
  { name: "Page E", uv: 1890, pv: 4800 },
  { name: "Page F", uv: 2390, pv: 3800 },
  { name: "Page G", uv: 3490, pv: 4300 },
];
    const summaryCards = [
        { label: 'Total Orders',    value: summaryData?.totalOrders || 0,              icon: 'mdi:clipboard-text-outline' },
        { label: 'Pending Orders',  value: summaryData?.pendingOrders || 0,            icon: 'mdi:progress-clock' },
        { label: 'Delivered Orders',value: summaryData?.deliveredOrders || 0,          icon: 'mdi:truck-delivery-outline' },
        { label: 'Total Amount',    value: `$${(summaryData?.totalAmount || 0).toLocaleString()}`, icon: 'mdi:cash-multiple' },
    ];
  return (
    <div className='p-4 bg-[#F8FAFB]' >
<div>
      {isLoading ? <SummaryCardSkeleton /> : <SummaryCards data={summaryCards} />}
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-8">
          <WeeklyEarningsChart />
        </div>
        <div className="lg:col-span-4">
          <JobDistributionChart />
        </div>
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-8">
          <BookingsTable />
        </div>
        <div className="lg:col-span-4">
          <RecentOffers />
        </div>
      </div>

      <div className="grid grid-cols-1">
        <MonthlyPerformanceChart />
      </div> */}
    </div>



  )
}
