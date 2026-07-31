"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import moment from 'moment';

export default function OfferDetailsPage() {
  const { offerId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState(null);
  const [sellRequest, setSellRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOfferDetails = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/public/sell-device/offers/${offerId}`);
      if (data.success) {
        setOffer(data.data.offer);
        setSellRequest(data.data.sellRequest);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load offer details");
    } finally {
      setLoading(false);
    }
  }, [offerId]);

  useEffect(() => {
    if (offerId) {
      fetchOfferDetails();
    }
  }, [offerId, fetchOfferDetails]);

  const handleAccept = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const { data } = await axiosInstance.post(`/public/sell-device/offers/${offerId}/accept`);
      if (data.success) {
        toast.success("Offer accepted successfully!");
        setOffer(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept offer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const { data } = await axiosInstance.post(`/public/sell-device/offers/${offerId}/reject`);
      if (data.success) {
        toast.success("Offer rejected successfully");
        setOffer(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject offer");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Icon icon="mdi:loading" className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!offer || !sellRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <Icon icon="mdi:alert-circle-outline" className="w-16 h-16 text-gray-400" />
        <h2 className="text-xl font-bold text-gray-700">Offer Not Found</h2>
        <button
          onClick={() => router.push('/sell-old-phone')}
          className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition"
        >
          Back to Sell Home
        </button>
      </div>
    );
  }

  const isExpired = new Date() > new Date(offer.expiryDate);
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    accepted: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    expired: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const offerStatus = isExpired && offer.status === 'pending' ? 'expired' : offer.status;

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Status Alert Banner */}
        <div className={`p-5 rounded-2xl border text-center ${statusColors[offerStatus]}`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Icon 
              icon={
                offerStatus === 'accepted' ? 'mdi:check-circle' :
                offerStatus === 'rejected' ? 'mdi:close-circle' :
                offerStatus === 'expired' ? 'mdi:clock-alert' : 'mdi:clock-outline'
              } 
              className="text-xl" 
            />
            <span className="font-extrabold capitalize text-base tracking-wide">
              Offer Status: {offerStatus}
            </span>
          </div>
          <p className="text-sm opacity-90">
            {offerStatus === 'pending' && `This offer is pending your review. It will expire on ${moment(offer.expiryDate).format("DD MMM YYYY")}.`}
            {offerStatus === 'accepted' && "You have accepted this offer. Our team will contact you shortly to coordinate device pickup."}
            {offerStatus === 'rejected' && "You have declined this offer."}
            {offerStatus === 'expired' && "This offer has expired."}
          </p>
        </div>

        {/* Offer Details */}
        <div className="bg-white rounded-3xl border border-gray-200/60 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-5 gap-3">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Refurbish Offer</p>
              <h1 className="text-2xl font-black text-gray-900 mt-1">{offer.offerTitle}</h1>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs font-bold text-gray-400 uppercase">Tracking ID</p>
              <p className="text-sm font-bold text-gray-700">{sellRequest.trackingId}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Price Box */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10">
                <Icon icon="solar:wallet-money-bold" className="text-8xl" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-100">Offer Price</p>
              <p className="text-3xl font-black mt-1">TRY {offer.offerPrice.toLocaleString()}</p>
              <p className="text-xs text-orange-100/80 mt-2">Guaranteed payout upon successful verification.</p>
            </div>

            {/* Estimated Value */}
            <div className="bg-gray-50 border border-gray-200/60 rounded-2xl p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estimated Device Value</p>
              <p className="text-2xl font-extrabold text-gray-800 mt-1">TRY {offer.estimatedValue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">Market value assessment for working units.</p>
            </div>
          </div>

          {/* Notes & Conditions */}
          {offer.notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Notes from Admin</h3>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                {offer.notes}
              </p>
            </div>
          )}

          {offer.conditions && offer.conditions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Conditions & Terms</h3>
              <ul className="space-y-2">
                {offer.conditions.map((condition, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <Icon icon="mdi:check" className="text-green-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          {offerStatus === 'pending' && (
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-extrabold py-3.5 px-6 rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer text-center text-sm"
              >
                Accept Offer
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-6 rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer text-center text-sm"
              >
                Decline Offer
              </button>
            </div>
          )}
        </div>

        {/* Device Information */}
        <div className="bg-white rounded-3xl border border-gray-200/60 p-6 shadow-xs space-y-4">
          <h2 className="font-black text-gray-900 text-lg border-b border-gray-50 pb-3">Device Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl">
              <span className="text-xs font-bold text-gray-500">Brand</span>
              <span className="text-sm font-extrabold text-gray-800 capitalize">{sellRequest.brandId?.name}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl">
              <span className="text-xs font-bold text-gray-500">Model</span>
              <span className="text-sm font-extrabold text-gray-800 capitalize">{sellRequest.modelId?.name}</span>
            </div>
            {sellRequest.selectedVariants?.map((v, i) => (
              <div key={i} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl">
                <span className="text-xs font-bold text-gray-500">{v.key}</span>
                <span className="text-sm font-extrabold text-gray-800">{v.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Guest Chat Notice */}
        {!sellRequest.userId && (
          <div className="bg-orange-50 border border-orange-200/60 rounded-3xl p-6 text-center space-y-3">
            <h3 className="font-extrabold text-orange-800 text-base">Want to negotiate or chat about this offer?</h3>
            <p className="text-sm text-orange-700 max-w-md mx-auto">
              Guests cannot access chat. Please register or login to your account using the email <strong>{sellRequest.customerInfo?.email}</strong> to start chatting directly with the Platform support team.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => router.push('/auth/login')}
                className="px-5 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl hover:bg-orange-700 transition"
              >
                Log In
              </button>
              <button
                onClick={() => router.push('/auth/register')}
                className="px-5 py-2 bg-white border border-orange-300 text-orange-700 font-bold text-xs rounded-xl hover:bg-orange-50 transition"
              >
                Register
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
