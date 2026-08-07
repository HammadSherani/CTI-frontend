"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Image from "next/image";
import moment from "moment";

const STATUS_CONFIG = {
  pending:    { label: "Pending",    bg: "bg-blue-100",   text: "text-blue-700",   icon: "mdi:clock-outline" },
  processing: { label: "Processing", bg: "bg-indigo-100", text: "text-indigo-700", icon: "mdi:cogs" },
  shipping:   { label: "Shipping",   bg: "bg-cyan-100",   text: "text-cyan-700",   icon: "mdi:package-variant" },
  shipped:    { label: "Shipped",    bg: "bg-amber-100",  text: "text-amber-700",  icon: "mdi:truck-delivery-outline" },
  delivered:  { label: "Delivered",  bg: "bg-emerald-100",text: "text-emerald-700",icon: "mdi:package-check" },
  cancelled:  { label: "Cancelled",  bg: "bg-red-100",    text: "text-red-700",    icon: "mdi:cancel" },
};

const PAYMENT_CONFIG = {
  PAID:    { label: "Paid",    bg: "bg-emerald-100", text: "text-emerald-700" },
  PENDING: { label: "Pending", bg: "bg-yellow-100",  text: "text-yellow-700" },
  FAILED:  { label: "Failed",  bg: "bg-red-100",     text: "text-red-700" },
};

const ALLOWED_TRANSITIONS = {
  pending:    ["processing", "shipping", "shipped", "cancelled"],
  processing: ["shipping", "shipped", "cancelled"],
  shipping:   ["shipped", "cancelled"],
  shipped:    ["delivered", "cancelled"],
  delivered:  [],
  cancelled:  [],
};

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

