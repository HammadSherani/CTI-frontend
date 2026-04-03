"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
} from "recharts";
import { CustomDropdown } from "./dropdown";
import { useSelector } from "react-redux";
import axiosInstance from "@/config/axiosInstance";

const filterOptions = [
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "This Year", value: "this_year" },
  { label: "Last Year", value: "last_year" },
];

// Custom Tooltip for multiple lines
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Remove duplicate entries by filtering unique dataKeys
    const uniquePayload = [];
    const seenKeys = new Set();
    
    for (const item of payload) {
      if (!seenKeys.has(item.dataKey)) {
        seenKeys.add(item.dataKey);
        uniquePayload.push(item);
      }
    }
    
    return (
      <div className="bg-white border border-primary-100 rounded-xl shadow-lg px-3 py-2">
        <p className="text-xs font-semibold text-gray-700 mb-2">{label}</p>
        {uniquePayload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs mb-1">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-semibold" style={{ color: entry.color }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Loading Skeleton Component
const ChartSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-primary-100 flex flex-col w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-2xl"></div>
          <div>
            <div className="h-6 w-48 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="w-32 h-9 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Chart Area Skeleton */}
      <div className="w-full h-[380px] relative">
        {/* Grid lines simulation */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-gray-100"></div>
          ))}
        </div>
        
        {/* Chart bars simulation */}
        <div className="absolute inset-0 flex items-end justify-around px-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 w-8">
              <div className="w-6 bg-gray-200 rounded-t-lg" style={{ height: `${Math.random() * 150 + 50}px` }}></div>
              <div className="w-6 h-2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer"></div>
      </div>

      {/* Legend Skeleton */}
      <div className="mt-4 pt-3 border-t border-primary-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-gray-200 rounded-full"></div>
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-gray-200 rounded-full"></div>
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="h-3 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default function MonthlyPerformanceChart() {
  const [selectedFilter, setSelectedFilter] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const { token } = useSelector(state => state.auth);

  // Fetch offers data from backend
  const fetchOffersData = async () => {
    try {
      const response = await axiosInstance.get('/repairman/dashboard/offers-analytics', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      
      if (response.data.success) {
        // Transform backend data to chart format
        const transformedData = response.data.data.chartData.map(item => ({
          month: item.month,
          pending: item.pending,
          confirmed: item.confirmed,
        }));
        setChartData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching offers data:", error);
      setChartData([]);
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    setIsLoading(true);
    await fetchOffersData();
    setIsLoading(false);
  };

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token]);

  // Filter data based on selected option
  const getFilteredData = useMemo(() => {
    if (!chartData.length) return [];
    
    switch (selectedFilter) {
      case "quarterly": {
        const quarters = [
          { month: "Q1", months: ["Jan", "Feb", "Mar"] },
          { month: "Q2", months: ["Apr", "May", "Jun"] },
          { month: "Q3", months: ["Jul", "Aug", "Sep"] },
          { month: "Q4", months: ["Oct", "Nov", "Dec"] },
        ];
        
        return quarters.map(quarter => {
          const quarterData = chartData.filter(item => quarter.months.includes(item.month));
          const totalPending = quarterData.reduce((sum, item) => sum + item.pending, 0);
          const totalConfirmed = quarterData.reduce((sum, item) => sum + item.confirmed, 0);
          
          return {
            month: quarter.month,
            pending: totalPending,
            confirmed: totalConfirmed,
          };
        });
      }
      case "this_year":
        return chartData;
      case "last_year": {
        // Generate last year data with some variation (in a real app, fetch from API)
        return chartData.map(item => ({
          month: item.month,
          pending: Math.floor(item.pending * (0.7 + Math.random() * 0.3)),
          confirmed: Math.floor(item.confirmed * (0.7 + Math.random() * 0.3)),
        }));
      }
      default:
        return chartData;
    }
  }, [selectedFilter, chartData]);

  const getChartTitle = () => {
    switch (selectedFilter) {
      case "quarterly":
        return "Quarterly Offers Performance";
      case "this_year":
        return "This Year Offers Performance";
      case "last_year":
        return "Last Year Offers Performance";
      default:
        return "Monthly Offers Performance";
    }
  };

  // Show loading skeleton while fetching data
  if (isLoading) {
    return <ChartSkeleton />;
  }

  // Show empty state if no data
  if (!chartData.length && !isLoading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-primary-100 flex flex-col w-full">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Icon icon="mdi:chart-line" className="text-2xl text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {getChartTitle()}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Pending vs Confirmed Offers</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-[380px]">
          <Icon icon="mdi:chart-line" className="text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-center">No data available</p>
          <p className="text-gray-400 text-sm text-center mt-1">No offers found for this period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-primary-100 flex flex-col w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center">
            <Icon icon="mdi:chart-line" className="text-2xl text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {getChartTitle()}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Pending vs Confirmed Offers</p>
          </div>
        </div>

        <CustomDropdown
          options={filterOptions}
          value={selectedFilter}
          onChange={setSelectedFilter}
        />
      </div>

      {/* Chart Wrapper */}
      <div className="w-full h-[380px] overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={getFilteredData}
            margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
          >
            <defs>
              <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.25} />
                <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#FEF3C7" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="confirmedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="50%" stopColor="#10B981" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#D1FAE5" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#f3f4f6"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              allowDecimals={false}
              tickFormatter={(value) => `${value}`}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4' }}
              wrapperStyle={{ pointerEvents: 'auto' }}
            />

            {/* Area for Pending Offers - hide from legend */}
            <Area
              type="monotone"
              dataKey="pending"
              name="Pending Offers"
              stroke="none"
              fill="url(#pendingGradient)"
              legendType="none"
            />

            {/* Area for Confirmed Offers - hide from legend */}
            <Area
              type="monotone"
              dataKey="confirmed"
              name="Confirmed Offers"
              stroke="none"
              fill="url(#confirmedGradient)"
              legendType="none"
            />

            {/* Line for Pending Offers */}
            <Line
              type="monotone"
              dataKey="pending"
              name="Pending Offers"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ r: 4, fill: "#F59E0B", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#F59E0B", stroke: "#fff", strokeWidth: 2 }}
            />

            {/* Line for Confirmed Offers */}
            <Line
              type="monotone"
              dataKey="confirmed"
              name="Confirmed Offers"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4, fill: "#10B981", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#10B981", stroke: "#fff", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Footer */}
      {getFilteredData.length > 0 && (
        <div className="mt-4 pt-3 border-t border-primary-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">Pending Offers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Confirmed Offers</span>
              </div>
            </div>
            <div className="text-gray-500 text-xs">
              Total Pending: {getFilteredData.reduce((sum, item) => sum + item.pending, 0)} | 
              Total Confirmed: {getFilteredData.reduce((sum, item) => sum + item.confirmed, 0)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}