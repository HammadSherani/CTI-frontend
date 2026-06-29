'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

const BRAND_ICON = {
  visa:       'logos:visa',
  mastercard: 'logos:mastercard',
  amex:       'logos:amex',
  troy:       'solar:card-bold',
};

function CardBrand({ brand }) {
  const icon = BRAND_ICON[brand?.toLowerCase()];
  if (icon && icon !== 'solar:card-bold') return <Icon icon={icon} className="text-3xl" />;
  return <Icon icon="solar:card-bold" className="text-3xl text-gray-400" />;
}

// Format card number with spaces every 4 digits
function formatCardDisplay(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

const INITIAL_FORM = { cardHolderName: '', cardNumber: '', expireMonth: '', expireYear: '', cvc: '' };

export default function AdPaymentPage() {
  const router    = useRouter();
  const { token } = useSelector((s) => s.auth);

  const [methods,     setMethods]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [deleteId,    setDeleteId]    = useState(null);
  const [form,        setForm]        = useState(INITIAL_FORM);
  const [cardDisplay, setCardDisplay] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/seller/ads/payment/methods', { headers });
      setMethods(data.data || []);
    } catch {
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMethods(); }, []);

  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    setForm((f) => ({ ...f, cardNumber: raw }));
    setCardDisplay(formatCardDisplay(raw));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { cardHolderName, cardNumber, expireMonth, expireYear, cvc } = form;

    if (!cardHolderName || !cardNumber || !expireMonth || !expireYear || !cvc) {
      toast.error('All fields are required');
      return;
    }
    if (cardNumber.length < 16) { toast.error('Enter a valid 16-digit card number'); return; }
    if (cvc.length < 3)          { toast.error('Enter a valid CVV'); return; }

    const month = parseInt(expireMonth);
    const year  = parseInt(expireYear);
    if (month < 1 || month > 12)  { toast.error('Invalid expiry month (01-12)'); return; }
    if (year < new Date().getFullYear() % 100) { toast.error('Card has expired'); return; }

    setSaving(true);
    try {
      const { data } = await axiosInstance.post('/seller/ads/payment/add-card', {
        cardHolderName,
        cardNumber,
        expireMonth: expireMonth.padStart(2, '0'),
        expireYear:  expireYear.length === 2 ? `20${expireYear}` : expireYear,
        cvc,
      }, { headers });

      toast.success('Card saved successfully');
      setMethods((m) => [data.data, ...m]);
      setShowForm(false);
      setForm(INITIAL_FORM);
      setCardDisplay('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save card');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await axiosInstance.put(`/seller/ads/payment/methods/${id}/default`, {}, { headers });
      toast.success('Default card updated');
      fetchMethods();
    } catch {
      toast.error('Failed to update default card');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this card?')) return;
    setDeleteId(id);
    try {
      await axiosInstance.delete(`/seller/ads/payment/methods/${id}`, { headers });
      toast.success('Card removed');
      setMethods((m) => m.filter((c) => c._id !== id));
    } catch {
      toast.error('Failed to remove card');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <Icon icon="solar:arrow-left-bold" className="text-gray-600 text-xl" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cards used for your ad campaign billing</p>
        </div>
      </div>

      {/* Saved Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Icon icon="solar:refresh-bold" className="text-primary-500 text-3xl animate-spin" />
        </div>
      ) : (
        <div className="space-y-3 mb-5">
          {methods.length === 0 && !showForm && (
            <div className="flex flex-col items-center justify-center py-14 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
              <Icon icon="solar:card-bold-duotone" className="text-5xl text-gray-300 mb-3" />
              <p className="font-medium text-gray-500">No saved payment methods</p>
              <p className="text-sm text-gray-400 mt-1">Add a card to start running ad campaigns</p>
            </div>
          )}

          {methods.map((pm) => (
            <div
              key={pm._id}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 bg-white transition-all ${
                pm.isDefault ? 'border-primary-300 bg-primary-50/30' : 'border-gray-100'
              }`}
            >
              <CardBrand brand={pm.brand} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 capitalize">{pm.brand}</span>
                  <span className="text-gray-500 font-mono">•••• {pm.last4}</span>
                  {pm.isDefault && (
                    <span className="text-[10px] font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">Default</span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {pm.holderName} · Exp {String(pm.expMonth).padStart(2,'0')}/{pm.expYear}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!pm.isDefault && (
                  <button
                    onClick={() => handleSetDefault(pm._id)}
                    className="text-xs text-primary-600 font-medium px-3 py-1.5 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(pm._id)}
                  disabled={deleteId === pm._id}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  <Icon icon="solar:trash-bin-trash-bold" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Card Form */}
      {showForm ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Card preview */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white">
            <div className="flex justify-between items-start mb-6">
              <Icon icon="solar:card-bold" className="text-2xl opacity-70" />
              <span className="text-sm font-medium opacity-70">Ad Campaign Card</span>
            </div>
            <div className="font-mono text-xl tracking-widest mb-4">
              {cardDisplay || '•••• •••• •••• ••••'}
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-70">{form.cardHolderName || 'CARD HOLDER NAME'}</span>
              <span className="opacity-70">
                {form.expireMonth ? form.expireMonth.padStart(2,'0') : 'MM'}/
                {form.expireYear  ? form.expireYear.slice(-2)         : 'YY'}
              </span>
            </div>
          </div>

          {/* Form fields */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
              <input
                type="text"
                placeholder="Name as on card"
                value={form.cardHolderName}
                onChange={(e) => setForm((f) => ({ ...f, cardHolderName: e.target.value.toUpperCase() }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                value={cardDisplay}
                onChange={handleCardNumberChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm font-mono tracking-wider"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="MM"
                  value={form.expireMonth}
                  onChange={(e) => setForm((f) => ({ ...f, expireMonth: e.target.value.replace(/\D/g,'').slice(0,2) }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm text-center"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="YY"
                  value={form.expireYear}
                  onChange={(e) => setForm((f) => ({ ...f, expireYear: e.target.value.replace(/\D/g,'').slice(0,4) }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm text-center"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="•••"
                  value={form.cvc}
                  onChange={(e) => setForm((f) => ({ ...f, cvc: e.target.value.replace(/\D/g,'').slice(0,4) }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm text-center"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
              <Icon icon="solar:lock-password-bold" className="text-gray-400 flex-shrink-0" />
              <span>Card data is tokenized securely via iyzico. We never store your full card number.</span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(INITIAL_FORM); setCardDisplay(''); }}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? <Icon icon="solar:refresh-bold" className="animate-spin" /> : <Icon icon="solar:lock-bold" />}
                Save Card
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-primary-300 text-primary-600 font-semibold text-sm hover:bg-primary-50 transition-colors"
        >
          <Icon icon="solar:add-circle-bold" className="text-lg" />
          Add New Card
        </button>
      )}

      {/* Info box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 text-sm">
        <Icon icon="solar:info-circle-bold" className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-blue-800">
          <strong>How billing works:</strong> Your card is verified now but not charged immediately. You are only billed
          for actual ad spend — clicks (CPC) or impressions (CPM) — as your campaign runs.
        </div>
      </div>

      {/* Sandbox test card hint */}
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
        <p className="font-bold text-amber-800 flex items-center gap-1.5 mb-2">
          <Icon icon="mdi:flask-outline" className="w-4 h-4" />
          Sandbox Test Cards (iyzico)
        </p>
        <div className="font-mono text-xs space-y-1 text-amber-900">
          <div className="flex justify-between"><span>Mastercard</span><span className="font-bold">5528790000000008</span></div>
          <div className="flex justify-between"><span>Visa</span><span className="font-bold">4603450000000000</span></div>
          <div className="flex justify-between"><span>Troy</span><span className="font-bold">9792030394440796</span></div>
        </div>
        <p className="text-[10px] text-amber-700 mt-2">Use CVV: <strong>000</strong> · Any future expiry date · Any cardholder name</p>
      </div>
    </div>
  );
}
