'use client'

// Admin only: the customer <-> repairman chat behind a dispute, as evidence.
// Shows everything, including messages users deleted:
//  - "Deleted for everyone": users see "This message was deleted"; here the original is shown
//  - "Delete for me": hidden only on that user's side; here it is shown with who hid it
import React, { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import axiosInstance from '@/config/axiosInstance'
import handleError from '@/helper/handleError'

const fmtDateTime = (d) => d ? new Date(d).toLocaleString([], { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|heic|avif)(\?|$)/i
const VIDEO_EXT = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i

function Media({ m }) {
  if (!m?.mediaUrl) return null
  const url = m.mediaUrl
  if (m.messageType === 'voice') {
    return <audio src={url} controls preload="none" className="w-60 max-w-full mb-1" />
  }
  if (m.messageType === 'video' || VIDEO_EXT.test(m.fileName || url)) {
    return <video src={url} controls preload="none" className="w-60 max-w-full rounded mb-1 bg-black" />
  }
  if (m.messageType === 'image' || m.messageType === 'mixed' || IMAGE_EXT.test(m.fileName || url)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mb-1">
        <img src={m.thumbnailUrl || url} alt="" loading="lazy" className="max-w-[240px] max-h-60 rounded object-cover" />
      </a>
    )
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm underline mb-1">
      <Icon icon="mdi:paperclip" className="w-4 h-4" /> {m.fileName || 'File'}
    </a>
  )
}

export default function ChatEvidence({ disputeId, chatId, token }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [onlyDeleted, setOnlyDeleted] = useState(false)
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!disputeId && !chatId) return
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const url = disputeId ? `/chat/admin/dispute/${disputeId}/evidence` : `/chat/admin/${chatId}/evidence`
        const { data: res } = await axiosInstance.get(url, { headers: { Authorization: `Bearer ${token}` } })
        if (active) setData(res)
      } catch (error) {
        if (active) handleError(error)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [disputeId, chatId, token])

  const users = data?.users || {}
  const nameOf = (id) => users[String(id?._id || id)]?.name || 'Unknown'
  const roleOf = (id) => users[String(id?._id || id)]?.role || ''

  const counts = useMemo(() => {
    const msgs = data?.messages || []
    return {
      total: msgs.length,
      deletedForEveryone: msgs.filter((m) => m.deletedForEveryone).length,
      hidden: msgs.filter((m) => m.hiddenBy?.length).length,
      masked: msgs.filter((m) => m.contactMasked).length,
    }
  }, [data])

  const visible = useMemo(() => {
    let msgs = data?.messages || []
    if (onlyDeleted) msgs = msgs.filter((m) => m.deletedForEveryone || m.hiddenBy?.length)
    const term = q.trim().toLowerCase()
    if (term) msgs = msgs.filter((m) => `${m.content || ''} ${m.deletedOriginal?.content || ''}`.toLowerCase().includes(term))
    return msgs
  }, [data, onlyDeleted, q])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500 gap-3">
        <span className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-primary-600" />
        Loading chat…
      </div>
    )
  }

  if (!data?.messages?.length) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Icon icon="heroicons:chat-bubble-left-right" className="w-12 h-12 mx-auto mb-3 opacity-40" />
        No chat found between these two users.
      </div>
    )
  }

  let lastDay = null

  return (
    <div className="space-y-4">
      {/* Summary + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">{counts.total} messages</span>
        {counts.deletedForEveryone > 0 && (
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">{counts.deletedForEveryone} deleted for everyone</span>
        )}
        {counts.hidden > 0 && (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">{counts.hidden} hidden by a user</span>
        )}
        {counts.masked > 0 && (
          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">{counts.masked} with contact info hidden</span>
        )}
        <div className="flex-1" />
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={onlyDeleted} onChange={(e) => setOnlyDeleted(e.target.checked)} className="rounded" />
          Only deleted / hidden
        </label>
        <div className="relative">
          <Icon icon="mdi:magnify" className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search text…" className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      <p className="text-xs text-gray-500 flex items-center gap-1">
        <Icon icon="mdi:shield-account" className="w-4 h-4" />
        Admin view. Users do not see deleted content; it is kept here only as evidence.
        {data.truncated && ' Showing the first 3000 messages.'}
      </p>

      {/* Conversation */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 max-h-[640px] overflow-y-auto">
        {visible.length === 0 && <p className="text-center text-sm text-gray-500 py-8">No messages match.</p>}
        {visible.map((m) => {
          const day = new Date(m.timestamp).toDateString()
          const divider = day !== lastDay
          lastDay = day
          const isRepairmanSide = m.senderType === 'repairman'
          const original = m.deletedOriginal
          const shown = m.deletedForEveryone ? (original || {}) : m
          return (
            <React.Fragment key={m._id}>
              {divider && (
                <div className="flex justify-center my-3">
                  <span className="text-[11px] text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-0.5">
                    {new Date(m.timestamp).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
              <div className={`flex mb-3 ${isRepairmanSide ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg p-3 border ${m.deletedForEveryone
                  ? 'bg-red-50 border-red-300'
                  : m.hiddenBy?.length
                    ? 'bg-amber-50 border-amber-300'
                    : isRepairmanSide ? 'bg-primary-50 border-primary-100' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-xs font-semibold text-gray-800">
                      {nameOf(m.senderId)} <span className="font-normal text-gray-500 capitalize">({roleOf(m.senderId) || m.senderType})</span>
                    </span>
                    <span className="text-[11px] text-gray-400">{fmtTime(m.timestamp)}</span>
                  </div>

                  {m.deletedForEveryone && (
                    <p className="text-[11px] font-semibold text-red-700 mb-1 flex items-center gap-1">
                      <Icon icon="mdi:delete-alert" className="w-4 h-4" />
                      Deleted for everyone {m.deletedAt ? `on ${fmtDateTime(m.deletedAt)}` : ''}{original ? ' · original below' : ' · original not kept (deleted before evidence was saved)'}
                    </p>
                  )}
                  {m.hiddenBy?.length > 0 && (
                    <p className="text-[11px] font-semibold text-amber-800 mb-1 flex items-center gap-1">
                      <Icon icon="mdi:eye-off" className="w-4 h-4" />
                      Hidden by {m.hiddenBy.map((id) => nameOf(id)).join(', ')} (delete for me)
                    </p>
                  )}

                  {shown.replyTo?.content && (
                    <div className="text-xs text-gray-600 border-l-4 border-gray-300 bg-white/70 px-2 py-1 mb-1 rounded">
                      Reply to: {shown.replyTo.content}
                    </div>
                  )}
                  <Media m={shown} />
                  {m.messageType === 'quotation' && !shown.content && (
                    <p className="text-sm text-gray-700 italic">Quotation sent</p>
                  )}
                  {shown.content && (
                    <p className={`text-sm whitespace-pre-wrap break-words ${m.deletedForEveryone ? 'text-red-900' : 'text-gray-800'}`}>{shown.content}</p>
                  )}
                  {(shown.contactMasked || m.contactMasked) && (
                    <p className="text-[11px] text-purple-700 mt-1">Contact details were hidden by the system</p>
                  )}
                  {!m.deletedForEveryone && (
                    <p className="text-[10px] text-gray-400 mt-1 text-right">
                      {m.isRead ? `Seen ${fmtDateTime(m.readAt)}` : m.deliveredAt ? 'Delivered' : 'Sent'}
                    </p>
                  )}
                </div>
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
