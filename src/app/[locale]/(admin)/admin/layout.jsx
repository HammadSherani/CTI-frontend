import AuthGuard from '@/components/AuthGuard'
import React from 'react'

function AdminLayout({children}) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  )
}

export default AdminLayout
