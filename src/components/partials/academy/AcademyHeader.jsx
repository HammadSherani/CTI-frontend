'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@iconify/react'
import logo from '../../../../public/assets/logo.png'
import Image from 'next/image'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategory } from '@/store/academy'
import { useRouter } from 'next/navigation'
export default function AcademyHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dispatch = useDispatch()
  const router = useRouter()
  const { academicCategories } = useSelector(s => s.academy || {})

  useEffect(() => {
    dispatch(fetchCategory())
  }, [dispatch])

  // debounce search and update URL
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      // reset to first page when searching
      params.set('page', '1');
      router.push(`/academy/academy-listing?${params.toString()}`)
    }, 500)
    return () => clearTimeout(t)
  }, [searchTerm, router])

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
          <div onClick={() => router.push("/")} className="leading-tight">
            <Image src={logo} alt="logo" width={1000} height={1000} className='h-16 w-auto' />
            {/* <p className="text-sm text-orange-500">akademi</p> */}
          </div>

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 font-medium text-gray-700 hover:text-orange-500"
            >
              Categories
              <Icon icon="mdi:chevron-down" className="text-lg" />
            </button>

            {open && (
              <div className="absolute top-full mt-2 w-80 max-h-72 overflow-auto bg-white border rounded-lg shadow-lg z-50 p-2">
                {Array.isArray(academicCategories) && academicCategories.length > 0 ? academicCategories.map((cat) => {
                  const isImage = typeof cat.icon === 'string' && (cat.icon.startsWith('http') || cat.icon.startsWith('/'))
                  const initials = (cat.title || '').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()
                  return (
                    <div
                      key={cat._id}
                      onClick={() => {
                        const params = new URLSearchParams();
                        params.set('categoryId', cat._id)
                        params.set('page', '1')
                        router.push(`/academy/?${params.toString()}`)
                        setOpen(false)
                      }}
                      className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer rounded"
                    >
                      {isImage ? (
                        // icon as image
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cat.icon} alt={cat.title} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        // try Iconify id else initials avatar
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-700">
                          { (typeof cat.icon === 'string' && cat.icon.includes(':')) ? (
                            <Icon icon={cat.icon} className="text-lg text-orange-500" />
                          ) : (
                            <span className="font-semibold">{initials || '?'}</span>
                          )}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-800">{cat.title}</div>
                        <div className="text-xs text-gray-500">{cat.slug || ''}</div>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="px-3 py-2 text-sm text-gray-500">No categories</div>
                )}
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
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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