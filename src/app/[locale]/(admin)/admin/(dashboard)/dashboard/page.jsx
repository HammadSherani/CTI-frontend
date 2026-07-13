"use client";
import React, { useEffect, useState } from 'react';
import axiosInstance from '@/config/axiosInstance';
import { ADMIN_DASHBOARD_API } from '@/store/apiRoutes';
import DashboardStats from './components/DashboardStats';
import DashboardCharts from './components/DashboardCharts';
import DashboardTables from './components/DashboardTables';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get(ADMIN_DASHBOARD_API, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data?.success) {
          setData(response.data.data);
        } else {
          setError(response.data?.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.response?.data?.message || err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Icon icon="eos-icons:loading" className="text-4xl text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-red-500">
        <Icon icon="ph:warning-circle-duotone" className="text-5xl mb-4" />
        <h2 className="text-xl font-bold">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, here's what's happening on your platform today.</p>
      </div>

      <DashboardStats data={data} />
      <DashboardCharts data={data} />
      <DashboardTables data={data} />
    </div>
  );
}

export default AdminDashboard;
