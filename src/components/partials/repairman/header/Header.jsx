import Image from 'next/image'
import React from 'react'
import logo from "../../../../../public/assets/logo.png"

function Header() {

  const navLinks = ["Home", "About", "Services", "Contact"];
  return (
    
    <div className='container mx-auto flex py-2 items-center justify-between'>
      <div className='flex items-center gap-5 '>
        <Image src={logo} alt='logo' width={1000} height={1000} className='w-28 h-auto' />

        <nav>
          <ul className='flex gap-7'>
            {navLinks.map((link) => (
              <li key={link}>
                <a href="#">{link}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div>two</div>
    </div>
  )
}

export default Header
