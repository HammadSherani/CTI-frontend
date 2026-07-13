"use client";
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function EcomCharts({ data }) {
  if (!data || !data.charts) return null;

  const { salesTrend, orderStatus } = data.charts;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  // Prepare Pie Chart data from the orderStatus object
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const orderStatusData = Object.keys(orderStatus || {}).map((key, index) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize
    value: orderStatus[key],
    color: COLORS[index % COLORS.length]
  })).filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      {/* Sales Trend Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Sales Trend (Last 30 Days)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={salesTrend || []}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="_id" 
                tickFormatter={formatDate}
                axisLine={false}
                tickLine={false}
                tick={{fill: '#6b7280', fontSize: 12}}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{fill: '#6b7280', fontSize: 12}}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Area type="monotone" dataKey="sales" name="Sales Volume" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Order Status</h3>
        <div className="h-[300px] w-full flex items-center justify-center">
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No order data available</p>
          )}
        </div>
      </div>

    </div>
  );
}
