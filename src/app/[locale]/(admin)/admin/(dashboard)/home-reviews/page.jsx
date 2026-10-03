"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const EMPTY_FORM = { type: 'repairman', username: '', reviewText: '', rating: 5 };
const TABS = [
    { key: 'all', label: 'All' },
    { key: 'repairman', label: 'Repairman' },
    { key: 'seller', label: 'Seller' },
];

/* ---------- helpers ---------- */

// Selected file ka preview; unmount/change par blob URL khud free ho jata hai
function useObjectUrl(file, fallback) {
    const [url, setUrl] = useState(null);
    useEffect(() => {
        if (!file) {
            setUrl(null);
            return;
        }
        const u = URL.createObjectURL(file);
        setUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [file]);
    return url || fallback || null;
}

function Stars({ value }) {
    return (
        <div className="flex items-center gap-0.5" aria-label={`${value} out of 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <Icon
                    key={n}
                    icon="mdi:star"
                    className={`h-4 w-4 ${n <= value ? 'text-amber-400' : 'text-gray-200'}`}
                />
            ))}
        </div>
    );
}

function StarPicker({ value, onChange }) {
    const [hover, setHover] = useState(0);
    const shown = hover || value;
    return (
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(n)}
                    onMouseEnter={() => setHover(n)}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                    <Icon
                        icon="mdi:star"
                        className={`h-7 w-7 ${n <= shown ? 'text-amber-400' : 'text-gray-300'}`}
                    />
                </button>
            ))}
            <span className="ml-2 text-sm font-medium text-gray-600">{value}/5</span>
        </div>
    );
}

function ImagePicker({ label, file, onChange, existingUrl, round }) {
    const inputRef = useRef(null);
    const preview = useObjectUrl(file, existingUrl);

    const handlePick = (e) => {
        const f = e.target.files?.[0];
        e.target.value = ''; // same file dobara select ho sake
        if (!f) return;
        if (!f.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        if (f.size > MAX_IMAGE_SIZE) {
            toast.error('Image must be smaller than 5MB');
            return;
        }
        onChange(f);
    };

    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label} <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 p-3">
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-gray-100 text-gray-400 transition hover:bg-gray-200 ${round ? 'rounded-full' : 'rounded-lg'
                        }`}
                    aria-label={`Choose ${label}`}
                >
                    {preview ? (
                        <img src={preview} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <Icon icon="mdi:image-plus" className="h-7 w-7" />
                    )}
                </button>
                <div className="min-w-0 flex-1">
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="text-sm font-semibold text-primary-600 hover:text-primary-800"
                    >
                        {preview ? 'Change image' : 'Choose image'}
                    </button>
                    <p className="truncate text-xs text-gray-400">
                        {file ? file.name : existingUrl ? 'Current image' : 'PNG, JPG up to 5MB'}
                    </p>
                </div>
                {file && (
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="text-gray-400 hover:text-red-500"
                        aria-label="Remove selected image"
                    >
                        <Icon icon="mdi:close-circle" className="h-5 w-5" />
                    </button>
                )}
                <input ref={inputRef} type="file" accept="image/*" onChange={handlePick} className="hidden" />
            </div>
        </div>
    );
}

function Avatar({ src, name }) {
    return src ? (
        <img src={src} alt={name} className="h-9 w-9 rounded-full object-cover" loading="lazy" />
    ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-gray-500">
            <Icon icon="mdi:account" className="h-5 w-5" />
        </div>
    );
}

function SkeletonRows() {
    return (
        <>
            {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-5 w-20 rounded-full bg-gray-200" /></td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gray-200" />
                            <div className="h-4 w-28 rounded bg-gray-200" />
                        </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-gray-200" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-56 rounded bg-gray-200" /></td>
                    <td className="px-6 py-4"><div className="ml-auto h-4 w-16 rounded bg-gray-200" /></td>
                </tr>
            ))}
        </>
    );
}

/* ---------- page ---------- */

