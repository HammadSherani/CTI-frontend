import React from 'react'
import Hero from '@/components/website/home/hero'
import Categories from '@/components/website/home/categories'
import PromoBanner from '@/components/website/home/Promo'
import RefurbishedTabs from '@/components/website/home/RefurbishedTabs '
import PromoImages from '@/components/website/home/promoImages'
import SellingProducts from '@/components/website/home/sellingProducts'
import PromotionalBanners from '@/components/website/home/promotionsBanner'
import OurPartners from '@/components/website/home/ourPartners'
import OurProcess from '@/components/website/home/ourProcess'
import BottomPromoImages from '@/components/website/home/bottomPromoImages'

function Home() {
  return (
    <div>
      <Hero />
        <Categories />
        <PromoBanner />
        <RefurbishedTabs />
        <PromoImages />
        <SellingProducts />
        <PromotionalBanners />
        <SellingProducts title="Fla Ürünler"/>
        <OurPartners />
        <OurProcess />
        <BottomPromoImages />
    </div>
  )
}

export default Home
