import AcademyHeader from '@/components/partials/academy/AcademyHeader'
import Footer from '@/components/website/Footer'
import React from 'react'

function layout({ children }) {
    return (
        <div>
            <AcademyHeader />
            {children}
            {/* academy footer */}
            <Footer/>
        </div>
    )
}

export default layout
