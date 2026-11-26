'use client';

// Partial returns: the customer picks the items and how many of each.
import { formatCurrency } from '@/helper/currencyFormatter';

const RETURN_WINDOW_DAYS = 14;

export const remainingUnits = (item) =>
  item.itemStatus === 'cancelled' ? 0 : Math.max(0, item.quantity - (item.returnedQuantity || 0));

export function returnDeadlineOf(order) {
  if (order?.returnDeadline) return new Date(order.returnDeadline);
  const delivered = order?.completionDate || order?.updatedAt;
  return delivered ? new Date(new Date(delivered).getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000) : null;
}

/** Delivered, inside the return period, and at least one unit not yet returned. */
export function canRequestReturn(order, returns = []) {
  if (order?.orderStatus !== 'delivered') return false;
  const deadline = returnDeadlineOf(order);
  if (deadline && Date.now() > deadline.getTime()) return false;
  // a request made before partial returns covers the whole order
  if (returns.some((r) => r.returnStatus !== 'rejected' && (!r.items?.length || r.items.some((i) => i.itemIndex === undefined)))) return false;
  return !!order.items?.some((item) => remainingUnits(item) > 0);
}

/** With a single returnable line it starts selected, otherwise the customer chooses. */
export function initialReturnUnits(order) {
  const open = (order?.items || [])
    .map((item, index) => [index, remainingUnits(item)])
    .filter(([, left]) => left > 0);
  return open.length === 1 ? Object.fromEntries(open) : {};
}

export const selectedReturnItems = (units) =>
  Object.entries(units)
    .filter(([, quantity]) => quantity > 0)
    .map(([itemIndex, quantity]) => ({ itemIndex: Number(itemIndex), quantity }));

export default function ReturnItemPicker({ order, units, onChange }) {
  const total = (order.items || []).reduce((sum, item, index) => sum + (item.price || 0) * (units[index] || 0), 0);
  const deadline = returnDeadlineOf(order);

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-500 uppercase">Select items and quantity to return</p>
      {order.items.map((item, index) => {
        const left = remainingUnits(item);
        return (
          <div key={index} className={`flex items-center gap-3 border border-gray-100 rounded-xl p-3 ${left ? '' : 'opacity-50'}`}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{item.productId?.title || 'Product'}</p>
              <p className="text-xs text-gray-500">
                {item.variant?.color ? `${item.variant.color} · ` : ''}{formatCurrency(item.price || 0)} each
              </p>
            </div>
            {left ? (
              <select
                aria-label={`Quantity to return of ${item.productId?.title || 'product'}`}
                value={units[index] || 0}
                onChange={(e) => onChange({ ...units, [index]: Number(e.target.value) })}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary-500"
              >
                {Array.from({ length: left + 1 }, (_, quantity) => (
                  <option key={quantity} value={quantity}>{quantity}</option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-semibold text-gray-400">Already returned</span>
            )}
          </div>
        );
      })}
      <div className="flex justify-between text-xs text-gray-500">
        <span>{deadline ? `Return until ${deadline.toLocaleDateString()}` : ''}</span>
        <span className="font-bold text-gray-800">Return value: {formatCurrency(total)}</span>
      </div>
    </div>
  );
}
