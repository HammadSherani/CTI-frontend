"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import moment from "moment";
import axiosInstance from "@/config/axiosInstance";
import { CustomDropdown } from "@/components/partials/admin/ecom/Dropdown";

const statuses = ["Pending", "Contacted", "Approved", "Rejected", "Completed"];
const Detail = ({ label, value }) => <div><dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-gray-800">{value || "-"}</dd></div>;

export default function InsuranceRequestDetailsPage() {
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);
  const router = useRouter();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchRequest = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/admin/insurance/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setRequest(data.data);
    } catch (error) { toast.error(error.response?.data?.message || "Failed to load request"); }
    finally { setLoading(false); }
  }, [token, id]);

  useEffect(() => { fetchRequest(); }, [fetchRequest]);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      const { data } = await axiosInstance.patch(`/admin/insurance/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setRequest((current) => ({ ...current, status: data.data.status }));
      toast.success("Status updated successfully");
    } catch (error) { toast.error(error.response?.data?.message || "Failed to update status"); }
    finally { setUpdating(false); }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-gray-50/50"><Icon icon="mdi:loading" className="h-10 w-10 animate-spin text-primary-600" /></div>;
  if (!request) return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50/50"><Icon icon="mdi:alert-circle-outline" className="h-16 w-16 text-gray-400" /><h1 className="text-xl font-bold text-gray-700">Request not found</h1><button type="button" onClick={() => router.push("/admin/insurance/requests")} className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-bold">Back to requests</button></div>;

  return <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-5xl space-y-6">
    <button type="button" onClick={() => router.push("/admin/insurance/requests")} className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"><Icon icon="mdi:arrow-left" /> Back to requests</button>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-3xl font-black text-gray-900">Insurance Request</h1><p className="mt-1 text-sm text-gray-500">Submitted {moment(request.createdAt).format("DD MMM YYYY, hh:mm A")}</p></div><div className="w-full sm:w-52"><CustomDropdown icon="mdi:shield-check-outline" placeholder="Update status" options={statuses.map((item) => ({ label: item, value: item }))} value={request.status} onChange={updateStatus} disabled={updating} /></div></div>
    <section className="grid gap-6 lg:grid-cols-2"><div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"><h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900"><Icon icon="mdi:account-outline" className="text-primary-600" /> Customer information</h2><dl className="grid gap-5 sm:grid-cols-2"><Detail label="Full name" value={request.customer?.fullName} /><Detail label="Phone" value={request.customer?.phone} /><Detail label="Email" value={request.customer?.email} /></dl></div><div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"><h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900"><Icon icon="mdi:cellphone" className="text-primary-600" /> Device information</h2><dl className="grid gap-5 sm:grid-cols-2"><Detail label="Device type" value={request.device?.type} /><Detail label="Brand" value={request.device?.brand} /><Detail label="Model" value={request.device?.model} /><Detail label="IMEI" value={request.device?.imei} /><Detail label="Purchase date" value={request.device?.purchaseDate ? moment(request.device.purchaseDate).format("DD MMM YYYY") : "-"} /><Detail label="Device price" value={request.device?.price} /></dl></div></section>
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"><h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900"><Icon icon="mdi:shield-outline" className="text-primary-600" /> Insurance information</h2><dl className="grid gap-5 sm:grid-cols-2"><Detail label="Insurance category" value={request.insuranceCategory} /><Detail label="Insurance type" value={request.insuranceTypeName || request.insuranceType} /><Detail label="Current status" value={request.status} /><Detail label="Notes" value={request.notes} /></dl></section>
  </div></div>;
}
