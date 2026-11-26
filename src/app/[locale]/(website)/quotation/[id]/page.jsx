'use client'

// Full quotation page (opened from the quotation card in the chat).
// Customer: Accept & Pay / Reject while it is open. Everyone involved: details + print.
import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { Icon } from '@iconify/react'
import { toast } from 'react-toastify'
import axiosInstance from '@/config/axiosInstance'
import handleError from '@/helper/handleError'
import { Link, useRouter } from '@/i18n/navigation'
import { toQuotationView, money, timeLeft, fmtDateTime } from '@/components/chat/quotationView'

function Row({ label, value, strong }) {
  return (
    <div className={`flex justify-between gap-4 py-1.5 ${strong ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
      <span className={strong ? '' : 'text-gray-500'}>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

export default function QuotationPage() {
  const { id } = useParams()
  const router = useRouter()
  const { token, user } = useSelector((state) => state.auth)
  const [raw, setRaw] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState('')
  const [rejecting, setRejecting] = useState(false)

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return }
    try {
      setLoading(true)
      const { data } = await axiosInstance.get(`/chat/quotation/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      setRaw(data?.data?.quotation || null)
      setNotFound(!data?.data?.quotation)
    } catch (error) {
      if (error?.response?.status === 404 || error?.response?.status === 403) setNotFound(true)
      else handleError(error)
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => { load() }, [load])

  const reject = async () => {
    try {
      setRejecting(true)
      await axiosInstance.post(
        `/chat/quotation/${id}/respond`,
        { action: 'rejected', customerResponse: reason.trim().slice(0, 200) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Quotation rejected')
      setShowReject(false)
      load()
    } catch (error) {
      handleError(error)
    } finally {
      setRejecting(false)
    }
  }

  if (!token) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-2xl border text-center">
        <Icon icon="mdi:lock-outline" className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-700 mb-4">Please log in to see this quotation.</p>
        <Link href="/auth/login" className="inline-block px-5 py-2 bg-primary-600 text-white rounded-lg font-semibold">Log in</Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500 gap-3">
        <span className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-primary-600" /> Loading quotation…
      </div>
    )
  }

  if (notFound || !raw) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-2xl border text-center">
        <Icon icon="mdi:file-hidden" className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-800 font-semibold mb-1">Quotation not found</p>
        <p className="text-gray-500 text-sm mb-4">It may have been withdrawn, or it belongs to another account.</p>
        <button onClick={() => router.back()} className="px-5 py-2 border rounded-lg text-sm">Go back</button>
      </div>
    )
  }

  const q = toQuotationView(raw)
  const isCustomer = user?.role === 'customer'
  const left = q.isOpen ? timeLeft(q.validUntil) : null
  const repairmanName = raw.repairmanId?.repairmanProfile?.shopName || raw.repairmanId?.name
  const shortId = String(raw._id).slice(-6).toUpperCase()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 print:py-0">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <Icon icon="mdi:arrow-left" className="w-5 h-5" /> Back
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-1 text-sm px-3 py-1.5 border rounded-lg hover:bg-gray-50">
          <Icon icon="mdi:printer" className="w-4 h-4" /> Print / PDF
        </button>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b bg-gray-50 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Repair quotation</p>
            <h1 className="text-xl font-bold text-gray-900">#QUO-{shortId}</h1>
            <p className="text-sm text-gray-600 mt-1">
              From <span className="font-semibold">{repairmanName || 'Repairman'}</span>
              {raw.customerId?.name && <> to <span className="font-semibold">{raw.customerId.name}</span></>}
            </p>
            {q.sentAt && <p className="text-xs text-gray-500 mt-0.5">Sent {fmtDateTime(q.sentAt)}{q.version > 1 ? ` · updated (version ${q.version})` : ''}</p>}
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${q.statusMeta.className}`}>
              <Icon icon={q.statusMeta.icon} width={14} /> {q.statusMeta.label}
            </span>
            {left && <p className="text-xs text-gray-500 mt-1">{left} · valid until {fmtDateTime(q.validUntil)}</p>}
            {!left && q.validUntil && q.status === 'expired' && <p className="text-xs text-gray-500 mt-1">Expired {fmtDateTime(q.validUntil)}</p>}
          </div>
        </div>

        <div className="p-6 grid gap-6 md:grid-cols-2">
          {/* Device & work */}
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Device</p>
              <p className="font-semibold text-gray-900">{`${q.brandName} ${q.modelName}`.trim() || '—'}</p>
            </div>
            {q.services.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Repair services</p>
                <div className="flex flex-wrap gap-1.5">
                  {q.services.map((s) => <span key={s} className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full border border-primary-100">{s}</span>)}
                </div>
              </div>
            )}
            {q.description && (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{q.description}</p>
              </div>
            )}
            {q.parts.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Parts included {q.partsQuality && <span className="normal-case">({q.partsQuality.replace(/-/g, ' ')})</span>}</p>
                <ul className="text-sm text-gray-700 list-disc ml-5">{q.parts.map((p, i) => <li key={`${p.name}-${i}`}>{p.name}</li>)}</ul>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {q.estimatedDuration && <div><p className="text-gray-500 text-xs">Repair time</p><p className="font-medium">{q.estimatedDuration}{/^\d+$/.test(q.estimatedDuration) ? ' days' : ''}</p></div>}
              {q.warranty && <div><p className="text-gray-500 text-xs">Warranty</p><p className="font-medium">{q.warranty}{/^\d+$/.test(String(q.warranty)) ? ' days' : ''}</p></div>}
              <div><p className="text-gray-500 text-xs">Service</p><p className="font-medium">{q.pickupAvailable ? 'Pickup or drop-off' : 'Drop-off'}</p></div>
            </div>
            {q.dropoffAddress && (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Drop-off address</p>
                <p className="text-sm text-gray-700 flex items-start gap-1"><Icon icon="mdi:map-marker" className="w-4 h-4 mt-0.5 text-primary-600 shrink-0" />{q.dropoffAddress}</p>
              </div>
            )}
            {q.notes && (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Notes from the repairman</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{q.notes}</p>
              </div>
            )}
          </div>

          {/* Price */}
          <div>
            <div className="bg-gray-50 rounded-xl p-4 text-sm">
              <Row label="Repair service" value={money(q.basePrice, q.currency)} />
              {q.partsPrice > 0 && <Row label="Parts" value={money(q.partsPrice, q.currency)} />}
              <div className="border-t my-1" />
              <Row label="Total" value={<span className="text-green-700 text-lg">{money(q.subtotal, q.currency)}</span>} strong />
              {q.pickupAvailable && q.pickupCharge > 0 && (
                <>
                  <Row label="Pickup (optional)" value={`+${money(q.pickupCharge, q.currency)}`} />
                  <Row label="Total with pickup" value={money(q.totalWithPickup, q.currency)} />
                </>
              )}
            </div>

            {/* Actions */}
            {isCustomer && q.isOpen && (
              <div className="mt-4 space-y-2 print:hidden">
                {!showReject ? (
                  <>
                    <Link href={`/payment?quotationId=${q.id}`} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold">
                      <Icon icon="mdi:check" className="w-5 h-5" /> Accept & Pay
                    </Link>
                    <button onClick={() => setShowReject(true)} className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm">
                      Reject quotation
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} rows={3}
                      placeholder="Reason (optional), e.g. price too high"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
                    <div className="flex gap-2">
                      <button onClick={() => setShowReject(false)} className="flex-1 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                      <button onClick={reject} disabled={rejecting} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-60">
                        {rejecting ? 'Rejecting…' : 'Reject'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {q.status === 'accepted' && (
              <p className="mt-4 text-sm font-medium text-green-700 bg-green-50 rounded-lg px-3 py-2 flex items-center gap-1">
                <Icon icon="mdi:check-circle" className="w-4 h-4" /> Accepted and paid{q.respondedAt ? ` on ${fmtDateTime(q.respondedAt)}` : ''}
              </p>
            )}
            {q.status === 'rejected' && (
              <p className="mt-4 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">Rejected{q.customerResponse ? `: "${q.customerResponse}"` : ''}</p>
            )}
            {q.status === 'replaced' && <p className="mt-4 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">A newer quotation was sent in the chat. Please use that one.</p>}
            {q.status === 'expired' && <p className="mt-4 text-sm text-gray-600 bg-gray-100 rounded-lg px-3 py-2">This quotation has expired.</p>}
            {q.status === 'deleted' && <p className="mt-4 text-sm text-gray-600 bg-gray-100 rounded-lg px-3 py-2">The repairman withdrew this quotation.</p>}
            {user?.role === 'repairman' && q.isOpen && (
              <p className="mt-4 text-xs text-gray-500 print:hidden">You can edit or withdraw it from the chat.</p>
            )}
          </div>
        </div>

        {/* Edit history: what was offered before each change */}
        {Array.isArray(raw.revisions) && raw.revisions.length > 0 && (
          <div className="px-6 pb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
              <Icon icon="mdi:history" className="w-4 h-4" /> Edit history
            </h2>
            <ol className="border rounded-xl divide-y text-sm">
              <li className="px-4 py-2.5 flex flex-wrap justify-between gap-2 bg-green-50/50">
                <span className="font-medium text-gray-900">Version {q.version} <span className="text-xs font-normal text-green-700">(current)</span></span>
                <span className="font-semibold">{money(q.subtotal, q.currency)}</span>
              </li>
              {[...raw.revisions].reverse().map((r) => {
                const total = Number(r.pricing?.totalAmount) || (Number(r.pricing?.basePrice) || 0) + (Number(r.pricing?.partsPrice) || 0)
                const services = (r.repairServices || []).map((s) => (typeof s === 'object' ? s.name : '')).filter(Boolean)
                return (
                  <li key={r.version} className="px-4 py-2.5">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="text-gray-700">Version {r.version}</span>
                      <span className="text-gray-500 line-through decoration-gray-300">{money(total, r.pricing?.currency || q.currency)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Changed {fmtDateTime(r.replacedAt)}
                      {services.length > 0 && ` · ${services.join(', ')}`}
                      {r.estimatedDuration && ` · ${r.estimatedDuration}${/^\d+$/.test(r.estimatedDuration) ? ' days' : ''}`}
                    </p>
                  </li>
                )
              })}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
