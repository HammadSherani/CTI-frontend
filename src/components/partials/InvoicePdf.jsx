'use client';

// Shows an invoice PDF on the page itself: a file the seller has just chosen, or a stored one.
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { pdfLink, pdfProblem, downloadInvoice } from '@/helper/invoiceFile';

export function PdfFrame({ url, file, className = 'h-80' }) {
  const source = file || url;
  const [shown, setShown] = useState({});
  const notPdf = file ? pdfProblem(file) : null;

  useEffect(() => {
    if (!source || notPdf) return undefined;
    let link = null;
    let gone = false;
    // some computers send no file type, so it is stated here
    Promise.resolve(file ? URL.createObjectURL(new Blob([file], { type: 'application/pdf' })) : pdfLink(url))
      .then((made) => {
        if (gone) return URL.revokeObjectURL(made);
        link = made;
        setShown({ source, link });
      })
      .catch(() => { if (!gone) setShown({ source, failed: true }); });
    return () => {
      gone = true;
      if (link) URL.revokeObjectURL(link);
    };
  }, [source, file, url, notPdf]);

  if (!source) return null;
  const current = shown.source === source ? shown : {};
  const message = notPdf || (current.failed && 'Could not show the PDF.');

  return (
    <div className={`w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 ${className}`}>
      {message || !current.link ? (
        <p className="h-full flex items-center justify-center gap-2 text-xs font-semibold text-gray-500">
          {!message && <Icon icon="svg-spinners:180-ring-with-bg" className="w-4 h-4" />}
          {message || 'Loading PDF…'}
        </p>
      ) : (
        <iframe src={`${current.link}#view=FitH`} title="Invoice PDF" className="w-full h-full" />
      )}
    </div>
  );
}

/** The stored invoice, large, over the page. */
export default function PdfModal({ url, number, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-3 sm:p-6" onClick={onClose}>
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-black text-gray-900 break-all">Invoice {number}</h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button type="button" onClick={() => downloadInvoice(url, number)} className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-3 py-2 rounded-xl cursor-pointer">
              <Icon icon="mdi:download" className="w-4 h-4" /> Download
            </button>
            <button type="button" onClick={onClose} aria-label="Close" className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center cursor-pointer">
              <Icon icon="mdi:close" className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        <PdfFrame url={url} className="h-[75vh]" />
      </div>
    </div>
  );
}
