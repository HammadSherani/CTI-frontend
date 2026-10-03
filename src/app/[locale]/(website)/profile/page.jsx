"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "@/config/axiosInstance";
import handleError from "@/helper/handleError";
import { toast } from "react-toastify";
import { Link } from "@/i18n/navigation";
import { setUserDetails } from "@/store/auth";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

export default function CustomerProfilePage() {
  const { token, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: "", phone: "", country: "" });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileRef = useRef(null);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/customer/profile", {
        headers: authHeaders,
      });
      if (data.success) {
        const u = data.data.user;
        setProfile(u);
        setForm({
          name: u.name || "",
          phone: u.phone || "",
          country: u.country || "",
        });
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      // token nahi hai to spinner hamesha na chalta rahe
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // blob URL memory leak se bachne ke liye
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    // same file dobara select karne par bhi onChange chale
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setPhotoPreview(URL.createObjectURL(file));

    try {
      setUploadingPhoto(true);
      const fd = new FormData();
      fd.append("profilePhoto", file);

      // Content-Type manually set nahi karna, axios boundary khud lagata hai
      const { data } = await axiosInstance.post(
        "/customer/profile/upload-profile",
        fd,
        { headers: authHeaders }
      );

      if (data.success) {
        toast.success(data.message || "Profile photo updated!");
        setProfile((prev) => ({ ...prev, profileImage: data.data.profileImage }));
        dispatch(setUser({ ...user, profileImage: data.data.profileImage }));
        setPhotoPreview(null); // ab server wali image dikhao
      }
    } catch (err) {
      handleError(err);
      setPhotoPreview(null); // error par purani photo wapas
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    const name = form.name.trim();
    const phone = form.phone.trim();
    const country = form.country.trim();

    if (!name) {
      toast.error("Name is required");
      return;
    }

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("name", name);
      // hamesha bhejo, taake user phone/country khali (clear) bhi kar sake
      fd.append("phone", phone);
      fd.append("country", country);

      const { data } = await axiosInstance.put(
        "/customer/profile/update-profile",
        fd,
        { headers: authHeaders }
      );

      if (data.success) {
        toast.success(data.message || "Profile updated!");
        setProfile(data.data.user);
        setEditing(false);
        dispatch(setUser({ ...user, ...data.data.user }));
      }
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setForm({
      name: profile?.name || "",
      phone: profile?.phone || "",
      country: profile?.country || "",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="eos-icons:loading" className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm text-center">
          <Icon icon="heroicons:exclamation-triangle" className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Profile Not Found</h3>
          <p className="text-sm text-gray-500">Please login to view your profile.</p>
          <Link
            href="/auth/login"
            className="inline-block mt-4 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const displayPhoto = photoPreview || profile.profileImage;

  const inputClass =
    "w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 bg-white";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your account information</p>
          </div>
          <Link
            href="/profile/change-password"
            className="flex items-center gap-2 px-4 py-2.5 border bg-white/50 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Icon icon="heroicons:lock-closed" className="w-4 h-4" />
            Change Password
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Avatar */}
          <div className="relative px-6 pt-6">
            <div className="relative inline-block">
              <div className="relative w-28 h-28 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                {displayPhoto ? (
                  <img src={displayPhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-100">
                    <Icon icon="heroicons:user" className="w-12 h-12 text-primary-400" />
                  </div>
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                    <Icon icon="eos-icons:loading" className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              <button
                type="button"
                aria-label="Change profile photo"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-2 -right-2 p-2 bg-primary-600 text-white rounded-xl shadow-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Icon icon="heroicons:camera" className="w-4 h-4" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Info */}
          <div className="px-6 pt-4 pb-6">
            <div className="flex items-start justify-between gap-3 mb-6">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate">{profile.name || "No Name"}</h2>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1 break-all">
                  <Icon icon="heroicons:envelope" className="w-4 h-4 shrink-0" />
                  {profile.email}
                </p>
              </div>
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors"
                >
                  <Icon icon="heroicons:pencil-square" className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Fields */}
            <div className="space-y-4">
              {/* Name */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-primary-100 rounded-lg mt-0.5">
                  <Icon icon="heroicons:user" className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Full Name</p>
                  {editing ? (
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Enter your name"
                      className={inputClass}
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{profile.name || "Not provided"}</p>
                  )}
                </div>
              </div>

              {/* Email (read-only) */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg mt-0.5">
                  <Icon icon="heroicons:envelope" className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email Address</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5 break-all">{profile.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Email cannot be changed</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-green-100 rounded-lg mt-0.5">
                  <Icon icon="heroicons:phone" className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Phone Number</p>
                  {editing ? (
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                      className={inputClass}
                    />
                  ) : (
                    <p className={`text-sm font-medium mt-0.5 ${profile.phone ? "text-gray-900" : "text-gray-400 italic"}`}>
                      {profile.phone || "Not provided"}
                    </p>
                  )}
                </div>
              </div>

              {/* Country */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-purple-100 rounded-lg mt-0.5">
                  <Icon icon="heroicons:globe-alt" className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Country</p>
                  {editing ? (
                    <input
                      type="text"
                      value={form.country}
                      onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                      placeholder="Enter your country"
                      className={inputClass}
                    />
                  ) : (
                    <p className={`text-sm font-medium mt-0.5 ${profile.country ? "text-gray-900" : "text-gray-400 italic"}`}>
                      {profile.country || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Save/Cancel */}
            {editing && (
              <div className="flex gap-3 pt-5 border-t border-gray-100 mt-5">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Icon icon="eos-icons:loading" className="w-4 h-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/orders"
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all group"
            >
              <div className="p-2.5 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors">
                <Icon icon="heroicons:shopping-bag" className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">My Orders</p>
                <p className="text-xs text-gray-500">View order history</p>
              </div>
            </Link>

            <Link
              href="/wishlist"
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-pink-200 hover:bg-pink-50/50 transition-all group"
            >
              <div className="p-2.5 bg-pink-100 rounded-xl group-hover:bg-pink-200 transition-colors">
                <Icon icon="heroicons:heart" className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Wishlist</p>
                <p className="text-xs text-gray-500">Saved items</p>
              </div>
            </Link>

            <Link
              href="/profile/change-password"
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all group"
            >
              <div className="p-2.5 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
                <Icon icon="heroicons:lock-closed" className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Security</p>
                <p className="text-xs text-gray-500">Change password</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}