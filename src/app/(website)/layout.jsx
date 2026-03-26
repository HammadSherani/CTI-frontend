'use client'

import Chat from '@/components/chat/GlobalChat'
import Footer from '@/components/website/Footer'
import WebsiteHeader from '@/components/website/Header'
import SelectCountry from '@/components/website/SelectCountry'
import React, { useEffect, useState } from 'react'
import Loader from '@/components/Loader'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '@/config/axiosInstance'
import { setUserDetails } from '@/store/auth'
import handleError from '@/helper/handleError'
import { usePathname } from 'next/navigation'

function Layout({ children }) {
  const { token } = useSelector(state => state.auth);  
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch();
  const pathname = usePathname();

  const STORAGE_KEY = 'repair_form';
  const STEP_KEY = 'repair_step';

  // ✅ Fetch user (safe)
  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const fetchUserDetails = async () => {
      try {
        setLoading(true);

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
        if (isMounted) setLoading(false);
      }
    };

    fetchUserDetails();

    return () => {
      isMounted = false;
    };
  }, [token, dispatch]);

  // ✅ Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const isHome = pathname === '/';

  // ✅ AFTER ALL HOOKS
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <Loader loading={true} />
      </div>
    );
  }

  return (
    <div className="relative">
      <WebsiteHeader />

      <div className={isHome ? 'mt-0' : 'mt-16'}>
        {children}
      </div>

      <Chat />
      <Footer />
      <SelectCountry />
    </div>
  );
}

export default Layout;