'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import moment from 'moment';

/* ══════════════════════════════════════════════════════════
   STATUS CONFIG
══════════════════════════════════════════════════════════ */
const STATUS_COLORS = {
  open:    { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  replied: { text: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200' },
  closed:  { text: 'text-gray-600',    bg: 'bg-gray-100',   border: 'border-gray-200' },
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
function Avatar({ name, size = 36, isCustomer = false, image = null }) {
  if (image) {
    return (
      <img src={image} alt={name || 'Avatar'} className="rounded-full object-cover flex-shrink-0 border border-gray-200" style={{ width: size, height: size }} />
    );
  }
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
        isCustomer 
          ? 'bg-primary-600 text-white' 
          : 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MESSAGE BUBBLE 
══════════════════════════════════════════════════════════ */
function Bubble({ msg, currentUserId, sellerImage }) {
  const isMe     = msg.senderRole === 'customer' || msg.senderId === currentUserId;
  const isSystem = msg.senderRole === 'system';
  const time     = moment(msg.createdAt).format('HH:mm');

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="text-[11px] font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
          {msg.message || msg.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 mb-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar
        name={msg.senderName || (isMe ? 'You' : 'Seller')}
        size={36}
        isCustomer={isMe}
        image={isMe ? null : sellerImage}
      />

      <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-semibold text-gray-700">{msg.senderName || (isMe ? 'You' : 'Seller')}</span>
          <span className="text-[11px] text-gray-400">{time}</span>
        </div>

        <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${
          isMe
            ? 'bg-primary-600 text-white rounded-tr-sm'
            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {msg.message || msg.text}
          </p>

          {msg.attachments?.length > 0 && (
            <div className="mt-2 space-y-1.5 border-t border-white/10 pt-2">
              {msg.attachments.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer"
                  className={`flex items-center gap-1.5 text-xs font-medium hover:underline ${isMe ? 'text-primary-100' : 'text-primary-600'}`}>
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
          sameDay:  '[Today]',
          lastDay:  '[Yesterday]',
          lastWeek: 'dddd, DD MMM',
          sameElse: 'DD MMM YYYY',
        })}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   INFO ROW
══════════════════════════════════════════════════════════ */
function InfoRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="py-2 flex justify-between items-center border-b border-gray-50 last:border-0">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   QUICK TEMPLATES
══════════════════════════════════════════════════════════ */
const TEMPLATES = [
  { label: 'Follow up',   text: 'Just following up on my previous message. Could you please provide an update?' },
  { label: 'Thank you',   text: 'Thank you for your response! That helps a lot.' },
  { label: 'More detail', text: 'Could you please provide more details about this?' },
  { label: 'Resolved?',   text: "Has this issue been resolved? I haven't received an update yet." },
];

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function MessageDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const { token, user } = useSelector(s => s.auth);

  const [query,         setQuery]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [reply,         setReply]         = useState('');
  const [sending,       setSending]       = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

  /* ── fetch ── */
  const fetchQuery = useCallback(async () => {
    if (!token || !id) return;
    try {
      const { data } = await axiosInstance.get(`/customer/queries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setQuery(data.data);
      else { toast.error('Conversation not found'); router.push('/messages'); }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load conversation');
      router.push('/messages');
    } finally {
      setLoading(false);
    }
  }, [id, token, router]);

  useEffect(() => { fetchQuery(); }, [fetchQuery]);

  /* scroll to bottom */
  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, [query?.messages?.length]);

  /* ── send ── */
  const handleSend = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const { data } = await axiosInstance.post(
        `/customer/queries/${id}/reply`,
        { message: reply.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setReply('');
        setShowTemplates(false);
        await fetchQuery();
      } else toast.error(data.message || 'Failed to send message');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleSend(); }
  };

  /* ── loading ── */
  if (loading) {
    return (
      <div className="h-[calc(100vh-72px)] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="svg-spinners:180-ring-with-bg" className="w-10 h-10 text-primary-500" />
          <p className="text-sm text-gray-500 font-medium">Loading conversation…</p>
        </div>
      </div>
    );
  }

  if (!query) return null;

  const isClosed   = query.status === 'closed';
  const isOrder    = query.queryType === 'order';
  const sellerName = query.sellerId?.name || 'Seller';

  /* group messages by date */
  const grouped = [];
  let lastDate  = null;
  (query.messages || []).forEach(msg => {
    const day = moment(msg.createdAt).format('YYYY-MM-DD');
    if (day !== lastDate) { grouped.push({ type: 'date', date: msg.createdAt }); lastDate = day; }
    grouped.push({ type: 'msg', msg });
  });

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] bg-gray-50/50 sm:px-6 lg:px-8 py-6">
      
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* ══ TOP HEADER ══ */}
        <div className="flex-shrink-0 border-b border-gray-200">
          <div className="flex items-center gap-4 px-6 py-4">
            {/* Back */}
            <button
              onClick={() => router.push('/messages')}
              className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <Icon icon="solar:arrow-left-linear" className="w-5 h-5" />
            </button>

            {/* Seller avatar + info */}
            <Avatar name={sellerName} size={40} isCustomer={false} image={query.sellerId?.profilePictureOrLogo} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900 text-base truncate">{sellerName}</span>
                <StatusPill status={query.status} />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  isOrder ? 'bg-amber-100 text-amber-800' : 'bg-primary-100 text-primary-800'
                }`}>
                  {isOrder ? 'Order Query' : 'Product Query'}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{query.subject}</p>
            </div>

            {/* Sidebar toggle (mobile) + refresh */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={fetchQuery}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                title="Refresh"
              >
                <Icon icon="solar:refresh-linear" className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSidebarOpen(p => !p)}
                className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
              >
                <Icon icon="solar:info-circle-linear" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ══ BODY ══ */}
        <div className="flex flex-1 min-h-0 overflow-hidden relative">

          {/* ── CHAT AREA ── */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/50">

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
              {grouped.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4">
                    <Icon icon="solar:chat-round-dots-linear" className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Conversation started</p>
                  <p className="text-gray-400 text-sm mt-1">The seller will reply shortly.</p>
                </div>
              ) : (
                grouped.map((item, i) =>
                  item.type === 'date'
                    ? <DateDivider key={`d-${i}`} date={item.date} />
                    : <Bubble key={item.msg._id || i} msg={item.msg} currentUserId={user?._id} sellerImage={query.sellerId?.profilePictureOrLogo} />
                )
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── COMPOSE BAR ── */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 sm:p-6">

              {/* Quick Templates */}
              {showTemplates && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Quick Replies:</p>
                  <div className="flex flex-wrap gap-2">
                    {TEMPLATES.map(t => (
                      <button
                        key={t.label}
                        onClick={() => { setReply(t.text); setShowTemplates(false); textareaRef.current?.focus(); }}
                        className="text-xs bg-gray-50 text-gray-700 border border-gray-200 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 font-medium px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input row */}
              <div className="flex items-end gap-3">
                {/* Templates toggle */}
                <button
                  onClick={() => setShowTemplates(p => !p)}
                  title="Quick replies"
                  className={`flex-shrink-0 p-3 rounded-xl transition-colors border ${
                    showTemplates ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  <Icon icon="solar:magic-stick-3-linear" className="w-5 h-5" />
                </button>

                {/* Textarea */}
                <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={reply}
                    onChange={e => {
                      setReply(e.target.value.slice(0, 2000));
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={isClosed ? 'Reply to reopen this conversation…' : 'Type a message…'}
                    className="w-full px-4 py-3 bg-transparent text-sm text-gray-700 resize-none focus:outline-none placeholder:text-gray-400 min-h-[48px]"
                    style={{ maxHeight: '120px' }}
                  />
                </div>

                {/* Send */}
                <button
                  onClick={handleSend}
                  disabled={sending || !reply.trim()}
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

              {/* char count hint */}
              {reply.length > 1800 && (
                <p className="text-[10px] text-right text-gray-400 px-5 pt-2">
                  {reply.length}/2000
                </p>
              )}
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className={`
            absolute z-10 inset-y-0 right-0  lg:static
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            flex flex-col w-72 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto transition-transform duration-300
          `}>
            {/* Mobile close sidebar button */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-bold text-gray-900">Details</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Icon icon="solar:close-circle-linear" className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Seller info */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Seller Details</h3>
                <div className="flex items-center gap-3">
                  <Avatar name={sellerName} size={40} isCustomer={false} image={query.sellerId?.profilePictureOrLogo} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{sellerName}</p>
                    {query.sellerId?.email && (
                      <p className="text-[11px] text-gray-500 truncate">{query.sellerId.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Query info */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Conversation Details</h3>
                <InfoRow label="Opened"   value={moment(query.createdAt).format('DD MMM YYYY, HH:mm')} />
                <InfoRow label="Updated"  value={moment(query.updatedAt).fromNow()} />
                <InfoRow label="Messages" value={`${query.messages?.length || 0}`} />
                <InfoRow label="Type"     value={isOrder ? 'Order Query' : 'Product Query'} />
              </div>

              {/* Order info */}
              {isOrder && query.orderId && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Related Order</h3>
                  <InfoRow label="Order ID" value={query.orderId?.orderId || query.orderId?.orderNo || query.orderId?._id} />
                  <InfoRow label="Amount"   value={query.orderId?.totalAmount ? `$${Number(query.orderId.totalAmount).toFixed(2)}` : '—'} />
                  <InfoRow label="Status"   value={query.orderId?.orderStatus || '—'} />
                  
                  {query.orderId?._id && (
                    <Link
                      href={`/orders/${query.orderId._id}`}
                      className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                    >
                      View Order Details
                      <Icon icon="solar:arrow-right-linear" className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              )}

              {/* Product info */}
              {!isOrder && query.productId && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Related Product</h3>
                  <InfoRow label="Product ID" value={query.productId?._id || query.productId} />
                  {query.productId?.name && <InfoRow label="Product Name" value={query.productId.name} />}
                  
                  <Link
                    href={`/product/${query.productId?.slug || query.productId?._id || query.productId}`}
                    className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                  >
                    View Product Details
                    <Icon icon="solar:arrow-right-linear" className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Status banners */}
              {isClosed && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon="solar:lock-keyhole-bold" className="w-4 h-4 text-amber-500" />
                    <p className="text-xs font-bold text-amber-700">Conversation Closed</p>
                  </div>
                  <p className="text-[11px] text-amber-600">
                    You can still reply — it will automatically reopen.
                  </p>
                </div>
              )}
              {query.status === 'replied' && !isClosed && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon="solar:chat-round-dots-bold" className="w-4 h-4 text-blue-500" />
                    <p className="text-xs font-bold text-blue-700">Seller Replied</p>
                  </div>
                  <p className="text-[11px] text-blue-600">The seller has responded. Check their message.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
