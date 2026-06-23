"use client";
import React from "react";
import { Icon } from "@iconify/react";
import { summaryCardsData } from "./mockData";

export default function DashboardSummaryCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 xl:grid-cols-4 gap-4">
      {summaryCardsData.map((card, index) => (
        <div
          key={index}
          className="group relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all duration-300 overflow-hidden"
        >
          {/* Gradient accent top bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} opacity-80 group-hover:opacity-100 transition-opacity`} />

          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                {card.value}
              </h3>
              <div className={`flex items-center gap-1 mt-2 text-sm font-semibold ${
                card.trend === "up" ? "text-emerald-600" : "text-red-500"
              }`}>
                <Icon
                  icon={card.trend === "up" ? "solar:arrow-up-bold" : "solar:arrow-down-bold"}
                  className="w-4 h-4"
                />
                <span>{card.change}</span>
                <span className="text-gray-400 font-normal text-xs ml-1">vs last month</span>
              </div>
            </div>

            <div className={`${card.bgLight} p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
              <Icon icon={card.icon} className={`w-6 h-6 ${card.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton loader for summary cards
export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
              <div className="h-8 w-28 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-32 bg-gray-100 rounded" />
            </div>
            <div className="h-12 w-12 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
