import Header from '@/components/partials/admin/header/Header'
import React from 'react'

function layout({ children }) {
    return (
        <div>
            <Header />
            {children}
        </div>
    )
}

export default layout
