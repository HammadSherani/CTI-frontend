import React from 'react';
import { Icon } from '@iconify/react';

export default function ReportSummaryCards({ summary }) {
    const cards = [
        {
            title: "Total Revenue",
            value: `$${(summary?.totalRevenue || 0).toFixed(2)}`,
            icon: "solar:wad-of-money-bold-duotone",
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
            desc: "Total value of all orders"
        },
        {
            title: "Total Earned (Available)",
            value: `$${(summary?.totalEarned || 0).toFixed(2)}`,
            icon: "solar:wallet-money-bold-duotone",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
            desc: "From delivered orders"
        },
        {
            title: "Total Pending (Hold)",
            value: `$${(summary?.totalPending || 0).toFixed(2)}`,
            icon: "solar:safe-circle-bold-duotone",
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100",
            desc: "From pending/shipped orders"
        },
        {
            title: "Total Orders",
            value: summary?.totalOrders || 0,
            icon: "solar:box-bold-duotone",
            color: "text-violet-600",
            bg: "bg-violet-50",
            border: "border-violet-100",
            desc: "Total order count"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, idx) => (
                <div key={idx} className={`p-5 rounded-2xl bg-white border border-gray-100 shadow-sm relative overflow-hidden group transition-all duration-300 hover:shadow-md`}>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${card.bg} ${card.color} transition-transform group-hover:scale-110`}>
                            <Icon icon={card.icon} className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-4 relative z-10">
                        <Icon icon="solar:info-circle-linear" className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">{card.desc}</span>
                    </div>
                    
                    {/* Decorative accent border bottom */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 ${card.bg} border-t ${card.border}`} />
                </div>
            ))}
        </div>
    );
}
