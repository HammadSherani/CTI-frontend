"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';

// Constants
const ORDER_TYPES = {
  QUOTATION: 'quotation',
  OFFER: 'offer'
};

const TAX_RATE = 0.00;

// Utility function to calculate offer pricing
const calculateOfferPricing = (offer) => {
  const basePrice = offer?.pricing.totalPrice || 0;
  const deliveryFee = 0;
  const discount = 0;
  const tax = Math.round((basePrice + deliveryFee - discount) * TAX_RATE);
  return basePrice + deliveryFee + tax - discount;
};

// Separate loading component
const LoadingState = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-lg text-gray-600">Loading order details...</span>
    </div>
  </div>
);

// Separate error component
const ErrorState = () => (
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

// Payment summary component
const PaymentSummary = ({ paymentId, totalPrice, currency, estimatedTime, warranty }) => (
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
);

// Service details component
const ServiceDetails = ({ 
  deviceBrand, 
  deviceModel, 
  services, 
  repairmanProfile, 
  orderType,
  quotation,
  offer 
}) => {
  const isQuotation = orderType === ORDER_TYPES.QUOTATION;

  return (
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
          <QuotationServiceInfo quotation={quotation} />
        ) : (
          <OfferServiceInfo offer={offer} />
        )}
      </div>
    </div>
  );
};

// Quotation service info sub-component
const QuotationServiceInfo = ({ quotation }) => {
  const serviceType = quotation.serviceDetails?.serviceType;
  
  return (
    <>
      {serviceType === 'pickup' && (
        <p className="text-green-600">✓ Pickup service will be arranged</p>
      )}
      {serviceType === 'home-service' && (
        <p className="text-green-600">✓ Home service will be provided</p>
      )}
      {serviceType === 'drop-off' && (
        <p>Drop-off at service center</p>
      )}
      {quotation.repairmanNotes && (
        <p className="mt-2 italic text-gray-600">
          <strong>Note:</strong> {quotation.repairmanNotes}
        </p>
      )}
    </>
  );
};

// Offer service info sub-component
const OfferServiceInfo = ({ offer }) => (
  <>
    {offer?.serviceOptions?.pickupAvailable ? (
      <p className="text-green-600">✓ Pickup service will be arranged</p>
    ) : (
      <p>Drop-off at: {offer?.serviceOptions?.dropOffLocation}</p>
    )}
    <p><strong>Service starts by:</strong> {new Date(offer.availability.canStartBy).toLocaleDateString()}</p>
  </>
);

// Main component
function OrderConfirmation() {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderType, setOrderType] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useSelector(state => state.auth.token);

  const quotationId = searchParams.get('quotationId');
  const jobId = searchParams.get('jobId');

  // Fetch quotation data
  const fetchQuotationOrder = useCallback(async () => {
    const { data } = await axiosInstance.get(`/chat/quotation/${quotationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const paymentResponse = await axiosInstance.get('/customer/payments', {
      params: { quotationId },
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!paymentResponse.data.data.paymentCompleted) {
      router.push(`/payment?quotationId=${quotationId}`);
      return null;
    }

    return {
      quotation: data.data.quotation,
      repairmanProfile: paymentResponse.data.data.repairmanProfile,
      paymentId: paymentResponse.data.data.paymentId,
      type: ORDER_TYPES.QUOTATION
    };
  }, [quotationId, token, router]);

  // Fetch offer data
  const fetchOfferOrder = useCallback(async () => {
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
      return null;
    }

    return {
      ...data.data,
      type: ORDER_TYPES.OFFER
    };
  }, [jobId, token, router]);

  // Main fetch effect
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!token || (!quotationId && !jobId)) return;

      try {
        setLoading(true);
        const result = quotationId 
          ? await fetchQuotationOrder() 
          : await fetchOfferOrder();
        
        if (result) {
          setOrderData(result);
          setOrderType(result.type);
        }
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [token, quotationId, jobId, fetchQuotationOrder, fetchOfferOrder]);

  // Memoized order details
  const orderDetails = useMemo(() => {
    if (!orderData || !orderType) return null;

    const isQuotation = orderType === ORDER_TYPES.QUOTATION;
    const quotation = isQuotation ? orderData.quotation : null;
    const job = isQuotation ? null : orderData.job;
    const offer = isQuotation ? null : orderData.offer;

    return {
      isQuotation,
      quotation,
      job,
      offer,
      repairmanProfile: orderData.repairmanProfile,
      paymentId: orderData.paymentId,
      totalPrice: isQuotation 
        ? quotation.pricing.totalAmount 
        : calculateOfferPricing(offer),
      currency: isQuotation 
        ? (quotation.pricing.currency || 'PKR')
        : (offer?.pricing.currency || 'PKR'),
      estimatedTime: isQuotation
        ? (quotation.serviceDetails?.estimatedDuration 
            ? `${quotation.serviceDetails.estimatedDuration} days` 
            : 'TBD')
        : `${offer.estimatedTime.value} ${offer.estimatedTime.unit}`,
      warranty: isQuotation
        ? (quotation.serviceDetails?.warranty?.duration || 'N/A')
        : offer.warranty.duration,
      deviceBrand: isQuotation 
        ? quotation.deviceInfo?.brandName 
        : job.deviceInfo.brand,
      deviceModel: isQuotation 
        ? quotation.deviceInfo?.modelName 
        : job.deviceInfo.model,
      services: isQuotation
        ? (quotation.deviceInfo?.repairServices?.join(', ') || 'N/A')
        : job.services.join(', ')
    };
  }, [orderData, orderType]);

  if (loading) return <LoadingState />;
  if (!orderData) return <ErrorState />;

  const {
    isQuotation,
    quotation,
    offer,
    repairmanProfile,
    paymentId,
    totalPrice,
    currency,
    estimatedTime,
    warranty,
    deviceBrand,
    deviceModel,
    services
  } = orderDetails;

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

        <PaymentSummary 
          paymentId={paymentId}
          totalPrice={totalPrice}
          currency={currency}
          estimatedTime={estimatedTime}
          warranty={warranty}
        />

        <ServiceDetails 
          deviceBrand={deviceBrand}
          deviceModel={deviceModel}
          services={services}
          repairmanProfile={repairmanProfile}
          orderType={orderType}
          quotation={quotation}
          offer={offer}
        />

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