'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
;
import { Icon } from '@iconify/react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

// ==================== DUMMY DATA (Same as main page) ====================

const DUMMY_DATA = [
  {
    _id: '1',
    title: 'iPhone 14 Pro Screen Repair',
    description: 'Cracked screen replacement with original quality display. We use high-quality OLED displays that maintain the original color accuracy and touch sensitivity. The repair includes a full diagnostic test and 3 months warranty on the replacement part.',
    serviceType: 'repair',
    status: 'Pending',
    urgency: 'High',
    customer: 'John Doe',
    customerEmail: 'john.doe@example.com',
    customerPhone: '+1 (555) 123-4567',
    brand: 'Apple',
    city: 'New York',
    address: '123 Main Street, Apt 4B, New York, NY 10001',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    scheduledDate: '2024-01-20T14:00:00Z',
    pricing: {
      total: 299,
      basePrice: 199,
      partsPrice: 100,
      serviceCharges: 50,
      currency: '$',
      tax: 25,
      discount: 0
    },
    deviceInfo: {
      brandId: { name: 'Apple', _id: 'brand1' },
      modelId: { name: 'iPhone 14 Pro', _id: 'model1' },
      serialNumber: 'DNX9K4Q2L5',
      color: 'Deep Purple',
      storage: '256GB',
      condition: 'Good - Minor scratches on body'
    },
    images: [
      '/placeholder/service-1.jpg',
      '/placeholder/service-2.jpg'
    ],
    problemDetails: {
      category: 'Screen Damage',
      subCategory: 'Cracked Glass',
      description: 'Phone dropped from waist height, screen completely shattered but still responsive. Touch ID working fine.',
      symptoms: ['Cracked glass', 'Display shows lines', 'Small glass pieces falling off']
    },
    preferredTechnician: {
      name: 'Mike Wilson',
      id: 'tech123',
      rating: 4.8
    },
    rejectionReason: null,
    timeline: [
      { status: 'Service Requested', date: '2024-01-15T10:30:00Z', note: 'Customer submitted repair request' },
      { status: 'Awaiting Approval', date: '2024-01-15T10:35:00Z', note: 'Request received, waiting for admin approval' }
    ]
  },
  {
    _id: '2',
    title: 'Samsung Galaxy S23 Battery Replacement',
    description: 'Battery draining issue, need original battery replacement. Customer reports that phone dies at 30% battery and needs frequent charging throughout the day.',
    serviceType: 'battery',
    status: 'In Progress',
    urgency: 'Medium',
    customer: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    customerPhone: '+1 (555) 234-5678',
    brand: 'Samsung',
    city: 'Los Angeles',
    address: '456 Oak Avenue, Los Angeles, CA 90001',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
    scheduledDate: '2024-01-18T11:00:00Z',
    pricing: {
      total: 89,
      basePrice: 49,
      partsPrice: 40,
      serviceCharges: 20,
      currency: '$',
      tax: 7,
      discount: 10
    },
    deviceInfo: {
      brandId: { name: 'Samsung', _id: 'brand2' },
      modelId: { name: 'Galaxy S23', _id: 'model2' },
      serialNumber: 'R5T2B9M7K1',
      color: 'Phantom Black',
      storage: '512GB',
      condition: 'Excellent - Like new',
      batteryHealth: '78% - Service Recommended'
    },
    images: [
      '/placeholder/service-3.jpg'
    ],
    problemDetails: {
      category: 'Battery Issue',
      subCategory: 'Rapid Drain',
      description: 'Battery drains quickly even with light usage. Phone shuts down at 30% battery remaining.',
      symptoms: ['Fast battery drain', 'Phone dies at 30%', 'Overheating during charging']
    },
    preferredTechnician: null,
    rejectionReason: null,
    timeline: [
      { status: 'Service Requested', date: '2024-01-14T14:20:00Z', note: 'Customer submitted repair request' },
      { status: 'Approved', date: '2024-01-14T16:00:00Z', note: 'Request approved by admin' },
      { status: 'Parts Ordered', date: '2024-01-15T10:00:00Z', note: 'Original battery ordered from Samsung' },
      { status: 'In Progress', date: '2024-01-16T09:15:00Z', note: 'Repair started by technician' }
    ]
  },
  {
    _id: '3',
    title: 'Google Pixel 7 Water Damage Repair',
    description: 'Phone dropped in water, need complete cleaning and repair. Device was submerged for approximately 30 seconds in fresh water.',
    serviceType: 'repair',
    status: 'Completed',
    urgency: 'High',
    customer: 'Mike Johnson',
    customerEmail: 'mike.johnson@example.com',
    customerPhone: '+1 (555) 345-6789',
    brand: 'Google',
    city: 'Chicago',
    address: '789 Pine Street, Chicago, IL 60601',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-13T16:45:00Z',
    scheduledDate: '2024-01-11T10:00:00Z',
    completedDate: '2024-01-13T16:45:00Z',
    pricing: {
      total: 149,
      basePrice: 99,
      partsPrice: 50,
      serviceCharges: 30,
      currency: '$',
      tax: 12,
      discount: 0
    },
    deviceInfo: {
      brandId: { name: 'Google', _id: 'brand3' },
      modelId: { name: 'Pixel 7', _id: 'model3' },
      serialNumber: 'L9X2C4V6B8',
      color: 'Obsidian',
      storage: '128GB',
      condition: 'Poor - Water damage'
    },
    images: [
      '/placeholder/service-4.jpg',
      '/placeholder/service-5.jpg'
    ],
    problemDetails: {
      category: 'Water Damage',
      subCategory: 'Liquid Spill',
      description: 'Phone fell into sink while washing dishes. Device was retrieved immediately but screen started flickering.',
      symptoms: ['Screen flickering', 'Buttons not responding', 'Speaker crackling']
    },
    preferredTechnician: {
      name: 'Sarah Chen',
      id: 'tech456',
      rating: 4.9
    },
    rejectionReason: null,
    timeline: [
      { status: 'Service Requested', date: '2024-01-10T09:00:00Z', note: 'Emergency repair request submitted' },
      { status: 'Approved', date: '2024-01-10T10:30:00Z', note: 'Request approved with priority' },
      { status: 'In Progress', date: '2024-01-11T10:00:00Z', note: 'Device received and initial diagnosis started' },
      { status: 'Completed', date: '2024-01-13T16:45:00Z', note: 'Repair completed successfully. Device fully functional.' }
    ]
  }
];

