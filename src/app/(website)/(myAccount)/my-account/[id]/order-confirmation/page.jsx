"use client"

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';

function OrderConfirmation() {
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);

    const { id: jobId } = useParams();
    const token = useSelector(state => state.auth.token);
    const router = useRouter();

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                setLoading(true);
                
                // Fetch job details to get offerId
                const jobResponse = await axiosInstance.get(`/repair-jobs/${jobId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const job = jobResponse.data.data;
                const offerId = job.selectedOffer; // Assuming job has selectedOffer field

                // Fetch payment/order data
                const { data } = await axiosInstance.get('/customer/payments', {
                    params: { offerId, jobId },
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Check if payment is completed
                if (!data.data.paymentCompleted) {
                    // Redirect back to checkout if payment not completed
                    router.push(`/my-account/${jobId}/offer/${offerId}/check-out`);
                    return;
                }

                setOrderData(data.data);
            } catch (error) {
                handleError(error);
                // Redirect to my account on error
                router.push('/my-account');
            } finally {
                setLoading(false);
            }
        };

        if (token && jobId) {
            fetchOrderData();
        }
    }, [token, jobId, router]);

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

    const { job, offer, repairmanProfile, paymentId } = orderData;

    // Calculate pricing
    const basePrice = offer?.pricing.totalPrice;
    const partsEstimate = offer?.pricing.partsEstimate;
    const laborPrice = offer?.pricing.basePrice;
    const deliveryFee = 0;
    const discount = 0;
    const tax = Math.round((basePrice + deliveryFee - discount) * 0.00);
    const totalPrice = basePrice + deliveryFee + tax - discount;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full text-center relative overflow-hidden">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                    <Icon icon="lucide:check" className="w-10 h-10 text-white" />
                </div>

                {/* Success Message */}
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
                <p className="text-gray-600 mb-8">
                    Your repair request has been confirmed. {repairmanProfile?.name} will contact you within the next hour.
                </p>

                {/* Order Details */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Order ID</span>
                        <span className="font-mono font-semibold text-lg">#{job._id.slice(-6).toUpperCase()}</span>
                    </div>
                    
                    {paymentId && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Payment ID</span>
                            <span className="font-mono text-sm">{paymentId}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Amount Paid</span>
                        <span className="font-semibold text-lg text-green-600">
                            {offer?.pricing.currency} {totalPrice.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Estimated Time</span>
                        <span className="font-semibold">
                            {offer.estimatedTime.value} {offer.estimatedTime.unit}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Warranty</span>
                        <span className="font-semibold">{offer.warranty.duration} days</span>
                    </div>
                </div>

                {/* Service & Repairman Details */}
                <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Icon icon="lucide:wrench" className="w-5 h-5 text-primary-600" />
                        Service Details
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                        <p><strong>Device:</strong> {job.deviceInfo.brand} {job.deviceInfo.model}</p>
                        <p><strong>Service:</strong> {job.services.join(', ')}</p>
                        <p><strong>Repairman:</strong> {repairmanProfile?.name} ({repairmanProfile?.shopName})</p>
                        <p><strong>Contact:</strong> {repairmanProfile?.mobileNumber}</p>
                        {offer?.serviceOptions?.pickupAvailable ? (
                            <p className="text-green-600">✓ Pickup service will be arranged</p>
                        ) : (
                            <p>Drop-off at: {offer?.serviceOptions?.dropOffLocation}</p>
                        )}
                        <p><strong>Service starts by:</strong> {new Date(offer.availability.canStartBy).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Link href="/my-account" className="block">
                        <button className="w-full bg-gradient-to-r from-primary-600 to-primary-600 text-white py-4 rounded-xl font-medium hover:from-primary-700 hover:to-primary-700 transition-all duration-300 shadow-lg transform hover:scale-105">
                            Track Your Order
                        </button>
                    </Link>

                    <button 
                        onClick={() => window.print()}
                        className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        <Icon icon="lucide:download" className="w-5 h-5" />
                        Download Receipt
                    </button>

                    <Link href="/" className="block">
                        <button className="w-full text-gray-600 py-3 rounded-xl font-medium hover:text-gray-900 transition-colors">
                            Back to Home
                        </button>
                    </Link>
                </div>

                {/* Support Info */}
                <div className="mt-8 pt-6 border-t text-sm text-gray-500">
                    <p>Need help? Contact us at support@example.com</p>
                </div>
            </div>
        </div>
    );
}

export default OrderConfirmation;