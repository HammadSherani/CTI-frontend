"use client";
import React from 'react';

const Badge = ({ children, variant }) => {
  const variants = {
    pending: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
    in_progress: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
    resolved: "bg-green-100 text-green-800",
    open: "bg-red-100 text-red-800",
    default: "bg-gray-100 text-gray-800"
  };

  const selectedVariant = variants[variant?.toLowerCase()] || variants.default;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${selectedVariant}`}>
      {children}
    </span>
  );
};

export default function DashboardTables({ data }) {
  if (!data) return null;

  const activities = data.recentActivities || {};
  const recentJobs = activities.jobs || [];
  const recentBookings = activities.bookings || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* Recent Jobs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Recent Jobs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentJobs.length > 0 ? (
                recentJobs.map((job, idx) => (
                  <tr key={job._id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">
                      {job.customerId?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]" title={job.title}>
                      {job.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={job.status}>{job.status}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                      {job.budget && typeof job.budget === 'object' ? `${job.budget.currency || '$'}${job.budget.min} - ${job.budget.max}` : `$${job.budget || 0}`}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No recent jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Recent Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Repairman</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking, idx) => (
                  <tr key={booking._id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">
                      {booking.repairmanId?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {booking.customerId?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={booking.status}>{booking.status}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                      ${booking.totalAmount || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No recent bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
