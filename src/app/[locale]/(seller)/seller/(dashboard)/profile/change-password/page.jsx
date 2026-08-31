"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";
import axiosInstance from "@/config/axiosInstance";
import handleError from "@/helper/handleError";
import { toast } from "react-toastify";
import { Link } from "@/i18n/navigation";

const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

function getPasswordStrength(pw) {
  if (!pw) return -1;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score - 1, 4);
}

export default function SellerChangePasswordPage() {
  const { token } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);

  const strength = getPasswordStrength(form.newPassword);
  const passwordsMatch = form.newPassword && form.confirmPassword && form.newPassword === form.confirmPassword;
  const canSubmit = form.currentPassword && form.newPassword.length >= 6 && passwordsMatch && !saving;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setSaving(true);
      const { data } = await axiosInstance.post(
        "/seller/auth/change-password",
        { currentPassword: form.currentPassword, newPassword: form.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Password changed successfully!");
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  const PasswordInput = ({ label, field, showKey, icon }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <Icon icon={icon} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type={show[showKey] ? "text" : "password"}
          value={form[field]}
          onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all bg-white"
        />
        <button
          type="button"
          onClick={() => setShow((p) => ({ ...p, [showKey]: !p[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon icon={show[showKey] ? "heroicons:eye-slash" : "heroicons:eye"} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/seller/profile" className="hover:text-primary-600 transition-colors flex items-center gap-1">
            <Icon icon="heroicons:arrow-left" className="w-4 h-4" />
            Back to Profile
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-100 rounded-xl">
                <Icon icon="heroicons:lock-closed" className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
                <p className="text-xs text-gray-500 mt-0.5">Update your account password to keep it secure</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <PasswordInput label="Current Password" field="currentPassword" showKey="current" icon="heroicons:key" />
            
            <div>
              <PasswordInput label="New Password" field="newPassword" showKey="new" icon="heroicons:lock-closed" />
              {/* Strength Bar */}
              {form.newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? strengthColors[strength] : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 font-medium ${
                    strength <= 1 ? "text-red-500" : strength <= 2 ? "text-yellow-600" : "text-green-600"
                  }`}>
                    {strengthLabels[strength] || ""}
                  </p>
                </div>
              )}
            </div>

            <div>
              <PasswordInput label="Confirm New Password" field="confirmPassword" showKey="confirm" icon="heroicons:shield-check" />
              {form.confirmPassword && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Icon
                    icon={passwordsMatch ? "heroicons:check-circle-solid" : "heroicons:x-circle-solid"}
                    className={`w-4 h-4 ${passwordsMatch ? "text-green-500" : "text-red-500"}`}
                  />
                  <span className={`text-xs font-medium ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                    {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                  </span>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
                <Icon icon="heroicons:light-bulb" className="w-4 h-4" />
                Password Requirements
              </p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li className="flex items-center gap-1.5">
                  <Icon icon={form.newPassword.length >= 6 ? "heroicons:check-circle-solid" : "heroicons:minus-circle"} className={`w-3.5 h-3.5 ${form.newPassword.length >= 6 ? "text-green-500" : "text-blue-400"}`} />
                  At least 6 characters
                </li>
                <li className="flex items-center gap-1.5">
                  <Icon icon={/[A-Z]/.test(form.newPassword) ? "heroicons:check-circle-solid" : "heroicons:minus-circle"} className={`w-3.5 h-3.5 ${/[A-Z]/.test(form.newPassword) ? "text-green-500" : "text-blue-400"}`} />
                  One uppercase letter
                </li>
                <li className="flex items-center gap-1.5">
                  <Icon icon={/[a-z]/.test(form.newPassword) ? "heroicons:check-circle-solid" : "heroicons:minus-circle"} className={`w-3.5 h-3.5 ${/[a-z]/.test(form.newPassword) ? "text-green-500" : "text-blue-400"}`} />
                  One lowercase letter
                </li>
                <li className="flex items-center gap-1.5">
                  <Icon icon={/\d/.test(form.newPassword) ? "heroicons:check-circle-solid" : "heroicons:minus-circle"} className={`w-3.5 h-3.5 ${/\d/.test(form.newPassword) ? "text-green-500" : "text-blue-400"}`} />
                  One number
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t border-gray-100">
              <Link
                href="/seller/profile"
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving && <Icon icon="eos-icons:loading" className="w-4 h-4 animate-spin" />}
                {saving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
