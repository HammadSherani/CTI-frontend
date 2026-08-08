'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function RefurbishedDashboard() {
  const { token } = useSelector((state) => state.auth);
  const [range, setRange] = useState('all');

  // Stats States
  const [overview, setOverview] = useState({ grossRevenue: 0, shippingCosts: 0, netEarnings: 0, totalOrders: 0 });
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [sellRequests, setSellRequests] = useState([]);
  const [queryStats, setQueryStats] = useState({ total: 0, pending: 0, replied: 0 });
  const [sellRequestCount, setSellRequestCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [resOverview, resMonthly, resOrders, resSell, resQueries] = await Promise.all([
        axiosInstance.get(`/admin/refurbish/earnings/overview?range=${range}`, { headers }),
        axiosInstance.get(`/admin/refurbish/earnings/monthly?range=${range}`, { headers }),
        axiosInstance.get(`/admin/refurbish/earnings/orders?limit=5`, { headers }),
        axiosInstance.get(`/admin/refurbish/sell-requests?limit=5`, { headers }),
        axiosInstance.get(`/admin/refurbish/queries/stats`, { headers }).catch(() => ({ data: { success: true, data: { total: 0, pending: 0, replied: 0 } } }))
      ]);

      if (resOverview.data?.success) setOverview(resOverview.data.data);
      if (resMonthly.data?.success) setMonthlyBreakdown(resMonthly.data.data || []);
      if (resOrders.data?.success) setRecentOrders(resOrders.data.data || []);
      if (resSell.data?.success) {
        setSellRequests(resSell.data.data || []);
        setSellRequestCount(resSell.data.totalRequests || 0);
      }
      if (resQueries.data?.success) setQueryStats(resQueries.data.data || { total: 0, pending: 0, replied: 0 });

      setError(null);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError(err.response?.data?.message || err.message || 'An error occurred loading the dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, range]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="eos-icons:loading" className="text-5xl text-amber-500 animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Generating Dashboard Overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] text-red-500 px-4 text-center">
        <Icon icon="solar:danger-triangle-bold-duotone" className="text-6xl mb-4 text-red-400" />
        <h2 className="text-xl font-bold">Failed to load Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1 max-w-md">{error}</p>
        <button onClick={fetchDashboardData} className="mt-6 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md transition-all">
          Retry
        </button>
      </div>
    );
  }

  // Format month name
  const getMonthName = (monthNum) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNum - 1] || monthNum;
  };

  const chartData = monthlyBreakdown.map(item => ({
    name: `${getMonthName(item.month)} ${item.year}`,
    Revenue: item.grossRevenue,
    Earnings: item.netEarnings,
    Cost: item.shippingCosts
  })).reverse();

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen">
      {/* Upper Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Refurbished Module Dashboard</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium">Overview of earnings, client sell requests, and query analytics.</p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          {['all', 'month', '3months', '6months'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${range === r ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              {r === 'all' && 'All Time'}
              {r === 'month' && 'This Month'}
              {r === '3months' && '3 Months'}
              {r === '6months' && '6 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Gross Revenue', value: `$${(overview.grossRevenue || 0).toFixed(2)}`, icon: 'solar:dollar-minimalistic-bold-duotone', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Shipping Costs', value: `$${(overview.shippingCosts || 0).toFixed(2)}`, icon: 'solar:delivery-bold-duotone', color: 'text-rose-600 bg-rose-50' },
          { label: 'Net Earnings', value: `$${(overview.netEarnings || 0).toFixed(2)}`, icon: 'solar:wallet-money-bold-duotone', color: overview.netEarnings >= 0 ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50' },
          { label: 'Total Paid Orders', value: overview.totalOrders || 0, icon: 'solar:box-bold-duotone', color: 'text-indigo-600 bg-indigo-50' }
        ].map((c, i) => (
          <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-white shadow-sm transition-all hover:scale-[1.01] hover:shadow-md">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{c.label}</p>
              <h3 className="text-2xl font-black text-gray-800 mt-1">{c.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.color}`}>
              <Icon icon={c.icon} className="text-2xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Grid for charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Earnings & Cost Trend Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm lg:col-span-2">
          <h3 className="text-sm font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <Icon icon="solar:chart-square-bold-duotone" className="text-amber-500 text-xl" />
            Revenue & Earning Trends
          </h3>
          <div className="h-[300px] w-full">
            {chartData.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-400 text-xs font-semibold">
                No monthly data found for selected range
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEarn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} />
                  <YAxis fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="Earnings" stroke="#2563eb" fillOpacity={1} fill="url(#colorEarn)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sell Requests Summary stats */}
        <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-gray-800 mb-2 flex items-center gap-2">
              <Icon icon="solar:smartphone-rotate-bold-duotone" className="text-amber-500 text-xl" />
              Sell Requests Analytics
            </h3>
            <p className="text-gray-400 text-[10px] font-medium mb-6">Aggregate counts of gadgets submitted by users for selling.</p>
            <div className="flex items-center justify-between py-3 border-b border-gray-100/50">
              <span className="text-xs font-semibold text-gray-600">Total Requests Received</span>
              <span className="text-sm font-black text-gray-900">{sellRequestCount}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100/50">
              <span className="text-xs font-semibold text-gray-600">Pending Queries</span>
              <span className="text-sm font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">{queryStats.pending}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-xs font-semibold text-gray-600">Replied Queries</span>
              <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">{queryStats.replied}</span>
            </div>
          </div>

          <Link href="/admin/refurbished/requests" className="mt-6 w-full block text-center py-2.5 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-700 rounded-xl transition-all">
            Manage Sell Requests
          </Link>
        </div>
      </div>

      {/* Grid for recent tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Paid Orders Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
              <Icon icon="solar:clipboard-list-bold-duotone" className="text-amber-500 text-xl" />
              Recent Paid Orders
            </h3>
            <Link href="/admin/refurbished/orders" className="text-xs font-bold text-amber-500 hover:text-amber-600">
              View All Orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-gray-600">
              <thead>
                <tr className="border-b border-gray-100/50 text-gray-400 font-bold bg-gray-50/50">
                  <th className="py-2.5 px-3">Order No</th>
                  <th className="py-2.5 px-3">Buyer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-400">No paid orders found</td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord._id} className="border-b border-gray-100/30 hover:bg-gray-50/50">
                      <td className="py-3 px-3 font-bold text-gray-800">{ord.orderNo || ord.orderId}</td>
                      <td className="py-3 px-3">
                        <div className="truncate max-w-[120px]" title={ord.userId?.email}>
                          {ord.userId ? `${ord.userId.firstName || ''} ${ord.userId.lastName || ''}` : 'Anonymous'}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-900">${(ord.totalAmount || 0).toFixed(2)}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.orderStatus === 'delivered' ? 'bg-green-50 text-green-600' :
                          ord.orderStatus === 'cancelled' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Sell Requests Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
              <Icon icon="solar:smartphone-rotate-bold-duotone" className="text-amber-500 text-xl" />
              Recent Sell Requests
            </h3>
            <Link href="/admin/refurbished/requests" className="text-xs font-bold text-amber-500 hover:text-amber-600">
              View All Requests →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-gray-600">
              <thead>
                <tr className="border-b border-gray-100/50 text-gray-400 font-bold bg-gray-50/50">
                  <th className="py-2.5 px-3">Device Name</th>
                  <th className="py-2.5 px-3">Seller Name</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {sellRequests.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-400">No requests found</td>
                  </tr>
                ) : (
                  sellRequests.map((req) => {
                    const devName = `${req.brandId?.name || ''} ${req.modelId?.name || ''}`.trim() || 'Generic Device';
                    return (
                      <tr key={req._id} className="border-b border-gray-100/30 hover:bg-gray-50/50">
                        <td className="py-3 px-3 font-bold text-gray-800 truncate max-w-[150px]">{devName}</td>
                        <td className="py-3 px-3">{req.customerInfo?.name || req.userId?.name || 'Anonymous'}</td>
                        <td className="py-3 px-3 text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'completed' || req.status === 'approved' ? 'bg-green-50 text-green-600' :
                            req.status === 'rejected' || req.status === 'cancelled' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
