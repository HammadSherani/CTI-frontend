import React from 'react'
import Hero from '@/components/website/home/hero'
import Categories from '@/components/website/home/categories'
import PromoBanner from '@/components/website/home/Promo'
import RefurbishedTabs from '@/components/website/home/RefurbishedTabs '
import PromoImages from '@/components/website/home/promoImages'

function Home() {
  return (
    <div>
      <Hero />
        <Categories />
        <PromoBanner />
        <RefurbishedTabs />
        <PromoImages />
    </div>
  )
}

export default Home
