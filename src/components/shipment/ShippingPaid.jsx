'use client';

// The shipping fee of an order and what really left the seller: order earnings + wallet + card.
export const shippingPaidBy = (order) => {
  const fromOrder = order?.items?.reduce((sum, item) => sum + (item.shippingDeduction || 0), 0) || 0;
  const fromWallet = order?.shipment?.paidFromWallet || 0;
  const byCard = order?.shipment?.paidByCard || 0;
  return { fromOrder, fromWallet, byCard, total: fromOrder + fromWallet + byCard };
};

// a cancel cannot be undone, so the seller confirms it
export const confirmSellerCancel = () => window.confirm('Cancel this order? The customer will be refunded.');

export default function ShippingPaid({ fee, paid }) {
  const parts = [
    [paid.fromOrder, "from this order's earnings"],
    [paid.fromWallet, 'from wallet'],
    [paid.byCard, 'by card'],
  ].filter(([value]) => value > 0);
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase text-gray-400">Shipping Fee</span>
        <span className="font-bold text-gray-800">{Number(fee || 0).toFixed(2)} TRY</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase text-gray-400">You Paid</span>
        <span className="font-bold text-red-600">{paid.total.toFixed(2)} TRY</span>
      </div>
      {parts.map(([value, label]) => (
        <p key={label} className="text-[11px] text-gray-500 text-right">{value.toFixed(2)} {label}</p>
      ))}
    </>
  );
}
