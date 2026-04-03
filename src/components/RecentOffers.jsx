"use client";
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CustomCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [calendarData, setCalendarData] = useState({ jobs: [], jobsByDate: {}, dateMarkers: [] });
  const [loading, setLoading] = useState(false);
  const { token } = useSelector(state => state.auth);

  useEffect(() => {
    fetchCalendarJobs();
  }, [currentMonth, currentYear]);

  const fetchCalendarJobs = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/repairman/dashboard/calendar-jobs?month=${currentMonth}&year=${currentYear}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCalendarData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching calendar jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isToday = (day) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const hasJobs = (year, month, day) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarData.dateMarkers?.includes(dateString);
  };

  const getJobsForDate = (year, month, day) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarData.jobsByDate?.[dateString] || [];
  };

  const handleDateClick = (day) => {
    const jobs = getJobsForDate(currentYear, currentMonth, day);
    if (jobs.length > 0) {
      setSelectedJobs(jobs);
      setShowModal(true);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  // ==================== SKELETON COMPONENT ====================
  const CalendarSkeleton = () => (
    <div className="flex-1 flex flex-col">
      {/* Navigation Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="w-8 h-8 bg-gray-200 rounded-xl animate-pulse"></div>
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>

      {/* Weekdays Skeleton */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {Array(7).fill(0).map((_, i) => (
          <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>

      {/* Calendar Grid Skeleton */}
      <div className="grid grid-cols-7 gap-2 flex-1">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-2xl animate-pulse"></div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
        <div className="flex gap-6">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-primary-100 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Icon icon="mdi:calendar" className="text-2xl text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Calendar</h2>
          </div>

          <button
            onClick={goToToday}
            className="px-5 py-2 bg-primary-100 text-primary-700 rounded-2xl text-sm font-semibold hover:bg-primary-200 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Loading State - Beautiful Skeleton */}
        {loading ? (
          <CalendarSkeleton />
        ) : (
          <>
            {/* Navigation */}
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <button
                onClick={prevMonth}
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                <Icon icon="mdi:chevron-left" className="text-3xl" />
              </button>

              <div className="font-semibold text-lg text-gray-800">
                {months[currentMonth]} {currentYear}
              </div>

              <button
                onClick={nextMonth}
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                <Icon icon="mdi:chevron-right" className="text-3xl" />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 mb-3 flex-shrink-0">
              {daysOfWeek.map((day, i) => (
                <div key={i} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 flex-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-12"></div>
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isTodayDay = isToday(day);
                const hasJobsOnDay = hasJobs(currentYear, currentMonth, day);
                const jobsCount = getJobsForDate(currentYear, currentMonth, day).length;

                return (
                  <div key={day} className="relative">
                    <button
                      onClick={() => handleDateClick(day)}
                      className={`
                        w-full h-12 rounded-2xl flex flex-col items-center justify-center text-sm font-medium transition-all relative
                        ${hasJobsOnDay ? "hover:bg-primary-50 cursor-pointer" : "cursor-pointer hover:bg-gray-50"}
                        ${isTodayDay ? "border-2 border-primary-500 text-primary-600 bg-white" : "text-gray-700"}
                      `}
                    >
                      <span>{day}</span>
                      {hasJobsOnDay && (
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1"></div>
                      )}
                    </button>
                    
                    {hasJobsOnDay && jobsCount > 1 && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                        <div className="w-1 h-1 bg-primary-500 rounded-full"></div>
                        <div className="w-1 h-1 bg-primary-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-primary-100 flex-shrink-0">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-primary-500 rounded-full"></div>
                    <span className="text-gray-600">Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                    <span className="text-gray-600">Has Jobs</span>
                  </div>
                </div>
                <div className="text-gray-500 font-medium">
                  {calendarData.totalJobs || 0} Jobs
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal remains same */}
      {showModal && selectedJobs.length > 0 && (
        // ... your existing modal code (no change needed)
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* Your modal content here - unchanged */}
        </div>
      )}
    </>
  );
}