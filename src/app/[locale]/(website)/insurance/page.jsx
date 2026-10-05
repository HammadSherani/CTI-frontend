"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import Breadcrumb from "@/components/ui/Breadcrumb";
import axiosInstance from "@/config/axiosInstance";

const schema = yup.object({
  fullName: yup.string().trim().min(2, "Enter your full name").required("Full name is required"),
  phone: yup.string().trim().min(7, "Enter a valid phone number").required("Phone is required"),
  email: yup.string().trim().email("Enter a valid email").required("Email is required"),
  deviceType: yup.string().required("Device type is required"),
  brand: yup.string().trim().required("Brand is required"),
  model: yup.string().trim().required("Model is required"),
  imei: yup.string().trim().min(8, "Enter a valid IMEI").required("IMEI is required"),
  purchaseDate: yup.string().required("Purchase date is required"),
  devicePrice: yup.number().typeError("Enter a valid price").min(0, "Price cannot be negative").required("Device price is required"),
  insuranceType: yup.string().required("Insurance type is required"),
  notes: yup.string().max(500, "Notes cannot exceed 500 characters"),
});

const deviceOptions = [
  { label: "Mobile Phone", icon: "mdi:cellphone" },
  { label: "Tablet", icon: "mdi:tablet" },
];

const insuranceOptions = ["Screen Protection", "Full Protection", "Extended Warranty"];

function Field({ label, error, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600">{error.message}</span>}
    </label>
  );
}

const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

export default function InsurancePage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { deviceType: "", insuranceType: "", notes: "" },
  });
  const selectedDevice = watch("deviceType");

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await axiosInstance.post("/public/insurance", values);
      setSubmitted(true);
      toast.success("Your insurance request has been submitted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit your request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-100 bg-white px-6 py-3 md:px-12"><Breadcrumb /></div>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {submitted ? (
          <section className="mx-auto max-w-2xl rounded-3xl border border-primary-100 bg-white px-6 py-16 text-center shadow-sm sm:px-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <Icon icon="mdi:check-circle-outline" className="h-12 w-12" />
            </div>
            <h1 className="text-3xl font-black text-gray-900">Thank you for your request</h1>
            <p className="mx-auto mt-3 max-w-md text-gray-500">Our team will review your device details and contact you shortly about your insurance options.</p>
            <button type="button" onClick={() => { setSubmitted(false); setStep(1); }} className="mt-8 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-700">Submit another request</button>
          </section>
        ) : (
          <>
            <header className="mb-8 text-center">
              <span className="text-sm font-bold uppercase tracking-wider text-primary-600">Device protection</span>
              <h1 className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl">Protect the devices you rely on</h1>
              <p className="mx-auto mt-3 max-w-2xl text-gray-500">Tell us about your device and we will help you find the right insurance cover.</p>
            </header>
            <div className="mb-8 flex items-center justify-center gap-3 text-sm font-semibold">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full ${step >= 1 ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-500"}`}>1</span>
              <span className={step >= 1 ? "text-primary-700" : "text-gray-400"}>Select device</span>
              <span className="h-px w-12 bg-gray-200 sm:w-20" />
              <span className={`flex h-9 w-9 items-center justify-center rounded-full ${step >= 2 ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-500"}`}>2</span>
              <span className={step >= 2 ? "text-primary-700" : "text-gray-400"}>Your details</span>
            </div>

            {step === 1 ? (
              <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
                <h2 className="text-xl font-bold text-gray-900">What would you like to protect?</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {deviceOptions.map((device) => (
                    <button type="button" key={device.label} onClick={() => setValue("deviceType", device.label, { shouldValidate: true })} className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition ${selectedDevice === device.label ? "border-primary-500 bg-primary-50 ring-2 ring-primary-100" : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"}`}>
                      <Icon icon={device.icon} className="h-10 w-10 text-primary-600" />
                      <span><strong className="block text-gray-900">{device.label}</strong><small className="text-gray-500">Choose this device</small></span>
                      {selectedDevice === device.label && <Icon icon="mdi:check-circle" className="ml-auto h-6 w-6 text-primary-600" />}
                    </button>
                  ))}
                </div>
                {errors.deviceType && <p className="mt-3 text-sm text-red-600">{errors.deviceType.message}</p>}
                <button type="button" disabled={!selectedDevice} onClick={() => setStep(2)} className="mt-8 w-full rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">Continue <Icon icon="mdi:arrow-right" className="ml-2 inline h-5 w-5" /></button>
              </section>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
                <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-5"><div><h2 className="text-xl font-bold text-gray-900">Device and customer details</h2><p className="mt-1 text-sm text-gray-500">All fields marked here help us prepare an accurate quote.</p></div><button type="button" onClick={() => setStep(1)} className="text-sm font-semibold text-primary-600 hover:text-primary-700">Change device</button></div>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Full Name" error={errors.fullName}><input {...register("fullName")} className={inputClass} placeholder="Your full name" /></Field>
                  <Field label="Phone" error={errors.phone}><input {...register("phone")} className={inputClass} placeholder="Phone number" /></Field>
                  <Field label="Email" error={errors.email}><input type="email" {...register("email")} className={inputClass} placeholder="you@example.com" /></Field>
                  <Field label="Device Type" error={errors.deviceType}><select {...register("deviceType")} className={inputClass}><option value="">Select device type</option>{deviceOptions.map((item) => <option key={item.label}>{item.label}</option>)}</select></Field>
                  <Field label="Brand" error={errors.brand}><input {...register("brand")} className={inputClass} placeholder="e.g. Apple" /></Field>
                  <Field label="Model" error={errors.model}><input {...register("model")} className={inputClass} placeholder="e.g. iPhone 15" /></Field>
                  <Field label="IMEI" error={errors.imei}><input {...register("imei")} className={inputClass} placeholder="Device IMEI number" /></Field>
                  <Field label="Purchase Date" error={errors.purchaseDate}><input type="date" {...register("purchaseDate")} className={inputClass} /></Field>
                  <Field label="Device Price" error={errors.devicePrice}><input type="number" min="0" step="0.01" {...register("devicePrice")} className={inputClass} placeholder="0.00" /></Field>
                  <Field label="Insurance Type" error={errors.insuranceType}><select {...register("insuranceType")} className={inputClass}><option value="">Select insurance type</option>{insuranceOptions.map((item) => <option key={item}>{item}</option>)}</select></Field>
                  <div className="md:col-span-2"><Field label="Notes" error={errors.notes}><textarea {...register("notes")} rows="4" className={inputClass} placeholder="Anything else we should know?" /></Field></div>
                </div>
                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end"><button type="button" onClick={() => setStep(1)} className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">Back</button><button type="submit" disabled={submitting} className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-60">{submitting ? "Submitting..." : "Submit request"}</button></div>
              </form>
            )}
          </>
        )}
      </main>
    </div>
  );
}
