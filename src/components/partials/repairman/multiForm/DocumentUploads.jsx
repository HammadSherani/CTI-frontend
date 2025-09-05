"use client";
import { Controller } from "react-hook-form";

const DocumentUploads = ({ control, errors }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Document Uploads</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Photo
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Controller
            name="profilePhoto"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <div className="space-y-2">
                <input
                  {...field}
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files?.[0] || null)}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.profilePhoto ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <p className="text-xs text-gray-500">
                  Upload a clear photo of yourself (JPG, PNG, max 5MB)
                </p>
                {value && (
                  <p className="text-xs text-green-600 font-medium">
                    ✓ File selected: {value.name}
                  </p>
                )}
              </div>
            )}
          />
          {errors.profilePhoto && (
            <p className="text-red-500 text-sm mt-1">{errors.profilePhoto.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CNIC Scan
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Controller
            name="nationalIdOrPassportScan"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <div className="space-y-2">
                <input
                  {...field}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => onChange(e.target.files?.[0] || null)}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.nationalIdOrPassportScan ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <p className="text-xs text-gray-500">
                  Upload clear front and back images of your CNIC (JPG, PNG, PDF, max 5MB)
                </p>
                {value && (
                  <p className="text-xs text-green-600 font-medium">
                    ✓ File selected: {value.name}
                  </p>
                )}
              </div>
            )}
          />
          {errors.nationalIdOrPassportScan && (
            <p className="text-red-500 text-sm mt-1">{errors.nationalIdOrPassportScan.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop Photo
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Controller
            name="shopPhoto"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <div className="space-y-2">
                <input
                  {...field}
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files?.[0] || null)}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.shopPhoto ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <p className="text-xs text-gray-500">
                  Upload a clear photo of your repair shop exterior or interior (JPG, PNG, max 5MB)
                </p>
                {value && (
                  <p className="text-xs text-green-600 font-medium">
                    ✓ File selected: {value.name}
                  </p>
                )}
              </div>
            )}
          />
          {errors.shopPhoto && (
            <p className="text-red-500 text-sm mt-1">{errors.shopPhoto.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop Proof Document
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Controller
            name="utilityBillOrShopProof"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <div className="space-y-2">
                <input
                  {...field}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => onChange(e.target.files?.[0] || null)}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.utilityBillOrShopProof ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <p className="text-xs text-gray-500">
                  Upload utility bill, shop ownership proof, or rental agreement (JPG, PNG, PDF, max 5MB)
                </p>
                {value && (
                  <p className="text-xs text-green-600 font-medium">
                    ✓ File selected: {value.name}
                  </p>
                )}
              </div>
            )}
          />
          {errors.utilityBillOrShopProof && (
            <p className="text-red-500 text-sm mt-1">{errors.utilityBillOrShopProof.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Certifications
            <span className="text-gray-500 text-xs ml-1">(Optional)</span>
          </label>
          <Controller
            name="certifications"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <div className="space-y-2">
                <input
                  {...field}
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={(e) => onChange(e.target.files)}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all border-gray-300"
                />
                <p className="text-xs text-gray-500">
                  Upload any relevant certifications, training certificates, or skill credentials (multiple files allowed, JPG, PNG, PDF, max 5MB each)
                </p>
                {value && value.length > 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    ✓ {value.length} file{value.length > 1 ? 's' : ''} selected:
                    <ul className="mt-1 ml-4 list-disc">
                      {Array.from(value).map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          />
          {errors.certifications && (
            <p className="text-red-500 text-sm mt-1">{errors.certifications.message}</p>
          )}
        </div>
      </div>

      {/* Document Upload Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-800 mb-1">Document Upload Guidelines</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• All documents must be clear and readable</li>
              <li>• Maximum file size: 5MB per document</li>
              <li>• Accepted formats: JPG, PNG, PDF</li>
              <li>• CNIC should include both front and back (can be combined in one image)</li>
              <li>• Shop photo should clearly show your business premises</li>
              <li>• Shop proof can be utility bill, rental agreement, or ownership document</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Progress Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800 mb-1">Important Notice</h3>
            <p className="text-sm text-yellow-700">
              Your documents will be uploaded to secure cloud storage and reviewed by our team. 
              This process may take a few moments. Please don't refresh or close this page during upload.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploads;