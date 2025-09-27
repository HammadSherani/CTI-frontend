"use client"

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Link from 'next/link';

function CheckoutPage() {
    const [showOrderConfirm, setShowOrderConfirm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState(2);
    const [timeRemaining, setTimeRemaining] = useState(15 * 60);
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolder: ''
    });
    const [errors, setErrors] = useState({});
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const [discount, setDiscount] = useState(0);

    // State for API data
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);

    const { id: jobId, offerId } = useParams();
    const token = useSelector(state => state.auth.token);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                setLoading(true);
                const { data } = await axiosInstance.get('/customer/payments', {
                    params: { offerId, jobId },
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log(data);
                setOrderData(data.data);
            } catch (error) {
                handleError(error);
            } finally {
                setLoading(false);
            }
        };

        if (token && offerId && jobId) {
            fetchOrderData();
        }
    }, [token, offerId, jobId]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const validateForm = () => {
        const newErrors = {};
        if (selectedPaymentMethod === 'card') {
            if (!cardDetails.cardNumber || !/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
                newErrors.cardNumber = "Please enter a valid 16-digit card number";
            }
            if (!cardDetails.expiryDate || !/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
                newErrors.expiryDate = "Please enter a valid expiry date (MM/YY)";
            }
            if (!cardDetails.cvv || !/^\d{3,4}$/.test(cardDetails.cvv)) {
                newErrors.cvv = "Please enter a valid CVV (3-4 digits)";
            }
            if (!cardDetails.cardHolder || cardDetails.cardHolder.trim().length < 2) {
                newErrors.cardHolder = "Please enter a valid cardholder name";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePayment = async () => {
        if (!validateForm()) return;

        setIsProcessing(true);

        try {
            // Step 1: Process Payment
            const paymentResponse = await axiosInstance.post(
                '/customer/payments/process',
                {}, // No body
                {
                    params: { offerId, jobId },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Step 2: If payment successful
            if (paymentResponse.status === 200) {
                toast.success(paymentResponse.data.message || "Payment successful!");
                setShowOrderConfirm(true);

                // Step 3: Create Repair Job
                await bookRepairJob();
            }

        } catch (error) {
            handleError(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const bookRepairJob = async () => {
        try {
            const { data } = await axiosInstance.post(
                `/repair-jobs/${jobId}/select-offer`,
                {
                    offerId,
                    serviceType: "drop-off",
                    scheduledDate: offer.availability.canStartBy
                },
                {
                    params: { jobId },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setOrderData(data.data);
            console.log("Repair job created:", data);
        } catch (error) {
            handleError(error);
        }
    };



    const handleCardInput = (e) => {
        const { name, value } = e.target;
        if (name === 'cardNumber') {
            const formattedValue = value
                .replace(/\D/g, '')
                .match(/.{1,4}/g)
                ?.join(' ')
                .slice(0, 19) || value;
            setCardDetails({ ...cardDetails, [name]: formattedValue });
        } else if (name === 'expiryDate') {
            const formattedValue = value
                .replace(/\D/g, '')
                .match(/.{1,2}/g)
                ?.join('/')
                .slice(0, 5) || value;
            setCardDetails({ ...cardDetails, [name]: formattedValue });
        } else {
            setCardDetails({ ...cardDetails, [name]: value });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/40 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg text-gray-600">Loading checkout...</span>
                </div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="min-h-screen bg-gray-50/40 flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="lucide:alert-circle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load order data</h2>
                    <p className="text-gray-600">Please try again or contact support.</p>
                </div>
            </div>
        );
    }

    const { job, offer, repairmanProfile } = orderData;

    // Calculate pricing
    const basePrice = offer?.pricing.totalPrice;
    const partsEstimate = offer?.pricing.partsEstimate;
    const laborPrice = offer?.pricing.basePrice;
    const deliveryFee = offer.serviceOptions.pickupAvailable ? 0 : 200;
    const tax = Math.round((basePrice + deliveryFee - discount) * 0.13);
    const totalPrice = basePrice + deliveryFee + tax - discount;

    const paymentMethods = [
        { id: 'card', name: 'Credit/Debit Card', icon: 'lucide:credit-card' },
    ];

    if (showOrderConfirm) {
        return (
            <div className="min-h-screen bg-gray-50  flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
                <div className="bg-white rounded-3xl shadow-md p-8 max-w-md w-full text-center relative overflow-hidden transform transition-all duration-500 hover:shadow-3xl">
                    <div className="absolute top-0 left-0 w-full h-2 "></div>
                    <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                        <Icon icon="lucide:check" className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
                    <p className="text-gray-600 mb-8">Your repair request has been confirmed. {repairmanProfile.name} will contact you within the next hour.</p>

                    <div className="bg-gray-50 rounded-xl p-6 mb-8 space-y-4 transform transition-all duration-300 ">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Order ID</span>
                            <span className="font-mono font-semibold text-lg">#{job._id.slice(-6).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Amount Paid</span>
                            <span className="font-semibold text-lg text-green-600">{offer?.pricing.currency} {totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Estimated Time</span>
                            <span className="font-semibold">{offer.estimatedTime.value} {offer.estimatedTime.unit}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Link href={`/my-account`}>
                            <button className="w-full bg-gradient-to-r from-primary-600 to-primary-600 text-white py-4 rounded-xl font-medium hover:from-primary-700 hover:to-primary-700 transition-all duration-300 shadow-lg transform hover:scale-105">
                                Track Your Order
                            </button>
                        </Link>

                        <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-300 transform hover:scale-105">
                            Download Receipt
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/40 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Progress Bar */}
                <div className="flex justify-center mb-8 animate-fadeIn">
                    <div className="flex items-center gap-4">
                        {[
                            { step: 1, label: 'Personal Details', completed: true },
                            { step: 2, label: 'Payment', completed: false, current: true },
                            { step: 3, label: 'Complete', completed: false }
                        ].map(({ step, label, completed, current }) => (
                            <React.Fragment key={step}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 transform hover:scale-110 ${completed
                                        ? 'bg-green-500 text-white shadow-lg'
                                        : current
                                            ? 'bg-primary-600 text-white shadow-lg ring-4 ring-primary-200'
                                            : 'bg-gray-200 text-gray-400'
                                        }`}>
                                        {completed ? <Icon icon="lucide:check" className="w-6 h-6" /> : step}
                                    </div>
                                    <span className={`text-sm font-medium ${current ? 'text-primary-600' : completed ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {label}
                                    </span>
                                </div>
                                {step < 3 && (
                                    <div className={`w-20 h-1 rounded-full transition-all duration-300 ${completed ? 'bg-green-500' : 'bg-gray-200'
                                        }`}></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Service Details Card */}
                        <div className="bg-white rounded-md shadow-sm p-5 border border-gray-100 transform transition-all duration-300">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Icon icon="lucide:wrench" className="w-6 h-6 text-primary-600" />
                                Service Details
                            </h2>
                            <div className="rounded-xl p-6 mb-6 bg-gray-100 border border-gray-200">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center">
                                        <Icon icon="lucide:smartphone" className="w-8 h-8 text-primary-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-lg">{job.deviceInfo.brand} {job.deviceInfo.model} Repair</h3>
                                        <p className="text-sm text-gray-600 mb-3">{job.description}</p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="bg-gray-50 text-primary-700 px-3 py-1 rounded-full">{job.services.join(', ')}</span>
                                            <span className="text-gray-500">Urgency: {job.urgency}</span>
                                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                                                Warranty: {job.deviceInfo.warrantyStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Technician Info */}
                            <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 flex items-center gap-4 transform transition-all duration-300">
                                {repairmanProfile.profilePhoto ? (
                                    <img
                                        src={repairmanProfile.profilePhoto}
                                        alt={repairmanProfile.name}
                                        className="w-14 h-14 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Icon icon="lucide:user-check" className="w-8 h-8 text-gray-600" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 text-lg">{repairmanProfile.name}</p>
                                    <p className="text-sm text-gray-600 mb-1">{repairmanProfile.shopName}</p>
                                    <div className="flex items-center gap-3 text-sm text-gray-700">
                                        <div className="flex items-center gap-1">
                                            <Icon icon="lucide:star" className="w-5 h-5 fill-current text-yellow-400" />
                                            <span>{offer.experience.successRate}% Success Rate</span>
                                        </div>
                                        <span>•</span>
                                        <span>{offer.experience.similarRepairs} Similar Repairs</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 transform transition-all duration-300">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Icon icon="lucide:credit-card" className="w-6 h-6 text-primary-600" />
                                Payment Method
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                {paymentMethods.map(method => (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedPaymentMethod(method.id)}
                                        className={`p-4 rounded-lg border-[1px] transition-all duration-300 flex items-center gap-3 transform ${selectedPaymentMethod === method.id
                                            ? 'border-primary-500 border-[1px] bg-primary-50 text-primary-700 shadow-sm'
                                            : 'border-gray-200 border-[1px] hover:border-gray-300 text-gray-600'
                                            }`}
                                    >
                                        <Icon icon={method.icon} className="w-6 h-6" />
                                        <span className="font-medium text-sm">{method.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Card Details Form */}
                            {selectedPaymentMethod === 'card' && (
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="cardNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Card Number
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="cardNumber"
                                                name="cardNumber"
                                                value={cardDetails.cardNumber}
                                                onChange={handleCardInput}
                                                placeholder="1234 5678 9012 3456"
                                                maxLength="19"
                                                className={`w-full px-4 py-3 border-[1px] rounded-xl focus:outline-none focus:ring-0 focus:ring-primary-200 focus:border-primary-500 transition-all duration-300 ${errors.cardNumber ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                <Icon icon="lucide:credit-card" className="w-6 h-6 text-gray-400" />
                                            </div>
                                        </div>
                                        {errors.cardNumber && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                            <Icon icon="lucide:alert-circle" className="w-4 h-4" />
                                            {errors.cardNumber}
                                        </p>}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="expiryDate" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Expiry Date
                                            </label>
                                            <input
                                                type="text"
                                                id="expiryDate"
                                                name="expiryDate"
                                                value={cardDetails.expiryDate}
                                                onChange={handleCardInput}
                                                placeholder="MM/YY"
                                                maxLength="5"
                                                className={`w-full px-4 py-3 border-[1px] rounded-xl focus:outline-none focus:ring-0 focus:ring-primary-200 focus:border-primary-500 transition-all duration-300 ${errors.expiryDate ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                            />
                                            {errors.expiryDate && <p className="text-red-500 text-xs mt-2">{errors.expiryDate}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="cvv" className="block text-sm font-semibold text-gray-700 mb-2">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                id="cvv"
                                                name="cvv"
                                                value={cardDetails.cvv}
                                                onChange={handleCardInput}
                                                placeholder="123"
                                                maxLength="4"
                                                className={`w-full px-4 py-3 border-[1px] rounded-xl focus:outline-none focus:ring-0 focus:ring-primary-200 focus:border-primary-500 transition-all duration-300 ${errors.cvv ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                            />
                                            {errors.cvv && <p className="text-red-500 text-xs mt-2">{errors.cvv}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="cardHolder" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Card Holder
                                            </label>
                                            <input
                                                type="text"
                                                id="cardHolder"
                                                name="cardHolder"
                                                value={cardDetails.cardHolder}
                                                onChange={handleCardInput}
                                                placeholder="John Doe"
                                                className={`w-full px-4 py-3 border-[1px] rounded-xl focus:outline-none focus:ring-0 focus:ring-primary-200 focus:border-primary-500 transition-all duration-300 ${errors.cardHolder ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                            />
                                            {errors.cardHolder && <p className="text-red-500 text-xs mt-2">{errors.cardHolder}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 sticky top-6 transform transition-all duration-300">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Icon icon="lucide:receipt" className="w-6 h-6 text-primary-600" />
                                Order Summary
                            </h2>

                            {/* Service Item */}
                            <div className="bg-gray-50 rounded-xl p-6 mb-6 shadow-inner">
                                <div className="flex items-center gap-3 mb-3">
                                    <Icon icon="lucide:smartphone" className="w-6 h-6 text-primary-600" />
                                    <span className="font-medium text-gray-900 text-lg">{job.deviceInfo.brand} {job.deviceInfo.model}</span>
                                </div>
                                {/* <p className="text-sm text-gray-600 mb-3">{offer.description}</p> */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service:</span>
                                        <span className="font-medium">{job.services.join(', ')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Estimated time:</span>
                                        <span className="font-medium">{offer.estimatedTime.value} {offer.estimatedTime.unit}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Warranty:</span>
                                        <span className="font-medium">{offer.warranty.duration} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Parts Quality:</span>
                                        <span className="font-medium capitalize">{offer?.pricing.partsQuality.replace('-', ' ')}</span>
                                    </div>
                                </div>
                            </div>



                            {/* Price Breakdown */}
                            <div className="space-y-4 text-sm border-t pt-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Labor Cost</span>
                                    <span className="font-medium">{offer?.pricing.currency} {laborPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Parts Estimate</span>
                                    <span className="font-medium">{offer?.pricing.currency} {partsEstimate.toLocaleString()}</span>
                                </div>
                                {!offer.serviceOptions.pickupAvailable && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service Fee</span>
                                        <span className="font-medium">{offer?.pricing.currency} {deliveryFee}</span>
                                    </div>
                                )}
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount (SAVE10)</span>
                                        <span>-{offer?.pricing.currency} {discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax (13%)</span>
                                    <span className="font-medium">{offer?.pricing.currency} {tax.toLocaleString()}</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between text-lg font-bold">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-primary-600">{offer?.pricing.currency} {totalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Service Options Info */}
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon icon="lucide:info" className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium text-blue-800">Service Details</span>
                                </div>
                                <div className="text-sm text-blue-700 space-y-1">
                                    {offer.serviceOptions.pickupAvailable ? (
                                        <p>✓ Pickup service available</p>
                                    ) : (
                                        <p>• Drop-off required at: {offer.serviceOptions.dropOffLocation}</p>
                                    )}
                                    {offer.serviceOptions.homeService && (
                                        <p>✓ Home service available</p>
                                    )}
                                    <p>• Service starts by: {new Date(offer.availability.canStartBy).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Payment Button */}
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing || (selectedPaymentMethod === 'card' && Object.keys(errors).length > 0)}
                                className="w-full bg-gradient-to-r from-primary-600 to-primary-600 text-white py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-6 flex items-center justify-center gap-3 transform hover:scale-105"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-5 h-5 border-[1px] border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="lucide:shield-check" className="w-6 h-6" />
                                        Complete Payment
                                    </>
                                )}
                            </button>

                            {/* Terms and Conditions */}
                            <div className="mt-6 flex items-start gap-3 text-sm text-gray-600">
                                <input type="checkbox" className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 rounded" />
                                <span>
                                    By proceeding, I agree to the{' '}
                                    <a href="#" className="text-primary-600 underline hover:text-primary-800">Terms of Service</a> and{' '}
                                    <a href="#" className="text-primary-600 underline hover:text-primary-800">Privacy Policy</a>
                                </span>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-6 pt-4 border-t flex items-center justify-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Icon icon="lucide:shield" className="w-5 h-5" />
                                    <span>SSL Secure</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icon icon="lucide:lock" className="w-5 h-5" />
                                    <span>256-bit Encryption</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;