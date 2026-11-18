"use client"

// WhatsApp-style media in chat bubbles:
// - the bubble has a fixed-size box from the start, so text shows instantly and nothing jumps
//   when the picture arrives
// - images load only when they scroll into view (lazy) and fade in; a shimmer shows meanwhile
// - videos download nothing until the user taps play
// - while uploading, the local preview is shown with a progress ring
import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const VIDEO_EXT = /\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?|$)/i;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|heic|avif|svg)(\?|$)/i;

/** 'image' | 'video' | 'voice' | 'file' for any media message (also "mixed" = media + text). */
export const mediaKindOf = (message) => {
    if (message.mediaKind) return message.mediaKind;
    if (message.messageType === 'voice') return 'voice';
    if (message.messageType === 'image') return 'image';
    if (message.messageType === 'video') return 'video';
    if (message.messageType === 'file') return 'file';
    const name = message.fileName || message.mediaUrl || '';
    if (VIDEO_EXT.test(name)) return 'video';
    if (IMAGE_EXT.test(name) || message.messageType === 'mixed') return 'image';
    return 'file';
};

const BOX = 'relative w-56 h-48 max-w-full rounded-md overflow-hidden mb-1';

const UploadOverlay = ({ progress, failed, onRetry }) => {
    if (failed) {
        return (
            <button
                type="button"
                onClick={onRetry}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white text-xs font-semibold"
            >
                <Icon icon="mdi:reload" width={28} />
                Retry
            </button>
        );
    }
    const pct = Math.max(0, Math.min(100, Math.round(progress || 0)));
    const r = 18;
    const c = 2 * Math.PI * r;
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <svg width="48" height="48" viewBox="0 0 48 48" aria-label={`Uploading ${pct}%`}>
                <circle cx="24" cy="24" r={r} stroke="rgba(255,255,255,0.35)" strokeWidth="4" fill="none" />
                <circle
                    cx="24" cy="24" r={r} stroke="white" strokeWidth="4" fill="none" strokeLinecap="round"
                    strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100}
                    transform="rotate(-90 24 24)" style={{ transition: 'stroke-dashoffset 0.2s' }}
                />
                <text x="24" y="28" textAnchor="middle" fontSize="11" fill="white" fontWeight="600">{pct}%</text>
            </svg>
        </div>
    );
};

// Box size from the real image size (WhatsApp keeps the shape), within 224x260
const boxSize = (w, h) => {
    if (!w || !h) return { width: 224, height: 192 };
    const maxW = 224;
    const maxH = 260;
    const scale = Math.min(maxW / w, maxH / h, 1);
    return { width: Math.max(120, Math.round(w * scale)), height: Math.max(90, Math.round(h * scale)) };
};

