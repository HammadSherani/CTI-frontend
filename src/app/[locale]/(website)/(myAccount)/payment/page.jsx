"use client"

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import IyzicoCheckoutForm from '@/components/payment/IyzicoCheckoutForm';

// After Iyzico sends the customer back (?payment=failed|verifying|pending), show the right state.
function usePaymentReturnStatus({ setPaymentVerifying, setPaymentAlreadyDone }) {
    const searchParams = useSearchParams();
    const status = searchParams.get('payment');
    const reason = searchParams.get('reason');

    useEffect(() => {
        if (status === 'failed') {
            toast.error(reason || 'Payment failed. Please try again.', { toastId: 'payment-return' });
        } else if (status === 'verifying') {
            setPaymentVerifying(true);
        } else if (status === 'pending') {
            setPaymentAlreadyDone(true);
            toast.warning('Payment received, but your booking is not confirmed yet. Please click "Confirm Booking".', { toastId: 'payment-return' });
        }
    }, [status, reason, setPaymentVerifying, setPaymentAlreadyDone]);
}

// Card entry happens inside Iyzico's hosted form (with 3D Secure); we only start it.
function SecureCheckoutPanel({ checkoutContent, isProcessing, disabled, paymentAlreadyDone, onStart, onCancel }) {
    if (checkoutContent) {
        return (
            <div>
                <IyzicoCheckoutForm content={checkoutContent} />
                <button
                    type="button"
                    onClick={onCancel}
                    className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
                >
                    Cancel and go back
                </button>
            </div>
        );
    }

    if (paymentAlreadyDone) {
        return (
            <p className="text-sm text-gray-600">
                Your payment has been received. Use &quot;Confirm Booking&quot; to finish your booking. You will not be charged again.
            </p>
        );
    }

    // Only information here: the single "Pay Securely" button is in the Order Summary
    return (
        <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <Icon icon="lucide:shield-check" className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div className="text-sm text-gray-600">
                <p className="font-semibold text-gray-800">Secure card payment by iyzico</p>
                <p>
                    {isProcessing
                        ? 'Preparing your secure payment form…'
                        : <>Press <span className="font-semibold">Pay Securely</span> in the order summary. You will enter your card details in iyzico&apos;s secure form and confirm with your bank (3D Secure). Your card details never reach our servers.</>}
                </p>
            </div>
        </div>
    );
}



const userDetailsSchema = yup.object().shape({
    firstName: yup
        .string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters')
        .max(100, 'First name cannot exceed 100 characters')
        .matches(/^[a-zA-Z\s]+$/, 'Only letters are allowed'),
    lastName: yup
        .string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters')
        .max(100, 'Last name cannot exceed 100 characters')
        .matches(/^[a-zA-Z\s]+$/, 'Only letters are allowed'),
    email: yup
        .string()
        .required('Email is required')
        .email('Please enter a valid email address'),
    phone: yup
        .string()
        .required('Phone number is required')
        .test('valid-phone', 'Phone number must be between 10-15 digits', (value) => {
            if (!value) return false;
            const phoneDigits = value.replace(/\D/g, '');
            return phoneDigits.length >= 10 && phoneDigits.length <= 15;
        }),

    identityNumber: yup
        .string()
        .required('Identity number is required')
        .matches(/^\d{11}$/, 'Identity number must be exactly 11 digits')
        .min(11, 'Identity number must be exactly 11 digits')
        .max(11, 'Identity number must be exactly 11 digits'),
    city: yup
        .string()
        .required('City is required')
        .min(2, 'City name must be at least 2 characters')
        .max(100, 'City name cannot exceed 100 characters'),
    country: yup
        .string()
        .required('Country is required')
        .min(2, 'Country name must be at least 2 characters')
        .max(100, 'Country name cannot exceed 100 characters'),
    address: yup
        .string()
        .required('Address is required')
        .min(10, 'Please enter a complete address (min 10 characters)')
        .max(200, 'Address cannot exceed 200 characters'),
});

