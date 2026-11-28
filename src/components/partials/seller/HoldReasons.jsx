'use client';

// What the money on hold is waiting for: one box per reason, only the ones that apply.
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import { formatCurrency } from '@/helper/currencyFormatter';

const orderPage = (order) => `/seller/${order.refurbished ? 'refurbished/orders' : 'order'}/${order.orderId}#invoice`;

const BOXES = [
  {
    key: 'missing', title: 'Action required: upload invoices', action: 'Upload invoice', icon: 'mdi:alert-outline',
    text: 'This money moves to your balance only after you upload the invoice and the admin approves it.',
    style: 'bg-amber-50 border-amber-200 text-amber-800', button: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  {
    key: 'rejected', title: 'Invoice rejected: upload it again', action: 'Upload again', icon: 'mdi:close-circle-outline',
    text: 'The admin rejected these invoices. Open the order to see the reason and upload a corrected PDF.',
    style: 'bg-red-50 border-red-200 text-red-800', button: 'bg-red-600 hover:bg-red-700 text-white',
  },
  {
    key: 'review', title: 'Waiting for admin approval', action: 'View invoice', icon: 'mdi:clock-check-outline',
    text: 'Your invoices are uploaded. Nothing to do: the money is released after the admin approves them.',
    style: 'bg-blue-50 border-blue-200 text-blue-800', button: 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-100',
  },
  {
    key: 'approved', title: 'Invoice approved', action: 'View order', icon: 'mdi:check-circle-outline',
    text: 'Released after the hold period ends, and once no return is open for the order.',
    style: 'bg-emerald-50 border-emerald-200 text-emerald-800', button: 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100',
  },
];

export default function HoldReasons({ reasons, holdLabel }) {
  if (!reasons) return null;
  return (
    <>
      {BOXES.filter((box) => reasons[box.key]?.length).map((box) => {
        const orders = reasons[box.key];
        const total = orders.reduce((sum, order) => sum + order.amount, 0);
        return (
          <div key={box.key} className={`border rounded-2xl p-4 flex items-start gap-3 shadow-sm ${box.style}`}>
            <Icon icon={box.icon} className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div className="text-sm flex-1 min-w-0">
              <p className="font-bold text-base">{box.title}</p>
              <p className="mt-1">
                <strong>{formatCurrency(total)}</strong> on hold. {box.text}
                {box.key === 'approved' && holdLabel ? ` (hold period: ${holdLabel})` : ''}
              </p>
              <ul className="mt-3 space-y-2">
                {orders.map((order) => (
                  <li key={order.orderId} className="flex flex-wrap items-center justify-between gap-2 bg-white/60 rounded-xl px-3 py-2">
                    <span className="font-semibold">{order.orderNo} · {formatCurrency(order.amount)}</span>
                    <Link href={orderPage(order)} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${box.button}`}>
                      {box.action}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
      {reasons.notDelivered > 0 && (
        <p className="text-sm text-slate-500 flex items-center gap-2">
          <Icon icon="mdi:truck-outline" className="w-5 h-5" />
          <span><strong>{formatCurrency(reasons.notDelivered)}</strong> is on hold for orders that are not delivered yet.</span>
        </p>
      )}
    </>
  );
}
