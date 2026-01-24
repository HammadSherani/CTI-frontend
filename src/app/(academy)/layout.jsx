import AcademyHeader from '@/components/partials/academy/AcademyHeader'
import React from 'react'

function layout({ children }) {
    return (
        <div>
            <AcademyHeader />
            {children}
            academy footer
        </div>
    )
}

export default layout
