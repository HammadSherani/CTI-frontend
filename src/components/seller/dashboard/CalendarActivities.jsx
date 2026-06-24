"use client";
import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import {
  calendarEvents,
  upcomingDeliveries,
  upcomingPayments,
  pendingReturns,
  sellerEvents,
} from "./mockData";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const eventTypeConfig = {
  delivery: { icon: "solar:delivery-bold-duotone", color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-500" },
  payment: { icon: "solar:wallet-money-bold-duotone", color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  return: { icon: "solar:undo-left-bold-duotone", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" },
  event: { icon: "solar:star-bold-duotone", color: "text-violet-600", bg: "bg-violet-50", dot: "bg-violet-500" },
  promotion: { icon: "solar:sale-bold-duotone", color: "text-rose-600", bg: "bg-rose-50", dot: "bg-rose-500" },
  operational: { icon: "solar:settings-bold-duotone", color: "text-gray-600", bg: "bg-gray-100", dot: "bg-gray-500" },
  reporting: { icon: "solar:document-bold-duotone", color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-500" },
  policy: { icon: "solar:shield-bold-duotone", color: "text-indigo-600", bg: "bg-indigo-50", dot: "bg-indigo-500" },
};

export default function CalendarActivities() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  );
  const [activeTab, setActiveTab] = useState("events");

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    // Empty cells for days before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        day: d,
        dateStr,
        events: calendarEvents[dateStr] || [],
        isToday:
          d === today.getDate() &&
          currentMonth === today.getMonth() &&
          currentYear === today.getFullYear(),
      });
    }
    return days;
  }, [currentMonth, currentYear, daysInMonth, firstDayOfMonth]);

  const selectedEvents = calendarEvents[selectedDate] || [];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const tabs = [
    { id: "events", label: "Date Events", icon: "solar:calendar-bold-duotone" },
    { id: "deliveries", label: "Deliveries", icon: "solar:delivery-bold-duotone" },
    { id: "payments", label: "Payments", icon: "solar:wallet-money-bold-duotone" },
    { id: "returns", label: "Returns", icon: "solar:undo-left-bold-duotone" },
    { id: "seller-events", label: "Events", icon: "solar:star-bold-duotone" },
  ];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="bg-rose-50 p-2.5 rounded-xl">
          <Icon icon="solar:calendar-bold-duotone" className="w-5 h-5 text-rose-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Calendar & Upcoming Activities</h3>
          <p className="text-xs text-gray-500">Manage your schedule and upcoming events</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
        {/* Calendar — 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold text-gray-900">
              {MONTHS[currentMonth]} {currentYear}
            </h4>
            <div className="flex gap-1.5">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Icon icon="solar:arrow-left-linear" className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => {
                  setCurrentMonth(today.getMonth());
                  setCurrentYear(today.getFullYear());
                  setSelectedDate(
                    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
                  );
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Icon icon="solar:arrow-right-linear" className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayData, i) => {
              if (!dayData) {
                return <div key={`empty-${i}`} className="h-12" />;
              }

              const isSelected = dayData.dateStr === selectedDate;
              const hasEvents = dayData.events.length > 0;

              return (
                <button
                  key={dayData.dateStr}
                  onClick={() => {
                    setSelectedDate(dayData.dateStr);
                    setActiveTab("events");
                  }}
                  className={`relative h-12 rounded-xl text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
                    isSelected
                      ? "bg-primary-600 text-white shadow-md shadow-primary-200"
                      : dayData.isToday
                      ? "bg-primary-50 text-primary-700 ring-1 ring-primary-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {dayData.day}
                  {hasEvents && (
                    <div className="flex gap-0.5">
                      {dayData.events.slice(0, 3).map((evt, j) => {
                        const cfg = eventTypeConfig[evt.type] || eventTypeConfig.event;
                        return (
                          <div
                            key={j}
                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/70" : cfg.dot}`}
                          />
                        );
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Date Events */}
          {selectedEvents.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Events on {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
              <div className="space-y-2">
                {selectedEvents.map((evt, i) => {
                  const cfg = eventTypeConfig[evt.type] || eventTypeConfig.event;
                  return (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${cfg.bg} transition-all hover:scale-[1.01]`}>
                      <div className="mt-0.5">
                        <Icon icon={cfg.icon} className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{evt.title}</p>
                        <p className="text-xs text-gray-500">{evt.description}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{evt.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {selectedEvents.length === 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 text-center py-6">
              <Icon icon="solar:calendar-search-bold-duotone" className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No events on this date</p>
            </div>
          )}
        </div>

    
      </div>
    </div>
  );
}
