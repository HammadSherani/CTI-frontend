"use client"

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const cardSchema = yup.object().shape({
    cardNumber: yup
        .string()
        .required('Card number is required')
        .test('valid-card', 'Please enter a valid 16-digit card number', (value) => {
            if (!value) return false;
            return /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(value);
        }),
    expiryDate: yup
        .string()
        .required('Expiry date is required')
        .matches(/^\d{2}\/\d{2}$/, 'Please enter a valid expiry date (MM/YY)'),
    cvv: yup
        .string()
        .required('CVV is required')
        .matches(/^\d{3,4}$/, 'Please enter a valid CVV (3-4 digits)'),
    cardHolder: yup
        .string()
        .required('Cardholder name is required')
        .min(2, 'Please enter a valid cardholder name')
});

function QuotationPayment({ quotationId, jobId, token, router }) {
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const [discount, setDiscount] = useState(0);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm({
        resolver: yupResolver(cardSchema),
        mode: 'onChange',
        defaultValues: {
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            cardHolder: ''
        }
    });

    useEffect(() => {
        const fetchQuotationData = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/customer/payments', {
                    params: { quotationId },
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.data.paymentCompleted) {
                    router.push(`/payment/order-confirmation?quotationId=${quotationId}`);
                    return;
                }


                

                setOrderData(response.data.data.quotation);
            } catch (error) {
                handleError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotationData();
    }, [quotationId, token, router, jobId]);

    const onSubmit = async (formData) => {
        setIsProcessing(true);

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: { quotationId, jobId },
            };

            // Step 1: Process payment
            const { status, data } = await axiosInstance.post('/customer/payments/process', {}, config);

            if (status !== 200) {
                throw new Error(data?.message || "Payment failed!");
            }

            toast.success(data?.message || "Payment successful!");

            // Step 2: Update chat quotation response
            try {
                await axiosInstance.post(
                    `/chat/quotation/${quotationId}/respond`,
                    { action: "accepted" },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.warn("Chat update failed:", err);
                handleError(err);
            }

            // Optionally redirect user after successful operations
            router.push(`/payment/order-confirmation?jobId=${jobId}`);
        } catch (error) {
            handleError(error);
        } finally {
            setIsProcessing(false);
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
            setValue(name, formattedValue, { shouldValidate: true });
        } else if (name === 'expiryDate') {
            const formattedValue = value
                .replace(/\D/g, '')
                .match(/.{1,2}/g)
                ?.join('/')
                .slice(0, 5) || value;
            setValue(name, formattedValue, { shouldValidate: true });
        } else {
            setValue(name, value, { shouldValidate: true });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/40 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg text-gray-600">Loading quotation checkout...</span>
                </div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="min-h-screen bg-gray-50/40 flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="lucide:alert-circle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load quotation data</h2>
                    <p className="text-gray-600">Please try again or contact support.</p>
                </div>
            </div>
        );
    }

    const quotation = orderData;
    const repairmanProfile = quotation.repairmanId?.repairmanProfile || {};

    // Pricing from quotation.pricing
    const laborPrice = quotation.pricing?.serviceCharge || 0;
    const partsEstimate = quotation.pricing?.partsPrice || 0;
    const deliveryFee = quotation.serviceDetails?.serviceType === 'pickup' ? 0 : 0; // Delivery fee if needed
    const tax = Math.round((laborPrice + partsEstimate + deliveryFee - discount) * 0.00);
    const totalPrice = quotation.pricing?.totalAmount || (laborPrice + partsEstimate + deliveryFee + tax - discount);

    return (
        <div className="min-h-screen bg-gray-50/40 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <Icon icon="lucide:info" className="w-5 h-5 text-primary-600" />
                        <span className="font-medium text-primary-800">Quotation Payment</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Service Details */}
                        <div className="bg-white rounded-md shadow-sm p-5 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Icon icon="lucide:file-text" className="w-6 h-6 text-primary-600" />
                                Quotation Details
                            </h2>
                            <div className="rounded-xl p-6 mb-6 bg-gray-100 border border-gray-200">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center">
                                        <Icon icon="lucide:smartphone" className="w-8 h-8 text-primary-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-lg">
                                            {quotation.deviceInfo?.brandName} {quotation.deviceInfo?.modelName} Repair
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">{quotation.serviceDetails?.description}</p>
                                        <div className="flex items-center gap-4 text-sm flex-wrap">
                                            <span className="bg-gray-50 text-primary-700 px-3 py-1 rounded-full">
                                                {quotation.deviceInfo?.repairServices?.join(', ')}
                                            </span>
                                            {/* {quotation.serviceDetails?.warranty?.duration && (
                                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                                                    Warranty: {quotation.serviceDetails.warranty.duration} days
                                                </span>
                                            )} */}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Technician Info */}
                            <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 flex items-center gap-4">
                                {repairmanProfile?.profilePhoto ? (
                                    <img
                                        src={repairmanProfile.profilePhoto}
                                        alt={quotation.repairmanId?.name}
                                        className="w-14 h-14 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Icon icon="lucide:user-check" className="w-8 h-8 text-gray-600" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 text-lg">{quotation.repairmanId?.name}</p>
                                    <p className="text-sm text-gray-600 mb-1">{repairmanProfile?.shopName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Icon icon="lucide:credit-card" className="w-6 h-6 text-primary-600" />
                                Payment Method
                            </h2>

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
                                                {...register('cardNumber')}
                                                onChange={handleCardInput}
                                                placeholder="1234 5678 9012 3456"
                                                maxLength="19"
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 ${errors.cardNumber ? 'border-red-500' : 'border-gray-200'}`}
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <Icon icon="lucide:credit-card" className="w-6 h-6 text-gray-400" />
                                            </div>
                                        </div>
                                        {errors.cardNumber && (
                                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                                <Icon icon="lucide:alert-circle" className="w-4 h-4" />
                                                {errors.cardNumber.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="expiryDate" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Expiry Date
                                            </label>
                                            <input
                                                type="text"
                                                id="expiryDate"
                                                {...register('expiryDate')}
                                                onChange={handleCardInput}
                                                placeholder="MM/YY"
                                                maxLength="5"
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 ${errors.expiryDate ? 'border-red-500' : 'border-gray-200'}`}
                                            />
                                            {errors.expiryDate && <p className="text-red-500 text-xs mt-2">{errors.expiryDate.message}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="cvv" className="block text-sm font-semibold text-gray-700 mb-2">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                id="cvv"
                                                {...register('cvv')}
                                                placeholder="123"
                                                maxLength="4"
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 ${errors.cvv ? 'border-red-500' : 'border-gray-200'}`}
                                            />
                                            {errors.cvv && <p className="text-red-500 text-xs mt-2">{errors.cvv.message}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="cardHolder" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Card Holder
                                            </label>
                                            <input
                                                type="text"
                                                id="cardHolder"
                                                {...register('cardHolder')}
                                                placeholder="John Doe"
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 ${errors.cardHolder ? 'border-red-500' : 'border-gray-200'}`}
                                            />
                                            {errors.cardHolder && <p className="text-red-500 text-xs mt-2">{errors.cardHolder.message}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 sticky top-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Icon icon="lucide:receipt" className="w-6 h-6 text-primary-600" />
                                Order Summary
                            </h2>

                            <div className="bg-gray-50 rounded-xl p-6 mb-6 shadow-inner">
                                <div className="flex items-center gap-3 mb-3">
                                    <Icon icon="lucide:smartphone" className="w-6 h-6 text-primary-600" />
                                    <span className="font-medium text-gray-900 text-lg">
                                        {quotation.deviceInfo?.brandName} {quotation.deviceInfo?.modelName}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service:</span>
                                        <span className="font-medium">{quotation.deviceInfo?.repairServices?.join(', ')}</span>
                                    </div>
                                    {quotation.serviceDetails?.estimatedDuration && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Estimated time:</span>
                                            <span className="font-medium">{quotation.serviceDetails.estimatedDuration} days</span>
                                        </div>
                                    )}
                                    {quotation.serviceDetails?.warranty?.duration && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Warranty:</span>
                                            <span className="font-medium">{quotation.serviceDetails.warranty.duration} days</span>
                                        </div>
                                    )}
                                    {quotation.partsQuality && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Parts Quality:</span>
                                            <span className="font-medium capitalize">{quotation.partsQuality.replace('-', ' ')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 text-sm border-t pt-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Service Charge</span>
                                    <span className="font-medium">{quotation.pricing?.currency || 'PKR'} {laborPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Parts Price</span>
                                    <span className="font-medium">{quotation.pricing?.currency || 'PKR'} {partsEstimate.toLocaleString()}</span>
                                </div>
                                {deliveryFee > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Delivery Fee</span>
                                        <span className="font-medium">{quotation.pricing?.currency || 'PKR'} {deliveryFee}</span>
                                    </div>
                                )}
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-{quotation.pricing?.currency || 'PKR'} {discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">{quotation.pricing?.currency || 'PKR'} {tax.toLocaleString()}</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between text-lg font-bold">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-primary-600">{quotation.pricing?.currency || 'PKR'} {totalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon icon="lucide:info" className="w-5 h-5 text-primary-600" />
                                    <span className="font-medium text-primary-800">Service Details</span>
                                </div>
                                <div className="text-sm text-primary-700 space-y-1">
                                    {quotation.serviceDetails?.serviceType === 'pickup' ? (
                                        <p>✓ Pickup service available</p>
                                    ) : quotation.serviceDetails?.serviceType === 'home-service' ? (
                                        <p>✓ Home service available</p>
                                    ) : (
                                        <p>• Drop-off required at service center</p>
                                    )}
                                    {quotation.repairmanNotes && (
                                        <p className="text-xs mt-2 italic">Note: {quotation.repairmanNotes}</p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit(onSubmit)}
                                disabled={isProcessing || Object.keys(errors).length > 0}
                                className="w-full bg-gradient-to-r from-primary-600 to-primary-600 text-white py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-6 flex items-center justify-center gap-3"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="lucide:shield-check" className="w-6 h-6" />
                                        Complete Payment
                                    </>
                                )}
                            </button>

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

function OfferPayment({ offerId, jobId, token, router }) {
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const [discount, setDiscount] = useState(0);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm({
        resolver: yupResolver(cardSchema),
        mode: 'onChange',
        defaultValues: {
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            cardHolder: ''
        }
    });

    useEffect(() => {
        const fetchOfferData = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/customer/payments', {
                    params: { offerId, jobId },
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.data.paymentCompleted) {
                    // router.push(`/payment/order-confirmation?jobId=${jobId}&offerId=${offerId}`);
                    return;
                }

                setOrderData(response.data.data);
            } catch (error) {
                handleError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOfferData();
    }, [offerId, jobId, token, router]);

    const onSubmit = async (formData) => {
        setIsProcessing(true);
        try {
            const paymentResponse = await axiosInstance.post(
                '/customer/payments/process',
                {},
                {
                    params: { offerId, jobId },
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            await axiosInstance.post(
                `/repair-jobs/${jobId}/select-offer`,
                {
                    offerId,
                    scheduledDate: offer?.availability?.canStartBy
                    // serviceType: offer?.serviceType
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success(paymentResponse.data.message || "Payment successful!");
            router.push(`/my-account/${jobId}/order-confirmation`);

        } catch (error) {
            handleError(error);
        } finally {
            setIsProcessing(false);
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
            setValue(name, formattedValue, { shouldValidate: true });
        } else if (name === 'expiryDate') {
            const formattedValue = value
                .replace(/\D/g, '')
                .match(/.{1,2}/g)
                ?.join('/')
                .slice(0, 5) || value;
            setValue(name, formattedValue, { shouldValidate: true });
        } else {
            setValue(name, value, { shouldValidate: true });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/40 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg text-gray-600">Loading offer checkout...</span>
                </div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="min-h-screen bg-gray-50/40 flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="lucide:alert-circle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load offer data</h2>
                    <p className="text-gray-600">Please try again or contact support.</p>
                </div>
            </div>
        );
    }

    const { job, offer, repairmanProfile } = orderData;
    const laborPrice = offer?.pricing?.basePrice || 0;
    const partsEstimate = offer?.pricing?.partsEstimate || 0;
    const deliveryFee = offer?.serviceOptions?.pickupAvailable ? 0 : (offer?.deliveryFee || 0);
    const tax = Math.round((laborPrice + partsEstimate + deliveryFee - discount) * 0.00);
    const totalPrice = laborPrice + partsEstimate + deliveryFee + tax - discount;

    return (
        <div className="min-h-screen bg-gray-50/40 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <Icon icon="lucide:check-circle" className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Offer Payment</span>
                    </div>
                </div> */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Service Details */}
                        <div className="bg-white rounded-md shadow-sm p-5 border border-gray-100">
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
                                        <h3 className="font-semibold text-gray-900 text-lg">{job?.deviceInfo?.brand} {job?.deviceInfo?.model} Repair</h3>
                                        <p className="text-sm text-gray-600 mb-3">{job?.description || offer?.description}</p>
                                        <div className="flex items-center gap-4 text-sm flex-wrap">
                                            {/* <span className="bg-gray-50 text-primary-700 px-3 py-1 rounded-full">{job?.services?.join(', ')}</span> */}
                                            {job?.urgency && <span className="text-gray-500">Urgency: {job?.urgency}</span>}
                                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                                                Warranty: {offer?.warranty?.duration} days
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 flex items-center gap-4">
                                {repairmanProfile?.profilePhoto ? (
                                    <img
                                        src={repairmanProfile?.profilePhoto}
                                        alt={repairmanProfile?.name}
                                        className="w-14 h-14 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Icon icon="lucide:user-check" className="w-8 h-8 text-gray-600" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 text-lg">{repairmanProfile?.name}</p>
                                    <p className="text-sm text-gray-600 mb-1">{repairmanProfile?.shopName}</p>
                                    <div className="flex items-center gap-3 text-sm text-gray-700">
                                        <div className="flex items-center gap-1">
                                            <Icon icon="lucide:star" className="w-5 h-5 fill-current text-yellow-400" />
                                            <span>{offer?.experience?.successRate || repairmanProfile?.rating || 'N/A'}% Success Rate</span>
                                        </div>
                                        <span>•</span>
                                        <span>{offer?.experience?.similarRepairs || repairmanProfile?.totalRepairs || 0} Similar Repairs</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Icon icon="lucide:credit-card" className="w-6 h-6 text-primary-600" />
                                Payment Method
                            </h2>

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
                                                {...register('cardNumber')}
                                                onChange={handleCardInput}
                                                placeholder="1234 5678 9012 3456"
                                                maxLength="19"
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 ${errors.cardNumber ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <Icon icon="lucide:credit-card" className="w-6 h-6 text-gray-400" />
                                            </div>
                                        </div>
                                        {errors.cardNumber && (
                                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                                <Icon icon="lucide:alert-circle" className="w-4 h-4" />
                                                {errors.cardNumber.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="expiryDate" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Expiry Date
                                            </label>
                                            <input
                                                type="text"
                                                id="expiryDate"
                                                {...register('expiryDate')}
                                                onChange={handleCardInput}
                                                placeholder="MM/YY"
                                                maxLength="5"
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 ${errors.expiryDate ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                            />
                                            {errors.expiryDate && <p className="text-red-500 text-xs mt-2">{errors.expiryDate.message}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="cvv" className="block text-sm font-semibold text-gray-700 mb-2">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                id="cvv"
                                                {...register('cvv')}
                                                placeholder="123"
                                                maxLength="4"
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 ${errors.cvv ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                            />
                                            {errors.cvv && <p className="text-red-500 text-xs mt-2">{errors.cvv.message}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="cardHolder" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Card Holder
                                            </label>
                                            <input
                                                type="text"
                                                id="cardHolder"
                                                {...register('cardHolder')}
                                                placeholder="John Doe"
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 ${errors.cardHolder ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                            />
                                            {errors.cardHolder && <p className="text-red-500 text-xs mt-2">{errors.cardHolder.message}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 sticky top-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Icon icon="lucide:receipt" className="w-6 h-6 text-primary-600" />
                                Order Summary
                            </h2>

                            <div className="bg-gray-50 rounded-xl p-6 mb-6 shadow-inner">
                                <div className="flex items-center gap-3 mb-3">
                                    <Icon icon="lucide:smartphone" className="w-6 h-6 text-primary-600" />
                                    <span className="font-medium text-gray-900 text-lg">{job?.deviceInfo?.brand} {job?.deviceInfo?.model}</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service:</span>
                                        <span className="font-medium">{job?.services?.join(', ')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Estimated time:</span>
                                        <span className="font-medium">
                                            {offer?.estimatedTime?.value} {offer?.estimatedTime?.unit}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Warranty:</span>
                                        <span className="font-medium">{offer?.warranty?.duration} days</span>
                                    </div>
                                    {offer?.pricing?.partsQuality && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Parts Quality:</span>
                                            <span className="font-medium capitalize">{offer.pricing.partsQuality.replace('-', ' ')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 text-sm border-t pt-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Labor Cost</span>
                                    <span className="font-medium">{offer?.pricing?.currency || 'PKR'} {laborPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Parts Estimate</span>
                                    <span className="font-medium">{offer?.pricing?.currency || 'PKR'} {partsEstimate.toLocaleString()}</span>
                                </div>
                                {!offer?.serviceOptions?.pickupAvailable && deliveryFee > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service Fee</span>
                                        <span className="font-medium">{offer?.pricing?.currency || 'PKR'} {deliveryFee}</span>
                                    </div>
                                )}
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-{offer?.pricing?.currency || 'PKR'} {discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">{offer?.pricing?.currency || 'PKR'} {tax.toLocaleString()}</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between text-lg font-bold">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-primary-600">{offer?.pricing?.currency || 'PKR'} {totalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon icon="lucide:info" className="w-5 h-5 text-primary-600" />
                                    <span className="font-medium text-primary-800">Service Details</span>
                                </div>
                                <div className="text-sm text-primary-700 space-y-1">
                                    {offer?.serviceOptions?.pickupAvailable ? (
                                        <p>✓ Pickup service available</p>
                                    ) : (
                                        <p>• Drop-off required at service center</p>
                                    )}
                                    {offer?.serviceOptions?.homeService && (
                                        <p>✓ Home service available</p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit(onSubmit)}
                                disabled={isProcessing || Object.keys(errors).length > 0}
                                className="w-full bg-gradient-to-r from-primary-600 to-primary-600 text-white py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-6 flex items-center justify-center gap-3"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="lucide:shield-check" className="w-6 h-6" />
                                        Complete Payment
                                    </>
                                )}
                            </button>

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

function PaymentPage() {
    const token = useSelector(state => state.auth.token);
    const router = useRouter();
    const searchParams = useSearchParams();

    const offerId = searchParams.get('offerId');
    const jobId = searchParams.get('jobId');
    const quotationId = searchParams.get('quotationId');

    if (quotationId) {
        return <QuotationPayment quotationId={quotationId} jobId={jobId} token={token} router={router} />;
    } else if (offerId && jobId) {
        return <OfferPayment offerId={offerId} jobId={jobId} token={token} router={router} />;
    } else {
        return (
            <div className="min-h-screen bg-gray-50/40 flex items-center justify-center">
                <div className="text-center">
                    <Icon icon="lucide:alert-circle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Payment Request</h2>
                    <p className="text-gray-600 mb-4">Missing required parameters</p>
                    <button
                        onClick={() => router.push('/my-account')}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Go to My Account
                    </button>
                </div>
            </div>
        );
    }
}

export default PaymentPage;