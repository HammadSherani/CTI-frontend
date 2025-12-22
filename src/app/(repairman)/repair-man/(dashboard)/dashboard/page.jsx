"use client";

import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function Dashboard() {
  const { user, token } = useSelector(state => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/repairman/dashboard', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      setData(data.data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentActivity = data?.recentActivity || {};
  const performance = data?.performance || {};

  // Chart data
  const jobStatusData = [
    { name: 'Confirmed', value: stats.jobsInProgress?.breakdown?.confirmed || 0, color: '#3b82f6' },
    { name: 'Scheduled', value: stats.jobsInProgress?.breakdown?.scheduled || 0, color: '#f59e0b' },
    { name: 'In Progress', value: stats.jobsInProgress?.breakdown?.inProgress || 0, color: '#10b981' },
    { name: 'Parts Needed', value: stats.jobsInProgress?.breakdown?.partsNeeded || 0, color: '#ef4444' },
    { name: 'Quality Check', value: stats.jobsInProgress?.breakdown?.qualityCheck || 0, color: '#8b5cf6' },
  ];

  // Weekly earnings data (mock data for demonstration - you can replace with real API data)
  const weeklyEarningsData = [
    { day: 'Mon', earnings: 2500, jobs: 3 },
    { day: 'Tue', earnings: 4200, jobs: 5 },
    { day: 'Wed', earnings: 3800, jobs: 4 },
    { day: 'Thu', earnings: 5100, jobs: 6 },
    { day: 'Fri', earnings: 4500, jobs: 5 },
    { day: 'Sat', earnings: 6200, jobs: 7 },
    { day: 'Sun', earnings: 3400, jobs: 4 },
  ];

  // Monthly comparison data
  const monthlyComparisonData = [
    { month: 'Aug', completed: 12, earnings: 24000 },
    { month: 'Sep', completed: 15, earnings: 32000 },
    { month: 'Oct', completed: 18, earnings: 38000 },
    { month: 'Nov', completed: 22, earnings: 45000 },
    { month: 'Dec', completed: stats.completedJobs?.thisMonth || 0, earnings: stats.monthlyEarnings?.amount || 0 },
  ];

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>

              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Icon icon="heroicons:calendar" className="w-4 h-4" />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 px-5 py-3 bg-primary-50 border border-primary-200 rounded-xl">
                <Icon icon="heroicons:shield-check" className="w-6 h-6 text-primary-600" />
                <span className="text-sm font-semibold text-primary-600">
                  Verified Technician
                </span>
              </div>
            </div>

          </div>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-12 h-12 bg-primary-100  rounded-lg flex items-center justify-center">
                  <Icon icon="heroicons:clipboard-document-list" className="w-6 h-6 text-primary-600" />
                </div>
                <p className="text-gray-700 mt-2 text-sm font-medium">New Job Requests</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {stats.newJobRequests?.count || 0}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Icon icon="heroicons:wrench-screwdriver" className="w-6 h-6 text-primary-600" />
                </div>
                <p className="text-gray-700 mt-2 text-sm font-medium">Jobs in Progress</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {stats.jobsInProgress?.count || 0}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Icon icon="heroicons:check-circle" className="w-6 h-6 text-primary-600" />
                </div>
                <p className="text-gray-700 mt-2 text-sm font-medium">Completed Jobs</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {stats.completedJobs?.count || 0}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Icon icon="heroicons:banknotes" className="w-6 h-6 text-primary-600" />
                </div>
                <p className="text-gray-700 mt-2 text-sm font-medium">Monthly Earnings</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {stats.monthlyEarnings?.amount?.toLocaleString() || 0}
                <span className="text-lg font-normal ml-1">TRY</span>
              </p>
            </div>
          </div>

        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Icon icon="heroicons:chart-pie" className="w-6 h-6 text-primary-600" />
              Job Distribution
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={jobStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {jobStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {jobStatusData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Earnings Line Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Icon icon="heroicons:chart-bar" className="w-6 h-6 text-primary-600" />
              Weekly Earnings Trend
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={weeklyEarningsData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#666" style={{ fontSize: '12px' }} />
                <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#colorEarnings)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>


         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Offers */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Icon icon="heroicons:clipboard-document-check" className="w-6 h-6 text-primary-600" />
                Recent Offers
              </h2>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {recentActivity.offers?.length || 0} total
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.offers?.slice(0, 5).map((offer) => (
                <div key={offer._id} className="p-4 border-2 border-gray-100 rounded-xl hover:border-primary-200 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Icon icon="heroicons:device-phone-mobile" className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {offer.jobId?.deviceInfo?.brand} {offer.jobId?.deviceInfo?.model}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {offer.jobId?.deviceInfo?.color} • {offer.jobId?.deviceInfo?.warrantyStatus}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${offer.status === 'accepted'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : offer.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                      {offer.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Price</p>
                        <span className="text-base font-bold text-green-600">
                          {offer.pricing?.totalPrice?.toLocaleString()} TRY
                        </span>
                      </div>
                      <div className="h-8 w-px bg-gray-200"></div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Timeline</p>
                        <span className="text-sm font-semibold text-gray-700">
                          {offer.estimatedTime?.value} {offer.estimatedTime?.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )) || (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon icon="heroicons:inbox" className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium">No offers yet</p>
                  </div>
                )}
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Icon icon="heroicons:calendar-days" className="w-6 h-6 text-primary-600" />
                 Bookings
              </h2>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {recentActivity.upcomingBookings?.length || 0} scheduled
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.upcomingBookings?.slice(0, 5).map((booking) => (
                <div key={booking._id} className="p-4 border-2 border-gray-100 rounded-xl hover:border-primary-200 hover:shadow-md transition-all group">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Icon icon="heroicons:device-phone-mobile" className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {booking.jobId?.deviceInfo?.brand} {booking.jobId?.deviceInfo?.model}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                        <Icon icon="heroicons:user" className="w-3 h-3" />
                        {booking.customerId?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg">
                    <Icon icon="heroicons:calendar" className="w-4 h-4 text-primary-600" />
                    <span className="font-medium">{new Date(booking.bookingDetails?.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="mx-2">•</span>
                    <Icon icon="heroicons:map-pin" className="w-4 h-4 text-primary-600" />
                    <span className="truncate">{booking.bookingDetails?.serviceType}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-base font-bold text-green-600">
                      {booking.bookingDetails?.pricing?.totalAmount?.toLocaleString()} TRY
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              )) || (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon icon="heroicons:calendar" className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium">No upcoming bookings</p>
                  </div>
                )}
            </div>
          </div>


         
        </div>

        {/* Monthly Comparison & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Monthly Comparison Bar Chart */}
          <div className="bg-white col-span-2 rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Icon icon="heroicons:presentation-chart-line" className="w-6 h-6 text-primary-600" />
              Monthly Performance
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" style={{ fontSize: '12px' }} />
                <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} name="Completed Jobs" />
                <Bar dataKey="earnings" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Earnings (TRY)" />
              </BarChart>
            </ResponsiveContainer>
          </div>


        </div>

        {/* Recent Activity */}
       

      </div>
    </div>
  );
}