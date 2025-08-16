import Header from '@/components/partials/repairman/header/Header'
import React from 'react'

function RepairmanLayout({children}) {
  return (
    <div>
        <Header />
      {children}
      dashboard layout
    </div>
  )
}

export default RepairmanLayout
