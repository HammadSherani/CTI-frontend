import Chat from '@/components/chat/GlobalChat'
import Footer from '@/components/website/Footer'
import WebsiteHeader from '@/components/website/Header'
import React from 'react'

function layout({ children }) {
  return (
    <div className='relative'>
      <WebsiteHeader />
      {children}

      <Chat />
      <Footer />
    </div>
  )
}

export default layout
