"use client";
import { Controller } from "react-hook-form";
import { useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 === 0 ? 12 : i % 12;
  const period = i < 12 ? "AM" : "PM";
  return `${String(h).padStart(2, "0")}:00 ${period}`;
});

export default function ShippingOperations({ control, errors, watch, setValue }) {
  const [cityInput, setCityInput] = useState("");
  const deliveryCities = watch("deliveryCities") || [];
  const workingDays = watch("workingDays") || [];

  const addCity = () => {
    const c = cityInput.trim();
    if (c && !deliveryCities.includes(c)) {
      setValue("deliveryCities", [...deliveryCities, c], { shouldValidate: true });
      setCityInput("");
    }
  };

  const removeCity = (c) => {
    setValue("deliveryCities", deliveryCities.filter((x) => x !== c), { shouldValidate: true });
  };

  const toggleDay = (day) => {
    const next = workingDays.includes(day)
      ? workingDays.filter((d) => d !== day)
      : [...workingDays, day];
    setValue("workingDays", next, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
        Shipping & Operations
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Shipping Method */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Shipping Method <span className="text-primary-500">*</span>
          </label>
          <Controller name="shippingMethod" control={control} render={({ field }) => (
            <select {...field}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white
                ${errors.shippingMethod ? "border-primary-400" : "border-gray-300"}`}>
              <option value="">Select shipping method</option>
              <option value="own_delivery">Own Delivery</option>
              <option value="courier">Courier Service</option>
              <option value="both">Both</option>
              <option value="pickup_only">Pickup Only</option>
            </select>
          )} />
          {errors.shippingMethod && <p className="text-primary-500 text-xs mt-1">{errors.shippingMethod.message}</p>}
        </div>

        {/* Delivery Cities */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Delivery Cities <span className="text-primary-500">*</span>
          </label>
          <div className={`border rounded-lg p-2 min-h-[48px] ${errors.deliveryCities ? "border-primary-400" : "border-gray-300"}`}>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {deliveryCities.map((c) => (
                <span key={c} className="flex items-center gap-1 bg-primary-100 text-primary-800 px-2.5 py-1 rounded-full text-xs font-medium">
                  {c}
                  <button type="button" onClick={() => removeCity(c)} className="text-primary-600 hover:text-primary-500 ml-0.5">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCity(); } }}
                placeholder="Type city name and press Enter"
                className="flex-1 outline-none text-sm bg-transparent text-gray-700 placeholder-gray-400"
              />
              <button type="button" onClick={addCity}
                className="text-xs px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                Add
              </button>
            </div>
          </div>
          {errors.deliveryCities && <p className="text-primary-500 text-xs mt-1">{errors.deliveryCities.message}</p>}
        </div>

        {/* Working Days */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Working Days <span className="text-primary-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                  ${workingDays.includes(day)
                    ? "bg-primary-600 border-primary-600 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-600 hover:border-primary-400"}`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
          {errors.workingDays && <p className="text-primary-500 text-xs mt-1">{errors.workingDays.message}</p>}
        </div>

        {/* Working Hours */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Start Time <span className="text-primary-500">*</span>
          </label>
          <Controller name="workingHours.start" control={control} render={({ field }) => (
            <select {...field} className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white
              ${errors.workingHours?.start ? "border-primary-400" : "border-gray-300"}`}>
              <option value="">Select start time</option>
              {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          )} />
          {errors.workingHours?.start && <p className="text-primary-500 text-xs mt-1">{errors.workingHours.start.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            End Time <span className="text-primary-500">*</span>
          </label>
          <Controller name="workingHours.end" control={control} render={({ field }) => (
            <select {...field} className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white
              ${errors.workingHours?.end ? "border-primary-400" : "border-gray-300"}`}>
              <option value="">Select end time</option>
              {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          )} />
          {errors.workingHours?.end && <p className="text-primary-500 text-xs mt-1">{errors.workingHours.end.message}</p>}
        </div>
      </div>
    </div>
  );
}