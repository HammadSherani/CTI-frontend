'use client';

import React, { useState, useMemo } from 'react';
import { CustomDropdown, UrgencyDropdown } from '@/components/dropdown';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

// ==================== DUMMY DATA WITH PLACEHOLDER IMAGES ====================

const DUMMY_DATA = [
  {
    _id: '1',
    title: 'iPhone 14 Pro Screen Repair',
    description: 'Cracked screen replacement with original quality display',
    serviceType: 'repair',
    status: 'Pending',
    urgency: 'High',
    customer: 'John Doe',
    brand: 'Apple',
    city: 'New York',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    pricing: {
      total: 299,
      basePrice: 199,
      partsPrice: 100,
      serviceCharges: 50,
      currency: '$'
    },
    deviceInfo: {
      brandId: { name: 'Apple' },
      modelId: { name: 'iPhone 14 Pro' }
    },
    images: ['/placeholder/service-1.jpg', '/placeholder/service-2.jpg'],
    rejectionReason: null
  },
  {
    _id: '2',
    title: 'Samsung Galaxy S23 Battery Replacement',
    description: 'Battery draining issue, need original battery replacement',
    serviceType: 'battery',
    status: 'In Progress',
    urgency: 'Medium',
    customer: 'Jane Smith',
    brand: 'Samsung',
    city: 'Los Angeles',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
    pricing: {
      total: 89,
      basePrice: 49,
      partsPrice: 40,
      serviceCharges: 20,
      currency: '$'
    },
    deviceInfo: {
      brandId: { name: 'Samsung' },
      modelId: { name: 'Galaxy S23' }
    },
    images: ['/placeholder/service-3.jpg'],
    rejectionReason: null
  },
  {
    _id: '3',
    title: 'Google Pixel 7 Water Damage Repair',
    description: 'Phone dropped in water, need complete cleaning and repair',
    serviceType: 'repair',
    status: 'Completed',
    urgency: 'High',
    customer: 'Mike Johnson',
    brand: 'Google',
    city: 'Chicago',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-13T16:45:00Z',
    pricing: {
      total: 149,
      basePrice: 99,
      partsPrice: 50,
      serviceCharges: 30,
      currency: '$'
    },
    deviceInfo: {
      brandId: { name: 'Google' },
      modelId: { name: 'Pixel 7' }
    },
    images: ['/placeholder/service-4.jpg', '/placeholder/service-5.jpg'],
    rejectionReason: null
  },
  {
    _id: '4',
    title: 'OnePlus 11 Charging Port Repair',
    description: 'Charging port not working, need replacement',
    serviceType: 'repair',
    status: 'Pending',
    urgency: 'Low',
    customer: 'Sarah Wilson',
    brand: 'OnePlus',
    city: 'Houston',
    createdAt: '2024-01-16T11:45:00Z',
    updatedAt: '2024-01-16T11:45:00Z',
    pricing: {
      total: 69,
      basePrice: 39,
      partsPrice: 30,
      serviceCharges: 15,
      currency: '$'
    },
    deviceInfo: {
      brandId: { name: 'OnePlus' },
      modelId: { name: '11' }
    },
    images: ['/placeholder/service-6.jpg'],
    rejectionReason: null
  },
  {
    _id: '5',
    title: 'Xiaomi Mi 11 Software Update',
    description: 'Software issues after latest update, need downgrade',
    serviceType: 'repair',
    status: 'In Progress',
    urgency: 'Medium',
    customer: 'Alex Chen',
    brand: 'Xiaomi',
    city: 'San Francisco',
    createdAt: '2024-01-13T13:15:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    pricing: {
      total: 49,
      basePrice: 29,
      partsPrice: 0,
      serviceCharges: 20,
      currency: '$'
    },
    deviceInfo: {
      brandId: { name: 'Xiaomi' },
      modelId: { name: 'Mi 11' }
    },
    images: ['/placeholder/service-7.jpg'],
    rejectionReason: null
  },
  {
    _id: '6',
    title: 'iPhone 13 Camera Repair',
    description: 'Camera lens broken, need replacement',
    serviceType: 'repair',
    status: 'Completed',
    urgency: 'High',
    customer: 'Emily Brown',
    brand: 'Apple',
    city: 'Miami',
    createdAt: '2024-01-08T15:30:00Z',
    updatedAt: '2024-01-12T11:20:00Z',
    pricing: {
      total: 159,
      basePrice: 99,
      partsPrice: 60,
      serviceCharges: 25,
      currency: '$'
    },
    deviceInfo: {
      brandId: { name: 'Apple' },
      modelId: { name: 'iPhone 13' }
    },
    images: ['/placeholder/service-8.jpg', '/placeholder/service-9.jpg'],
    rejectionReason: null
  },
  {
    _id: '7',
    title: 'Samsung Galaxy Z Fold 4 Screen Replacement',
    description: 'Inner screen cracked, need expensive replacement',
    serviceType: 'screen',
    status: 'Pending',
    urgency: 'High',
    customer: 'David Miller',
    brand: 'Samsung',
    city: 'Seattle',
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z',
    pricing: {
      total: 599,
      basePrice: 499,
      partsPrice: 100,
      serviceCharges: 50,
      currency: '$'
    },
    deviceInfo: {
      brandId: { name: 'Samsung' },
      modelId: { name: 'Galaxy Z Fold 4' }
    },
    images: ['/placeholder/service-10.jpg'],
    rejectionReason: null
  },
  {
    _id: '8',
    title: 'iPad Pro Screen Repair',
    description: 'Screen cracked after drop, need replacement',
    serviceType: 'screen',
    status: 'Pending',
    urgency: 'Medium',
    customer: 'Lisa Anderson',
    brand: 'Apple',
    city: 'Boston',
    createdAt: '2024-01-15T16:20:00Z',
    updatedAt: '2024-01-15T16:20:00Z',
    pricing: {
      total: 399,
      basePrice: 299,
      partsPrice: 100,
      serviceCharges: 50,
      currency: '$'
    },
    deviceInfo: {
      brandId: { name: 'Apple' },
      modelId: { name: 'iPad Pro' }
    },
    images: ['/placeholder/service-11.jpg', '/placeholder/service-12.jpg'],
    rejectionReason: null
  }
];

