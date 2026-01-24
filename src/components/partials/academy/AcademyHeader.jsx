'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@iconify/react'
import logo from '../../../../public/assets/logo.png'
import Image from 'next/image'

export default function AcademyHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const tabs = [
    { name: 'CTI Academy', href: '/academy' },
    { name: 'Seller Panel', href: '/academy/seller-panel' },
    { name: 'Seller Information Center', href: '/academy/seller-info-center' },
  ]

  return (
    <header className="w-full border-b bg-white border-gray-200">

      {/* Top Bar */}
      <div className="bg-gray-900 text-gray-300 text-sm">
        <div className="max-w-7xl mx-auto px-6 py-2 flex gap-6">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={`hover:text-white cursor-pointer ${
                pathname === tab.href ? 'text-white font-semibold' : ''
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">

        {/* Left */}
        <div className="flex items-center gap-8">
          
          {/* Logo */}
          <div className="leading-tight">
            <Image src={logo} alt="logo" width={1000} height={1000} className='h-16 w-auto' />
            {/* <p className="text-sm text-orange-500">akademi</p> */}
          </div>

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 font-medium text-gray-700 hover:text-orange-500"
            >
              Categories
              <Icon icon="mdi:chevron-down" className="text-lg" />
            </button>

            {open && (
              <div className="absolute top-full mt-2 w-52 bg-white border rounded-lg shadow-lg z-50">
                {[
                  { name: 'E-Commerce', icon: 'mdi:cart-outline' },
                  { name: 'Marketing', icon: 'mdi:bullhorn-outline' },
                  { name: 'Finance', icon: 'mdi:finance' },
                  { name: 'Technology', icon: 'mdi:laptop' },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    <Icon icon={item.icon} className="text-orange-500 text-lg" />
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="flex items-center gap-1 font-medium text-gray-700 hover:text-orange-500 cursor-pointer">
            <Icon icon="mdi:calendar-month-outline" className="text-lg" />
            Calendar
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Education Search..."
              className="border rounded-lg pl-4 pr-10 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <Icon
              icon="mdi:magnify"
              className="absolute right-3 top-2.5 text-orange-500 text-xl"
            />
          </div>

          {/* Login */}
          <button className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition">
            Log in
          </button>
        </div>
      </div>
    </header>
  )
}