import AuthGuard from '@/components/AuthGuard'
import React from 'react'

function RepairManLayout({ children }) {

    return (
        <AuthGuard>
            {children}
        </AuthGuard>
    )
}

export default RepairManLayout
