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
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function DashboardCharts({ data }) {
  if (!data) return null;

  const charts = data.charts || {};
  const users = data.users || {};

  // Formatter for dates if needed, though they are already YYYY-MM-DD
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  // Pie chart data for user distribution
  const userDistribution = [
    { name: 'Customers', value: users.customers?.total || 0, color: '#2563eb' },
    { name: 'Repairmen', value: users.repairmen?.total || 0, color: '#059669' },
    { name: 'Sellers', value: users.sellers?.total || 0, color: '#7c3aed' },
  ].filter(item => item.value > 0); // Hide empty categories

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Overview (Last 30 Days)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={charts.revenue || []}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
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
                cursor={{fill: '#f9fafb'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}}/>
              <Bar dataKey="revenue" name="Total Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="commission" name="Platform Commission" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Jobs Trend Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Jobs Trend (Last 30 Days)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={charts.jobs || []}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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
              />
              <Tooltip 
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Area type="monotone" dataKey="count" name="Jobs Posted" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorJobs)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Users Breakdown Pie Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
        <h3 className="text-lg font-bold text-gray-800 mb-6">User Demographics</h3>
        <div className="h-[300px] w-full flex items-center justify-center">
          {userDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No user data available</p>
          )}
        </div>
      </div>

      {/* Repairman Performance Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Top Repairmen (Last 30 Days)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={charts.topRepairmen || []}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{fill: '#6b7280', fontSize: 12}}
              />
              <Tooltip 
                cursor={{fill: '#f9fafb'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="jobsCompleted" name="Jobs Completed" fill="#10b981" radius={[0, 4, 4, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Advertisement Performance Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Ad Performance (Last 30 Days)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={charts.advertisements || []}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
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
              />
              <Tooltip 
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}}/>
              <Area type="monotone" dataKey="views" name="Ad Views" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              <Area type="monotone" dataKey="clicks" name="Ad Clicks" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Withdrawal Performance Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Withdrawals Trend (Last 30 Days)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={charts.withdrawals || []}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
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
                cursor={{fill: '#f9fafb'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}}/>
              <Bar dataKey="amount" name="Processed Withdrawals" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
