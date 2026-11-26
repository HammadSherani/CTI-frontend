'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { Link } from '@/i18n/navigation';
import { TIME_WINDOWS, STATUS, money, fmtDay, fmtDateTime, timeLeft } from '@/components/website/serviceRequests/requestUi';

const TABS = [
  { id: 'open', label: 'Open' },
  { id: 'booked', label: 'Booked' },
  { id: 'closed', label: 'Closed' },
  { id: '', label: 'All' },
];

// Customer: booking requests sent from the service catalog
export default function MyServiceRequestsPage() {
  const { token } = useSelector((state) => state.auth);
  const [tab, setTab] = useState('open');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/service-requests/mine', {
        params: { status: tab || undefined, page, limit: 10 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(data.data || []);
      setStats(data.stats || {});
      setPages(data.pagination?.pages || 1);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [token, tab, page]);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (r) => {
    if (!window.confirm(`Cancel your booking request for "${r.service?.title}"?`)) return;
    setBusy(r._id);
    try {
      await axiosInstance.post(`/service-requests/${r._id}/cancel`, null, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Request cancelled');
      load();
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(null);
    }
  };

  const count = (id) => (id ? stats[id] : Object.values(stats).length ? (stats.open || 0) + (stats.booked || 0) + (stats.closed || 0) : 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-5xl mx-auto">
        <Link href="/my-account" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-3">
          <Icon icon="heroicons:arrow-left" className="w-4 h-4" /> My repair jobs
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Bookings</h1>
            <p className="text-sm text-gray-600 mt-1">Fixed-price services you booked from the catalog.</p>
          </div>
          <Link href="/service-catalog" className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
            Browse services
          </Link>
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.id || 'all'} type="button" onClick={() => { setTab(t.id); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${tab === t.id ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'}`}>
              {t.label} <span className="opacity-75">({count(t.id)})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Icon icon="heroicons:arrow-path" className="w-8 h-8 text-primary-600 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <Icon icon="mdi:calendar-blank" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-900">Nothing here</p>
            <p className="text-sm text-gray-500 mt-1">Book a fixed-price repair from the service catalog.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((r) => {
              const st = STATUS[r.status] || { label: r.status, cls: 'bg-gray-100 text-gray-700' };
              const rp = r.repairmanId?.repairmanProfile || {};
              const day = r.response?.scheduledDate || r.preferredDate;
              const win = r.response?.timeWindow || r.timeWindow;
              const left = r.status === 'accepted' ? timeLeft(r.payBy) : r.status === 'requested' ? timeLeft(r.respondBy) : null;
              return (
                <li key={r._id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900">{r.service?.title}</h3>
                      <p className="text-sm text-gray-600">{r.service?.brandId?.name} {r.service?.modelId?.name} · {rp.shopName || r.repairmanId?.name}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">{r.response?.scheduledDate ? 'Confirmed time' : 'Requested time'}</p>
                      <p className="font-medium text-gray-900">{fmtDay(day)}, {TIME_WINDOWS[win]}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Delivery</p>
                      <p className="font-medium text-gray-900">
                        {r.delivery === 'pickup' ? 'Pickup from your address' : 'You bring the device'}
                      </p>
                      {r.delivery === 'drop-off' && r.response?.dropoffAddress && <p className="text-xs text-gray-600">{r.response.dropoffAddress}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-semibold text-gray-900">{money(r.total)}</p>
                      {r.response?.pickupCharge > 0 && <p className="text-xs text-gray-600">incl. pickup {money(r.response.pickupCharge)}</p>}
                    </div>
                  </div>

                  {r.response?.note && <p className="mt-3 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2"><span className="font-medium">Repairman: </span>{r.response.note}</p>}
                  {r.status === 'rejected' && r.response?.rejectionReason && (
                    <p className="mt-3 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">Reason: {r.response.rejectionReason}</p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {r.status === 'accepted' && r.quotationId && (
                      <Link href={`/payment?quotationId=${r.quotationId}`} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
                        Pay {money(r.total)} to confirm
                      </Link>
                    )}
                    {r.status === 'booked' && r.bookingId && (
                      <Link href={`/my-account/${r.bookingId}/job-details`} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
                        View booking
                      </Link>
                    )}
                    {['requested', 'accepted'].includes(r.status) && (
                      <button type="button" onClick={() => cancel(r)} disabled={busy === r._id}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50">
                        Cancel request
                      </button>
                    )}
                    {left && (
                      <span className="text-xs text-gray-500">
                        {r.status === 'accepted' ? `Pay by ${fmtDateTime(r.payBy)} (${left})` : `Repairman answers by ${fmtDateTime(r.respondBy)} (${left})`}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

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
