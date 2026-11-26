"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { Link } from '@/i18n/navigation';

const money = (amount, currency = 'TRY') => {
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '₺';
  return `${symbol}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

// Repairmen who owe money: a dispute refunded the customer after the repairman had already
// withdrawn the earning. The amount is taken automatically from their next earnings.
export default function OwedRepairmenPage() {
  const { token } = useSelector((state) => state.auth);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ totalOwed: 0, repairmen: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/admin/earnings/owed', {
        params: { page: p, limit: 20 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setRows(data.data || []);
      setSummary(data.summary || { totalOwed: 0, repairmen: 0 });
      setPage(p);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Repairman Debts</h1>
          <p className="text-sm text-gray-600 mt-1">
            Money repairmen owe after a dispute refund, when the earning had already been withdrawn.
            It is taken automatically from their next earnings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total owed</div>
            <div className="text-2xl font-bold text-amber-600">{money(summary.totalOwed)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Repairmen with a debt</div>
            <div className="text-2xl font-bold text-gray-900">{summary.repairmen}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <Icon icon="heroicons:arrow-path" className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center">
              <Icon icon="mdi:check-circle-outline" className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="font-medium text-gray-900">No repairman owes anything</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Repairman', 'Owes', 'Wallet', 'From disputes', 'Updated'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rows.map((r, i) => (
                    <tr key={r.repairman?.id || i} className="hover:bg-gray-50 align-top">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{r.repairman?.name || 'Unknown'}</div>
                        {r.repairman?.shopName && <div className="text-xs text-gray-500">{r.repairman.shopName}</div>}
                        <div className="text-xs text-gray-500">{r.repairman?.email}</div>
                        {r.repairman?.phone && <div className="text-xs text-gray-500">{r.repairman.phone}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-amber-700 whitespace-nowrap">{money(r.owedAmount, r.currency)}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        <div>Available: {money(r.availableBalance, r.currency)}</div>
                        {r.lockedAmount > 0 && (
                          <div className="text-red-700 font-medium">Pending withdrawal: {money(r.lockedAmount, r.currency)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {(r.sources || []).length === 0 ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          <ul className="space-y-1">
                            {r.sources.map((s) => (
                              <li key={s.id}>
                                <Link href={`/admin/disputes/${s.id}`} className="text-primary-600 hover:underline font-medium">{s.disputeId}</Link>
                                <span className="text-gray-500"> · refund {money(s.refundAmount, r.currency)} · owed {money(s.owedFromThis, r.currency)}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(r.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm">
              <button type="button" onClick={() => load(page - 1)} disabled={page <= 1} className="px-3 py-1.5 border rounded-md disabled:opacity-50">Previous</button>
              <span className="text-gray-600">Page {page} of {totalPages}</span>
              <button type="button" onClick={() => load(page + 1)} disabled={page >= totalPages} className="px-3 py-1.5 border rounded-md disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
