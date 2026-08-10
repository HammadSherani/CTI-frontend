'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import axiosInstance from '@/config/axiosInstance';
import { useRouter } from '@/i18n/navigation';
import { useSelector } from 'react-redux';

const STORAGE_KEY = 'cti-ai-shopping-assistant-session-v1';
const CONVERSATIONS_KEY = 'cti-ai-shopping-assistant-conversations-v1';
const ACTIVE_CONVERSATION_KEY = 'cti-ai-shopping-assistant-active-v1';
const ASSISTANT_PREFS_KEY = 'cti-ai-shopping-assistant-prefs-v1';

const QUICK_PROMPTS = [
  'Show me best-selling phones',
  'Find budget earbuds under 5000',
  'Show refurbished iPhones',
];

const SHOPPING_HINTS = [
  'product', 'products', 'phone', 'phones', 'mobile', 'laptop', 'tablet', 'watch', 'earbuds',
  'headphones', 'accessories', 'charger', 'case', 'refurbished', 'price', 'stock', 'available',
  'buy', 'order', 'deal', 'discount', 'brand', 'category', 'model', 'compare', 'shop', 'shopping',
  'iphone', 'samsung', 'oppo', 'vivo', 'xiaomi', 'realme', 'honor', 'huawei', 'google', 'oneplus',
];

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createWelcomeMessage() {
  return {
    id: 'welcome',
    role: 'assistant',
    content: 'Hi, I can help you find products, compare options, and open product pages. Ask in English, Urdu, Roman Urdu, or Hindi.',
    products: [],
    createdAt: new Date().toISOString(),
  };
}

