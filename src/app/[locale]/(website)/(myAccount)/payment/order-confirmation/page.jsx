"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter,Link } from '@/i18n/navigation';
import { useSelector } from 'react-redux';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Constants
const ORDER_TYPES = {
  QUOTATION: 'quotation',
  OFFER: 'offer'
};

const TAX_RATE = 0.00;

// Utility function to calculate offer pricing
const calculateOfferPricing = (offer, job) => {
  const basePrice = offer?.pricing.totalPrice || 0;
  const pickupCharge = job?.isPickUp && offer?.serviceOptions?.pickupAvailable
    ? (offer?.serviceOptions?.pickupCharge || 0)
    : 0;
  const deliveryFee = 0;
  const discount = 0;
  const tax = Math.round((basePrice + pickupCharge + deliveryFee - discount) * TAX_RATE);
  return basePrice + pickupCharge + deliveryFee + tax - discount;
};

// ── Guard: ek waqt mein sirf ek PDF generate ho ──
let isGenerating = false;
 
// Helper: image ko base64 mein convert karta hai
const getBase64FromUrl = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Logo load failed'));
    img.src = url;
  });
};
// PDF Generator Function
const generateInvoicePDF = (orderDetails, userData) => {
   if (isGenerating) {
    console.warn('PDF already generating, please wait...');
    return;
  }
  isGenerating = true;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const primaryColor = [234, 88, 12]; // Orange-600
  const grayColor = [107, 114, 128];
  
  // Header with Logo
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
   const logoX = 8;
    const logoY = 5;
    const logoW = 35;
    const logoH = 35;

    try {
      const logoBase64 =  getBase64FromUrl('/assets/logo.png');
 
      // White rounded background behind logo for clean look
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(logoX - 2, logoY - 2, logoW + 4, logoH + 4, 4, 4, 'F');
 
      doc.addImage(logoBase64, 'PNG', logoX, logoY, logoW, logoH);
    } catch (err) {
      console.error('Logo failed:', err);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(logoX - 2, logoY - 2, logoW + 4, logoH + 4, 4, 4, 'F');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('LOGO', logoX + logoW / 2, logoY + logoH / 2 + 1, { align: 'center' });
    }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - 20, 25, { align: 'right' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Repair Service Invoice', pageWidth - 20, 32, { align: 'right' });
  
  // Company Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('QuickRepair Services', 20, 50);
  doc.text('123 Service Street, Tech City', 20, 55);
  doc.text('support@quickrepair.com | +1 234 567 890', 20, 60);
  
  // Invoice Details
  doc.setFontSize(10);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('Invoice Number:', 120, 50);
  doc.text('Invoice Date:', 120, 55);
  doc.text('Payment ID:', 120, 60);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`INV-${Date.now().toString().slice(-8)}`, 160, 50);
  doc.text(format(new Date(), 'dd MMM yyyy'), 160, 55);
  doc.text(orderDetails.paymentId || 'N/A', 160, 60);
  
  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 70, pageWidth - 20, 70);
  
  // Customer Details
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, 80);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(userData?.name || 'Customer', 20, 87);
  doc.text(userData?.email || 'N/A', 20, 92);
  doc.text(userData?.phone || 'N/A', 20, 97);
  
  // Repairman Details
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Service Provider:', 120, 80);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(orderDetails.repairmanProfile?.name || 'Repairman', 120, 87);
  doc.text(orderDetails.repairmanProfile?.shopName || 'N/A', 120, 92);
  doc.text(orderDetails.repairmanProfile?.mobileNumber || 'N/A', 120, 97);
  
  // Service Details Table
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Service Details', 20, 115);
  
  // Service table data
  const serviceData = [
    ['Device', `${orderDetails.deviceBrand} ${orderDetails.deviceModel}`],
    ['Services', Array.isArray(orderDetails.services) 
      ? orderDetails.services.map(s => s.name || s).join(', ') 
      : 'N/A'],
    ['Estimated Time', orderDetails.estimatedTime],
    ['Warranty', `${orderDetails.warranty} days`]
  ];
  
  autoTable(doc, {
    startY: 120,
    head: [['Description', 'Details']],
    body: serviceData,
    theme: 'striped',
    headStyles: { 
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 'auto' }
    },
    styles: { fontSize: 10 }
  });
  
  // Payment Summary Table
  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Summary', 20, finalY);
  
  // Calculate breakdown
  let subtotal = orderDetails.totalPrice;
  let pickupCharge = 0;
  let tax = 0;
  
  if (orderDetails.isQuotation) {
    subtotal = orderDetails.quotation?.pricing?.totalAmount || 0;
    pickupCharge = orderDetails.quotation?.pricing?.serviceCharges || 0;
  } else {
    subtotal = orderDetails.offer?.pricing?.totalPrice || 0;
    pickupCharge = orderDetails.offer?.serviceOptions?.pickupCharge || 0;
  }
  
  const paymentData = [
    ['Subtotal', `${orderDetails.currency} ${subtotal.toLocaleString()}`],
    ...(pickupCharge > 0 ? [['Pickup Charge', `${orderDetails.currency} ${pickupCharge.toLocaleString()}`]] : []),
    ['Tax', `${orderDetails.currency} 0`],
    ['Total Amount', `${orderDetails.currency} ${orderDetails.totalPrice.toLocaleString()}`]
  ];
  
  autoTable(doc, {
    startY: finalY + 5,
    head: [['Description', 'Amount']],
    body: paymentData,
    theme: 'striped',
    headStyles: { 
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 60, halign: 'right' }
    },
    styles: { fontSize: 10 }
  });
  
  // Footer
  const footerY = doc.lastAutoTable.finalY + 20;
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
  
  doc.setFontSize(8);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('This is a computer generated invoice. No signature required.', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Thank you for choosing our service!', pageWidth / 2, footerY + 5, { align: 'center' });
  
  // Return the PDF as blob URL
  return doc.output('bloburl');
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
const PaymentSummary = ({ paymentId, totalPrice, currency, estimatedTime, warranty, job, offer, isQuotation, quotation }) => {
  const showPickupCharge = !isQuotation && job?.isPickUp && offer?.serviceOptions?.pickupCharge;
  const showQuotationPickup = isQuotation && quotation?.serviceDetails?.isPickup && quotation?.pricing?.serviceCharges > 0;

  return (
    <div className="bg-gray-50 rounded-xl p-6 mb-8 space-y-4">
      {paymentId && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Payment ID</span>
          <span className="font-mono text-sm">{paymentId}</span>
        </div>
      )}

      {showPickupCharge && (
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Service Cost</span>
            <span className="font-medium">
              {currency} {(totalPrice - offer.serviceOptions.pickupCharge).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Pickup Charge</span>
            <span className="font-medium text-primary-600">
              {currency} {offer.serviceOptions.pickupCharge.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {showQuotationPickup && (
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Service Cost</span>
            <span className="font-medium">
              {currency} {quotation.pricing.totalAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Pickup Charge</span>
            <span className="font-medium text-primary-600">
              {currency} {quotation.pricing.serviceCharges.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center border-t pt-3">
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
};

// Service details component
const ServiceDetails = ({
  deviceBrand,
  deviceModel,
  services,
  repairmanProfile,
  orderType,
  quotation,
  offer,
  job
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
        <p>
          <strong>Service:</strong>{" "}
          {services?.map(service => service.name || service).join(", ")}
        </p>
        <p><strong>Repairman:</strong> {repairmanProfile?.name} ({repairmanProfile?.shopName})</p>
        <p><strong>Contact:</strong> {repairmanProfile?.mobileNumber || repairmanProfile?.phone}</p>

        {isQuotation ? (
          <QuotationServiceInfo quotation={quotation} />
        ) : (
          <OfferServiceInfo offer={offer} job={job} />
        )}
      </div>
    </div>
  );
};

// Quotation service info sub-component
const QuotationServiceInfo = ({ quotation }) => {
  const serviceDetails = quotation.serviceDetails || {};
  const { serviceType, isPickup = false, isDropoff = false, pickupLocation = {}, dropoffLocation = {} } = serviceDetails;

  return (
    <>
      {isPickup && (
        <>
          <p className="text-green-600 flex items-center gap-1">
            <Icon icon="lucide:truck" className="w-4 h-4" />
            Pickup service selected
          </p>
          {pickupLocation?.address && (
            <p className="bg-white rounded-lg p-2 mt-1">
              <strong className="text-gray-900">Pickup from:</strong>
              <span className="block text-gray-600 mt-1">{pickupLocation.address}</span>
            </p>
          )}
          {quotation.pricing?.serviceCharges > 0 && (
            <p className="text-xs text-primary-600 mt-1">
              Pickup charge: {quotation.pricing?.currency} {quotation.pricing.serviceCharges.toLocaleString()}
            </p>
          )}
        </>
      )}

      {isDropoff && dropoffLocation?.address && (
        <p className="bg-white rounded-lg p-2">
          <strong className="text-gray-900">Drop-off at:</strong>
          <span className="block text-gray-600 mt-1">{dropoffLocation.address}</span>
        </p>
      )}

      {!isPickup && !isDropoff && serviceType === 'home-service' && (
        <p className="text-green-600">✓ Home service will be provided</p>
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
const OfferServiceInfo = ({ offer, job }) => {
  const isPickup = job?.isPickUp || false;
  const pickupAddress = job?.pickUpAddress || '';

  return (
    <>
      {isPickup ? (
        <>
          <p className="text-green-600 flex items-center gap-1">
            <Icon icon="lucide:truck" className="w-4 h-4" />
            Pickup service selected
          </p>
          <p className="bg-white rounded-lg p-2 mt-1">
            <strong className="text-gray-900">Pickup from:</strong>
            <span className="block text-gray-600 mt-1">{pickupAddress}</span>
          </p>
          {offer?.serviceOptions?.pickupCharge > 0 && (
            <p className="text-xs text-primary-600 mt-1">
              Pickup charge: {offer?.pricing?.currency} {offer?.serviceOptions?.pickupCharge?.toLocaleString()}
            </p>
          )}
        </>
      ) : (
        <p className="bg-white rounded-lg p-2">
          <strong className="text-gray-900">Drop-off at:</strong>
          <span className="block text-gray-600 mt-1">{offer?.serviceOptions?.dropOffLocation}</span>
        </p>
      )}
      <p className="mt-2">
        <strong>Service starts by:</strong>{' '}
        {new Date(offer?.availability?.canStartBy).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </p>
    </>
  );
};

// Main component
function OrderConfirmation() {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderType, setOrderType] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, token,userDetails } = useSelector(state => state.auth);
console.log("User in Order Confirmation", user);
console.log("User Details in Order Confirmation", userDetails); 
  const quotationId = searchParams.get('quotationId');
  const jobId = searchParams.get('jobId');
  const offerId = searchParams.get('offerId');

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

    const job = jobResponse.data.data.job;

    const { data } = await axiosInstance.get('/customer/payments', {
      params: { offerId, jobId },
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!data.data.paymentCompleted) {
      router.push(`/payment?jobId=${jobId}&offerId=${offerId}`);
      return null;
    }

    return {
      ...data.data,
      type: ORDER_TYPES.OFFER
    };
  }, [jobId, offerId, token, router]);

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

  // Handle PDF Download
  const handleDownloadInvoice = () => {
    if (!orderDetails) return;
    
    setDownloading(true);
    try {
      const pdfBlobUrl = generateInvoicePDF(orderDetails, userDetails);
      
      // Create a link to download
      const link = document.createElement('a');
      link.href = pdfBlobUrl;
      link.download = `Invoice_${orderDetails.paymentId || 'order'}_${format(new Date(), 'yyyyMMdd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        URL.revokeObjectURL(pdfBlobUrl);
      }, 100);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      handleError(error);
    } finally {
      setDownloading(false);
    }
  };

  const orderDetails = useMemo(() => {
    if (!orderData || !orderType) return null;

    const isQuotation = orderType === ORDER_TYPES.QUOTATION;
    const quotation = isQuotation ? orderData.quotation : null;
    const job = isQuotation ? null : orderData.job;
    const offer = isQuotation ? null : orderData.offer;

    const quotationTotal = isQuotation
      ? (quotation.pricing.totalAmount + (quotation.pricing.serviceCharges || 0))
      : 0;

    return {
      isQuotation,
      quotation,
      job,
      offer,
      repairmanProfile: orderData.repairmanProfile,
      paymentId: orderData.paymentId,
      totalPrice: isQuotation
        ? quotationTotal
        : calculateOfferPricing(offer, job),
      currency: isQuotation
        ? (quotation.pricing.currency || 'TRY')
        : (offer?.pricing.currency || 'TRY'),
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
        ? (quotation.deviceInfo?.repairServices || 'N/A')
        : job.services
    };
  }, [orderData, orderType]);

  if (loading) return <LoadingState />;
  if (!orderData) return <ErrorState />;

  const {
    isQuotation,
    quotation,
    job,
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

        {/* Download Invoice Button */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-all duration-300 flex items-center gap-2 shadow-md"
          >
            {downloading ? (
              <>
                <Icon icon="lucide:loader" className="w-5 h-5 animate-spin" />
                Generating Invoice...
              </>
            ) : (
              <>
                <Icon icon="lucide:file-text" className="w-5 h-5" />
                Download Invoice PDF
              </>
            )}
          </button>
        </div>

        <PaymentSummary
          paymentId={paymentId}
          totalPrice={totalPrice}
          currency={currency}
          estimatedTime={estimatedTime}
          warranty={warranty}
          job={job}
          offer={offer}
          isQuotation={isQuotation}
          quotation={quotation}
        />
        
        <ServiceDetails
          deviceBrand={deviceBrand}
          deviceModel={deviceModel}
          services={services}
          repairmanProfile={repairmanProfile}
          orderType={orderType}
          quotation={quotation}
          offer={offer}
          job={job}
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