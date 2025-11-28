import Loader from "@/components/Loader";
import axiosInstance from "@/config/axiosInstance";
import handleError from "@/helper/handleError";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useEffect, useState } from "react";

export const ServiceSelector = ({
  errors,
  selectedServices = [],
  setValue,
}) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const getServices = async () => {
    try {
      const { data } = await axiosInstance.get("/public/services");
      setServices(data?.data || []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getServices();
  }, []);

  const toggleService = (serviceId) => {
    const updated = selectedServices.includes(serviceId)
      ? selectedServices.filter((s) => s !== serviceId)
      : [...selectedServices, serviceId];

    setValue("selectedServices", updated, { shouldValidate: true });
  };

  // Helper function to get service name by ID
  const getServiceName = (serviceId) => {
    const service = services.find(s => s._id === serviceId);
    return service ? service.name : serviceId;
  };

  return (
    <Loader loading={loading}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:tools" className="text-2xl text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-800">Select Repair Services</h3>
          {selectedServices.length > 0 && (
            <span className="bg-orange-100 text-orange-800 text-lg px-2 py-1 rounded-full">
              {selectedServices.length} selected
            </span>
          )}
        </div>

        {!loading && services.length === 0 && (
          <p className="text-gray-500">No services available.</p>
        )}

        {!loading && services.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-700">Available Services</h4>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {services.map((service) => {
                const isSelected = selectedServices.includes(service._id);

                return (
                  <div
                    key={service._id}
                    onClick={() => toggleService(service._id)}
                    className={`relative p-4 rounded-xl cursor-pointer transition-all border-2 
                    ${isSelected
                        ? "bg-orange-50 border-orange-400 shadow-md"
                        : "bg-white border-gray-200 hover:bg-orange-50 hover:border-gray-300"
                      }
                  `}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                        <Icon icon="mdi:check" className="text-lg" />
                      </div>
                    )}

                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-2 rounded-full ${isSelected ? "bg-white" : "bg-orange-50"}`}>
                        <Image
                          src={service.icon}
                          width={500}
                          height={500}
                          alt={service.name}
                          className="h-20 w-20 rounded-md object-contain"
                        />
                      </div>

                      <span
                        className={`font-medium text-lg ${isSelected ? "text-orange-600" : "text-gray-700"
                          }`}
                      >
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

        {selectedServices.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-700">Selected Services</h4>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <ul className="space-y-2">
                {selectedServices.map((serviceId, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <Icon icon="mdi:check-circle" className="text-green-500" />
                    <span>{getServiceName(serviceId)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {errors.selectedServices && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700 flex items-center gap-2">
              <Icon icon="mdi:alert-circle" />
              {errors.selectedServices.message}
            </p>
          </div>
        )}
      </div>
    </Loader>
  );
};