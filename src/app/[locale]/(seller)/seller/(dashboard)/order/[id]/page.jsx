"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Image from "next/image";
import moment from "moment";

const STATUS_CONFIG = {
  pending: { label: "Pending", bg: "bg-blue-100", text: "text-blue-700", icon: "mdi:clock-outline" },
  processing: { label: "Processing", bg: "bg-indigo-100", text: "text-indigo-700", icon: "mdi:cogs" },
  shipped: { label: "Shipped", bg: "bg-amber-100", text: "text-amber-700", icon: "mdi:truck-delivery-outline" },
  delivered: { label: "Delivered", bg: "bg-emerald-100", text: "text-emerald-700", icon: "mdi:package-check" },
  on_hold: { label: "On Hold", bg: "bg-orange-100", text: "text-orange-700", icon: "mdi:pause-circle-outline" },
  cancelled: { label: "Cancelled", bg: "bg-red-100", text: "text-red-700", icon: "mdi:cancel" },
};

const PAYMENT_CONFIG = {
  PAID: { label: "Paid", bg: "bg-emerald-100", text: "text-emerald-700" },
  PENDING: { label: "Pending", bg: "bg-yellow-100", text: "text-yellow-700" },
  FAILED: { label: "Failed", bg: "bg-red-100", text: "text-red-700" },
};

const INVOICE_STATUS_META = {
  pending_submission: { label: "Pending Submission", bg: "bg-slate-100", text: "text-slate-600", dot: "#64748b" },
  submitted: { label: "Submitted", bg: "bg-blue-100", text: "text-blue-700", dot: "#2563eb" },
  waiting_for_approval: { label: "Waiting Approval", bg: "bg-amber-100", text: "text-amber-700", dot: "#d97706" },
  approved: { label: "Approved", bg: "bg-emerald-100", text: "text-emerald-700", dot: "#059669" },
  rejected: { label: "Rejected", bg: "bg-red-100", text: "text-red-700", dot: "#dc2626" },
};

function InvoiceStatusBadge({ status }) {
  const m = INVOICE_STATUS_META[status] || INVOICE_STATUS_META.pending_submission;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${m.bg} ${m.text}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}

function InfoRow({ label, value, mono = false, icon }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
        {icon && <Icon icon={icon} className="w-3 h-3" />}
        {label}
      </span>
      <span className={`text-sm font-semibold text-gray-800 break-all ${mono ? "font-mono" : ""}`}>
        {value || <span className="text-gray-400 font-normal italic">N/A</span>}
      </span>
    </div>
  );
}

