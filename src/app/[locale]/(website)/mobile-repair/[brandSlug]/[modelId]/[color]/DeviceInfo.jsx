import { Icon } from "@iconify/react";


const warrantyOptions = [
  { value: 'active', label: 'Under Warranty', icon: 'mdi:shield-check', color: 'text-green-600' },
  { value: 'expired', label: 'Warranty Expired', icon: 'mdi:shield-off', color: 'text-red-600' },
  { value: 'unknown', label: 'Not Sure', icon: 'mdi:help-circle', color: 'text-gray-600' },
];

export const DeviceInfo = ({ control, errors, Controller }) => (
  <div className="space-y-3">
    {/* <Controller
      name="deviceInfo.purchaseYear"
      control={control}
      render={({ field }) => (
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">Purchase Year (Optional)</label>
          <input
            {...field}
            type="number"
            placeholder="e.g., 2023"
            className={`w-full p-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.deviceInfo?.purchaseYear ? 'border-red-300' : 'border-gray-300'}`}
          />
          {errors.deviceInfo?.purchaseYear && (
            <p className="mt-1 text-base text-red-600 flex items-center gap-1">
              <Icon icon="mdi:alert-circle" />
              {errors.deviceInfo.purchaseYear.message}
            </p>
          )}
        </div>
      )}
    /> */}
    <div>
      <label className="block text-base font-medium text-gray-700 mb-1">Warranty Status</label>
      <div className="grid grid-cols-3 gap-2">
        {warrantyOptions.map((warranty) => (
          <Controller
            key={warranty.value}
            name="deviceInfo.warrantyStatus"
            control={control}
            render={({ field }) => (
              <div
                onClick={() => field.onChange(warranty.value)}
                className={`p-2 border rounded-md cursor-pointer text-center text-base ${field.value === warranty.value ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-300'}`}
              >
                <Icon icon={warranty.icon} className={`text-base ${warranty.color} mx-auto`} />
                <span>{warranty.label}</span>
              </div>
            )}
          />
        ))}
      </div>
      {errors.deviceInfo?.warrantyStatus && (
        <p className="mt-1 text-base text-red-600 flex items-center gap-1">
          <Icon icon="mdi:alert-circle" />
          {errors.deviceInfo.warrantyStatus.message}
        </p>
      )}
    </div>
  </div>
);