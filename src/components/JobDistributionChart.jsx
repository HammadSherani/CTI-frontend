"use client";
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "Confirmed", value: 55, color: "#FF6B00" },
  { name: "In Progress", value: 10, color: "#FFB800" },
  { name: "Scheduled", value: 10, color: "#FF9A00" },
  { name: "Confirmed", value: 20, color: "#FF4500" }, 
];

const COLORS = ["#FF6B00", "#FFB800", "#FF9A00", "#FF4500"];

export default function JobDistributionChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          📊 Job Distribution
        </h2>
        <div className="px-4 py-1.5 bg-gray-100 rounded-lg text-sm font-medium">Today</div>
      </div>

      <div className="h-80 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}