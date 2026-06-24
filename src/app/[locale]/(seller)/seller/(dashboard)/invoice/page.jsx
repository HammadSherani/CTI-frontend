// 'use client';

// import { useState, useEffect, useCallback, useRef } from 'react';
// import { useSelector } from 'react-redux';
// import { Icon } from '@iconify/react';
// import { Link } from '@/i18n/navigation';
// import axiosInstance from '@/config/axiosInstance';

// /* ── helpers ──────────────────────────────────────────────────── */
// const fmt = (n = 0) =>
//   `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// const fmtDate = (d) =>
//   d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
// const fmtDateTime = (d) =>
//   d ? new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// const SUBMISSION_META = {
//   pending_submission: { label: 'Pending Submission', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: '#64748b' },
//   submitted: { label: 'Submitted', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: '#2563eb' },
//   waiting_for_approval: { label: 'Waiting Approval', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: '#d97706' },
//   approved: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: '#059669' },
//   rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: '#dc2626' },
// };

// const TYPE_LABELS = { order: 'Sales Order', commission: 'Commission', refund: 'Refund' };

// function StatusBadge({ status }) {
//   const m = SUBMISSION_META[status] || SUBMISSION_META.pending_submission;
//   return (
//     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${m.bg} ${m.text} ${m.border}`}>
//       <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.dot }} />
//       {m.label}
//     </span>
//   );
// }

// /* ── Invoice View Modal ────────────────────────────────────────── */
// function InvoiceModal({ invoice, onClose, onSubmit, onUploadClick }) {
//   if (!invoice) return null;
//   const canSubmit = ['pending_submission', 'rejected'].includes(invoice.submissionStatus);

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
//       <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
//         {/* Modal header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
//           <div>
//             <h2 className="text-lg font-black text-slate-900">{invoice.invoiceNumber}</h2>
//             <p className="text-xs text-slate-400">Invoice Code: {invoice.invoiceCode} &nbsp;·&nbsp; {fmtDate(invoice.invoiceDate)}</p>
//           </div>
//           <div className="flex items-center gap-2">
//             {/* <button onClick={() => downloadInvoicePDF(invoice)} className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
//               <Icon icon="solar:download-minimalistic-bold-duotone" className="w-3.5 h-3.5" />Download PDF
//             </button>
//             <button onClick={() => printInvoice(invoice)} className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors">
//               <Icon icon="solar:printer-bold-duotone" className="w-3.5 h-3.5" />Print
//             </button>
//             {canSubmit && (
//               <button onClick={() => onSubmit(invoice._id)} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
//                 <Icon icon="solar:upload-minimalistic-bold-duotone" className="w-3.5 h-3.5" />Submit
//               </button>
//             )} */}
//             <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
//               <Icon icon="mdi:close" className="w-4 h-4" />
//             </button>
//           </div>
//         </div>

//         {/* Modal body */}
//         <div className="flex-1 overflow-y-auto p-6 space-y-5">
//           {/* Status + rejection */}
//           <div className="flex items-center gap-3">
//             <StatusBadge status={invoice.submissionStatus} />
//             {invoice.submissionStatus === 'rejected' && invoice.rejectionReason && (
//               <div className="flex-1 bg-red-50 border border-red-100 rounded-xl px-4 py-2 text-xs text-red-700">
//                 <strong>Rejection Reason:</strong> {invoice.rejectionReason}
//               </div>
//             )}
//           </div>

