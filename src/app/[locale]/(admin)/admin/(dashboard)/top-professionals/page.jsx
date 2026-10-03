"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

const ROLES = [
    { key: 'repairman', label: 'Repairmen', single: 'Repairman' },
    { key: 'seller', label: 'Sellers', single: 'Seller' },
];

const STATUS_TABS = [
    { key: 'all', label: 'All' },
    { key: 'top', label: 'Top' },
    { key: 'standard', label: 'Standard' },
];

/* ---------- helpers ---------- */

function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return [debounced, setDebounced];
}

const getPhoto = (pro) =>
    pro.profileImage || pro.repairmanProfile?.profilePhoto || pro.sellerProfile?.profilePictureOrLogo || null;

const formatDate = (d) =>
    d
        ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : '-';

function Avatar({ src, name }) {
    return src ? (
        <img src={src} alt={name || ''} loading="lazy" className="h-10 w-10 rounded-full object-cover" />
    ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500">
            <Icon icon="mdi:account" className="h-5 w-5" />
        </div>
    );
}

function SkeletonRows() {
    return (
        <>
            {[...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200" />
                            <div className="h-4 w-32 rounded bg-gray-200" />
                        </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 w-44 rounded bg-gray-200" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-gray-200" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-24 rounded-full bg-gray-200" /></td>
                    <td className="px-6 py-4"><div className="ml-auto h-9 w-32 rounded-lg bg-gray-200" /></td>
                </tr>
            ))}
        </>
    );
}

/* ---------- page ---------- */

export default function TopProfessionalsPage() {
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [roleFilter, setRoleFilter] = useState('repairman');
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useDebounce(search, 400);

    const [togglingIds, setTogglingIds] = useState(() => new Set());
    const [reloadKey, setReloadKey] = useState(0);

    const role = ROLES.find((r) => r.key === roleFilter);

    // Role/search badalne par fetch. Purani request cancel hoti hai, to stale data nahi aata
    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await axiosInstance.get('/admin/top-professionals', {
                    params: { role: roleFilter, search: debouncedSearch.trim() }, // auto URL-encode
                    signal: controller.signal,
                });
                setProfessionals(res.data.data || []);
                setLoading(false);
            } catch (err) {
                if (err.code === 'ERR_CANCELED' || err.name === 'CanceledError' || err.name === 'AbortError') return;
                console.error('Error fetching professionals:', err);
                setError(err.response?.data?.message || 'Failed to load professionals');
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [roleFilter, debouncedSearch, reloadKey]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setDebouncedSearch(search); // Enter dabane par foran search
    };

    const clearSearch = () => {
        setSearch('');
        setDebouncedSearch('');
    };

    const setToggling = (id, on) =>
        setTogglingIds((prev) => {
            const next = new Set(prev);
            on ? next.add(id) : next.delete(id);
            return next;
        });

    // Optimistic update: UI foran badalti hai, error aaye to wapas
    const toggleTopProfessional = async (id, currentStatus) => {
        if (togglingIds.has(id)) return;
        const nextStatus = !currentStatus;

        setToggling(id, true);
        setProfessionals((prev) =>
            prev.map((p) => (p._id === id ? { ...p, isTopProfessional: nextStatus } : p))
        );

        try {
            const res = await axiosInstance.put(`/admin/top-professionals/${id}/toggle`, {
                isTopProfessional: nextStatus,
            });
            toast.success(res.data.message || 'Status updated');
        } catch (err) {
            console.error('Error toggling status:', err);
            setProfessionals((prev) =>
                prev.map((p) => (p._id === id ? { ...p, isTopProfessional: currentStatus } : p))
            );
            toast.error(err.response?.data?.message || 'Failed to update status');
        } finally {
            setToggling(id, false);
        }
    };

    const stats = useMemo(() => {
        const top = professionals.filter((p) => p.isTopProfessional).length;
        return { all: professionals.length, top, standard: professionals.length - top };
    }, [professionals]);

    const visible = useMemo(() => {
        if (statusFilter === 'top') return professionals.filter((p) => p.isTopProfessional);
        if (statusFilter === 'standard') return professionals.filter((p) => !p.isTopProfessional);
        return professionals;
    }, [professionals, statusFilter]);

    const hasFilters = debouncedSearch.trim() !== '' || statusFilter !== 'all';

    return (
        <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Top Professionals</h1>
                    <p className="mt-0.5 text-sm text-gray-500">
                        Choose who gets highlighted as a top {role.single.toLowerCase()}.
                    </p>
                </div>

                <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                    {ROLES.map((r) => (
                        <button
                            key={r.key}
                            type="button"
                            onClick={() => {
                                setRoleFilter(r.key);
                                setStatusFilter('all');
                            }}
                            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${roleFilter === r.key
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100 sm:p-4">
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-sm sm:flex-1">
                    <Icon
                        icon="mdi:magnify"
                        className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-9 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            aria-label="Clear search"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                        >
                            <Icon icon="mdi:close-circle" className="h-5 w-5" />
                        </button>
                    )}
                </form>

                <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                    {STATUS_TABS.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setStatusFilter(t.key)}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${statusFilter === t.key
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {t.label}
                            {!loading && (
                                <span className="rounded-full bg-gray-200 px-1.5 text-xs text-gray-600">
                                    {stats[t.key]}
                                </span>
                            )}
                        </button>
                    ))}
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
                        onClick={() => setReloadKey((k) => k + 1)}
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
                            {['Professional', 'Email', 'Joined', 'Top Status'].map((h) => (
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
                        ) : visible.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-14 text-center">
                                    <Icon icon="mdi:account-search-outline" className="mx-auto h-10 w-10 text-gray-300" />
                                    <p className="mt-2 font-medium text-gray-700">
                                        {hasFilters
                                            ? 'No professionals match your filters'
                                            : `No ${role.label.toLowerCase()} found`}
                                    </p>
                                    {hasFilters && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                clearSearch();
                                                setStatusFilter('all');
                                            }}
                                            className="mt-3 text-sm font-semibold text-primary-600 hover:text-primary-800"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            visible.map((pro) => {
                                const busy = togglingIds.has(pro._id);
                                return (
                                    <tr key={pro._id} className="transition hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar src={getPhoto(pro)} name={pro.name} />
                                                <span className="whitespace-nowrap font-medium text-gray-900">
                                                    {pro.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{pro.email}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                            {formatDate(pro.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {pro.isTopProfessional ? (
                                                <span className="flex w-max items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                                                    <Icon icon="mdi:star" className="h-3.5 w-3.5" />
                                                    Top {role.single}
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                                    Standard
                                                </span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => toggleTopProfessional(pro._id, pro.isTopProfessional)}
                                                disabled={busy}
                                                className={`inline-flex min-w-[150px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${pro.isTopProfessional
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                                                    }`}
                                            >
                                                {busy && <Icon icon="eos-icons:loading" className="h-4 w-4 animate-spin" />}
                                                {pro.isTopProfessional ? 'Remove from Top' : 'Mark as Top'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}