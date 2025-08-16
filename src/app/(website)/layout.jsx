import WebsiteHeader from '@/components/website/Header'
import React from 'react'

function layout({children}) {
  return (
    <>
    <WebsiteHeader />
      {children}
      Footer
    </>
  )
}

export default layout
