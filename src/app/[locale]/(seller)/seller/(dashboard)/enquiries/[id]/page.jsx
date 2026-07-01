'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useRouter } from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import moment from 'moment';

/* ══════════════════════════════════════════════════════════
   STATUS HELPERS
══════════════════════════════════════════════════════════ */
const STATUS_COLORS = {
  open: { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  replied: { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  closed: { text: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
};

function StatusPill({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.open;
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Open';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.text} ${s.bg} ${s.border}`}>
      {label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════
   AVATAR
══════════════════════════════════════════════════════════ */
function Avatar({ name, size = 38, isSeller = false, image = null }) {
  if (image) {
    return (
      <img src={image} alt={name || 'Avatar'} className="rounded-full object-cover flex-shrink-0 border border-gray-200" style={{ width: size, height: size }} />
    );
  }
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${isSeller
          ? 'bg-primary-600 text-white'
          : 'bg-gray-100 text-gray-600 border border-gray-200'
        }`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MESSAGE BUBBLE
══════════════════════════════════════════════════════════ */
function Bubble({ msg, currentUserId, sellerImage, customerImage }) {
  const isSeller = msg.senderRole === 'seller';
  const time = moment(msg.createdAt).format('HH:mm');

  return (
    <div className={`flex gap-3 mb-4 ${isSeller ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar
        name={msg.senderName}
        size={36}
        isSeller={isSeller}
        image={isSeller ? sellerImage : customerImage}
      />

      <div className={`max-w-[75%] sm:max-w-[60%] flex flex-col ${isSeller ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-semibold text-gray-700">{msg.senderName || (isSeller ? 'You' : 'Customer')}</span>
          <span className="text-[11px] text-gray-400">{time}</span>
        </div>

        <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${isSeller
            ? 'bg-primary-600 text-white rounded-tr-sm'
            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
          }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>

          {msg.attachments?.length > 0 && (
            <div className="mt-2 space-y-1.5 border-t border-white/10 pt-2">
              {msg.attachments.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer"
                  className={`flex items-center gap-1.5 text-xs font-medium hover:underline ${isSeller ? 'text-primary-100' : 'text-primary-600'}`}>
                  <Icon icon="solar:paperclip-linear" className="w-4 h-4" />
                  Attachment {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DATE DIVIDER
══════════════════════════════════════════════════════════ */
function DateDivider({ date }) {
  return (
    <div className="flex justify-center my-6">
      <span className="text-[11px] font-medium text-gray-500 bg-gray-100/50 px-3 py-1 rounded-full border border-gray-100">
        {moment(date).calendar(null, {
          sameDay: '[Today]',
          lastDay: '[Yesterday]',
          lastWeek: 'dddd, DD MMM',
          sameElse: 'DD MMM YYYY',
        })}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   INFO CARD ROW
══════════════════════════════════════════════════════════ */
function InfoRow({ label, value, mono = false }) {
  if (!value && value !== 0) return null;
  return (
    <div className="py-2.5 flex flex-col gap-1 border-b border-gray-50 last:border-0">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className={`text-sm text-gray-900 break-all ${mono ? 'font-mono bg-gray-50 px-1 py-0.5 rounded text-xs w-fit' : 'font-medium'}`}>{value}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CONFIRM DIALOG
══════════════════════════════════════════════════════════ */
function ConfirmDialog({ open, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <Icon icon="solar:danger-triangle-linear" className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">Close this query?</h3>
          <p className="text-sm text-gray-500 mb-6">
            The customer will not be able to reply to this thread anymore. You can reopen it at any time.
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-xl text-sm transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
              Yes, Close Query
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   QUICK REPLY TEMPLATES
══════════════════════════════════════════════════════════ */
const TEMPLATES = [
  { label: 'Acknowledge', text: "Thank you for reaching out! We've received your query and will get back to you shortly." },
  { label: 'Apologize', text: "We're sorry for the inconvenience. Our team is looking into this and will resolve it as soon as possible." },
  { label: 'Resolved', text: "Your issue has been resolved. Please let us know if you need any further assistance. Have a great day!" },
  { label: 'Follow Up', text: "I wanted to follow up on your query. Have you had a chance to review our previous response?" },
];

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function EnquiryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, user } = useSelector(s => s.auth);

  const [query, setQuery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  /* ── fetch ── */
  const fetchQuery = useCallback(async () => {
    if (!token || !id) return;
    try {
      const { data } = await axiosInstance.get(`/seller/queries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setQuery(data.data);
        window.dispatchEvent(new Event('enquiry_read'));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load enquiry');
      router.push('/seller/enquiries');
    } finally {
      setLoading(false);
    }
  }, [id, token, router]);

  useEffect(() => { fetchQuery(); }, [fetchQuery]);

  /* scroll to bottom */
  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, [query?.messages?.length]);

  /* ── reply ── */
  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const { data } = await axiosInstance.post(
        `/seller/queries/${id}/reply`,
        { message: replyText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setQuery(data.data);
        setReplyText('');
        setShowTemplates(false);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  /* ── status ── */
  const handleStatus = async (status) => {
    setStatusBusy(true);
    setConfirmOpen(false);
    try {
      const { data } = await axiosInstance.patch(
        `/seller/queries/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setQuery(data.data);
        toast.success(status === 'closed' ? 'Query closed' : 'Query reopened');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusBusy(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleReply(); }
  };

  /* ── loading ── */
  if (loading) {
    return (
      <div className="h-[calc(100vh-72px)] bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="svg-spinners:180-ring-with-bg" className="w-10 h-10 text-primary-500" />
          <p className="text-sm text-gray-500 font-medium">Loading conversation…</p>
        </div>
      </div>
    );
  }

  if (!query) return null;

  const isClosed = query.status === 'closed';
  const isOrderQ = query.queryType === 'order';
  const customer = query.customerId || {};
  const orderDoc = query.orderId || {};

  /* group messages by date */
  const grouped = [];
  let lastDate = null;
  (query.messages || []).forEach(msg => {
    const day = moment(msg.createdAt).format('YYYY-MM-DD');
    if (day !== lastDate) { grouped.push({ type: 'date', date: msg.createdAt }); lastDate = day; }
    grouped.push({ type: 'msg', msg });
  });

  return (
    <div className="h-[calc(100vh-72px)] mb-10 flex flex-col bg-gray-50 overflow-hidden">

      {/* ══ TOP HEADER ══ */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 z-20">
        <div className="flex items-center gap-4 px-6 py-4 max-w-7xl mx-auto w-full">
          {/* Back */}
          <button
            onClick={() => router.push('/seller/enquiries')}
            className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <Icon icon="solar:arrow-left-linear" className="w-5 h-5" />
          </button>

          {/* Customer avatar + info */}
          <Avatar name={customer.name || query.customerName || 'C'} size={40} image={query.customerId?.avatar} />

          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-bold text-gray-900 text-base truncate">
                  {customer.name || query.customerName || 'Customer'}
                </h1>
                <StatusPill status={query.status} />
                {isOrderQ && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex-shrink-0">
                    Order Query
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate flex items-center gap-2">
                <span className="font-medium text-gray-700">{query.subject}</span>
                <span>•</span>
                <span>ID: {query.queryId}</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={fetchQuery}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                title="Refresh Conversation"
              >
                <Icon icon="solar:refresh-linear" className="w-5 h-5" />
              </button>
              {!isClosed ? (
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={statusBusy}
                  className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  <Icon icon="solar:lock-keyhole-linear" className="w-4 h-4" />
                  <span className="hidden sm:inline">Close Query</span>
                </button>
              ) : (
                <button
                  onClick={() => handleStatus('open')}
                  disabled={statusBusy}
                  className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  <Icon icon="solar:unlock-linear" className="w-4 h-4" />
                  <span className="hidden sm:inline">Reopen Query</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ BODY (sidebar + chat) ══ */}
      <div className="flex flex-1 min-h-0 overflow-hidden max-w-7xl mx-auto w-full">

        {/* ── LEFT SIDEBAR ── */}
        <div className="hidden lg:flex flex-col w-72 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto py-6 px-6">

          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Customer Details</h3>
            <InfoRow label="Name" value={customer.name || query.customerName || '—'} />
            <InfoRow label="Email" value={customer.email || query.customerEmail || '—'} />
            {customer.phone && <InfoRow label="Phone" value={customer.phone} />}
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Query Details</h3>
            <InfoRow label="Query ID" value={query.queryId} mono />
            <InfoRow label="Type" value={isOrderQ ? 'Order Query' : 'Product Query'} />
            <InfoRow label="Created" value={moment(query.createdAt).format('DD MMM YYYY, HH:mm')} />
            <InfoRow label="Messages" value={`${query.messages?.length || 0} messages`} />
          </div>

          {/* Product info */}
          {!isOrderQ && query.productId && (
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Product Details</h3>
              <InfoRow label="Product ID" value={query.productId?._id || query.productId} />
              {query.productId?.name && <InfoRow label="Product Name" value={query.productId.name} />}
            </div>
          )}

          {/* Order info */}
          {isOrderQ && (
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Order Details</h3>
              <InfoRow label="Order No" value={orderDoc.orderNo || query.orderNo} mono />
              <InfoRow label="Order Status" value={orderDoc.orderStatus} />
              {orderDoc.totalAmount != null && (
                <InfoRow label="Amount" value={`$${Number(orderDoc.totalAmount).toFixed(2)}`} />
              )}
            </div>
          )}

        </div>

        {/* ── CHAT AREA ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/50">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
            {grouped.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4">
                  <Icon icon="solar:chat-round-dots-linear" className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No messages yet</p>
                <p className="text-gray-400 text-sm mt-1">Start the conversation below.</p>
              </div>
            ) : (
              grouped.map((item, i) =>
                item.type === 'date'
                  ? <DateDivider key={`date-${i}`} date={item.date} />
                  : <Bubble key={item.msg._id || i} msg={item.msg} currentUserId={user?._id} sellerImage={user?.profilePictureOrLogo} customerImage={query.customerId?.avatar} />
              )
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── COMPOSE BAR ── */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 sm:p-6">

            {/* Templates */}
            {showTemplates && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Quick Replies:</p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.label}
                      onClick={() => { setReplyText(t.text); setShowTemplates(false); textareaRef.current?.focus(); }}
                      className="text-xs bg-gray-50 text-gray-700 border border-gray-200 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isClosed ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 text-gray-500">
                  <Icon icon="solar:lock-keyhole-bold" className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">This query is closed</p>
                    <p className="text-xs">Reopen the query to send a new message.</p>
                  </div>
                </div>
                <button
                  onClick={() => handleStatus('open')}
                  disabled={statusBusy}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Reopen Query
                </button>
              </div>
            ) : (
              <div className="flex items-end gap-3">
                {/* Template toggle */}
                <button
                  onClick={() => setShowTemplates(p => !p)}
                  title="Quick replies"
                  className={`flex-shrink-0 p-3 rounded-xl transition-colors border ${showTemplates ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-500'
                    }`}
                >
                  <Icon icon="solar:magic-stick-3-linear" className="w-5 h-5" />
                </button>

                {/* Textarea */}
                <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={replyText}
                    onChange={e => {
                      setReplyText(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your reply here... (Ctrl+Enter to send)"
                    disabled={sending}
                    className="w-full px-4 py-3 bg-transparent text-sm text-gray-700 resize-none focus:outline-none placeholder:text-gray-400 min-h-[48px]"
                    style={{ maxHeight: '150px' }}
                  />
                </div>

                {/* Send button */}
                <button
                  onClick={handleReply}
                  disabled={sending || !replyText.trim()}
                  className="flex-shrink-0 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <Icon icon="svg-spinners:180-ring-with-bg" className="w-5 h-5" />
                  ) : (
                    <>
                      <span className="hidden sm:inline">Send</span>
                      <Icon icon="solar:plain-2-bold" className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Confirm Dialog ── */}
      <ConfirmDialog
        open={confirmOpen}
        onConfirm={() => handleStatus('closed')}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