export function ChatImage({ message, onOpen, onRetry }) {
    // In the bubble: local preview while uploading, else the small thumbnail (falls back to the original)
    const src = message.localUrl || message.thumbnailUrl || message.mediaUrl;
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);
    const uploading = message.status === 'sending' || message.status === 'failed';
    const size = boxSize(message.width, message.height);

    return (
        <div className="relative max-w-full rounded-md overflow-hidden mb-1 bg-gray-300" style={size}>
            {/* Tiny blurred preview: part of the message itself, so it shows instantly */}
            {message.blurDataUrl && !loaded && (
                <img src={message.blurDataUrl} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover blur-md scale-110" />
            )}
            {!message.blurDataUrl && !loaded && !failed && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <Icon icon="mdi:image-outline" width={32} className="text-gray-400" />
                </div>
            )}
            {failed ? (
                <button
                    type="button"
                    onClick={() => { setFailed(false); setLoaded(false); }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 text-xs gap-1 bg-gray-200/80"
                >
                    <Icon icon="mdi:image-broken-variant" width={30} />
                    Tap to reload
                </button>
            ) : (
                src && (
                    <img
                        key={src}
                        src={src}
                        alt="Image"
                        loading="lazy"
                        decoding="async"
                        onLoad={() => setLoaded(true)}
                        onError={() => setFailed(true)}
                        // Full-size original opens on tap
                        onClick={() => !uploading && onOpen?.(message.mediaUrl || src)}
                        className={`absolute inset-0 w-full h-full object-cover cursor-pointer transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                )
            )}
            {uploading && <UploadOverlay progress={message.progress} failed={message.status === 'failed'} onRetry={onRetry} />}
        </div>
    );
}

const fmtDuration = (s) => {
    const sec = Math.max(0, Math.round(Number(s) || 0));
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
};

// Voice note player.
// - Downloads quietly as soon as the bubble scrolls into view, so pressing play starts at once
//   (voice notes are small: ~20-50 KB per minute). Browsers then keep the file (long cache header),
//   so opening the chat again plays it without downloading again.
// - My own note is playable immediately from the local recording while it uploads.
// - If the audio is still loading after pressing play, the button shows a spinner.
export function ChatVoice({ message, isOwner, onRetry }) {
    const src = message.localUrl || message.mediaUrl;
    const audioRef = React.useRef(null);
    const boxRef = React.useRef(null);
    const [preload, setPreload] = useState(message.localUrl ? 'auto' : 'none');
    const [playing, setPlaying] = useState(false);
    const [buffering, setBuffering] = useState(false);
    const [current, setCurrent] = useState(0);
    const [duration, setDuration] = useState(Number(message.duration) || 0);
    const failed = message.status === 'failed';

    // Start loading when the bubble becomes visible
    React.useEffect(() => {
        if (preload === 'auto' || !boxRef.current || typeof IntersectionObserver === 'undefined') {
            if (typeof IntersectionObserver === 'undefined') setPreload('auto');
            return undefined;
        }
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) {
                setPreload('auto');
                observer.disconnect();
            }
        }, { rootMargin: '200px' });
        observer.observe(boxRef.current);
        return () => observer.disconnect();
    }, [preload]);

    // Some browsers ignore a preload change on an existing element: start the download ourselves
    React.useEffect(() => {
        const a = audioRef.current;
        if (preload === 'auto' && a && a.readyState === 0 && a.paused && a.networkState !== 2) {
            try { a.load(); } catch { /* ignore */ }
        }
    }, [preload, src]);

    const toggle = () => {
        const a = audioRef.current;
        if (!a) return;
        if (a.paused) {
            if (a.readyState < 3) setBuffering(true); // not enough data yet
            a.play().catch(() => setBuffering(false));
        } else {
            a.pause();
        }
    };

    const pct = duration ? Math.min(100, (current / duration) * 100) : 0;
    const fg = isOwner ? 'bg-white' : 'bg-primary-500';
    const track = isOwner ? 'bg-white/30' : 'bg-gray-300';

    return (
        <div ref={boxRef} className="flex items-center gap-2 w-56 max-w-full py-1 mb-1">
            {failed ? (
                <button type="button" onClick={onRetry} className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0" aria-label="Retry">
                    <Icon icon="mdi:reload" width={20} />
                </button>
            ) : (
                <button
                    type="button"
                    onClick={toggle}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isOwner ? 'bg-white/20 text-white' : 'bg-primary-500 text-white'}`}
                    aria-label={playing ? 'Pause' : 'Play voice message'}
                >
                    {buffering ? (
                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/40 border-t-white" />
                    ) : (
                        <Icon icon={playing ? 'mdi:pause' : 'mdi:play'} width={22} />
                    )}
                </button>
            )}
            <div className="flex-1 min-w-0">
                <div
                    className={`h-1.5 rounded-full ${track} cursor-pointer`}
                    onClick={(e) => {
                        const a = audioRef.current;
                        if (!a || !duration) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        a.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
                    }}
                >
                    <div className={`h-full rounded-full ${fg}`} style={{ width: `${pct}%` }} />
                </div>
                <span className={`text-[11px] ${isOwner ? 'text-gray-100' : 'text-gray-500'}`}>
                    {playing || current ? fmtDuration(current) : fmtDuration(duration)}
                </span>
            </div>
            <Icon icon="mdi:microphone" width={18} className={isOwner ? 'text-white/80' : 'text-primary-500'} />
            {src && (
                <audio
                    ref={audioRef}
                    src={src}
                    preload={preload}
                    onPlay={() => setPlaying(true)}
                    onPlaying={() => setBuffering(false)}
                    onWaiting={() => setBuffering(true)}
                    onCanPlay={() => setBuffering(false)}
                    onPause={() => setPlaying(false)}
                    onEnded={() => { setPlaying(false); setCurrent(0); }}
                    onError={() => setBuffering(false)}
                    onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
                    onLoadedMetadata={(e) => {
                        const d = e.currentTarget.duration;
                        // webm recordings often report Infinity: keep the length we saved instead
                        if (Number.isFinite(d) && d > 0) setDuration(d);
                    }}
                />
            )}
        </div>
    );
}

