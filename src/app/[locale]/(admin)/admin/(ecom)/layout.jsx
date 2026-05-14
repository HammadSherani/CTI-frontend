import Header from '@/components/partials/admin/ecom/Header'
import React from 'react'
import { ToastContainer } from 'react-toastify'

function Ecomlayout({ children }) {
    return (
        <div>
            <Header />
            <ToastContainer position="top-right" autoClose={4000} />
            <div className="ecom-content">
                {children}
            </div>
        </div>
    )
}

export default Ecomlayout