//           {/* Seller + Customer */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100">
//               <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-2">From — Seller</p>
//               <p className="font-bold text-slate-800">{invoice.sellerInfo?.businessName || invoice.sellerInfo?.name || '—'}</p>
//               {invoice.sellerInfo?.email && <p className="text-xs text-slate-500 mt-0.5">{invoice.sellerInfo.email}</p>}
//               {invoice.sellerInfo?.phone && <p className="text-xs text-slate-500">{invoice.sellerInfo.phone}</p>}
//               {invoice.sellerInfo?.address && <p className="text-xs text-slate-500">{invoice.sellerInfo.address}</p>}
//               {invoice.sellerInfo?.taxNumber && <p className="text-xs text-slate-500">Tax: {invoice.sellerInfo.taxNumber}</p>}
//             </div>
//             <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
//               <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Bill To — Customer</p>
//               <p className="font-bold text-slate-800">{invoice.customerInfo?.name || '—'}</p>
//               {invoice.customerInfo?.email && <p className="text-xs text-slate-500 mt-0.5">{invoice.customerInfo.email}</p>}
//               {invoice.customerInfo?.phone && <p className="text-xs text-slate-500">{invoice.customerInfo.phone}</p>}
//               {invoice.customerInfo?.shippingAddress?.addressLine && <p className="text-xs text-slate-500">{invoice.customerInfo.shippingAddress.addressLine}</p>}
//               {(invoice.customerInfo?.shippingAddress?.area || invoice.customerInfo?.shippingAddress?.city) && (
//                 <p className="text-xs text-slate-500">{[invoice.customerInfo.shippingAddress.area, invoice.customerInfo.shippingAddress.city].filter(Boolean).join(', ')}</p>
//               )}
//             </div>
//           </div>

//           {/* Order info strip */}
//           <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-3">
//             {[
//               ['Order No', invoice.orderNo || '—'],
//               ['Invoice Code', invoice.invoiceCode || '—'],
//               ['Payment', invoice.paymentMethod || '—'],
//               ['Pay Status', invoice.paymentStatus || '—'],
//               ['Order Status', invoice.orderStatus || '—'],
//             ].map(([label, val]) => (
//               <div key={label}>
//                 <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
//                 <p className="text-sm font-bold text-slate-800 mt-0.5">{val}</p>
//               </div>
//             ))}
//           </div>

//           {/* Items table */}
//           <div className="overflow-x-auto rounded-2xl border border-slate-100">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-violet-600 text-white">
//                   {['#', 'Product', 'Variant', 'Qty', 'Unit Price', 'Total', 'Platform Fee', 'Your Earnings'].map(h => (
//                     <th key={h} className="px-3 py-2.5 text-left text-[11px] font-bold whitespace-nowrap">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {(invoice.items || []).map((item, i) => (
//                   <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
//                     <td className="px-3 py-2.5 text-slate-400 text-[11px]">{i + 1}</td>
//                     <td className="px-3 py-2.5 font-semibold text-slate-800 text-xs">{item.productName || '—'}</td>
//                     <td className="px-3 py-2.5 text-slate-500 text-xs">{[item.variant?.color, item.variant?.size].filter(Boolean).join(' / ') || '—'}</td>
//                     <td className="px-3 py-2.5 text-slate-700 text-center text-xs">{item.quantity}</td>
//                     <td className="px-3 py-2.5 text-slate-700 text-right text-xs">{fmt(item.unitPrice)}</td>
//                     <td className="px-3 py-2.5 font-bold text-slate-800 text-right text-xs">{fmt(item.totalPrice)}</td>
//                     <td className="px-3 py-2.5 text-red-600 text-right text-xs">{fmt(item.platformFee)}</td>
//                     <td className="px-3 py-2.5 font-bold text-emerald-600 text-right text-xs">{fmt(item.sellerEarnings)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Totals */}
//           <div className="flex justify-end">
//             <div className="w-full max-w-xs space-y-1.5">
//               {[
//                 ['Subtotal', fmt(invoice.subtotal)],
//                 ['Shipping Fee', fmt(invoice.shippingFee)],
//                 ['Tax', fmt(invoice.tax || 0)],
//                 ['Platform Fee', fmt(invoice.totalPlatformFee)],
//               ].map(([label, val]) => (
//                 <div key={label} className="flex justify-between text-xs text-slate-500">
//                   <span>{label}</span><span className="font-semibold">{val}</span>
//                 </div>
//               ))}
//               <div className="border-t border-violet-200 pt-2 flex justify-between">
//                 <span className="text-sm font-black text-slate-700">Your Earnings</span>
//                 <span className="text-sm font-black text-emerald-600">{fmt(invoice.totalSellerEarnings)}</span>
//               </div>
//             </div>
//           </div>