function createConversation(title = 'New chat', messages = [createWelcomeMessage()]) {
  const timestamp = new Date().toISOString();
  return {
    id: createId(),
    title,
    messages,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function getConversationTitle(messages) {
  const firstUserMessage = messages.find((message) => message.role === 'user');
  if (!firstUserMessage?.content) return 'New chat';
  return firstUserMessage.content.slice(0, 42).trim() + (firstUserMessage.content.length > 42 ? '…' : '');
}

function formatPrice(value, currency = 'PKR') {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return 'Price on request';
  try {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function getProductImage(product) {
  if (!product) return '/assets/placeholder.jpg';
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    if (typeof first === 'string') return first;
    if (first?.url) return first.url;
  }
  if (product.image?.url) return product.image.url;
  if (product.image && typeof product.image === 'string') return product.image;
  return '/assets/placeholder.jpg';
}

function getPriceLabel(product) {
  const currency = product?.priceRange?.currency || 'PKR';
  const minPrice = Number(product?.priceRange?.minPrice ?? product?.price ?? 0);
  const maxPrice = Number(product?.priceRange?.maxPrice ?? minPrice);
  if (maxPrice > minPrice && minPrice > 0) {
    return `${formatPrice(minPrice, currency)} – ${formatPrice(maxPrice, currency)}`;
  }
  return formatPrice(minPrice || maxPrice, currency);
}

function getProductTitle(product) {
  return product?.title || product?.name || product?.productName || 'Product';
}

function getProductRoute(product) {
  return product?.slug || product?.productSlug || product?._id || product?.id || null;
}

function getProductCategory(product) {
  return product?.category?.title || product?.category?.name || product?.category || product?.subcategory || null;
}

function getProductBrand(product) {
  return product?.brand?.title || product?.brand?.name || product?.brand || null;
}

function getStockLabel(product) {
  if (!product) return null;
  if (product.stockStatus === 'out_of_stock') {
    return { label: 'Out of stock', tone: 'danger' };
  }
  if (product.stockStatus === 'in_stock') {
    return { label: 'In stock', tone: 'success' };
  }
  const stockCount = product.variants
    ?.map((variant) => Number(variant?.stock || 0))
    .reduce((sum, value) => sum + value, 0);
  if (Number.isFinite(stockCount) && stockCount > 0) {
    return { label: 'In stock', tone: 'success' };
  }
  return null;
}

function normalizeProducts(products) {
  if (!Array.isArray(products)) return [];
  return products.map((product) => ({
    ...product,
    title: getProductTitle(product),
  }));
}

function isShoppingQuery(text) {
  return true;
}

function getOffTopicReply() {
  return 'I can only help with shopping-related questions like products, prices, stock, brands, comparisons, and product pages.';
}

/* ───────────────────────── Product Card ───────────────────────── */

function AssistantProductCard({ product, onClick }) {
  const image = getProductImage(product);
  const stock = getStockLabel(product);
  const brand = getProductBrand(product);
  const category = getProductCategory(product);
  const metaParts = [brand, category].filter(Boolean);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col h-[290px] justify-between group w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-100/50"
    >
      <div className="relative h-[130px] w-full shrink-0 overflow-hidden bg-gradient-to-br from-slate-50 to-primary-50/30">
        <Image
          src={image}
          alt={product?.title || 'Product'}
          fill
          sizes="(max-width: 640px) 100vw, 260px"
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
        {stock && (
          <span
            className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide shadow-sm ${
              stock.tone === 'danger'
                ? 'bg-rose-500 text-white'
                : 'bg-emerald-500 text-white'
            }`}
          >
            {stock.label}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between p-3.5">
        <div className="space-y-1.5">
          <h4 className="line-clamp-2 text-[13px] font-semibold leading-snug text-slate-900">
            {product?.title}
          </h4>
          {metaParts.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {metaParts.map((part) => (
                <span
                  key={part}
                  className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                >
                  {part}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-2 border-t border-slate-100 pt-2.5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Price</p>
            <p className="text-[14px] font-bold text-primary-700">{getPriceLabel(product)}</p>
          </div>
          {product?.ratings?.average ? (
            <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
              <Icon icon="mdi:star" className="text-xs" />
              {Number(product.ratings.average).toFixed(1)}
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}

/* ───────────────────────── Message Bubble ───────────────────────── */

function AssistantBubble({ message, onProductClick }) {
  const isUser = message.role === 'user';
  const hasProducts = Array.isArray(message.products) && message.products.length > 0;

  const renderFormattedContent = (content) => {
    if (!content) return '';
    const parts = content.split('**');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-bold text-slate-900">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-sm">
          <Icon icon="mdi:robot-outline" className="text-base" />
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
          isUser
            ? 'rounded-br-md bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-md shadow-primary-200/40'
            : 'rounded-bl-md bg-white text-slate-800 shadow-sm ring-1 ring-slate-100'
        }`}
      >
        <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">
          {renderFormattedContent(message.content)}
        </p>

        {hasProducts && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <Icon icon="mdi:shopping-search" className="text-sm text-primary-500" />
              Matching products
            </div>
            {/* Horizontal Carousel Slider */}
            <div className="flex w-full gap-3 overflow-x-auto pb-2.5 pt-0.5 scrollbar-thin scrollbar-thumb-slate-200 snap-x snap-mandatory">
              {message.products.map((product) => (
                <div key={product.id || product._id || product.slug} className="w-[210px] shrink-0 snap-start">
                  <AssistantProductCard
                    product={product}
                    onClick={() => onProductClick(product)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white shadow-sm">
          <Icon icon="mdi:account" className="text-base" />
        </div>
      )}
    </motion.div>
  );
}

/* ───────────────────────── Main Component ───────────────────────── */

export default function AiShoppingAssistant() {
  const router = useRouter();
  const token = useSelector((state) => state.auth?.token);
  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(true);
  const [conversations, setConversations] = useState([createConversation('New chat')]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const hasToken = Boolean(token);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || conversations[0];
  }, [conversations, activeConversationId]);

  const messages = activeConversation?.messages || [createWelcomeMessage()];

  const sessionHint = useMemo(() => {
    const count = Math.max(0, messages.length - 1);
    return count > 0 ? `${count} message${count === 1 ? '' : 's'}` : 'Fresh session';
  }, [messages.length]);

  const assistantModeLabel = isGuestMode ? 'Guest mode' : hasToken ? 'Saved mode' : 'Guest mode';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedPrefs = localStorage.getItem(ASSISTANT_PREFS_KEY);
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        if (typeof parsed.isGuestMode === 'boolean') setIsGuestMode(parsed.isGuestMode);
      }
      const savedConversations = localStorage.getItem(CONVERSATIONS_KEY);
      if (savedConversations) {
        const parsed = JSON.parse(savedConversations);
        if (Array.isArray(parsed) && parsed.length > 0) setConversations(parsed);
      }
      const savedActive = localStorage.getItem(ACTIVE_CONVERSATION_KEY);
      if (savedActive) setActiveConversationId(savedActive);

      const legacy = sessionStorage.getItem(STORAGE_KEY);
      if (legacy && !savedConversations) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const restored = createConversation('Restored chat', parsed);
          setConversations([restored]);
          setActiveConversationId(restored.id);
        }
      }
    } catch (error) {
      console.error('Failed to restore assistant session', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    localStorage.setItem(ACTIVE_CONVERSATION_KEY, activeConversation?.id || '');
    localStorage.setItem(ASSISTANT_PREFS_KEY, JSON.stringify({ isGuestMode }));
  }, [conversations, activeConversation?.id, isGuestMode, isHydrated]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [activeConversationId, conversations]);

  const updateActiveConversation = (updater) => {
    setConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== (activeConversationId || current[0]?.id)) return conversation;
        const next = typeof updater === 'function' ? updater(conversation) : updater;
        return { ...conversation, ...next, updatedAt: new Date().toISOString() };
      })
    );
  };

  const startNewChat = () => {
    const conversation = createConversation();
    setConversations((current) => [conversation, ...current]);
    setActiveConversationId(conversation.id);
    setInput('');
    setIsHistoryOpen(false);
  };

  const selectConversation = (id) => {
    setActiveConversationId(id);
    setIsHistoryOpen(false);
  };

  const resetChat = () => {
    const reset = createConversation('New chat');
    setConversations((current) =>
      current.map((c) => (c.id === activeConversation?.id ? reset : c))
    );
    setActiveConversationId(reset.id);
    setInput('');
    inputRef.current?.focus();
  };

  const handleProductClick = (product) => {
    const target = getProductRoute(product);
    if (!target) return;
    setIsOpen(false);
    router.push(`/product/${encodeURIComponent(target)}`);
  };

  const sendMessage = async (event) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    if (!isShoppingQuery(text)) {
      const nextConversation = {
        ...activeConversation,
        title: activeConversation?.title || getConversationTitle(messages),
        messages: [
          ...(messages || [createWelcomeMessage()]),
          {
            id: createId(),
            role: 'assistant',
            content: getOffTopicReply(),
            products: [],
            createdAt: new Date().toISOString(),
          },
        ],
        updatedAt: new Date().toISOString(),
      };
      setConversations((current) =>
        current.map((c) => (c.id === (activeConversation?.id || current[0]?.id) ? nextConversation : c))
      );
      setInput('');
      return;
    }

    const nextUserMessage = {
      id: createId(),
      role: 'user',
      content: text,
      products: [],
      createdAt: new Date().toISOString(),
    };
    const nextMessages = [...messages, nextUserMessage];
    const targetId = activeConversation?.id || conversations[0]?.id;

    updateActiveConversation({
      title: activeConversation?.title || getConversationTitle(nextMessages),
      messages: nextMessages,
    });
    setInput('');
    setIsLoading(true);

    try {
      const history = nextMessages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }))
        .slice(-12);

      const { data } = await axiosInstance.post('/ai/agent/chat', {
        message: text,
        history,
        assistantMode: isGuestMode ? 'guest' : 'signed-in',
        instructions: {
          scope: 'shopping-only',
          answerLanguage: 'mirror-user-language',
          responseStyle: 'concise',
          avoidOffTopic: true,
        },
      });

      const assistantMessage = {
        id: createId(),
        role: 'assistant',
        content: data?.reply || 'I could not generate a response right now.',
        products: normalizeProducts(data?.products),
        createdAt: new Date().toISOString(),
      };

      setConversations((current) =>
        current.map((c) => {
          if (c.id !== targetId) return c;
          return {
            ...c,
            messages: [...c.messages, assistantMessage],
            title: c.title || getConversationTitle(nextMessages),
            updatedAt: new Date().toISOString(),
          };
        })
      );
    } catch (error) {
      const fallback = error?.response?.data?.message || 'I could not reach the shopping assistant right now.';
      setConversations((current) =>
        current.map((c) => {
          if (c.id !== targetId) return c;
          return {
            ...c,
            messages: [
              ...c.messages,
              {
                id: createId(),
                role: 'assistant',
                content: fallback,
                products: [],
                createdAt: new Date().toISOString(),
              },
            ],
            updatedAt: new Date().toISOString(),
          };
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-[70] sm:bottom-6 sm:left-6">
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="assistant-panel"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-[min(84vh,780px)] w-[min(100vw-1.5rem,420px)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_25px_80px_-12px_rgba(15,23,42,0.25)] sm:w-[420px]"
          >
            {/* ── Header ── */}
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 px-4 pb-3.5 pt-4 text-white">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_50%)]" />
              
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                    <Icon icon="mdi:robot-outline" className="text-xl" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold tracking-tight">AI Shopping Assistant</p>
                    <p className="truncate text-[11px] text-white/75">
                      {assistantModeLabel} · {conversations.length} chat{conversations.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsGuestMode((v) => !v)}
                    className="h-8 rounded-lg bg-white/10 px-2.5 text-[11px] font-semibold transition hover:bg-white/20"
                    aria-label="Toggle guest mode"
                  >
                    {isGuestMode ? 'Guest' : 'Saved'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsHistoryOpen((v) => !v)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 transition hover:bg-white/20"
                    aria-label="Toggle history"
                  >
                    <Icon icon="mdi:history" className="text-lg" />
                  </button>
                  <button
                    type="button"
                    onClick={resetChat}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 transition hover:bg-white/20"
                    aria-label="Reset chat"
                  >
                    <Icon icon="mdi:broom" className="text-lg" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 transition hover:bg-white/20"
                    aria-label="Close"
                  >
                    <Icon icon="mdi:close" className="text-lg" />
                  </button>
                </div>
              </div>

            </div>

            {/* ── Body ── */}
            <div className="relative flex min-h-0 flex-1">
              {/* Messages */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/60 px-3.5 py-3.5">
                <div className="mb-3 rounded-xl border border-primary-100/80 bg-primary-50/60 px-3 py-2 text-[11px] font-medium text-primary-800">
                  {sessionHint} · Results from live catalog
                </div>

                <div className="space-y-3.5">
                  <AnimatePresence initial={false}>
                    {messages.map((message) => (
                      <AssistantBubble
                        key={message.id}
                        message={message}
                        onProductClick={handleProductClick}
                      />
                    ))}
                  </AnimatePresence>

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2.5"
                    >
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                        <Icon icon="mdi:robot-outline" className="text-base" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-sm ring-1 ring-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-500 [animation-delay:-0.2s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-500 [animation-delay:-0.1s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-500" />
                        </div>
                        <p className="mt-1.5 text-[11px] font-medium text-slate-500">Searching products…</p>
                      </div>
                    </motion.div>
                  )}
                </div>
                <div ref={scrollRef} className="h-1" />
              </div>

              {/* History sidebar (desktop) */}
              <AnimatePresence>
                {isHistoryOpen && (
                  <motion.aside
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 168, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="hidden shrink-0 overflow-hidden border-l border-slate-100 bg-white sm:block"
                  >
                    <div className="flex h-full w-[168px] flex-col p-2.5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          History
                        </span>
                        <button
                          type="button"
                          onClick={startNewChat}
                          className="flex items-center gap-0.5 rounded-lg bg-primary-50 px-2 py-1 text-[10px] font-semibold text-primary-700 transition hover:bg-primary-100"
                        >
                          <Icon icon="mdi:plus" className="text-sm" />
                          New
                        </button>
                      </div>
                      <div className="flex-1 space-y-1.5 overflow-y-auto">
                        {conversations.map((c) => {
                          const isActive = c.id === (activeConversation?.id || conversations[0]?.id);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => selectConversation(c.id)}
                              className={`w-full rounded-xl px-2.5 py-2 text-left transition ${
                                isActive
                                  ? 'bg-primary-50 ring-1 ring-primary-200'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <p className={`line-clamp-1 text-[12px] font-semibold ${isActive ? 'text-primary-700' : 'text-slate-800'}`}>
                                {c.title || 'New chat'}
                              </p>
                              <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-slate-500">
                                {c.messages?.find((m) => m.role === 'user')?.content || 'Start shopping…'}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.aside>
                )}
              </AnimatePresence>
            </div>

            {/* ── Input ── */}
            <form onSubmit={sendMessage} className="shrink-0 border-t border-slate-100 bg-white px-3.5 py-3">
              <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 transition focus-within:border-primary-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-100">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                  rows={1}
                  placeholder="Ask about phones, prices, stock…"
                  className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-2.5 py-2 text-[13.5px] text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send"
                >
                  <Icon
                    icon={isLoading ? 'mdi:loading' : 'mdi:send'}
                    className={isLoading ? 'animate-spin text-lg' : 'text-lg'}
                  />
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Live catalog results only</span>
                <span>Enter to send</span>
              </div>

              {/* Mobile history / new chat */}
              <div className="mt-2 flex gap-2 sm:hidden">
                <button
                  type="button"
                  onClick={startNewChat}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700"
                >
                  New chat
                </button>
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen((v) => !v)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700"
                >
                  History
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* ── Floating launcher ── */
          <motion.button
            key="assistant-button"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 rounded-full border border-slate-200/80 bg-white pl-1.5 pr-4 py-1.5 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-8px_rgba(15,23,42,0.28)]"
            aria-label="Open AI shopping assistant"
          >
            <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md shadow-primary-300/40">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary-400/30" />
              <Icon icon="mdi:robot-outline" className="relative text-xl" />
            </span>
            <span className="text-left">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary-600">
                AI Assistant
              </span>
              <span className="block text-sm font-semibold text-slate-900">Search products</span>
            </span>
            <span className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition group-hover:bg-primary-100">
              <Icon icon="mdi:chevron-right" className="text-lg" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}