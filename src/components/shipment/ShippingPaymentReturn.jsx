'use client';

// After the seller paid the card part of a shipping fee, iyzico sends them back to the order
// page with ?shippingPayment=<id>. This asks the server for the result (it verifies with iyzico
// and books the courier), shows it, and refreshes the order.
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import axiosInstance from '@/config/axiosInstance';

const clearParam = () => {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('shippingPayment');
    window.history.replaceState(window.history.state, '', url.pathname + (url.search || ''));
  } catch {
    /* ignore */
  }
};

/** statusPath(checkoutId) -> API path of the payment result. */
export default function ShippingPaymentReturn({ token, statusPath, onFinished }) {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get('shippingPayment');
  const [state, setState] = useState(null); // { status, message }
  const finished = useRef(onFinished);
  finished.current = onFinished;
  const pathFor = useRef(statusPath);
  pathFor.current = statusPath;

  useEffect(() => {
    if (!checkoutId || !token) return undefined;
    if (!/^[a-f0-9]{24}$/i.test(checkoutId)) {
      setState({ status: 'error', message: 'We could not check your shipping payment. Please refresh the page.' });
      clearParam();
      return undefined;
    }
    let stopped = false;
    let timer;
    let tries = 0;
    setState({ status: 'verifying' });
    const poll = async () => {
      try {
        const { data } = await axiosInstance.get(pathFor.current(checkoutId), { headers: { Authorization: `Bearer ${token}` } });
        if (stopped) return;
        const result = data?.data;
        if (result?.status === 'verifying' && ++tries < 20) {
          timer = setTimeout(poll, 3000);
          return;
        }
        if (result?.status === 'completed') {
          toast.success(result.message || 'Shipment created');
          setState(null);
        } else {
          setState({ status: result?.status || 'error', message: result?.message });
        }
        clearParam();
        finished.current?.();
      } catch (err) {
        if (!stopped) setState({ status: 'error', message: err?.response?.data?.message || 'We could not check your shipping payment. Please refresh the page.' });
      }
    };
    poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [checkoutId, token]);

  if (!state) return null;
  const verifying = state.status === 'verifying';
  return (
    <div className={`mb-4 flex items-start gap-3 rounded-2xl px-5 py-4 border text-sm ${verifying ? 'bg-blue-50 border-blue-200 text-blue-800' : state.status === 'failed' || state.status === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
      <Icon icon={verifying ? 'mdi:loading' : 'mdi:information-outline'} className={`text-xl flex-shrink-0 mt-0.5 ${verifying ? 'animate-spin' : ''}`} />
      <div className="flex-1">
        <p className="font-semibold">{verifying ? 'Confirming your shipping payment…' : 'Shipping payment'}</p>
        {state.message && <p>{state.message}</p>}
        {verifying && <p>Please do not pay again. The shipment is created as soon as the payment is confirmed.</p>}
      </div>
      {!verifying && (
        <button type="button" onClick={() => setState(null)} aria-label="Close" className="opacity-60 hover:opacity-100">
          <Icon icon="mdi:close" className="text-lg" />
        </button>
      )}
    </div>
  );
}