// ==================== HELPER FUNCTIONS ====================

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'bg-emerald-100 text-emerald-800';
    case 'Pending': return 'bg-amber-100 text-amber-800';
    case 'In Progress': return 'bg-blue-100 text-blue-800';
    case 'Rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getUrgencyColor = (urgency) => {
  switch (urgency) {
    case 'High': return 'bg-red-100 text-red-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    case 'Low': return 'bg-green-100 text-green-800';
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDateOnly = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// ==================== COMPONENTS ====================

const InfoCard = ({ title, icon, children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2">
        <Icon icon={icon} className="w-5 h-5 text-primary-600" />
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const InfoRow = ({ label, value, className = '' }) => (
  <div className={`flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-100 last:border-0 ${className}`}>
    <span className="text-sm text-gray-600 font-medium mb-1 sm:mb-0">{label}</span>
    <span className="text-sm text-gray-900">{value || 'N/A'}</span>
  </div>
);

const TimelineItem = ({ item, isLast }) => (
  <div className="relative pb-8">
    {!isLast && (
      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>
    )}
    <div className="flex gap-4">
      <div className="relative z-10">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <Icon icon="heroicons:check-circle" className="w-4 h-4 text-primary-600" />
        </div>
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{item.status}</p>
        <p className="text-sm text-gray-500 mt-1">{formatDate(item.date)}</p>
        {item.note && <p className="text-sm text-gray-600 mt-2">{item.note}</p>}
      </div>
    </div>
  </div>
);

const ImageGallery = ({ images, title }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:photo" className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gray-100 rounded-lg h-80 mb-4 flex items-center justify-center overflow-hidden">
        <img 
          src={images[selectedImage]} 
          alt={`${title} - Image ${selectedImage + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `
              <div class="text-center">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p class="text-sm text-gray-500">Image ${selectedImage + 1}</p>
              </div>
            `;
          }}
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                selectedImage === idx ? 'border-primary-600' : 'border-gray-200'
              }`}
            >
              <img 
                src={img} 
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== MAIN PAGE ====================

export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    // Simulate API call
    const fetchService = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const serviceId = params?.id;
      const foundService = DUMMY_DATA.find(s => s._id === serviceId);
      
      setService(foundService || null);
      setLoading(false);
    };

    fetchService();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:exclamation-circle" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
          <p className="text-gray-600 mb-6">The service you're looking for doesn't exist or has been removed.</p>
          <Link href="/service-catalog">
            <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Back to Catalog
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'details', label: 'Service Details', icon: 'heroicons:information-circle' },
    { key: 'timeline', label: 'Timeline', icon: 'heroicons:clock' },
    { key: 'customer', label: 'Customer Info', icon: 'heroicons:user' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/service-catalog">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
              <Icon icon="heroicons:arrow-left" className="w-5 h-5" />
              <span>Back to Catalog</span>
            </button>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{service.title}</h1>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(service.urgency)}`}>
                  {service.urgency} Urgency
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {getServiceTypeLabel(service.serviceType)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(service.pricing?.total, service.pricing?.currency)}</p>
              <p className="text-sm text-gray-500">Total Amount</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-white rounded-t-xl px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
                activeTab === tab.key
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon icon={tab.icon} className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Images */}
                  <InfoCard title="Service Images" icon="heroicons:photo">
                    <ImageGallery images={service.images} title={service.title} />
                  </InfoCard>

                  {/* Problem Details */}
                  <InfoCard title="Problem Details" icon="heroicons:exclamation-triangle">
                    <div className="space-y-4">
                      <InfoRow label="Category" value={service.problemDetails?.category} />
                      <InfoRow label="Sub Category" value={service.problemDetails?.subCategory} />
                      <div className="py-3">
                        <span className="text-sm text-gray-600 font-medium block mb-2">Description</span>
                        <p className="text-sm text-gray-900">{service.problemDetails?.description}</p>
                      </div>
                      {service.problemDetails?.symptoms && (
                        <div>
                          <span className="text-sm text-gray-600 font-medium block mb-2">Symptoms</span>
                          <div className="flex flex-wrap gap-2">
                            {service.problemDetails.symptoms.map((symptom, idx) => (
                              <span key={idx} className="px-2 py-1 bg-red-50 text-red-700 rounded-lg text-xs">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </InfoCard>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Pricing Breakdown */}
                  <InfoCard title="Pricing Breakdown" icon="heroicons:currency-dollar">
                    <div className="space-y-3">
                      <InfoRow label="Base Price" value={formatCurrency(service.pricing?.basePrice, service.pricing?.currency)} />
                      <InfoRow label="Parts Cost" value={formatCurrency(service.pricing?.partsPrice, service.pricing?.currency)} />
                      <InfoRow label="Service Charges" value={formatCurrency(service.pricing?.serviceCharges, service.pricing?.currency)} />
                      <InfoRow label="Tax" value={formatCurrency(service.pricing?.tax, service.pricing?.currency)} />
                      {service.pricing?.discount > 0 && (
                        <InfoRow label="Discount" value={`-${formatCurrency(service.pricing?.discount, service.pricing?.currency)}`} />
                      )}
                      <div className="pt-3 border-t border-gray-200">
                        <InfoRow label="Total" value={formatCurrency(service.pricing?.total, service.pricing?.currency)} className="font-bold" />
                      </div>
                    </div>
                  </InfoCard>

                  {/* Device Information */}
                  <InfoCard title="Device Information" icon="heroicons:device-phone-mobile">
                    <InfoRow label="Brand" value={service.deviceInfo?.brandId?.name} />
                    <InfoRow label="Model" value={service.deviceInfo?.modelId?.name} />
                    <InfoRow label="Serial Number" value={service.deviceInfo?.serialNumber} />
                    <InfoRow label="Color" value={service.deviceInfo?.color} />
                    <InfoRow label="Storage" value={service.deviceInfo?.storage} />
                    <InfoRow label="Condition" value={service.deviceInfo?.condition} />
                    {service.deviceInfo?.batteryHealth && (
                      <InfoRow label="Battery Health" value={service.deviceInfo.batteryHealth} />
                    )}
                  </InfoCard>

                  {/* Schedule */}
                  <InfoCard title="Schedule Information" icon="heroicons:calendar">
                    <InfoRow label="Requested Date" value={formatDateOnly(service.createdAt)} />
                    <InfoRow label="Scheduled Date" value={formatDateOnly(service.scheduledDate)} />
                    {service.completedDate && (
                      <InfoRow label="Completed Date" value={formatDateOnly(service.completedDate)} />
                    )}
                    <InfoRow label="Last Updated" value={formatDate(service.updatedAt)} />
                  </InfoCard>

                  {/* Preferred Technician */}
                  {service.preferredTechnician && (
                    <InfoCard title="Preferred Technician" icon="heroicons:user-group">
                      <InfoRow label="Technician Name" value={service.preferredTechnician.name} />
                      <InfoRow label="Rating" value={`⭐ ${service.preferredTechnician.rating}`} />
                    </InfoCard>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Service Timeline</h2>
              <div className="relative">
                {service.timeline?.map((item, idx) => (
                  <TimelineItem 
                    key={idx} 
                    item={item} 
                    isLast={idx === service.timeline.length - 1} 
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'customer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoCard title="Customer Information" icon="heroicons:user">
                <InfoRow label="Full Name" value={service.customer} />
                <InfoRow label="Email Address" value={service.customerEmail} />
                <InfoRow label="Phone Number" value={service.customerPhone} />
              </InfoCard>

              <InfoCard title="Location Details" icon="heroicons:map-pin">
                <InfoRow label="City" value={service.city} />
                <div className="py-3">
                  <span className="text-sm text-gray-600 font-medium block mb-2">Full Address</span>
                  <p className="text-sm text-gray-900">{service.address}</p>
                </div>
              </InfoCard>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3 justify-end">
         
         
          <Link href={`/service-catalog/${service._id}/chat`}>
            <button className="px-6 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
              <Icon icon="heroicons:chat-bubble-left-right" className="w-4 h-4 inline mr-2" />
              Message Customer
            </button>
          </Link>
     
        </div>
      </div>
    </div>
  );
}