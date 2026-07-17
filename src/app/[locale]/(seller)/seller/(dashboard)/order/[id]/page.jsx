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
  shipping: { label: "Shipping", bg: "bg-cyan-100", text: "text-cyan-700", icon: "mdi:package-variant" },
  shipment_created: { label: "Shipment Created", bg: "bg-violet-100", text: "text-violet-700", icon: "mdi:truck-check-outline" },
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

/* ── Create Shipment Section ─────────────────────────────────────── */
function CreateShipmentSection({ order, user, token, onCancel, onSuccess, onRateCalculated }) {
  const [step, setStep] = useState('form');   // 'form' | 'confirming' | 'creating'
  const [pkg, setPkg] = useState({ weight: '', width: '', height: '', length: '', packageCount: 1, notes: '', unit: 'CM' });
  const [rateResult, setRateResult] = useState(null);
  const [error, setError] = useState('');

  const shippingAddress = order?.shippingAddress;
  const sellerProfile = order?.sellerProfile;

  const handlePkgChange = (e) => {
    const { name, value } = e.target;
    setPkg(p => ({ ...p, [name]: value }));
    setError('');
  };

  const handleCalculate = async () => {
    if (!pkg.weight || parseFloat(pkg.weight) <= 0) { setError('Weight is required and must be greater than 0'); return; }
    setError('');
    try {
      const { data } = await axiosInstance.post(
        `/seller/orders/${order._id}/shipping/calculate`,
        { 
          weight: parseFloat(pkg.weight), 
          width: parseFloat(pkg.width || 0), 
          height: parseFloat(pkg.height || 0), 
          length: parseFloat(pkg.length || 0),
          unit: pkg.unit 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setRateResult(data.data);
        if (onRateCalculated) onRateCalculated(data.data.cost);
      } else {
        setError(data.message || 'Failed to calculate rate');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to calculate shipping rate');
    }
  };

  const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-violet-400 transition-colors';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
          <Icon icon="mdi:truck-fast-outline" className="w-6 h-6 text-violet-600" />
          Calculate Shipment
        </h2>
        {step !== 'creating' && (
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <Icon icon="mdi:close" className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Addresses (FROM / TO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Icon icon="mdi:store-outline" /> FROM (Seller)</p>
          <p className="font-semibold text-gray-800 text-sm">{sellerProfile?.businessName || sellerProfile?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Your Store')}</p>
          <p className="text-gray-600 text-sm mt-1">{sellerProfile?.storeAddress || user?.address || 'Your Address'}</p>
          <p className="text-gray-600 text-sm">
            {[sellerProfile?.city?.name || user?.city, sellerProfile?.state?.name, sellerProfile?.country?.name || user?.country].filter(Boolean).join(', ')}
          </p>
          <p className="text-gray-500 text-xs mt-2">{sellerProfile?.phoneNumber || user?.phone || ''}</p>
        </div>
        <div className="border border-violet-100 rounded-xl p-4 bg-violet-50">
          <p className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Icon icon="mdi:account-outline" /> TO (Customer)</p>
          <p className="font-semibold text-violet-900 text-sm">{shippingAddress?.fullName}</p>
          <p className="text-violet-700 text-sm mt-1">{shippingAddress?.addressLine}</p>
          <p className="text-violet-700 text-sm">{[shippingAddress?.city, shippingAddress?.state, shippingAddress?.country].filter(Boolean).join(', ')}</p>
          {shippingAddress?.postalCode && <p className="text-violet-600 text-xs mt-1">Postal: {shippingAddress.postalCode}</p>}
          <p className="text-violet-600 text-xs mt-2">{shippingAddress?.phone}</p>
        </div>
      </div>

      {step === 'form' && (
        <div className="grid grid-cols-1 gap-6">
          {/* Package Details */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-1.5"><Icon icon="mdi:package-variant-closed" className="text-gray-400" /> Package Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="col-span-1 md:col-span-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Weight (kg) *</label>
                <input type="number" name="weight" value={pkg.weight} onChange={handlePkgChange} min="0.1" step="0.1" placeholder="e.g. 1.5" className={inputCls} />
              </div>
              <div className="col-span-1 md:col-span-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Unit</label>
                <select name="unit" value={pkg.unit} onChange={handlePkgChange} className={inputCls}>
                  <option value="CM">CM</option>
                  <option value="IN">IN</option>
                </select>
              </div>
              {[{ name: 'length', label: 'Length' }, { name: 'width', label: 'Width' }, { name: 'height', label: 'Height' }].map(f => (
                <div key={f.name} className="col-span-1 md:col-span-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label} ({pkg.unit})</label>
                  <input type="number" name={f.name} value={pkg[f.name]} onChange={handlePkgChange} min="0" step="1" placeholder="0" className={inputCls} />
                </div>
              ))}
              <div className="col-span-1 md:col-span-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Package Count *</label>
                <input type="number" name="packageCount" value={pkg.packageCount} onChange={handlePkgChange} min="1" step="1" className={inputCls} />
              </div>
              <div className="col-span-2 md:col-span-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Special Instructions (Optional)</label>
                <input type="text" name="notes" value={pkg.notes} onChange={handlePkgChange} placeholder="Fragile, handle with care…" className={inputCls} />
              </div>
            </div>
          </div>

          <div>
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-4 text-xs text-red-700">
                <Icon icon="mdi:alert-circle-outline" className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            {rateResult && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-xs font-bold text-green-700 mb-1">Calculated Cost</p>
                <p className="text-2xl font-extrabold text-green-800">{rateResult.cost?.toFixed(2)} {rateResult.currency}</p>
                <p className="text-xs text-green-600 mt-2">
                  This is just a calculated estimate for now.
                </p>
              </div>
            )}

            <button onClick={handleCalculate} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm">
              <Icon icon="mdi:calculator-variant-outline" className="w-5 h-5" /> Calculate Rate
            </button>
          </div>
        </div>
      )}

      {step === 'creating' && (
        <div className="flex flex-col items-center py-12">
          <Icon icon="svg-spinners:180-ring-with-bg" className="w-12 h-12 text-violet-500 mb-4" />
          <p className="text-base font-bold text-gray-800">Processing Payment & Shipment…</p>
          <p className="text-sm text-gray-500 mt-1">Please do not close this window.</p>
        </div>
      )}
    </div>
  );
}

/* ── Shipment Info Card ─────────────────────────────────────────── */
function ShipmentInfoCard({ shipment }) {
  if (!shipment || shipment.status === 'not_created') return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
          <Icon icon="mdi:truck-check-outline" className="w-4 h-4 text-cyan-600" />
        </div>
        <h2 className="font-bold text-gray-900">Aras Cargo Shipment</h2>
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${shipment.status === 'created' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
          {shipment.status === 'created' ? 'Created' : 'Failed'}
        </span>
      </div>

      <div className="space-y-3 text-sm">
        {shipment.trackingNumber && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">Tracking No.</span>
            <span className="font-mono font-bold text-violet-700 text-xs">{shipment.trackingNumber}</span>
          </div>
        )}
        {shipment.shippingCost > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">Shipping Cost (deducted)</span>
            <span className="font-bold text-red-600">-{shipment.shippingCost?.toFixed(2)} TRY</span>
          </div>
        )}
        {shipment.createdAt && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">Created</span>
            <span className="text-xs text-gray-500">{new Date(shipment.createdAt).toLocaleString()}</span>
          </div>
        )}
        {shipment.packageDetails?.weight && (
          <div className="bg-gray-50 rounded-xl p-2.5 text-xs">
            <p className="font-bold text-gray-500 mb-1 uppercase">Package</p>
            <p className="text-gray-700">
              {shipment.packageDetails.weight}kg
              {shipment.packageDetails.width ? ` · ${shipment.packageDetails.width}×${shipment.packageDetails.height}×${shipment.packageDetails.length}cm` : ''}
            </p>
          </div>
        )}
        <div className="flex flex-col gap-2 mt-2">
          {shipment.trackingUrl && (
            <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-bold py-2.5 rounded-xl transition-colors">
              <Icon icon="mdi:map-search-outline" className="w-4 h-4" /> Track Shipment
            </a>
          )}
          {shipment.labelUrl && (
            <a href={shipment.labelUrl} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold py-2.5 rounded-xl transition-colors">
              <Icon icon="mdi:download" className="w-4 h-4" /> Download Label (PDF)
            </a>
          )}
        </div>
      </div>
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
  const { user, token } = useSelector((s) => s.auth);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  /* Invoice state */
  const [invoice, setInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  /* Shipment state */
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [calculatedShippingCost, setCalculatedShippingCost] = useState(0);

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

  /* Shipment success handler */
  const handleShipmentSuccess = (shipmentData) => {
    // Optimistically update order state so UI refreshes without full reload
    setOrder(prev => ({
      ...prev,
      orderStatus: 'shipping',
      shippingFee: shipmentData.shippingCost,
      shipment: {
        status: 'created',
        trackingNumber: shipmentData.trackingNumber,
        trackingUrl: shipmentData.trackingUrl,
        labelUrl: shipmentData.labelUrl,
        shippingCost: shipmentData.shippingCost,
        createdAt: new Date().toISOString(),
        packageDetails: {},
      },
    }));
    toast.success(`Shipment created! Tracking: ${shipmentData.trackingNumber}`);
    // Refresh full order after a short delay for accuracy
    setTimeout(() => fetchOrderDetails(), 1000);
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

  /* Shipment helpers */
  const shipment = order.shipment;
  const shipmentCreated = shipment?.status === 'created';
  const canCreateShipment = !shipmentCreated && !['cancelled', 'delivered'].includes(order.orderStatus);

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
          {/* Create Shipment button */}
          {canCreateShipment && !showShipmentForm && (
            <button
              onClick={() => setShowShipmentForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Icon icon="mdi:truck-plus-outline" className="w-4 h-4" />
              Create Shipment
            </button>
          )}
          {shipmentCreated && (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700">
              <Icon icon="mdi:truck-check-outline" className="w-4 h-4" />
              Shipment Active
            </span>
          )}

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
                <option value="shipping" disabled={!shipmentCreated}>Shipping {!shipmentCreated ? '(create shipment first)' : ''}</option>
                <option value="shipment_created" disabled={!shipmentCreated}>Shipment Created {!shipmentCreated ? '(create shipment first)' : ''}</option>
                <option value="shipped" disabled={!shipmentCreated}>Shipped {!shipmentCreated ? '(create shipment first)' : ''}</option>
                <option value="delivered" disabled={!shipmentCreated}>Delivered {!shipmentCreated ? '(create shipment first)' : ''}</option>
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

          {/* Create Shipment Inline Section */}
          {showShipmentForm && !shipmentCreated && (
            <CreateShipmentSection
              order={order}
              user={user}
              token={token}
              onCancel={() => setShowShipmentForm(false)}
              onSuccess={(data) => { setShowShipmentForm(false); handleShipmentSuccess(data); }}
              onRateCalculated={(cost) => setCalculatedShippingCost(cost)}
            />
          )}

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
              {/* Shipping cost row */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Icon icon="mdi:truck-outline" className="w-4 h-4" />Shipping (from your wallet)
                </span>
                {shipmentCreated ? (
                  <span className="font-semibold text-red-600">-{(order.shippingFee || 0).toFixed(2)} TRY</span>
                ) : calculatedShippingCost > 0 ? (
                  <span className="font-semibold text-red-600">-{calculatedShippingCost.toFixed(2)} TRY (Est)</span>
                ) : (
                  <span className="text-xs text-gray-400 italic">Pending shipment</span>
                )}
              </div>
              <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                <span className="font-bold text-gray-700 flex items-center gap-1.5">
                  <Icon icon="mdi:sigma" className="w-4 h-4" />Order Total (customer paid)
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
                <span className="text-xl font-extrabold text-emerald-700">
                  ${(totalSellerEarnings - (shipmentCreated ? (order.shippingFee || 0) : calculatedShippingCost)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Invoice Status + Order Meta + Customer + Shipping + Payment ── */}
        <div className="flex flex-col gap-6">

          {/* Aras Cargo Shipment Info Card */}
          <ShipmentInfoCard shipment={shipment} />

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
                  {[order.shippingAddress.city, order.shippingAddress.state].filter(Boolean).join(', ')}
                </p>
                {order.shippingAddress.country && (
                  <p className="text-gray-600 flex items-center gap-1.5">
                    <Icon icon="mdi:earth" className="w-4 h-4 text-gray-400" />
                    {order.shippingAddress.country}
                  </p>
                )}
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
