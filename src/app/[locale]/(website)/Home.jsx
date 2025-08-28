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
import { useTranslations, useLocale } from 'next-intl'

function Home({locale}) {
  const t = useTranslations('HomePage');

  return (
    <div>
      <Hero locale={locale} />
      <Categories locale={locale} />
      <PromoBanner locale={locale} />
      <RefurbishedTabs locale={locale} />
      <PromoImages locale={locale} />
      <SellingProducts locale={locale} />
      <PromotionalBanners locale={locale} />
      <SellingProducts locale={locale} title={t('flashProducts')} />
      <OurPartners locale={locale} />
      <OurProcess locale={locale} />
      <BottomPromoImages locale={locale} />
      <InterestTags locale={locale} />
      <ContentSection locale={locale} />
      <Brands locale={locale} />
    </div>
  )
}

export default Home