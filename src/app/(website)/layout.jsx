
import Header from '../../components/website/Header'
import React from 'react'

function layout({children}) {
  return (
    <>
    <Header />
      {children}
      website Layout
    </>
  )
}

export default layout
