import AuthGuard from '@/components/AuthGuard'
import React from 'react'

function layout({ children }) {
  return (
    <div>
      <AuthGuard>
        {children}
      </AuthGuard>
    </div>
  )
}

export default layout
