"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CustomDropdown } from "./dropdown";

const data = [
  { day: "Sat", earnings: 39000 },
  { day: "Sun", earnings: 18000 },
  { day: "Mon", earnings: 47000 },
  { day: "Tue", earnings: 45500 },
  { day: "Wed", earnings: 26000 },
  { day: "Thu", earnings: 38000 },
  { day: "Fri", earnings: 9000 },
];

const options = [
  { label: "This Week", value: "this_week" },
  { label: "Last Week", value: "last_week" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
];


export default function WeeklyEarningsChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
        <Icon name="chart-bar" className="w-5 h-5 text-primary-600" />
           Weekly Earnings Analytics
        </h2>
        {/* <CustomDropdown options={options}  value={} onChange={}/> */}
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={25}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, "Earnings"]}
            />
            <Bar
              dataKey="earnings"
              fill="#FF6B00"
              radius={[12, 12, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}