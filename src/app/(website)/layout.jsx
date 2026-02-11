'use client'

import Chat from '@/components/chat/GlobalChat'
import Footer from '@/components/website/Footer'
import WebsiteHeader from '@/components/website/Header'
import SelectCountry from '@/components/website/SelectCountry'
import React, { useEffect, useState } from 'react'
import Loader from '@/components/Loader'

function layout({ children }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <Loader loading={true}/>
      </div>
    )
  }

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
