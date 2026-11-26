"use client"

import FieldCorrections from '@/components/admin/FieldCorrection';
import Chat from '@/components/chat/GlobalChat'
import Header from '@/components/partials/seller/Header';
import SmallLoader from '@/components/SmallLoader';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSocket } from '@/contexts/SocketProvider';
import { DeactivatedBanner, DeactivatedPage, isBlockedForDeactivatedSeller } from '@/components/partials/seller/SellerDeactivated';
import { setUserDetails } from '@/store/auth';
import { Icon } from '@iconify/react';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';

function SellerLayout({ children }) {
  const {  token } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [seller,setSeller]=useState(null)
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { socket } = useSocket() || {};

  // `silent` refreshes in the background (no full-page loader)
  const fetchUserDetails = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const { data } = await axiosInstance.get('/seller/profile/me', {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      setSeller(data?.data)
      dispatch(setUserDetails(data.data));
    } catch (error) {
      if (silent) return; // keep what is on screen if a background refresh fails
      handleError(error);
      dispatch(setUserDetails(""))
    } finally {
      if (!silent) setLoading(false);
    }
  };
  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Apply admin activate / deactivate right away (socket), or when the seller returns to the tab
  useEffect(() => {
    const refresh = () => fetchUserDetails({ silent: true });
    socket?.on('seller_status_changed', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      socket?.off('seller_status_changed', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [socket, token]);

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return <SmallLoader text='Loading' loading={loading} />;
  }

  const kycStatus   = seller?.kycStatus;         // 'pending' | 'approved' | 'revision' | 'rejected'
  const kycCompleted = seller?.isKycCompleted;   // true | false
  const sellerId    = seller?.userId?._id || seller?.userId // for redirect URL
 if (!seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="heroicons:exclamation-triangle" className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something Wrong</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your profile information. Please complete your profile to access the dashboard and start receiving orders.
          </p>
          <button
            onClick={() => router.push(`/auth/login`)}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
          Login to Complete Profile
          </button>
        </div>
      </div>
    );
  }
  // ── 1. KYC not submitted yet → redirect to complete profile ───
  if (!kycCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="heroicons:exclamation-triangle" className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Incomplete</h2>
          <p className="text-gray-600 mb-6">
            Please complete your profile to access the dashboard and start receiving orders.
          </p>
          <button
            onClick={() => router.push(`/seller/complete-profile/${sellerId}`)}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            Complete Profile Now
          </button>
        </div>
      </div>
    );
  }

  // ── 2. KYC submitted, pending admin review ─────────────────────
  if (kycCompleted && kycStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="heroicons:clock" className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Under Review</h2>
          <p className="text-gray-600 mb-4">
            Your profile is currently being reviewed by our team. This typically takes 12–24 hours.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              We'll notify you via email once your profile is approved.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Icon icon="heroicons:check-circle" className="w-5 h-5 text-green-500" />
            <span>Profile submitted successfully</span>
          </div>
        </div>
      </div>
    );
  }

  // ── 3. KYC needs revision ──────────────────────────────────────
  if (kycStatus === 'revision') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="heroicons:pencil-square" className="w-10 h-10 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Revision Required</h2>
          <p className="text-gray-600 mb-4">
            Admin has requested changes to your profile.
          </p>
          {seller?.kycReason && (
            <div>
                <p className="text-sm font-medium text-orange-800 mb-1">Reason</p>
            <div className="bg-orange-50 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-orange-700">{seller.kycReason}</p>
            </div>
              </div>
          )}
          <button
            onClick={() => router.push(`/seller/complete-profile/${seller.userId}`)}
            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
          >
            Update Profile
          </button>
        </div>
      </div>
    );
  }

  // ── 4. KYC rejected ───────────────────────────────────────────
  if (kycStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="heroicons:x-circle" className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Rejected</h2>
          <p className="text-gray-600 mb-4">
            Unfortunately your profile was not approved. Please contact support for further assistance.
          </p>
          {seller?.kycReason && (
            <div className="bg-red-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-medium text-red-800 mb-1">Reason:</p>
              <p className="text-sm text-red-700">{seller.kycReason}</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push(`/seller/complete-profile/${sellerId}`)}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Update &amp; Resubmit
            </button>
            <button
              onClick={() => router.push('/live-support')}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 5. Approved — render dashboard normally ───────────────────
  const isDeactivated = seller?.isActive === false;

  return (
    <div className='relative'>
      <Header />
      {isDeactivated && <DeactivatedBanner />}
      {isDeactivated && isBlockedForDeactivatedSeller(pathname) ? <DeactivatedPage /> : children}
      <Chat />
    </div>
  );
}

export default SellerLayout;