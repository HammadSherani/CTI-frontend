'use client';

// Confirms a seller's shipping fee: how much comes from this order's earnings, from the wallet
// balance, and what is left to pay by card. The card is only sent with this request, never stored.
import { useState } from 'react';
import { Icon } from '@iconify/react';

const amount = (value) => `${Number(value || 0).toFixed(2)} TRY`;
const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 bg-white';

export default function ShippingPaymentModal({ offer, error, onClose, onConfirm }) {
  const [card, setCard] = useState({ cardHolder: '', cardNumber: '', expiry: '', cvc: '' });
  const [problem, setProblem] = useState('');
  const payment = offer.payment || { fee: offer.cost, fromOrder: 0, fromBalance: 0, byCard: 0 };
  const needsCard = payment.byCard > 0;

  const change = (e) => {
    let { name, value } = e.target;
    if (name === 'cardNumber') value = value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
    if (name === 'expiry') value = value.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(?=\d)/, '$1/');
    if (name === 'cvc') value = value.replace(/\D/g, '').slice(0, 4);
    setCard((current) => ({ ...current, [name]: value }));
    setProblem('');
  };

  const submit = (e) => {
    e.preventDefault();
    if (!needsCard) return onConfirm(null);
    const number = card.cardNumber.replace(/\s/g, '');
    const [month, year] = card.expiry.split('/');
    if (!card.cardHolder.trim()) return setProblem('Enter the name on the card');
    if (number.length < 15) return setProblem('Enter the full card number');
    if (!(Number(month) >= 1 && Number(month) <= 12) || year?.length !== 2) return setProblem('Enter the expiry date as MM/YY');
    if (card.cvc.length < 3) return setProblem('Enter the CVC');
    return onConfirm({ cardHolder: card.cardHolder.trim(), cardNumber: number, expireMonth: month, expireYear: `20${year}`, cvc: card.cvc });
  };

  const rows = [
    ['From this order’s earnings', payment.fromOrder],
    ['From your wallet balance', payment.fromBalance],
    ['To pay by card', payment.byCard],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Icon icon="mdi:truck-fast-outline" className="w-5 h-5 text-primary-600" /> Shipping Payment
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <Icon icon="mdi:close" className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2 text-sm mb-4">
          <div className="flex justify-between font-bold text-gray-900">
            <span>Shipping fee</span><span>{amount(payment.fee)}</span>
          </div>
          {rows.filter(([, value]) => value > 0).map(([label, value]) => (
            <div key={label} className="flex justify-between text-gray-600">
              <span>{label}</span><span className="font-semibold">{amount(value)}</span>
            </div>
          ))}
        </div>

        {payment.fee > payment.fromOrder && (
          <p className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-4 text-xs font-semibold text-amber-700">
            Shipping is higher than your earnings on this order. You pay {amount(payment.fee - payment.fromOrder)} yourself,
            and this order will leave you nothing.
          </p>
        )}

        {needsCard && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input name="cardHolder" value={card.cardHolder} onChange={change} placeholder="Name on card" autoComplete="cc-name" className={`${inputCls} col-span-2`} />
            <input name="cardNumber" value={card.cardNumber} onChange={change} placeholder="Card number" inputMode="numeric" autoComplete="cc-number" className={`${inputCls} col-span-2`} />
            <input name="expiry" value={card.expiry} onChange={change} placeholder="MM/YY" inputMode="numeric" autoComplete="cc-exp" className={inputCls} />
            <input name="cvc" value={card.cvc} onChange={change} placeholder="CVC" inputMode="numeric" autoComplete="cc-csc" className={inputCls} />
          </div>
        )}

        {(problem || error) && (
          <p className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-4 text-xs font-semibold text-red-700">{problem || error}</p>
        )}

        <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-sm">
          {needsCard ? `Pay ${amount(payment.byCard)} & Create Shipment` : 'Confirm & Create Shipment'}
        </button>
      </form>
    </div>
  );
}
