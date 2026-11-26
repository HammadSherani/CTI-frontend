'use client';

import { Icon } from '@iconify/react';

const formatDay = (value) =>
    value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : null;

// Customer view of the admin-supplied parts for their repair (simplified, friendly wording)
const STEPS = [
    { key: 'ordered', label: 'Parts ordered', icon: 'mdi:cart-check' },
    { key: 'preparing', label: 'Being prepared', icon: 'mdi:package-variant' },
    { key: 'on_the_way', label: 'On the way', icon: 'mdi:truck-fast' },
    { key: 'with_repairman', label: 'With your repairman', icon: 'mdi:tools' },
];

const stepIndex = (p) => {
    if (p.receivedByRepairman) return 3;
    switch (p.status) {
        case 'delivered':
        case 'shipped':
        case 'ready-for-pickup':
            return 2;
        case 'confirmed':
        case 'processing':
            return 1;
        default:
            return 0;
    }
};

export default function CustomerPartsStatus({ partsOrder }) {
    const stopped = ['cancelled', 'returned'].includes(partsOrder.status);
    const active = stepIndex(partsOrder);
    const eta = formatDay(partsOrder.estimatedDelivery);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Icon icon="mdi:package-variant-closed" className="w-5 h-5 text-primary-600" />
                    Parts for your repair
                </h3>
                {stopped ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        Parts order {partsOrder.status}
                    </span>
                ) : partsOrder.receivedByRepairman ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        Repairman has the parts
                    </span>
                ) : eta ? (
                    <span className="text-sm text-gray-600">Expected by <strong className="text-gray-900">{eta}</strong></span>
                ) : null}
            </div>

            {!stopped && (
                <ol className="grid grid-cols-4 gap-2">
                    {STEPS.map((step, i) => {
                        const done = i < active || (i === active && partsOrder.receivedByRepairman);
                        const current = i === active && !done;
                        return (
                            <li key={step.key} className="flex flex-col items-center text-center">
                                <div className="flex w-full items-center">
                                    <div className={`h-1 flex-1 rounded ${i === 0 ? 'invisible' : i <= active ? 'bg-primary-500' : 'bg-gray-200'}`} />
                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${done
                                        ? 'border-primary-500 bg-primary-500 text-white'
                                        : current
                                            ? 'border-primary-500 bg-white text-primary-600 ring-4 ring-primary-100'
                                            : 'border-gray-200 bg-white text-gray-400'}`}>
                                        <Icon icon={done ? 'mdi:check' : step.icon} className="h-5 w-5" />
                                    </div>
                                    <div className={`h-1 flex-1 rounded ${i === STEPS.length - 1 ? 'invisible' : i < active ? 'bg-primary-500' : 'bg-gray-200'}`} />
                                </div>
                                <span className={`mt-2 text-xs font-medium ${done || current ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</span>
                            </li>
                        );
                    })}
                </ol>
            )}

            {partsOrder.parts?.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                    {partsOrder.parts.map((name, i) => (
                        <span key={`${name}-${i}`} className="px-3 py-1 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
                            {name}
                        </span>
                    ))}
                </div>
            )}

            <p className="mt-4 text-xs text-gray-500">
                {stopped
                    ? 'This parts order was stopped. Our team or your repairman will contact you about the next steps.'
                    : 'Your repairman will start the repair once the parts arrive.'}
            </p>
        </div>
    );
}
