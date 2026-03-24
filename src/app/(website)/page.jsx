'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearHomeData, fetchHome } from '@/store/home';

// Components
import Hero, { Header } from '@/components/website/home/hero';
import Categories from '@/components/website/home/categories';
import PromoBanner from '@/components/website/home/Promo';
import RefurbishedTabs from '@/components/website/home/RefurbishedTabs';
import PromoImages from '@/components/website/home/promoImages';
import SellingProducts from '@/components/website/home/sellingProducts';
import PromotionalBanners from '@/components/website/home/promotionsBanner';
import OurPartners from '@/components/website/home/ourPartners';
import OurProcess from '@/components/website/home/ourProcess';
import BottomPromoImages from '@/components/website/home/bottomPromoImages';
import FilterBar from '@/components/website/FilterBar';
import OurServices from '@/components/website/home/ourServices';
import TopRepairman from '@/components/website/home/TopRepairman';
import BecomePartner from '@/components/website/home/becomePartner';
import Testimonials from '@/components/website/home/testimonials';
import AcademySection from '@/components/website/home/MobileAcademySection';
import DownloadApp from '@/components/website/home/downloadApp';
import Footer from '@/components/website/Footer';
import FAQ from '@/components/website/home/FAQ';
import BlogSection from '@/components/website/home/blogSection';
import { HeroSkeleton, CategoriesSkeleton, ServicesSkeleton, RepairmanSkeleton, VideoSkeleton } from '@/components/website/skeletons/home';
import VideoSection from '@/components/website/home/video';
import StaticSections from '@/components/website/home/staticSections';
import GoodProducts from '@/components/website/home/goodProduct';
import ScrollToTop from '@/components/ScrollToTop';
import Stores from '@/components/website/home/stores';
import HowItWorks from '@/components/website/home/works';


function Home() {
  const dispatch = useDispatch();
  const { homeData, loading, error } = useSelector((state) => state.home);
  const [initialLoad, setInitialLoad] = useState(true);
useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}, []);
useEffect(() => {
  if (!homeData) {
    setInitialLoad(true);

    dispatch(fetchHome())
      .unwrap()
      .catch((error) => {
        dispatch(clearHomeData());
        console.error("Error fetching home data:", error);
      })
      .finally(() => {
        setInitialLoad(false);
      });
  } else {
    setInitialLoad(false);
  }
}, [dispatch, homeData]);

  // Show full page skeleton on initial load
  if (initialLoad ) {
    return (
      <div className="space-y-8">
        <HeroSkeleton />
        <ServicesSkeleton />
       <VideoSkeleton/>
        <CategoriesSkeleton />
        <RepairmanSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Hero />
      <OurServices />
      <VideoSection/>
      <SellingProducts title="Products" titleHighlight="New" />
      <StaticSections/>
      <FAQ />
      <GoodProducts  title="Products" titleHighlight="Good" />
      <Stores/>
      {/* <HowItWorks/> */}
      <TopRepairman />
      <BecomePartner />
      <SellingProducts title="Products" titleHighlight="Refurbished" />
      <Testimonials />
      <OurProcess />
      <DownloadApp />
      <AcademySection />
      <BlogSection />
        <ScrollToTop />

    </div>
  );
}

export default Home;