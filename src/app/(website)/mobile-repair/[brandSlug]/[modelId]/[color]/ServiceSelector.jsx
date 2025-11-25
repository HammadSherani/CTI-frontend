import { Icon } from "@iconify/react";
import { useState } from "react";

export const ServiceSelector = ({
  Controller,
  control,
  errors,
  selectedServices = [],
  setValue,
  watch,
}) => {
  const [showCustomServiceForm, setShowCustomServiceForm] = useState(false);
  const [newCustomService, setNewCustomService] = useState("");

  // Watch for custom services
  const customServices = watch("customServices") || [];

  const repairServices = [
    {
      value: "screen",
      label: "Screen Replacement",
      icon: "mdi:cellphone-screenshot",
      color: "text-primary-500",
      bgColor: "bg-primary-50",
      borderColor: "border-primary-500",
      hoverColor: "hover:bg-primary-100",
    },
    {
      value: "battery",
      label: "Battery Replacement",
      icon: "mdi:battery-charging-100",
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-500",
      hoverColor: "hover:bg-green-100",
    },
    {
      value: "charging_port",
      label: "Charging Port",
      icon: "mdi:power-plug",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-500",
      hoverColor: "hover:bg-yellow-100",
    },
    {
      value: "speaker",
      label: "Speaker Repair",
      icon: "mdi:volume-high",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-500",
      hoverColor: "hover:bg-purple-100",
    },
    {
      value: "camera",
      label: "Camera Repair",
      icon: "mdi:camera",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-500",
      hoverColor: "hover:bg-indigo-100",
    },
    {
      value: "water_damage",
      label: "Water Damage",
      icon: "mdi:water",
      color: "text-cyan-500",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-500",
      hoverColor: "hover:bg-cyan-100",
    },
    {
      value: "motherboard",
      label: "Motherboard Repair",
      icon: "mdi:chip",
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-500",
      hoverColor: "hover:bg-red-100",
    },
    {
      value: "buttons",
      label: "Button Repair",
      icon: "mdi:gesture-tap-button",
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-500",
      hoverColor: "hover:bg-gray-100",
    },
  ];

  // MAIN CHANGE: Toggle service by name instead of value
  const toggleService = (serviceName) => {
    const currentServices = Array.isArray(selectedServices) ? selectedServices : [];
    const updatedServices = currentServices.includes(serviceName)
      ? currentServices.filter((s) => s !== serviceName)
      : [...currentServices, serviceName];
    setValue("selectedServices", updatedServices, { shouldValidate: true });
  };

  const addCustomService = () => {
    const trimmedService = newCustomService.trim();
    if (!trimmedService || customServices.some((s) => s.name.toLowerCase() === trimmedService.toLowerCase())) {
      return; // Prevent empty or duplicate services
    }

    const customService = {
      id: Date.now().toString(),
      name: trimmedService,
    };

    const updatedCustomServices = [...customServices, customService];
    setValue("customServices", updatedCustomServices, { shouldValidate: true });

    // MAIN CHANGE: Auto-select by name instead of custom_id
    const currentSelected = Array.isArray(selectedServices) ? selectedServices : [];
    setValue("selectedServices", [...currentSelected, trimmedService], {
      shouldValidate: true,
    });

    // Reset form
    setNewCustomService("");
    setShowCustomServiceForm(false);
  };

  const removeCustomService = (serviceId) => {
    const serviceToRemove = customServices.find((s) => s.id === serviceId);
    const updatedCustomServices = customServices.filter((s) => s.id !== serviceId);
    setValue("customServices", updatedCustomServices, { shouldValidate: true });

    // MAIN CHANGE: Remove by service name instead of custom_id
    if (serviceToRemove) {
      const updatedSelectedServices = selectedServices.filter((s) => s !== serviceToRemove.name);
      setValue("selectedServices", updatedSelectedServices, { shouldValidate: true });
    }
  };

  // SIMPLIFIED: Get display name (since we're storing names directly now)
  const getServiceName = (serviceName) => {
    // Check if it's a predefined service
    const service = repairServices.find((s) => s.label === serviceName);
    if (service) return service.label;
    
    // Otherwise it's a custom service name
    return serviceName;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Icon icon="mdi:tools" className="text-2xl text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-800">Select Repair Services</h3>
        {selectedServices.length > 0 && (
          <span className="bg-orange-100 text-orange-800 text-lg px-2 py-1 rounded-full">
            {selectedServices.length} selected
          </span>
        )}
      </div>

      {/* Default Services Grid */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-700">Popular Services</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {repairServices.map((service) => {
            // MAIN CHANGE: Check by service.label instead of service.value
            const isSelected = selectedServices.includes(service.label);
            return (
              <div
                key={service.value}
                onClick={() => toggleService(service.label)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && toggleService(service.label)}
                className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                  isSelected
                    ? `${service.bgColor} ${service.borderColor} shadow-md`
                    : `bg-white border-gray-200 ${service.hoverColor} hover:border-gray-300 hover:shadow-sm`
                }`}
                aria-label={`Select ${service.label}`}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                    <Icon icon="mdi:check" className="text-lg" />
                  </div>
                )}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-3 rounded-full ${isSelected ? "bg-white" : service.bgColor}`}>
                    <Icon icon={service.icon} className={`text-3xl ${service.color}`} />
                  </div>
                  <span className={`font-medium text-lg ${isSelected ? service.color : "text-gray-700"}`}>
                    {service.label}
                  </span>
                  {isSelected && (
                    <span className="text-xs font-semibold text-green-600">Selected</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Services */}
      {customServices.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700">Custom Services</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {customServices.map((service) => {
              // MAIN CHANGE: Check by service.name directly
              const isSelected = selectedServices.includes(service.name);
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.name)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && toggleService(service.name)}
                  className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 group ${
                    isSelected
                      ? "bg-orange-50 border-orange-500 shadow-md"
                      : "bg-white border-gray-200 hover:bg-orange-25 hover:border-gray-300 hover:shadow-sm"
                  }`}
                  aria-label={`Select ${service.name}`}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                      <Icon icon="mdi:check" className="text-lg" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCustomService(service.id);
                    }}
                    className="absolute -top-1 -left-1 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity bg-white rounded-full p-1 shadow-sm border border-gray-200"
                    aria-label={`Remove ${service.name}`}
                  >
                    <Icon icon="mdi:close" className="text-xs" />
                  </button>
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`p-3 rounded-full ${isSelected ? "bg-white" : "bg-orange-50"}`}>
                      <Icon icon="mdi:wrench" className="text-3xl text-orange-500" />
                    </div>
                    <span className={`font-medium text-lg ${isSelected ? "text-orange-700" : "text-gray-700"}`}>
                      {service.name}
                    </span>
                    {isSelected && (
                      <span className="text-xs font-semibold text-green-600">Selected</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700">Selected Services</h4>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <ul className="space-y-2">
              {selectedServices.map((serviceName, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-700">
                  <Icon icon="mdi:check-circle" className="text-green-500" />
                  <span>{serviceName}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Add Custom Service */}
      <div className="space-y-4">
        {!showCustomServiceForm ? (
          <button
            type="button"
            onClick={() => setShowCustomServiceForm(true)}
            className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 flex flex-col items-center gap-2 text-gray-600 hover:text-orange-600"
            aria-label="Add custom service"
          >
            <Icon icon="mdi:plus" className="text-3xl" />
            <span className="font-medium">Add Custom Service</span>
          </button>
        ) : (
          <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter service name (max 50 characters)"
                value={newCustomService}
                onChange={(e) => setNewCustomService(e.target.value.slice(0, 50))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                maxLength={50}
                aria-label="Custom service name"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={addCustomService}
                  disabled={!newCustomService.trim() || customServices.some((s) => s.name.toLowerCase() === newCustomService.trim().toLowerCase())}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  aria-label="Add custom service"
                >
                  Add Service
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomServiceForm(false);
                    setNewCustomService("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  aria-label="Cancel adding custom service"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {errors.selectedServices && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 flex items-center gap-2">
            <Icon icon="mdi:alert-circle" />
            {errors.selectedServices.message}
          </p>
        </div>
      )}
    </div>
  );
};