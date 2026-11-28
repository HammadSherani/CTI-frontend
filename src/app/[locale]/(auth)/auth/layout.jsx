'use client'

// Guest-only pages (login, register, forgot/reset password, OTP, repairman registration):
// a logged-in user is sent to their own home instead. /auth/logout stays reachable.
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { usePathname } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { pathAfterLogin } from '@/utils/roleHome';

export default function AuthLayout({ children }) {
  const { token, user } = useSelector((state) => state.auth) || {}
  const pathname = usePathname() || ''
  const router = useRouter()
  // The login state lives in the browser, so decide only after the first client render
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isLogout = /\/auth\/logout(\/|$)/.test(pathname)
  const mustLeave = mounted && Boolean(token) && !isLogout

  useEffect(() => {
    if (mustLeave) router.replace(pathAfterLogin(user))
  }, [mustLeave, router, user])

  if (!mounted) return null
  if (mustLeave) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center gap-3 text-gray-500">
        <span className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-primary-600" />
        You are already logged in. Redirecting…
      </div>
    )
  }
  return <>{children}</>
}
