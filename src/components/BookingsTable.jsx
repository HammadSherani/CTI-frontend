"use client";
import React from "react";

const bookings = [
  { id: "#123", customer: "Ali", phone: "+921234567890", device: "Vivo S1", time: "2026-03-17 01:51 PM", status: "Booked" },
];

export default function BookingsTable() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">📅 Bookings</h2>
        <div className="px-5 py-1.5 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
          4 Total
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="text-left py-3">Order No #</th>
              <th className="text-left py-3">Customers</th>
              <th className="text-left py-3">Device</th>
              <th className="text-left py-3">Scheduled</th>
              <th className="text-left py-3">Status</th>
              <th className="text-left py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array(4).fill(0).map((_, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-4">#123</td>
                <td className="py-4">
                  <div>Ali</div>
                  <div className="text-gray-500 text-xs">+921234567890</div>
                </td>
                <td className="py-4">Vivo S1</td>
                <td className="py-4">2026-03-17 01:51 PM</td>
                <td className="py-4">
                  <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Booked
                  </span>
                </td>
                <td className="py-4">
                  <button className="text-gray-500 hover:text-orange-600">👁 View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}