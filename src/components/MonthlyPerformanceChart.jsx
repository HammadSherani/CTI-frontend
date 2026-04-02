"use client";
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const monthlyData = [
  { month: "1", value: 5000 },
  { month: "2", value: 45000 },
  { month: "3", value: 25000 },
  { month: "4", value: 85000 },
  { month: "5", value: 35000 },
  { month: "6", value: 75000 },
  { month: "7", value: 40000 },
  { month: "8", value: 92000 },
  { month: "9", value: 65000 },
  { month: "10", value: 22000 },
  { month: "11", value: 25000 },
  { month: "12", value: 78000 },
];

export default function MonthlyPerformanceChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Monthly Performance</h2>
        <div className="px-4 py-1.5 bg-gray-100 rounded-lg text-sm font-medium">Monthly</div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyData}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "#111",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
              }}
            />
            <Line
              type="natural"
              dataKey="value"
              stroke="#FF6B00"
              strokeWidth={4}
              dot={{ fill: "#FF6B00", r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}