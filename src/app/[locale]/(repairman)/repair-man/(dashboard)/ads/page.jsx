"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link } from '@/i18n/navigation';
import SearchInput from '@/components/SearchInput';
import { CustomDropdown } from '@/components/dropdown';
import useDebounce from '@/hooks/useDebounce';
import SummaryCards, { SummaryCardSkeleton } from '@/components/SumamryCards';








// ─── Table Skeleton ───────────────────────────────────────────────
function TableSkeleton() {
    return (
        <div className="divide-y divide-gray-100">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4" style={{ animationDelay: `${i * 0.07}s` }}>
                    {/* image placeholder */}
                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse shrink-0" style={{ animationDelay: `${i * 0.07}s` }} />
                    {/* title + desc */}
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-36 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 0.07 + 0.05}s` }} />
                        <div className="h-2.5 w-48 bg-gray-100 rounded animate-pulse" style={{ animationDelay: `${i * 0.07 + 0.1}s` }} />
                    </div>
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 0.07}s` }} />
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 0.07 + 0.05}s` }} />
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.07 + 0.1}s` }} />
                    <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.07}s` }} />
                    <div className="h-3 w-14 bg-gray-100 rounded animate-pulse" style={{ animationDelay: `${i * 0.07 + 0.05}s` }} />
                    <div className="h-7 w-14 bg-gray-100 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.07 + 0.1}s` }} />
                </div>
            ))}
        </div>
    );
}


// ─── Status Badge ─────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        pending: 'bg-amber-50 text-amber-700',
        approved: 'bg-green-50 text-green-700',
        suspended: 'bg-red-50 text-red-700',
        block: 'bg-red-50 text-red-700',
        disabled: 'bg-gray-100 text-gray-600',
    };
    const cls = map[status?.toLowerCase()] || 'bg-gray-100 text-gray-600';
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </span>
    );
}

function TypeBadge({ type }) {
    const map = {
        profile: 'bg-purple-50 text-purple-700',
        service: 'bg-blue-50 text-blue-700',
    };
    const cls = map[type?.toLowerCase()] || 'bg-gray-100 text-gray-600';
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
            {type?.charAt(0).toUpperCase() + type?.slice(1)}
        </span>
    );
}


