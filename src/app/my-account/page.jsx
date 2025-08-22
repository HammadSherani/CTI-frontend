import SettingsPage from '@/components/website/SettingsPage'
import React from 'react'
import WebsiteHeader from '@/components/website/Header'

const Page = () => {
  return (
    <>
      <WebsiteHeader />
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <SettingsPage />
      </div>
    </>
  )
}

export default Page
