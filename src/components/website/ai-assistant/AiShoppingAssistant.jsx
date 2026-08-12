'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import axiosInstance from '@/config/axiosInstance';
import { Link, useRouter } from '@/i18n/navigation';
import { useSelector } from 'react-redux';
import LoginModal from '@/components/website/ai-assistant/LoginModal';


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

function formatPrice(value, currency = 'USD') {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return 'Price on request';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-US')}`;
  }
}

/* ───────────────────────── Product Card ───────────────────────── */

function AssistantProductCard({ product, onClick }) {
  if (!product) return null;

  const title = product.title || product.name || 'Product';
  const brand = product.brand?.title || product.brand?.name || product.brand || null;
  const category = product.category?.title || product.category?.name || product.category || product.subcategory || null;
  const metaParts = [brand, category].filter(Boolean);

  const firstImg = Array.isArray(product.images) ? product.images[0] : null;
  const image = (typeof firstImg === 'string' ? firstImg : firstImg?.url) ||
    (typeof product.image === 'string' ? product.image : product.image?.url) ||
    '/assets/placeholder.jpg';

  const minPrice = Number(product.priceRange?.minPrice ?? product.price ?? 0);
  const maxPrice = Number(product.priceRange?.maxPrice ?? minPrice);
  const priceLabel = maxPrice > minPrice && minPrice > 0
    ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`
    : formatPrice(minPrice || maxPrice);

  const isOutOfStock = product.stockStatus === 'out_of_stock' ||
    (Array.isArray(product.variants) && product.variants.length > 0 && product.variants.every(v => Number(v.stock || 0) === 0));
  const stockLabel = isOutOfStock ? 'Out of stock' : 'In stock';
  const stockTone = isOutOfStock ? 'danger' : 'success';

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col h-[290px] justify-between group w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-100/50"
    >
      <div className="relative h-[130px] w-full shrink-0 overflow-hidden bg-gradient-to-br from-slate-50 to-primary-50/30">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, 260px"
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide shadow-sm ${stockTone === 'danger' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
            }`}
        >
          {stockLabel}
        </span>
        {product.productType === 'refurbished' && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-orange-500 text-white px-2.5 py-1 text-[10px] font-semibold tracking-wide shadow-sm animate-pulse">
            Refurbished
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between p-3.5">
        <div className="space-y-1.5">
          <h4 className="line-clamp-2 text-[13px] font-semibold leading-snug text-slate-900">
            {title}
          </h4>
          {product.shortDescription && (
            <p className="line-clamp-2 text-[11px] leading-snug text-slate-500">
              {product.shortDescription}
            </p>
          )}
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
            <p className="text-[14px] font-bold text-primary-700">{priceLabel}</p>
          </div>
          {product.ratings?.average ? (
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

const AssistantBubble = memo(function AssistantBubble({ message, onProductClick, onLoginClick }) {
  const isUser = message.role === 'user';
  const hasProducts = Array.isArray(message.products) && message.products.length > 0;

  const renderFormattedContent = (content) => {
    if (!content) return '';

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    const parseBold = (text, startKey) => {
      if (!text) return [];
      const boldParts = text.split('**');
      return boldParts.map((part, index) => {
        if (index % 2 === 1) {
          return <strong key={`${startKey}-bold-${index}`} className="font-bold text-slate-900">{part}</strong>;
        }
        return part;
      });
    };

    while ((match = linkRegex.exec(content)) !== null) {
      const plainText = content.substring(lastIndex, match.index);
      const linkText = match[1];
      const linkUrl = match[2];

      parts.push(...parseBold(plainText, `before-${match.index}`));

      parts.push(
        <Link
          key={`link-${match.index}`}
          href={linkUrl}
          className="text-primary-600 hover:text-primary-700 font-bold underline transition-colors"
        >
          {linkText}
        </Link>
      );

      lastIndex = linkRegex.lastIndex;
    }

    parts.push(...parseBold(content.substring(lastIndex), 'last'));
    return parts;
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
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${isUser
          ? 'rounded-br-md bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-md shadow-primary-200/40'
          : 'rounded-bl-md bg-white text-slate-800 shadow-sm ring-1 ring-slate-100'
          }`}
      >
        <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">
          {renderFormattedContent(message.content)}
        </p>

        {message.showLoginButton && (
          <button
            type="button"
            onClick={onLoginClick}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            <Icon icon="mdi:login" className="text-sm" />
            Login or Register
          </button>
        )}

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
});

const getOrCreateGuestId = async () => {
  if (typeof window === 'undefined') return null;
  let gid = localStorage.getItem('cti-ai-shopping-assistant-guest-id-v1');
  if (!gid) {
    try {
      const { data } = await axiosInstance.post('/ai/agent/guest-session');
      if (data?.success && data.guestId) {
        gid = data.guestId;
        localStorage.setItem('cti-ai-shopping-assistant-guest-id-v1', gid);
      }
    } catch (err) {
      console.error("Failed to generate guest session from server", err);
      gid = 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('cti-ai-shopping-assistant-guest-id-v1', gid);
    }
  }
  return gid;
};

/* ───────────────────────── Main Component ───────────────────────── */

export default function AiShoppingAssistant() {
  const router = useRouter();
  const token = useSelector((state) => state.auth?.token);
  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [conversations, setConversations] = useState([createConversation('New chat')]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const hasToken = Boolean(token);
  const isGuestMode = !hasToken;

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || conversations[0];
  }, [conversations, activeConversationId]);

  const messages = activeConversation?.messages || [createWelcomeMessage()];

  const sessionHint = useMemo(() => {
    const count = Math.max(0, messages.length - 1);
    return count > 0 ? `${count} message${count === 1 ? '' : 's'}` : 'Fresh session';
  }, [messages.length]);

  const assistantModeLabel = isGuestMode ? 'Guest mode' : 'Saved mode';

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const params = {};
      const guestId = await getOrCreateGuestId();
      if (guestId) {
        params.guestId = guestId;
      }
      const { data } = await axiosInstance.get('/ai/agent/conversations', { params });
      if (data?.success && Array.isArray(data.conversations)) {
        if (data.conversations.length > 0) {
          const mapped = data.conversations.map((c) => ({
            id: c._id,
            title: c.title,
            messages: c.messages || [],
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
          }));
          setConversations(mapped);
          setActiveConversationId((currentActiveId) => {
            if (!currentActiveId || !mapped.some((x) => x.id === currentActiveId)) {
              return mapped[0].id;
            }
            return currentActiveId;
          });
        } else {
          setConversations([createConversation('New chat')]);
        }
      }
    } catch (err) {
      console.error("Failed to load saved chats from DB", err);
    }
  }, [hasToken]);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen, fetchConversations]);

  const prevHasTokenRef = useRef(hasToken);
  useEffect(() => {
    if (isHydrated && prevHasTokenRef.current && !hasToken) {
      // Guest users can only have one chat, reset multi-chats if they logout
      setConversations([createConversation('New chat')]);
      setActiveConversationId(null);
      setIsHistoryOpen(false);
    }
    prevHasTokenRef.current = hasToken;
  }, [hasToken, isHydrated]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    // Must wait for hydration to finish first: on the very first render this
    // effect and the hydration effect above both see the same pre-hydration
    // placeholder conversation, and since this one runs after it (declared
    // later), it would win and stomp the id the hydration effect just
    // restored from localStorage with the throwaway placeholder's id —
    // which doesn't exist in the real (hydrated) conversations array at all.
    if (!isHydrated) return;
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [activeConversationId, conversations, isHydrated]);

  const updateActiveConversation = (updater) => {
    setConversations((current) => {
      // activeConversationId can go stale (e.g. restored from localStorage,
      // or the conversation it pointed to was replaced) — fall back to the
      // first conversation whenever it no longer matches anything, the same
      // way `activeConversation` above already does. Without this check, a
      // stale id silently fails to match any conversation below and the
      // update (e.g. appending the user's own message) gets dropped.
      const resolvedId = current.some((c) => c.id === activeConversationId)
        ? activeConversationId
        : current[0]?.id;
      return current.map((conversation) => {
        if (conversation.id !== resolvedId) return conversation;
        const next = typeof updater === 'function' ? updater(conversation) : updater;
        return { ...conversation, ...next, updatedAt: new Date().toISOString() };
      });
    });
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

  const resetChat = async () => {
    const targetId = activeConversation?.id || conversations[0]?.id;
    if (targetId && targetId.length === 24) {
      try {
        const params = {};
        if (!hasToken) {
          params.guestId = await getOrCreateGuestId();
        }
        await axiosInstance.delete(`/ai/agent/conversations/${targetId}`, { params });
        const reset = createConversation('New chat');
        setConversations((current) =>
          current.map((c) => (c.id === targetId ? reset : c))
        );
        setActiveConversationId(reset.id);
      } catch (err) {
        console.error("Failed to clear chat in DB", err);
      }
    } else {
      const reset = createConversation('New chat');
      setConversations((current) =>
        current.map((c) => (c.id === activeConversation?.id ? reset : c))
      );
      setActiveConversationId(reset.id);
    }
    setInput('');
    inputRef.current?.focus();
  };

  const handleProductClick = useCallback((product) => {
    const target = getProductRoute(product);
    if (!target) return;
    setIsOpen(false);
    const basePath = product?.productType === 'refurbished' ? '/refurbish' : '/product';
    router.push(`${basePath}/${encodeURIComponent(target)}`);
  }, [router]);

  const handleLoginClick = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  const sendMessage = async (event) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessagesCount = messages.filter((m) => m.role === 'user').length;
    const targetId = activeConversation?.id || conversations[0]?.id;

    if (isGuestMode && userMessagesCount >= 10) {
      const nextUserMessage = {
        id: createId(),
        role: 'user',
        content: text,
        products: [],
        createdAt: new Date().toISOString(),
      };
      const assistantMessage = {
        id: createId(),
        role: 'assistant',
        content: 'You have reached the maximum limit of 10 messages for guest mode. Please login or register to save your chats and get unlimited messages.',
        showLoginButton: true,
        products: [],
        createdAt: new Date().toISOString(),
      };
      setConversations((current) =>
        current.map((c) => {
          if (c.id !== targetId) return c;
          return {
            ...c,
            messages: [...c.messages, nextUserMessage, assistantMessage],
            updatedAt: new Date().toISOString(),
          };
        })
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

      const dbConvId = targetId && targetId.length === 24 ? targetId : undefined;
      const guestId = hasToken ? undefined : await getOrCreateGuestId();
      const { data } = await axiosInstance.post('/ai/agent/chat', {
        message: text,
        history,
        conversationId: dbConvId,
        guestId,
        assistantMode: isGuestMode ? 'guest' : 'signed-in',
        instructions: {
          scope: 'shopping-only',
          answerLanguage: 'mirror-user-language',
          responseStyle: 'concise',
          avoidOffTopic: true,
        },
      });

      if (data?.limitReached) {
        const assistantMessage = {
          id: createId(),
          role: 'assistant',
          content: data.reply,
          showLoginButton: true,
          products: [],
          createdAt: new Date().toISOString(),
        };
        setConversations((current) =>
          current.map((c) => {
            if (c.id !== targetId) return c;
            return {
              ...c,
              messages: [...c.messages, assistantMessage],
              updatedAt: new Date().toISOString(),
            };
          })
        );
        setInput('');
        setIsLoading(false);
        return;
      }

      const assistantMessage = {
        id: createId(),
        role: 'assistant',
        content: data?.reply || 'I could not generate a response right now.',
        products: data?.products || [],
        createdAt: new Date().toISOString(),
      };

      setConversations((current) =>
        current.map((c) => {
          if (c.id !== targetId) return c;
          return {
            ...c,
            id: data?.conversationId || c.id,
            messages: [...c.messages, assistantMessage],
            title: c.title || getConversationTitle(nextMessages),
            updatedAt: new Date().toISOString(),
          };
        })
      );
      if (data?.conversationId) {
        setActiveConversationId(data.conversationId);
      }
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
                    <p className="truncate text-sm font-semibold tracking-tight">CTI Assistant</p>
                    <p className="truncate text-[11px] text-white/75">
                      {assistantModeLabel} {hasToken && `· ${conversations.length} chat${conversations.length === 1 ? '' : 's'}`}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {hasToken && (
                    <button
                      type="button"
                      onClick={() => setIsHistoryOpen((v) => !v)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 transition hover:bg-white/20"
                      aria-label="Toggle history"
                    >
                      <Icon icon="mdi:history" className="text-lg" />
                    </button>
                  )}
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
                        onLoginClick={handleLoginClick}
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
                              className={`w-full rounded-xl px-2.5 py-2 text-left transition ${isActive
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
              {hasToken && (
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
              )}
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
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          fetchConversations();
        }}
      />
    </div>
  );
}