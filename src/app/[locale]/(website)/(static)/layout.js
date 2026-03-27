import SideLinkPage from '@/components/website/SideLinkPage'
import Header from '@/components/website/static/header'
import React from 'react'

function layout({ children }) {
    return (
        <div className="bg-gray-50 min-h-screen">
            <Header/>
            <div className='flex w-full max-w-7xl mx-auto justify-center gap-8 py-12 px-4'>
                <div className='hidden lg:block w-[300px]'>
                    <SideLinkPage/>
                </div>
                <div className='flex-1'>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default layout
