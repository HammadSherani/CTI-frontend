"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import moment from 'moment';
import { useChat } from '@/hooks/useChat';
import { useRouter } from '@/i18n/navigation';

export default function MySellRequestsPage() {
  const { token, user } = useSelector((state) => state.auth);
  const router = useRouter();
  const { selectChat, openChat } = useChat();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMyRequests = useCallback(async () => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/customer/refurbish/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setRequests(data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your sell requests");
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  const handleAcceptOffer = async (offerId) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const { data } = await axiosInstance.post(`/public/sell-device/offers/${offerId}/accept`);
      if (data.success) {
        toast.success("Offer accepted successfully!");
        fetchMyRequests();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept offer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOffer = async (offerId) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const { data } = await axiosInstance.post(`/public/sell-device/offers/${offerId}/reject`);
      if (data.success) {
        toast.success("Offer rejected successfully");
        fetchMyRequests();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject offer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartChat = async (requestId) => {
    try {
      const { data } = await axiosInstance.post(
        '/chat/refurbish/start',
        { sellRequestId: requestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        selectChat({
          ...data.chat,
          id: data.chat.chatId,
          name: data.chat.user?.name || data.chat.repairman?.name || 'Unknown User',
          avatar: data.chat.user?.avatar || data.chat.repairman?.avatar || null,
          otherUser: data.chat.user || data.chat.repairman
        });
        openChat();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to open chat with support");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Icon icon="mdi:loading" className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    evaluating: 'bg-blue-100 text-blue-800 border-blue-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-purple-100 text-purple-800 border-purple-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Sell Requests</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and track requests to sell your device to CTI Platform</p>
          </div>
          <button
            onClick={() => router.push('/sell-devices/phone')}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 text-white font-extrabold rounded-xl shadow-xs hover:bg-orange-600 transition"
          >
            <Icon icon="mdi:plus" className="w-5 h-5" />
            Sell Another Device
          </button>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200/60 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
            <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Icon icon="mdi:cellphone-arrow-down" className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No requests found</h3>
            <p className="text-sm text-gray-500">
              You haven't submitted any requests to sell your devices yet.
            </p>
            <button
              onClick={() => router.push('/sell-devices/phone')}
              className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((reqItem) => {
              const deviceName = `${reqItem.brandId?.name || ''} ${reqItem.modelId?.name || ''}`.trim();
              const hasOffer = !!reqItem.offer;
              const offerStatus = hasOffer ? reqItem.offer.status : null;
              const isOfferExpired = hasOffer && new Date() > new Date(reqItem.offer.expiryDate);
              const resolvedOfferStatus = isOfferExpired && offerStatus === 'pending' ? 'expired' : offerStatus;

              return (
                <div key={reqItem._id} className="bg-white rounded-3xl border border-gray-200/60 shadow-xs overflow-hidden flex flex-col md:flex-row">
                  
                  {/* Left Column: Device Details */}
                  <div className="p-6 md:p-8 flex-1 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${statusColors[reqItem.status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                          Status: {reqItem.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-bold">
                        Submitted: {moment(reqItem.createdAt).format("DD MMM YYYY")}
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-black text-gray-900">{deviceName}</h2>
                      <p className="text-xs text-gray-400 font-bold mt-1">Tracking ID: {reqItem.trackingId}</p>
                    </div>

                    {reqItem.selectedVariants?.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {reqItem.selectedVariants.map((v, i) => (
                          <span key={i} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold text-gray-600">
                            {v.key}: {v.value}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Chat button */}
                    {hasOffer && (
                      <div className="pt-2">
                        <button
                          onClick={() => handleStartChat(reqItem._id)}
                          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-orange-200 hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-xl text-xs font-extrabold transition cursor-pointer"
                        >
                          <Icon icon="solar:chat-line-linear" className="text-base" />
                          Chat with Platform
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Offer Details */}
                  <div className="p-6 md:p-8 bg-gray-50/50 border-t md:border-t-0 md:border-l border-gray-100 w-full md:w-80 flex flex-col justify-center space-y-4">
                    {!hasOffer ? (
                      <div className="text-center py-6 space-y-2">
                        <Icon icon="mdi:clock-outline" className="w-8 h-8 text-gray-400 mx-auto" />
                        <h4 className="font-extrabold text-sm text-gray-800">Under Evaluation</h4>
                        <p className="text-xs text-gray-500">Our team is reviewing your device details. You will receive an offer soon.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 text-left">
                        <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                          <h4 className="font-black text-sm text-gray-900">Offer Received</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${
                            resolvedOfferStatus === 'accepted' ? 'bg-green-100 text-green-700' :
                            resolvedOfferStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                            resolvedOfferStatus === 'expired' ? 'bg-gray-200 text-gray-600' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {resolvedOfferStatus}
                          </span>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Offer Payout</p>
                          <p className="text-2xl font-black text-orange-500 mt-0.5">TRY {reqItem.offer.offerPrice.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-500 mt-1">Est. value: TRY {reqItem.offer.estimatedValue.toLocaleString()}</p>
                        </div>

                        {reqItem.offer.notes && (
                          <div className="bg-white border border-gray-200/60 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Notes</p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-3">{reqItem.offer.notes}</p>
                          </div>
                        )}

                        {resolvedOfferStatus === 'pending' ? (
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleAcceptOffer(reqItem.offer._id)}
                              disabled={actionLoading}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-extrabold py-2 px-3 rounded-lg text-xs transition cursor-pointer text-center disabled:opacity-60"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectOffer(reqItem.offer._id)}
                              disabled={actionLoading}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold py-2 px-3 rounded-lg text-xs transition cursor-pointer text-center disabled:opacity-60"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 text-center italic pt-2">
                            Offer is {resolvedOfferStatus}.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
