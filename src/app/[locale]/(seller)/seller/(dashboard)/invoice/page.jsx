'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : '—';

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
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      if (data.success) {
        toast.success(reuploadFor ? 'Invoice re-uploaded successfully!' : 'Invoice uploaded successfully!');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-black text-slate-900 text-xl">
              {reuploadFor ? 'Re-Upload Invoice' : 'Upload New Invoice'}
            </h3>
            {reuploadFor && (
              <p className="text-xs text-slate-400 mt-1">{reuploadFor.invoiceNumber}</p>
            )}
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-colors">
            <Icon icon="mdi:close" className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {reuploadFor?.rejectionReason && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-5 text-sm text-red-700">
            <strong>Rejection Reason:</strong> {reuploadFor.rejectionReason}
          </div>
        )}

        <div
          className="border-2 border-dashed border-violet-200 bg-violet-50 rounded-3xl p-10 text-center cursor-pointer hover:bg-violet-100 transition-all"
          onClick={() => fileRef.current?.click()}
        >
          <Icon icon="mdi:file-pdf-box" className="w-16 h-16 text-violet-400 mx-auto mb-4" />
          {file ? (
            <p className="font-semibold text-violet-700 text-lg">{file.name}</p>
          ) : (
            <>
              <p className="font-bold text-violet-700">Click to select PDF file</p>
              <p className="text-xs text-slate-400 mt-2">Only PDF • Max 10 MB</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setError('');
            }}
          />
        </div>

        {error && <p className="text-red-600 text-sm mt-3 bg-red-50 p-3 rounded-2xl">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 font-semibold rounded-2xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>Uploading...</>
            ) : (
              <>{reuploadFor ? 'Re-upload & Submit' : 'Upload & Submit'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────── */
export default function InvoicePage() {
  const { token } = useSelector((s) => s.auth);

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [filterStatus, setFilterStatus] = useState('');
  const [showUpload, setShowUpload] = useState(false);
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
        setInvoices(data.data || []);
        setPagination((prev) => ({ ...prev, ...data.pagination, page }));
      }
    } catch (err) {
      toast.error('Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus, pagination.limit]);

  useEffect(() => {
    loadInvoices(1);
  }, [filterStatus, loadInvoices]);

  const handleUploadSuccess = (newInvoice) => {
    setInvoices((prev) => {
      const exists = prev.find((i) => i._id === newInvoice._id);
      if (exists) {
        return prev.map((i) => (i._id === newInvoice._id ? newInvoice : i));
      }
      return [newInvoice, ...prev];
    });
  };

  const openReupload = (inv) => {
    setReuploadFor(inv);
    setShowUpload(true);
  };

  const closeUpload = () => {
    setShowUpload(false);
    setReuploadFor(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-6 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Invoices</h1>
            <p className="text-slate-500 mt-1">Upload your invoice PDFs for admin review</p>
          </div>

          <button
            onClick={() => { setReuploadFor(null); setShowUpload(true); }}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-2xl transition-all shadow-sm"
          >
            <Icon icon="mdi:upload" className="w-5 h-5" />
            Upload Invoice PDF
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: '', label: 'All', count: pagination.total },
            { key: 'submitted', label: 'Under Review', count: invoices.filter(i => i.status === 'submitted').length },
            { key: 'approved', label: 'Approved', count: invoices.filter(i => i.status === 'approved').length },
            { key: 'rejected', label: 'Rejected', count: invoices.filter(i => i.status === 'rejected').length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold border transition-all ${
                filterStatus === key
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white border-slate-200 hover:border-violet-200 text-slate-600'
              }`}
            >
              {label} <span className="ml-1.5 text-xs opacity-75">({count})</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b">
                  {['Invoice #', 'Submitted', 'Status', 'Rejection Reason', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-5 bg-slate-100 animate-pulse rounded-lg" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <Icon icon="mdi:file-pdf-box" className="w-20 h-20 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-semibold text-lg">No invoices found</p>
                      <p className="text-slate-400 mt-2">Upload your first invoice to get started</p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv._id} className="border-b hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-violet-700">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">{fmtDate(inv.createdAt)}</td>
                      <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-xs">
                        {inv.status === 'rejected' && inv.rejectionReason ? (
                          <span className="text-red-600">{inv.rejectionReason}</span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={inv.pdfUrl}
                            target="_blank"
                            className="w-9 h-9 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center transition-colors"
                            title="Download PDF"
                          >
                            <Icon icon="mdi:download" className="w-4 h-4" />
                          </a>

                          {inv.status === 'rejected' && (
                            <button
                              onClick={() => openReupload(inv)}
                              className="w-9 h-9 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center transition-colors"
                              title="Re-upload"
                            >
                              <Icon icon="mdi:upload-outline" className="w-4 h-4" />
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
            <div className="px-6 py-5 border-t flex items-center justify-between text-sm">
              <p className="text-slate-400">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              {/* Add better pagination if needed */}
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