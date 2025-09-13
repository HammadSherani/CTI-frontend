import Chat from '@/components/partials/repairman/chat/Chat'
import Header from '@/components/partials/repairman/header/Header'
import React from 'react'

function RepairmanLayout({ children }) {
    return (
        <div className='relative'>
            <Header />
            {children}



            <Chat />
        </div>
    )
}

export default RepairmanLayout