// ─── Main Component ───────────────────────────────────────────────
function Advertisements() {
    const [isLoading, setLoading] = useState(false);
    const [ads, setAds] = useState([]);
    const [summary, setSummary] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1, totalPages: 1, totalItems: 0,
        hasNext: false, hasPrev: false
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');

    const { token } = useSelector(state => state.auth);

    useEffect(() => {
        fetchAds();
    }, [currentPage, debouncedSearch, filterStatus, filterType]);

    const fetchAds = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(filterStatus !== 'all' && { status: filterStatus }),
                ...(filterType !== 'all' && { type: filterType }),
            });

            const { data } = await axiosInstance.get(`/repairman/advertisements?${params}`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (data.success) {
                setAds(data.advertisements || []);
                setSummary(data.summary || null);
                setPagination({
                    ...data.pagination,
                    hasNext: data.pagination.currentPage < data.pagination.totalPages,
                    hasPrev: data.pagination.currentPage > 1,
                });
                setError(null);
            } else {
                setError('Failed to load advertisements');
            }
        } catch (err) {
            console.error('Error fetching advertisements:', err);
            setError('Failed to load advertisements. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'suspended', label: 'Suspended' },
        { value: 'block', label: 'Blocked' },
        { value: 'disabled', label: 'Disabled' },
    ];

    const typeOptions = [
        { value: 'all', label: 'All Types' },
        { value: 'profile', label: 'Profile' },
        { value: 'service', label: 'Service' },
    ];


    console.log(summary, "sumary")

    const SummaryData = [
        {
            label: 'Total Ads',
            value: summary?.totalAds || 0,
            icon: 'mdi:bullhorn-outline',
        },
        {
            label: 'Approved',
            value: summary?.approved || 0,
            icon: 'mdi:check-circle-outline',
        },
        {
            label: 'Pending',
            value: summary?.pending || 0,
            icon: 'mdi:progress-clock',
        },
        {
            label: 'Suspended',
            value: summary?.suspended || 0,
            icon: 'mdi:pause-circle-outline',
        },
    ];
    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
        setFilterType('all');
        setCurrentPage(1);
    };

    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;

        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(pagination.totalPages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

        return (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                    Showing{' '}
                    <span className="font-medium text-gray-700">{((currentPage - 1) * 10) + 1}</span>
                    {' '}to{' '}
                    <span className="font-medium text-gray-700">{Math.min(currentPage * 10, pagination.totalItems)}</span>
                    {' '}of{' '}
                    <span className="font-medium text-gray-700">{pagination.totalItems}</span> results
                </p>
                <div className="flex gap-1">
                    <button
                        onClick={() => setCurrentPage(p => p - 1)}
                        disabled={!pagination.hasPrev}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(p => (
                        <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${currentPage === p
                                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={!pagination.hasNext}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-4">

                {/* Header */}
                <div className="bg-white rounded-xl border border-gray-200 px-6 py-4">
                    <h1 className="text-2xl font-semibold text-gray-900">Advertisements</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage and review all advertisements</p>
                </div>

                

                {/* Summary Cards */}
                {summary?.length === 0 && isLoading ? <SummaryCardSkeleton /> : <SummaryCards data={SummaryData} />}

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 px-6 py-4">
                    <div className="grid grid-cols-12  gap-3">
                        <div className="col-span-6">
                            <SearchInput
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="Search by title, repairman, city..."
                            />
                        </div>
                        <div className='col-span-2'>
                        <CustomDropdown
                            label="Status"
                            options={statusOptions}
                            value={filterStatus}
                            onChange={setFilterStatus}
                            />
                            </div>
                            <div className="col-span-2">
                                <CustomDropdown
                                    label="Type"
                                    options={typeOptions}
                                    value={filterType}
                                    onChange={setFilterType}
                                />
                            </div>
                           
                                <div className='col-span-2'>
                    <button
      onClick={handleClearFilters}
      className="w-full py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition text-sm shadow-sm"
      >
      Clear Filters
    </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {isLoading ? (
                        <TableSkeleton />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            {['Ad', 'Repairman', 'Budget', 'Duration', 'Type', 'Status', 'City', 'Date', 'Actions'].map(h => (
                                                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {ads.map((ad) => {
                                            const profile = ad.user_id?.repairmanProfile;
                                            const dateStr = new Date(ad.createdAt).toLocaleDateString('en-GB', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            });

                                            return (
                                                <tr key={ad._id} className="hover:bg-gray-50 transition-colors">

                                                    {/* Ad image + title */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {ad.image ? (
                                                                <img
                                                                    src={ad.image}
                                                                    alt={ad.title || 'Ad'}
                                                                    className="w-11 h-11 rounded-lg object-cover border border-gray-200 shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-11 h-11 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                                                    <Icon icon="mdi:image-off-outline" className="w-5 h-5 text-gray-400" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 max-w-[140px] truncate">
                                                                    {ad.title || <span className="text-gray-400 italic">No title</span>}
                                                                </p>
                                                                {ad.description && (
                                                                    <p className="text-xs text-gray-500 max-w-[140px] truncate mt-0.5">
                                                                        {ad.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Repairman */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2.5">
                                                            {profile?.profilePhoto ? (
                                                                <img
                                                                    src={profile.profilePhoto}
                                                                    alt={ad.user_id?.name}
                                                                    className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                                    <span className="text-xs font-medium text-blue-700">
                                                                        {ad.user_id?.name?.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 leading-tight">{ad.user_id?.name}</p>
                                                                <p className="text-xs text-gray-500">{profile?.shopName}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Budget */}
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {ad.budget?.currencyCode} {ad.budget?.totalPrice?.toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {ad.budget?.currencyCode} {ad.budget?.perDay}/day
                                                        </p>
                                                    </td>

                                                    {/* Duration */}
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <p className="text-sm font-medium text-gray-900">{ad.duration?.totalDays} days</p>
                                                        <p className="text-xs text-gray-400">
                                                            {new Date(ad.duration?.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                            {' – '}
                                                            {new Date(ad.duration?.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                        </p>
                                                    </td>

                                                    {/* Type */}
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <TypeBadge type={ad.type} />
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <StatusBadge status={ad.status} />
                                                    </td>

                                                    {/* City */}
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        {ad.city ? (
                                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                <Icon icon="mdi:map-marker-outline" className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                                {ad.city.name}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">—</span>
                                                        )}
                                                    </td>

                                                    {/* Date */}
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <span className="text-xs text-gray-500">{dateStr}</span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <Link href={`/repair-man/ads/${ad._id}`}>
                                                            <button className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                                                                <Icon icon="mdi:eye-outline" className="w-3.5 h-3.5" />
                                                                View
                                                            </button>
                                                        </Link>
                                                    </td>

                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {!isLoading && ads.length === 0 && (
                                    <div className="text-center py-16">
                                        <Icon icon="mdi:advertisement-off" className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-gray-600">No advertisements found</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                                                ? 'Try adjusting your filters.'
                                                : 'No advertisements have been created yet.'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {renderPagination()}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Advertisements;