export default function AdminHomeReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // filters
    const [tab, setTab] = useState('all');
    const [search, setSearch] = useState('');

    // modal / form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentReview, setCurrentReview] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [profileFile, setProfileFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [saving, setSaving] = useState(false);

    // delete
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchReviews = useCallback(async ({ silent = false } = {}) => {
        try {
            if (!silent) setLoading(true);
            setError(null);
            const res = await axiosInstance.get('/home-reviews');
            setReviews(res.data.data || []);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError(err.response?.data?.message || 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    /* ----- modal ----- */

    const closeModal = useCallback(() => {
        if (saving) return;
        setIsModalOpen(false);
    }, [saving]);

    const openModal = (review = null) => {
        setProfileFile(null);
        setImageFile(null);
        if (review) {
            setEditMode(true);
            setCurrentReview(review);
            setFormData({
                type: review.type || 'repairman',
                username: review.username || '',
                reviewText: review.reviewText || '',
                rating: review.rating || 5,
            });
        } else {
            setEditMode(false);
            setCurrentReview(null);
            setFormData(EMPTY_FORM);
        }
        setIsModalOpen(true);
    };

    // Esc se band + background scroll lock
    useEffect(() => {
        if (!isModalOpen && !deleteTarget) return;
        const onKey = (e) => {
            if (e.key !== 'Escape') return;
            if (deleteTarget && !deleting) setDeleteTarget(null);
            else closeModal();
        };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [isModalOpen, deleteTarget, deleting, closeModal]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saving) return;

        const username = formData.username.trim();
        const reviewText = formData.reviewText.trim();
        if (!username || !reviewText) {
            toast.error('Username and review text are required');
            return;
        }

        try {
            setSaving(true);
            const data = new FormData();
            data.append('type', formData.type);
            data.append('username', username);
            data.append('reviewText', reviewText);
            data.append('rating', String(formData.rating));
            if (profileFile) data.append('profilePhoto', profileFile);
            if (imageFile) data.append('image', imageFile);

            // Content-Type manually set nahi karna, axios boundary khud lagata hai
            if (editMode) {
                await axiosInstance.put(`/home-reviews/${currentReview._id}`, data);
                toast.success('Review updated successfully!');
            } else {
                await axiosInstance.post('/home-reviews', data);
                toast.success('Review added successfully!');
            }
            setSaving(false);
            setIsModalOpen(false);
            fetchReviews({ silent: true }); // table flash na kare
        } catch (err) {
            console.error('Error saving review:', err);
            toast.error(err.response?.data?.message || 'Failed to save review');
        } finally {
            setSaving(false);
        }
    };

    /* ----- delete ----- */

    const confirmDelete = async () => {
        if (!deleteTarget || deleting) return;
        try {
            setDeleting(true);
            await axiosInstance.delete(`/home-reviews/${deleteTarget._id}`);
            setReviews((prev) => prev.filter((r) => r._id !== deleteTarget._id)); // turant hata do
            toast.success('Review deleted successfully!');
            setDeleteTarget(null);
        } catch (err) {
            console.error('Error deleting review:', err);
            toast.error(err.response?.data?.message || 'Failed to delete review');
        } finally {
            setDeleting(false);
        }
    };

    /* ----- derived ----- */

    const counts = useMemo(
        () => ({
            all: reviews.length,
            repairman: reviews.filter((r) => r.type === 'repairman').length,
            seller: reviews.filter((r) => r.type === 'seller').length,
        }),
        [reviews]
    );

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return reviews.filter((r) => {
            if (tab !== 'all' && r.type !== tab) return false;
            if (!q) return true;
            return (
                (r.username || '').toLowerCase().includes(q) ||
                (r.reviewText || '').toLowerCase().includes(q)
            );
        });
    }, [reviews, tab, search]);

    const inputClass =
        'w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:bg-gray-100';

    return (
        <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Home Page Reviews</h1>
                    <p className="mt-0.5 text-sm text-gray-500">
                        Manage the reviews shown on the home page.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => openModal()}
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                    <Icon icon="mdi:plus" className="h-5 w-5" />
                    Add Review
                </button>
            </div>

            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setTab(t.key)}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${tab === t.key
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {t.label}
                            <span className="rounded-full bg-gray-200 px-1.5 text-xs text-gray-600">
                                {counts[t.key]}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-72">
                    <Icon
                        icon="mdi:magnify"
                        className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or review..."
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                </div>
            </div>

            {/* Error */}
            {error && !loading && (
                <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span className="flex items-center gap-2">
                        <Icon icon="mdi:alert-circle" className="h-5 w-5" />
                        {error}
                    </span>
                    <button
                        type="button"
                        onClick={() => fetchReviews()}
                        className="font-semibold underline hover:no-underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                <table className="min-w-full text-left">
                    <thead className="border-b bg-gray-50">
                        <tr>
                            {['Type', 'User', 'Rating', 'Review Text'].map((h) => (
                                <th key={h} className="px-6 py-3 text-sm font-semibold text-gray-700">
                                    {h}
                                </th>
                            ))}
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <SkeletonRows />
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-14 text-center">
                                    <Icon icon="mdi:comment-text-outline" className="mx-auto h-10 w-10 text-gray-300" />
                                    <p className="mt-2 font-medium text-gray-700">
                                        {reviews.length === 0 ? 'No reviews yet' : 'No reviews match your filters'}
                                    </p>
                                    {reviews.length === 0 ? (
                                        <button
                                            type="button"
                                            onClick={() => openModal()}
                                            className="mt-3 text-sm font-semibold text-primary-600 hover:text-primary-800"
                                        >
                                            Add your first review
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTab('all');
                                                setSearch('');
                                            }}
                                            className="mt-3 text-sm font-semibold text-primary-600 hover:text-primary-800"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            filtered.map((review) => (
                                <tr key={review._id} className="transition hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${review.type === 'seller'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                }`}
                                        >
                                            {review.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar src={review.profilePhoto} name={review.username} />
                                            <span className="whitespace-nowrap font-medium text-gray-900">
                                                {review.username}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Stars value={review.rating || 0} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {review.image && (
                                                <img
                                                    src={review.image}
                                                    alt=""
                                                    loading="lazy"
                                                    className="h-10 w-10 shrink-0 rounded object-cover"
                                                />
                                            )}
                                            <p
                                                className="line-clamp-2 max-w-xs text-sm text-gray-600"
                                                title={review.reviewText}
                                            >
                                                {review.reviewText}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => openModal(review)}
                                            className="rounded-md p-1.5 text-primary-600 transition hover:bg-primary-50"
                                            aria-label={`Edit review by ${review.username}`}
                                        >
                                            <Icon icon="mdi:pencil" className="h-5 w-5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteTarget(review)}
                                            className="ml-1 rounded-md p-1.5 text-red-500 transition hover:bg-red-50"
                                            aria-label={`Delete review by ${review.username}`}
                                        >
                                            <Icon icon="mdi:delete" className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add / Edit modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeModal();
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="review-modal-title"
                        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
                    >
                        <div className="flex items-center justify-between border-b p-5">
                            <h2 id="review-modal-title" className="text-xl font-bold">
                                {editMode ? 'Edit Review' : 'Add Review'}
                            </h2>
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="text-gray-500 hover:text-gray-800 disabled:opacity-50"
                                aria-label="Close"
                            >
                                <Icon icon="mdi:close" className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5">
                            <form id="reviewForm" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            disabled={saving}
                                            className={inputClass}
                                            required
                                        >
                                            <option value="repairman">Repairman</option>
                                            <option value="seller">Seller</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Rating</label>
                                        <StarPicker
                                            value={Number(formData.rating)}
                                            onChange={(n) => setFormData((p) => ({ ...p, rating: n }))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        disabled={saving}
                                        maxLength={80}
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <ImagePicker
                                        label="Profile Photo"
                                        round
                                        file={profileFile}
                                        onChange={setProfileFile}
                                        existingUrl={currentReview?.profilePhoto}
                                    />
                                    <ImagePicker
                                        label="Review Image"
                                        file={imageFile}
                                        onChange={setImageFile}
                                        existingUrl={currentReview?.image}
                                    />
                                </div>

                                <div>
                                    <div className="mb-1 flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700">Review Text</label>
                                        <span className="text-xs text-gray-400">{formData.reviewText.length}/500</span>
                                    </div>
                                    <textarea
                                        name="reviewText"
                                        value={formData.reviewText}
                                        onChange={handleChange}
                                        disabled={saving}
                                        rows={4}
                                        maxLength={500}
                                        className={inputClass}
                                        required
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="flex justify-end gap-3 border-t bg-gray-50 p-5">
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="reviewForm"
                                disabled={saving}
                                className="flex min-w-[96px] items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                            >
                                {saving && <Icon icon="eos-icons:loading" className="h-4 w-4 animate-spin" />}
                                {saving ? 'Saving...' : editMode ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm modal */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget && !deleting) setDeleteTarget(null);
                    }}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-title"
                        className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl"
                    >
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <Icon icon="mdi:delete-alert" className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 id="delete-title" className="mt-4 text-lg font-bold text-gray-900">
                            Delete this review?
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            The review by <span className="font-semibold">{deleteTarget.username}</span> will be
                            removed permanently.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {deleting && <Icon icon="eos-icons:loading" className="h-4 w-4 animate-spin" />}
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}