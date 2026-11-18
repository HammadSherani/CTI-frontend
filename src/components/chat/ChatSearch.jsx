"use client"

// Search inside one chat: type -> matching messages (newest first) -> tap one to jump to it.
import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';

const highlight = (text, q) => {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return text;
    // show a window around the match
    const start = Math.max(0, i - 30);
    const before = (start > 0 ? '…' : '') + text.slice(start, i);
    return (
        <>
            {before}
            <mark className="bg-yellow-200 rounded px-0.5">{text.slice(i, i + q.length)}</mark>
            {text.slice(i + q.length, i + q.length + 60)}
        </>
    );
};

export default function ChatSearch({ chatId, token, myId, onJump, onClose }) {
    const [q, setQ] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const term = q.trim();
        if (term.length < 2) {
            setResults([]);
            return undefined;
        }
        let active = true;
        setLoading(true);
        const t = setTimeout(async () => {
            try {
                const { data } = await axiosInstance.get(`/chat/${chatId}/search`, {
                    params: { q: term },
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (active) setResults(data?.results || []);
            } catch {
                if (active) setResults([]);
            } finally {
                if (active) setLoading(false);
            }
        }, 300);
        return () => {
            active = false;
            clearTimeout(t);
        };
    }, [q, chatId, token]);

    return (
        <div className="absolute inset-x-0 top-0 z-20 bg-white border-b shadow-sm">
            <div className="flex items-center gap-2 px-3 py-2">
                <Icon icon="mdi:magnify" width={20} className="text-gray-400" />
                <input
                    ref={inputRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && onClose()}
                    placeholder="Search in this chat…"
                    className="flex-1 min-w-0 outline-none text-base sm:text-sm"
                    maxLength={100}
                />
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-200 border-t-primary-500" />}
                <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close search">
                    <Icon icon="mdi:close" width={20} />
                </button>
            </div>
            {q.trim().length >= 2 && (
                <div className="max-h-64 overflow-y-auto border-t">
                    {!loading && results.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-500">No messages found</p>
                    ) : (
                        results.map((r) => (
                            <button
                                key={r._id}
                                type="button"
                                onClick={() => onJump(r.messageId || r._id)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-50"
                            >
                                <div className="flex justify-between text-[11px] text-gray-400 mb-0.5">
                                    <span>{String(r.senderId) === String(myId) ? 'You' : 'Them'}</span>
                                    <span>{new Date(r.timestamp).toLocaleDateString([], { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2">{highlight(r.content || '', q.trim())}</p>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
