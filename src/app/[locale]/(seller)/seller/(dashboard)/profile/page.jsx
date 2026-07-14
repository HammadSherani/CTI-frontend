"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";
import axiosInstance from "@/config/axiosInstance";
import handleError from "@/helper/handleError";
import { toast } from "react-toastify";

const SOCIAL_LINKS = [
  { key: "facebook",  label: "Facebook",    icon: "ri:facebook-fill",   color: "#1877F2", placeholder: "https://facebook.com/yourpage" },
  { key: "instagram", label: "Instagram",   icon: "ri:instagram-fill",  color: "#E4405F", placeholder: "https://instagram.com/yourprofile" },
  { key: "twitter",   label: "X (Twitter)", icon: "ri:twitter-x-fill",  color: "#000000", placeholder: "https://x.com/yourhandle" },
  { key: "linkedin",  label: "LinkedIn",    icon: "ri:linkedin-fill",   color: "#0A66C2", placeholder: "https://linkedin.com/in/yourprofile" },
  { key: "whatsapp",  label: "WhatsApp",    icon: "ri:whatsapp-fill",   color: "#25D366", placeholder: "https://wa.me/923001234567" },
  { key: "youtube",   label: "YouTube",     icon: "ri:youtube-fill",    color: "#FF0000", placeholder: "https://youtube.com/@yourchannel" },
  { key: "tiktok",    label: "TikTok",      icon: "ri:tiktok-fill",     color: "#010101", placeholder: "https://tiktok.com/@yourhandle" },
  { key: "website",   label: "Website",     icon: "heroicons:globe-alt", color: "#6366F1", placeholder: "https://yourwebsite.com" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const KYC_META = {
  pending:  { label: "Under Review",   icon: "heroicons:clock",               badge: "bg-yellow-100 text-yellow-700 border-yellow-200", bar: "border-yellow-400 bg-yellow-50", text: "text-yellow-700" },
  approved: { label: "Approved",       icon: "heroicons:shield-check",        badge: "bg-green-100 text-green-700 border-green-200",   bar: "border-green-400 bg-green-50",   text: "text-green-700"  },
  rejected: { label: "Rejected",       icon: "heroicons:x-circle",            badge: "bg-red-100 text-red-700 border-red-200",         bar: "border-red-400 bg-red-50",       text: "text-red-700"    },
  revision: { label: "Needs Revision", icon: "heroicons:exclamation-triangle", badge: "bg-orange-100 text-orange-700 border-orange-200", bar: "border-orange-400 bg-orange-50", text: "text-orange-700" },
};

// ── Reusable components ──────────────────────────────────────────────────────

function SectionCard({ title, icon, action, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          {icon && <Icon icon={icon} className="w-5 h-5 text-primary-600" />}
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className={`p-1.5 rounded-lg mt-0.5 flex-shrink-0 ${value ? "bg-primary-50" : "bg-gray-100"}`}>
        <Icon icon={icon} className={`w-4 h-4 ${value ? "text-primary-600" : "text-gray-400"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className={`text-sm font-medium break-words mt-0.5 ${value ? "text-gray-900" : "text-gray-400 italic"}`}>
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function InputField({ label, type = "text", value, onChange, placeholder, icon, multiline, rows = 3 }) {
  const base = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all bg-white";
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        {icon && !multiline && (
          <Icon icon={icon} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        )}
        {multiline ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className={`${base} resize-none`} />
        ) : (
          <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${base} ${icon ? "pl-9" : ""}`} />
        )}
      </div>
    </div>
  );
}

function EditBtn({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors">
      <Icon icon="heroicons:pencil-square" className="w-3.5 h-3.5" />
      Edit
    </button>
  );
}

