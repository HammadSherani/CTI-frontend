"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { CustomDropdown } from "./dropdown";
import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";
import axiosInstance from "@/config/axiosInstance";

const options = [
  { label: "This Week", value: "this_week" },
  { label: "Last Week", value: "last_week" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
];

// 🎯 Tooltip (light theme)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-primary-100 px-3 py-2 rounded-xl shadow-md">
        <p className="text-xs text-gray-500">{payload[0].payload.label || payload[0].payload.day}</p>
        <p className="text-sm font-semibold text-primary-600">
          ${payload[0].value.toLocaleString()}
        </p>
        {payload[0].payload.jobsCount !== undefined && (
          <p className="text-xs text-gray-500 mt-1">
            {payload[0].payload.jobsCount} job{payload[0].payload.jobsCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Loading Skeleton Component
const LoadingSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-primary-100 animate-pulse">
      {/* Header Skeleton */}
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

      {/* Chart Skeleton */}
      <div className="h-80 w-full relative">
        <div className="absolute inset-0 flex items-end justify-between px-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="w-12 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-gray-200 rounded-t-lg" 
                style={{ height: `${Math.random() * 150 + 50}px` }}
              ></div>
              <div className="h-3 w-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200"></div>
      </div>

      {/* Footer Skeleton */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex justify-between">
          <div className="flex gap-4">
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default function WeeklyEarningsChart() {
  const [selected, setSelected] = useState("this_week");
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useSelector(state => state.auth);
  const [weeklyEarnings, setWeeklyEarnings] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get('/repairman/dashboard/earnings-analytics', {
        params: { filter: selected },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setWeeklyEarnings(data);
      setIsLoading(false);
      console.log(data);
    } catch (error) {
      setIsLoading(false);
      console.log("Error fetching earnings analytics", error);
    }
  }

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, selected]);

  // Transform API data based on selected filter
  const getTransformedData = useMemo(() => {
    if (!weeklyEarnings?.data) {
      return [];
    }

    const apiData = weeklyEarnings.data;
    
    if (apiData.chartData && apiData.filter === selected) {
      return apiData.chartData.map(item => ({
        ...item,
        earnings: item.earnings || 0,
        jobsCount: item.jobsCount || 0,
      }));
    }

    return [];
  }, [weeklyEarnings, selected]);

  // Use transformed data
  const data = getTransformedData;
  
  // Calculate max value for highlighting
  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.earnings)) : 0;

  // Get summary data if available
  const summary = weeklyEarnings?.data?.summary || null;

  // Show loading skeleton
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-primary-100">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center">
            <Icon icon="mdi:chart-bar" className="text-2xl text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Earnings Analytics
            </h2>
            {summary && (
              <p className="text-xs text-gray-500 mt-0.5">
                {weeklyEarnings?.data?.period?.start} - {weeklyEarnings?.data?.period?.end}
              </p>
            )}
          </div>
        </div>

        <CustomDropdown
          options={options}
          value={selected}
          onChange={setSelected}
        />
      </div>

     

      {/* Chart - Always show chart structure even if data is empty */}
      <div className="h-80 w-full !-ml-9">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data.length > 0 ? data : [{ label: "No Data", earnings: 0 }]} 
            barCategoryGap={18}
            margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
          >
            {/* Grid lines - horizontal only */}
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#e5e7eb"
              horizontal={true}
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />

            {/* Y Axis */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickFormatter={(v) => {
                if (v >= 1000) return `$${v / 1000}k`;
                return `$${v}`;
              }}
              domain={[0, 'auto']}
            />

            {/* Tooltip - only shows on bars */}
            <Tooltip
              content={<CustomTooltip />}
              cursor={false}
              trigger="hover"
              wrapperStyle={{ pointerEvents: 'none' }}
            />

            <defs>
              <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF8A33" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#FFDDB5" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            {/* Bars */}
            <Bar 
              dataKey="earnings" 
              radius={[10, 10, 0, 0]}
              onMouseEnter={(e) => e.target.style.cursor = 'pointer'}
            >
              {data.length > 0 ? (
                data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.earnings === maxValue && maxValue > 0
                        ? "#FF6900" 
                        : "url(#orangeGradient)"
                    }
                  />
                ))
              ) : (
                <Cell fill="#e5e7eb" />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Empty state overlay */}
        {data.length === 0 && (
          <div className="relative -mt-80 h-80 w-full flex items-center justify-center pointer-events-none">
            <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg pointer-events-auto">
              <Icon icon="mdi:chart-line" className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No earnings data available</p>
              <p className="text-xs text-gray-400 mt-1">Select a different period or check back later</p>
            </div>
          </div>
        )}
      </div>

   
    </div>
  );
}