//           {/* History */}
//           {invoice.history?.length > 0 && (
//             <div>
//               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Activity History</p>
//               <div className="space-y-1.5">
//                 {invoice.history.map((h, i) => (
//                   <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-xl px-3 py-2">
//                     <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
//                       <Icon icon="solar:clock-circle-bold-duotone" className="w-3.5 h-3.5 text-violet-500" />
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-xs font-bold text-slate-700 capitalize">{h.action.replace(/_/g, ' ')}</p>
//                       {h.note && <p className="text-[11px] text-slate-400">{h.note}</p>}
//                     </div>
//                     <span className="text-[10px] text-slate-400 flex-shrink-0">{fmtDateTime(h.timestamp)}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Upload section */}
//           {invoice.uploadedInvoiceUrl && (
//             <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 flex items-center gap-3">
//               <Icon icon="solar:file-check-bold-duotone" className="w-5 h-5 text-emerald-500 flex-shrink-0" />
//               <div className="flex-1">
//                 <p className="text-xs font-bold text-emerald-700">Physical invoice uploaded</p>
//                 <a href={invoice.uploadedInvoiceUrl} target="_blank" rel="noreferrer" className="text-[11px] text-emerald-600 underline">View uploaded file</a>
//               </div>
//               <button onClick={() => onUploadClick(invoice)} className="text-xs font-bold text-emerald-600 underline">Re-upload</button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ── Upload Modal ──────────────────────────────────────────────── */
// function UploadModal({ invoice, onClose, onSuccess, token }) {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const fileRef = useRef();

//   const handleUpload = async () => {
//     if (!file) { setError('Please select a PDF file.'); return; }
//     setLoading(true);
//     setError('');
//     try {
//       const fd = new FormData();
//       fd.append('file', file); // Try 'file'
//       const { data } = await axiosInstance.post(`/seller/invoices/${invoice._id}/upload`, fd);
//       if (data.success) {
//         onSuccess(data.data);
//         onClose();
//       }
//     } catch (err) {
//       setError(err?.response?.data?.message || 'Upload failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
//       <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
//         <div className="flex items-center justify-between mb-5">
//           <h3 className="font-black text-slate-900">Upload Invoice Document</h3>
//           <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200">
//             <Icon icon="solar:close-bold" className="w-4 h-4 text-slate-500" />
//           </button>
//         </div>
//         <p className="text-sm text-slate-500 mb-4">Upload a PDF or image of your physical invoice for <strong>{invoice?.invoiceNumber}</strong>.</p>

//         <div
//           className="border-2 border-dashed border-violet-200 bg-violet-50 rounded-2xl p-8 text-center cursor-pointer hover:bg-violet-100 transition-colors mb-4"
//           onClick={() => fileRef.current?.click()}
//         >
//           <Icon icon="solar:upload-minimalistic-bold-duotone" className="w-10 h-10 text-violet-400 mx-auto mb-2" />
//           {file ? (
//             <p className="text-sm font-bold text-violet-700">{file.name}</p>
//           ) : (
//             <>
//               <p className="text-sm font-bold text-violet-700">Click to select file</p>
//               <p className="text-xs text-slate-400 mt-1">PDF only — max 10 MB</p>
//             </>
//           )}
//           <input ref={fileRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={e => { setFile(e.target.files[0]); setError(''); }} />
//         </div>

//         {error && <p className="text-xs text-red-600 mb-3 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

//         <div className="flex gap-3">
//           <button onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
//           <button onClick={handleUpload} disabled={loading || !file} className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
//             {loading ? <Icon icon="svg-spinners:180-ring-with-bg" className="w-4 h-4" /> : <Icon icon="solar:upload-minimalistic-bold-duotone" className="w-4 h-4" />}
//             {loading ? 'Uploading…' : 'Upload & Submit to Platform'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ── Main Page ─────────────────────────────────────────────────── */
// const TABS = [
//   { key: 'bills', label: 'My Bills', icon: 'solar:bill-list-bold-duotone' },
//   { key: 'submit', label: 'Invoices I Need To Submit', icon: 'solar:upload-minimalistic-bold-duotone' },
// ];

