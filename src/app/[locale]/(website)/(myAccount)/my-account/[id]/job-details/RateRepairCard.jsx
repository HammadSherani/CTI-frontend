'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
const QUICK_TAGS = ['Fast service', 'Fair price', 'Professional', 'Good communication', 'Device works perfectly'];
const MAX = 1000;

function Stars({ value, size = 'w-6 h-6' }) {
    return (
        <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Icon key={s} icon="mdi:star" className={`${size} ${s <= value ? 'text-yellow-400' : 'text-gray-300'}`} />
            ))}
        </span>
    );
}

/**
 * "Rate your repair" box on the customer's job page. Shown once the job is closed.
 * - No review yet: stars + short text, posted to /reviews (repairman gets notified).
 * - Already reviewed: shows the customer's rating and the repairman's reply.
 * `highlight` (opened from a notification with ?review=1) scrolls to it and pulses once.
 */
export default function RateRepairCard({ booking, review, repairmanName, token, highlight, onSubmitted }) {
    const ref = useRef(null);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        if (!highlight || !ref.current) return undefined;
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setPulse(true);
        const t = setTimeout(() => setPulse(false), 3000);
        return () => clearTimeout(t);
    }, [highlight]);

    const addTag = (tag) => {
        setText((prev) => {
            if (prev.includes(tag)) return prev;
            const next = prev.trim() ? `${prev.trim()}. ${tag}` : tag;
            return next.slice(0, MAX);
        });
    };

    const submit = async () => {
        if (!rating) return toast.error('Please choose 1 to 5 stars');
        if (text.trim().length < 5) return toast.error('Please write a few words about the repair');
        try {
            setSubmitting(true);
            const { data } = await axiosInstance.post(
                '/reviews',
                { bookingId: booking._id, overallRating: rating, reviewText: text.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(data?.message || 'Thanks for your review!');
            onSubmitted?.(data?.review);
        } catch (error) {
            handleError(error);
        } finally {
            setSubmitting(false);
        }
    };

    const who = repairmanName || 'your repairman';
    const ring = pulse ? 'ring-4 ring-yellow-300 ring-offset-2' : '';

    if (review) {
        return (
            <div ref={ref} className={`mb-6 p-5 rounded-xl border border-green-200 bg-green-50 transition-all ${ring}`}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Icon icon="mdi:check-decagram" className="w-5 h-5 text-green-600" />
                        <p className="font-semibold text-green-800">Thanks for rating {who}!</p>
                    </div>
                    <Stars value={review.overallRating} size="w-5 h-5" />
                </div>
                {review.reviewText && <p className="mt-2 text-sm text-gray-700">&ldquo;{review.reviewText}&rdquo;</p>}
                {review.repairmanResponse?.text && (
                    <div className="mt-3 p-3 bg-white rounded-lg border-l-4 border-primary-500">
                        <p className="text-xs font-semibold text-gray-900 mb-1">Reply from {who}</p>
                        <p className="text-sm text-gray-700">{review.repairmanResponse.text}</p>
                    </div>
                )}
            </div>
        );
    }

    const shown = hover || rating;

    return (
        <div ref={ref} id="rate-repair" className={`mb-6 p-5 rounded-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-white transition-all ${ring}`}>
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                    <Icon icon="mdi:star-face" className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">How was your repair with {who}?</h3>
                    <p className="text-sm text-gray-600">Your job is closed. A quick rating helps other customers choose, and helps good repairmen get more work.</p>

                    <div className="mt-4 flex items-center gap-3 flex-wrap" onMouseLeave={() => setHover(0)}>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    aria-label={`${s} star${s > 1 ? 's' : ''}`}
                                    onClick={() => setRating(s)}
                                    onMouseEnter={() => setHover(s)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Icon icon="mdi:star" className={`w-9 h-9 ${s <= shown ? 'text-yellow-400' : 'text-gray-300'}`} />
                                </button>
                            ))}
                        </div>
                        {shown > 0 && <span className="text-sm font-medium text-gray-700">{LABELS[shown]}</span>}
                    </div>

                    {rating > 0 && (
                        <div className="mt-4 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {QUICK_TAGS.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => addTag(tag)}
                                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${text.includes(tag) ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300'}`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value.slice(0, MAX))}
                                rows={3}
                                placeholder={rating >= 4 ? 'What did you like about the repair?' : 'What could have been better?'}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">{text.length}/{MAX}</span>
                                <button
                                    type="button"
                                    onClick={submit}
                                    disabled={submitting}
                                    className="px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg"
                                >
                                    {submitting ? 'Submitting…' : 'Submit review'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
