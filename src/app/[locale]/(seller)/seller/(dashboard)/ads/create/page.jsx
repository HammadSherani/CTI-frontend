'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import Image from 'next/image';

/* ── helpers ─────────────────────────────────────────────────────── */
const today    = () => new Date().toISOString().split('T')[0];
const fmtMoney = (n) => `$${parseFloat(n || 0).toFixed(2)}`;

function stripCard(val) { return (val || '').replace(/\D/g, ''); }
function fmtCardDisplay(raw) {
  return stripCard(raw).slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function toFullYear(y) {
  const s = String(y || '');
  return s.length === 2 ? `20${s}` : s;
}

/* ── inline card modal ───────────────────────────────────────────── */
function AddCardModal({ onClose, onSaved, token }) {
  const [card, setCard]     = useState({ cardHolderName: '', cardNumber: '', expireMonth: '', expireYear: '', cvc: '' });
  const [display, setDisplay] = useState('');
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});

  const handleCardNum = (e) => {
    const raw = stripCard(e.target.value).slice(0, 16);
    setCard((c) => ({ ...c, cardNumber: raw }));
    setDisplay(fmtCardDisplay(raw));
    if (errors.cardNumber) setErrors((er) => ({ ...er, cardNumber: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!card.cardHolderName.trim())            errs.cardHolderName = 'Cardholder name is required';
    if (card.cardNumber.length < 16)            errs.cardNumber     = 'Enter a valid 16-digit card number';
    const mm = parseInt(card.expireMonth || 0);
    if (!mm || mm < 1 || mm > 12)              errs.expireMonth    = 'Enter a valid month (01-12)';
    if (!card.expireYear)                       errs.expireYear     = 'Enter expiry year';
    const fullYear = parseInt(toFullYear(card.expireYear));
    if (fullYear < new Date().getFullYear())    errs.expireYear     = 'Card has expired';
    if (!card.cvc || card.cvc.length < 3)       errs.cvc            = 'Enter a valid CVV';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const { data } = await axiosInstance.post('/seller/ads/payment/add-card', {
        cardHolderName: card.cardHolderName.trim(),
        cardNumber:     card.cardNumber,                    // digits only
        expireMonth:    String(parseInt(card.expireMonth)).padStart(2, '0'),
        expireYear:     toFullYear(card.expireYear),
        cvc:            card.cvc,
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (data.success) {
        toast.success('Card saved successfully');
        onSaved(data.data);
        onClose();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save card');
    } finally {
      setSaving(false);
    }
  };

  const Err = ({ field }) => errors[field] ? (
    <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
      <Icon icon="mdi:alert-circle" className="w-3 h-3" />{errors[field]}
    </p>
  ) : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Card preview strip */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-7 text-white">
          <div className="flex justify-between items-center mb-5">
            <Icon icon="solar:card-bold" className="text-2xl opacity-60" />
            <span className="text-xs opacity-60 font-medium">Ad Campaign Card</span>
          </div>
          <p className="font-mono text-lg tracking-widest mb-4">
            {display || '•••• •••• •••• ••••'}
          </p>
          <div className="flex justify-between text-sm">
            <span className="opacity-70 uppercase text-xs">
              {card.cardHolderName || 'CARDHOLDER NAME'}
            </span>
            <span className="opacity-70 text-xs font-mono">
              {card.expireMonth ? card.expireMonth.padStart(2,'0') : 'MM'}/{card.expireYear ? toFullYear(card.expireYear).slice(-2) : 'YY'}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Holder name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Cardholder Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="As printed on card"
              value={card.cardHolderName}
              onChange={(e) => { setCard((c) => ({ ...c, cardHolderName: e.target.value.toUpperCase() })); setErrors((er) => ({ ...er, cardHolderName: '' })); }}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 ${errors.cardHolderName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-slate-50'}`}
            />
            <Err field="cardHolderName" />
          </div>

          {/* Card number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Card Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="1234 5678 9012 3456"
              value={display}
              onChange={handleCardNum}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary-300 ${errors.cardNumber ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-slate-50'}`}
            />
            <Err field="cardNumber" />
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Month <span className="text-red-500">*</span></label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                placeholder="MM"
                value={card.expireMonth}
                onChange={(e) => { setCard((c) => ({ ...c, expireMonth: e.target.value.replace(/\D/g,'').slice(0,2) })); setErrors((er) => ({ ...er, expireMonth: '' })); }}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-300 ${errors.expireMonth ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-slate-50'}`}
              />
              <Err field="expireMonth" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Year <span className="text-red-500">*</span></label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="YY"
                value={card.expireYear}
                onChange={(e) => { setCard((c) => ({ ...c, expireYear: e.target.value.replace(/\D/g,'').slice(0,4) })); setErrors((er) => ({ ...er, expireYear: '' })); }}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-300 ${errors.expireYear ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-slate-50'}`}
              />
              <Err field="expireYear" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">CVV <span className="text-red-500">*</span></label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="•••"
                value={card.cvc}
                onChange={(e) => { setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g,'').slice(0,4) })); setErrors((er) => ({ ...er, cvc: '' })); }}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-300 ${errors.cvc ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-slate-50'}`}
              />
              <Err field="cvc" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1">
            <Icon icon="solar:lock-password-bold" className="flex-shrink-0 text-gray-400" />
            Tokenized securely via iyzico. We never store raw card data.
          </div>

          {/* Sandbox test card hint */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px]">
            <p className="font-bold text-amber-800 flex items-center gap-1 mb-1.5">
              <Icon icon="mdi:flask-outline" className="w-3.5 h-3.5" /> Sandbox Test Cards
            </p>
            <div className="font-mono space-y-0.5 text-amber-900">
              <div className="flex justify-between"><span>Mastercard</span><span className="font-bold select-all">5528790000000008</span></div>
              <div className="flex justify-between"><span>Visa</span><span className="font-bold select-all">4603450000000000</span></div>
              <div className="flex justify-between"><span>Troy</span><span className="font-bold select-all">9792030394440796</span></div>
            </div>
            <p className="text-amber-700 mt-1.5">CVV: <strong>000</strong> · Any future date</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? <Icon icon="solar:refresh-bold" className="animate-spin" /> : <Icon icon="solar:lock-bold" />}
            Save Card
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main create page ────────────────────────────────────────────── */
export default function CreateAdCampaignPage() {
  const router    = useRouter();
  const { token } = useSelector((s) => s.auth);

  // Form state
  const [type,               setType]               = useState('sponsored_product');
  const [name,               setName]               = useState('');
  const [storeTagline,       setStoreTagline]       = useState('');
  const [startDate,          setStartDate]          = useState('');
  const [endDate,            setEndDate]            = useState('');
  const [dailyBudget,        setDailyBudget]        = useState('');
  const [totalBudget,        setTotalBudget]        = useState('');
  const [biddingType,        setBiddingType]        = useState('CPC');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [bannerFile,         setBannerFile]         = useState(null);
  const [bannerPreview,      setBannerPreview]      = useState('');
  const [paymentMethodId,    setPaymentMethodId]    = useState('');

  // Data
  const [products,       setProducts]       = useState([]);
  const [settings,       setSettings]       = useState({ minDailyBudget: 1, minTotalBudget: 5, costPerClick: 0.10, costPerThousandImpressions: 1.00 });
  const [paymentMethods, setPaymentMethods] = useState([]);

  // UI
  const [loadingData, setLoadingData] = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [formErrors,  setFormErrors]  = useState({});
  const [productSearch, setProductSearch] = useState('');
  const fileInputRef = useRef(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, settRes, payRes] = await Promise.all([
        axiosInstance.get('/seller/product?limit=200', { headers }),
        axiosInstance.get('/seller/ads/settings',      { headers }),
        axiosInstance.get('/seller/ads/payment/methods', { headers }),
      ]);
      if (prodRes.data?.success) setProducts(prodRes.data.data || []);
      if (settRes.data?.success) setSettings(settRes.data.data);
      if (payRes.data?.success) {
        const methods = payRes.data.data || [];
        setPaymentMethods(methods);
        const def = methods.find((m) => m.isDefault) || methods[0];
        if (def) setPaymentMethodId(def._id);
      }
    } catch {
      toast.error('Failed to load campaign data');
    } finally {
      setLoadingData(false);
    }
  }, [token]);

  useEffect(() => { if (token) fetchData(); }, [token, fetchData]);

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Banner must be under 2MB'); return; }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setFormErrors((err) => ({ ...err, banner: '' }));
  };

  const toggleProduct = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
    setFormErrors((err) => ({ ...err, products: '' }));
  };

  const filteredProducts = products.filter((p) =>
    (p.title || p.name || '')?.toLowerCase().includes(productSearch.toLowerCase())
  );

  /* Validate entire form and return true if clean */
  const validate = () => {
    const errs = {};
    if (!name.trim())                                        errs.name         = 'Campaign name is required';
    else if (name.trim().length < 3)                         errs.name         = 'Name must be at least 3 characters';
    if (!startDate)                                          errs.startDate    = 'Start date is required';
    if (!endDate)                                            errs.endDate      = 'End date is required';
    if (startDate && endDate && endDate <= startDate)        errs.endDate      = 'End date must be after start date';
    if (startDate && startDate < today())                    errs.startDate    = 'Start date cannot be in the past';

    const daily = parseFloat(dailyBudget);
    const total = parseFloat(totalBudget);
    if (!dailyBudget)                                        errs.dailyBudget  = 'Daily budget is required';
    else if (isNaN(daily) || daily < settings.minDailyBudget) errs.dailyBudget = `Minimum daily budget is ${fmtMoney(settings.minDailyBudget)}`;

    if (!totalBudget)                                        errs.totalBudget  = 'Total budget is required';
    else if (isNaN(total) || total < settings.minTotalBudget) errs.totalBudget = `Minimum total budget is ${fmtMoney(settings.minTotalBudget)}`;

    if (!isNaN(daily) && !isNaN(total) && daily > total)    errs.dailyBudget  = 'Daily budget cannot exceed total budget';

    if (type === 'sponsored_product' && selectedProductIds.length === 0)
      errs.products = 'Select at least one product';
    if (type === 'sponsored_store' && !bannerFile)
      errs.banner   = 'Store banner is required';

    if (!paymentMethodId)                                    errs.payment      = 'Select or add a payment method';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors above'); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('type',            type);
      fd.append('name',            name.trim());
      fd.append('startDate',       startDate);
      fd.append('endDate',         endDate);
      fd.append('dailyBudget',     dailyBudget);
      fd.append('totalBudget',     totalBudget);
      fd.append('biddingType',     biddingType);
      fd.append('paymentMethodId', paymentMethodId);

      if (type === 'sponsored_product') {
        selectedProductIds.forEach((id) => fd.append('productIds[]', id));
      } else {
        if (storeTagline) fd.append('storeTagline', storeTagline);
        if (bannerFile)   fd.append('banner', bannerFile);
      }

      const { data } = await axiosInstance.post('/seller/ads/campaigns', fd, { headers });
      if (!data.success) throw new Error(data.message);

      // Auto-submit for review
      await axiosInstance.post(`/seller/ads/campaigns/${data.data._id}/submit`, {}, { headers });
      toast.success('Campaign submitted for admin approval!');
      router.push('/seller/ads');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icon icon="svg-spinners:3-dots-fade" className="w-10 h-10 text-primary-600" />
      </div>
    );
  }

  const daily  = parseFloat(dailyBudget) || 0;
  const total  = parseFloat(totalBudget) || 0;
  const cpc    = settings.costPerClick            || 0.10;
  const cpm    = settings.costPerThousandImpressions || 1.00;
  const estClicks = daily > 0 && biddingType === 'CPC' ? Math.floor(daily / cpc) : 0;
  const estImpr   = daily > 0 && biddingType === 'CPM' ? Math.floor((daily / cpm) * 1000) : 0;

  const ErrMsg = ({ field }) => formErrors[field] ? (
    <p className="text-red-500 text-[11px] mt-1.5 flex items-center gap-1">
      <Icon icon="mdi:alert-circle" className="w-3.5 h-3.5 flex-shrink-0" />{formErrors[field]}
    </p>
  ) : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {showCardModal && (
        <AddCardModal
          token={token}
          onClose={() => setShowCardModal(false)}
          onSaved={(card) => {
            setPaymentMethods((prev) => [card, ...prev]);
            setPaymentMethodId(card._id);
          }}
        />
      )}

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
            <h1 className="text-xl font-black text-slate-900">Create Ad Campaign</h1>
            <p className="text-xs text-slate-400">New campaign will be reviewed before going live</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">

          {/* ── 1. Campaign Type ── */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Icon icon="mdi:bullseye-arrow" className="text-primary-600 w-5 h-5" />
              Campaign Objective
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'sponsored_product', icon: 'mdi:package-variant-closed', title: 'Sponsored Products', desc: 'Promote specific products in search results & category pages.' },
                { value: 'sponsored_store',   icon: 'mdi:storefront-outline',      title: 'Sponsored Store',    desc: 'Promote your entire store with a custom banner.' },
              ].map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => { setType(opt.value); setSelectedProductIds([]); setBannerFile(null); setBannerPreview(''); }}
                  className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                    type === opt.value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-slate-100 hover:border-primary-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                      <Icon icon={opt.icon} className="w-4.5 h-4.5" />
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 ${type === opt.value ? 'border-primary-600' : 'border-slate-300'}`}>
                      {type === opt.value && <div className="w-2 h-2 rounded-full bg-primary-600" />}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{opt.title}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── 2. General Info ── */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="mdi:card-text-outline" className="text-primary-600 w-5 h-5" />
              Campaign Details
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setFormErrors((er) => ({ ...er, name: '' })); }}
                placeholder="e.g. Summer Electronics Promo"
                maxLength={100}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 ${formErrors.name ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
              />
              <div className="flex items-start justify-between">
                <ErrMsg field="name" />
                <span className="text-[10px] text-slate-400 ml-auto mt-1">{name.length}/100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={today()}
                  onChange={(e) => { setStartDate(e.target.value); setFormErrors((er) => ({ ...er, startDate: '', endDate: '' })); }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 ${formErrors.startDate ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                />
                <ErrMsg field="startDate" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || today()}
                  onChange={(e) => { setEndDate(e.target.value); setFormErrors((er) => ({ ...er, endDate: '' })); }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 ${formErrors.endDate ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                />
                <ErrMsg field="endDate" />
              </div>
            </div>
          </section>

          {/* ── 3. Creative ── */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="mdi:palette-outline" className="text-primary-600 w-5 h-5" />
              {type === 'sponsored_product' ? 'Select Products' : 'Store Creative'}
            </h2>

            {type === 'sponsored_product' ? (
              <>
                <div className="relative">
                  <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                  />
                </div>

                {selectedProductIds.length > 0 && (
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-primary-600 font-semibold">{selectedProductIds.length} product{selectedProductIds.length > 1 ? 's' : ''} selected</span>
                    <button type="button" onClick={() => setSelectedProductIds([])} className="text-red-400 hover:text-red-600">Clear all</button>
                  </div>
                )}

                <div className={`max-h-56 overflow-y-auto rounded-xl border divide-y ${formErrors.products ? 'border-red-300' : 'border-slate-200'}`}>
                  {filteredProducts.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-400">
                      {products.length === 0 ? 'No products in your store yet.' : 'No products match your search.'}
                    </div>
                  ) : filteredProducts.map((prod) => {
                    const selected = selectedProductIds.includes(prod._id);
                    const defaultVariant = prod.variants?.find(v => v.isDefault) || prod.variants?.[0];
                    const displayPrice = defaultVariant?.sellingPrice || defaultVariant?.price || prod.price || 0;
                    const mainImage = defaultVariant?.images?.[0]?.url || prod.images?.[0]?.url;
                    const prodTitle = prod.title || prod.name || 'Untitled Product';
                    return (
                      <label
                        key={prod._id}
                        className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${selected ? 'bg-primary-50' : 'hover:bg-slate-50'}`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleProduct(prod._id)}
                          className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                        />
                        <div className="w-9 h-9 relative rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                          {mainImage ? (
                            <Image src={mainImage} alt={prodTitle} fill className="object-cover" />
                          ) : (
                            <Icon icon="mdi:image-outline" className="w-4 h-4 absolute inset-0 m-auto text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{prodTitle}</p>
                          <p className="text-xs text-slate-500">${Number(displayPrice).toFixed(2)}</p>
                        </div>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Store Tagline <span className="text-slate-400">(optional)</span></label>
                  <input
                    type="text"
                    value={storeTagline}
                    onChange={(e) => setStoreTagline(e.target.value)}
                    placeholder="e.g. Best deals every day!"
                    maxLength={150}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Store Banner <span className="text-red-500">*</span>
                    <span className="font-normal text-slate-400 ml-1">(1200×300 recommended, max 2MB)</span>
                  </label>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleBannerChange} />
                  {bannerPreview ? (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-slate-200 group">
                      <Image src={bannerPreview} alt="Banner preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white text-slate-900 px-4 py-1.5 rounded-lg text-sm font-bold">
                          Change Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${formErrors.banner ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-primary-50'}`}
                    >
                      <Icon icon="mdi:cloud-upload-outline" className="w-7 h-7 text-slate-400 mb-2" />
                      <p className="text-sm font-medium text-slate-600">Click to upload banner</p>
                      <p className="text-xs text-slate-400 mt-0.5">PNG, JPG up to 2MB</p>
                    </div>
                  )}
                  <ErrMsg field="banner" />
                </div>
              </div>
            )}
          </section>

          {/* ── 4. Budget & Bidding ── */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="mdi:bank-outline" className="text-primary-600 w-5 h-5" />
              Budget & Bidding
            </h2>

            {/* Bidding type */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'CPC', icon: 'mdi:cursor-default-click-outline', label: 'Cost Per Click',        sublabel: `${fmtMoney(cpc)} / click` },
                { value: 'CPM', icon: 'mdi:eye-outline',                  label: 'Cost Per 1K Impressions', sublabel: `${fmtMoney(cpm)} / 1000 views` },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    biddingType === opt.value ? 'border-primary-600 bg-primary-50' : 'border-slate-100 hover:border-primary-200'
                  }`}
                >
                  <input type="radio" name="biddingType" value={opt.value} checked={biddingType === opt.value} onChange={() => setBiddingType(opt.value)} className="sr-only" />
                  <Icon icon={opt.icon} className={`w-5 h-5 ${biddingType === opt.value ? 'text-primary-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{opt.label}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{opt.sublabel}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Budget inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Daily Budget <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                  <input
                    type="number"
                    value={dailyBudget}
                    onChange={(e) => { setDailyBudget(e.target.value); setFormErrors((er) => ({ ...er, dailyBudget: '' })); }}
                    min={settings.minDailyBudget}
                    step="0.50"
                    placeholder={`Min ${fmtMoney(settings.minDailyBudget)}`}
                    className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 ${formErrors.dailyBudget ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                  />
                </div>
                <ErrMsg field="dailyBudget" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Total Budget <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                  <input
                    type="number"
                    value={totalBudget}
                    onChange={(e) => { setTotalBudget(e.target.value); setFormErrors((er) => ({ ...er, totalBudget: '' })); }}
                    min={settings.minTotalBudget}
                    step="1"
                    placeholder={`Min ${fmtMoney(settings.minTotalBudget)}`}
                    className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 ${formErrors.totalBudget ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                  />
                </div>
                <ErrMsg field="totalBudget" />
              </div>
            </div>

            {/* Live estimates */}
            {daily > 0 && (
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-primary-50 rounded-xl p-3 border border-primary-100">
                  <p className="text-[11px] text-primary-600 font-medium">Est. daily {biddingType === 'CPC' ? 'clicks' : 'impressions'}</p>
                  <p className="text-base font-black text-violet-900 mt-0.5">
                    {biddingType === 'CPC' ? `~${estClicks.toLocaleString()} clicks` : `~${estImpr.toLocaleString()} views`}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium">Campaign duration</p>
                  <p className="text-base font-black text-slate-800 mt-0.5">
                    {startDate && endDate
                      ? `${Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000))} days`
                      : '—'}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* ── 5. Payment Method ── */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Icon icon="mdi:credit-card-outline" className="text-primary-600 w-5 h-5" />
                Payment Method
              </h2>
              <button
                type="button"
                onClick={() => setShowCardModal(true)}
                className="text-sm font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Icon icon="mdi:plus" className="w-4 h-4" /> Add Card
              </button>
            </div>

            {paymentMethods.length === 0 ? (
              <div className={`p-5 text-center border-2 border-dashed rounded-2xl ${formErrors.payment ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                <Icon icon="mdi:credit-card-off-outline" className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">No saved payment method</p>
                <p className="text-xs text-slate-400 mt-1">Add a card to activate your campaign</p>
              </div>
            ) : (
              <div className="space-y-2">
                {paymentMethods.map((pm) => (
                  <label
                    key={pm._id}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethodId === pm._id ? 'border-primary-600 bg-primary-50' : 'border-slate-100 hover:border-primary-200'
                    }`}
                  >
                    <input type="radio" name="pm" value={pm._id} checked={paymentMethodId === pm._id} onChange={() => { setPaymentMethodId(pm._id); setFormErrors((er) => ({ ...er, payment: '' })); }} className="sr-only" />
                    <Icon icon="mdi:credit-card" className={`w-6 h-6 ${paymentMethodId === pm._id ? 'text-primary-600' : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 capitalize">{pm.brand} •••• {pm.last4}</p>
                      <p className="text-xs text-slate-400">{pm.holderName} · Exp {String(pm.expMonth).padStart(2,'0')}/{pm.expYear}</p>
                    </div>
                    {pm.isDefault && <span className="text-[10px] font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">Default</span>}
                    {paymentMethodId === pm._id && <Icon icon="mdi:check-circle" className="text-primary-600 w-4 h-4" />}
                  </label>
                ))}
              </div>
            )}
            <ErrMsg field="payment" />

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2 text-[11px] text-blue-700">
              <Icon icon="mdi:information-outline" className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Your card will not be charged now. Billing starts only after admin approval, based on actual clicks/impressions.
            </div>
          </section>

          {/* ── Actions ── */}
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
                ? <><Icon icon="svg-spinners:180-ring-with-bg" className="w-5 h-5" /> Submitting…</>
                : <><Icon icon="mdi:send-outline" className="w-5 h-5" /> Submit for Approval</>
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