// ==================== HELPERS ====================

const getStatusConfig = (status) => {
  switch (status) {
    case 'Completed': return { bg: 'bg-emerald-500', text: 'text-white', label: 'Completed' };
    case 'Pending': return { bg: 'bg-amber-500', text: 'text-white', label: 'Pending' };
    case 'In Progress': return { bg: 'bg-blue-500', text: 'text-white', label: 'In Progress' };
    default: return { bg: 'bg-gray-500', text: 'text-white', label: status };
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'bg-emerald-100 text-emerald-800';
    case 'Pending': return 'bg-amber-100 text-amber-800';
    case 'In Progress': return 'bg-blue-100 text-blue-800';
    case 'Rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getServiceTypeIcon = (type) => {
  switch (type) {
    case 'repair': return 'heroicons:wrench-screwdriver';
    case 'battery': return 'heroicons:battery-100';
    case 'screen': return 'heroicons:device-phone-mobile';
    default: return 'heroicons:sparkles';
  }
};

const getServiceTypeLabel = (type) => {
  switch (type) {
    case 'repair': return 'Repair Service';
    case 'battery': return 'Battery Service';
    case 'screen': return 'Screen Service';
    default: return 'Other Service';
  }
};

const formatCurrency = (amount, currency = '$') => {
  return `${currency}${Number(amount || 0).toLocaleString('en-US')}`;
};

// Placeholder Image Component
const PlaceholderImage = ({ icon, title }) => (
  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
    <div className="text-center">
      <Icon icon={icon || 'heroicons:device-phone-mobile'} className="w-12 h-12 text-primary-600 mx-auto mb-2" />
      <p className="text-xs text-primary-700">{title || 'Service Image'}</p>
    </div>
  </div>
);

// ==================== CARD COMPONENTS ====================

const ServiceCardList = ({ service }) => {
  const statusConfig = getStatusConfig(service.status);
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 transition-all duration-300 ease-in-out hover:shadow-lg">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Image Section */}
        <div className="lg:w-48 h-48 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {service.images && service.images[0] ? (
            <img 
              src={service.images[0]} 
              alt={service.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center"><div class="text-center"><svg class="w-12 h-12 text-primary-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="text-xs text-primary-700">Service Image</p></div></div>';
              }}
            />
          ) : (
            <PlaceholderImage icon={getServiceTypeIcon(service.serviceType)} title={service.serviceType} />
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="font-bold text-xl text-gray-900">
                  {service.title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{service.description}</p>
              <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4">
                <span className="flex items-center">
                  <Icon icon={getServiceTypeIcon(service.serviceType)} className="w-4 h-4 mr-1" />
                  {getServiceTypeLabel(service.serviceType)}
                </span>
                {service.city && (
                  <span className="flex items-center">
                    <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-1" />
                    {service.city}
                  </span>
                )}
                <span className="flex items-center">
                  <Icon icon="heroicons:user" className="w-4 h-4 mr-1" />
                  {service.customer}
                </span>
                <span className="flex items-center">
                  <Icon icon="heroicons:device-phone-mobile" className="w-4 h-4 mr-1" />
                  {service.deviceInfo?.brandId?.name} {service.deviceInfo?.modelId?.name}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 whitespace-nowrap">
                {formatCurrency(service.pricing?.total, service.pricing?.currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total Price</p>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Price Breakdown:</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Base</p>
                <p className="font-semibold">{formatCurrency(service.pricing?.basePrice, service.pricing?.currency)}</p>
              </div>
              <div>
                <p className="text-gray-600">Parts</p>
                <p className="font-semibold">{formatCurrency(service.pricing?.partsPrice, service.pricing?.currency)}</p>
              </div>
              <div>
                <p className="text-gray-600">Service</p>
                <p className="font-semibold">{formatCurrency(service.pricing?.serviceCharges, service.pricing?.currency)}</p>
              </div>
            </div>
          </div>

          {/* Rejection Reason */}
          {service.status === 'rejected' && service.rejectionReason && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
              <p className="text-sm text-red-700">{service.rejectionReason}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center">
              <Icon icon="heroicons:calendar" className="w-4 h-4 mr-1" />
              Created: {new Date(service.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <Icon icon="heroicons:clock" className="w-4 h-4 mr-1" />
              Updated: {new Date(service.updatedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link href={`/service-catalog/${service._id}/Chat With Repairman`} className="flex-1 min-w-[180px]">
              <button 
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                <Icon icon="heroicons:chat-bubble-left-right" className="w-4 h-4 mr-2 inline" />
                Chat With Repairman
              </button>
            </Link>
            <Link href={`/service-catalog/${service._id}/view`} className="flex-1 min-w-[120px]">
              <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                <Icon icon="heroicons:eye" className="w-4 h-4 mr-2 inline" />
                View Details
              </button>
            </Link>
          
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceCardGrid = ({ service }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:shadow-md">
      <div className="relative">
        <div className="w-full h-48 bg-gray-100">
          {service.images && service.images[0] ? (
            <img 
              src={service.images[0]} 
              alt={service.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center"><div class="text-center"><svg class="w-12 h-12 text-primary-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="text-xs text-primary-700">Service Image</p></div></div>';
              }}
            />
          ) : (
            <PlaceholderImage icon={getServiceTypeIcon(service.serviceType)} title={service.serviceType} />
          )}
        </div>
        <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
          {service.status}
        </span>
      </div>

      <div className="p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{service.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>

        <div className="mb-4">
          <p className="text-xl font-bold text-gray-900 mb-1">
            {formatCurrency(service.pricing?.total, service.pricing?.currency)}
          </p>
          <p className="text-xs text-gray-500">
            Base: {formatCurrency(service.pricing?.basePrice, service.pricing?.currency)} | 
            Parts: {formatCurrency(service.pricing?.partsPrice, service.pricing?.currency)}
          </p>
        </div>

        <div className="mb-4 space-y-1 text-sm flex-wrap flex justify-between">
          <div className="flex items-center text-gray-600">
            <Icon icon={getServiceTypeIcon(service.serviceType)} className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{getServiceTypeLabel(service.serviceType)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Icon icon="heroicons:user" className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{service.customer}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Icon icon="heroicons:device-phone-mobile" className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{service.deviceInfo?.brandId?.name} {service.deviceInfo?.modelId?.name}</span>
          </div>
          {service.city && (
            <div className="flex items-center text-gray-600">
              <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{service.city}</span>
            </div>
          )}
        </div>

        {service.status === 'rejected' && service.rejectionReason && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 line-clamp-2">
            {service.rejectionReason}
          </div>
        )}

        <div className="flex gap-2">
          <Link href={`/service-catalog/${service._id}/Chat With Repairman`} className="flex-1">
            <button className="w-full bg-primary-600 text-white py-2 px-3 rounded-lg hover:bg-primary-700 transition-colors text-sm">
              <Icon icon="heroicons:chat-bubble-left-right" className="w-4 h-4 mr-1 inline" />
              Chat
            </button>
          </Link>
          <Link href={`/service-catalog/${service._id}`} className="flex-1">
            <button className="w-full border border-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <Icon icon="heroicons:eye" className="w-4 h-4 mr-1 inline" />
              View
            </button>
          </Link>
          
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ type }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon icon="heroicons:wrench-screwdriver" className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      No {type} services
    </h3>
    <p className="text-gray-600 mb-4 max-w-md mx-auto">
      {type === 'all' ? 'You haven\'t added any services yet.' : `No ${type} services found.`}
    </p>
  </div>
);

const statusOptions = [
  { label: 'All Status', value: '' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Pending', value: 'Pending' },
  { label: 'In Progress', value: 'In Progress' },
];

const urgencyOptions = [
  { label: 'All Urgency', value: '' },
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' },
];

// ==================== MAIN PAGE ====================

export default function ServiceCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setUrgencyFilter('');
    setActiveTab('all');
  };

  const filteredData = useMemo(() => {
    return DUMMY_DATA.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesUrgency = !urgencyFilter || item.urgency === urgencyFilter;
      const matchesTab =
        activeTab === 'all' ||
        item.status.toLowerCase().replace(' ', '') === activeTab.replace(' ', '');

      return matchesSearch && matchesStatus && matchesUrgency && matchesTab;
    });
  }, [searchQuery, statusFilter, urgencyFilter, activeTab]);

  const tabs = [
    { key: 'all', label: 'All Services' },
    { key: 'pending', label: 'Pending' },
    { key: 'inprogress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-1">Service Catalog</h1>
        <p className="text-gray-600 mb-8">All repair jobs at a glance</p>

        {/* Tabs */}
        <div className="flex border-b mb-8 overflow-x-auto hide-scrollbar">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-8 py-4 font-semibold capitalize whitespace-nowrap border-b-4 transition-all ${
                activeTab === key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services, customer or brand..."
              className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          <div className="w-full lg:w-60">
            <CustomDropdown label="Status" options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
          </div>



          <button
            onClick={handleClearFilters}
            className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 rounded-2xl font-medium text-white transition-all active:scale-95 whitespace-nowrap"
          >
            Clear Filters
          </button>

          {/* View Toggle */}
<div className="flex items-center space-x-2 bg-primary-600 rounded-2xl p-1.5">
  <button
    onClick={() => setViewMode('grid')}
    className={`p-3 rounded-xl flex items-center justify-center transition-all duration-200
      ${
        viewMode === 'grid'
          ? 'bg-primary-100 text-primary-600 shadow-sm scale-100'
          : 'text-white/70 hover:text-white hover:bg-primary-500/70 hover:scale-95'
      }`}
  >
    <Icon icon="heroicons:squares-2x2" className="w-5 h-5" />
  </button>

  <button
    onClick={() => setViewMode('list')}
    className={`p-3 rounded-xl flex items-center justify-center transition-all duration-200
      ${
        viewMode === 'list'
          ? 'bg-primary-100 text-primary-600 shadow-sm scale-100'
          : 'text-white/70 hover:text-white hover:bg-primary-500/70 hover:scale-95'
      }`}
  >
    <Icon icon="heroicons:list-bullet" className="w-5 h-5" />
  </button>
</div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-lg text-gray-600">
            Showing <span className="font-bold text-gray-900">{filteredData.length}</span> services
          </p>
        </div>

        {/* Content */}
        {filteredData.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((service) => (
                <ServiceCardGrid key={service._id} service={service} />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredData.map((service) => (
                <ServiceCardList key={service._id} service={service} />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <Icon icon="heroicons:magnifying-glass" className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700">No services found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}