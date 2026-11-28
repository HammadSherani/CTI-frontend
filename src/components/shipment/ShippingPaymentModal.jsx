'use client';

// Confirms a seller's shipping fee: how much comes from this order's earnings, from the wallet
// balance, and what is left to pay by card. The card part is paid in iyzico's secure form
// (3D Secure), which opens here by itself; card details never reach our servers. After the
// payment iyzico sends the seller back to the order page and the courier is booked.
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import IyzicoCheckoutForm from '@/components/payment/IyzicoCheckoutForm';

const amount = (value) => `${Number(value || 0).toFixed(2)} TRY`;

/**
 * startCardPayment(): opens the iyzico form for the card part and resolves to
 * { checkoutFormContent } (or null when the page took over, e.g. no card needed any more).
 */
export default function ShippingPaymentModal({ offer, error, onClose, onConfirm, startCardPayment }) {
  const payment = offer.payment || { fee: offer.cost, fromOrder: 0, fromBalance: 0, byCard: 0 };
  const needsCard = payment.byCard > 0;
  const [formContent, setFormContent] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [problem, setProblem] = useState('');
  const started = useRef(false);

  const loadForm = async () => {
    setLoadingForm(true);
    setProblem('');
    try {
      const result = await startCardPayment();
      if (result?.checkoutFormContent) setFormContent(result.checkoutFormContent);
    } catch (err) {
      setProblem(err?.response?.data?.message || 'The secure payment form could not be loaded.');
    } finally {
      setLoadingForm(false);
    }
  };

  // the form opens by itself (once, also in React's dev double-run)
  useEffect(() => {
    if (!needsCard || started.current) return;
    started.current = true;
    loadForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsCard]);

  const rows = [
    ['From this order’s earnings', payment.fromOrder],
    ['From your wallet balance', payment.fromBalance],
    ['To pay by card', payment.byCard],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
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

        {(problem || error) && (
          <p className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-4 text-xs font-semibold text-red-700">{problem || error}</p>
        )}

        {needsCard ? (
          formContent ? (
            <>
              <p className="text-xs text-gray-500 mb-2">
                Pay {amount(payment.byCard)} by card. The shipment is created right after the payment.
              </p>
              <IyzicoCheckoutForm content={formContent} />
            </>
          ) : loadingForm ? (
            <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-8 text-sm text-gray-600">
              <Icon icon="mdi:loading" className="animate-spin text-xl text-primary-500" />
              Loading the secure payment form…
            </div>
          ) : (
            <button type="button" onClick={loadForm} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-sm">
              Load the payment form again
            </button>
          )
        ) : (
          <button type="button" onClick={() => onConfirm(null)} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-sm">
            Confirm & Create Shipment
          </button>
        )}
      </div>
    </div>
  );
}
