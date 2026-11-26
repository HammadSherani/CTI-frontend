"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { Link, useRouter } from '@/i18n/navigation';

const TABS = [
  { id: '', label: 'All' },
  { id: 'approved', label: 'Approved' },
  { id: 'pending', label: 'Waiting for review' },
  { id: 'rejected', label: 'Not approved' },
];

const STATUS_STYLE = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
};
const STATUS_LABEL = { approved: 'Approved', pending: 'Waiting for review', rejected: 'Not approved' };

const money = (amount, currency = 'TRY') =>
  `${currency === 'TRY' ? '₺' : currency + ' '}${Number(amount || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

export default function ServiceCatalogPage() {
  const { token } = useSelector((state) => state.auth);
  const router = useRouter();
  const [tab, setTab] = useState('');
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  // Search waits until typing stops
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/repairman/services', {
        params: { status: tab || undefined, search: search || undefined, page, limit: 12 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(data.data || []);
      setStats(data.stats || { all: 0, pending: 0, approved: 0, rejected: 0 });
      setPages(data.pagination?.pages || 1);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [token, tab, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const changeTab = (id) => {
    setTab(id);
    setPage(1);
  };

  const remove = async (service) => {
    if (!window.confirm(`Delete "${service.title}"? This cannot be undone.`)) return;
    setBusyId(service._id);
    try {
      const { data } = await axiosInstance.delete(`/repairman/services/${service._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(data.message || 'Service deleted');
      // last item on a page: go back one page
      if (services.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (error) {
      handleError(error);
    } finally {
      setBusyId(null);
    }
  };

  const toggle = async (service) => {
    setBusyId(service._id);
    try {
      const { data } = await axiosInstance.patch(`/repairman/services/${service._id}/toggle-status`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(data.message);
      setServices((prev) => prev.map((s) => (s._id === service._id ? { ...s, isActive: data.data?.isActive } : s)));
    } catch (error) {
      handleError(error);
    } finally {
      setBusyId(null);
    }
  };

  const edit = (service) => {
    if (service.status === 'approved'
      && !window.confirm('After you save changes, this service is hidden from customers until an admin approves it again. Continue?')) {
      return;
    }
    router.push(`/repair-man/service-catalog/${service._id}/edit`);
  };

  const countFor = (id) => (id ? stats[id] : stats.all) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Catalog</h1>
            <p className="text-gray-600 mt-1">
              Your repair services with fixed prices. Customers see a service after an admin approves it.
            </p>
          </div>
          <Link
            href="/repair-man/service-catalog/add"
            className="bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 flex items-center gap-2 shadow-sm"
          >
            <Icon icon="heroicons:plus" className="w-5 h-5" />
            Add New Service
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search your services..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
          />
          <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          {searchText && (
            <button type="button" onClick={() => setSearchText('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Clear search">
              <Icon icon="heroicons:x-mark" className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id || 'all'}
              type="button"
              onClick={() => changeTab(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.id ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {t.label} <span className="opacity-75">({countFor(t.id)})</span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Icon icon="heroicons:arrow-path" className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <Icon icon="heroicons:wrench-screwdriver" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-900">{search ? 'No service matches your search' : 'No services here yet'}</p>
            {!search && !tab && (
              <Link href="/repair-man/service-catalog/add" className="inline-block mt-4 bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700">
                Add your first service
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => (
              <div key={s._id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{s.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_STYLE[s.status] || 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABEL[s.status] || s.status}
                  </span>
                </div>
                {s.status === 'approved' && !s.isActive && (
                  <span className="self-start mb-2 px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-medium">Hidden from customers</span>
                )}
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{s.description}</p>
                <div className="text-sm text-gray-600 space-y-1 mb-3">
                  <p className="flex items-center gap-1.5">
                    <Icon icon="heroicons:device-phone-mobile" className="w-4 h-4" />
                    {s.deviceInfo?.brandId?.name} {s.deviceInfo?.modelId?.name}
                  </p>
                  {s.city && (
                    <p className="flex items-center gap-1.5">
                      <Icon icon="heroicons:map-pin" className="w-4 h-4" />
                      {s.city}
                    </p>
                  )}
                </div>
                <div className="mb-3">
                  <p className="text-xl font-bold text-gray-900">{money(s.pricing?.total, s.pricing?.currency)}</p>
                  <p className="text-xs text-gray-500">
                    Service {money(s.pricing?.basePrice)} · Parts {money(s.pricing?.partsPrice)}
                    {s.pricing?.serviceCharges > 0 && ` · Charges ${money(s.pricing.serviceCharges)}`}
                  </p>
                </div>
                {s.status === 'rejected' && s.rejectionReason && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    <span className="font-semibold">Why: </span>{s.rejectionReason}. Edit the service to send it again.
                  </div>
                )}
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <button type="button" onClick={() => edit(s)} disabled={busyId === s._id}
                    className="flex-1 min-w-[80px] bg-primary-600 text-white py-2 px-3 rounded-lg hover:bg-primary-700 text-sm disabled:opacity-50">
                    Edit
                  </button>
                  <Link href={`/repair-man/service-catalog/${s._id}/view`}
                    className="flex-1 min-w-[80px] text-center border border-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 text-sm">
                    View
                  </Link>
                  {s.status === 'approved' && (
                    <button type="button" onClick={() => toggle(s)} disabled={busyId === s._id}
                      className="flex-1 min-w-[80px] border border-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50">
                      {s.isActive ? 'Hide' : 'Show'}
                    </button>
                  )}
                  <button type="button" onClick={() => remove(s)} disabled={busyId === s._id} aria-label="Delete service"
                    className="border border-red-300 text-red-700 py-2 px-3 rounded-lg hover:bg-red-50 text-sm disabled:opacity-50">
                    <Icon icon="heroicons:trash" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pages */}
        {!loading && pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6 text-sm">
            <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="px-4 py-2 border rounded-lg bg-white disabled:opacity-50">Previous</button>
            <span className="text-gray-600">Page {page} of {pages}</span>
            <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= pages} className="px-4 py-2 border rounded-lg bg-white disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
