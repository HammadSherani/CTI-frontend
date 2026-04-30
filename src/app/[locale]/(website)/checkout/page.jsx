'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';

// ── Order Summary (same structure as cart) ──
const ORDER_ITEMS = 2;
const SUBTOTAL = 90.00;
const SHIPPING = 10.00;
const TAX = 0.00;
const COUPON = -10.00;
const TOTAL = SUBTOTAL + SHIPPING + TAX + COUPON;

function OrderSummary() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
      <h3 className="text-base font-extrabold text-gray-800 mb-5">Order Summary</h3>
      <div className="space-y-3 mb-5">
        {[
          { label: 'Items', value: ORDER_ITEMS, isCount: true },
          { label: 'Sub total', value: SUBTOTAL },
          { label: 'Shipping', value: SHIPPING },
          { label: 'Taxes', value: TAX },
          { label: 'Coupon Discount', value: COUPON, isNeg: true },
        ].map(r => (
          <div key={r.label} className="flex justify-between items-center text-sm">
            <span className="text-gray-500">{r.label}</span>
            <span className={`font-semibold ${r.isNeg ? 'text-red-500' : 'text-gray-700'}`}>
              {r.isCount
                ? r.value
                : r.isNeg
                  ? `-$${Math.abs(r.value).toFixed(2)}`
                  : `$${r.value.toFixed(2)}`}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 pt-4 mb-5">
        <div className="flex justify-between items-center">
          <span className="font-extrabold text-gray-800">Total</span>
          <span className="font-extrabold text-gray-900 text-lg">${TOTAL.toFixed(2)}</span>
        </div>
      </div>
      <button className="w-full bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary-100 text-sm">
        Checkout
      </button>
    </div>
  );
}

// ── Checkout Page ──
export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'card'
  const [saveCard, setSaveCard] = useState(false);
  const [form, setForm] = useState({
    cardHolder: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const handleForm = (e) => {
    const { name, value } = e.target;
    // Format card number with spaces
    if (name === 'cardNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 16);
      const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
      setForm(f => ({ ...f, cardNumber: formatted }));
      return;
    }
    // Format expiry MM/YY
    if (name === 'expiry') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
      setForm(f => ({ ...f, expiry: formatted }));
      return;
    }
    // CVV digits only
    if (name === 'cvv') {
      const digits = value.replace(/\D/g, '').slice(0, 3);
      setForm(f => ({ ...f, cvv: digits }));
      return;
    }
    setForm(f => ({ ...f, [name]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
        <Icon icon="mdi:chevron-right" />
        <Link href="/cart" className="hover:text-primary-500 transition-colors">Cart</Link>
        <Icon icon="mdi:chevron-right" />
        <span className="text-gray-700 font-medium">Checkout</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ── LEFT: Shipping + Payment ── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* ── Shipping Address ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-extrabold text-gray-800 mb-5 flex items-center gap-2">
              <Icon icon="mdi:map-marker-outline" className="text-primary-500 text-xl" />
              Shipping Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'First Name', name: 'firstName', placeholder: 'John', icon: 'mdi:account-outline' },
                { label: 'Last Name', name: 'lastName', placeholder: 'Doe', icon: 'mdi:account-outline' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label} *</label>
                  <div className="relative">
                    <Icon icon={f.icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label>
                <div className="relative">
                  <Icon icon="mdi:email-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input type="email" placeholder="john@email.com"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone *</label>
                <div className="relative">
                  <Icon icon="mdi:phone-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input type="tel" placeholder="+92 300 0000000"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-colors" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address *</label>
                <div className="relative">
                  <Icon icon="mdi:home-outline" className="absolute left-3 top-3 text-gray-400 text-base" />
                  <input type="text" placeholder="House #, Street, Area"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">City *</label>
                <div className="relative">
                  <Icon icon="mdi:city-variant-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input type="text" placeholder="Karachi"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Postal Code</label>
                <div className="relative">
                  <Icon icon="mdi:mailbox-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input type="text" placeholder="75000"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Payment Method ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-extrabold text-gray-800 mb-5 flex items-center gap-2">
              <Icon icon="mdi:credit-card-outline" className="text-primary-500 text-xl" />
              Select Payment Method
            </h2>

            {/* COD Option */}
            <button
              onClick={() => setPaymentMethod('cod')}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 transition-all mb-3 text-left ${paymentMethod === 'cod'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${paymentMethod === 'cod' ? 'border-primary-500' : 'border-gray-300'
                }`}>
                {paymentMethod === 'cod' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                )}
              </div>
              <Icon icon="mdi:cash" className={`text-xl transition-colors ${paymentMethod === 'cod' ? 'text-primary-500' : 'text-gray-400'}`} />
              <span className={`font-semibold text-sm transition-colors ${paymentMethod === 'cod' ? 'text-primary-600' : 'text-gray-600'}`}>
                Cash On Delivery
              </span>
            </button>

            {/* Card Option */}
            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 transition-all text-left ${paymentMethod === 'card'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${paymentMethod === 'card' ? 'border-primary-500' : 'border-gray-300'
                }`}>
                {paymentMethod === 'card' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                )}
              </div>
              <Icon icon="mdi:credit-card-plus-outline" className={`text-xl transition-colors ${paymentMethod === 'card' ? 'text-primary-500' : 'text-gray-400'}`} />
              <span className={`font-semibold text-sm transition-colors ${paymentMethod === 'card' ? 'text-primary-600' : 'text-gray-600'}`}>
                Add New Credit / Debit Card
              </span>
              {/* Card brand icons */}
              <div className="flex gap-1.5 ml-auto">
                <Icon icon="logos:visa" className="text-2xl" />
                <Icon icon="logos:mastercard" className="text-2xl" />
                <Icon icon="logos:paypal" className="text-xl" />
              </div>
            </button>

            {/* Card Form — visible when card is selected */}
            {paymentMethod === 'card' && (
              <div className="mt-4 p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                {/* Card Holder */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Card Holder Name *
                  </label>
                  <div className="relative">
                    <Icon icon="mdi:account-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                    <input
                      type="text"
                      name="cardHolder"
                      value={form.cardHolder}
                      onChange={handleForm}
                      placeholder="Ex: John Doe"
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Card Number *
                  </label>
                  <div className="relative">
                    <Icon icon="mdi:credit-card-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                    <input
                      type="text"
                      name="cardNumber"
                      value={form.cardNumber}
                      onChange={handleForm}
                      placeholder="476 0627 1635 8047"
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary-400 transition-colors tracking-wider"
                    />
                  </div>
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Expiry Date *
                    </label>
                    <div className="relative">
                      <Icon icon="mdi:calendar-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                      <input
                        type="text"
                        name="expiry"
                        value={form.expiry}
                        onChange={handleForm}
                        placeholder="03/26"
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Cvv *
                    </label>
                    <div className="relative">
                      <Icon icon="mdi:lock-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                      <input
                        type="password"
                        name="cvv"
                        value={form.cvv}
                        onChange={handleForm}
                        placeholder="333"
                        maxLength={3}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Save card */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div
                    onClick={() => setSaveCard(s => !s)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${saveCard ? 'bg-primary-500 border-primary-500' : 'border-gray-300'
                      }`}
                  >
                    {saveCard && <Icon icon="mdi:check" className="text-white text-xs" />}
                  </div>
                  <span className="text-sm text-gray-600">Save this information for next time</span>
                </label>

                <button className="w-full bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-primary-100 text-sm flex items-center justify-center gap-2">
                  <Icon icon="mdi:credit-card-check-outline" className="text-lg" />
                  Add Card
                </button>
              </div>
            )}
          </div>

          {/* Place Order button (bottom) */}
          <button className="w-full bg-gray-900 hover:bg-gray-800 active:scale-95 text-white font-bold py-4 rounded-2xl transition-all text-sm flex items-center justify-center gap-2 shadow-xl">
            <Icon icon="mdi:shield-check-outline" className="text-green-400 text-lg" />
            Place Order Securely
          </button>
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <OrderSummary />

          {/* Security badge */}
          <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon icon="mdi:shield-lock-outline" className="text-green-500 text-lg" />
              <span className="text-xs font-bold text-gray-700">Secure Checkout</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {['logos:visa', 'logos:mastercard', 'logos:paypal', 'logos:stripe'].map(icon => (
                <Icon key={icon} icon={icon} className="text-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}