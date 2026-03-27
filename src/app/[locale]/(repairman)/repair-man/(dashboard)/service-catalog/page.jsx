"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import Link from 'next/link';

const ServiceCatalogPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const { token } = useSelector((state) => state.auth);

  // Fetch all services
  const fetchAllServices = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/repairman/services", {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });

      if (data.success) {
        setAllServices(data.data || []);
        setPagination(data.pagination || {});
        setError(null);
      } else {
        setError('Failed to load services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services. Please try again.');
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllServices();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceTypeIcon = (type) => {
    switch (type) {
      case 'home': return 'heroicons:home';
      case 'shop': return 'heroicons:building-storefront';
      case 'pickup': return 'heroicons:truck';
      default: return 'heroicons:wrench-screwdriver';
    }
  };

  const getServiceTypeLabel = (type) => {
    switch (type) {
      case 'home': return 'Home Service';
      case 'shop': return 'Shop Service';
      case 'pickup': return 'Pickup & Delivery';
      default: return type;
    }
  };

  const formatCurrency = (amount, currency = 'TRY') => {
    return `${currency} ${amount?.toLocaleString() || 0}`;
  };

  // Categorize services by service type
  const categorizedServices = useMemo(() => {
    const all = allServices;
    const home = allServices.filter(s => s.serviceType === 'home');
    const shop = allServices.filter(s => s.serviceType === 'shop');
    const pickup = allServices.filter(s => s.serviceType === 'pickup');

    return { all, home, shop, pickup };
  }, [allServices]);

  // Filter services
  const filteredServices = useMemo(() => {
    const servicesToFilter = categorizedServices[activeTab] || [];
    return servicesToFilter.filter((service) => {
      const matchesSearch =
        service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.deviceInfo?.modelId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.deviceInfo?.brandId?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || 
        service.status?.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [activeTab, searchQuery, statusFilter, categorizedServices]);

  const ServiceCard = ({ service }) => {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 transition-all duration-300 ease-in-out hover:shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <div className="flex items-start space-x-4 w-full">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon icon={getServiceTypeIcon(service.serviceType)} className="w-6 h-6 text-primary-700" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-xl text-gray-900">
                  {service.title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{service.description}</p>
              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 space-y-2 sm:space-y-0 sm:space-x-4">
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
                  <Icon icon="heroicons:device-phone-mobile" className="w-4 h-4 mr-1" />
                  {service.deviceInfo?.brandId?.name} {service.deviceInfo?.modelId?.name}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right w-full sm:w-auto">
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
        <div className="mb-4 flex items-center space-x-4 text-xs text-gray-500">
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
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
          <Link href={`/repair-man/service-catalog/${service._id}/edit`} className="flex-1">
            <button 
              disabled={service.status === 'approved'}
              className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Icon icon="heroicons:pencil" className="w-4 h-4 mr-2 inline" />
              Edit Service
            </button>
          </Link>
          <Link href={`/repair-man/service-catalog/${service._id}/view`} className="flex-1">
            <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              <Icon icon="heroicons:eye" className="w-4 h-4 mr-2 inline" />
              View Details
            </button>
          </Link>
          <button 
            disabled={service.status === 'approved'}
            className="flex-1 border border-red-300 text-red-700 py-2 px-4 rounded-lg hover:bg-red-50 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <Icon icon="heroicons:trash" className="w-4 h-4 mr-2 inline" />
            Delete
          </button>
        </div>
      </div>
    );
  };

  const ServiceCardGrid = ({ service }) => {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:shadow-md">
        <div className="relative">
          <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <Icon icon={getServiceTypeIcon(service.serviceType)} className="w-16 h-16 text-primary-600" />
          </div>
          <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
            {service.status}
          </span>
        </div>

        <div className="p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-2">{service.title}</h3>
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

          <div className="mb-4 space-y-2 text-sm">
            <div className="flex items-center text-gray-600">
              <Icon icon={getServiceTypeIcon(service.serviceType)} className="w-4 h-4 mr-2" />
              <span>{getServiceTypeLabel(service.serviceType)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Icon icon="heroicons:device-phone-mobile" className="w-4 h-4 mr-2" />
              <span className="truncate">{service.deviceInfo?.brandId?.name} {service.deviceInfo?.modelId?.name}</span>
            </div>
            {service.city && (
              <div className="flex items-center text-gray-600">
                <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-2" />
                <span>{service.city}</span>
              </div>
            )}
          </div>

          {service.status === 'rejected' && service.rejectionReason && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {service.rejectionReason}
            </div>
          )}

          <div className="flex space-x-2">
            <Link href={`/repair-man/service-catalog/${service._id}/edit`} className="flex-1">
              <button 
                disabled={service.status === 'approved'}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                Edit
              </button>
            </Link>
            <Link href={`/repair-man/service-catalog/${service._id}/view`} className="flex-1">
              <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm">
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
      <Link href="/repair-man/service-catalog/add">
        <button className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
          <Icon icon="heroicons:plus" className="w-4 h-4 mr-2 inline" />
          Add New Service
        </button>
      </Link>
    </div>
  );

  const getTabCounts = () => ({
    all: categorizedServices.all?.length || 0,
    // home: categorizedServices.home?.length || 0,
    // shop: categorizedServices.shop?.length || 0,
    // pickup: categorizedServices.pickup?.length || 0,
  });

  const tabCounts = getTabCounts();

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:arrow-path" className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="heroicons:exclamation-triangle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Services</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchAllServices()}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Service Catalog</h1>
              <p className="text-gray-600 text-lg">
                Manage your repair services and pricing
                {/* {pagination.total > 0 && (
                  <span className="ml-2 text-primary-600 font-semibold">
                    ({pagination.total} {pagination.total === 1 ? 'service' : 'services'})
                  </span>
                )} */}
              </p>
            </div>
            <Link href="/repair-man/service-catalog/add">
              <button className="bg-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 flex items-center space-x-2 shadow-lg">
                <Icon icon="heroicons:plus" className="w-5 h-5" />
                <span>Add New Service</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search by title, description, brand, or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm shadow-sm"
            />
            <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <Icon icon="heroicons:x-mark" className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm shadow-sm w-full sm:w-auto"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={handleClearFilters}
              className="px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
            >
              Clear
            </button>
            <button
              onClick={() => fetchAllServices()}
              className="px-4 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
            >
              <Icon icon="heroicons:arrow-path" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200">
            <div className="flex justify-between items-center px-4 sm:px-6">
              <nav className="flex space-x-2 sm:space-x-8 -mb-px overflow-x-auto">
                {[
                  { id: 'all', label: 'All Services', count: tabCounts.all },
                  // { id: 'home', label: 'Home Service', count: tabCounts.home },
                  // { id: 'shop', label: 'Shop Service', count: tabCounts.shop },
                  // { id: 'pickup', label: 'Pickup & Delivery', count: tabCounts.pickup },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 sm:px-4 text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs font-medium">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
              <div className="flex items-center space-x-2 py-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Icon icon="heroicons:squares-2x2" className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Icon icon="heroicons:list-bullet" className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {filteredServices.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((service) => (
                    <ServiceCardGrid key={service._id} service={service} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredServices.map((service) => (
                    <ServiceCard key={service._id} service={service} />
                  ))}
                </div>
              )
            ) : (
              <EmptyState type={activeTab} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCatalogPage;