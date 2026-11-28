'use client';

// Asks the seller for the invoice right after an order is delivered (marketplace and refurbished).
import { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axiosInstance from '@/config/axiosInstance';
import { PdfFrame } from '@/components/partials/InvoicePdf';
import { pdfProblem } from '@/helper/invoiceFile';

/* ─────────────────────────────────────────────────────────
   DELIVERY INVOICE MODAL
───────────────────────────────────────────────────────── */
export default function DeliveryInvoiceModal({ order, onClose, onUploadNow }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();
  const token = useSelector((state) => state.auth.token);

  const handleUpload = async () => {
    if (pdfProblem(file)) { setError(pdfProblem(file)); return; }
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('orderId', order._id);

      const { data } = await axiosInstance.post('/seller/invoices/upload', fd, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': undefined
        }
      });
      
      if (data.success) {
        toast.success('Invoice uploaded and submitted to platform for review.');
        onUploadNow(data.data); // reuse callback for success handling
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white relative">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Icon icon="solar:bill-list-bold-duotone" className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black leading-tight">Order Delivered!</h2>
              <p className="text-emerald-100 text-sm mt-1 font-medium">
                {order?.orderNo || order?.orderId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Icon icon="mdi:close" className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="mt-4 text-white/90 text-sm leading-relaxed">
            You can now upload your invoice to submit to the platform for review and payment processing.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-2xl p-6 text-center cursor-pointer hover:bg-emerald-50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Icon icon="mdi:file-pdf-box" className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            {file ? (
              <p className="w-full break-all text-center text-sm font-bold text-emerald-700">{file.name}</p>
            ) : (
              <>
                <p className="text-sm font-bold text-emerald-700">Click to select PDF</p>
                <p className="text-xs text-emerald-600/70 mt-1">PDF only — max 10 MB</p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={e => { const picked = e.target.files[0] || null; setFile(picked); setError(picked ? pdfProblem(picked) || '' : ''); }}
            />
          </div>

          {file && <PdfFrame file={file} className="h-64" />}

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl text-center font-medium">{error}</p>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors text-sm"
            >
              Skip for now
            </button>
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20 text-sm disabled:opacity-50"
            >
              {loading ? (
                <><Icon icon="svg-spinners:180-ring-with-bg" className="w-4 h-4" /> Uploading...</>
              ) : (
                <><Icon icon="solar:upload-bold-duotone" className="w-5 h-5" /> Upload & Submit</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
