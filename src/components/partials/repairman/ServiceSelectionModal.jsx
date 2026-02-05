"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

function ServiceSelectionModal({ 
  isOpen, 
  onClose, 
  services = [], 
  selectedServices = [], 
  onSelectService,
  loading = false 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter services based on debounced search
  const filteredServices = services.filter(service => {
    const search = debouncedSearch.toLowerCase();
    return (
      service.title?.toLowerCase().includes(search) ||
      service.description?.toLowerCase().includes(search) ||
      service.deviceInfo?.brandId?.name?.toLowerCase().includes(search) ||
      service.deviceInfo?.modelId?.name?.toLowerCase().includes(search) ||
      service.deviceInfo?.categoryId?.name?.toLowerCase().includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const isSelected = (serviceId) => {
    return selectedServices.some(s => s._id === serviceId);
  };

  const handleToggleService = (service) => {
    onSelectService(service);
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      TRY: '₺',
      USD: '$',
      EUR: '€',
      PKR: '₨',
    };
    return symbols[currency] || currency;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Select Services</h2>
              <p className="text-sm text-gray-600 mt-1">
                Choose services to promote in your advertisement
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, brand, model, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Icon icon="mdi:close-circle" className="w-5 h-5" />
              </button>
            )}
            {searchTerm && searchTerm !== debouncedSearch && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <Icon icon="mdi:loading" className="w-4 h-4 text-gray-400 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <Icon icon="mdi:alert-circle" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search.' : 'You need to create services first.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedServices.map((service) => (
                <div
                  key={service._id}
                  onClick={() => handleToggleService(service)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected(service._id)
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          service.status === 'approved' ? 'bg-green-100 text-green-800' :
                          service.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {service.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {service.deviceInfo?.brandId && (
                          <div className="flex items-center text-gray-700">
                            <Icon icon="mdi:cellphone" className="w-4 h-4 mr-1 text-primary-600" />
                            <span className="font-medium">{service.deviceInfo.brandId.name}</span>
                          </div>
                        )}
                        
                        {service.deviceInfo?.modelId && (
                          <div className="flex items-center text-gray-700">
                            <Icon icon="mdi:devices" className="w-4 h-4 mr-1 text-primary-600" />
                            <span>{service.deviceInfo.modelId.name}</span>
                          </div>
                        )}
                        
                        {service.pricing && (
                          <div className="flex items-center text-green-600 font-semibold">
                            <Icon icon="mdi:cash" className="w-4 h-4 mr-1" />
                            <span>
                              {getCurrencySymbol(service.pricing.currency)}{service.pricing.total}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {isSelected(service._id) ? (
                        <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                          <Icon icon="mdi:check" className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Pagination */}
        {filteredServices.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Selected: <span className="font-semibold text-primary-600">{selectedServices.length}</span> services
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="mdi:chevron-left" className="w-5 h-5" />
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="mdi:chevron-right" className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              <button
                onClick={onClose}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceSelectionModal;
