'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_META = {
  submitted: { label: 'Under Review', bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-200',    dot: '#2563eb' },
  approved:  { label: 'Approved',     bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', dot: '#059669' },
  rejected:  { label: 'Rejected',     bg: 'bg-red-50',      text: 'text-red-700',     border: 'border-red-200',     dot: '#dc2626' },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.submitted;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${m.bg} ${m.text} ${m.border}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}

/* ── Upload Modal ───────────────────────────────────────────────── */
function UploadModal({ reuploadFor, onClose, onSuccess, token }) {
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const fileRef = useRef();

  const handleUpload = async () => {
    if (!file) { setError('Please select a PDF file.'); return; }
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);

      const url = reuploadFor
        ? `/seller/invoices/${reuploadFor._id}/reupload`
        : '/seller/invoices/upload';

      const { data } = await axiosInstance.post(url, fd, {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });

      if (data.success) {
        toast.success(reuploadFor ? 'Invoice re-uploaded.' : 'Invoice uploaded and submitted for review.');
        onSuccess(data.data);
        onClose();
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-black text-slate-900 text-lg">
              {reuploadFor ? 'Re-Upload Invoice' : 'Upload Invoice'}
            </h3>
            {reuploadFor && (
              <p className="text-xs text-slate-400 mt-0.5">{reuploadFor.invoiceNumber}</p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200">
            <Icon icon="mdi:close" className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {reuploadFor?.rejectionReason && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4 flex items-start gap-2 text-xs text-red-700">
            <Icon icon="mdi:alert-circle-outline" className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Rejection reason:</strong> {reuploadFor.rejectionReason}</span>
          </div>
        )}

        <div
          className="border-2 border-dashed border-violet-200 bg-violet-50 rounded-2xl p-8 text-center cursor-pointer hover:bg-violet-100 transition-colors mb-4"
          onClick={() => fileRef.current?.click()}
        >
          <Icon icon="mdi:file-pdf-box" className="w-10 h-10 text-violet-400 mx-auto mb-2" />
          {file ? (
            <p className="text-sm font-bold text-violet-700">{file.name}</p>
          ) : (
            <>
              <p className="text-sm font-bold text-violet-700">Click to select PDF</p>
              <p className="text-xs text-slate-400 mt-1">PDF only — max 10 MB</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={e => { setFile(e.target.files[0]); setError(''); }}
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 mb-3 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-sm transition-colors">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading
              ? <><Icon icon="svg-spinners:180-ring-with-bg" className="w-4 h-4" /> Uploading…</>
              : <><Icon icon="mdi:upload" className="w-4 h-4" /> {reuploadFor ? 'Re-Upload & Submit' : 'Upload & Submit'}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────── */
export default function InvoicePage() {
  const { token } = useSelector(s => s.auth);

  const [invoices,   setInvoices]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [filterStatus, setFilterStatus] = useState('');
  const [showUpload,  setShowUpload]  = useState(false);
  const [reuploadFor, setReuploadFor] = useState(null);

  const loadInvoices = useCallback(async (page = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: pagination.limit });
      if (filterStatus) params.set('status', filterStatus);

      const { data } = await axiosInstance.get(`/seller/invoices?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setInvoices(data.data);
        setPagination(p => ({ ...p, ...data.pagination, page }));
      }
    } catch {
      toast.error('Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus, pagination.limit]);

  useEffect(() => { loadInvoices(1); }, [filterStatus]);

  const handleUploadSuccess = (newOrUpdated) => {
    setInvoices(prev => {
      const exists = prev.find(i => i._id === newOrUpdated._id);
      return exists
        ? prev.map(i => i._id === newOrUpdated._id ? newOrUpdated : i)
        : [newOrUpdated, ...prev];
    });
  };

  const openReupload = (inv) => { setReuploadFor(inv); setShowUpload(true); };
  const closeUpload  = () => { setShowUpload(false); setReuploadFor(null); };

  const counts = invoices.reduce((acc, inv) => { acc[inv.status] = (acc[inv.status] || 0) + 1; return acc; }, {});

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Invoices</h1>
            <p className="text-sm text-slate-400 mt-0.5">Upload your invoice PDFs — admin will review and approve</p>
          </div>
          <button
            onClick={() => { setReuploadFor(null); setShowUpload(true); }}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            <Icon icon="mdi:upload" className="w-4 h-4" />
            Upload Invoice PDF
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Stats + Filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: '',          label: 'All',         count: pagination.total },
            { key: 'submitted', label: 'Under Review', count: counts.submitted  || 0 },
            { key: 'approved',  label: 'Approved',     count: counts.approved   || 0 },
            { key: 'rejected',  label: 'Rejected',     count: counts.rejected   || 0 },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                filterStatus === key
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600'
              }`}
            >
              {label}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-md ${filterStatus === key ? 'bg-violet-700' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Invoice #', 'Submitted', 'Status', 'Rejection Reason', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {[1,2,3,4,5].map(j => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-slate-100 animate-pulse rounded-lg" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Icon icon="mdi:file-pdf-box" className="w-14 h-14 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-400 font-semibold">No invoices yet</p>
                      <p className="text-xs text-slate-300 mt-1">Click "Upload Invoice PDF" to submit your first invoice</p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv, i) => (
                    <tr key={inv._id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${i % 2 !== 0 ? 'bg-slate-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <span className="font-bold text-violet-700 text-xs">{inv.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {fmtDate(inv.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px]">
                        {inv.status === 'rejected' && inv.rejectionReason
                          ? <span className="text-red-600">{inv.rejectionReason}</span>
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* Download PDF */}
                          <a
                            href={`${inv.pdfUrl}?fl_attachment=1`}
                            download
                            title="Download PDF"
                            className="w-7 h-7 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Icon icon="mdi:download" className="w-3.5 h-3.5" />
                          </a>
                          {/* Re-upload if rejected */}
                          {inv.status === 'rejected' && (
                            <button
                              title="Re-Upload"
                              onClick={() => openReupload(inv)}
                              className="w-7 h-7 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <Icon icon="mdi:upload-outline" className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => loadInvoices(pagination.page - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  <Icon icon="mdi:chevron-left" className="w-4 h-4 text-slate-500" />
                </button>
                {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <button
                      key={pg}
                      onClick={() => loadInvoices(pg)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                        pagination.page === pg ? 'bg-violet-600 text-white' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => loadInvoices(pagination.page + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  <Icon icon="mdi:chevron-right" className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showUpload && (
        <UploadModal
          reuploadFor={reuploadFor}
          token={token}
          onClose={closeUpload}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
