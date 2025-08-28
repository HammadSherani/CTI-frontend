import TechnicianFinder from '@/components/website/technician/TechnicianFinder'
import TechnicianGrid from '@/components/website/technician/TechnicianGrid' // Import the new grid
import React from 'react'

const page = () => {
  return (
    <div>
      <TechnicianFinder />
      <TechnicianGrid />
    </div>
  )
}

export default page