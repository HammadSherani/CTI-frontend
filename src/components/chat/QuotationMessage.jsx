"use client"

// Quotation card inside the chat.
// Customer (open quote): Accept & Pay / Reject. Repairman (open quote): Edit / Withdraw.
// Status, validity countdown and price update live (socket "quotation_updated").
import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { Link } from '@/i18n/navigation';
import { useChat } from '@/hooks/useChat';
import QuotationForm from './QuotationForm';
import { toast } from 'react-toastify';
import { toQuotationView, money, timeLeft, fmtDateTime } from './quotationView';

const QuotationMessage = ({ message, isOwner, chatId, onQuotationUpdate }) => {
    const { token, user } = useSelector((state) => state.auth);
    const { closeChat } = useChat();
    const [rejecting, setRejecting] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [, setTick] = useState(0);

    const quotationData = message.quotationData || {};
    const q = useMemo(() => toQuotationView(quotationData), [quotationData]);

    // keep the "time left" fresh
    useEffect(() => {
        if (!q.isOpen || !q.validUntil) return undefined;
        const t = setInterval(() => setTick((n) => n + 1), 60 * 1000);
        return () => clearInterval(t);
    }, [q.isOpen, q.validUntil]);

    const isCustomer = user?.role === 'customer' && !isOwner;
    const isRepairmanOwner = user?.role === 'repairman' && isOwner;
    const left = q.isOpen ? timeLeft(q.validUntil) : null;

    const reject = async () => {
        try {
            setRejecting(true);
            await axiosInstance.post(
                `/chat/quotation/${q.id}/respond`,
                { action: 'rejected', customerResponse: rejectReason.trim().slice(0, 200) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Quotation rejected');
            setShowReject(false);
            onQuotationUpdate?.();
        } catch (error) {
            handleError(error);
        } finally {
            setRejecting(false);
        }
    };

    const withdraw = async () => {
        if (!confirm('Withdraw this quotation? The customer will no longer be able to accept it.')) return;
        try {
            setDeleting(true);
            await axiosInstance.delete(`/chat/delete-single-quotation/${q.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Quotation withdrawn');
            onQuotationUpdate?.();
        } catch (err) {
            handleError(err);
        } finally {
            setDeleting(false);
        }
    };

    const muted = !q.isOpen && q.status !== 'accepted';

    return (
        <div className={`flex ${isOwner ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`w-[300px] max-w-full bg-white border rounded-xl shadow-sm overflow-hidden ${muted ? 'opacity-80' : ''}`}>
                {/* Header */}
                <div className={`px-3 py-2.5 border-b flex items-center justify-between gap-2 ${isOwner ? 'bg-primary-50' : 'bg-green-50'}`}>
                    <div className="flex items-center gap-2 min-w-0">
                        <Icon icon="mdi:receipt-text-outline" width={20} className="text-gray-600 shrink-0" />
                        <span className="font-semibold text-gray-800 text-sm truncate">
                            {isOwner ? 'Quotation sent' : 'Quotation'}
                            {q.version > 1 && <span className="ml-1 text-[11px] font-normal text-gray-500">(updated)</span>}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {isRepairmanOwner && q.isOpen && (
                            <>
                                <button onClick={() => setShowEditModal(true)} className="p-1 hover:bg-white rounded" title="Edit quotation">
                                    <Icon icon="mdi:pencil" width={16} />
                                </button>
                                <button onClick={withdraw} disabled={deleting} className="p-1 hover:bg-white rounded" title="Withdraw quotation">
                                    {deleting
                                        ? <span className="block animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
                                        : <Icon icon="mdi:trash-can-outline" width={16} />}
                                </button>
                            </>
                        )}
                        {q.id && (
                            <Link href={`/quotation/${q.id}`} onClick={() => closeChat()} className="p-1 hover:bg-white rounded" title="Open full quotation">
                                <Icon icon="mdi:open-in-new" width={16} />
                            </Link>
                        )}
                    </div>
                </div>

                <div className="p-3 space-y-3">
                    {/* Status + time left */}
                    <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${q.statusMeta.className}`}>
                            <Icon icon={q.statusMeta.icon} width={13} />
                            {q.statusMeta.label}
                        </span>
                        {left && (
                            <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                <Icon icon="mdi:clock-outline" width={13} /> {left}
                            </span>
                        )}
                    </div>

                    {/* Device + services */}
                    {(q.brandName || q.modelName || q.services.length > 0) && (
                        <div>
                            {(q.brandName || q.modelName) && (
                                <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                                    <Icon icon="mdi:cellphone" width={17} className="text-primary-600" />
                                    {q.brandName} {q.modelName}
                                </p>
                            )}
                            {q.services.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                    {q.services.map((s) => (
                                        <span key={s} className="px-2 py-0.5 bg-primary-50 text-primary-700 text-[11px] font-medium rounded-full border border-primary-100">{s}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Price */}
                    <div className="bg-gray-50 rounded-lg p-2.5 text-sm space-y-1">
                        <div className="flex justify-between"><span className="text-gray-600">Repair service</span><span>{money(q.basePrice, q.currency)}</span></div>
                        {q.partsPrice > 0 && (
                            <div className="flex justify-between"><span className="text-gray-600">Parts</span><span>{money(q.partsPrice, q.currency)}</span></div>
                        )}
                        <div className="flex justify-between font-bold text-gray-900 border-t pt-1.5 mt-1">
                            <span>Total</span><span className="text-green-700">{money(q.subtotal, q.currency)}</span>
                        </div>
                        {q.pickupAvailable && q.pickupCharge > 0 && (
                            <p className="text-[11px] text-gray-500 flex items-center gap-1">
                                <Icon icon="mdi:truck-outline" width={13} />
                                Optional pickup: +{money(q.pickupCharge, q.currency)} if you choose pickup at checkout
                            </p>
                        )}
                    </div>

                    {/* Short facts */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        {q.estimatedDuration && (
                            <div><p className="text-gray-500">Time</p><p className="font-medium text-gray-800">{q.estimatedDuration}{/^\d+$/.test(q.estimatedDuration) ? ' days' : ''}</p></div>
                        )}
                        <div><p className="text-gray-500">Service</p><p className="font-medium text-gray-800">{q.pickupAvailable ? 'Pickup or drop-off' : 'Drop-off'}</p></div>
                        {q.warranty && (
                            <div><p className="text-gray-500">Warranty</p><p className="font-medium text-gray-800">{q.warranty}{/^\d+$/.test(String(q.warranty)) ? ' days' : ''}</p></div>
                        )}
                        {q.partsQuality && q.isPartRequired && (
                            <div><p className="text-gray-500">Parts quality</p><p className="font-medium text-gray-800 capitalize">{q.partsQuality.replace(/-/g, ' ')}</p></div>
                        )}
                    </div>

                    <button type="button" className="text-xs font-medium text-primary-600 hover:underline flex items-center gap-1" onClick={() => setShowDetails((v) => !v)}>
                        {showDetails ? 'Hide details' : 'More details'}
                        <Icon icon={showDetails ? 'mdi:chevron-up' : 'mdi:chevron-down'} width={15} />
                    </button>

                    {showDetails && (
                        <div className="space-y-2.5 text-sm border-t pt-2.5">
                            {q.description && (
                                <div><p className="text-[11px] uppercase tracking-wide text-gray-500">Description</p><p className="text-gray-700 whitespace-pre-wrap">{q.description}</p></div>
                            )}
                            {q.parts.length > 0 && (
                                <div>
                                    <p className="text-[11px] uppercase tracking-wide text-gray-500">Parts included</p>
                                    <ul className="text-gray-700 list-disc ml-4">
                                        {q.parts.map((p, i) => <li key={`${p.name}-${i}`}>{p.name}</li>)}
                                    </ul>
                                </div>
                            )}
                            {q.dropoffAddress && (
                                <div>
                                    <p className="text-[11px] uppercase tracking-wide text-gray-500">Drop-off address</p>
                                    <p className="text-gray-700 flex items-start gap-1"><Icon icon="mdi:map-marker" width={15} className="mt-0.5 text-primary-600 shrink-0" />{q.dropoffAddress}</p>
                                </div>
                            )}
                            {q.notes && (
                                <div><p className="text-[11px] uppercase tracking-wide text-gray-500">Notes</p><p className="text-gray-700 whitespace-pre-wrap">{q.notes}</p></div>
                            )}
                            {q.validUntil && (
                                <p className="text-xs text-gray-500">Valid until {fmtDateTime(q.validUntil)}</p>
                            )}
                        </div>
                    )}

                    {/* Customer actions */}
                    {isCustomer && q.isOpen && !showReject && (
                        <div className="flex gap-2 pt-1">
                            <Link
                                href={`/payment?quotationId=${q.id}`}
                                onClick={() => closeChat()}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-1"
                            >
                                <Icon icon="mdi:check" width={16} /> Accept & Pay
                            </Link>
                            <button
                                onClick={() => setShowReject(true)}
                                className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-1"
                            >
                                <Icon icon="mdi:close" width={16} /> Reject
                            </button>
                        </div>
                    )}
                    {isCustomer && q.isOpen && showReject && (
                        <div className="space-y-2 pt-1">
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                maxLength={200}
                                rows={2}
                                placeholder="Reason (optional), e.g. price too high"
                                className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                            />
                            <div className="flex gap-2">
                                <button onClick={() => setShowReject(false)} className="flex-1 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                                <button onClick={reject} disabled={rejecting} className="flex-1 py-1.5 rounded-md text-sm font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-60">
                                    {rejecting ? 'Rejecting…' : 'Reject quotation'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Outcome */}
                    {q.status === 'accepted' && (
                        <p className="text-sm font-medium text-green-700 bg-green-50 rounded-md px-2 py-1.5 flex items-center gap-1">
                            <Icon icon="mdi:check-circle" width={16} /> Accepted and paid{q.respondedAt ? ` · ${fmtDateTime(q.respondedAt)}` : ''}
                        </p>
                    )}
                    {q.status === 'rejected' && (
                        <p className="text-sm text-red-700 bg-red-50 rounded-md px-2 py-1.5">
                            Rejected by the customer{q.customerResponse ? `: "${q.customerResponse}"` : ''}
                        </p>
                    )}
                    {q.status === 'replaced' && (
                        <p className="text-xs text-amber-700">A newer quotation was sent in this chat. Please use that one.</p>
                    )}
                    {q.status === 'expired' && (
                        <p className="text-xs text-gray-500">{isRepairmanOwner ? 'This quotation expired. Send a new one if the customer is still interested.' : 'This quotation has expired. Ask the repairman for a new one.'}</p>
                    )}
                </div>

                <div className="px-3 py-1.5 bg-gray-50 border-t text-[11px] text-gray-500">
                    {fmtDateTime(message.timestamp || message.createdAt)}
                </div>
            </div>

            {showEditModal && (
                <QuotationForm
                    chatId={chatId}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => {
                        setShowEditModal(false);
                        onQuotationUpdate?.();
                    }}
                    initialData={quotationData}
                    isEdit={true}
                />
            )}
        </div>
    );
};

export default QuotationMessage;
