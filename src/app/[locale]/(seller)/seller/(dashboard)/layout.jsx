"use client"

import FieldCorrections from '@/components/admin/FieldCorrection';
import Chat from '@/components/chat/GlobalChat'
import Header from '@/components/partials/repairman/header/Header'
import SmallLoader from '@/components/SmallLoader';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useRouter } from '@/i18n/navigation';
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

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/e-commerce/profile/me', {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      setSeller(data?.data)
      dispatch(setUserDetails(data.data));
    } catch (error) {
      handleError(error);
      dispatch(setUserDetails(""))
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUserDetails();
  }, []);
  
  console.log(seller,"seller")
  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return <SmallLoader text='Loading' loading={loading} />;
  }

  const kycStatus   = seller?.kycStatus;         // 'pending' | 'approved' | 'revision' | 'rejected'
  const kycCompleted = seller?.isKycCompleted;   // true | false
  const sellerId    = seller?.id // for redirect URL
console.log(kycCompleted,'kycCompleted')
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
            Admin has requested changes to your profile. Please review and update the highlighted fields.
          </p>
          {seller?.kycReason && (
            <div className="bg-orange-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-medium text-orange-800 mb-1">Reason:</p>
              <p className="text-sm text-orange-700">{seller.kycReason}</p>
            </div>
          )}
          <button
            onClick={() => router.push(`/seller/complete-profile/${sellerId}`)}
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
          <button
            onClick={() => router.push('/support')}
            className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  // ── 5. Approved — render dashboard normally ───────────────────
  return (
    <div className='relative'>
      <Header />
      {children}
      <Chat />
    </div>
  );
}

export default SellerLayout;