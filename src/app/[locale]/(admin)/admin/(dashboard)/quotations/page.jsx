'use client'

// Admin: every repair quotation, with status tabs (counts), search, date filter and paging.
import React, { useCallback, useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { useSelector } from 'react-redux'
import axiosInstance from '@/config/axiosInstance'
import handleError from '@/helper/handleError'
import { STATUS_META, money, fmtDateTime } from '@/components/chat/quotationView'

const TABS = [
  { id: '', label: 'All' },
  { id: 'sent', label: 'Sent' },
  { id: 'viewed', label: 'Seen' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'expired', label: 'Expired' },
  { id: 'replaced', label: 'Replaced' },
  { id: 'deleted', label: 'Withdrawn' },
]

export default function AdminQuotationsPage() {
  const { token } = useSelector((state) => state.auth)
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ quotations: [], counts: {}, pagination: { pages: 1, total: 0 } })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 400)
    return () => clearTimeout(t)
  }, [q])
  useEffect(() => { setPage(1) }, [status, debouncedQ, from, to])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const params = { page, limit: 20 }
      if (status) params.status = status
      if (debouncedQ) params.q = debouncedQ
      if (from) params.from = from
      if (to) params.to = to
      const { data: res } = await axiosInstance.get('/chat/admin/quotations', { params, headers: { Authorization: `Bearer ${token}` } })
      setData(res.data)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [page, status, debouncedQ, from, to, token])

  useEffect(() => { load() }, [load])

  const counts = data.counts || {}
  const allCount = Object.entries(counts).filter(([k]) => k !== 'deleted').reduce((s, [, n]) => s + n, 0)

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
        <p className="text-sm text-gray-500">Repair quotations repairmen sent to customers in chat.</p>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const n = t.id === '' ? allCount : (counts[t.id] || 0)
          return (
            <button
              key={t.id || 'all'}
              onClick={() => setStatus(t.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${status === t.id ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
            >
              {t.label} <span className="opacity-70">({n})</span>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 bg-white border rounded-xl p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Icon icon="mdi:magnify" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Customer, shop name or email…"
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <label className="text-xs text-gray-500">From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="block mt-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
        </label>
        <label className="text-xs text-gray-500">To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="block mt-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
        </label>
        {(q || from || to) && (
          <button onClick={() => { setQ(''); setFrom(''); setTo('') }} className="text-sm text-gray-500 hover:text-gray-800 px-2 py-2">Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Sent</th>
              <th className="text-left px-4 py-3">Repairman</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Device</th>
              <th className="text-right px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">Loading…</td></tr>
            )}
            {!loading && data.quotations.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">No quotations found.</td></tr>
            )}
            {!loading && data.quotations.map((item) => {
              const st = item.isDeleted ? 'deleted' : item.status
              const meta = STATUS_META[st] || STATUS_META.sent
              const device = `${item.deviceInfo?.brand?.name || ''} ${item.deviceInfo?.model?.name || ''}`.trim() || '—'
              return (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{fmtDateTime(item.createdAt)}</td>
                  <td className="px-4 py-3">{item.repairmanId?.repairmanProfile?.shopName || item.repairmanId?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <p>{item.customerId?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{item.customerId?.email}</p>
                  </td>
                  <td className="px-4 py-3">{device}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap font-medium">
                    {money(item.pricing?.totalAmount, item.pricing?.currency || 'TRY')}
                    {item.revisionsCount > 0 && <p className="text-[11px] text-gray-400 font-normal">edited {item.revisionsCount}×</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${meta.className}`}>
                      <Icon icon={meta.icon} width={13} /> {meta.label}
                    </span>
                    {item.status === 'rejected' && item.customerResponse && (
                      <p className="text-[11px] text-gray-500 mt-1 max-w-[180px] truncate" title={item.customerResponse}>“{item.customerResponse}”</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a href={`/quotation/${item._id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary-600 hover:underline text-sm">
                      View <Icon icon="mdi:open-in-new" width={14} />
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Paging */}
      {data.pagination?.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{data.pagination.total} quotations</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-40">Previous</button>
            <span>Page {page} of {data.pagination.pages}</span>
            <button disabled={page >= data.pagination.pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
