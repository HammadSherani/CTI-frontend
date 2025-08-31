import { Icon } from "@iconify/react";

const servicePreferences = [
  { value: 'pickup', label: 'Pickup & Delivery', icon: 'mdi:truck-delivery' },
  { value: 'drop-off', label: 'On-site Repair', icon: 'mdi:home-repair' },
];

export const LocationPreferences = ({Controller, control, errors, getCurrentLocation, isGettingLocation, locationError, coordinates }) => (
  <div className="space-y-3">
    <div className="bg-blue-50 p-3 rounded-md">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-blue-900">Auto-detect Location</span>
          <p className="text-xs text-blue-700">Fill address and city automatically</p>
        </div>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs"
        >
          {isGettingLocation ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Getting...
            </>
          ) : (
            <>
              <Icon icon="mdi:crosshairs-gps" />
              Get Location
            </>
          )}
        </button>
      </div>
      {locationError && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <Icon icon="mdi:alert-circle" />
          {locationError}
        </p>
      )}
      {/* {coordinates && (
        <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
          <Icon icon="mdi:check-circle" />
          Location: {coordinates[0]?.toFixed(6)}, {coordinates[1]?.toFixed(6)}
        </p>
      )} */}
    </div>
    <div className="grid grid-cols-2 gap-2">
      <Controller
        name="location.address"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
            <input
              {...field}
              type="text"
              placeholder="123 Main Street"
              className={`w-full p-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.location?.address ? 'border-red-300' : 'border-gray-300'}`}
            />
            {errors.location?.address && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <Icon icon="mdi:alert-circle" />
                {errors.location.address.message}
              </p>
            )}
          </div>
        )}
      />
      <Controller
        name="location.city"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
            <input
              {...field}
              type="text"
              placeholder="e.g., Karachi"
              className={`w-full p-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.location?.city ? 'border-red-300' : 'border-gray-300'}`}
            />
            {errors.location?.city && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <Icon icon="mdi:alert-circle" />
                {errors.location.city.message}
              </p>
            )}
          </div>
        )}
      />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <Controller
        name="location.district"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">District (Optional)</label>
            <input
              {...field}
              type="text"
              placeholder="e.g., Central"
              className="w-full p-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        )}
      />
      <Controller
        name="location.zipCode"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">ZIP Code (Optional)</label>
            <input
              {...field}
              type="text"
              placeholder="e.g., 75300"
              className="w-full p-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        )}
      />
    </div>
    <Controller
      name="preferredTime"
      control={control}
      render={({ field }) => (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Preferred Time</label>
          <input
            {...field}
            type="datetime-local"
            min={(() => {
              const now = new Date();
              now.setHours(now.getHours() + 1);
              return now.toISOString().slice(0, 16);
            })()}
            className={`w-full p-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.preferredTime ? 'border-red-300' : 'border-gray-300'}`}
            onChange={(e) => field.onChange(e.target.value)}
          />
          {errors.preferredTime && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <Icon icon="mdi:alert-circle" />
              {errors.preferredTime.message}
            </p>
          )}
        </div>
      )}
    />
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">Service Preference</label>
      <div className="grid grid-cols-2 gap-2">
        {servicePreferences.map((pref) => (
          <Controller
            key={pref.value}
            name="servicePreference"
            control={control}
            render={({ field }) => (
              <div
                onClick={() => field.onChange(pref.value)}
                className={`p-2 border rounded-md cursor-pointer text-center text-xs ${field.value === pref.value ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-300'}`}
              >
                <Icon icon={pref.icon} className={`text-base ${field.value === pref.value ? 'text-orange-500' : 'text-gray-400'} mx-auto`} />
                <span>{pref.label}</span>
              </div>
            )}
          />
        ))}
      </div>
      {errors.servicePreference && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <Icon icon="mdi:alert-circle" />
          {errors.servicePreference.message}
        </p>
      )}
    </div>
  </div>
);