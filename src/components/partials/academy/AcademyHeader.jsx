'use client'

import { useState, useEffect, useRef } from 'react'
import { Icon } from '@iconify/react'
import Image from 'next/image'
import { usePathname, useRouter, Link } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategory } from '@/store/academy'
import { clearAuth } from '@/store/auth'

const TABS = [
  { name: 'CTI Academy', href: '/academy' },
  { name: 'Seller Info Center', href: '/academy/seller-info-center' },
  // { name: 'Seller Info Center', href: '/docs/seller' },
  // { name: 'Repairman Info Center', href: '/docs/repairman' },
]

const ROLE_ROUTES = {
  admin: '/admin',
  seller: '/seller',
  repairman: '/repairman',
}

function CategoryIcon({ icon, title }) {
  const isImage =
    typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('/'))
  const isIconify = typeof icon === 'string' && icon.includes(':')
  const initials = (title || '')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (isImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={icon} alt={title} className="w-6 h-6 rounded-full object-cover" />
  }

  return (
    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-700">
      {isIconify ? (
        <Icon icon={icon} className="text-sm text-orange-500" />
      ) : (
        <span className="font-semibold">{initials || '?'}</span>
      )}
    </div>
  )
}

export default function AcademyHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch()

  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const isFirstMount = useRef(true)

  const categoryRef = useRef(null)
  const profileRef = useRef(null)

  const { academicCategories } = useSelector((s) => s.academy || {})
  const { user } = useSelector((s) => s.auth || {})

  useEffect(() => {
    dispatch(fetchCategory())
  }, [dispatch])

  // Sync state if URL changes externally
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '')
  }, [searchParams])

  // Search (debounced)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    const t = setTimeout(() => {
      const params = new URLSearchParams(window.location.search)
      const currentSearch = params.get('search') || ''
      const newSearch = searchTerm.trim()

      if (currentSearch === newSearch) return

      if (newSearch) {
        params.set('search', newSearch)
      } else {
        params.delete('search')
      }
      params.set('page', '1')
      router.push(`/academy/academy-listing?${params.toString()}`)
    }, 500)

    return () => clearTimeout(t)
  }, [searchTerm, router])

  // Bahar click ya Escape par dropdowns band
  useEffect(() => {
    const onClick = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) setOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const goToCategory = (id) => {
    const params = new URLSearchParams()
    if (id !== 'all') {
      params.set('categoryId', id)
    }
    params.set('page', '1')
    router.push(`/academy/academy-listing?${params.toString()}`)
    setOpen(false)
  }

  const goToDashboard = () => {
    setProfileOpen(false)
    router.push(ROLE_ROUTES[user?.role] || '/profile')
  }

  const handleLogout = () => {
    setProfileOpen(false)
    dispatch(clearAuth())
  }

  const categories = Array.isArray(academicCategories) ? academicCategories : []

  return (
    <header className="w-full border-b bg-white border-gray-200">
      {/* Top Bar */}
      <div className="bg-gray-900 text-gray-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex gap-5 overflow-x-auto whitespace-nowrap">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`hover:text-white transition-colors ${pathname === tab.href ? 'text-white font-semibold' : ''
                }`}
            >
              {tab.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/assets/logo.png"
              alt="logo"
              width={160}
              height={48}
              priority
              className="h-10 sm:h-12 w-auto"
            />
          </Link>

          {/* Categories Dropdown */}
          <div className="relative" ref={categoryRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors"
            >
              Categories
              <Icon
                icon="mdi:chevron-down"
                className={`text-base transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {open && (
              <div className="absolute top-full left-0 mt-2 w-64 max-h-72 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-1.5">
                {categories.length > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => goToCategory('all')}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left hover:bg-gray-100 rounded transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-700">
                        <Icon icon="mdi:apps" className="text-sm text-orange-500" />
                      </div>
                      <span className="text-[13px] font-medium text-gray-800 truncate">
                        All Categories
                      </span>
                    </button>
                    {categories.map((cat) => (
                      <button
                        type="button"
                        key={cat._id}
                        onClick={() => goToCategory(cat._id)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left hover:bg-gray-100 rounded transition-colors"
                      >
                        <CategoryIcon icon={cat.icon} title={cat.title} />
                        <span className="text-[13px] font-medium text-gray-800 truncate">
                          {cat.title}
                        </span>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="px-3 py-2 text-xs text-gray-500">No categories</div>
                )}
              </div>
            )}
          </div>

          {/* Calendar
          <button
            type="button"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors"
          >
            <Icon icon="mdi:calendar-month-outline" className="text-base" />
            Calendar
          </button> */}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg pl-3 pr-9 py-1.5 w-56 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <Icon
              icon="mdi:magnify"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-orange-500 text-lg pointer-events-none"
            />
          </div>

          {/* Login / User */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                aria-expanded={profileOpen}
                className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
              >
                <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user?.name || "User"} className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[120px] truncate">
                  {user.name || user.email || 'User'}
                </span>
                <Icon icon="mdi:chevron-down" className="text-gray-500 text-base" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                  <button
                    type="button"
                    onClick={goToDashboard}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-100"
                  >
                    <Icon icon="mdi:account-outline" className="text-base" />
                    Dashboard / Profile
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50"
                  >
                    <Icon icon="mdi:logout" className="text-base" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
            >
              Log in
            </button>
          )}
        </div>
      </div>
    </header>
  )
}