import Header from '@/components/partials/admin/ecom/Header'
import React from 'react'

function Ecomlayout({ children }) {
    return (
        <div>
            <Header />
            <div className="ecom-content">
                {children}
            </div>
        </div>
    )
}

export default Ecomlayout