/* ── Shipment Info Card ─────────────────────────────────────────── */
function ShipmentInfoCard({ shipment }) {
  if (!shipment || shipment.status === "not_created") return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
          <Icon icon="mdi:truck-check-outline" className="w-4 h-4 text-cyan-600" />
        </div>
        <h2 className="font-bold text-gray-900">Aras Cargo Shipment</h2>
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
          shipment.status === "created" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        }`}>
          {shipment.status === "created" ? "Created" : "Failed"}
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
            <span className="text-xs font-bold uppercase text-gray-400">Shipping Cost</span>
            <span className="font-bold text-red-600">{shipment.shippingCost?.toFixed(2)} {shipment.currency}</span>
          </div>
        )}
        {shipment.createdAt && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">Created</span>
            <span className="text-xs text-gray-500">{new Date(shipment.createdAt).toLocaleString()}</span>
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

/* ── Create Shipment Section ─────────────────────────────────────── */
function CreateShipmentSection({ order, token, onCancel, onSuccess, onRateCalculated }) {
  const [pkg, setPkg] = useState({ weight: "", width: "", height: "", length: "", packageCount: 1, notes: "", unit: "CM" });
  const [rateResult, setRateResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handlePkgChange = (e) => {
    const { name, value } = e.target;
    setPkg((p) => ({ ...p, [name]: value }));
    setError("");
    if (name === "weight") setRateResult(null);
  };

  const handleCalculate = async () => {
    if (!pkg.weight || parseFloat(pkg.weight) <= 0) { setError("Weight is required and must be greater than 0"); return; }
    setCalculating(true);
    setError("");
    try {
      const { data } = await axiosInstance.post(
        `/admin/refurbish/orders/${order._id}/shipping/calculate`,
        { weight: parseFloat(pkg.weight), width: parseFloat(pkg.width || 0), height: parseFloat(pkg.height || 0), length: parseFloat(pkg.length || 0) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setRateResult(data.data);
        if (onRateCalculated) onRateCalculated(data.data.cost);
      } else {
        setError(data.message || "Failed to calculate rate");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to calculate shipping rate");
    } finally {
      setCalculating(false);
    }
  };

  const handleCreate = async () => {
    if (!rateResult) { setError("Please calculate rate first"); return; }
    setCreating(true);
    setError("");
    try {
      const { data } = await axiosInstance.post(
        `/admin/refurbish/orders/${order._id}/shipping/create`,
        {
          weight:       parseFloat(pkg.weight),
          width:        parseFloat(pkg.width  || 0),
          height:       parseFloat(pkg.height || 0),
          length:       parseFloat(pkg.length || 0),
          packageCount: parseInt(pkg.packageCount || 1),
          notes:        pkg.notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        onSuccess(data.data);
      } else {
        setError(data.message || "Shipment creation failed");
        setCreating(false);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Shipment creation failed");
      setCreating(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-violet-400 transition-colors bg-white";

  if (creating) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6">
        <div className="flex flex-col items-center py-10">
          <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center mb-4">
            <Icon icon="svg-spinners:180-ring-with-bg" className="w-8 h-8 text-violet-500" />
          </div>
          <p className="text-base font-extrabold text-gray-800">Creating Shipment…</p>
          <p className="text-sm text-gray-400 mt-1">Booking with Aras Cargo — please wait.</p>
          <div className="mt-4 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2">
            <Icon icon="mdi:information-outline" className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700 font-semibold">Do not close or refresh this window.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
          <Icon icon="mdi:truck-fast-outline" className="w-6 h-6 text-violet-600" />
          Create Shipment
        </h2>
        <button onClick={onCancel} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Icon icon="mdi:close" className="w-5 h-5" />
        </button>
      </div>

      {/* TO address */}
      <div className="border border-violet-100 rounded-xl p-4 bg-violet-50 mb-6">
        <p className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Icon icon="mdi:account-outline" className="w-3.5 h-3.5" /> TO (Customer)
        </p>
        <p className="font-semibold text-violet-900 text-sm">{order.shippingAddress?.fullName}</p>
        <p className="text-violet-700 text-sm mt-1">{order.shippingAddress?.addressLine}</p>
        <p className="text-violet-700 text-sm">{[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.country].filter(Boolean).join(", ")}</p>
        {order.shippingAddress?.postalCode && <p className="text-violet-600 text-xs mt-1">Postal: {order.shippingAddress.postalCode}</p>}
        {order.shippingAddress?.phone && <p className="text-violet-600 text-xs mt-1">{order.shippingAddress.phone}</p>}
      </div>

      {/* Package Details */}
      <p className="font-bold text-gray-800 text-sm flex items-center gap-1.5 mb-4">
        <Icon icon="mdi:package-variant-closed" className="w-4 h-4 text-gray-400" /> Package Details
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Weight (kg) *</label>
          <input type="number" name="weight" value={pkg.weight} onChange={handlePkgChange} min="0.1" step="0.1" placeholder="e.g. 1.5" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Unit</label>
          <select name="unit" value={pkg.unit} onChange={handlePkgChange} className={inputCls}>
            <option value="CM">CM</option>
            <option value="IN">IN</option>
          </select>
        </div>
        {[{ name: "length", label: "Length" }, { name: "width", label: "Width" }, { name: "height", label: "Height" }].map((f) => (
          <div key={f.name}>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">{f.label} ({pkg.unit})</label>
            <input type="number" name={f.name} value={pkg[f.name]} onChange={handlePkgChange} min="0" step="1" placeholder="0" className={inputCls} />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Package Count</label>
          <input type="number" name="packageCount" value={pkg.packageCount} onChange={handlePkgChange} min="1" step="1" className={inputCls} />
        </div>
        <div className="col-span-2 md:col-span-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Special Instructions (Optional)</label>
          <input type="text" name="notes" value={pkg.notes} onChange={handlePkgChange} placeholder="Fragile, handle with care…" className={inputCls} />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-4 text-xs text-red-700 font-semibold">
          <Icon icon="mdi:alert-circle-outline" className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {/* Rate result banner */}
      {rateResult && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-5">
          <div>
            <p className="text-xs font-bold text-emerald-700">Calculated Rate</p>
            <p className="text-xl font-extrabold text-emerald-800 mt-0.5">{rateResult.cost?.toFixed(2)} {rateResult.currency}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-emerald-600">Est. delivery</p>
            <p className="text-sm font-bold text-emerald-700 mt-0.5">{rateResult.estimatedDays} day(s)</p>
          </div>
          <Icon icon="mdi:check-circle-outline" className="w-8 h-8 text-emerald-400" />
        </div>
      )}

      {!rateResult && (
        <p className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
          <Icon icon="mdi:information-outline" className="w-3.5 h-3.5" />
          Calculate the rate first, then confirm to create the shipment.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleCalculate}
          disabled={calculating}
          className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          {calculating
            ? <><Icon icon="svg-spinners:180-ring-with-bg" className="w-4 h-4" /> Calculating…</>
            : <><Icon icon="mdi:calculator-variant-outline" className="w-5 h-5" /> Calculate Rate</>
          }
        </button>
        <button
          onClick={handleCreate}
          disabled={!rateResult || calculating}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Icon icon="mdi:truck-plus-outline" className="w-5 h-5" />
          {rateResult ? "Create Shipment" : "Calculate First"}
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────── */
export default function AdminRefurbishedOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useSelector((s) => s.auth);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [calculatedShippingCost, setCalculatedShippingCost] = useState(0);

  const fetchOrder = useCallback(async () => {
    if (!token || !id) return;
    try {
      const { data } = await axiosInstance.get(`/admin/refurbish/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setOrder(data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load order details");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const updateStatus = async (newStatus) => {
    setStatusUpdateLoading(true);
    try {
      await axiosInstance.put(
        `/admin/refurbish/orders/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Order status updated");
      fetchOrder();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleShipmentSuccess = (shipmentData) => {
    setShowShipmentForm(false);
    setOrder((prev) => ({
      ...prev,
      orderStatus: "shipping",
      shippingFee: shipmentData.shippingCost,
      shipment: {
        status:         "created",
        trackingNumber: shipmentData.trackingNumber,
        trackingUrl:    shipmentData.trackingUrl,
        labelUrl:       shipmentData.labelUrl,
        shippingCost:   shipmentData.shippingCost,
        currency:       shipmentData.currency,
        createdAt:      new Date().toISOString(),
      },
    }));
    toast.success(`Shipment created! Tracking: ${shipmentData.trackingNumber}`);
    setTimeout(() => fetchOrder(), 1000);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">
        {/* Skeleton header */}
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse flex-shrink-0 mt-1" />
          <div className="space-y-2">
            <div className="h-7 w-40 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                    <div className="h-8 w-full bg-gray-50 rounded-xl animate-pulse mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statusConf = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
  const payConf    = PAYMENT_CONFIG[order.paymentStatus] || PAYMENT_CONFIG.PENDING;
  const transitions = ALLOWED_TRANSITIONS[order.orderStatus] || [];
  const canChangeStatus = transitions.length > 0;

  const shipment = order.shipment;
  const shipmentCreated = shipment?.status === "created";
  const canCreateShipment = !shipmentCreated && !["cancelled", "delivered"].includes(order.orderStatus);

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
                {order.orderId || order._id}
              </span>
              {order.orderNo && (
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{order.orderNo}</span>
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-cyan-600 hover:bg-cyan-700 text-white transition-colors shadow-sm"
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

          {/* Status badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusConf.bg} ${statusConf.text}`}>
            <Icon icon={statusConf.icon} className="w-3.5 h-3.5" />
            {statusConf.label}
          </div>

          {/* Status selector */}
          {canChangeStatus && (
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
              <Icon icon="mdi:swap-horizontal" className="w-4 h-4 text-gray-400" />
              <select
                disabled={statusUpdateLoading}
                value={order.orderStatus}
                onChange={(e) => updateStatus(e.target.value)}
                className="text-sm font-semibold text-gray-700 focus:outline-none bg-transparent pr-1 disabled:opacity-50"
              >
                <option value={order.orderStatus}>{statusConf.label}</option>
                {transitions.map((t) => (
                  <option key={t} value={t}>{STATUS_CONFIG[t]?.label || t}</option>
                ))}
              </select>
              {statusUpdateLoading && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin text-primary-500" />}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── LEFT: Items + Shipment Form ── */}
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
                const product  = item.productId  || {};
                const variant  = item.variantId  || {};
                const imageUrl = product.images?.[0]?.url;

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
                        {product.title || "Refurbished Device"}
                      </h3>
                      {variant.title && (
                        <span className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 border border-primary-100 px-2 py-0.5 rounded-lg font-semibold mb-2">
                          {variant.title}
                        </span>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 p-2.5 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Unit Price</p>
                          <p className="text-sm font-bold text-gray-800">${(item.price || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Qty</p>
                          <p className="text-sm font-bold text-gray-800">× {item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Subtotal</p>
                          <p className="text-sm font-bold text-gray-900">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Create Shipment Section */}
          {showShipmentForm && !shipmentCreated && (
            <CreateShipmentSection
              order={order}
              token={token}
              onCancel={() => setShowShipmentForm(false)}
              onSuccess={handleShipmentSuccess}
              onRateCalculated={(cost) => setCalculatedShippingCost(cost)}
            />
          )}

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Icon icon="mdi:receipt-text-outline" className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">Order Summary</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-800">${(order.subTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Icon icon="mdi:truck-outline" className="w-4 h-4" />Shipping
                </span>
                {shipmentCreated ? (
                  <span className="font-semibold text-red-600">+{(order.shippingFee || 0).toFixed(2)} TRY</span>
                ) : calculatedShippingCost > 0 ? (
                  <span className="font-semibold text-red-600">+{calculatedShippingCost.toFixed(2)} TRY (Est)</span>
                ) : (
                  <span className="text-xs text-gray-400 italic">Pending shipment</span>
                )}
              </div>
              <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                <span className="font-bold text-gray-700">Total (customer paid)</span>
                <span className="font-extrabold text-gray-900">${(order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT sidebar ── */}
        <div className="flex flex-col gap-6">

          {/* Shipment Info Card */}
          <ShipmentInfoCard shipment={shipment} />

          {/* Order Identifiers */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="mdi:identifier" className="w-5 h-5 text-gray-400" />
              <h2 className="font-bold text-gray-900">Order Info</h2>
            </div>
            <div className="space-y-3">
              <InfoRow label="Order ID"   value={order.orderId}   mono icon="mdi:tag-outline" />
              <InfoRow label="Order No"   value={order.orderNo}   mono icon="mdi:pound" />
              <InfoRow label="Internal ID" value={order._id}      mono icon="mdi:database-outline" />
              <InfoRow label="Placed On"  value={moment(order.createdAt).format("DD MMM YYYY, hh:mm A")} icon="mdi:calendar-outline" />
              {order.completionDate && (
                <InfoRow label="Completed" value={moment(order.completionDate).format("DD MMM YYYY")} icon="mdi:calendar-check-outline" />
              )}
              {order.cancelledAt && (
                <InfoRow label="Cancelled" value={moment(order.cancelledAt).format("DD MMM YYYY")} icon="mdi:cancel" />
              )}
              {order.cancelReason && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 mt-1">
                  <p className="text-[11px] font-bold text-red-700 mb-0.5">Cancel Reason</p>
                  <p className="text-xs text-red-600">{order.cancelReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
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
                  <Icon icon="mdi:credit-card-outline" className="w-4 h-4 text-gray-500" />
                  {order.paymentMethod || "CARD"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-xs font-bold uppercase text-gray-400">Total</span>
                <span className="text-lg font-extrabold text-gray-900">${(order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
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
                  {[order.shippingAddress.city, order.shippingAddress.state].filter(Boolean).join(", ")}
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
    </div>
  );
}
