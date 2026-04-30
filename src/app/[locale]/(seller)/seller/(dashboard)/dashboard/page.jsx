"use client";
import SummaryCards, { SummaryCardSkeleton } from '@/components/SumamryCards';
import React, { useEffect, useState } from 'react';
import WeeklyEarningsChart from '@/components/WeeklyEarningsChart';
import BookingsTable from '@/components/BookingsTable';
import RecentOffers from '@/components/RecentOffers';
import MonthlyPerformanceChart from '@/components/MonthlyPerformanceChart';
import JobDistributionChart from '@/components/JobDistributionChart';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { Icon } from '@iconify/react';

// Loading Skeleton Components
const ChartSkeleton = ({ height = "h-96" }) => (
  <div className={`bg-white rounded-3xl p-6 shadow-sm border border-primary-100 animate-pulse ${height}`}>
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-2xl"></div>
        <div>
          <div className="h-6 w-48 bg-gray-200 rounded-lg mb-1"></div>
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="w-32 h-10 bg-gray-200 rounded-xl"></div>
    </div>
    <div className="flex-1 flex items-end justify-between gap-2 px-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex-1 h-full">
          <div className="w-full bg-gray-200 rounded-t-lg" style={{ height: `${Math.random() * 150 + 50}px` }}></div>
        </div>
      ))}
    </div>
  </div>
);

const TableSkeleton = () => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-primary-100 animate-pulse h-96">
    <div className="flex justify-between items-center mb-6">
      <div className="h-6 w-32 bg-gray-200 rounded"></div>
      <div className="h-10 w-24 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-12 bg-gray-100 rounded-lg"></div>
      ))}
    </div>
  </div>
);

const CalendarSkeleton = () => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-primary-100 animate-pulse h-96">
    <div className="flex justify-between items-center mb-4">
      <div className="h-6 w-32 bg-gray-200 rounded"></div>
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="grid grid-cols-7 gap-2">
      {[...Array(35)].map((_, i) => (
        <div key={i} className="h-10 bg-gray-100 rounded"></div>
      ))}
    </div>
  </div>
);

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState({
    weekly: true,
    distribution: true,
    monthly: true,
    table: true,
    calendar: true
  });
  const [summaryData, setSummaryData] = useState(null);
  const [latestBookings, setLatestBookings] = useState([]);
  const { token } = useSelector(state => state.auth);

  const summaryCards = [
    { label: 'Total Jobs', value: summaryData?.totalJobs || 0, icon: 'mdi:clipboard-text-outline' },
    { label: 'Delivered Jobs', value: summaryData?.completedJobs || 0, icon: 'mdi:truck-delivery-outline' },
    { label: 'Active Jobs', value: summaryData?.activeJobs || 0, icon: 'mdi:progress-clock' },
    { label: 'Total Amount', value: `$${(summaryData?.totalEarnings || 0).toLocaleString()}`, icon: 'mdi:cash-multiple' },
  ];

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get('/repairman/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummaryData(data.data.summary);
      setLatestBookings(data.data.latestBookings);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  return (
    <div className="p-6 bg-[#F8FAFB] min-h-screen">
      {/* Summary Cards */}
      <div className="mb-8">
        {isLoading ? <SummaryCardSkeleton /> : <SummaryCards data={summaryCards} />}
      </div>

      {/* First Row: Charts - Equal Height (h-96) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-8">
          <WeeklyEarningsChart />
        </div>
        <div className="lg:col-span-4">
          <JobDistributionChart />
        </div>
      </div>

      {/* Second Row: Table + Calendar - Equal Height (h-96) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-7 xl:col-span-8">
          <BookingsTable data={latestBookings} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <RecentOffers />
        </div>
      </div>

      {/* Third Row: Full Width Chart */}
      <div className="grid grid-cols-1 gap-6">
        <MonthlyPerformanceChart />
      </div>
    </div>
  );
}