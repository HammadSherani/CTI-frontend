'use client';

import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import Image from 'next/image';

export default function CreateAdCampaignPage() {
  const router = useRouter();
  const { token } = useSelector(s => s.auth);

  // Form State
  const [type, setType] = useState('sponsored_product'); // 'sponsored_product' | 'sponsored_store'
  const [name, setName] = useState('');
  const [storeTagline, setStoreTagline] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dailyBudget, setDailyBudget] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [biddingType, setBiddingType] = useState('CPC');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');

  // Options Data
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const fileInputRef = useRef(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardData, setCardData] = useState({ cardHolderName: '', cardNumber: '', expireMonth: '', expireYear: '', cvc: '' });
  const [savingCard, setSavingCard] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchInitialData = async () => {
      try {
        const [prodRes, settRes, payRes] = await Promise.all([
          axiosInstance.get('/seller/product?limit=100', { headers: { Authorization: `Bearer ${token}` } }),
          axiosInstance.get('/seller/ads/settings', { headers: { Authorization: `Bearer ${token}` } }),
          axiosInstance.get('/seller/ads/payment/methods', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (prodRes.data?.success) setProducts(prodRes.data.data || []);
        if (settRes.data?.success) setSettings(settRes.data.data);
        if (payRes.data?.success) {
          setPaymentMethods(payRes.data.data);
          const defaultMethod = payRes.data.data.find(m => m.isDefault) || payRes.data.data[0];
          if (defaultMethod) setSelectedPaymentMethod(defaultMethod._id);
        }
      } catch (err) {
        toast.error('Failed to load required data');
      } finally {
        setFetchingData(false);
      }
    };
    fetchInitialData();
  }, [token]);

  // Handle banner upload preview
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Banner size must be less than 2MB');
        return;
      }
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const toggleProduct = (id) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSaveCard = async () => {
    if (!cardData.cardHolderName || !cardData.cardNumber || !cardData.expireMonth || !cardData.expireYear || !cardData.cvc) {
      toast.error("Please fill all card details");
      return;
    }
    setSavingCard(true);
    try {
      const { data } = await axiosInstance.post('/seller/ads/payment/add-card', cardData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success("Card added successfully");
        setPaymentMethods(prev => [data.data, ...prev]);
        setSelectedPaymentMethod(data.data._id);
        setShowCardModal(false);
        setCardData({ cardHolderName: '', cardNumber: '', expireMonth: '', expireYear: '', cvc: '' });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add card');
    } finally {
      setSavingCard(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !startDate || !endDate || !dailyBudget || !totalBudget) {
      toast.error('Please fill all required fields');
      return;
    }
    if (type === 'sponsored_product' && selectedProductIds.length === 0) {
      toast.error('Please select at least one product');
      return;
    }
    if (type === 'sponsored_store' && !bannerFile) {
      toast.error('Please upload a store banner');
      return;
    }
    if (!selectedPaymentMethod) {
      toast.error('Please select or add a payment method');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('name', name);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('dailyBudget', dailyBudget);
      formData.append('totalBudget', totalBudget);
      formData.append('biddingType', biddingType);
      formData.append('paymentMethodId', selectedPaymentMethod);

      if (type === 'sponsored_product') {
        selectedProductIds.forEach(id => formData.append('productIds[]', id));
      } else {
        formData.append('storeTagline', storeTagline);
        if (bannerFile) {
          formData.append('banner', bannerFile);
        }
      }

      // Create campaign as draft
      const { data } = await axiosInstance.post('/seller/ads/campaigns', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        // Automatically submit for review
        await axiosInstance.post(`/seller/ads/campaigns/${data.data._id}/submit`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Campaign created and submitted for approval!');
        router.push('/seller/ads');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Icon icon="svg-spinners:3-dots-fade" className="w-8 h-8 text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center transition-colors">
            <Icon icon="mdi:arrow-left" className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Create Campaign</h1>
            <p className="text-sm text-slate-500 mt-1">Set up a new advertisement campaign</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Campaign Type */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="mdi:bullseye-arrow" className="w-5 h-5 text-violet-600" />
              Campaign Objective
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setType('sponsored_product')}
                className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${type === 'sponsored_product'
                    ? 'border-violet-600 bg-violet-50'
                    : 'border-slate-100 bg-white hover:border-violet-200'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
                    <Icon icon="mdi:package-variant-closed" className="w-5 h-5" />
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${type === 'sponsored_product' ? 'border-violet-600' : 'border-slate-300'}`}>
                    {type === 'sponsored_product' && <div className="w-2.5 h-2.5 bg-violet-600 rounded-full" />}
                  </div>
                </div>
                <h3 className="font-bold text-slate-900">Sponsored Products</h3>
                <p className="text-xs text-slate-500 mt-1">Promote specific products from your catalog to appear in search results.</p>
              </div>

              <div
                onClick={() => setType('sponsored_store')}
                className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${type === 'sponsored_store'
                    ? 'border-violet-600 bg-violet-50'
                    : 'border-slate-100 bg-white hover:border-violet-200'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
                    <Icon icon="mdi:storefront-outline" className="w-5 h-5" />
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${type === 'sponsored_store' ? 'border-violet-600' : 'border-slate-300'}`}>
                    {type === 'sponsored_store' && <div className="w-2.5 h-2.5 bg-violet-600 rounded-full" />}
                  </div>
                </div>
                <h3 className="font-bold text-slate-900">Sponsored Store</h3>
                <p className="text-xs text-slate-500 mt-1">Promote your entire store with a custom banner on category pages.</p>
              </div>
            </div>
          </div>

          {/* General Details */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="mdi:card-text-outline" className="w-5 h-5 text-violet-600" />
              General Details
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Campaign Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="e.g. Summer Sale 2024"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Start Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">End Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                />
              </div>
            </div>
          </div>

          {/* Creative Section */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="mdi:palette-outline" className="w-5 h-5 text-violet-600" />
              {type === 'sponsored_product' ? 'Select Products' : 'Store Creative'}
            </h2>

            {type === 'sponsored_product' ? (
              <div>
                <p className="text-xs text-slate-500 mb-4">Select the products you want to feature in this campaign.</p>
                <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                  {products.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">No products available. Add products first.</div>
                  ) : (
                    products.map(prod => (
                      <label key={prod._id} className="flex items-center gap-4 p-3 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(prod._id)}
                          onChange={() => toggleProduct(prod._id)}
                          className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-600"
                        />
                        <div className="w-10 h-10 relative rounded bg-slate-100 overflow-hidden flex-shrink-0">
                          {prod.images?.[0] ? (
                            <Image src={prod.images[0].url} alt={prod.name} fill className="object-cover" />
                          ) : (
                            <Icon icon="mdi:image-outline" className="w-5 h-5 absolute inset-0 m-auto text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{prod.name}</p>
                          <p className="text-xs text-slate-500">${prod.price}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Store Tagline</label>
                  <input
                    type="text"
                    value={storeTagline}
                    onChange={e => setStoreTagline(e.target.value)}
                    placeholder="e.g. Quality products for less"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Store Banner (1200x300 recommended) <span className="text-red-500">*</span></label>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleBannerChange}
                  />

                  {bannerPreview ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-slate-200 group">
                      <Image src={bannerPreview} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
                        >
                          Change Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-40 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-violet-400 flex flex-col items-center justify-center cursor-pointer transition-colors"
                    >
                      <Icon icon="mdi:cloud-upload-outline" className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm font-medium text-slate-600">Click to upload banner</p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 2MB</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Budget & Bidding */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="mdi:bank-outline" className="w-5 h-5 text-violet-600" />
              Budget & Bidding
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Bidding Strategy</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="biddingType"
                    value="CPC"
                    checked={biddingType === 'CPC'}
                    onChange={() => setBiddingType('CPC')}
                    className="w-4 h-4 text-violet-600"
                  />
                  <span className="text-sm text-slate-700">Cost Per Click (CPC)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="biddingType"
                    value="CPM"
                    checked={biddingType === 'CPM'}
                    onChange={() => setBiddingType('CPM')}
                    className="w-4 h-4 text-violet-600"
                  />
                  <span className="text-sm text-slate-700">Cost Per Mille (CPM)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Daily Budget ($) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={dailyBudget}
                  onChange={e => setDailyBudget(e.target.value)}
                  min={settings?.minDailyBudget || 1}
                  step="0.1"
                  required
                  placeholder={`Min $${settings?.minDailyBudget || 1}`}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Total Campaign Budget ($) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={totalBudget}
                  onChange={e => setTotalBudget(e.target.value)}
                  min={settings?.minTotalBudget || 5}
                  step="1"
                  required
                  placeholder={`Min $${settings?.minTotalBudget || 5}`}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-700">
              <Icon icon="mdi:information-outline" className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                Your campaign will be reviewed by administrators after submission. Once approved, the budget will be deducted from your available balance as the ad runs. Make sure you have added a valid payment method if required.
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Icon icon="mdi:credit-card-outline" className="w-5 h-5 text-violet-600" />
                Payment Method
              </h2>
              <button
                type="button"
                onClick={() => setShowCardModal(true)}
                className="text-sm font-bold text-violet-600 bg-violet-50 px-4 py-2 rounded-xl hover:bg-violet-100 transition-colors flex items-center gap-2"
              >
                <Icon icon="mdi:plus" /> Add New Card
              </button>
            </div>
            
            {paymentMethods.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <Icon icon="mdi:credit-card-off-outline" className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 font-medium">No payment methods found.</p>
                <p className="text-xs text-slate-500 mt-1">Please add a card to proceed with campaign creation.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentMethods.map(pm => (
                  <label
                    key={pm._id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPaymentMethod === pm._id ? 'border-violet-600 bg-violet-50' : 'border-slate-100 hover:border-violet-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg border border-slate-100 flex items-center justify-center shadow-sm">
                        <Icon icon="mdi:credit-card" className={`w-6 h-6 ${selectedPaymentMethod === pm._id ? 'text-violet-600' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{pm.brand} •••• {pm.last4}</p>
                        <p className="text-xs text-slate-500">{pm.holderName}</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm._id}
                      checked={selectedPaymentMethod === pm._id}
                      onChange={() => setSelectedPaymentMethod(pm._id)}
                      className="w-4 h-4 text-violet-600 focus:ring-violet-500"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <Icon icon="svg-spinners:180-ring-with-bg" className="w-5 h-5" />
              ) : (
                <Icon icon="mdi:check-bold" className="w-5 h-5" />
              )}
              Create Campaign
            </button>
          </div>
        </form>
      </div>

      {/* Add Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Add Credit Card</h3>
              <button onClick={() => setShowCardModal(false)} className="text-slate-400 hover:text-slate-600">
                <Icon icon="mdi:close" className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Card Holder Name</label>
                <input
                  type="text"
                  value={cardData.cardHolderName}
                  onChange={e => setCardData({...cardData, cardHolderName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardData.cardNumber}
                  onChange={e => setCardData({...cardData, cardNumber: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                  placeholder="1111222233334444"
                  maxLength={16}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Month</label>
                  <input
                    type="text"
                    value={cardData.expireMonth}
                    onChange={e => setCardData({...cardData, expireMonth: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                    placeholder="MM"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
                  <input
                    type="text"
                    value={cardData.expireYear}
                    onChange={e => setCardData({...cardData, expireYear: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                    placeholder="YY"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CVC</label>
                  <input
                    type="text"
                    value={cardData.cvc}
                    onChange={e => setCardData({...cardData, cvc: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowCardModal(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCard}
                disabled={savingCard}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {savingCard ? <Icon icon="svg-spinners:180-ring-with-bg" className="w-5 h-5" /> : 'Save Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
