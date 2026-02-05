"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axiosInstance from '@/config/axiosInstance';

function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useSelector((state) => state.auth);
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  // Get data from sessionStorage
  const [adData, setAdData] = useState(null);

  useEffect(() => {
    const savedData = sessionStorage.getItem('pendingAdData');
    if (savedData) {
      setAdData(JSON.parse(savedData));
    } else {
      toast.error('No payment data found');
      router.push('/repair-man/ads/create');
    }
  }, []);

  console.log('Ad Data for Payment:', adData);

  const getCurrencySymbol = (curr) => {
    const symbols = {
      USD: '$',
      EUR: '€',
      PKR: '₨',
      TRY: '₺',
    };
    return symbols[curr] || curr;
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardDetails({ ...cardDetails, number: formatted });
    }
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value);
    if (formatted.replace('/', '').length <= 4) {
      setCardDetails({ ...cardDetails, expiry: formatted });
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length <= 4) {
      setCardDetails({ ...cardDetails, cvv: value });
    }
  };

  const handlePayment = async () => {
    if (!adData) return;

    // Validate
    if (paymentMethod === 'card') {
      if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length !== 16) {
        toast.error('Please enter a valid card number');
        return;
      }
      if (!cardDetails.name) {
        toast.error('Please enter card holder name');
        return;
      }
      if (!cardDetails.expiry || cardDetails.expiry.length !== 5) {
        toast.error('Please enter expiry date (MM/YY)');
        return;
      }
      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        toast.error('Please enter CVV');
        return;
      }
    }

    setProcessing(true);

    try {
      const formData = new FormData();
      
      // Handle image conversion from base64
      if (adData.image) {
        const base64Data = adData.image;
        const base64Response = await fetch(base64Data);
        const blob = await base64Response.blob();
        const file = new File([blob], 'ad-image.jpg', { type: blob.type || 'image/jpeg' });
        formData.append('image', file);
      }
      
      // Add other ad data
      Object.keys(adData).forEach(key => {
        if (key === 'image') {
          // Already handled above
          return;
        } else if (key === 'serviceList') {
          formData.append('serviceList', JSON.stringify(adData[key]));
        } else {
          formData.append(key, adData[key]);
        }
      });
      
      // Add payment info
      formData.append('paymentMethod', paymentMethod);
      formData.append('transactionId', 'TXN' + Date.now());
      if (paymentMethod === 'card') {
        formData.append('cardLast4', cardDetails.number.slice(-4));
      }

      const res = await axiosInstance.post('/repairman/advertisements/create', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(res.data.message || 'Advertisement created successfully!');
      sessionStorage.removeItem('pendingAdData');
      router.push('/repair-man/ads');
    } catch (error) {
      console.error('Error creating advertisement:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to create advertisement. Please try again.';
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (!adData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Icon icon="mdi:loading" className="w-12 h-12 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={processing}
            >
              <Icon icon="mdi:arrow-left" className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
              <p className="text-gray-600 mt-1">Choose your payment method and complete the transaction</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  disabled={processing}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    paymentMethod === 'card'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon icon="mdi:credit-card" className="w-12 h-12 mx-auto mb-3 text-primary-600" />
                  <p className="text-lg font-semibold text-gray-900">Credit/Debit Card</p>
                  <p className="text-sm text-gray-600 mt-1">Pay securely with your card</p>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('bank')}
                  disabled={processing}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    paymentMethod === 'bank'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon icon="mdi:bank" className="w-12 h-12 mx-auto mb-3 text-primary-600" />
                  <p className="text-lg font-semibold text-gray-900">Bank Transfer</p>
                  <p className="text-sm text-gray-600 mt-1">Transfer to our account</p>
                </button>
              </div>
            </div>

            {/* Card Payment Form */}
            {paymentMethod === 'card' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Card Details</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        disabled={processing}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
                      />
                      <Icon icon="mdi:credit-card-outline" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Holder Name *
                    </label>
                    <input
                      type="text"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value.toUpperCase() })}
                      placeholder="JOHN DOE"
                      disabled={processing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        disabled={processing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="password"
                        value={cardDetails.cvv}
                        onChange={handleCvvChange}
                        placeholder="123"
                        maxLength="4"
                        disabled={processing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                    <Icon icon="mdi:lock" className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-900">Your payment information is encrypted and secure</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Transfer Info */}
            {paymentMethod === 'bank' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Bank Transfer Instructions</h2>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg space-y-4">
                  <div className="flex items-start gap-3">
                    <Icon icon="mdi:bank" className="w-6 h-6 text-primary-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bank Name</p>
                      <p className="text-lg font-semibold text-gray-900">CTI Bank</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Icon icon="mdi:account" className="w-6 h-6 text-primary-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Account Name</p>
                      <p className="text-lg font-semibold text-gray-900">CTI Platform Ltd</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Icon icon="mdi:numeric" className="w-6 h-6 text-primary-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Account Number</p>
                      <p className="text-lg font-semibold text-gray-900 font-mono">1234567890</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Icon icon="mdi:card-account-details" className="w-6 h-6 text-primary-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">IBAN</p>
                      <p className="text-lg font-semibold text-gray-900 font-mono">TR330006123456789012345678</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-300">
                    <div className="flex items-start gap-2">
                      <Icon icon="mdi:information" className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        Please include your transaction reference in the transfer description. 
                        Your advertisement will be activated within 24 hours after payment verification.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Advertisement Type</span>
                  <span className="font-semibold text-gray-900 capitalize">{adData.type}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold text-gray-900">{adData.totalDays} days</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Start Date</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(adData.startDate).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">End Date</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(adData.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {getCurrencySymbol(adData.currency)}{adData.total}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment Fee</span>
                  <span className="font-medium text-gray-900">
                    {getCurrencySymbol(adData.currency)}0.00
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Amount</span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {getCurrencySymbol(adData.currency)}{adData.totalPrice
}
                    </p>
                    <p className="text-xs text-gray-600">{adData.currency}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing && <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />}
                {processing ? 'Processing Payment...' : 'Complete Payment'}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Icon icon="mdi:shield-check" className="w-4 h-4" />
                <span>Secure Payment Gateway</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
