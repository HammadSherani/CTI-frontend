'use client';
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
import { Brands, ContentSection, InterestTags } from '@/components/website/Footer'
import Loader from '@/components/Loader';
import FilterBar from '@/components/website/FilterBar';
import OurServices from '@/components/website/home/ourServices';
import TopRepairman from '@/components/website/home/TopRepairman';
import BecomePartner from '@/components/website/home/becomePartner';
import Testimonials from '@/components/website/home/testimonials';
import AcademySection from '@/components/website/home/MobileAcademySection';
import FreelancerSupportAcademySection from '@/components/website/home/MobileAcademySection';

function Home() {

  return (
    <div>
      {/* <Loader loading={false}> */}
        <Hero />
        <FilterBar />
        <OurServices />
        <TopRepairman />
        {/* <PromoImages /> */}
        <BecomePartner />
        <SellingProducts />
        {/* <PromotionalBanners /> */}
        <SellingProducts title={"Refurbished Products"}  />
        <Testimonials />
        {/* <OurPartners /> */}
        <OurProcess />
        {/* <BottomPromoImages /> */}
        {/* <InterestTags /> */}
        <FreelancerSupportAcademySection />
        <ContentSection />
        {/* <Brands /> */}
      {/* </Loader> */}
    </div>
  )
}

export default Home