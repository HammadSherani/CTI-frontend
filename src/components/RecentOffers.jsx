"use client";
import React from "react";

export default function RecentOffers() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Recent Offers</h2>
        <div className="px-5 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
          0 Total
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center text-center">
        <div>
          <div className="text-6xl mb-3">📅</div>
          <p className="text-gray-400">September 2021</p>
          {/* You can integrate a real calendar library like react-calendar here */}
        </div>
      </div>
    </div>
  );
}