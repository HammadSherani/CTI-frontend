'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Link ,useRouter} from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import moment from 'moment';

/* ══════════════════════════════════════════
   STATUS HELPERS
   ══════════════════════════════════════════ */
const ORDER_STATUS = {
  pending:    { color: 'bg-blue-100 text-blue-700',     icon: 'solar:clock-circle-bold-duotone',      label: 'Pending' },
  processing: { color: 'bg-indigo-100 text-indigo-700', icon: 'solar:settings-bold-duotone',          label: 'Processing' },
  shipping:   { color: 'bg-amber-100 text-amber-700',   icon: 'solar:delivery-bold-duotone',          label: 'Shipping' },
  shipped:    { color: 'bg-violet-100 text-violet-700', icon: 'solar:box-bold-duotone',               label: 'Shipped' },
  delivered:  { color: 'bg-emerald-100 text-emerald-700', icon: 'solar:check-circle-bold-duotone',   label: 'Delivered' },
  on_hold:    { color: 'bg-orange-100 text-orange-700', icon: 'solar:pause-circle-bold-duotone',      label: 'On Hold' },
  cancelled:  { color: 'bg-red-100 text-red-700',       icon: 'solar:close-circle-bold-duotone',     label: 'Cancelled' },
};

const PAYMENT_STATUS = {
  PAID:    { color: 'bg-emerald-100 text-emerald-700', label: 'Paid' },
  PENDING: { color: 'bg-amber-100 text-amber-700',    label: 'Pending' },
  FAILED:  { color: 'bg-red-100 text-red-700',        label: 'Failed' },
};

const TIMELINE_STEPS = ['pending', 'processing', 'shipping', 'shipped', 'delivered'];

const RETURN_STATUS_CFG = {
  requested: { label: 'Return Pending Review', bg: 'bg-blue-50 text-blue-700 border-blue-200',    icon: 'solar:refresh-circle-bold-duotone' },
  shipped:   { label: 'Return Shipped Back',   bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'solar:delivery-bold-duotone' },
  approved:  { label: 'Return Approved',       bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'solar:check-circle-bold-duotone' },
  rejected:  { label: 'Return Rejected',       bg: 'bg-red-50 text-red-700 border-red-200',       icon: 'solar:close-circle-bold-duotone' },
};