// Quoted message inside a reply bubble; tap to jump to the original
export function ReplyQuote({ replyTo, isOwner, mine, otherName, onJump }) {
    if (!replyTo) return null;
    return (
        <button
            type="button"
            onClick={() => onJump?.(replyTo.messageId)}
            className={`w-full text-left mb-1 px-2 py-1 rounded border-l-4 ${isOwner ? 'bg-white/15 border-white/70' : 'bg-white border-primary-400'} flex items-center gap-2`}
        >
            <div className="min-w-0 flex-1">
                <p className={`text-[11px] font-semibold truncate ${isOwner ? 'text-white' : 'text-primary-600'}`}>{mine ? 'You' : (otherName || 'Them')}</p>
                <p className={`text-xs truncate ${isOwner ? 'text-gray-100' : 'text-gray-600'}`}>{replyTo.content || 'Message'}</p>
            </div>
            {replyTo.mediaUrl && ['image', 'mixed'].includes(replyTo.messageType) && (
                <img src={replyTo.mediaUrl} alt="" className="w-8 h-8 rounded object-cover shrink-0" loading="lazy" />
            )}
        </button>
    );
}

export function ChatVideo({ message, onRetry }) {
    const src = message.localUrl || message.mediaUrl;
    const [playing, setPlaying] = useState(false);
    const uploading = message.status === 'sending' || message.status === 'failed';

    if (playing && src) {
        return (
            <video
                src={src}
                controls
                autoPlay
                playsInline
                className="w-56 max-w-full rounded-md mb-1 bg-black"
                style={{ maxHeight: '260px' }}
            />
        );
    }

    return (
        <div className={`${BOX} bg-gray-800`}>
            {/* Local preview while uploading shows the first frame; remote videos load nothing yet */}
            {message.localUrl && (
                <video src={message.localUrl} muted playsInline preload="metadata" className="w-full h-full object-cover" />
            )}
            {!uploading && (
                <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center group"
                    aria-label="Play video"
                >
                    <span className="w-12 h-12 rounded-full bg-black/60 group-hover:bg-black/75 flex items-center justify-center">
                        <Icon icon="mdi:play" width={30} className="text-white ml-0.5" />
                    </span>
                </button>
            )}
            <span className="absolute bottom-1 left-1.5 text-[10px] text-white/90 flex items-center gap-0.5">
                <Icon icon="mdi:video" width={12} />
                {message.fileSize ? `${(Number(message.fileSize) / (1024 * 1024)).toFixed(1)} MB` : 'Video'}
            </span>
            {uploading && <UploadOverlay progress={message.progress} failed={message.status === 'failed'} onRetry={onRetry} />}
        </div>
    );
}

export function ChatFile({ message, isOwner, icon, onOpen, onRetry }) {
    const uploading = message.status === 'sending';
    const failed = message.status === 'failed';
    const name = message.fileName || (message.mediaUrl ? decodeURIComponent(message.mediaUrl.split('/').pop()) : 'File');
    const size = message.fileSize ? `${Math.max(1, Math.round(Number(message.fileSize) / 1024))} KB` : 'File';
    return (
        <div
            className={`flex items-center gap-2 p-2 rounded-md mb-1 ${uploading ? '' : 'cursor-pointer hover:opacity-90'} ${isOwner ? 'bg-primary-600' : 'bg-white'}`}
            onClick={() => !uploading && !failed && message.mediaUrl && onOpen?.(message.mediaUrl)}
        >
            <Icon icon={icon.icon} width={32} className={`flex-shrink-0 ${icon.color}`} />
            <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${isOwner ? 'text-white' : 'text-gray-800'}`}>{name}</p>
                <p className={`text-xs ${isOwner ? 'text-gray-200' : 'text-gray-500'}`}>
                    {uploading ? `Uploading ${Math.round(message.progress || 0)}%` : size}
                </p>
            </div>
            {failed ? (
                <button type="button" onClick={(e) => { e.stopPropagation(); onRetry?.(); }} className="text-white" aria-label="Retry upload">
                    <Icon icon="mdi:reload" width={20} />
                </button>
            ) : uploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white" />
            ) : (
                <Icon icon="mdi:download" width={20} className={isOwner ? 'text-white' : 'text-gray-600'} />
            )}
        </div>
    );
}
