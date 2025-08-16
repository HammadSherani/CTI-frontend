"use client";
import { useState } from "react";

export default function MultiStepForm() {
  const [step, setStep] = useState(1);

  const steps = [1, 2, 3, 4];

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-3xl p-6">
        
        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, idx) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full 
                ${step === s ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                {s}
              </div>
              {idx < steps.length - 1 && (
                <div className="w-12 h-[2px] bg-gray-300 mx-2"></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  placeholder="Enter First Name"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Enter Email"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone (without country code)</label>
                <input
                  type="text"
                  placeholder="Enter Phone Number"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Whatsapp Number</label>
                <input
                  type="text"
                  placeholder="Enter Whatsapp Number"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <select className="w-full border rounded-md px-3 py-2">
                  <option>Select City</option>
                  <option>Karachi</option>
                  <option>Lahore</option>
                  <option>Islamabad</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Enter Address"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">National Identification Number</label>
                <input
                  type="text"
                  placeholder="Enter CNIC Number"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter Password"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Re-Type Password</label>
                <input
                  type="password"
                  placeholder="Enter Password"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </form>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-orange-500 text-white rounded-md"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
