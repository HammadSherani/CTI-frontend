"use client";
import { Controller } from "react-hook-form";
import { useRef } from "react";
import { Icon } from "@iconify/react";

const UploadField = ({ label, name, control, errors, setValue, watch, accept, hint }) => {
  const inputRef = useRef();
  const file = watch(name);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">
        {label} <span className="text-primary-500">*</span>
      </label>
      <Controller name={name} control={control} render={() => (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) setValue(name, f, { shouldValidate: true });
          }}
          className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all
            ${file ? "border-teal-500 bg-teal-50" : "border-gray-300 bg-gray-50 hover:border-teal-400 hover:bg-teal-50"}
            ${errors[name] ? "border-primary-400 bg-primary-50" : ""}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files[0];
              if (f) setValue(name, f, { shouldValidate: true });
            }}
          />
          {file ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl"></span>
              <p className="text-xs font-medium text-teal-700 break-all">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setValue(name, null, { shouldValidate: true }); }}
                className="text-xs text-primary-500 hover:underline mt-1"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl text-gray-300"><Icon icon="mdi:upload" /> </span>
              <p className="text-sm text-gray-500">Click or drag & drops</p>
              {hint && <p className="text-xs text-gray-400">{hint}</p>}
            </div>
          )}
        </div>
      )} />
      {errors[name] && <p className="text-primary-500 text-xs mt-1">{errors[name].message}</p>}
    </div>
  );
};

export default function DocumentUploads({ control, errors, setValue, watch }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
        Document Uploads
      </h2>
      <p className="text-sm text-gray-500 -mt-2">All documents must be clear and legible. Max 5MB each.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <UploadField
          label="Profile Picture / Logo"
          name="profilePictureOrLogo"
          control={control} errors={errors} setValue={setValue} watch={watch}
          accept="image/jpeg,image/jpg,image/png,image/webp"
          hint="JPG, PNG, WEBP — Max 5MB"
        />
        <UploadField
          label="National ID / Passport"
          name="nationalIdOrPassport"
          control={control} errors={errors} setValue={setValue} watch={watch}
          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
          hint="Image or PDF — Max 5MB"
        />
        <UploadField
          label="Shop License / Tax Certificate"
          name="shopLicenseOrTaxCertificate"
          control={control} errors={errors} setValue={setValue} watch={watch}
          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
          hint="Image or PDF — Max 5MB"
        />
        <UploadField
          label="Proof of Address"
          name="proofOfAddress"
          control={control} errors={errors} setValue={setValue} watch={watch}
          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
          hint="Utility bill or bank statement — Max 5MB"
        />
      </div>
    </div>
  );
}