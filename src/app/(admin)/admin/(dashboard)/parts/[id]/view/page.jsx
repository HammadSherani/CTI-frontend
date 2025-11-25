"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import Link from 'next/link';

function ViewPart() {
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const partId = params.id;
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (partId) {
      fetchPartData();
    }
  }, [partId]);

  const fetchPartData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/admin/parts/${partId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPart(response.data.data);
    } catch (error) {
      console.error('Error fetching part:', error);
      toast.error('Failed to load part data');
      router.push('/admin/parts/stock-management');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(`/admin/parts/${partId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message || 'Part deleted successfully!');
      router.push('/admin/parts/stock-management');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete part');
    }
  };

  const getStockBadge = () => {
    if (!part) return null;
    
    if (part.stock === 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />
          Out of Stock
        </span>
      );
    } else if (part.stock <= part.lowStockAlert) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <Icon icon="mdi:alert" className="w-4 h-4 mr-1" />
          Low Stock ({part.stock} units)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <Icon icon="mdi:check-circle" className="w-4 h-4 mr-1" />
          In Stock ({part.stock} units)
        </span>
      );
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateFinalPrice = () => {
    if (!part) return 0;
    if (part.discount > 0) {
      return part.price - (part.price * part.discount / 100);
    }
    return part.price;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Icon icon="mdi:loading" className="w-12 h-12 text-primary-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading part details...</p>
        </div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="mdi:package-variant-closed" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Part Not Found</h2>
          <p className="text-gray-600 mb-4">The part you're looking for doesn't exist.</p>
          <Link
            href="/admin/parts/stock-management"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5 mr-2" />
            Back to Parts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/parts/stock-management"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Back to parts"
              >
                <Icon icon="mdi:arrow-left" className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{part.name}</h1>
                <p className="text-gray-600 mt-1">Part Details and Information</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/admin/parts/${partId}/edit`}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Icon icon="mdi:pencil" className="w-5 h-5 mr-2" />
                Edit Part
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Icon icon="mdi:trash-can" className="w-5 h-5 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images and Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
              
              {part.images && part.images.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                    <img
                      src={part.images[selectedImage]}
                      alt={part.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Thumbnails */}
                  {part.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {part.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === index
                              ? 'border-primary-600 ring-2 ring-primary-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${part.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Icon icon="mdi:image-off" className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No images available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    part.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <Icon icon={part.isActive ? 'mdi:eye' : 'mdi:eye-off'} className="w-3 h-3 mr-1" />
                    {part.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Featured</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    part.isFeatured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    <Icon icon={part.isFeatured ? 'mdi:star' : 'mdi:star-outline'} className="w-3 h-3 mr-1" />
                    {part.isFeatured ? 'Featured' : 'Regular'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Condition</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {part.condition || 'New'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Stock Status</span>
                  {getStockBadge()}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon="mdi:information" className="w-6 h-6 text-primary-600" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Part Name</label>
                  <p className="text-gray-900 font-medium">{part.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">SKU</label>
                  <p className="text-gray-900 font-medium">{part.sku || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Brand</label>
                  <div className="flex items-center gap-2">
                    {part.brand?.logo && (
                      <img src={part.brand.logo} alt={part.brand.name} className="w-6 h-6 object-contain" />
                    )}
                    <p className="text-gray-900 font-medium">{part.brand?.name || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Model</label>
                  <p className="text-gray-900 font-medium">{part.model?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                  <p className="text-gray-900 font-medium">{part.category?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Part Type</label>
                  <p className="text-gray-900 font-medium">{part.partType || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Color</label>
                  <p className="text-gray-900 font-medium">{part.color || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Warranty</label>
                  <p className="text-gray-900 font-medium">{part.warranty || 'N/A'}</p>
                </div>
              </div>

              {/* Compatible Models */}
              {part.compatibility && part.compatibility.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-500 mb-3">Compatible Models</label>
                  <div className="flex flex-wrap gap-2">
                    {part.compatibility.map((model, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {model.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon="mdi:currency-usd" className="w-6 h-6 text-primary-600" />
                Pricing Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Price</label>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(part.price)}</p>
                </div>
                {part.repairmanPrice && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Repairman Price</label>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(part.repairmanPrice)}</p>
                  </div>
                )}
                {part.costPrice && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Cost Price</label>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(part.costPrice)}</p>
                  </div>
                )}
                {part.discount > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      Final Price ({part.discount}% off)
                    </label>
                    <p className="text-2xl font-bold text-green-700">{formatPrice(calculateFinalPrice())}</p>
                  </div>
                )}
              </div>

              {/* Profit Margin */}
              {part.costPrice && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Profit Margin</span>
                    <span className="text-lg font-bold text-blue-900">
                      {formatPrice(calculateFinalPrice() - part.costPrice)} 
                      <span className="text-sm font-normal ml-2">
                        ({(((calculateFinalPrice() - part.costPrice) / part.costPrice) * 100).toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Inventory Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon="mdi:package-variant" className="w-6 h-6 text-primary-600" />
                Inventory Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Current Stock</label>
                  <p className="text-3xl font-bold text-gray-900">{part.stock || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">units available</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Low Stock Alert</label>
                  <p className="text-3xl font-bold text-gray-900">{part.lowStockAlert || 5}</p>
                  <p className="text-xs text-gray-500 mt-1">minimum threshold</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Stock Value</label>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatPrice((part.costPrice || part.price) * part.stock)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">total inventory value</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {part.description && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon icon="mdi:text-box" className="w-6 h-6 text-primary-600" />
                  Description
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{part.description}</p>
              </div>
            )}

            {/* Installation Notes */}
            {part.installationNotes && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon icon="mdi:tools" className="w-6 h-6 text-primary-600" />
                  Installation Notes
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-900 whitespace-pre-wrap leading-relaxed">{part.installationNotes}</p>
                </div>
              </div>
            )}

            {/* Return Policy */}
            {part.returnPolicy && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon icon="mdi:undo-variant" className="w-6 h-6 text-primary-600" />
                  Return Policy
                </h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-900 whitespace-pre-wrap leading-relaxed">{part.returnPolicy}</p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon="mdi:clock-outline" className="w-6 h-6 text-primary-600" />
                Timeline
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Created At</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(part.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(part.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Icon icon="mdi:alert" className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Part</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">{part.name}</span>? 
              This will permanently remove the part from your inventory.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Part
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewPart;