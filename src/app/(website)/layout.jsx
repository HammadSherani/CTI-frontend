import Chat from '@/components/chat/GlobalChat'
import Footer from '@/components/website/Footer'
import WebsiteHeader from '@/components/website/Header'
import SelectCountry from '@/components/website/SelectCountry'
import React from 'react'

function layout({ children }) {
  return (
    <div className='relative'>
      <WebsiteHeader />
      {children}

      <Chat />
      <Footer />

      <SelectCountry />
    </div>
  )
}

export default layout
