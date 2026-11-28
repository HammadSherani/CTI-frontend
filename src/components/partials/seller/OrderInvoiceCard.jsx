'use client';

// The invoice of one order: upload it, see its review status, send it again if rejected.
// A seller's earnings are only released once this invoice is approved.
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import axiosInstance from '@/config/axiosInstance';
import { downloadInvoice, pdfProblem } from '@/helper/invoiceFile';
import PdfModal, { PdfFrame } from '@/components/partials/InvoicePdf';

const STATUS = {
  submitted: { label: 'Under review', style: 'bg-blue-50 text-blue-700' },
  approved: { label: 'Approved', style: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Rejected', style: 'bg-red-50 text-red-700' },
};

export default function OrderInvoiceCard({ orderId, token }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const card = useRef(null);

  useEffect(() => {
    if (!loading && window.location.hash === '#invoice') card.current?.scrollIntoView({ block: 'center' });
  }, [loading]);

  useEffect(() => {
    if (!orderId || !token) return undefined;
    let cancelled = false;
    axiosInstance
      .get(`/seller/invoices/by-order/${orderId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => { if (!cancelled) setInvoice(data.data || null); })
      .catch(() => { }) // 404: nothing uploaded yet
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [orderId, token]);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (pdfProblem(file)) return toast.error(pdfProblem(file));

    const formData = new FormData();
    formData.append('file', file);
    if (!invoice) formData.append('orderId', orderId);
    setUploading(true);
    try {
      const url = invoice ? `/seller/invoices/${invoice._id}/reupload` : '/seller/invoices/upload';
      const { data } = await axiosInstance.post(url, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        setInvoice(data.data);
        toast.success('Invoice sent for review');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const status = invoice ? STATUS[invoice.status] || STATUS.submitted : null;
  const canUpload = !loading && (!invoice || invoice.status === 'rejected');

  return (
    <div ref={card} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Icon icon="mdi:file-document-outline" className="w-5 h-5 text-primary-500" />Invoice
        </h2>
        {status && <span className={`text-xs font-bold px-2 py-1 rounded-full ${status.style}`}>{status.label}</span>}
      </div>
      {!loading && !invoice && <p className="text-xs text-gray-500">Upload the invoice PDF. Your earnings are released after it is approved.</p>}
      {invoice?.rejectionReason && <p className="text-xs text-red-600">Reason: {invoice.rejectionReason}</p>}
      {invoice?.pdfUrl && (
        <PdfFrame url={invoice.pdfUrl} className="h-72" />
      )}
      {invoice?.pdfUrl && (
        <div className="flex items-center gap-4 text-xs font-semibold text-primary-600">
          <button type="button" onClick={() => setShowPdf(true)} className="hover:underline cursor-pointer">Full screen</button>
          <button type="button" onClick={() => downloadInvoice(invoice.pdfUrl, invoice.invoiceNumber)} className="hover:underline cursor-pointer">Download</button>
        </div>
      )}
      {showPdf && invoice?.pdfUrl && (
        <PdfModal url={invoice.pdfUrl} number={invoice.invoiceNumber} onClose={() => setShowPdf(false)} />
      )}
      {canUpload && (
        <label className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer ${uploading ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'}`}>
          <Icon icon="mdi:upload" className="w-4 h-4" />
          {uploading ? 'Uploading…' : invoice ? 'Re-upload Invoice' : 'Upload Invoice'}
          <input type="file" accept="application/pdf" className="hidden" disabled={uploading} onChange={upload} />
        </label>
      )}
    </div>
  );
}
