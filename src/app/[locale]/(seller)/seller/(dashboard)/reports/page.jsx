"use client";
import React from 'react';
import ReportsModule from '@/components/seller/reports/ReportsModule';

export default function ReportsPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFB]">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                <ReportsModule />
            </div>
        </div>
    );
}
