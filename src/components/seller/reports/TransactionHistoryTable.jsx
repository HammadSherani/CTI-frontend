import React, { useState } from 'react';
import { Icon } from '@iconify/react';

export default function TransactionHistoryTable({ groupedTransactions }) {
    const [expandedDates, setExpandedDates] = useState({});

    const toggleDate = (date) => {
        setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
    };

    const getStatusStyle = (status) => {
        const s = status?.toLowerCase();
        if (s === 'delivered' || s === 'paid') return 'bg-emerald-100 text-emerald-700';
        if (s === 'pending' || s === 'processing') return 'bg-amber-100 text-amber-700';
        if (s === 'cancelled' || s === 'failed') return 'bg-rose-100 text-rose-700';
        return 'bg-blue-100 text-blue-700';
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-primary-50 p-2 rounded-xl">
                        <Icon icon="solar:list-bold-duotone" className="w-5 h-5 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                </div>
            </div>

            <div className="p-0">
                {groupedTransactions?.length === 0 ? (
                    <div className="p-10 text-center">
                        <Icon icon="solar:document-text-linear" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No transactions found for the selected period.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {groupedTransactions.map((group) => (
                            <div key={group.date} className="group-wrapper">
                                {/* Group Header */}
                                <div 
                                    className="px-5 py-3 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => toggleDate(group.date)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon 
                                            icon={expandedDates[group.date] ? "solar:alt-arrow-down-linear" : "solar:alt-arrow-right-linear"} 
                                            className="w-4 h-4 text-gray-500"
                                        />
                                        <span className="text-sm font-semibold text-gray-700">{group.date}</span>
                                        <span className="text-xs font-medium text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                                            {group.orderCount} Orders
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">
                                        Total: <span className="text-gray-900">${group.transactions.reduce((acc, t) => acc + t.orderAmount, 0).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Group Transactions Table */}
                                {expandedDates[group.date] && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-white text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                                    <th className="px-5 py-3 pl-10">Order ID</th>
                                                    <th className="px-5 py-3">Customer</th>
                                                    <th className="px-5 py-3">Product</th>
                                                    <th className="px-5 py-3 text-right">Order Amt</th>
                                                    <th className="px-5 py-3 text-right">Hold (Pending)</th>
                                                    <th className="px-5 py-3 text-right">Earned (Avail)</th>
                                                    <th className="px-5 py-3 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 text-sm">
                                                {group.transactions.map((t, idx) => (
                                                    <tr key={t._id || idx} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-5 py-3 pl-10 font-medium text-gray-900">{t.orderNo}</td>
                                                        <td className="px-5 py-3 text-gray-600">{t.customerName || 'N/A'}</td>
                                                        <td className="px-5 py-3 text-gray-600 truncate max-w-[200px]" title={t.productNamesStr}>
                                                            {t.productNamesStr}
                                                        </td>
                                                        <td className="px-5 py-3 text-right font-medium text-gray-900">${t.orderAmount.toFixed(2)}</td>
                                                        <td className="px-5 py-3 text-right font-medium text-amber-600">
                                                            {t.holdAmount > 0 ? `$${t.holdAmount.toFixed(2)}` : '-'}
                                                        </td>
                                                        <td className="px-5 py-3 text-right font-medium text-emerald-600">
                                                            {t.availableEarnings > 0 ? `$${t.availableEarnings.toFixed(2)}` : '-'}
                                                        </td>
                                                        <td className="px-5 py-3 text-center">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusStyle(t.orderStatus)}`}>
                                                                {t.orderStatus}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