// export default function InvoicePage() {
//   const { token } = useSelector(s => s.auth);
//   console.log('Token:', token); // Debugging line to check the token value
//   const [activeTab, setActiveTab] = useState('bills');
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
//   const [viewInvoice, setViewInvoice] = useState(null);
//   const [uploadTarget, setUploadTarget] = useState(null);
//   const [submitting, setSubmitting] = useState(null);

//   /* Filters */
//   const [filters, setFilters] = useState({ invoiceNumber: '', invoiceType: '', dateFrom: '', dateTo: '', status: '' });

//   const loadInvoices = useCallback(async (page = 1) => {
//     if (!token) return;
//     setLoading(true);
//     setError('');
//     try {
//       const params = new URLSearchParams({ tab: activeTab, page, limit: pagination.limit });
//       Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
//       const { data } = await axiosInstance.get(`/seller/invoices?${params}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (data.success) {
//         setInvoices(data.data);
//         setPagination(p => ({ ...p, ...data.pagination, page }));
//       }
//     } catch {
//       setError('Failed to load invoices.');
//     } finally {
//       setLoading(false);
//     }
//   }, [token, activeTab, filters, pagination.limit]);

//   useEffect(() => { loadInvoices(1); }, [activeTab, filters]);

//   /* Submit invoice to platform */
//   const handleSubmit = async (id) => {
//     setSubmitting(id);
//     try {
//       const { data } = await axiosInstance.post(`/seller/invoices/${id}/submit`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (data.success) {
//         setInvoices(prev => prev.map(inv => inv._id === id ? data.data : inv));
//         if (viewInvoice?._id === id) setViewInvoice(data.data);
//       }
//     } catch {
//       alert('Failed to submit invoice. Please try again.');
//     } finally {
//       setSubmitting(null);
//     }
//   };

//   const handleUploadSuccess = (updated) => {
//     setInvoices(prev => prev.map(inv => inv._id === updated._id ? updated : inv));
//     if (viewInvoice?._id === updated._id) setViewInvoice(updated);
//   };

//   /* Tab 1 columns */
//   const BILLS_COLS = ['Invoice #', 'Type', 'Order #', 'Invoice Date', 'Amount', 'Submission Status', 'Actions'];
//   /* Tab 2 columns */
//   const SUBMIT_COLS = ['Explanation', 'Request Date', 'Invoice #', 'Invoice Code', 'Amount', 'Submission Date', 'Status', 'Actions'];

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Header */}
//       <div className="bg-white border-b border-slate-100 px-6 py-5">
//         <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//           <div>
//             <h1 className="text-2xl font-black text-slate-900">Invoice Management</h1>
//             <p className="text-sm text-slate-400 mt-0.5">View, download, and submit your invoices</p>
//           </div>
//           <button onClick={() => loadInvoices(pagination.page)} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
//             <Icon icon="solar:refresh-bold-duotone" className="w-4 h-4" />Refresh
//           </button>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
//         {/* Tabs */}
//         <div className="flex bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm gap-1.5 w-fit">
//           {TABS.map(tab => (
//             <button
//               key={tab.key}
//               onClick={() => setActiveTab(tab.key)}
//               className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.key
//                   ? 'bg-violet-600 text-white shadow-sm'
//                   : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
//                 }`}
//             >
//               <Icon icon={tab.icon} className="w-4 h-4" />
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
//             <input
//               type="text"
//               placeholder="Invoice Number"
//               value={filters.invoiceNumber}
//               onChange={e => setFilters(f => ({ ...f, invoiceNumber: e.target.value }))}
//               className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 placeholder:text-slate-400"
//             />
//             <select
//               value={filters.invoiceType}
//               onChange={e => setFilters(f => ({ ...f, invoiceType: e.target.value }))}
//               className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 bg-white"
//             >
//               <option value="">All Types</option>
//               <option value="order">Sales Order</option>
//               <option value="commission">Commission</option>
//               <option value="refund">Refund</option>
//             </select>
//             {activeTab === 'submit' && (
//               <select
//                 value={filters.status}
//                 onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
//                 className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 bg-white"
//               >
//                 <option value="">All Statuses</option>
//                 {Object.entries(SUBMISSION_META).map(([k, v]) => (
//                   <option key={k} value={k}>{v.label}</option>
//                 ))}
//               </select>
//             )}
//             <input
//               type="date"
//               value={filters.dateFrom}
//               onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
//               className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
//             />
//             <input
//               type="date"
//               value={filters.dateTo}
//               onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
//               className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
//             />
//             <button
//               onClick={() => setFilters({ invoiceNumber: '', invoiceType: '', dateFrom: '', dateTo: '', status: '' })}
//               className="flex items-center justify-center gap-1.5 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
//             >
//               <Icon icon="solar:close-circle-bold-duotone" className="w-4 h-4" />Clear
//             </button>
//           </div>
//         </div>

