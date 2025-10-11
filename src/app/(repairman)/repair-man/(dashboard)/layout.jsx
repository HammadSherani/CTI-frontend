"use client"

import Chat from '@/components/chat/GlobalChat'
import Header from '@/components/partials/repairman/header/Header'
import { Icon } from '@iconify/react';
import Link from 'next/link';
import React from 'react'
import { useSelector } from 'react-redux';

function RepairmanLayout({ children }) {
    const { user } = useSelector((state) => state.auth);
    console.log("Repair User", user);


    if (user?.status === "pending") {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl text-center">
                    <div className="flex justify-center mb-4 text-orange-500 text-6xl">
                        <Icon icon="mdi:clock-time-eight-outline" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Your account is pending approval
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Please wait while an administrator reviews your registration.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Go to Home
                    </Link>
                </div>
            </div>
        );
    }



    return (
        <div className='relative'>
            <Header />
            {children}



            <Chat />
        </div>
    )
}

export default RepairmanLayout
