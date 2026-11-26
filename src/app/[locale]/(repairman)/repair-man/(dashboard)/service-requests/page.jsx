'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { Link } from '@/i18n/navigation';
import { TIME_WINDOWS, STATUS, money, fmtDay, fmtDateTime, timeLeft, isoDay } from '@/components/website/serviceRequests/requestUi';

const TABS = [
  { id: 'new', label: 'New' },
  { id: 'accepted', label: 'Waiting for payment' },
  { id: 'booked', label: 'Booked' },
  { id: 'closed', label: 'Closed' },
];

const REPAIRMAN_STATUS = {
  ...STATUS,
  requested: { label: 'New – please answer', cls: 'bg-yellow-100 text-yellow-800' },
  accepted: { label: 'Accepted – customer paying', cls: 'bg-blue-100 text-blue-800' },
};

// Repairman: booking requests for their catalog services (answer within 24h)
export default function ServiceRequestsPage() {
  const { token } = useSelector((state) => state.auth);
  const [tab, setTab] = useState('new');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState(null); // request being accepted
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/service-requests/incoming', {
        params: { status: tab, page, limit: 10 },
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

  const openAccept = (r) => {
    setAnswering(r);
    setForm({
      scheduledDate: new Date(r.preferredDate).toISOString().slice(0, 10),
      timeWindow: r.timeWindow,
      pickupCharge: '',
      dropoffAddress: '',
      note: '',
    });
  };

  const accept = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { scheduledDate: form.scheduledDate, timeWindow: form.timeWindow, note: form.note };
      if (answering.delivery === 'pickup') body.pickupCharge = form.pickupCharge;
      else body.dropoffAddress = form.dropoffAddress;
      const { data } = await axiosInstance.post(`/service-requests/${answering._id}/accept`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(data.message || 'Accepted');
      setAnswering(null);
      load();
    } catch (error) {
      handleError(error);
    } finally {
      setSaving(false);
    }
  };

  const reject = async (r) => {
    const reason = window.prompt('Why can you not take this booking? The customer will see this (e.g. fully booked that day).');
    if (reason === null) return;
    if (reason.trim().length < 3) {
      toast.error('Please write a short reason');
      return;
    }
    try {
      await axiosInstance.post(`/service-requests/${r._id}/reject`, { reason: reason.trim() }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Request declined');
      load();
    } catch (error) {
      handleError(error);
    }
  };

  const input = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
          <p className="text-sm text-gray-600 mt-1">
            Customers booking your catalog services. Answer within 24 hours; after you accept, the customer has 24 hours to pay.
          </p>
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => { setTab(t.id); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${tab === t.id ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'}`}>
              {t.label} <span className="opacity-75">({stats[t.id] || 0})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Icon icon="heroicons:arrow-path" className="w-8 h-8 text-primary-600 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <Icon icon="mdi:calendar-blank" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-900">No requests here</p>
            <p className="text-sm text-gray-500 mt-1">
              Customers can book your approved services from the <Link href="/repair-man/service-catalog" className="text-primary-600 underline">service catalog</Link>.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((r) => {
              const st = REPAIRMAN_STATUS[r.status] || { label: r.status, cls: 'bg-gray-100 text-gray-700' };
              const left = r.status === 'requested' ? timeLeft(r.respondBy) : r.status === 'accepted' ? timeLeft(r.payBy) : null;
              return (
                <li key={r._id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900">{r.service?.title}</h3>
                      <p className="text-sm text-gray-600">{r.service?.brandId?.name} {r.service?.modelId?.name} · {r.customerId?.name || 'Customer'}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">{r.response?.scheduledDate ? 'Agreed time' : 'Customer wants'}</p>
                      <p className="font-medium text-gray-900">
                        {fmtDay(r.response?.scheduledDate || r.preferredDate)}, {TIME_WINDOWS[r.response?.timeWindow || r.timeWindow]}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Delivery</p>
                      <p className="font-medium text-gray-900">{r.delivery === 'pickup' ? 'Pickup' : 'Customer brings it'}</p>
                      {r.delivery === 'pickup' && r.pickupAddress && <p className="text-xs text-gray-600">{r.pickupAddress}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="font-semibold text-gray-900">{money(r.total)}</p>
                      {r.response?.pickupCharge > 0 && <p className="text-xs text-gray-600">incl. pickup {money(r.response.pickupCharge)}</p>}
                    </div>
                  </div>
                  {r.note && <p className="mt-3 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2"><span className="font-medium">Customer: </span>{r.note}</p>}
                  {r.status === 'rejected' && r.response?.rejectionReason && <p className="mt-3 text-sm text-gray-600">You declined: {r.response.rejectionReason}</p>}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {r.status === 'requested' && (
                      <>
                        <button type="button" onClick={() => openAccept(r)} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">Accept</button>
                        <button type="button" onClick={() => reject(r)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">Decline</button>
                      </>
                    )}
                    {r.status === 'booked' && r.bookingId && (
                      <Link href={`/repair-man/my-jobs/${r.bookingId}/detail`} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">Open job</Link>
                    )}
                    {left && (
                      <span className={`text-xs ${r.status === 'requested' ? 'text-red-700 font-medium' : 'text-gray-500'}`}>
                        {r.status === 'requested' ? `Answer by ${fmtDateTime(r.respondBy)} (${left})` : `Customer pays by ${fmtDateTime(r.payBy)} (${left})`}
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

      {/* Accept form */}
      {answering && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <form onSubmit={accept} className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Accept booking</h2>
              <p className="text-sm text-gray-600">{answering.service?.title} · {money(answering.service?.pricing?.total)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="block text-gray-700 mb-1">Day</span>
                <input type="date" min={isoDay(0)} max={isoDay(60)} required value={form.scheduledDate}
                  onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} className={input} />
              </label>
              <label className="text-sm">
                <span className="block text-gray-700 mb-1">Time</span>
                <select value={form.timeWindow} onChange={(e) => setForm({ ...form, timeWindow: e.target.value })} className={input}>
                  {Object.entries(TIME_WINDOWS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
            </div>
            <p className="text-xs text-gray-500 -mt-2">
              The customer asked for {fmtDay(answering.preferredDate)}, {TIME_WINDOWS[answering.timeWindow]}. Change it if you cannot make it.
            </p>
            {answering.delivery === 'pickup' ? (
              <label className="text-sm block">
                <span className="block text-gray-700 mb-1">Pickup charge (₺) <span className="text-red-500">*</span></span>
                <input type="number" min="0" max="10000" step="1" required value={form.pickupCharge}
                  onChange={(e) => setForm({ ...form, pickupCharge: e.target.value })} className={input} placeholder="0 if free" />
                <span className="block text-xs text-gray-500 mt-1">Pickup from: {answering.pickupAddress}</span>
              </label>
            ) : (
              <label className="text-sm block">
                <span className="block text-gray-700 mb-1">Where the customer brings the device <span className="text-red-500">*</span></span>
                <input type="text" required minLength={5} maxLength={300} value={form.dropoffAddress}
                  onChange={(e) => setForm({ ...form, dropoffAddress: e.target.value })} className={input} placeholder="Shop address" />
              </label>
            )}
            <label className="text-sm block">
              <span className="block text-gray-700 mb-1">Message to the customer (optional)</span>
              <textarea rows={2} maxLength={500} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={`${input} resize-none`} />
            </label>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setAnswering(null)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                {saving ? 'Accepting...' : 'Accept'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