//         {/* Error */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
//             <Icon icon="solar:danger-triangle-bold-duotone" className="w-4 h-4 flex-shrink-0" />
//             {error}
//           </div>
//         )}

//         {/* Table */}
//         <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-slate-50 border-b border-slate-100">
//                   {(activeTab === 'bills' ? BILLS_COLS : SUBMIT_COLS).map(h => (
//                     <th key={h} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   Array.from({ length: 5 }).map((_, i) => (
//                     <tr key={i} className="border-b border-slate-50">
//                       {Array.from({ length: activeTab === 'bills' ? 7 : 8 }).map((_, j) => (
//                         <td key={j} className="px-4 py-3">
//                           <div className="h-4 bg-slate-100 animate-pulse rounded-lg" />
//                         </td>
//                       ))}
//                     </tr>
//                   ))
//                 ) : invoices.length === 0 ? (
//                   <tr>
//                     <td colSpan={activeTab === 'bills' ? 7 : 8} className="py-16 text-center">
//                       <Icon icon="solar:bill-list-bold-duotone" className="w-14 h-14 text-slate-200 mx-auto mb-3" />
//                       <p className="text-slate-400 font-semibold">No invoices found</p>
//                       <p className="text-xs text-slate-300 mt-1">Go to an order's detail page and click <strong className="text-slate-400">"Upload Invoice"</strong> to create and submit an invoice</p>
//                     </td>
//                   </tr>
//                 ) : activeTab === 'bills' ? (
//                   invoices.map((inv, i) => (
//                     <tr key={inv._id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
//                       <td className="px-4 py-3">
//                         <span className="font-bold text-violet-700">{inv.invoiceNumber}</span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className="text-xs bg-violet-50 text-violet-600 font-bold px-2 py-0.5 rounded-lg">{TYPE_LABELS[inv.invoiceType] || inv.invoiceType}</span>
//                       </td>
//                       <td className="px-4 py-3 text-slate-500 text-xs">{inv.orderNo || '—'}</td>
//                       <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{fmtDate(inv.invoiceDate)}</td>
//                       <td className="px-4 py-3 font-bold text-emerald-600">{fmt(inv.totalSellerEarnings)}</td>
//                       <td className="px-4 py-3"><StatusBadge status={inv.submissionStatus} /></td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-1.5">
//                           <button title="View" onClick={() => setViewInvoice(inv)} className="w-7 h-7 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center transition-colors">
//                             <Icon icon="solar:eye-bold-duotone" className="w-3.5 h-3.5" />
//                           </button>
//                           {['pending_submission', 'rejected'].includes(inv.submissionStatus) && (
//                             <button title="Upload &amp; Submit Invoice" onClick={() => setUploadTarget(inv)} className="w-7 h-7 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center transition-colors">
//                               <Icon icon="solar:file-add-bold-duotone" className="w-3.5 h-3.5" />
//                             </button>
//                           )}
//                           {inv.submissionStatus === 'rejected' && (
//                             <button title="Re-Upload Invoice" onClick={() => setUploadTarget(inv)} className="w-7 h-7 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center transition-colors">
//                               <Icon icon="solar:refresh-bold-duotone" className="w-3.5 h-3.5" />
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   /* Tab 2: Submit To Platform */
//                   invoices.map((inv, i) => {
//                     const canSubmit = ['pending_submission', 'rejected'].includes(inv.submissionStatus);
//                     const canReupload = ['submitted', 'rejected', 'waiting_for_approval'].includes(inv.submissionStatus);
//                     return (
//                       <tr key={inv._id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
//                         <td className="px-4 py-3">
//                           <div className="max-w-[180px]">
//                             <p className="text-xs font-semibold text-slate-700 line-clamp-2">
//                               {inv.submissionStatus === 'rejected' && inv.rejectionReason
//                                 ? `Rejected: ${inv.rejectionReason}`
//                                 : `${TYPE_LABELS[inv.invoiceType] || inv.invoiceType} for order ${inv.orderNo || '—'}`}
//                             </p>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDate(inv.createdAt)}</td>
//                         <td className="px-4 py-3 font-bold text-violet-700 text-xs">{inv.invoiceNumber}</td>
//                         <td className="px-4 py-3 text-xs text-slate-500">{inv.invoiceCode || '—'}</td>
//                         <td className="px-4 py-3 font-bold text-emerald-600">{fmt(inv.totalSellerEarnings)}</td>
//                         <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDate(inv.submissionDate)}</td>
//                         <td className="px-4 py-3"><StatusBadge status={inv.submissionStatus} /></td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-1.5">
//                             <button title="View" onClick={() => setViewInvoice(inv)} className="w-7 h-7 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center transition-colors">
//                               <Icon icon="solar:eye-bold-duotone" className="w-3.5 h-3.5" />
//                             </button>
//                             {canSubmit && (
//                               <button title="Upload & Submit" onClick={() => setUploadTarget(inv)} className="w-7 h-7 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center transition-colors">
//                                 <Icon icon="solar:file-add-bold-duotone" className="w-3.5 h-3.5" />
//                               </button>
//                             )}
//                             {canReupload && (
//                               <button title="Re-Upload" onClick={() => setUploadTarget(inv)} className="w-7 h-7 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center transition-colors">
//                                 <Icon icon="solar:refresh-bold-duotone" className="w-3.5 h-3.5" />
//                               </button>
//                             )}
//                             {inv.uploadedInvoiceUrl && (
//                               <a href={inv.uploadedInvoiceUrl} target="_blank" rel="noreferrer" title="View Uploaded" className="w-7 h-7 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors">
//                                 <Icon icon="solar:document-bold-duotone" className="w-3.5 h-3.5" />
//                               </a>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {!loading && pagination.pages > 1 && (
//             <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
//               <p className="text-xs text-slate-400">
//                 Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} invoices
//               </p>
//               <div className="flex items-center gap-1.5">
//                 <button disabled={pagination.page <= 1} onClick={() => loadInvoices(pagination.page - 1)} className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
//                   <Icon icon="solar:arrow-left-bold" className="w-3.5 h-3.5 text-slate-500" />
//                 </button>
//                 {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
//                   const pg = i + 1;
//                   return (
//                     <button key={pg} onClick={() => loadInvoices(pg)} className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${pagination.page === pg ? 'bg-violet-600 text-white' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
//                       {pg}
//                     </button>
//                   );
//                 })}
//                 <button disabled={pagination.page >= pagination.pages} onClick={() => loadInvoices(pagination.page + 1)} className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
//                   <Icon icon="solar:arrow-right-bold" className="w-3.5 h-3.5 text-slate-500" />
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modals */}
//       {viewInvoice && (
//         <InvoiceModal
//           invoice={viewInvoice}
//           onClose={() => setViewInvoice(null)}
//           onSubmit={async (id) => { await handleSubmit(id); }}
//           onUploadClick={(inv) => { setUploadTarget(inv); }}
//         />
//       )}

//       {uploadTarget && (
//         <UploadModal
//           invoice={uploadTarget}
//           token={token}
//           onClose={() => setUploadTarget(null)}
//           onSuccess={handleUploadSuccess}
//         />
//       )}
//     </div>
//   );
// }
