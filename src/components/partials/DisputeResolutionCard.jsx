'use client';

import { Icon } from '@iconify/react';

const LABELS = {
  refund_full: 'Full refund to the customer',
  refund_partial: 'Partial refund to the customer',
  mutual_agreement: 'Settled by mutual agreement',
  pay_repairman: 'Payment released to the repairman',
  no_action: 'Closed without changes',
};

const symbolOf = (currency) => (currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '₺');

/**
 * Outcome of a resolved dispute, worded for the person looking at it.
 * viewer: 'customer' | 'repairman'
 */
export default function DisputeResolutionCard({ dispute, viewer = 'customer', currency = 'TRY' }) {
  const r = dispute?.resolution;
  if (!r?.resolutionType) return null;
  const s = symbolOf(currency);
  const refund = Number(r.refundAmount) || 0;

  let summary;
  if (viewer === 'customer') {
    summary = {
      refund_full: `${s}${refund} is being refunded to your card. It can take a few business days to appear on your statement.`,
      refund_partial: `${s}${refund} is being refunded to your card. It can take a few business days to appear on your statement.`,
      mutual_agreement: refund > 0 ? `${s}${refund} is being refunded to your card, as agreed.` : 'The dispute was settled as agreed by both sides.',
      pay_repairman: 'After reviewing the case, the payment was released to the repairman.',
      no_action: 'After reviewing the case, no changes were made. The job continues as before.',
    }[r.resolutionType];
  } else {
    summary = {
      refund_full: 'The customer was refunded in full. There is no earning for this job.',
      refund_partial: `${s}${refund} was refunded to the customer. You received ${s}${r.repairmanPaid || 0}.`,
      mutual_agreement: `Settled as agreed. You received ${s}${r.repairmanPaid || 0}.`,
      pay_repairman: `Your earning of ${s}${r.repairmanPaid || 0} was released to your wallet.`,
      no_action: 'No changes were made. The job continues as before.',
    }[r.resolutionType];
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-emerald-200 overflow-hidden">
      <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Icon icon="heroicons:scale" className="w-5 h-5 text-emerald-700" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-emerald-900">Dispute resolved</h3>
          <p className="text-sm text-emerald-800">{LABELS[r.resolutionType] || r.resolutionType}</p>
        </div>
        {r.resolvedAt && (
          <span className="ml-auto text-xs text-emerald-700 whitespace-nowrap">
            {new Date(r.resolvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        )}
      </div>
      <div className="px-5 py-4 space-y-3">
        <p className="text-sm text-gray-800">{summary}</p>
        {viewer === 'repairman' && r.walletOwed > 0 && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {s}{r.walletOwed} could not be taken from your wallet (already withdrawn). It will be deducted from your next earnings.
          </p>
        )}
        {r.resolutionNotes && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Note from our team</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">{r.resolutionNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
