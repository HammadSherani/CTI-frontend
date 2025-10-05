"use client"

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';

function OrderConfirmation() {
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderType, setOrderType] = useState(null); 

    const { id: jobId } = useParams();
    const searchParams = useSearchParams();
    const quotationId = searchParams.get('quotationId');
    
    const token = useSelector(state => state.auth.token);
    const router = useRouter();

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                setLoading(true);

                // 🔥 FLOW 1: Quotation Order Confirmation
                if (quotationId) {
                    const { data } = await axiosInstance.get(`/chat/quotation/${quotationId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    const quotation = data.data.quotation;

                    const paymentResponse = await axiosInstance.get('/customer/payments', {
                        params: { quotationId },
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (!paymentResponse.data.data.paymentCompleted) {
                        router.push(`/payment?quotationId=${quotationId}`);
                        return;
                    }

                    setOrderData({
                        quotation,
                        repairmanProfile: paymentResponse.data.data.repairmanProfile,
                        paymentId: paymentResponse.data.data.paymentId
                    });
                    setOrderType('quotation');
                }
                else {
                    const jobResponse = await axiosInstance.get(`/repair-jobs/my-jobs/${jobId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    const job = jobResponse.data.data;
                    const offerId = job.selectedOffer?._id;

                    const { data } = await axiosInstance.get('/customer/payments', {
                        params: { offerId, jobId },
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (!data.data.paymentCompleted) {
                        router.push(`/payment?jobId=${jobId}&offerId/${offerId}`);
                        return;
                    }

                    setOrderData(data.data);
                    setOrderType('offer');
                }
            } catch (error) {
                handleError(error);
            } finally {
                setLoading(false);
            }
        };

        if (token && jobId) {
            fetchOrderData();
        }
    }, [token, jobId, quotationId, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg text-gray-600">Loading order details...</span>
                </div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="lucide:alert-circle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Order not found</h2>
                    <p className="text-gray-600 mb-6">Unable to load order details.</p>
                    <Link href="/my-account">
                        <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                            Go to My Account
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    // 🔥 Determine data structure based on order type
    const isQuotation = orderType === 'quotation';
    
    // Extract data based on type
    const quotation = isQuotation ? orderData.quotation : null;
    const job = isQuotation ? null : orderData.job;
    const offer = isQuotation ? null : orderData.offer;
    const repairmanProfile = orderData.repairmanProfile;
    const paymentId = orderData.paymentId;

    // Calculate pricing based on type
    let totalPrice, currency, estimatedTime, warranty, deviceBrand, deviceModel, services;

    if (isQuotation) {
        totalPrice = quotation.pricing.totalAmount;
        currency = quotation.pricing.currency || 'PKR';
        estimatedTime = quotation.serviceDetails?.estimatedDuration ? 
            `${quotation.serviceDetails.estimatedDuration} days` : 'TBD';
        warranty = quotation.serviceDetails?.warranty?.duration || 'N/A';
        deviceBrand = quotation.deviceInfo?.brandName;
        deviceModel = quotation.deviceInfo?.modelName;
        services = quotation.deviceInfo?.repairServices?.join(', ') || 'N/A';
    } else {
        const basePrice = offer?.pricing.totalPrice || 0;
        const deliveryFee = 0;
        const discount = 0;
        const tax = Math.round((basePrice + deliveryFee - discount) * 0.00);
        totalPrice = basePrice + deliveryFee + tax - discount;
        currency = offer?.pricing.currency || 'PKR';
        estimatedTime = `${offer.estimatedTime.value} ${offer.estimatedTime.unit}`;
        warranty = offer.warranty.duration;
        deviceBrand = job.deviceInfo.brand;
        deviceModel = job.deviceInfo.model;
        services = job.services.join(', ');
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full text-center relative overflow-hidden">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon icon="lucide:check" className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
                <p className="text-gray-600 mb-8">
                    Your {isQuotation ? 'quotation' : 'repair request'} has been confirmed. {repairmanProfile?.name} will contact you within the next hour.
                </p>

                <div className="bg-gray-50 rounded-xl p-6 mb-8 space-y-4">
                    {paymentId && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Payment ID</span>
                            <span className="font-mono text-sm">{paymentId}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Amount Paid</span>
                        <span className="font-semibold text-lg text-green-600">
                            {currency} {totalPrice.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Estimated Time</span>
                        <span className="font-semibold">{estimatedTime}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Warranty</span>
                        <span className="font-semibold">{warranty} days</span>
                    </div>
                </div>

                {/* Service & Repairman Details */}
                <div className="bg-primary-50 rounded-xl p-6 mb-8 text-left">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Icon icon="lucide:wrench" className="w-5 h-5 text-primary-600" />
                        Service Details
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                        <p><strong>Device:</strong> {deviceBrand} {deviceModel}</p>
                        <p><strong>Service:</strong> {services}</p>
                        <p><strong>Repairman:</strong> {repairmanProfile?.name} ({repairmanProfile?.shopName})</p>
                        <p><strong>Contact:</strong> {repairmanProfile?.mobileNumber || repairmanProfile?.phone}</p>
                        
                        {isQuotation ? (
                            <>
                                {quotation.serviceDetails?.serviceType === 'pickup' && (
                                    <p className="text-green-600">✓ Pickup service will be arranged</p>
                                )}
                                {quotation.serviceDetails?.serviceType === 'home-service' && (
                                    <p className="text-green-600">✓ Home service will be provided</p>
                                )}
                                {quotation.serviceDetails?.serviceType === 'drop-off' && (
                                    <p>Drop-off at service center</p>
                                )}
                                {quotation.repairmanNotes && (
                                    <p className="mt-2 italic text-gray-600">
                                        <strong>Note:</strong> {quotation.repairmanNotes}
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                {offer?.serviceOptions?.pickupAvailable ? (
                                    <p className="text-green-600">✓ Pickup service will be arranged</p>
                                ) : (
                                    <p>Drop-off at: {offer?.serviceOptions?.dropOffLocation}</p>
                                )}
                                <p><strong>Service starts by:</strong> {new Date(offer.availability.canStartBy).toLocaleDateString()}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Link href="/my-account" className="block">
                        <button className="w-full bg-gradient-to-r from-primary-600 to-primary-600 text-white py-4 rounded-xl font-medium hover:from-primary-700 hover:to-primary-600 transition-all duration-500 shadow-lg">
                            Track Your Order
                        </button>
                    </Link>

                    <Link href="/" className="block">
                        <button className="w-full text-gray-600 py-3 rounded-xl font-medium hover:text-gray-900 transition-colors">
                            Back to Home
                        </button>
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t text-sm text-gray-500">
                    <p>Need help? Contact us at support@example.com</p>
                </div>
            </div>
        </div>
    );
}

export default OrderConfirmation;