"use client"

// Bottom bar of a chat: reply preview, emoji picker, attach, text input, voice note / send.
// Like WhatsApp: with an empty input the right button records a voice note, with text it sends.
import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';

const EMOJIS = [
    '😀', '😂', '😊', '😍', '🙏', '👍', '👌', '👏', '🙌', '🤝',
    '😅', '😉', '😎', '🤔', '😢', '😡', '😮', '🥳', '❤️', '🔥',
    '✅', '❌', '⭐', '🎉', '💯', '📱', '🔧', '🛠️', '🔋', '📦',
    '🚚', '💰', '⏰', '📍', '📷', '👋', '🙂', '😴', '🤞', '💪',
];

const MAX_VOICE_SECONDS = 5 * 60;

const pickAudioMime = () => {
    if (typeof MediaRecorder === 'undefined') return null;
    const options = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
    return options.find((t) => MediaRecorder.isTypeSupported?.(t)) || '';
};

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function ChatComposer({
    value,
    onChange,
    onKeyDown,
    onBlur,
    onSend,
    onFilesPicked,
    onSendVoice,
    replyingTo,
    replyingToMine,
    onCancelReply,
    disabled,
    hasFiles,
}) {
    const fileInputRef = useRef(null);
    const inputRef = useRef(null);
    const [showEmoji, setShowEmoji] = useState(false);
    const emojiRef = useRef(null);

    // ---- voice recording ----
    const [recording, setRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const rec = useRef({ recorder: null, chunks: [], stream: null, timer: null, startedAt: 0, cancelled: false });

    const stopTracks = () => {
        rec.current.stream?.getTracks().forEach((t) => t.stop());
        rec.current.stream = null;
        clearInterval(rec.current.timer);
    };

    const startRecording = async () => {
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
            toast.error('Voice messages are not supported in this browser');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = pickAudioMime();
            const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
            rec.current = { recorder, chunks: [], stream, timer: null, startedAt: Date.now(), cancelled: false };
            recorder.ondataavailable = (e) => e.data?.size && rec.current.chunks.push(e.data);
            recorder.onstop = () => {
                const { chunks, startedAt, cancelled } = rec.current;
                stopTracks();
                setRecording(false);
                setSeconds(0);
                if (cancelled) return;
                const duration = Math.round((Date.now() - startedAt) / 1000);
                if (duration < 1) {
                    toast.info('Hold on a little longer to record a voice message');
                    return;
                }
                const type = (recorder.mimeType || mimeType || 'audio/webm').split(';')[0];
                onSendVoice?.(new Blob(chunks, { type }), duration);
            };
            recorder.start();
            setRecording(true);
            setSeconds(0);
            rec.current.timer = setInterval(() => {
                const s = Math.round((Date.now() - rec.current.startedAt) / 1000);
                setSeconds(s);
                if (s >= MAX_VOICE_SECONDS) rec.current.recorder?.stop();
            }, 250);
        } catch {
            toast.error('Microphone permission is needed to record a voice message');
        }
    };

    const finishRecording = (cancel = false) => {
        rec.current.cancelled = cancel;
        if (rec.current.recorder?.state === 'recording') rec.current.recorder.stop();
        else stopTracks();
    };

    useEffect(() => () => {
        rec.current.cancelled = true;
        if (rec.current.recorder?.state === 'recording') rec.current.recorder.stop();
        stopTracks();
    }, []);

    // ---- emoji ----
    useEffect(() => {
        if (!showEmoji) return undefined;
        const close = (e) => {
            if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [showEmoji]);

    const insertEmoji = (emoji) => {
        const el = inputRef.current;
        const start = el?.selectionStart ?? value.length;
        const end = el?.selectionEnd ?? value.length;
        const next = value.slice(0, start) + emoji + value.slice(end);
        onChange({ target: { value: next } });
        requestAnimationFrame(() => {
            el?.focus();
            const pos = start + emoji.length;
            el?.setSelectionRange?.(pos, pos);
        });
    };

    // Focus the input when a reply is started
    useEffect(() => {
        if (replyingTo) inputRef.current?.focus();
    }, [replyingTo]);

    const canSend = !!value.trim() || hasFiles;

    return (
        <div className="border-t bg-white">
            {replyingTo && (
                <div className="px-3 pt-2">
                    <div className="flex items-center gap-2 bg-gray-50 border-l-4 border-primary-500 rounded px-2 py-1">
                        <Icon icon="mdi:reply" width={16} className="text-primary-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold text-primary-600">Replying to {replyingToMine ? 'yourself' : 'them'}</p>
                            <p className="text-xs text-gray-600 truncate">{replyingTo.preview}</p>
                        </div>
                        <button type="button" onClick={onCancelReply} className="text-gray-400 hover:text-gray-600" aria-label="Cancel reply">
                            <Icon icon="mdi:close" width={16} />
                        </button>
                    </div>
                </div>
            )}

            <div className="p-3 relative">
                {showEmoji && (
                    <div ref={emojiRef} className="absolute bottom-full left-3 mb-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-8 gap-1 z-10">
                        {EMOJIS.map((e) => (
                            <button key={e} type="button" onClick={() => insertEmoji(e)} className="text-xl leading-none p-1 rounded hover:bg-gray-100">
                                {e}
                            </button>
                        ))}
                    </div>
                )}

                {recording ? (
                    // Recording bar: cancel | red dot + timer | send
                    <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 gap-3">
                        <button type="button" onClick={() => finishRecording(true)} className="text-gray-500 hover:text-red-500" aria-label="Cancel recording">
                            <Icon icon="mdi:delete-outline" width={22} />
                        </button>
                        <span className="flex items-center gap-2 flex-1 text-sm text-gray-700">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                            Recording… {fmt(seconds)}
                        </span>
                        <button type="button" onClick={() => finishRecording(false)} className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center" aria-label="Send voice message">
                            <Icon icon="mdi:send" width={18} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 gap-2">
                        <button type="button" onClick={() => setShowEmoji((v) => !v)} className="text-gray-500 hover:text-gray-700" aria-label="Emoji">
                            <Icon icon="mdi:emoticon-happy-outline" width={21} />
                        </button>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:text-gray-700" aria-label="Attach file">
                            <Icon icon="mdi:paperclip" width={20} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*,video/*,*"
                            className="hidden"
                            multiple
                            onChange={(e) => {
                                onFilesPicked?.(e);
                                e.target.value = '';
                            }}
                        />
                        <input
                            ref={inputRef}
                            type="text"
                            value={value}
                            onChange={onChange}
                            onKeyDown={onKeyDown}
                            onBlur={onBlur}
                            placeholder="Type a message..."
                            disabled={disabled}
                            maxLength={5000}
                            // 16px on phones so iOS does not zoom into the input
                            className="flex-1 min-w-0 bg-transparent outline-none disabled:opacity-50 text-base sm:text-sm"
                        />
                        {canSend ? (
                            <button type="button" onClick={onSend} className="text-primary-500 hover:text-primary-600" aria-label="Send">
                                <Icon icon="mdi:send" width={20} />
                            </button>
                        ) : (
                            <button type="button" onClick={startRecording} className="text-gray-500 hover:text-primary-600" aria-label="Record voice message">
                                <Icon icon="mdi:microphone" width={21} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
