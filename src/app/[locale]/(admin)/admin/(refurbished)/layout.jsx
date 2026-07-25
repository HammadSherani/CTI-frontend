import Header from '@/components/partials/admin/refurbished/Header'
import React from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function RefurbishedLayout({ children }) {
    return (
        <div>
            <Header />
            <ToastContainer position="top-right" autoClose={4000} />
            <div className="refurbished-content">
                {children}
            </div>
        </div>
    )
}

export default RefurbishedLayout
