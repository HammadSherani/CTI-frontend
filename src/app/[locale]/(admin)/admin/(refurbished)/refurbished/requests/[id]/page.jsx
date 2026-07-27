"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import moment from "moment";
import Button from "@/components/partials/admin/ecom/myButton";

// ─── Image Lightbox ────────────────────────────────────────────────────────
function ImageLightbox({ images, initialIndex, onClose }) {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent((p) => (p + 1) % images.length);
      if (e.key === "ArrowLeft")  setCurrent((p) => (p - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  const src = typeof images[current] === "string"
    ? images[current]
    : images[current]?.url || images[current]?.preview || "";

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/92 backdrop-blur-sm flex flex-col items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/25 rounded-full text-white transition"
        onClick={onClose}
      >
        <Icon icon="mdi:close" className="w-6 h-6" />
      </button>

      {/* Counter */}
      <p className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm font-bold tracking-widest">
        {current + 1} / {images.length}
      </p>

      {/* Image */}
      <div
        className="relative max-w-5xl w-full px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={`Photo ${current + 1}`}
          className="max-h-[80vh] w-full object-contain rounded-2xl shadow-2xl"
        />
      </div>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/25 rounded-full text-white transition"
            onClick={(e) => { e.stopPropagation(); setCurrent((p) => (p - 1 + images.length) % images.length); }}
          >
            <Icon icon="mdi:chevron-left" className="w-7 h-7" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/25 rounded-full text-white transition"
            onClick={(e) => { e.stopPropagation(); setCurrent((p) => (p + 1) % images.length); }}
          >
            <Icon icon="mdi:chevron-right" className="w-7 h-7" />
          </button>
        </>
      )}

      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div className="absolute bottom-5 flex gap-2 overflow-x-auto max-w-full px-6">
          {images.map((img, i) => {
            const thumbSrc = typeof img === "string" ? img : img?.url || img?.preview || "";
            return (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                  i === current ? "border-white scale-105" : "border-white/20 opacity-50 hover:opacity-80"
                }`}
              >
                <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Video Player Modal ────────────────────────────────────────────────────
function VideoModal({ src, title, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/92 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute -top-10 right-0 p-2 bg-white/10 hover:bg-white/25 rounded-full text-white transition"
          onClick={onClose}
        >
          <Icon icon="mdi:close" className="w-6 h-6" />
        </button>
        <p className="text-white/60 text-sm font-bold mb-3 truncate flex items-center gap-2">
          <Icon icon="mdi:video-outline" className="w-4 h-4" />
          {title}
        </p>
        <video
          src={src}
          controls
          autoPlay
          className="w-full rounded-2xl shadow-2xl bg-black max-h-[75vh]"
        />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function SellRequestDetailsPage() {
  const [request, setRequest]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [lightbox, setLightbox]       = useState({ open: false, index: 0 });
  const [videoModal, setVideoModal]   = useState({ open: false, src: "", title: "" });

  const { token } = useSelector((s) => s.auth);
  const router = useRouter();
  const { id }  = useParams();

  const fetchRequest = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/admin/refurbish/sell-requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequest(data.data);
    } catch {
      toast.error("Failed to load sell request details");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    if (token && id) fetchRequest();
  }, [token, id, fetchRequest]);

  const handleStatusUpdate = async (newStatus) => {
    setStatusUpdating(true);
    try {
      const { data } = await axiosInstance.put(
        `/admin/refurbish/sell-requests/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Status updated successfully");
      setRequest(data.data);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gray-50/50 flex items-center justify-center">
        <Icon icon="mdi:loading" className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8 min-h-screen bg-gray-50/50 flex flex-col items-center justify-center space-y-4">
        <Icon icon="mdi:alert-circle-outline" className="w-16 h-16 text-gray-400" />
        <h2 className="text-xl font-bold text-gray-700">Request Not Found</h2>
        <Button variant="outline" onClick={() => router.push('/admin/refurbished/requests')}>Back to Requests</Button>
      </div>
    );
  }

  const statusColors = {
    pending:    "bg-yellow-100 text-yellow-700",
    evaluating: "bg-blue-100 text-blue-700",
    approved:   "bg-green-100 text-green-700",
    rejected:   "bg-red-100 text-red-700",
    completed:  "bg-purple-100 text-purple-700",
    cancelled:  "bg-gray-100 text-gray-700",
  };

  // Media helpers
  const pictures = request.media?.pictures || request.media?.images || [];
  const videos   = request.media?.videos   || [];
  const hasMedia = pictures.length > 0 || videos.length > 0;

  const getImgSrc  = (img) => typeof img === "string" ? img : img?.url || img?.preview || "";
  const getVidSrc  = (vid) => typeof vid === "string" ? vid : vid?.url || "";
  const getVidName = (vid, i) => typeof vid === "string" ? `Video ${i + 1}` : vid?.name || `Video ${i + 1}`;

  return (
    <>
      {/* Lightbox overlay */}
      {lightbox.open && (
        <ImageLightbox
          images={pictures}
          initialIndex={lightbox.index}
          onClose={() => setLightbox({ open: false, index: 0 })}
        />
      )}

      {/* Video modal */}
      {videoModal.open && (
        <VideoModal
          src={videoModal.src}
          title={videoModal.title}
          onClose={() => setVideoModal({ open: false, src: "", title: "" })}
        />
      )}

      <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50/50 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/refurbished/requests')}
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            >
              <Icon icon="lucide:arrow-left" className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-gray-900">Request Details</h1>
                <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full capitalize ${statusColors[request.status] || statusColors.pending}`}>
                  {request.status}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Tracking ID: <span className="font-bold text-gray-700">{request.trackingId}</span>
              </p>
            </div>
          </div>

          {/* Status Action */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">Update Status:</span>
            <select
              value={request.status}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              disabled={statusUpdating}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:border-primary-500 disabled:opacity-50 cursor-pointer"
            >
              <option value="pending">Pending</option>
              <option value="evaluating">Evaluating</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Device & Price Summary */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center p-2 border border-gray-100">
                {request.modelId?.imageUrl ? (
                  <img src={request.modelId.imageUrl} alt={request.modelId.name} className="w-full h-full object-contain" />
                ) : (
                  <Icon icon="mdi:cellphone" className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{request.brandId?.name}</p>
                <h2 className="text-2xl font-black text-gray-900">{request.modelId?.name}</h2>
                <p className="text-sm text-gray-500 mt-2">
                  Requested on {moment(request.createdAt).format("DD MMM YYYY, hh:mm A")}
                </p>
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                  <Icon icon="mdi:cogs" className="text-primary-500" /> Selected Variants
                </h3>
              </div>
              <div className="p-6">
                {request.selectedVariants?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {request.selectedVariants.map((v, i) => (
                      <div key={i} className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                        <span className="text-sm font-semibold text-gray-500">{v.key}</span>
                        <span className="text-sm font-extrabold text-gray-900">{v.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No variants selected.</p>
                )}
              </div>
            </div>

            {/* Condition Answers */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                  <Icon icon="mdi:clipboard-text-outline" className="text-primary-500" /> Condition Report
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {request.questionAnswers && request.questionAnswers.length > 0 ? (
                  request.questionAnswers.map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 mb-2">Question {i + 1}</p>
                      <p className="text-sm font-bold text-gray-900 mb-2">{item.question}</p>
                      <div className="flex items-center gap-2">
                        <Icon icon="mdi:check-circle" className="text-primary-600 w-5 h-5" />
                        <span className="text-sm font-semibold text-gray-700">{item.answer}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No condition answers provided.</p>
                )}
              </div>
            </div>

            {/* ── Media Gallery ── NEW interactive section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                  <Icon icon="mdi:folder-multiple-image" className="text-primary-500" /> Uploaded Media
                </h3>
                {hasMedia && (
                  <span className="text-xs bg-primary-50 text-primary-600 font-bold px-3 py-1 rounded-full border border-primary-100">
                    {pictures.length} Images · {videos.length} Videos
                  </span>
                )}
              </div>

              <div className="p-6">
                {!hasMedia ? (
                  <div className="text-center py-10">
                    <Icon icon="mdi:image-off-outline" className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 italic">No media uploaded.</p>
                  </div>
                ) : (
                  <div className="space-y-6">

                    {/* Pictures */}
                    {pictures.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <Icon icon="mdi:image-outline" className="w-4 h-4" />
                          Images ({pictures.length}) — click to open
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {pictures.map((img, idx) => {
                            const src = getImgSrc(img);
                            return (
                              <button
                                key={idx}
                                onClick={() => setLightbox({ open: true, index: idx })}
                                className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-primary-400 transition-all shadow-sm hover:shadow-md"
                              >
                                <img
                                  src={src}
                                  alt={`Photo ${idx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2 shadow-lg">
                                    <Icon icon="mdi:magnify-plus-outline" className="w-5 h-5 text-gray-800" />
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Videos */}
                    {videos.length > 0 && (
                      <div className={pictures.length > 0 ? "pt-4 border-t border-gray-100" : ""}>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <Icon icon="mdi:video-outline" className="w-4 h-4" />
                          Videos ({videos.length}) — click to play
                        </p>
                        <div className="space-y-2">
                          {videos.map((vid, idx) => {
                            const src  = getVidSrc(vid);
                            const name = getVidName(vid, idx);
                            return (
                              <button
                                key={idx}
                                onClick={() => setVideoModal({ open: true, src, title: name })}
                                className="group w-full flex items-center gap-4 p-3 bg-gray-50 border-2 border-gray-100 hover:border-primary-400 hover:bg-primary-50/30 rounded-2xl transition-all text-left"
                              >
                                <div className="w-12 h-12 rounded-xl bg-primary-100 group-hover:bg-primary-600 flex items-center justify-center flex-shrink-0 transition-colors">
                                  <Icon icon="mdi:play" className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors ml-0.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-extrabold text-gray-800 truncate">{name}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">Click to play video</p>
                                </div>
                                <Icon icon="mdi:play-circle-outline" className="w-5 h-5 text-gray-400 group-hover:text-primary-600 flex-shrink-0 transition-colors" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">

            {/* Customer Info */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                  <Icon icon="mdi:account-outline" className="text-primary-500" /> Customer Details
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Name</p>
                  <p className="text-sm font-bold text-gray-900">{request.customerInfo?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                  <p className="text-sm font-bold text-gray-900">{request.customerInfo?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Phone</p>
                  <p className="text-sm font-bold text-gray-900">{request.customerInfo?.phone || "—"}</p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase">TR ID Number</p>
                  <p className="text-sm font-bold text-gray-900 font-mono">{request.customerInfo?.trIdNumber || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Address</p>
                  <p className="text-sm font-bold text-gray-900">{request.customerInfo?.address || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">IBAN</p>
                  <p className="text-sm font-bold text-gray-900 font-mono tracking-wide">{request.customerInfo?.iban || "—"}</p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase">User Account Type</p>
                  {request.userId ? (
                    <div>
                      <p className="text-sm font-bold text-gray-900">Registered User</p>
                      <p className="text-xs text-gray-500 mt-1">ID: {request.userId._id}</p>
                      <p className="text-xs text-gray-500">{request.userId.email}</p>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-gray-900">Guest User</p>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
