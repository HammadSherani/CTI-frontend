"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CustomDropdown } from "./dropdown";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useSelector } from "react-redux";
import axiosInstance from "@/config/axiosInstance";

// 🎨 COLORS
const COLORS = ["#ffc46d", "#ff9f32", "#ff820a", "#ff6900"];

const options = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "Last Week", value: "last_week" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
];

// 🎯 Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-primary-100 px-3 py-2 rounded-xl shadow-md">
        <p className="text-xs text-gray-500">{payload[0].name}</p>
        <p className="text-sm font-semibold text-primary-600">
          {payload[0].value}%
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Count: {payload[0].payload.count}
        </p>
      </div>
    );
  }
  return null;
};

// 🔥 CUSTOM LABEL (INSIDE SLICE)
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;

  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: 12, fontWeight: 600 }}
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-primary-100 h-full animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-200 rounded-2xl"></div>
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="w-32 h-10 bg-gray-200 rounded-xl"></div>
      </div>

      <div className="h-96 flex items-center -mt-14 justify-center">
        <div className="w-64 h-64 rounded-full bg-gray-200"></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 -mt-9 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
            <div className="h-3 w-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const JobDistributionChart = () => {
  const [selected, setSelected] = useState("last_month");
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useSelector(state => state.auth);
  const [jobDistribution, setJobDistribution] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get('/repairman/dashboard/job-distribution', {
        params: { filter: selected },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setJobDistribution(data);
      setIsLoading(false);
      console.log(data);
    } catch (error) {
      setIsLoading(false);
      console.log("Error fetching job distribution", error);
    }
  }

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, selected]);

  // Transform API data for chart
  const chartData = useMemo(() => {
    if (!jobDistribution?.data?.distribution) {
      // Return default data structure with zeros to show graph
      return [
        { name: "Confirmed", value: 0, count: 0 },
        { name: "In Progress", value: 0, count: 0 },
        { name: "Scheduled", value: 0, count: 0 },
        { name: "Pending", value: 0, count: 0 },
      ];
    }

    // If all values are zero, still show the structure
    const distribution = jobDistribution.data.distribution;
    const hasData = distribution.some(item => item.value > 0 || item.count > 0);
    
    if (!hasData) {
      return distribution.map(item => ({
        name: item.name,
        value: 0,
        count: 0
      }));
    }

    return distribution.map(item => ({
      name: item.name,
      value: item.value,
      count: item.count
    }));
  }, [jobDistribution]);

  // Use chart data (always has data structure)
  const data = chartData;

  // Get total bookings
  const totalBookings = jobDistribution?.data?.totalBookings || 0;

  // Check if all values are zero
  const allValuesZero = data.every(item => item.value === 0);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="bg-white rounded-3xl  shadow-sm border border-primary-100 ">
      
      {/* Header */}
      <div className="flex justify-between p-4 items-center ">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Icon icon="mdi:chart-pie" className="text-primary-600 text-xl" />
            </div>
            Job Distribution
          </h2>
          {totalBookings > 0 && (
            <p className="text-xs text-gray-500 mt-1 ml-12">
              Total Bookings: {totalBookings}
            </p>
          )}
        </div>

        <CustomDropdown
          options={options}
          value={selected}
          onChange={setSelected}
        />
      </div>

      {/* Chart - Always show the chart */}
      <div className="h-96 flex items-center -mt-8 justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={140}
              dataKey="value"
              label={!allValuesZero ? renderCustomLabel : undefined}
              labelLine={false}
              animationDuration={700}
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={allValuesZero ? "#e5e7eb" : COLORS[index % COLORS.length]}
                  opacity={allValuesZero ? 0.3 : 1}
                />
              ))}
            </Pie>
            <Tooltip content={!allValuesZero ? <CustomTooltip /> : undefined} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Empty state overlay */}
        {allValuesZero && (
          <div className="absolute  inset-0 flex flex-col items-center justify-center rounded-full">
            <Icon icon="mdi:chart-pie" className="text-5xl text-gray-300 mb-2" />
            <p className="text-gray-500 font-medium text-sm">No data available</p>
            <p className="text-xs text-gray-400">All values are zero</p>
          </div>
        )}
      </div>

      {/* Legend */}
 <div className="flex flex-row gap-3 mt-2 overflow-x-auto">
  {data.map((item, index) => (
    <div
      key={index}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
      title={`${item.count} bookings`}
    >
      <span
        className="w-2.5 h-2.5 rounded-full"
        style={{
          backgroundColor: allValuesZero ? "#e5e7eb" : COLORS[index],
        }}
      />

      <span className="text-xs text-gray-600">
        {item.name}
      </span>

      <span className="text-xs text-gray-400">
        ({item.count})
      </span>
    </div>
  ))}
</div>
    </div>
  );
};

export default JobDistributionChart;