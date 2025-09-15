"use client"

import Chat from '@/components/partials/repairman/chat/Chat'
import Header from '@/components/partials/repairman/header/Header'
import React from 'react'
import { useSelector } from 'react-redux';

function RepairmanLayout({ children }) {
    const { user } = useSelector((state) => state.auth);
    console.log("Repair User", user);


    // if (user?.status === "pending") {
    //     return (
    //         <div className="flex items-center justify-center h-screen">
    //             <div className="text-center">
    //                 <h2 className="text-3xl font-semibold mb-4">Your account is pending approval</h2>
    //                 <p className="text-lg">Please wait for admin approval.</p>
    //             </div>
    //         </div>
    //     )
    // }

    return (
        <div className='relative'>
            <Header />
            {children}



            <Chat />
        </div>
    )
}

export default RepairmanLayout