function OrderStatusBadge({ status }) {
  const cfg = ORDER_STATUS[status?.toLowerCase()] || { color: 'bg-gray-100 text-gray-600', label: status, icon: 'solar:help-bold' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.color}`}>
      <Icon icon={cfg.icon} className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

// ── PaymentBadge ──
function PaymentBadge({ status }) {
  const cfg = PAYMENT_STATUS[status] || { color: 'bg-gray-100 text-gray-600', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

/* ══════════════════════════════════════════
   ASK SELLER MODAL  (Order Enquiry)
   ══════════════════════════════════════════ */
const ORDER_QUICK_SUBJECTS = [
  'Where is my order?',
  'Tracking information',
  'Delivery issue',
  'Invoice request',
  'Product issue',
  'Wrong item received',
];

function OrderEnquiryModal({ order, onClose, onSubmit, loading }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!subject.trim()) { toast.error('Subject is required'); return; }
    if (!message.trim()) { toast.error('Message is required'); return; }
    onSubmit({ subject: subject.trim(), message: message.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-gray-900 text-base">Contact Seller</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Order: <span className="font-mono font-bold text-gray-600">{order?.orderId || order?.orderNo}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <Icon icon="solar:close-circle-bold" className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Quick Templates */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Quick Select</p>
            <div className="flex flex-wrap gap-1.5">
              {ORDER_QUICK_SUBJECTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                    subject === s
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What would you like to ask the seller?"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue or question in detail..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400 transition-all"
            />
            <p className="text-[11px] text-gray-400 mt-1 text-right">{message.length} chars</p>
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !subject.trim() || !message.trim()}
            className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {loading
              ? <Icon icon="svg-spinners:180-ring-with-bg" className="w-4 h-4 mx-auto" />
              : 'Send Message'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   RETURN MODAL
   ══════════════════════════════════════════ */
function ReturnRequestModal({ order, onClose, onSubmit, loading }) {
  const isRefurbished = order?.orderNo?.startsWith('REF-') || order?.orderId?.startsWith('REF-');
  const [reason, setReason] = useState('');
  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    if (order && isRefurbished) {
      const initial = {};
      order.items.forEach(item => {
        const key = `${item.productId?._id || item.productId}-${item.variantId?._id || item.variantId}`;
        initial[key] = {
          selected: false,
          quantity: item.quantity || 1,
          reason: ''
        };
      });
      setSelectedItems(initial);
    }
  }, [order, isRefurbished]);

  if (!order) return null;

  const handleRefurbishedSubmit = () => {
    const itemsToReturn = [];
    order.items.forEach(item => {
      const key = `${item.productId?._id || item.productId}-${item.variantId?._id || item.variantId}`;
      const state = selectedItems[key];
      if (state?.selected) {
        itemsToReturn.push({
          productId: item.productId?._id || item.productId,
          variantId: item.variantId?._id || item.variantId,
          quantity: state.quantity,
          reason: state.reason.trim() || 'No reason provided'
        });
      }
    });

    if (itemsToReturn.length === 0) {
      toast.warn('Please select at least one item to return');
      return;
    }

    onSubmit({ items: itemsToReturn });
  };

  const handleStandardSubmit = () => {
    onSubmit({ reason });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-8">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="font-extrabold text-gray-900">Request Return ({isRefurbished ? 'Refurbished Device' : 'Standard Product'})</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100">
            <Icon icon="solar:close-circle-bold" className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {isRefurbished ? (
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase">Select items and quantity to return:</p>
              {order.items.map(item => {
                const prod = item.productId || {};
                const variant = item.variantId || {};
                const key = `${prod._id || prod}-${variant._id || variant}`;
                const state = selectedItems[key] || { selected: false, quantity: 1, reason: '' };

                return (
                  <div key={key} className="border border-gray-100 rounded-xl p-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={state.selected}
                        onChange={(e) => setSelectedItems(prev => ({
                          ...prev,
                          [key]: { ...prev[key], selected: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 w-4 h-4"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{prod.title}</p>
                        <p className="text-xs text-gray-500">{variant.title || 'Default variant'}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-700">${(item.price || variant.price || 0).toFixed(2)}</span>
                    </div>

                    {state.selected && (
                      <div className="pl-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Qty to Return</label>
                          <select
                            value={state.quantity}
                            onChange={(e) => setSelectedItems(prev => ({
                              ...prev,
                              [key]: { ...prev[key], quantity: parseInt(e.target.value) }
                            }))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                          >
                            {Array.from({ length: item.quantity }, (_, i) => i + 1).map(q => (
                              <option key={q} value={q}>{q}</option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Reason</label>
                          <input
                            type="text"
                            placeholder="Reason for return..."
                            value={state.reason}
                            onChange={(e) => setSelectedItems(prev => ({
                              ...prev,
                              [key]: { ...prev[key], reason: e.target.value }
                            }))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe why you want to return this order..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-primary-500"
            />
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 text-sm">
              Cancel
            </button>
            <button
              onClick={isRefurbished ? handleRefurbishedSubmit : handleStandardSubmit}
              disabled={loading || (!isRefurbished && !reason.trim())}
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm"
            >
              {loading ? '…' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function OrderDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isRefurbishedMode = searchParams.get('type') === 'refurbished';
  
  const router = useRouter();
  const { token } = useSelector((s) => s.auth);

  const [order, setOrder]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [enquiryModal, setEnquiryModal] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [returnModal, setReturnModal]   = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const [existingReturn, setExistingReturn] = useState(null);
  const [cancelling, setCancelling]     = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const getUrl = isRefurbishedMode 
        ? `/refurbished/orders/${id}` 
        : `/e-commerce/orders/${id}`;

      const { data } = await axiosInstance.get(getUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setOrder(data.order || data.orders || data.data);
      else { toast.error('Order not found'); router.push('/orders'); }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load order');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  }, [id, token, router, isRefurbishedMode]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const fetchReturnStatus = useCallback(async () => {
    if (!token || !id) return;
    try {
      const getReturnsUrl = isRefurbishedMode 
        ? `/refurbished/orders/my-returns?orderId=${id}` 
        : `/e-commerce/orders/my-returns?orderId=${id}`;

      const { data } = await axiosInstance.get(getReturnsUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && data.data?.length > 0) setExistingReturn(data.data[0]);
      else setExistingReturn(null);
    } catch {}
  }, [id, token, isRefurbishedMode]);

  useEffect(() => { fetchReturnStatus(); }, [fetchReturnStatus]);

  /* ── Cancel ── */
  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const cancelUrl = isRefurbishedMode 
        ? `/refurbished/orders/${id}/cancel` 
        : `/e-commerce/orders/${id}/cancel`;

      const { data } = await axiosInstance.put(cancelUrl, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) { toast.success('Order cancelled'); fetchOrder(); }
      else toast.error(data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  /* ── Return ── */
  const handleReturn = async (returnPayload) => {
    setReturnLoading(true);
    try {
      const returnUrl = isRefurbishedMode
        ? `/refurbished/orders/${id}/return`
        : `/e-commerce/orders/${id}/return`;

      const { data } = await axiosInstance.post(returnUrl, returnPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success('Return request submitted');
        setReturnModal(false);
        setExistingReturn(data.data);
        fetchOrder();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit return request');
    } finally {
      setReturnLoading(false);
    }
  };

  /* ── Enquiry ── */
  const handleEnquiry = async ({ subject, message }) => {
    const sellerId = order?.items?.[0]?.sellerId;
    if (!sellerId) { toast.error('Seller information not available'); return; }
    setEnquiryLoading(true);
    try {
      const { data } = await axiosInstance.post(
        '/customer/queries',
        { orderId: id, queryType: 'order', subject, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success('Message sent to seller!');
        setEnquiryModal(false);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send message');
    } finally {
      setEnquiryLoading(false);
    }
  };

  /* ── Loading ── */
  if (loading || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="svg-spinners:180-ring-with-bg" className="w-10 h-10 text-primary-500" />
          <p className="text-gray-400 text-sm">Loading order details…</p>
        </div>
      </div>
    );
  }

  const statusCfg = ORDER_STATUS[order.orderStatus?.toLowerCase()] || ORDER_STATUS.pending;
  const addr = order.shippingAddress || {};
  const currentStepIdx = TIMELINE_STEPS.indexOf(order.orderStatus?.toLowerCase());
  const isCancelled = order.orderStatus === 'cancelled';
  const subtotal = order.items?.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0) || 0;
  const shipment = isRefurbishedMode ? order.shipment : null;
  const shipmentCreated = shipment?.status === 'created';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/orders')}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Icon icon="solar:arrow-left-bold" className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Order Details</h1>
            <p className="text-gray-400 text-sm font-mono mt-0.5">{order.orderId || order.orderNo}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <OrderStatusBadge status={order.orderStatus} />
          <PaymentBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* ── Order Timeline (not shown for cancelled) ── */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between relative">
            {/* connector line */}
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-100 -z-0 mx-10" />
            {TIMELINE_STEPS.map((step, i) => {
              const done    = i <= currentStepIdx;
              const current = i === currentStepIdx;
              const cfg = ORDER_STATUS[step];
              return (
                <div key={step} className="flex flex-col items-center gap-1.5 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    done
                      ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/30'
                      : 'bg-white border-gray-200 text-gray-300'
                  } ${current ? 'ring-4 ring-primary-100' : ''}`}>
                    <Icon icon={cfg.icon} className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold capitalize ${done ? 'text-primary-600' : 'text-gray-400'}`}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Order Items ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Items list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
              <Icon icon="solar:box-bold-duotone" className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">
                Order Items <span className="text-gray-400 font-normal ml-1">({order.items?.length || 0})</span>
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {order.items?.map((item, i) => {
                const product = item.productId;
                const imgUrl  = product?.images?.[0]?.url;
                const itemTotal = (item.price || 0) * (item.quantity || 1);
                return (
                  <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                      {imgUrl ? (
                        <img src={imgUrl} alt={product?.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                          <Icon icon="solar:image-bold" className="w-7 h-7" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {product?.slug ? (
                        <Link href={`/product/${product.slug}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors text-sm line-clamp-1">
                          {product?.title || 'Unknown Product'}
                        </Link>
                      ) : (
                        <p className="font-semibold text-gray-900 text-sm line-clamp-1">{product?.title || 'Refurbished Device'}</p>
                      )}
                      {/* Variant label — standard orders use item.variant, refurbished use item.variantId */}
                      {(item.variant || item.variantId?.title) && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.variantId?.title ||
                            (typeof item.variant === 'object'
                              ? Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(' · ')
                              : item.variant)}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                          Qty: {item.quantity || 1}
                        </span>
                        <span className="text-xs text-gray-400">${(item.price || 0).toFixed(2)} each</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 self-center">
                      <p className="font-bold text-gray-900">${itemTotal.toFixed(2)}</p>
                      <OrderStatusBadge status={item.itemStatus || order.orderStatus} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipment Tracking (refurbished only) */}
          {shipmentCreated && (
            <div className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-cyan-50 flex items-center gap-2">
                <Icon icon="solar:delivery-bold-duotone" className="w-5 h-5 text-cyan-500" />
                <h2 className="font-bold text-gray-900">Shipment Tracking</h2>
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Active</span>
              </div>
              <div className="p-5 space-y-3">
                {shipment.trackingNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase">Tracking No.</span>
                    <span className="font-mono font-bold text-violet-700 text-xs">{shipment.trackingNumber}</span>
                  </div>
                )}
                {shipment.trackingUrl && (
                  <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-bold py-2.5 rounded-xl transition-colors">
                    <Icon icon="mdi:map-search-outline" className="w-4 h-4" /> Track My Shipment
                  </a>
                )}
                {shipment.labelUrl && (
                  <a href={shipment.labelUrl} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold py-2.5 rounded-xl transition-colors">
                    <Icon icon="mdi:download" className="w-4 h-4" /> Download Shipping Label
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
              <Icon icon="solar:map-point-bold-duotone" className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">Shipping Address</h2>
            </div>
            <div className="p-5">
              {addr.fullName || addr.name ? (
                <div className="space-y-1 text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">{addr.fullName || addr.name}</p>
                  {addr.phone && <p className="text-gray-500">{addr.phone}</p>}
                  {(addr.addressLine || addr.street) && <p>{addr.addressLine || addr.street}</p>}
                  {(addr.area || addr.state) && <p>{addr.area || addr.state}</p>}
                  {addr.city && <p className="font-medium">{addr.city}</p>}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No shipping address on record</p>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Summary + Actions ── */}
        <div className="space-y-4">

          {/* Order Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-900">Order Info</h2>
            </div>
            <div className="p-5 space-y-3 text-sm">
              {[
                { label: 'Order ID', value: order.orderId, mono: true },
                { label: 'Order No.', value: order.orderNo, mono: true },
                { label: 'Date', value: moment(order.createdAt).format('DD MMM YYYY, hh:mm A') },
                { label: 'Payment', value: order.paymentMethod || 'Card' },
              ].map(({ label, value, mono }) => value ? (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-gray-400">{label}</span>
                  <span className={`font-semibold text-gray-800 ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="font-bold text-gray-900">Price Summary</h2>
            </div>
            <div className="p-5 space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{(order.shippingFee ?? 10) === 0 ? 'Free' : `$${(order.shippingFee ?? 10).toFixed(2)}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>${(order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2.5">
            {/* Contact button — seller for standard and refurbished */}
            <button
              onClick={() => {
                if (!token) { toast.error('Please log in first'); return; }
                setEnquiryModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-bold rounded-xl text-sm transition-colors"
            >
              <Icon icon="solar:chat-round-dots-bold-duotone" className="w-4 h-4" />
              Contact Seller
            </button>

            {/* View all messages */}
            <Link
              href="/messages"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 font-semibold rounded-xl text-sm transition-colors"
            >
              <Icon icon="solar:chat-square-bold-duotone" className="w-4 h-4" />
              My Messages
            </Link>

            {/* Cancel (pending only) */}
            {order.orderStatus === 'pending' && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 border border-red-100 font-semibold rounded-xl text-sm transition-colors"
              >
                {cancelling
                  ? <Icon icon="svg-spinners:180-ring-with-bg" className="w-4 h-4" />
                  : <Icon icon="solar:close-circle-bold-duotone" className="w-4 h-4" />
                }
                Cancel Order
              </button>
            )}

            {/* Request Return / Return Status (delivered only) */}
            {order.orderStatus === 'delivered' && (() => {
              if (existingReturn) {
                const cfg = RETURN_STATUS_CFG[existingReturn.returnStatus] || {
                  label: existingReturn.returnStatus,
                  bg: 'bg-gray-50 text-gray-600 border-gray-200',
                  icon: 'solar:refresh-bold-duotone',
                };
                return (
                  <div className={`w-full flex flex-col gap-1 px-4 py-3 rounded-xl border text-sm ${cfg.bg}`}>
                    <div className="flex items-center gap-2 font-semibold">
                      <Icon icon={cfg.icon} className="w-4 h-4" />
                      {cfg.label}
                    </div>
                    <p className="text-xs opacity-75">
                      Return #{existingReturn.returnNo || '—'} · {existingReturn.createdAt ? new Date(existingReturn.createdAt).toLocaleDateString() : ''}
                    </p>
                    {existingReturn.returnStatus === 'rejected' && (
                      <button
                        onClick={() => setReturnModal(true)}
                        className="mt-1 text-xs underline underline-offset-2 opacity-80 hover:opacity-100 text-left"
                      >
                        Submit new return request
                      </button>
                    )}
                  </div>
                );
              }
              return (
                <button
                  onClick={() => setReturnModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 font-semibold rounded-xl text-sm transition-colors"
                >
                  <Icon icon="solar:inbox-in-bold-duotone" className="w-4 h-4" />
                  Request Return
                </button>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Modals */}
      {enquiryModal && (
        <OrderEnquiryModal
          order={order}
          onClose={() => setEnquiryModal(false)}
          onSubmit={handleEnquiry}
          loading={enquiryLoading}
        />
      )}

      {returnModal && (
        <ReturnRequestModal
          order={order}
          onClose={() => setReturnModal(false)}
          onSubmit={handleReturn}
          loading={returnLoading}
        />
      )}
    </div>
  );
}
