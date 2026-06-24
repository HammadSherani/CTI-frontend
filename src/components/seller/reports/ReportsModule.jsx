"use client";
import React, { useState, useEffect } from 'react';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import SmallLoader from '@/components/SmallLoader';
import { toast } from 'react-toastify';
import ReportSummaryCards from './ReportSummaryCards';
import TransactionHistoryTable from './TransactionHistoryTable';
import RequestStatementModal from './RequestStatementModal';

const filterOptions = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 Days", value: "7days" },
    { label: "Last 14 Days", value: "14days" },
    { label: "Last 30 Days", value: "30days" },
    { label: "Custom", value: "custom" },
];

export default function ReportsModule() {
    const { token } = useSelector(state => state.auth);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("30days");
    const [customDate, setCustomDate] = useState({ start: null, end: null });
    const [reportData, setReportData] = useState({
        summary: { totalRevenue: 0, totalEarned: 0, totalPending: 0, totalOrders: 0 },
        groupedTransactions: [],
        transactions: []
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchReports = async () => {
        try {
            setLoading(true);
            let startDate = new Date();
            let endDate = new Date();

            if (filter === "today") {
                startDate.setHours(0, 0, 0, 0);
            } else if (filter === "yesterday") {
                startDate.setDate(startDate.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setDate(endDate.getDate() - 1);
                endDate.setHours(23, 59, 59, 999);
            } else if (filter === "7days") {
                startDate.setDate(startDate.getDate() - 7);
            } else if (filter === "14days") {
                startDate.setDate(startDate.getDate() - 14);
            } else if (filter === "30days") {
                startDate.setDate(startDate.getDate() - 30);
            } else if (filter === "custom" && customDate.start && customDate.end) {
                startDate = new Date(customDate.start);
                endDate = new Date(customDate.end);
                endDate.setHours(23, 59, 59, 999);
            } else if (filter === "custom") {
                // If custom is selected but no dates picked yet, don't fetch or fetch default 30 days. Let's wait.
                setLoading(false);
                return;
            }

            const response = await axiosInstance.get('/seller/reports/statement', {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setReportData(response.data.data);
            } else {
                toast.error(response.data.message || 'Failed to fetch reports');
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('An error occurred while fetching reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchReports();
        }
    }, [filter, token, customDate]);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports & Account Statement</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        View your transaction history, earnings, and order-based financial performance.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Icon icon="solar:document-add-bold-duotone" className="w-5 h-5" />
                        Request Statement
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-white rounded-xl p-1 border border-gray-200 shadow-sm overflow-x-auto">
                    {filterOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setFilter(opt.value)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                                filter === opt.value
                                    ? "bg-gray-100 text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {filter === "custom" && (
                    <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 border border-gray-200 shadow-sm">
                        <input
                            type="date"
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary-500 text-gray-600"
                            value={customDate.start || ''}
                            onChange={(e) => setCustomDate({ ...customDate, start: e.target.value })}
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary-500 text-gray-600"
                            value={customDate.end || ''}
                            onChange={(e) => setCustomDate({ ...customDate, end: e.target.value })}
                        />
                    </div>
                )}
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <SmallLoader text="Loading reports..." loading={loading} />
                </div>
            ) : (
                <>
                    <ReportSummaryCards summary={reportData.summary} />
                    <TransactionHistoryTable groupedTransactions={reportData.groupedTransactions} />
                </>
            )}

            {/* Modal */}
            {isModalOpen && (
                <RequestStatementModal
                    onClose={() => setIsModalOpen(false)}
                    transactions={reportData.transactions}
                    summary={reportData.summary}
                    currentFilter={filter}
                    customDate={customDate}
                />
            )}
        </div>
    );
}