function SaveBar({ onSave, onCancel, saving }) {
  return (
    <div className="flex gap-2 pt-5 border-t border-gray-100 mt-5">
      <button onClick={onCancel} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
        Cancel
      </button>
      <button onClick={onSave} disabled={saving} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2">
        {saving && <Icon icon="eos-icons:loading" className="w-4 h-4 animate-spin" />}
        Save Changes
      </button>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function SellerProfilePage() {
  const { token } = useSelector((s) => s.auth);
  const [seller, setSeller]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [editSection, setEdit]    = useState(null);
  const [saving, setSaving]       = useState(false);

  const [infoForm, setInfoForm]     = useState({});
  const [socialForm, setSocialForm] = useState({});
  const [schedForm, setSchedForm]   = useState({ workingDays: [], workingHours: { start: "", end: "" } });
  const [logoFile, setLogoFile]     = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const logoRef = useRef(null);

  const [coverPhotoFile, setCoverPhotoFile]     = useState(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(null);
  const coverPhotoRef = useRef(null);

  const fetchSeller = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/seller/profile/me-seller", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setSeller(data.data);
        seedForms(data.data);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const seedForms = (s) => {
    setInfoForm({
      fullName:         s.fullName         || "",
      phoneNumber:      s.phoneNumber      || "",
      emailAddress:     s.emailAddress     || "",
      storeAddress:     s.storeAddress     || "",
      zipCode:          s.zipCode          || "",
      businessName:     s.businessName     || "",
      storeDescription: s.storeDescription || "",
    });
    setSocialForm({
      facebook:  s.socialLinks?.facebook  || "",
      instagram: s.socialLinks?.instagram || "",
      twitter:   s.socialLinks?.twitter   || "",
      linkedin:  s.socialLinks?.linkedin  || "",
      whatsapp:  s.socialLinks?.whatsapp  || "",
      youtube:   s.socialLinks?.youtube   || "",
      tiktok:    s.socialLinks?.tiktok    || "",
      website:   s.socialLinks?.website   || "",
    });
    setSchedForm({
      workingDays:  s.workingDays  || [],
      workingHours: s.workingHours || { start: "", end: "" },
    });
    setLogoPreview(s.profilePictureOrLogo || null);
    setLogoFile(null);
    setCoverPhotoPreview(s.coverPhoto || null);
    setCoverPhotoFile(null);
  };

  useEffect(() => { fetchSeller(); }, []);

  const save = async (section) => {
    setSaving(true);
    try {
      const payload = {};
      if (section === "info")     Object.assign(payload, infoForm);
      if (section === "social")   payload.socialLinks = socialForm;
      if (section === "schedule") {
        payload.workingDays  = schedForm.workingDays;
        payload.workingHours = schedForm.workingHours;
      }

      const fd = new FormData();
      fd.append("sellerProfile", JSON.stringify(payload));
      if (logoFile) fd.append("profilePictureOrLogo", logoFile);
      if (coverPhotoFile) fd.append("coverPhoto", coverPhotoFile);

      const { data } = await axiosInstance.patch("/seller/profile/update", fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        setSeller(data.data);
        seedForms(data.data);
        setEdit(null);
        toast.success("Profile updated!");
      }
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => { seedForms(seller); setEdit(null); };
  const startEdit  = (section) => { seedForms(seller); setEdit(section); };
  const toggleDay  = (day) =>
    setSchedForm((p) => ({
      ...p,
      workingDays: p.workingDays.includes(day)
        ? p.workingDays.filter((d) => d !== day)
        : [...p.workingDays, day],
    }));

  // ── Loading / empty ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icon icon="eos-icons:loading" className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icon icon="heroicons:user-circle" className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No seller profile found.</p>
          <button onClick={fetchSeller} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm hover:bg-primary-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const kyc = KYC_META[seller.kycStatus] || KYC_META.pending;

  return (
    <div className="min-h-screen bg-gray-50/60">

      {/* ── Banner + Logo ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div
          className="h-32 md:h-40 relative overflow-hidden group cursor-pointer"
          style={coverPhotoPreview ? { background: `url(${coverPhotoPreview}) center/cover no-repeat` } : { background: "linear-gradient(135deg, #f97316 0%, #ef4444 45%, #6366f1 100%)" }}
          onClick={() => coverPhotoRef.current?.click()}
          title="Click to change cover photo"
        >
          {!coverPhotoPreview && (
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
            <div className="flex flex-col items-center text-white">
              <Icon icon="heroicons:camera" className="w-8 h-8 mb-1" />
              <span className="text-sm font-semibold">Change Cover Photo</span>
            </div>
          </div>
        </div>
        <input ref={coverPhotoRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) { setCoverPhotoFile(f); setCoverPhotoPreview(URL.createObjectURL(f)); setEdit("coverPhoto"); }
        }} />

        <div className="max-w-5xl mx-auto px-4 md:px-8 pb-5">
          <div className="flex items-end gap-4 -mt-10 md:-mt-14">
            {/* Logo */}
            <div className="relative flex-shrink-0">
              <div
                className="w-20 h-20 md:w-28 md:h-28 rounded-2xl border-4 border-white shadow-xl bg-primary-100 overflow-hidden cursor-pointer group"
                onClick={() => logoRef.current?.click()}
                title="Click to change logo"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Store logo" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon icon="heroicons:building-storefront" className="w-8 h-8 text-primary-400" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-xl">
                  <Icon icon="heroicons:camera" className="w-6 h-6 text-white" />
                </div>
              </div>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); setEdit("logo"); }
              }} />
            </div>

            {/* Store name + KYC badge */}
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">{seller.businessName || "Your Store"}</h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${kyc.badge}`}>
                  <Icon icon={kyc.icon} className="w-3.5 h-3.5" />
                  {kyc.label}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{seller.storeAddress || "Store address not set"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Logo/Cover-save bar ────────────────────────────────────────────────── */}
      {(logoFile || coverPhotoFile) && (
        <div className="bg-primary-50 border-b border-primary-200">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-primary-800 font-medium">New image selected — save to apply.</p>
            <div className="flex gap-2">
              <button onClick={cancelEdit} className="px-3 py-1.5 text-xs border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => save("images")} disabled={saving} className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1 disabled:opacity-50">
                {saving && <Icon icon="eos-icons:loading" className="w-3 h-3 animate-spin" />}
                Save Images
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── KYC notice ──────────────────────────────────────────────────── */}
      {seller.kycStatus !== "approved" && (
        <div className="max-w-5xl mx-auto px-4 md:px-8 mt-5">
          <div className={`flex items-start gap-3 p-4 rounded-2xl border-l-4 ${kyc.bar}`}>
            <Icon icon={kyc.icon} className={`w-5 h-5 mt-0.5 flex-shrink-0 ${kyc.text}`} />
            <div>
              <p className={`font-semibold text-sm ${kyc.text}`}>{kyc.label}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {seller.kycStatus === "pending"  && "Your profile is under admin review. You'll be notified once approved."}
                {seller.kycStatus === "revision" && (seller.kycReason || "Your profile needs revision. Please update the required information.")}
                {seller.kycStatus === "rejected" && (seller.kycReason || "Your profile was rejected. Please contact support.")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Page body ────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Main column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Store Information */}
            <SectionCard
              title="Store Information"
              icon="heroicons:building-storefront"
              action={editSection !== "info" && <EditBtn onClick={() => startEdit("info")} />}
            >
              {editSection === "info" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Full Name"           value={infoForm.fullName}     onChange={(v) => setInfoForm((p) => ({ ...p, fullName: v }))}     placeholder="Your full name"   icon="heroicons:user" />
                    <InputField label="Business / Store Name" value={infoForm.businessName} onChange={(v) => setInfoForm((p) => ({ ...p, businessName: v }))} placeholder="Store name"       icon="heroicons:building-storefront" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Phone Number"  value={infoForm.phoneNumber}   onChange={(v) => setInfoForm((p) => ({ ...p, phoneNumber: v }))}   placeholder="+92 300 0000000"  icon="heroicons:phone" />
                    <InputField label="Email Address" type="email" value={infoForm.emailAddress} onChange={(v) => setInfoForm((p) => ({ ...p, emailAddress: v }))} placeholder="store@email.com" icon="heroicons:envelope" />
                  </div>
                  <InputField label="Store Address" value={infoForm.storeAddress} onChange={(v) => setInfoForm((p) => ({ ...p, storeAddress: v }))} placeholder="Full store address" icon="heroicons:map-pin" />
                  <InputField label="ZIP / Postal Code" value={infoForm.zipCode} onChange={(v) => setInfoForm((p) => ({ ...p, zipCode: v }))} placeholder="Postal code" icon="heroicons:hashtag" />
                  <InputField label="Store Description" multiline value={infoForm.storeDescription} onChange={(v) => setInfoForm((p) => ({ ...p, storeDescription: v }))} placeholder="Describe your store…" rows={4} />
                  <SaveBar onSave={() => save("info")} onCancel={cancelEdit} saving={saving} />
                </div>
              ) : (
                <div>
                  <InfoRow icon="heroicons:user"                label="Full Name"     value={seller.fullName} />
                  <InfoRow icon="heroicons:building-storefront" label="Business Name" value={seller.businessName} />
                  <InfoRow icon="heroicons:phone"               label="Phone"         value={seller.phoneNumber} />
                  <InfoRow icon="heroicons:envelope"            label="Email"         value={seller.emailAddress} />
                  <InfoRow icon="heroicons:map-pin"             label="Store Address" value={seller.storeAddress} />
                  <InfoRow icon="heroicons:hashtag"             label="ZIP Code"      value={seller.zipCode} />
                  {seller.storeDescription && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">About the Store</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{seller.storeDescription}</p>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            {/* Social Links */}
            <SectionCard
              title="Social Links"
              icon="heroicons:share"
              action={editSection !== "social" && <EditBtn onClick={() => startEdit("social")} />}
            >
              {editSection === "social" ? (
                <div className="space-y-3">
                  {SOCIAL_LINKS.map((s) => (
                    <div key={s.key}>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        <Icon icon={s.icon} className="w-3.5 h-3.5" style={{ color: s.color }} />
                        {s.label}
                      </label>
                      <input
                        type="url"
                        value={socialForm[s.key]}
                        onChange={(e) => setSocialForm((p) => ({ ...p, [s.key]: e.target.value }))}
                        placeholder={s.placeholder}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all bg-white"
                      />
                    </div>
                  ))}
                  <SaveBar onSave={() => save("social")} onCancel={cancelEdit} saving={saving} />
                </div>
              ) : (
                <div>
                  {SOCIAL_LINKS.filter((s) => seller.socialLinks?.[s.key]).length === 0 ? (
                    <div className="text-center py-8">
                      <Icon icon="heroicons:share" className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">No social links added yet</p>
                      <button onClick={() => startEdit("social")} className="mt-3 text-primary-600 text-sm font-semibold hover:underline">
                        + Add social links
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SOCIAL_LINKS.map((s) => {
                        const url = seller.socialLinks?.[s.key];
                        if (!url) return null;
                        return (
                          <a key={s.key} href={url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group"
                          >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${s.color}18` }}>
                              <Icon icon={s.icon} className="w-5 h-5" style={{ color: s.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-400">{s.label}</p>
                              <p className="text-sm text-gray-700 truncate group-hover:text-primary-600 transition-colors">{url}</p>
                            </div>
                            <Icon icon="heroicons:arrow-top-right-on-square" className="w-4 h-4 text-gray-300 group-hover:text-primary-500 flex-shrink-0" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            {/* Working Schedule */}
            <SectionCard
              title="Working Schedule"
              icon="heroicons:clock"
              action={editSection !== "schedule" && <EditBtn onClick={() => startEdit("schedule")} />}
            >
              {editSection === "schedule" ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Working Days</p>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((day) => (
                        <button key={day} type="button" onClick={() => toggleDay(day)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            schedForm.workingDays.includes(day)
                              ? "bg-primary-600 border-primary-600 text-white shadow-sm"
                              : "bg-white border-gray-200 text-gray-600 hover:border-primary-400"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Opening Time</label>
                      <input type="time" value={schedForm.workingHours.start}
                        onChange={(e) => setSchedForm((p) => ({ ...p, workingHours: { ...p.workingHours, start: e.target.value } }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Closing Time</label>
                      <input type="time" value={schedForm.workingHours.end}
                        onChange={(e) => setSchedForm((p) => ({ ...p, workingHours: { ...p.workingHours, end: e.target.value } }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all bg-white"
                      />
                    </div>
                  </div>
                  <SaveBar onSave={() => save("schedule")} onCancel={cancelEdit} saving={saving} />
                </div>
              ) : (
                <div className="space-y-4">
                  {seller.workingDays?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Working Days</p>
                      <div className="flex flex-wrap gap-1.5">
                        {DAYS.map((day) => (
                          <span key={day} className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                            seller.workingDays.includes(day)
                              ? "bg-primary-100 text-primary-700 border border-primary-200"
                              : "bg-gray-100 text-gray-400 border border-gray-100"
                          }`}>
                            {day.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(seller.workingHours?.start || seller.workingHours?.end) && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/40 border border-primary-100">
                      <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-1">Business Hours</p>
                      <p className="text-base font-bold text-gray-900">
                        {seller.workingHours.start || "—"}&nbsp;—&nbsp;{seller.workingHours.end || "—"}
                      </p>
                    </div>
                  )}
                  {!seller.workingDays?.length && !seller.workingHours?.start && (
                    <div className="text-center py-8">
                      <Icon icon="heroicons:clock" className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">No schedule set yet</p>
                      <button onClick={() => startEdit("schedule")} className="mt-3 text-primary-600 text-sm font-semibold hover:underline">
                        + Add schedule
                      </button>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Account Status */}
            <SectionCard title="Account Status" icon="heroicons:shield-check">
              <div className="space-y-2">
                {[
                  {
                    label: "KYC Status",
                    node: (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${kyc.badge}`}>
                        <Icon icon={kyc.icon} className="w-3 h-3" />{kyc.label}
                      </span>
                    ),
                  },
                  { label: "Account Active", node: seller.isActive ? <span className="text-green-600 font-semibold text-xs">✓ Active</span> : <span className="text-red-500 font-semibold text-xs">✕ Inactive</span> },
                  { label: "Sells Refurbished", node: <span className={`text-xs font-semibold ${seller.sellsRefurbishedDevices ? "text-primary-600" : "text-gray-400"}`}>{seller.sellsRefurbishedDevices ? "Yes" : "No"}</span> },
                  { label: "Commission Rate", node: <span className="text-xs font-semibold text-gray-700">{seller.commissionRate ?? 10}%</span> },
                  { label: "Shipping Method", node: <span className="text-xs font-medium text-gray-700 capitalize">{seller.shippingMethod || "Not set"}</span> },
                ].map(({ label, node }) => (
                  <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-xs text-gray-500">{label}</span>
                    {node}
                  </div>
                ))}
                {seller.kycLastUpdated && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-xs text-gray-500">KYC Updated</span>
                    <span className="text-xs text-gray-700">{new Date(seller.kycLastUpdated).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Bank Details */}
            <SectionCard title="Bank Details" icon="heroicons:banknotes">
              {seller.bankDetails?.accountNumber ? (
                <div className="space-y-2">
                  {[
                    { label: "Account Title", val: seller.bankDetails.accountTitle },
                    { label: "Bank",          val: seller.bankDetails.bankName },
                    { label: "Branch",        val: seller.bankDetails.branchName },
                    {
                      label: "Account No.",
                      val: seller.bankDetails.accountNumber
                        ? `${"•".repeat(Math.max(0, seller.bankDetails.accountNumber.length - 4))}${seller.bankDetails.accountNumber.slice(-4)}`
                        : null,
                    },
                    {
                      label: "IBAN",
                      val: seller.bankDetails.iban
                        ? `${seller.bankDetails.iban.slice(0, 4)}${"•".repeat(Math.max(0, seller.bankDetails.iban.length - 8))}${seller.bankDetails.iban.slice(-4)}`
                        : null,
                    },
                  ].filter((r) => r.val).map(({ label, val }) => (
                    <div key={label} className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-medium text-gray-900 font-mono">{val}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Icon icon="heroicons:banknotes" className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Bank details not added yet</p>
                </div>
              )}
            </SectionCard>

            {/* KYC Documents */}
            <SectionCard title="KYC Documents" icon="heroicons:document-check">
              <div className="space-y-2">
                {[
                  { label: "Profile Photo",    url: seller.profilePictureOrLogo },
                  { label: "National ID",      url: seller.nationalIdOrPassport },
                  { label: "Shop License",     url: seller.shopLicenseOrTaxCertificate },
                  { label: "Proof of Address", url: seller.proofOfAddress },
                ].map(({ label, url }) => (
                  <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-xs text-gray-600">{label}</span>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1">
                        View <Icon icon="heroicons:arrow-top-right-on-square" className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Not uploaded</span>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
