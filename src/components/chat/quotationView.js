// Shared helpers for showing a quotation (chat card + /quotation/[id] page).
// Quotation data arrives in a few shapes (chat snapshot, live API, populated doc);
// toQuotationView turns any of them into one simple object.

export const STATUS_META = {
    sent: { label: 'Sent', className: 'bg-primary-50 text-primary-700 border-primary-200', icon: 'mdi:send' },
    viewed: { label: 'Seen', className: 'bg-sky-50 text-sky-700 border-sky-200', icon: 'mdi:eye-check' },
    accepted: { label: 'Accepted', className: 'bg-green-50 text-green-700 border-green-200', icon: 'mdi:check-circle' },
    rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200', icon: 'mdi:close-circle' },
    expired: { label: 'Expired', className: 'bg-gray-100 text-gray-600 border-gray-200', icon: 'mdi:clock-alert' },
    replaced: { label: 'Replaced by a newer quote', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'mdi:swap-horizontal' },
    deleted: { label: 'Withdrawn', className: 'bg-gray-100 text-gray-500 border-gray-200', icon: 'mdi:delete' },
};

export const OPEN_STATUSES = ['sent', 'viewed'];

const nameOf = (v) => (v && typeof v === 'object' ? v.name : typeof v === 'string' ? v : '') || '';
const num = (v) => Number(v) || 0;

export const money = (v, currency = 'TRY') =>
    `${currency} ${num(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function toQuotationView(raw) {
    const q = raw || {};
    const device = q.deviceInfo || {};
    const details = q.serviceDetails || {};
    const pricing = q.pricing || {};
    const parts = (q.requiredParts?.length ? q.requiredParts : details.requiredParts || [])
        .map((p) => ({ name: nameOf(p), price: typeof p === 'object' ? p.price : undefined }))
        .filter((p) => p.name);

    const basePrice = num(pricing.basePrice);
    const partsPrice = num(pricing.partsPrice);
    const subtotal = basePrice + partsPrice || num(pricing.totalAmount);
    const pickupAvailable = Boolean(details.isPickup || details.serviceType === 'pickup');
    const pickupCharge = pickupAvailable ? num(pricing.serviceCharges) : 0;
    const validUntil = q.validUntil ? new Date(q.validUntil) : null;
    const deleted = q.isDeleted || q.status === 'deleted';
    let status = deleted ? 'deleted' : (q.status || 'sent');
    // past its validity but the server job hasn't run yet: treat as expired on screen
    if (OPEN_STATUSES.includes(status) && validUntil && validUntil < new Date()) status = 'expired';

    const warranty = details.warranty;
    return {
        id: String(q.quotationId || q._id || ''),
        status,
        statusMeta: STATUS_META[status] || STATUS_META.sent,
        isOpen: OPEN_STATUSES.includes(status),
        version: num(q.version) || 1,
        brandName: nameOf(device.brand) || device.brandName || '',
        modelName: nameOf(device.model) || device.modelName || '',
        services: (device.repairServices || []).map(nameOf).filter(Boolean),
        parts,
        partsQuality: q.partsQuality || '',
        isPartRequired: Boolean(q.isPartRequired || parts.length),
        basePrice,
        partsPrice,
        subtotal,
        pickupAvailable,
        pickupCharge,
        totalWithPickup: subtotal + pickupCharge,
        currency: pricing.currency || 'TRY',
        description: details.description || '',
        estimatedDuration: details.estimatedDuration || '',
        serviceType: details.serviceType || (pickupAvailable ? 'pickup' : 'drop-off'),
        dropoffAddress: details.dropoffLocation?.address || '',
        warranty: warranty ? (typeof warranty === 'object' ? warranty.duration : warranty) : '',
        notes: q.repairmanNotes || '',
        validUntil,
        sentAt: q.sentAt ? new Date(q.sentAt) : null,
        respondedAt: q.respondedAt ? new Date(q.respondedAt) : null,
        customerResponse: q.customerResponse || '',
    };
}

/** "2d 4h left" / "35 min left" / null when expired */
export function timeLeft(validUntil, now = new Date()) {
    if (!validUntil) return null;
    const ms = new Date(validUntil) - now;
    if (ms <= 0) return null;
    const mins = Math.floor(ms / 60000);
    const days = Math.floor(mins / 1440);
    const hours = Math.floor((mins % 1440) / 60);
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${mins % 60}m left`;
    return `${Math.max(1, mins)} min left`;
}

export const fmtDateTime = (d) => (d ? new Date(d).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
