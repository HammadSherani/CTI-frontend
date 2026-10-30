'use client'
import Chat from '@/components/chat/GlobalChat'
import AiShoppingAssistant from '@/components/website/ai-assistant/AiAssistant'
import Footer from '@/components/website/Footer'
import WebsiteHeader from '@/components/website/Header'
import SelectCountry from '@/components/website/SelectCountry'
import React, { useEffect, useState } from 'react'
import Loader from '@/components/Loader'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '@/config/axiosInstance'
import { setUserDetails } from '@/store/auth'
import { fetchWishlist } from '@/store/wishlist'
import { fetchCart } from '@/store/cart'
import { fetchRefurbishedWishlist } from '@/store/refurbishedWishlist'
import { fetchRefurbishedCart } from '@/store/refurbishedCart'
import handleError from '@/helper/handleError'
import { useLocale } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import useNotifications from '@/hooks/useNotifications'

function Layout({ children }) {
  const { token, user } = useSelector(state => state.auth);
  // Initial page loading state to prevent structure flash & hide while assets mount
  const [initialLoading, setInitialLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const dispatch = useDispatch();
  const pathname = usePathname();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const locale = useLocale();
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  const STORAGE_KEY = 'repair_form';
  const STEP_KEY = 'repair_step';

  // Dismiss initial loader once window is ready and page structure is hydrated
  useEffect(() => {
    const handleReady = () => {
      // Small buffer to guarantee fonts, styles, and hero elements settle
      setTimeout(() => {
        setInitialLoading(false);
      }, 350);
    };

    if (document.readyState === 'complete') {
      handleReady();
    } else {
      window.addEventListener('load', handleReady);
      // Fallback timer
      const timer = setTimeout(handleReady, 1200);
      return () => {
        window.removeEventListener('load', handleReady);
        clearTimeout(timer);
      };
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const fetchUserDetails = async () => {
      try {
        if (!user) {
          setAuthLoading(true);
        }

        const { data } = await axiosInstance.get('/auth/user-details', {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        });

        if (isMounted) {
          dispatch(setUserDetails(data.data));
        }
      } catch (error) {
        handleError(error);
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    };

    fetchUserDetails();

    return () => {
      isMounted = false;
    };
  }, [token, dispatch, user]);

  // Hydrate wishlist + cart from backend whenever auth state changes
  useEffect(() => {
    dispatch(fetchWishlist());
    dispatch(fetchCart());
    dispatch(fetchRefurbishedWishlist());
    dispatch(fetchRefurbishedCart());
  }, [token, dispatch]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  useEffect(() => {
    return () => {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEP_KEY);
    };
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedFormData = localStorage.getItem(STORAGE_KEY);

    if (savedFormData) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEP_KEY);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const isLoadingScreen = initialLoading || authLoading;

  return (
    <>
      <Loader loading={isLoadingScreen} />
      <div className="relative">
        <WebsiteHeader />

        <div className={isHome ? 'mt-0' : 'mt-0'}>
          {children}
        </div>

        <Chat />
        <AiShoppingAssistant />
        <Footer />
        <SelectCountry />
      </div>
    </>
  );
}

export default Layout;