// Brand / model / services arrive as populated objects ({ name }); show their names
// (a bare database id is never shown as a name)
const isDbId = (v) => typeof v === 'string' && /^[a-f0-9]{24}$/i.test(v);
const quoteName = (v) => {
    const name = v && typeof v === 'object' ? v.name : v;
    return name && !isDbId(name) ? name : '';
};
const quoteServices = (q) => (q?.deviceInfo?.repairServices || []).map(quoteName).filter(Boolean).join(', ');
const quoteDevice = (q) =>
    `${quoteName(q?.deviceInfo?.brand) || quoteName(q?.deviceInfo?.brandName)} ${quoteName(q?.deviceInfo?.model) || quoteName(q?.deviceInfo?.modelName)}`.trim();

function QuotationPayment({ quotationId, jobId, token, router }) {
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const [discount, setDiscount] = useState(0);
    const [isPickupSelected, setIsPickupSelected] = useState(false);
    const [pickupAddress, setPickupAddress] = useState('');
    const [paymentAlreadyDone, setPaymentAlreadyDone] = useState(false);
    const [paymentVerifying, setPaymentVerifying] = useState(false);

    const [checkoutContent, setCheckoutContent] = useState(null);
    const { locale } = useParams();

    usePaymentReturnStatus({ setPaymentVerifying, setPaymentAlreadyDone });

    // Payment already went through; accepting the quotation creates the booking (no new charge).
    const completePendingBooking = async () => {
        setIsProcessing(true);
        try {
            await axiosInstance.post(
                `/chat/quotation/${quotationId}/respond`,
                {
                    action: 'accepted',
                    isPickup: isPickupSelected,
                    pickupAddress: isPickupSelected ? pickupAddress.trim() : ''
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Booking confirmed!');
            router.push(`/payment/order-confirmation?quotationId=${quotationId}`);
        } catch (error) {
            handleError(error);
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        const fetchQuotationData = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/customer/payments', {
                    params: { quotationId },
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = response.data.data;
                if (data.paymentCompleted && data.bookingCompleted) {
                    router.push(`/payment/order-confirmation?quotationId=${quotationId}`);
                    return;
                }

                // Paid earlier but the booking was never created: only confirmation is left.
                setPaymentAlreadyDone(Boolean(data.paymentCompleted));
                setOrderData(data.quotation);
                // Pickup-only quotation (e.g. a service-catalog booking): pickup is already chosen
                // and the customer's address is known
                const sd = data.quotation?.serviceDetails;
                if (sd?.isPickup && !sd?.isDropoff) {
                    setIsPickupSelected(true);
                    if (sd.pickupLocation?.address) setPickupAddress(sd.pickupLocation.address);
                }
            } catch (error) {
                handleError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotationData();
    }, [quotationId, token, router, jobId]);

    // Opens the secure Iyzico form; the server validates everything and fixes the amount.
    const startCheckout = async () => {
        if (paymentVerifying) {
            toast.info('Your payment is being verified. Please refresh this page in a few minutes.');
            return;
        }
        if (paymentAlreadyDone) {
            return completePendingBooking();
        }
        if (isPickupSelected && !pickupAddress.trim()) {
            toast.error('Please enter pickup address');
            return;
        }

        setIsProcessing(true);
        try {
            const { data } = await axiosInstance.post(
                '/customer/payments/checkout/init',
                {
                    isPickup: isPickupSelected,
                    pickupAddress: isPickupSelected ? pickupAddress.trim() : '',
                    locale
                },
                {
                    params: { quotationId },
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (data?.data?.alreadyPaid) {
                toast.success(data.message);
                router.push(`/payment/order-confirmation?quotationId=${quotationId}`);
                return;
            }

            setCheckoutContent(data.data.checkoutFormContent);
        } catch (error) {
            handleError(error);
        } finally {
            setIsProcessing(false);
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

    const basePrice = quotation.pricing?.basePrice || 0;
    const partsEstimate = quotation.pricing?.partsPrice || 0;
    const serviceCharges = quotation.pricing?.serviceCharges || 0;
    const deliveryFee = 0;

    // Calculate pickup charge if selected
    const pickupCharge = isPickupSelected && quotation.serviceDetails?.isPickup && serviceCharges > 0
        ? serviceCharges
        : 0;

    const tax = Math.round((basePrice + partsEstimate + pickupCharge + deliveryFee - discount) * 0.00);
    const totalPrice = basePrice + partsEstimate + pickupCharge + deliveryFee + tax - discount;



    return (
        <div className="min-h-screen bg-gray-50/40 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {paymentVerifying && (
                    <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <Icon icon="lucide:clock" className="w-6 h-6 text-amber-600 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-amber-800">Verifying your payment</p>
                            <p className="text-sm text-amber-700">Please do not pay again. If the payment went through, your booking will be confirmed automatically. Refresh this page in a few minutes.</p>
                        </div>
                    </div>
                )}

                {paymentAlreadyDone && !paymentVerifying && (
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                        <Icon icon="lucide:circle-check" className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold text-green-800">Payment already received</p>
                            <p className="text-sm text-green-700">Your booking was not finalized. You won&apos;t be charged again, just confirm the booking.</p>
                        </div>
                        <button
                            type="button"
                            onClick={completePendingBooking}
                            disabled={isProcessing}
                            className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-60"
                        >
                            {isProcessing ? 'Confirming...' : 'Confirm Booking'}
                        </button>
                    </div>
                )}

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
                                            {quoteDevice(quotation) ? `${quoteDevice(quotation)} Repair` : 'Device Repair'}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">{quotation.serviceDetails?.description}</p>
                                        <div className="flex items-center gap-4 text-sm flex-wrap">
                                            <span className="bg-gray-50 text-primary-700 px-3 py-1 rounded-full">
                                                {quoteServices(quotation)}
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

                        {/* Service Type Selection - Only show if pickup is available */}
                        {quotation.serviceDetails?.isPickup && serviceCharges > 0 && (
                            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-5 mt-6">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center bg-primary-100 text-primary-600 rounded-full w-8 h-8">
                                        <Icon icon="mdi:car-wrench" className="text-xl" />
                                    </span>
                                    Choose Service Type
                                </h3>

                                {/* Drop-off Option */}
                                {quotation.serviceDetails?.isDropoff && quotation.serviceDetails?.dropoffLocation?.address && (
                                    <div
                                        onClick={() => setIsPickupSelected(false)}
                                        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition ${!isPickupSelected
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            checked={!isPickupSelected}
                                            onChange={() => setIsPickupSelected(false)}
                                            className="mt-1 accent-primary-600 cursor-pointer"
                                        />
                                        <label className="flex-1 text-gray-700 cursor-pointer">
                                            <span className="font-medium">Drop-off at:</span>{' '}
                                            <span className="text-gray-600">{quotation.serviceDetails.dropoffLocation.address}</span>
                                        </label>
                                    </div>
                                )}

                                {/* Pickup Option */}
                                <div
                                    onClick={() => setIsPickupSelected(true)}
                                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition ${isPickupSelected
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        checked={isPickupSelected}
                                        onChange={() => setIsPickupSelected(true)}
                                        className="mt-1 accent-primary-600 cursor-pointer"
                                    />
                                    <label className="flex-1 text-gray-700 cursor-pointer">
                                        <span className="font-medium">Pickup Service</span>{' '}
                                        <span className="text-gray-600">
                                            (+{quotation.pricing?.currency || 'TRY'} {serviceCharges.toLocaleString()})
                                        </span>
                                    </label>
                                </div>

                                {/* Pickup Address Input */}
                                {isPickupSelected && (
                                    <div className="space-y-2 animate-fadeIn">
                                        <label className="text-gray-700 font-medium flex items-center gap-2">
                                            <Icon icon="mdi:map-marker" className="text-primary-600 text-xl" />
                                            Pickup Address
                                        </label>
                                        <textarea
                                            value={pickupAddress}
                                            onChange={(e) => setPickupAddress(e.target.value)}
                                            placeholder="Enter your pickup address"
                                            required
                                            className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3 resize-none transition"
                                            rows={3}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment (Iyzico hosted form: card + 3D Secure never touch our servers) */}
                        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Icon icon="lucide:credit-card" className="w-6 h-6 text-primary-600" />
                                Payment Method
                            </h2>
                            <SecureCheckoutPanel
                                checkoutContent={checkoutContent}
                                isProcessing={isProcessing}
                                disabled={paymentVerifying}
                                paymentAlreadyDone={paymentAlreadyDone}
                                onStart={startCheckout}
                                onCancel={() => setCheckoutContent(null)}
                            />
                        </div>
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
                                        {quoteDevice(quotation) || 'Your device'}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service:</span>
                                        <span className="font-medium">{quoteServices(quotation)}</span>
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
                                    <span className="text-gray-600">Base Price</span>
                                    <span className="font-medium">{quotation.pricing?.currency || 'TRY'} {basePrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Parts Price</span>
                                    <span className="font-medium">{quotation.pricing?.currency || 'TRY'} {partsEstimate.toLocaleString()}</span>
                                </div>

                                {/* Show pickup charge if selected */}
                                {isPickupSelected && pickupCharge > 0 && (
                                    <div className="flex justify-between text-primary-600">
                                        <span className="flex items-center gap-1">
                                            <Icon icon="mdi:truck" width={14} />
                                            Pickup Charge
                                        </span>
                                        <span className="font-medium">
                                            +{quotation.pricing?.currency || 'TRY'} {pickupCharge.toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                {/* Remove old serviceCharges display */}

                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-{quotation.pricing?.currency || 'TRY'} {discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">{quotation.pricing?.currency || 'TRY'} {tax.toLocaleString()}</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between text-lg font-bold">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-primary-600">{quotation.pricing?.currency || 'TRY'} {totalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon icon="lucide:info" className="w-5 h-5 text-primary-600" />
                                    <span className="font-medium text-primary-800">Service Details</span>
                                </div>
                                <div className="text-sm text-primary-700 space-y-1">
                                    {isPickupSelected ? (
                                        <>
                                            <p>✓ Pickup service selected</p>
                                            <p className="text-xs">Pickup from: {pickupAddress || 'Address pending'}</p>
                                        </>
                                    ) : quotation.serviceDetails?.isDropoff && quotation.serviceDetails?.dropoffLocation?.address ? (
                                        <p>• Drop-off at: {quotation.serviceDetails.dropoffLocation.address}</p>
                                    ) : (
                                        <p>• Drop-off required at service center</p>
                                    )}
                                    {quotation.repairmanNotes && (
                                        <p className="text-xs mt-2 italic">Note: {quotation.repairmanNotes}</p>
                                    )}
                                </div>
                            </div>

                            {!checkoutContent && (
                                <button
                                    onClick={startCheckout}
                                    disabled={isProcessing || paymentVerifying}
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
                                            {paymentAlreadyDone ? 'Confirm Booking' : 'Pay Securely'}
                                        </>
                                    )}
                                </button>
                            )}

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
    const [isPickupSelected, setIsPickupSelected] = useState(false);
    const [pickupAddress, setPickupAddress] = useState('');
    const [currentStep, setCurrentStep] = useState(1); // Step tracking
    const [paymentAlreadyDone, setPaymentAlreadyDone] = useState(false);
    const [paymentVerifying, setPaymentVerifying] = useState(false);

    const [checkoutContent, setCheckoutContent] = useState(null);
    const { locale } = useParams();

    usePaymentReturnStatus({ setPaymentVerifying, setPaymentAlreadyDone });

    const {
        register: registerUser,
        handleSubmit: handleUserSubmit,
        formState: { errors: userErrors },
        trigger: triggerUserValidation,
        getValues: getUserValues
    } = useForm({
        resolver: yupResolver(userDetailsSchema),
        mode: 'onChange',
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            identityNumber: '',
            city: '',
            country: '',
            address: ''
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

                const data = response.data.data;

                if (data.paymentCompleted && data.bookingCompleted) {
                    router.push(`/payment/order-confirmation?jobId=${jobId}&offerId=${offerId}`);
                    return;
                }

                // Paid earlier but the booking step failed: only the booking needs finishing.
                setPaymentAlreadyDone(Boolean(data.paymentCompleted));
                setOrderData(data);
            } catch (error) {
                handleError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOfferData();
    }, [offerId, jobId, token, router]);

    const handleNextStep = async () => {
        if (currentStep === 1) {
            // Service details validation
            if (isPickupSelected && !pickupAddress.trim()) {
                toast.error('Please enter pickup address');
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Trigger user details validation
            const isValid = await triggerUserValidation();
            if (!isValid) {
                toast.error('Please fill all required fields correctly');
                return;
            }
            setCurrentStep(3);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // The offer's "can start by" date is often in the past by the time the customer pays,
    // so never send a stale date: fall back to tomorrow.
    const getScheduledDate = () => {
        const canStartBy = orderData?.offer?.availability?.canStartBy;
        const date = canStartBy ? new Date(canStartBy) : null;
        if (date && !isNaN(date.getTime()) && date > new Date()) {
            return date.toISOString();
        }
        return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    };

    const selectOffer = (userDetails) =>
        axiosInstance.post(
            `/repair-jobs/${jobId}/select-offer`,
            {
                offerId,
                scheduledDate: getScheduledDate(),
                isPickUp: isPickupSelected,
                pickUpAddress: isPickupSelected ? pickupAddress : '',
                userDetails
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

    // Payment already went through earlier, only the booking step is pending.
    const completePendingBooking = async () => {
        if (isPickupSelected && !pickupAddress.trim()) {
            toast.error('Please enter pickup address');
            return;
        }
        setIsProcessing(true);
        try {
            await selectOffer(getUserValues());
            toast.success('Booking confirmed!');
            router.push(`/payment/order-confirmation?jobId=${jobId}&offerId=${offerId}`);
        } catch (error) {
            handleError(error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Opens the secure Iyzico form; the server validates everything and fixes the amount.
    const startCheckout = async () => {
        if (paymentVerifying) {
            toast.info('Your payment is being verified. Please refresh this page in a few minutes.');
            return;
        }
        if (paymentAlreadyDone) {
            return completePendingBooking();
        }

        setIsProcessing(true);
        try {
            const { data } = await axiosInstance.post(
                '/customer/payments/checkout/init',
                {
                    userDetails: getUserValues(),
                    isPickUp: isPickupSelected,
                    pickUpAddress: isPickupSelected ? pickupAddress : '',
                    scheduledDate: getScheduledDate(),
                    locale
                },
                {
                    params: { offerId, jobId },
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (data?.data?.alreadyPaid) {
                toast.success(data.message);
                router.push(`/payment/order-confirmation?jobId=${jobId}&offerId=${offerId}`);
                return;
            }

            setCheckoutContent(data.data.checkoutFormContent);
        } catch (error) {
            handleError(error);
        } finally {
            setIsProcessing(false);
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
    const pickupCharge = isPickupSelected && offer?.serviceOptions?.pickupAvailable
        ? offer.serviceOptions?.pickupCharge || 0
        : 0;
    const totalPrice = laborPrice + partsEstimate + deliveryFee + pickupCharge + tax - discount;

    return (
        <div className="min-h-screen bg-gray-50/40 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {paymentVerifying && (
                    <div className="mb-6 max-w-3xl mx-auto flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <Icon icon="lucide:clock" className="w-6 h-6 text-amber-600 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-amber-800">Verifying your payment</p>
                            <p className="text-sm text-amber-700">Please do not pay again. If the payment went through, your booking will be confirmed automatically. Refresh this page in a few minutes.</p>
                        </div>
                    </div>
                )}

                {paymentAlreadyDone && !paymentVerifying && (
                    <div className="mb-6 max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                        <Icon icon="lucide:circle-check" className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold text-green-800">Payment already received</p>
                            <p className="text-sm text-green-700">Your booking was not finalized. You won&apos;t be charged again, just confirm the booking.</p>
                        </div>
                        <button
                            type="button"
                            onClick={completePendingBooking}
                            disabled={isProcessing}
                            className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-60"
                        >
                            {isProcessing ? 'Confirming...' : 'Confirm Booking'}
                        </button>
                    </div>
                )}

                {/* Progress Steps */}
                <div className="mb-8 max-w-3xl mx-auto rounded-lg  py-2">
                    <div className="flex items-center justify-between relative">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center flex-1 relative z-10">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                {currentStep > 1 ? <Icon icon="lucide:check" className="w-6 h-6" /> : '1'}
                            </div>
                            <span className={`mt-2 text-sm font-medium ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-500'}`}>
                                Service Details
                            </span>
                        </div>

                        {/* Line between steps */}
                        <div className={`flex-1 h-1 mx-4 transition-all ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />

                        {/* Step 2 */}
                        <div className="flex flex-col items-center flex-1 relative z-10">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                {currentStep > 2 ? <Icon icon="lucide:check" className="w-6 h-6" /> : '2'}
                            </div>
                            <span className={`mt-2 text-sm font-medium ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-500'}`}>
                                Your Information
                            </span>
                        </div>

                        {/* Line between steps */}
                        <div className={`flex-1 h-1 mx-4 transition-all ${currentStep >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`} />

                        {/* Step 3 */}
                        <div className="flex flex-col items-center flex-1 relative z-10">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${currentStep >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                3
                            </div>
                            <span className={`mt-2 text-sm font-medium ${currentStep >= 3 ? 'text-primary-600' : 'text-gray-500'}`}>
                                Payment
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* STEP 1: Service Details */}
                        {currentStep === 1 && (
                            <div className="bg-white rounded-md shadow-sm p-5 border border-gray-100 animate-fadeIn">
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
                                                {job?.urgency && <span className="text-gray-500">Urgency: {job?.urgency}</span>}
                                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                                                    Warranty: {offer?.warranty?.duration} days
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 flex items-center gap-4 mb-6">
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

                                {/* Service Type Selection */}
                                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-5">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <span className="inline-flex items-center justify-center bg-primary-100 text-primary-600 rounded-full w-8 h-8">
                                            <Icon icon="mdi:car-wrench" className="text-xl" />
                                        </span>
                                        Choose Service Type
                                    </h3>

                                    {/* Drop-off Option */}
                                    <div
                                        onClick={() => setIsPickupSelected(false)}
                                        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition ${!isPickupSelected
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            checked={!isPickupSelected}
                                            onChange={() => setIsPickupSelected(false)}
                                            className="mt-1 accent-primary-600 cursor-pointer"
                                        />
                                        <label className="flex-1 text-gray-700 cursor-pointer">
                                            <span className="font-medium">Drop-off at:</span>{' '}
                                            <span className="text-gray-600">{offer?.serviceOptions?.dropOffLocation}</span>
                                        </label>
                                    </div>

                                    {/* Pickup Option */}
                                    {offer?.serviceOptions?.pickupAvailable && (
                                        <div
                                            onClick={() => setIsPickupSelected(true)}
                                            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition ${isPickupSelected
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                checked={isPickupSelected}
                                                onChange={() => setIsPickupSelected(true)}
                                                className="mt-1 accent-primary-600 cursor-pointer"
                                            />
                                            <label className="flex-1 text-gray-700 cursor-pointer">
                                                <span className="font-medium">Pickup Service</span>{' '}
                                                <span className="text-gray-600">
                                                    (+{offer?.pricing?.currency} {offer?.serviceOptions?.pickupCharge})
                                                </span>
                                            </label>
                                        </div>
                                    )}

                                    {/* Pickup Address Input */}
                                    {isPickupSelected && (
                                        <div className="space-y-2 animate-fadeIn">
                                            <label className="text-gray-700 font-medium flex items-center gap-2">
                                                <Icon icon="mdi:map-marker" className="text-primary-600 text-xl" />
                                                Pickup Address <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={pickupAddress}
                                                onChange={(e) => setPickupAddress(e.target.value)}
                                                placeholder="Enter your pickup address"
                                                required
                                                className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 p-3 resize-none transition"
                                                rows={3}
                                            />
                                            {isPickupSelected && !pickupAddress.trim() && (
                                                <p className="text-red-500 text-sm flex items-center gap-1">
                                                    <Icon icon="lucide:alert-circle" className="w-4 h-4" />
                                                    Pickup address is required
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleNextStep}
                                    disabled={isPickupSelected && !pickupAddress.trim()}
                                    className="w-full mt-6 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    Next: Your Information
                                    <Icon icon="lucide:arrow-right" className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* STEP 2: User Information */}
                        {currentStep === 2 && (
                            <div className="bg-white rounded-md shadow-sm p-5 border border-gray-100 animate-fadeIn">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <Icon icon="lucide:user" className="w-6 h-6 text-primary-600" />
                                    Your Information
                                </h2>

                                <div className="space-y-5">
                                    {/* First Name & Last Name */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                                                First Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="firstName"
                                                {...registerUser('firstName')}
                                                placeholder="John"
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 ${userErrors.firstName ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                            />
                                            {userErrors.firstName && (
                                                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                                    <Icon icon="lucide:alert-circle" className="w-4 h-4" />
                                                    {userErrors.firstName.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Last Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="lastName"
                                                {...registerUser('lastName')}
                                                placeholder="Doe"
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 ${userErrors.lastName ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                            />
                                            {userErrors.lastName && (
                                                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                                    <Icon icon="lucide:alert-circle" className="w-4 h-4" />
                                                    {userErrors.lastName.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            {...registerUser('email')}
                                            placeholder="your.email@example.com"
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 ${userErrors.email ? 'border-red-500' : 'border-gray-200'
                                                }`}
                                        />
                                        {userErrors.email && (
                                            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                                <Icon icon="lucide:alert-circle" className="w-4 h-4" />
                                                {userErrors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone & Identity Number */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="phone"
                                                {...registerUser('phone', {
                                                    onChange: (e) => {
                                                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                                                    }
                                                })}
                                                inputMode="numeric"
                                                placeholder="+90 555 123 4567"
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 ${userErrors.phone ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                            />

                                            {userErrors.phone && (
                                                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                                    <Icon icon="lucide:alert-circle" className="w-4 h-4" />
                                                    {userErrors.phone.message}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="identityNumber"
                                                className="block text-sm font-semibold text-gray-700 mb-2"
                                            >
                                                Identity Number <span className="text-red-500">*</span>
                                            </label>

                                            <input
                                                type="text"
                                                id="identityNumber"
                                                inputMode="numeric"
                                                maxLength={11}
                                                placeholder="12345678901"
                                                {...registerUser('identityNumber', {
                                                    required: 'Identity Number is required',
                                                    onChange: (e) => {
                                                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                                    },
                                                    pattern: {
                                                        value: /^[0-9]{11}$/,
                                                        message: 'Identity Number must be exactly 11 digits',
                                                    },
                                                })}
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 ${userErrors.identityNumber ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                            />

                                            {userErrors.identityNumber && (
                                                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                                    <Icon icon="lucide:alert-circle" className="w-4 h-4" />
                                                    {userErrors.identityNumber.message}
                                                </p>
                                            )}
                                        </div>

                                    </div>

                                    {/* City & Country */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                                                City <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="city"
                                                {...registerUser('city')}
                                                placeholder="Istanbul"
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 ${userErrors.city ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                            />
                                            {userErrors.city && (
                                                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                                    <Icon icon="lucide:alert-circle" className="w-4 h-4" />
                                                    {userErrors.city.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Country <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="country"
                                                {...registerUser('country')}
                                                placeholder="Turkey"
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 ${userErrors.country ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                            />
                                            {userErrors.country && (
                                                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                                    <Icon icon="lucide:alert-circle" className="w-4 h-4" />
                                                    {userErrors.country.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Address <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="address"
                                            {...registerUser('address')}
                                            placeholder="Enter your complete address"
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 resize-none ${userErrors.address ? 'border-red-500' : 'border-gray-200'
                                                }`}
                                            rows={3}
                                        />
                                        {userErrors.address && (
                                            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                                <Icon icon="lucide:alert-circle" className="w-4 h-4" />
                                                {userErrors.address.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Summary of selected service */}
                                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-primary-800 mb-2 flex items-center gap-2">
                                            <Icon icon="lucide:info" className="w-5 h-5" />
                                            Selected Service
                                        </h4>
                                        <div className="text-sm text-primary-700 space-y-1">
                                            {isPickupSelected ? (
                                                <>
                                                    <p>✓ Pickup service selected</p>
                                                    <p className="text-xs">From: {pickupAddress}</p>
                                                </>
                                            ) : (
                                                <p>• Drop-off at: {offer?.serviceOptions?.dropOffLocation}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={handlePrevStep}
                                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Icon icon="lucide:arrow-left" className="w-5 h-5" />
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        Next: Payment
                                        <Icon icon="lucide:arrow-right" className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Payment (Iyzico hosted form: card + 3D Secure never touch our servers) */}
                        {currentStep === 3 && (
                            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 animate-fadeIn">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                        <Icon icon="lucide:credit-card" className="w-6 h-6 text-primary-600" />
                                        Payment Method
                                    </h2>
                                    {!checkoutContent && (
                                        <button
                                            type="button"
                                            onClick={handlePrevStep}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 active:scale-95 transition-all duration-200"
                                        >
                                            <Icon icon="lucide:arrow-left" className="w-4 h-4" />
                                            Back
                                        </button>
                                    )}
                                </div>

                                <SecureCheckoutPanel
                                    checkoutContent={checkoutContent}
                                    isProcessing={isProcessing}
                                    disabled={paymentVerifying}
                                    paymentAlreadyDone={paymentAlreadyDone}
                                    onStart={startCheckout}
                                    onCancel={() => setCheckoutContent(null)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Order Summary - Sidebar */}
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
                                        <span className="font-medium">{job?.services?.map((service) => service.name).join(', ')}</span>
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
                                    <span className="font-medium">{offer?.pricing?.currency || 'TRY'} {laborPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Parts Estimate</span>
                                    <span className="font-medium">{offer?.pricing?.currency || 'TRY'} {partsEstimate.toLocaleString()}</span>
                                </div>

                                {isPickupSelected && pickupCharge > 0 && (
                                    <div className="flex justify-between text-primary-600">
                                        <span className="flex items-center gap-1">
                                            <span>🚗</span>
                                            <span>Pickup Charge</span>
                                        </span>
                                        <span className="font-medium">
                                            +{offer?.pricing?.currency || 'TRY'} {pickupCharge.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                {!offer?.serviceOptions?.pickupAvailable && deliveryFee > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service Fee</span>
                                        <span className="font-medium">{offer?.pricing?.currency || 'TRY'} {deliveryFee}</span>
                                    </div>
                                )}
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-{offer?.pricing?.currency || 'TRY'} {discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">{offer?.pricing?.currency || 'TRY'} {tax.toLocaleString()}</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between text-lg font-bold">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-primary-600">{offer?.pricing?.currency || 'TRY'} {totalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon icon="lucide:info" className="w-5 h-5 text-primary-600" />
                                    <span className="font-medium text-primary-800">Service Details</span>
                                </div>
                                <div className="text-sm text-primary-700 space-y-1">
                                    {isPickupSelected ? (
                                        <>
                                            <p>✓ Pickup service selected</p>
                                            <p className="text-xs">Pickup from: {pickupAddress || 'Address pending'}</p>
                                        </>
                                    ) : (
                                        <p>• Drop-off at: {offer?.serviceOptions?.dropOffLocation}</p>
                                    )}
                                    {offer?.serviceOptions?.homeService && <p>✓ Home service available</p>}
                                </div>
                            </div>
                            {/* The one payment button (step 3 = payment) */}
                            {currentStep === 3 && !checkoutContent && (
                                <button
                                    type="button"
                                    onClick={startCheckout}
                                    disabled={isProcessing || paymentVerifying}
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
                                            {paymentAlreadyDone ? 'Confirm Booking' : 'Pay Securely'}
                                        </>
                                    )}
                                </button>
                            )}

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