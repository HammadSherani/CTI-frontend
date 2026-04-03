"use client";
import React, { useState } from "react";
import { Icon } from "@iconify/react";

// Loading Skeleton Component
const TableLoadingSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-primary-100 flex flex-col h-96 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-2xl"></div>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="h-9 w-24 bg-gray-200 rounded-2xl"></div>
      </div>

      {/* Table Skeleton */}
      <div className="hidden lg:block flex-1 space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3 py-4 px-3 border-b border-gray-100">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Mobile Skeleton */}
      <div className="block lg:hidden space-y-3 flex-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border border-gray-100 rounded-2xl space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function BookingsTable({ data = [], isLoading = false }) {
  const [expandedRows, setExpandedRows] = useState({});

  // Show loading skeleton
  if (isLoading) {
    return <TableLoadingSkeleton />;
  }

  // Toggle expanded row
  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-primary-100 text-primary-700';
    }
  };

  // Get device info
  const getDeviceInfo = (booking) => {
    if (booking.device?.brand && booking.device?.model) {
      return `${booking.device.brand} ${booking.device.model}`;
    }
    if (booking.device?.brand) return booking.device.brand;
    if (booking.device?.model) return booking.device.model;
    return "N/A";
  };

  // Truncate text
  const truncateText = (text, maxLength = 30) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-primary-100 flex flex-col h-full">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-2xl flex items-center justify-center">
            <Icon icon="mdi:calendar-check" className="text-xl sm:text-2xl text-primary-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Bookings
          </h2>
        </div>

        <div className="px-4 py-1.5 sm:px-5 sm:py-2 bg-primary-100 text-primary-700 rounded-2xl text-xs sm:text-sm font-semibold">
          {data.length} Total
        </div>
      </div>

      {/* Mobile View (Cards) - No scroll */}
      <div className="block lg:hidden space-y-4 flex-1 overflow-y-auto">
        {data.length > 0 ? (
          data.map((booking, index) => (
            <div
              key={booking._id || index}
              className="border border-primary-100 rounded-2xl p-4 hover:shadow-md transition-shadow"
            >
              {/* Header Row */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs text-gray-400">Order #</span>
                  <p className="font-semibold text-gray-800 text-sm">
                    {booking._id?.slice(-8) || "N/A"}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${getStatusColor(booking.status)}`}>
                  {booking.status || "N/A"}
                </span>
              </div>

              {/* Customer Info */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Icon icon="mdi:account-circle" className="text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-800 break-words">
                    {booking.customer?.name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1 ml-6">
                  <Icon icon="mdi:phone" className="text-gray-400 text-xs flex-shrink-0" />
                  <span className="text-gray-600 text-xs break-words">
                    {booking.customer?.phone || "N/A"}
                  </span>
                </div>
              </div>

              {/* Device Info */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Icon icon="mdi:cellphone" className="text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 text-sm break-words">
                    {getDeviceInfo(booking)}
                  </span>
                </div>
              </div>

              {/* Scheduled Date */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Icon icon="mdi:calendar" className="text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 text-sm">
                    {formatDate(booking.scheduledDate)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => toggleRow(booking._id)}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
              >
                <Icon icon="mdi:eye-outline" className="text-lg" />
                <span className="text-sm font-medium">View Details</span>
              </button>

              {/* Expanded Content for Mobile */}
              {expandedRows[booking._id] && (
                <div className="mt-3 pt-3 border-t border-primary-100 space-y-3">
                  {booking.job?.description && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Job Description:</h4>
                      <p className="text-sm text-gray-600 break-words">{booking.job?.description}</p>
                    </div>
                  )}
                  {booking.device?.brand && booking.device?.model && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Full Device Details:</h4>
                      <p className="text-sm text-gray-600 break-words">{booking.device.brand} {booking.device.model}</p>
                    </div>
                  )}
                  {booking.pricing && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Pricing:</h4>
                      <p className="text-sm text-gray-600 break-words">
                        Total: {booking.pricing.totalAmount} {booking.pricing.currency}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Icon icon="mdi:inbox-outline" className="text-5xl mx-auto mb-2" />
            <p>No bookings found</p>
          </div>
        )}
      </div>

      {/* Desktop View (Table) - No horizontal scroll */}
      <div className="hidden lg:block flex-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-100">
                <th className="text-left py-4 px-3 text-gray-500 font-medium w-[12%]">
                  Order No
                </th>
                <th className="text-left py-4 px-3 text-gray-500 font-medium w-[20%]">
                  Customer
                </th>
                <th className="text-left py-4 px-3 text-gray-500 font-medium w-[18%]">
                  Device
                </th>
                <th className="text-left py-4 px-3 text-gray-500 font-medium w-[18%]">
                  Scheduled
                </th>
                <th className="text-left py-4 px-3 text-gray-500 font-medium w-[12%]">
                  Status
                </th>
                <th className="text-left py-4 px-3 text-gray-500 font-medium w-[10%]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((booking, index) => (
                  <React.Fragment key={booking._id || index}>
                    <tr className="border-b border-gray-200 hover:bg-primary-50 transition-colors">
                      <td className="py-4 px-3">
                        <span className="font-medium text-gray-700 text-sm">
                          {booking._id?.slice(-8) || "N/A"}
                        </span>
                      </td>

                      <td className="py-4 px-3">
                        <div className="font-medium text-gray-800 text-sm break-words">
                          {truncateText(booking.customer?.name, 20) || "N/A"}
                        </div>
                        <div className="text-gray-500 text-xs break-words">
                          {booking.customer?.phone || "N/A"}
                        </div>
                      </td>

                      <td className="py-4 px-3">
                        <span className="text-gray-700 text-sm block break-words" title={getDeviceInfo(booking)}>
                          {truncateText(getDeviceInfo(booking), 25)}
                        </span>
                      </td>

                      <td className="py-4 px-3">
                        <span className="text-gray-600 text-sm whitespace-nowrap">
                          {formatDate(booking.scheduledDate)}
                        </span>
                      </td>

                      <td className="py-4 px-3">
                        <span className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap ${getStatusColor(booking.status)}`}>
                          {booking.status || "N/A"}
                        </span>
                      </td>

                      <td className="py-4 px-3">
                        <button 
                          onClick={() => toggleRow(booking._id)}
                          className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 transition-colors"
                        >
                          <Icon icon="mdi:eye-outline" className="text-lg" />
                          <span className="text-sm font-medium">View</span>
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Row for Long Content */}
                    {expandedRows[booking._id] && (
                      <tr className="bg-primary-50/50">
                        <td colSpan="6" className="py-4 px-6">
                          <div className="space-y-3">
                            {booking.job?.description && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-1">Job Description:</h4>
                                <p className="text-sm text-gray-600 break-words">{booking.job.description}</p>
                              </div>
                            )}
                            {booking.device?.brand && booking.device?.model && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-1">Full Device Details:</h4>
                                <p className="text-sm text-gray-600 break-words">{booking.device.brand} {booking.device.model}</p>
                              </div>
                            )}
                            {booking.pricing && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-1">Pricing:</h4>
                                <p className="text-sm text-gray-600 break-words">
                                  Total: {booking.pricing.totalAmount} {booking.pricing.currency}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="mdi:inbox-outline" className="text-5xl" />
                      <p>No bookings found</p>
                    </div>
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