// Shared labels for catalog booking requests (customer + repairman pages)

export const TIME_WINDOWS = {
  morning: 'Morning (9–12)',
  afternoon: 'Afternoon (12–4)',
  evening: 'Evening (4–8)',
};

export const STATUS = {
  requested: { label: 'Waiting for the repairman', cls: 'bg-yellow-100 text-yellow-800' },
  accepting: { label: 'Being accepted', cls: 'bg-yellow-100 text-yellow-800' },
  accepted: { label: 'Accepted – waiting for payment', cls: 'bg-blue-100 text-blue-800' },
  booked: { label: 'Booked', cls: 'bg-green-100 text-green-800' },
  rejected: { label: 'Not accepted', cls: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-700' },
  expired: { label: 'No answer in time', cls: 'bg-gray-100 text-gray-700' },
  payment_expired: { label: 'Not paid in time', cls: 'bg-gray-100 text-gray-700' },
};

export const money = (n) => `₺${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

export const fmtDay = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }) : '';

export const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

/** "5h 12m left" until a deadline, or null when passed. */
export const timeLeft = (d) => {
  const ms = new Date(d).getTime() - Date.now();
  if (!(ms > 0)) return null;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
};

/** YYYY-MM-DD of today + n days (local). */
export const isoDay = (n = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
