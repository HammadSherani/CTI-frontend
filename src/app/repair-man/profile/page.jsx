"use client"

import React from 'react'
import { useSelector } from 'react-redux';

function page() {
    const {token, user} = useSelector((state) => state.auth);

    console.log(token, user);
    
  return (
    <div>
      profile
    </div>
  )
}

export default page
