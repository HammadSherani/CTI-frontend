'use client';

import { Icon } from '@iconify/react';
import { getPartsOrderSteps, PARTS_ORDER_STATUS_LABELS } from '@/constant/partsOrderStatus';

const formatDay = (value) =>
    value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : null;

/**
 * Parts order tracking for the repairman: step bar, shipping details and "received" action.
 */
export default function PartsTrackingCard({ order, receiving, onReceive, onCopy, formatDate }) {
    if (!order) return null;
    const { steps, activeIndex, stopped } = getPartsOrderSteps(order);
    const canReceive = !order.isReceived && ['delivered', 'ready-for-pickup'].includes(order.orderStatus);
    const isPickup = order.shippingMethod === 'Pickup' || order.orderStatus === 'ready-for-pickup';
    const eta = formatDay(order.estimatedDelivery);

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Icon icon="mdi:map-marker-path" className="w-6 h-6 text-primary-600" />
                    Order Tracking
                </h2>
                {stopped ? (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-50 text-red-700 border border-red-200">
                        {PARTS_ORDER_STATUS_LABELS[stopped]}
                    </span>
                ) : order.isReceived ? (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                        <Icon icon="mdi:hand-okay" className="w-4 h-4" />
                        Received {order.receivedAt ? `· ${formatDay(order.receivedAt)}` : ''}
                    </span>
                ) : eta ? (
                    <span className="text-sm text-gray-600">
                        Expected {isPickup ? 'pickup' : 'delivery'}: <strong className="text-gray-900">{eta}</strong>
                    </span>
                ) : null}
            </div>

            {/* Step bar */}
            <ol className="grid grid-cols-6 gap-1 sm:gap-2">
                {steps.map((step, index) => {
                    const done = index < activeIndex || (index === activeIndex && (order.isReceived || index === steps.length - 1));
                    const current = index === activeIndex && !done;
                    const failed = stopped && index === activeIndex + 1;
                    return (
                        <li key={step.key} className="flex flex-col items-center text-center">
                            <div className="flex w-full items-center">
                                <div className={`h-1 flex-1 rounded ${index === 0 ? 'invisible' : index <= activeIndex ? 'bg-primary-500' : 'bg-gray-200'}`} />
                                <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${failed
                                        ? 'border-red-400 bg-red-50 text-red-500'
                                        : done
                                            ? 'border-primary-500 bg-primary-500 text-white'
                                            : current
                                                ? 'border-primary-500 bg-white text-primary-600 ring-4 ring-primary-100'
                                                : 'border-gray-200 bg-white text-gray-400'
                                        }`}
                                >
                                    <Icon icon={failed ? 'mdi:close' : done ? 'mdi:check' : step.icon} className="h-5 w-5" />
                                </div>
                                <div className={`h-1 flex-1 rounded ${index === steps.length - 1 ? 'invisible' : index < activeIndex ? 'bg-primary-500' : 'bg-gray-200'}`} />
                            </div>
                            <span className={`mt-2 text-[11px] sm:text-xs font-medium ${done || current ? 'text-gray-900' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                        </li>
                    );
                })}
            </ol>

            {/* Shipping details */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="rounded-lg bg-gray-50 px-4 py-3">
                    <p className="text-gray-500">Method</p>
                    <p className="font-semibold text-gray-900">{order.shippingMethod || 'Pickup'}</p>
                </div>
                <div className="rounded-lg bg-gray-50 px-4 py-3">
                    <p className="text-gray-500">Courier</p>
                    <p className="font-semibold text-gray-900">{order.courierName || '—'}</p>
                </div>
                <div className="rounded-lg bg-gray-50 px-4 py-3">
                    <p className="text-gray-500">Tracking number</p>
                    {order.trackingNumber ? (
                        <button
                            type="button"
                            onClick={() => onCopy?.(order.trackingNumber)}
                            className="notranslate font-semibold text-primary-700 hover:underline flex items-center gap-1"
                            translate="no"
                            title="Copy"
                        >
                            {order.trackingNumber}
                            <Icon icon="mdi:content-copy" className="h-4 w-4" />
                        </button>
                    ) : (
                        <p className="font-semibold text-gray-900">—</p>
                    )}
                </div>
                <div className="rounded-lg bg-gray-50 px-4 py-3">
                    <p className="text-gray-500">{order.deliveryDate ? 'Delivered on' : order.shippingDate ? 'Shipped on' : 'Expected'}</p>
                    <p className="font-semibold text-gray-900">
                        {formatDay(order.deliveryDate) || formatDay(order.shippingDate) || eta || '—'}
                    </p>
                </div>
            </div>

            {order.cancellationReason && stopped === 'cancelled' && (
                <p className="mt-4 text-sm text-red-600">Reason: {order.cancellationReason}</p>
            )}

            {canReceive && (
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                    <Icon icon="mdi:package-variant-closed-check" className="w-7 h-7 text-green-600 shrink-0" />
                    <p className="flex-1 text-sm text-green-800">
                        {isPickup ? 'Your parts are ready for pickup.' : 'Your parts have been delivered.'} Please confirm once you have them.
                    </p>
                    <button
                        type="button"
                        onClick={onReceive}
                        disabled={receiving}
                        className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
                    >
                        {receiving ? 'Saving...' : 'I received the parts'}
                    </button>
                </div>
            )}

            {order.activityLog?.length > 0 && formatDate && (
                <p className="mt-4 text-xs text-gray-400">
                    Last update: {formatDate(order.activityLog[order.activityLog.length - 1]?.createdAt)}
                </p>
            )}
        </div>
    );
}
