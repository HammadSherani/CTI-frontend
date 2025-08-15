import WebsiteHeader from '@/components/website/websiteHeader'
import React from 'react'

function layout({children}) {
  return (
    <>
    <WebsiteHeader />
      {children}
      website Layout
    </>
  )
}

export default layout
