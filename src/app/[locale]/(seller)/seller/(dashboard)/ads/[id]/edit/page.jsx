'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import Image from 'next/image';

const today = () => new Date().toISOString().split('T')[0];
const fmtMoney = (n) => `$${parseFloat(n || 0).toFixed(2)}`;

export default function EditAdCampaignPage() {
  const router    = useRouter();
  const { id }   = useParams();
  const { token } = useSelector((s) => s.auth);

  const [campaign,       setCampaign]       = useState(null);
  const [loadingCamp,    setLoadingCamp]    = useState(true);

  const [name,               setName]               = useState('');
  const [startDate,          setStartDate]          = useState('');
  const [dailyBudget,        setDailyBudget]        = useState('');
  const [totalBudget,        setTotalBudget]        = useState('');
  const [storeTagline,       setStoreTagline]       = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [bannerFile,         setBannerFile]         = useState(null);
  const [bannerPreview,      setBannerPreview]      = useState('');
  const [paymentMethodId,    setPaymentMethodId]    = useState('');

  const [products,       setProducts]       = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [settings,       setSettings]       = useState({ minDailyBudget: 1, minTotalBudget: 5 });

  const [productSearch, setProductSearch] = useState('');
  const [formErrors,    setFormErrors]   = useState({});
  const [submitting,    setSubmitting]    = useState(false);
  const fileInputRef = useRef(null);
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    try {
      const [campRes, prodRes, settRes, payRes] = await Promise.all([
        axiosInstance.get(`/seller/ads/campaigns/${id}`,       { headers }),
        axiosInstance.get('/seller/product?limit=200',         { headers }),
        axiosInstance.get('/seller/ads/settings',              { headers }),
        axiosInstance.get('/seller/ads/payment/methods',       { headers }),
      ]);

      if (campRes.data.success) {
        const c = campRes.data.data;
        if (!['draft', 'rejected'].includes(c.status)) {
          toast.error('Only draft or rejected campaigns can be edited');
          router.push(`/seller/ads/${id}`);
          return;
        }
        setCampaign(c);
        setName(c.name || '');
        setStartDate(c.startDate ? c.startDate.split('T')[0] : '');
        setDailyBudget(c.dailyBudget || '');
        setTotalBudget(c.totalBudget || '');
        setStoreTagline(c.storeTagline || '');
        setSelectedProductIds((c.productIds || []).map(p => p._id || p));
        setBannerPreview(c.bannerUrl || '');
        setPaymentMethodId(c.paymentMethod ? '__embedded__' : '');
      }
      if (prodRes.data.success)  setProducts(prodRes.data.data || []);
      if (settRes.data.success)  setSettings(settRes.data.data);
      if (payRes.data.success) {
        const methods = payRes.data.data || [];
        setPaymentMethods(methods);
        if (!campRes.data.data?.paymentMethod) {
          const def = methods.find(m => m.isDefault) || methods[0];
          if (def) setPaymentMethodId(def._id);
        } else {
          setPaymentMethodId('__embedded__');
        }
      }
    } catch {
      toast.error('Failed to load campaign');
    } finally {
      setLoadingCamp(false);
    }
  }, [id, token]);

  useEffect(() => { if (token && id) fetchAll(); }, [token, id, fetchAll]);

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Banner must be under 2MB'); return; }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const toggleProduct = (productId) => {
    setSelectedProductIds(prev =>
      prev.includes(productId) ? prev.filter(p => p !== productId) : [...prev, productId]
    );
  };

  const filteredProducts = products.filter(p =>
    (p.title || '').toLowerCase().includes(productSearch.toLowerCase())
  );

  const validate = () => {
    const errs = {};
    if (!name.trim())                          errs.name        = 'Campaign name is required';
    if (!startDate)                            errs.startDate   = 'Start date is required';
    const daily = parseFloat(dailyBudget);
    const total = parseFloat(totalBudget);
    if (!dailyBudget || isNaN(daily) || daily < settings.minDailyBudget)
      errs.dailyBudget = `Min daily budget is ${fmtMoney(settings.minDailyBudget)}`;
    if (!totalBudget || isNaN(total) || total < settings.minTotalBudget)
      errs.totalBudget = `Min total budget is ${fmtMoney(settings.minTotalBudget)}`;
    if (!isNaN(daily) && !isNaN(total) && daily > total)
      errs.dailyBudget = 'Daily budget cannot exceed total budget';
    if (campaign?.type === 'sponsored_product' && selectedProductIds.length === 0)
      errs.products = 'Select at least one product';
    if (campaign?.type === 'sponsored_store' && !bannerPreview)
      errs.banner = 'Store banner is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors above'); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name',        name.trim());
      fd.append('startDate',   startDate);
      fd.append('dailyBudget', dailyBudget);
      fd.append('totalBudget', totalBudget);
      if (storeTagline) fd.append('storeTagline', storeTagline);
      if (campaign.type === 'sponsored_product') {
        selectedProductIds.forEach(pid => fd.append('productIds[]', pid));
      } else if (bannerFile) {
        fd.append('banner', bannerFile);
      }
      if (paymentMethodId && paymentMethodId !== '__embedded__') {
        fd.append('paymentMethodId', paymentMethodId);
      }

      const { data } = await axiosInstance.put(`/seller/ads/campaigns/${id}`, fd, { headers });
      if (!data.success) throw new Error(data.message);
      toast.success('Campaign updated successfully');
      router.push(`/seller/ads/${id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to update campaign');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCamp) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icon icon="svg-spinners:3-dots-fade" className="w-10 h-10 text-primary-600" />
      </div>
    );
  }

  if (!campaign) return null;

  const daily = parseFloat(dailyBudget) || 0;
  const total = parseFloat(totalBudget) || 0;
  const cpc   = settings.costPerClick || 0.10;
  const estDays         = daily > 0 && total > 0 ? Math.ceil(total / daily) : 0;
  const estClicksPerDay = daily > 0 && cpc > 0   ? Math.floor(daily / cpc)  : 0;

  const ErrMsg = ({ field }) => formErrors[field] ? (
    <p className="text-red-500 text-[11px] mt-1.5 flex items-center gap-1">
      <Icon icon="mdi:alert-circle" className="w-3.5 h-3.5 flex-shrink-0" />{formErrors[field]}
    </p>
  ) : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900">Edit Campaign</h1>
            <p className="text-xs text-slate-400 truncate max-w-xs">{campaign.name}</p>
          </div>
          {campaign.status === 'rejected' && (
            <span className="ml-auto text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">Rejected — fix & resubmit</span>
          )}
        </div>
      </div>

      {/* Rejection reason banner */}
      {campaign.status === 'rejected' && campaign.rejectionReason && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
            <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800">Rejection reason:</p>
              <p className="text-xs text-red-600 mt-1">{campaign.rejectionReason}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">

          {/* Campaign Details */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="mdi:card-text-outline" className="text-primary-600 w-5 h-5" />
              Campaign Details
            </h2>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Campaign Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={name}
                maxLength={100}
                onChange={(e) => { setName(e.target.value); setFormErrors(er => ({ ...er, name: '' })); }}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 ${formErrors.name ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
              />
              <ErrMsg field="name" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Start Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={startDate}
                min={today()}
                onChange={(e) => { setStartDate(e.target.value); setFormErrors(er => ({ ...er, startDate: '' })); }}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 ${formErrors.startDate ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
              />
              <ErrMsg field="startDate" />
              <p className="text-[10px] text-slate-400 mt-1">Campaign ends automatically when budget is spent.</p>
            </div>
          </section>

          {/* Creative */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="mdi:palette-outline" className="text-primary-600 w-5 h-5" />
              {campaign.type === 'sponsored_product' ? 'Products' : 'Store Creative'}
            </h2>

            {campaign.type === 'sponsored_product' ? (
              <>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products…"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
                {selectedProductIds.length > 0 && (
                  <p className="text-xs text-primary-600 font-semibold">{selectedProductIds.length} selected</p>
                )}
                <div className={`max-h-56 overflow-y-auto rounded-xl border divide-y ${formErrors.products ? 'border-red-300' : 'border-slate-200'}`}>
                  {filteredProducts.length === 0 ? (
                    <p className="p-6 text-center text-sm text-slate-400">No products found</p>
                  ) : filteredProducts.map(prod => {
                    const selected = selectedProductIds.includes(prod._id);
                    const mainImg  = prod.variants?.[0]?.images?.[0]?.url || prod.images?.[0]?.url;
                    return (
                      <label key={prod._id} className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${selected ? 'bg-primary-50' : 'hover:bg-slate-50'}`}>
                        <input type="checkbox" checked={selected} onChange={() => toggleProduct(prod._id)} className="w-4 h-4 text-primary-600 rounded border-slate-300" />
                        <div className="w-9 h-9 relative rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                          {mainImg && <Image src={mainImg} alt={prod.title || ''} fill className="object-cover" />}
                        </div>
                        <p className="text-sm font-semibold text-slate-900 truncate flex-1">{prod.title || prod.name}</p>
                        {selected && <Icon icon="mdi:check-circle" className="text-primary-600 w-4 h-4 flex-shrink-0" />}
                      </label>
                    );
                  })}
                </div>
                <ErrMsg field="products" />
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Store Tagline</label>
                  <input
                    type="text"
                    value={storeTagline}
                    maxLength={150}
                    onChange={(e) => setStoreTagline(e.target.value)}
                    placeholder="e.g. Best deals every day!"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Store Banner <span className="text-xs font-normal text-slate-400">(leave unchanged to keep current)</span>
                  </label>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleBannerChange} />
                  {bannerPreview ? (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-slate-200 group">
                      <Image src={bannerPreview} alt="Banner" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white text-slate-900 px-4 py-1.5 rounded-lg text-sm font-bold">
                          Change Banner
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-36 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-primary-400 flex flex-col items-center justify-center cursor-pointer transition-colors"
                    >
                      <Icon icon="mdi:cloud-upload-outline" className="w-7 h-7 text-slate-400 mb-2" />
                      <p className="text-sm font-medium text-slate-600">Upload banner</p>
                    </div>
                  )}
                  <ErrMsg field="banner" />
                </div>
              </div>
            )}
          </section>

          {/* Budget */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="mdi:bank-outline" className="text-primary-600 w-5 h-5" />
              Budget
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Daily Budget <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number" step="0.50" min={settings.minDailyBudget}
                    value={dailyBudget}
                    onChange={(e) => { setDailyBudget(e.target.value); setFormErrors(er => ({ ...er, dailyBudget: '' })); }}
                    className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 ${formErrors.dailyBudget ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                  />
                </div>
                <ErrMsg field="dailyBudget" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Total Budget <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number" step="1" min={settings.minTotalBudget}
                    value={totalBudget}
                    onChange={(e) => { setTotalBudget(e.target.value); setFormErrors(er => ({ ...er, totalBudget: '' })); }}
                    className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 ${formErrors.totalBudget ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                  />
                </div>
                <ErrMsg field="totalBudget" />
              </div>
            </div>
            {daily > 0 && total > 0 && (
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-primary-50 rounded-xl p-3 border border-primary-100">
                  <p className="text-[11px] text-primary-600">Est. daily clicks</p>
                  <p className="text-base font-black text-violet-900">~{estClicksPerDay.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[11px] text-slate-500">Est. duration</p>
                  <p className="text-base font-black text-slate-800">~{estDays} day{estDays !== 1 ? 's' : ''}</p>
                </div>
              </div>
            )}
          </section>

          {/* Payment method (show existing embedded card info) */}
          {campaign.paymentMethod && (
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Icon icon="mdi:credit-card-outline" className="text-primary-600 w-5 h-5" />
                Payment Method
              </h2>
              <div className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-primary-600 bg-primary-50">
                <Icon icon="mdi:credit-card" className="w-6 h-6 text-primary-600" />
                <div>
                  <p className="text-sm font-bold text-slate-900 capitalize">{campaign.paymentMethod.brand} •••• {campaign.paymentMethod.last4}</p>
                  <p className="text-xs text-slate-400">{campaign.paymentMethod.holderName} · Exp {String(campaign.paymentMethod.expMonth).padStart(2,'0')}/{campaign.paymentMethod.expYear}</p>
                </div>
                <Icon icon="mdi:check-circle" className="text-primary-600 w-4 h-4 ml-auto" />
              </div>
              {paymentMethods.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-slate-400">Or switch to a different card:</p>
                  {paymentMethods.map(pm => (
                    <label key={pm._id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${paymentMethodId === pm._id ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-300'}`}>
                      <input type="radio" name="pm" value={pm._id} checked={paymentMethodId === pm._id} onChange={() => setPaymentMethodId(pm._id)} className="sr-only" />
                      <Icon icon="mdi:credit-card" className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-900 capitalize">{pm.brand} •••• {pm.last4}</span>
                    </label>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-[2] py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting
                ? <><Icon icon="svg-spinners:180-ring-with-bg" className="w-5 h-5" /> Saving…</>
                : <><Icon icon="mdi:content-save-outline" className="w-5 h-5" /> Save Changes</>
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