/* ── Upload Invoice Modal ──────────────────────────────────────── */
function UploadInvoiceModal({ invoice, orderId, token, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleUpload = async () => {
    if (!file) { setError('Please select a PDF file.'); return; }
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);

      let url = '/seller/invoices/upload';
      if (invoice) {
        url = `/seller/invoices/${invoice._id}/reupload`;
      } else if (orderId) {
        fd.append('orderId', orderId);
      }

      const { data } = await axiosInstance.post(url, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (data.success) {
        toast.success('Invoice uploaded and submitted to platform for review.');
        onSuccess(data.data);
        // We let the parent decide if it should close, or we can just call onClose
        onClose();
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={invoice ? onClose : undefined}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-black text-gray-900 text-lg">Upload Invoice PDF</h3>
            {invoice && invoice.invoiceNumber && (
              <p className="text-xs text-gray-400 mt-0.5">Invoice {invoice.invoiceNumber}</p>
            )}
            {!invoice && (
              <p className="text-xs text-red-500 mt-0.5 font-bold">You must upload an invoice to proceed.</p>
            )}
          </div>
          {invoice && (
            <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Icon icon="mdi:close" className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Upload requirements */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
          <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1.5">
            <Icon icon="mdi:information-outline" className="w-4 h-4" />
            Invoice must include:
          </p>
          <ul className="text-xs text-blue-600 space-y-1">
            {['Seller Details', 'Customer Details', 'Order Details', 'Product Details', 'Pricing Breakdown', 'Invoice Number'].map(item => (
              <li key={item} className="flex items-center gap-1.5">
                <Icon icon="mdi:check-circle-outline" className="w-3.5 h-3.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors mb-4 ${file ? 'border-emerald-300 bg-emerald-50' : 'border-violet-200 bg-violet-50 hover:bg-violet-100'
            }`}
          onClick={() => fileRef.current?.click()}
        >
          <Icon
            icon={file ? "mdi:file-pdf-box" : "mdi:cloud-upload-outline"}
            className={`w-12 h-12 mx-auto mb-2 ${file ? 'text-emerald-500' : 'text-violet-400'}`}
          />
          {file ? (
            <>
              <p className="text-sm font-bold text-emerald-700">{file.name}</p>
              <p className="text-xs text-emerald-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-violet-700">Click to select PDF</p>
              <p className="text-xs text-gray-400 mt-1">Only PDF — max 10 MB</p>
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
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-4 text-xs text-red-700">
            <Icon icon="mdi:alert-circle-outline" className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          {invoice && (
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-2xl text-sm transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading
              ? <><Icon icon="svg-spinners:180-ring-with-bg" className="w-4 h-4" /> Uploading…</>
              : <><Icon icon="mdi:upload" className="w-4 h-4" /> Upload &amp; Submit</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────── */
export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useSelector((s) => s.auth);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  /* Invoice state */
  const [invoice, setInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    if (!token || !id) return;
    try {
      const res = await axiosInstance.get(`/seller/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load order details");
      router.push("/seller/order");
    } finally {
      setLoading(false);
    }
  }, [id, token, router]);

  const fetchInvoice = useCallback(async () => {
    if (!token || !id) return;
    setInvoiceLoading(true);
    try {
      const { data } = await axiosInstance.get(`/seller/invoices/by-order/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setInvoice(data.data);
    } catch {
      /* no invoice yet — that's fine */
    } finally {
      setInvoiceLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchOrderDetails();
    fetchInvoice();
  }, [fetchOrderDetails, fetchInvoice]);

  // Force show upload modal if no invoice
  useEffect(() => {
    if (!loading && !invoiceLoading && order && order.orderStatus !== 'cancelled' && !invoice) {
      setShowUploadModal(true);
    }
  }, [loading, invoiceLoading, order, invoice]);

  const updateStatus = async (newStatus) => {
    setStatusUpdateLoading(true);
    try {
      await axiosInstance.put(
        '/seller/orders/status',
        { orderId: order._id, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Order status updated");
      fetchOrderDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  /* Create invoice entry (if none) then open upload modal */
  const handleOpenUploadModal = () => {
    setShowUploadModal(true);
  };

  const handleUploadSuccess = (updated) => {
    setInvoice(updated);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="mdi:loading" className="w-10 h-10 animate-spin text-primary-500" />
          <p className="text-sm text-gray-400">Loading order details…</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statusConf = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
  const payConf = PAYMENT_CONFIG[order.paymentStatus] || PAYMENT_CONFIG.PENDING;

  const totalSellerEarnings = order.items?.reduce((a, i) => a + (i.sellerEarnings || 0), 0) || 0;
  const totalPlatformFee = order.items?.reduce((a, i) => a + (i.platformFee || 0), 0) || 0;
  const canChangeStatus = !["delivered", "cancelled"].includes(order.orderStatus);
  const canUploadInvoice = order.orderStatus !== 'cancelled';
  const canReUpload = invoice && ['rejected', 'pending_submission'].includes(invoice.status);

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">

      {/* ── Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 mt-1 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Order Details</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-sm font-mono font-bold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-lg border border-primary-100">
                {order.orderId}
              </span>
              {order.orderNo && (
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                  {order.orderNo}
                </span>
              )}
              <span className="text-xs text-gray-400">
                {moment(order.createdAt).format("DD MMM YYYY [at] hh:mm A")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
          {/* Upload Invoice button */}
          {canUploadInvoice && (
            <button
              onClick={handleOpenUploadModal}
              disabled={creatingInvoice}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm ${canReUpload
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : invoice?.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-700 cursor-default'
                  : 'bg-violet-600 hover:bg-violet-700 text-white'
                }`}
            >
              {creatingInvoice
                ? <Icon icon="svg-spinners:180-ring-with-bg" className="w-4 h-4" />
                : <Icon icon={canReUpload ? "mdi:refresh" : "mdi:upload"} className="w-4 h-4" />
              }
              {invoice
                ? (canReUpload ? 'Re-Upload Invoice' : invoice.status === 'approved' ? 'Invoice Approved' : 'View Invoice')
                : 'Upload Invoice'
              }
            </button>
          )}

          {/* Order status badge + selector */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusConf.bg} ${statusConf.text}`}>
            <Icon icon={statusConf.icon} className="w-3.5 h-3.5" />
            {statusConf.label}
          </div>
          {canChangeStatus && (
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
              <Icon icon="mdi:swap-horizontal" className="w-4 h-4 text-gray-400" />
              <select
                disabled={statusUpdateLoading}
                value={order.orderStatus}
                onChange={(e) => updateStatus(e.target.value)}
                className="text-sm font-semibold text-gray-700 focus:outline-none bg-transparent pr-1 disabled:opacity-50"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {statusUpdateLoading && (
                <Icon icon="mdi:loading" className="w-4 h-4 animate-spin text-primary-500" />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── LEFT: Items + Financial Summary ── */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Icon icon="mdi:package-variant-closed" className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">
                Order Items
                <span className="ml-2 text-sm font-normal text-gray-400">({order.items?.length} item{order.items?.length !== 1 ? "s" : ""})</span>
              </h2>
            </div>

            <div className="divide-y divide-gray-50">
              {order.items?.map((item, idx) => {
                const product = item.productId || {};
                const imageUrl = product.images?.[0]?.url;
                const variantLabel = item.variant?.color || "Default Variant";

                return (
                  <div key={idx} className="p-5 flex gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="w-20 h-20 flex-shrink-0 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden relative">
                      {imageUrl ? (
                        <Image src={imageUrl} alt={product.title || "Product"} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Icon icon="mdi:image-outline" className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 text-sm mb-1">
                        {product.title || "Unknown Product"}
                      </h3>

                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 border border-primary-100 px-2 py-0.5 rounded-lg font-semibold">
                          <Icon icon="mdi:palette-outline" className="w-3 h-3" />
                          {variantLabel}
                        </span>
                        {product.barcode && (
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-mono">
                            <Icon icon="mdi:barcode" className="w-3 h-3" />
                            {product.barcode}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 p-2.5 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Unit Price</p>
                          <p className="text-sm font-bold text-gray-800">${(item.price || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Qty</p>
                          <p className="text-sm font-bold text-gray-800">× {item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-amber-500 uppercase font-bold">Platform Fee</p>
                          <p className="text-sm font-bold text-amber-600">-${(item.platformFee || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-emerald-600 uppercase font-bold">Your Earnings</p>
                          <p className="text-sm font-bold text-emerald-700">${(item.sellerEarnings || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right self-start">
                      <p className="text-xs text-gray-400 mb-0.5">Total</p>
                      <p className="text-base font-extrabold text-gray-900">
                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block ${STATUS_CONFIG[item.itemStatus]?.bg || "bg-gray-100"} ${STATUS_CONFIG[item.itemStatus]?.text || "text-gray-500"}`}>
                        {item.itemStatus || "pending"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Icon icon="mdi:receipt-text-outline" className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">Financial Summary</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Icon icon="mdi:cart-outline" className="w-4 h-4" />Subtotal (customer paid)
                </span>
                <span className="font-semibold text-gray-800">${(order.subTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Icon icon="mdi:truck-outline" className="w-4 h-4" />Shipping Fee
                </span>
                <span className="font-semibold text-gray-800">${(order.shippingFee || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                <span className="font-bold text-gray-700 flex items-center gap-1.5">
                  <Icon icon="mdi:sigma" className="w-4 h-4" />Order Total
                </span>
                <span className="font-extrabold text-gray-900">${(order.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                  <Icon icon="mdi:percent" className="w-4 h-4" />Platform Fee (deducted)
                </span>
                <span className="font-extrabold text-amber-700">-${totalPlatformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                  <Icon icon="mdi:wallet-outline" className="w-4 h-4" />Your Earnings
                </span>
                <span className="text-xl font-extrabold text-emerald-700">${totalSellerEarnings.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Invoice Status + Order Meta + Customer + Shipping + Payment ── */}
        <div className="flex flex-col gap-6">

          {/* Invoice Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <Icon icon="mdi:file-document-outline" className="w-4 h-4 text-violet-600" />
              </div>
              <h2 className="font-bold text-gray-900">Invoice</h2>
            </div>

            {invoiceLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 animate-pulse rounded-lg" />
                <div className="h-4 bg-gray-100 animate-pulse rounded-lg w-2/3" />
              </div>
            ) : invoice ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-bold uppercase">Status</span>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-bold uppercase">Invoice #</span>
                  <span className="text-sm font-bold text-violet-700">{invoice.invoiceNumber}</span>
                </div>
                {invoice.invoiceCode && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-bold uppercase">Code</span>
                    <span className="text-xs font-mono text-gray-600">{invoice.invoiceCode}</span>
                  </div>
                )}
                {invoice.submissionDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-bold uppercase">Submitted</span>
                    <span className="text-xs text-gray-500">{moment(invoice.submissionDate).format('DD MMM YYYY')}</span>
                  </div>
                )}
                {invoice.status === 'rejected' && invoice.rejectionReason && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 mt-2">
                    <p className="text-[11px] font-bold text-red-700 mb-0.5">Rejection Reason</p>
                    <p className="text-xs text-red-600">{invoice.rejectionReason}</p>
                  </div>
                )}
                {invoice?.pdfUrl && (
                  <a
                    href={`${invoice.pdfUrl}?fl_attachment=1`}
                    download
                    className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2.5 rounded-xl transition-colors"
                  >
                    <Icon icon="mdi:download" className="w-4 h-4" />
                    Download Invoice
                  </a>
                )}
                {canReUpload && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="w-full mt-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
                  >
                    <Icon icon="mdi:upload" className="w-3.5 h-3.5" />
                    Re-Upload Invoice
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-3">
                <Icon icon="mdi:file-plus-outline" className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400 font-semibold">No invoice yet</p>
                <p className="text-xs text-gray-300 mt-0.5">Upload your invoice PDF to submit to platform</p>
                {canUploadInvoice && (
                  <button
                    onClick={handleOpenUploadModal}
                    disabled={creatingInvoice}
                    className="mt-3 flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
                  >
                    {creatingInvoice
                      ? <Icon icon="svg-spinners:180-ring-with-bg" className="w-3.5 h-3.5" />
                      : <Icon icon="mdi:upload" className="w-3.5 h-3.5" />
                    }
                    Upload Invoice
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Order Identifiers */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="mdi:identifier" className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">Order Info</h2>
            </div>
            <div className="space-y-3">
              <InfoRow label="Order ID" value={order.orderId} mono icon="mdi:tag-outline" />
              <InfoRow label="Order No" value={order.orderNo} mono icon="mdi:pound" />
              <InfoRow label="Internal ID" value={order._id} mono icon="mdi:database-outline" />
              <InfoRow label="Placed On" value={moment(order.createdAt).format("DD MMM YYYY, hh:mm A")} icon="mdi:calendar-outline" />
              {order.completionDate && (
                <InfoRow label="Completed On" value={moment(order.completionDate).format("DD MMM YYYY")} icon="mdi:calendar-check-outline" />
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="mdi:credit-card-outline" className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">Payment</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-gray-400">Status</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${payConf.bg} ${payConf.text}`}>
                  {payConf.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-gray-400">Method</span>
                <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <Icon icon={order.paymentMethod === "CARD" ? "mdi:credit-card-outline" : "mdi:cash"} className="w-4 h-4 text-gray-500" />
                  {order.paymentMethod}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="mdi:account-outline" className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">Customer</h2>
            </div>
            <div className="space-y-3">
              <InfoRow
                label="Name"
                value={order.shippingAddress?.fullName || `${order.userId?.firstName || ""} ${order.userId?.lastName || ""}`.trim() || "Guest"}
                icon="mdi:account-circle-outline"
              />
              <InfoRow label="Email" value={order.userId?.email} icon="mdi:email-outline" />
              <InfoRow label="Phone" value={order.shippingAddress?.phone || order.userId?.phone} icon="mdi:phone-outline" />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="mdi:map-marker-outline" className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">Shipping Address</h2>
            </div>
            {order.shippingAddress ? (
              <div className="space-y-2 text-sm">
                <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
                <p className="text-gray-600 flex items-start gap-1.5">
                  <Icon icon="mdi:home-outline" className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  {order.shippingAddress.addressLine}
                </p>
                <p className="text-gray-600 flex items-center gap-1.5">
                  <Icon icon="mdi:city-variant-outline" className="w-4 h-4 text-gray-400" />
                  {[order.shippingAddress.area, order.shippingAddress.city].filter(Boolean).join(", ")}
                </p>
                {order.shippingAddress.postalCode && (
                  <p className="text-gray-500 text-xs font-mono">Postal: {order.shippingAddress.postalCode}</p>
                )}
                <p className="text-gray-600 flex items-center gap-1.5 pt-1 border-t border-gray-100">
                  <Icon icon="mdi:phone-outline" className="w-4 h-4 text-gray-400" />
                  {order.shippingAddress.phone}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No shipping address provided.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Upload Invoice Modal ── */}
      {showUploadModal && (
        <UploadInvoiceModal
          invoice={invoice}
          orderId={id}
          token={token}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
