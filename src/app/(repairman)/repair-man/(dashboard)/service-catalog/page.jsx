"use client";

import React, { useState } from 'react';
import { Icon } from '@iconify/react';

function ServiceCatalogPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Mock services data
  const servicesData = {
    categories: [
      { id: 'all', name: 'All Services', count: 24, icon: 'heroicons:squares-2x2' },
      { id: 'iphone', name: 'iPhone Repair', count: 8, icon: 'heroicons:device-phone-mobile' },
      { id: 'samsung', name: 'Samsung Repair', count: 6, icon: 'heroicons:device-phone-mobile' },
      { id: 'android', name: 'Android Repair', count: 5, icon: 'heroicons:device-phone-mobile' },
      { id: 'tablet', name: 'Tablet Repair', count: 3, icon: 'heroicons:device-tablet' },
      { id: 'software', name: 'Software Services', count: 2, icon: 'heroicons:code-bracket' }
    ],
    services: [
      // iPhone Services
      {
        id: 1,
        title: 'iPhone Screen Replacement',
        category: 'iphone',
        description: 'Professional iPhone screen replacement with original quality displays. Includes cleaning, calibration, and testing.',
        basePrice: 8000,
        maxPrice: 18000,
        duration: '30-60 minutes',
        warranty: '6 months',
        difficulty: 'Medium',
        tools: ['Pentalobe Screwdriver', 'Suction Cup', 'Heat Gun', 'Spudger Tools'],
        models: ['iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 14 Pro', 'iPhone 15'],
        image: 'iphone-screen.jpg',
        popular: true,
        rating: 4.9,
        completedJobs: 89,
        features: ['Original Quality Display', 'Touch ID/Face ID Preserved', 'Water Resistance Maintained']
      },
      {
        id: 2,
        title: 'iPhone Battery Replacement',
        category: 'iphone',
        description: 'Replace aging iPhone batteries to restore optimal performance and battery life. Genuine battery parts used.',
        basePrice: 4000,
        maxPrice: 8000,
        duration: '20-45 minutes',
        warranty: '1 year',
        difficulty: 'Easy',
        tools: ['Pentalobe Screwdriver', 'Y000 Screwdriver', 'Plastic Tools'],
        models: ['iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15'],
        image: 'iphone-battery.jpg',
        popular: true,
        rating: 4.8,
        completedJobs: 67,
        features: ['100% Battery Health', 'Extended Battery Life', 'Performance Boost']
      },
      {
        id: 3,
        title: 'iPhone Water Damage Recovery',
        category: 'iphone',
        description: 'Complete water damage assessment and restoration service. Component-level cleaning and repair.',
        basePrice: 5000,
        maxPrice: 15000,
        duration: '2-24 hours',
        warranty: '3 months',
        difficulty: 'Hard',
        tools: ['Ultrasonic Cleaner', 'Isopropyl Alcohol', 'Heat Station', 'Microscope'],
        models: ['iPhone X', 'iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14'],
        image: 'water-damage.jpg',
        popular: false,
        rating: 4.7,
        completedJobs: 34,
        features: ['Component Cleaning', 'Corrosion Removal', 'Function Testing']
      },
      {
        id: 4,
        title: 'iPhone Charging Port Repair',
        category: 'iphone',
        description: 'Fix charging port issues, loose connections, and charging problems. Lightning connector replacement.',
        basePrice: 3000,
        maxPrice: 6000,
        duration: '45-90 minutes',
        warranty: '6 months',
        difficulty: 'Medium',
        tools: ['Micro Soldering Station', 'Flux', 'Replacement Connectors'],
        models: ['iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14'],
        image: 'charging-port.jpg',
        popular: false,
        rating: 4.6,
        completedJobs: 28,
        features: ['Fast Charging Support', 'Data Transfer Fix', 'Secure Connection']
      },

      // Samsung Services
      {
        id: 5,
        title: 'Samsung Galaxy Screen Replacement',
        category: 'samsung',
        description: 'Professional Samsung Galaxy screen replacement with OLED/AMOLED displays. Perfect color reproduction.',
        basePrice: 6000,
        maxPrice: 16000,
        duration: '45-75 minutes',
        warranty: '6 months',
        difficulty: 'Medium',
        tools: ['Heat Gun', 'Suction Cup', 'Plastic Prying Tools', 'UV Adhesive'],
        models: ['Galaxy S21', 'Galaxy S22', 'Galaxy S23', 'Galaxy Note 20', 'Galaxy A54'],
        image: 'samsung-screen.jpg',
        popular: true,
        rating: 4.8,
        completedJobs: 45,
        features: ['AMOLED Display', 'Perfect Touch Response', 'Original Colors']
      },
      {
        id: 6,
        title: 'Samsung Battery Replacement',
        category: 'samsung',
        description: 'Replace Samsung Galaxy batteries to restore full-day battery life. High-quality replacement batteries.',
        basePrice: 3500,
        maxPrice: 7000,
        duration: '30-60 minutes',
        warranty: '1 year',
        difficulty: 'Medium',
        tools: ['Heat Gun', 'Plastic Tools', 'Adhesive Strips'],
        models: ['Galaxy S20', 'Galaxy S21', 'Galaxy S22', 'Galaxy S23', 'Galaxy Note 20'],
        image: 'samsung-battery.jpg',
        popular: true,
        rating: 4.7,
        completedJobs: 38,
        features: ['Long-lasting Battery', 'Fast Charging Support', 'Safety Certified']
      },

      // Android Services
      {
        id: 7,
        title: 'Android Phone Screen Repair',
        category: 'android',
        description: 'Screen replacement service for various Android brands including Xiaomi, OnePlus, Oppo, and Vivo.',
        basePrice: 4000,
        maxPrice: 12000,
        duration: '30-90 minutes',
        warranty: '6 months',
        difficulty: 'Medium',
        tools: ['Universal Tools', 'Heat Station', 'Adhesive'],
        models: ['Xiaomi', 'OnePlus', 'Oppo', 'Vivo', 'Realme'],
        image: 'android-screen.jpg',
        popular: false,
        rating: 4.5,
        completedJobs: 31,
        features: ['Brand Compatibility', 'Color Matching', 'Touch Calibration']
      },
      {
        id: 8,
        title: 'Android Software Troubleshooting',
        category: 'software',
        description: 'Fix software issues, bootloops, system crashes, and performance problems on Android devices.',
        basePrice: 2000,
        maxPrice: 5000,
        duration: '1-3 hours',
        warranty: '1 month',
        difficulty: 'Easy',
        tools: ['Computer', 'USB Cables', 'Flashing Tools'],
        models: ['All Android Brands'],
        image: 'software-repair.jpg',
        popular: false,
        rating: 4.4,
        completedJobs: 22,
        features: ['System Restore', 'Data Preservation', 'Performance Optimization']
      },

      // Tablet Services
      {
        id: 9,
        title: 'iPad Screen Replacement',
        category: 'tablet',
        description: 'Professional iPad screen replacement with high-quality LCD/Retina displays. Precision work required.',
        basePrice: 12000,
        maxPrice: 25000,
        duration: '1-2 hours',
        warranty: '6 months',
        difficulty: 'Hard',
        tools: ['Heat Station', 'Suction Cups', 'Plastic Tools', 'Adhesive Strips'],
        models: ['iPad Air', 'iPad Pro', 'iPad Mini', 'iPad 9th Gen'],
        image: 'ipad-screen.jpg',
        popular: false,
        rating: 4.6,
        completedJobs: 15,
        features: ['Retina Display', 'Multi-touch Support', 'Apple Pencil Compatible']
      },
      {
        id: 10,
        title: 'Samsung Tablet Screen Repair',
        category: 'tablet',
        description: 'Screen replacement for Samsung Galaxy Tab series with OLED and LCD display options.',
        basePrice: 8000,
        maxPrice: 18000,
        duration: '1-2 hours',
        warranty: '6 months',
        difficulty: 'Hard',
        tools: ['Heat Station', 'Prying Tools', 'UV Adhesive'],
        models: ['Galaxy Tab S7', 'Galaxy Tab S8', 'Galaxy Tab A7', 'Galaxy Tab A8'],
        image: 'samsung-tablet.jpg',
        popular: false,
        rating: 4.5,
        completedJobs: 12,
        features: ['Super AMOLED', 'S-Pen Support', 'High Resolution']
      }
    ]
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilteredServices = () => {
    if (activeCategory === 'all') {
      return servicesData.services;
    }
    return servicesData.services.filter(service => service.category === activeCategory);
  };

  const ServiceCard = ({ service, isListView = false }) => (
    <div className={`bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow ${
      isListView ? 'p-6' : 'overflow-hidden'
    }`}>
      {!isListView && (
        <div className="relative">
          <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
            <Icon icon="heroicons:wrench-screwdriver" className="w-16 h-16 text-primary-600" />
          </div>
          {service.popular && (
            <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Popular
            </span>
          )}
        </div>
      )}

      <div className={isListView ? '' : 'p-6'}>
        <div className={`flex ${isListView ? 'items-start space-x-6' : 'flex-col'}`}>
          {isListView && (
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon icon="heroicons:wrench-screwdriver" className="w-8 h-8 text-primary-600" />
            </div>
          )}

          <div className="flex-1">
            <div className={`flex ${isListView ? 'justify-between items-start' : 'flex-col'} mb-3`}>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>
              </div>

              {isListView && (
                <div className="text-right ml-6">
                  <p className="text-xl font-bold text-gray-900">
                    ${service.basePrice.toLocaleString()} - ${service.maxPrice.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">{service.duration}</p>
                </div>
              )}
            </div>

            {!isListView && (
              <div className="mb-4">
                <p className="text-xl font-bold text-gray-900 mb-1">
                  ${service.basePrice.toLocaleString()} - ${service.maxPrice.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Duration: {service.duration}</p>
              </div>
            )}

            {/* Service Stats */}
            <div className="flex items-center space-x-4 mb-4 text-sm">
              <div className="flex items-center">
                <Icon icon="heroicons:star" className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="font-medium">{service.rating}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Icon icon="heroicons:check-circle" className="w-4 h-4 mr-1" />
                <span>{service.completedJobs} completed</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(service.difficulty)}`}>
                {service.difficulty}
              </span>
            </div>

            {/* Features */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Key Features:</p>
              <div className="flex flex-wrap gap-1">
                {service.features.slice(0, 3).map((feature, index) => (
                  <span key={index} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Warranty & Tools */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="text-gray-600">Warranty:</p>
                <p className="font-medium">{service.warranty}</p>
              </div>
              <div>
                <p className="text-gray-600">Models:</p>
                <p className="font-medium">{service.models.length}+ devices</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm">
                View Details
              </button>
              <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Edit Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ServiceStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 bg-primary-100 rounded-lg">
            <Icon icon="heroicons:squares-2x2" className="w-6 h-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">{servicesData.services.length}</p>
            <p className="text-sm text-gray-600">Total Services</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg">
            <Icon icon="heroicons:star" className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">4.7</p>
            <p className="text-sm text-gray-600">Avg Rating</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <Icon icon="heroicons:fire" className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">{servicesData.services.filter(s => s.popular).length}</p>
            <p className="text-sm text-gray-600">Popular Services</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Icon icon="heroicons:check-circle" className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">{servicesData.services.reduce((total, service) => total + service.completedJobs, 0)}</p>
            <p className="text-sm text-gray-600">Jobs Completed</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Catalog</h1>
              <p className="text-gray-600">Manage your repair services and pricing</p>
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
              <Icon icon="heroicons:plus" className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <ServiceStats />

        {/* Filters and View Controls */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div className="flex space-x-1">
              {servicesData.categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                    activeCategory === category.id
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon icon={category.icon} className="w-4 h-4" />
                  <span>{category.name}</span>
                  <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                >
                  <Icon icon="heroicons:squares-2x2" className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                >
                  <Icon icon="heroicons:list-bullet" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid/List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {getFilteredServices().map(service => (
            <ServiceCard key={service.id} service={service} isListView={viewMode === 'list'} />
          ))}
        </div>

        {getFilteredServices().length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="heroicons:wrench-screwdriver" className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-4">No services match the selected category.</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Add New Service
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceCatalogPage;