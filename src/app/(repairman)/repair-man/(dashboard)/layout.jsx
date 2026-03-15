"use client"

import FieldCorrections from '@/components/admin/FieldCorrection';
import Chat from '@/components/chat/GlobalChat'
import Header from '@/components/partials/repairman/header/Header'
import axiosInstance from '@/config/axiosInstance';
import { setUserDetails } from '@/store/auth';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';

function RepairmanLayout({ children }) {
  const { user, userDetails, token } = useSelector(state => state.auth);
  const [revisionFieldsData, setRevisionFieldsData] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log("Repair User", userDetails);
  const dispatch = useDispatch();
  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/auth/user-details', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });

      dispatch(setUserDetails(data.data));


      console.log(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [])


  useEffect(() => {
    if (userDetails?.repairmanProfile?.revisionFields.length > 0) {
      setRevisionFieldsData(userDetails?.repairmanProfile?.revisionFields[0] || []);
    }
  }, [])


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (userDetails && !userDetails.repairmanProfile.kycInfo.isKycCompleted && userDetails.repairmanProfile.stats.status == "pending") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="heroicons:exclamation-triangle" className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Incomplete</h2>
          <p className="text-gray-600 mb-6">
            Please complete your profile to access the dashboard and start receiving job requests.
          </p>
          <button
            onClick={() => window.location.href = '/repair-man/complete-profile?step=1'}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            Complete Profile Now
          </button>
        </div>
      </div>
    );
  }


  if (userDetails?.repairmanProfile?.stats.status === "pending") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="heroicons:clock" className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Under Review</h2>
          <p className="text-gray-600 mb-4">
            Your profile is currently being reviewed by our team. This process typically takes 12-24 hours.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              We'll notify you via email once your profile is approved. You'll then be able to access all features.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Icon icon="heroicons:check-circle" className="w-5 h-5 text-green-500" />
            <span>Profile Complete: Yes</span>
          </div>
        </div>
      </div>
    );
  }

  if (userDetails?.repairmanProfile?.stats?.status === "revision") {
    return revisionFieldsData?._id && (
      <FieldCorrections reviewId={revisionFieldsData._id} />
    );
  }


  if (userDetails?.repairmanProfile?.stats.status === "rejected") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="heroicons:clock" className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Under rejected</h2>
          <p className="text-gray-600 mb-4">
            Your profile is currently being reviewed by our team. This process typically takes 12-24 hours.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              We'll notify you via email once your profile is approved. You'll then be able to access all features.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Icon icon="heroicons:check-circle" className="w-5 h-5 text-green-500" />
            <span>Profile Complete: Yes</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='relative'>
      <Header />
      {children}
      <Chat />
    </div>
  )
}

export default RepairmanLayout
