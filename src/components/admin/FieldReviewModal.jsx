"use client";

import { Icon } from '@iconify/react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';
import Image from 'next/image';

export default function FieldReviewModal({ isOpen, onClose, repairmanId, currentData, onSubmit }) {
  const [selectedFields, setSelectedFields] = useState([]);
  const [fieldIssues, setFieldIssues] = useState({});
  const [overallComment, setOverallComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const { token } = useSelector(state => state.auth);

  // Helper function to get nested value from object
  const getNestedValue = (obj, path) => {
    if (!obj) return null;
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  };

  // Format display value with images
  const formatDisplayValue = (value, fieldType, fieldName) => {
    if (value === null || value === undefined || value === '') return 'Not provided';
    
    // Handle documents with images
    if (fieldType === 'file' && typeof value === 'string' && value.startsWith('http')) {
      return (
        <div className="relative group">
          <div 
            className="w-16 h-16 rounded-lg border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-orange-500 transition-all"
            onClick={() => setExpandedImage(value)}
          >
            <img 
              src={value} 
              alt={fieldName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/64?text=No+Image';
              }}
            />
          </div>
          <button
            onClick={() => setExpandedImage(value)}
            className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Icon icon="mdi:fullscreen" className="w-3 h-3" />
          </button>
        </div>
      );
    }
    
    // Handle multiple files (certifications)
    if (fieldType === 'files' && Array.isArray(value)) {
      const validFiles = value.filter(f => f && typeof f === 'string' && f.startsWith('http'));
      if (validFiles.length === 0) return 'No files uploaded';
      
      return (
        <div className="flex flex-wrap gap-2">
          {validFiles.slice(0, 3).map((file, index) => (
            <div key={index} className="relative group">
              <div 
                className="w-12 h-12 rounded-lg border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-orange-500 transition-all"
                onClick={() => setExpandedImage(file)}
              >
                <img 
                  src={file} 
                  alt={`Cert ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/48?text=PDF';
                  }}
                />
              </div>
            </div>
          ))}
          {validFiles.length > 3 && (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
              +{validFiles.length - 3}
            </div>
          )}
        </div>
      );
    }
    
    // Handle brands with icons
    if (fieldName === 'brandsWorkedWith' && Array.isArray(value)) {
      if (value.length === 0) return 'No brands selected';
      
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((brand, index) => (
            <div key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
              {brand.icon && (
                <img 
                  src={brand.icon} 
                  alt={brand.name}
                  className="w-4 h-4 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <span className="text-xs font-medium">{brand.name}</span>
            </div>
          ))}
        </div>
      );
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return 'Not provided';
      
      // Array of objects (like brands)
      if (value.length > 0 && typeof value[0] === 'object') {
        return value.map(item => item.name || item.label).join(', ');
      }
      
      return value.join(', ');
    }
    
    // Handle objects (country, state, city)
    if (typeof value === 'object') {
      if (value.name) return value.name;
      if (value.label) return value.label;
      return 'Invalid data';
    }
    
    // Handle boolean
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    // Handle dates
    if (fieldType === 'date' && value) {
      return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    return String(value);
  };

  // All fields with proper paths
  const fieldCategories = {
    'Personal Information': [
      { name: 'fullName', label: 'Full Name', path: 'repairmanProfile.fullName', type: 'text', icon: 'mdi:account' },
      { name: 'fatherName', label: 'Father\'s Name', path: 'repairmanProfile.fatherName', type: 'text', icon: 'mdi:account-family' },
      { name: 'nationalIdOrCitizenNumber', label: 'National ID', path: 'repairmanProfile.nationalIdOrCitizenNumber', type: 'text', icon: 'mdi:card-account-details' },
      { name: 'dob', label: 'Date of Birth', path: 'repairmanProfile.dob', type: 'date', icon: 'mdi:cake' },
      { name: 'gender', label: 'Gender', path: 'repairmanProfile.gender', type: 'select', icon: 'mdi:gender-male-female' }
    ],
    'Contact Information': [
      { name: 'mobileNumber', label: 'Mobile Number', path: 'repairmanProfile.mobileNumber', type: 'text', icon: 'mdi:phone' },
      { name: 'whatsappNumber', label: 'WhatsApp Number', path: 'repairmanProfile.whatsappNumber', type: 'text', icon: 'mdi:whatsapp' },
      { name: 'emailAddress', label: 'Email Address', path: 'repairmanProfile.emailAddress', type: 'email', icon: 'mdi:email' },
      { name: 'emergencyContactPerson', label: 'Emergency Contact', path: 'repairmanProfile.emergencyContactPerson', type: 'text', icon: 'mdi:account-alert' },
      { name: 'emergencyContactNumber', label: 'Emergency Number', path: 'repairmanProfile.emergencyContactNumber', type: 'text', icon: 'mdi:phone-alert' }
    ],
    'Shop Information': [
      { name: 'shopName', label: 'Shop Name', path: 'repairmanProfile.shopName', type: 'text', icon: 'mdi:store' },
      { name: 'fullAddress', label: 'Full Address', path: 'repairmanProfile.fullAddress', type: 'textarea', icon: 'mdi:map-marker' },
      { name: 'country', label: 'Country', path: 'repairmanProfile.country', type: 'object', icon: 'mdi:map' },
      { name: 'state', label: 'State', path: 'repairmanProfile.state', type: 'object', icon: 'mdi:map-marker-radius' },
      { name: 'city', label: 'City', path: 'repairmanProfile.city', type: 'object', icon: 'mdi:city' },
      { name: 'zipCode', label: 'Zip Code', path: 'repairmanProfile.zipCode', type: 'text', icon: 'mdi:mailbox' },
      { name: 'taxNumber', label: 'Tax Number', path: 'repairmanProfile.taxNumber', type: 'text', icon: 'mdi:file-document' }
    ],
    'Professional Details': [
      { name: 'yearsOfExperience', label: 'Experience', path: 'repairmanProfile.yearsOfExperience', type: 'number', icon: 'mdi:briefcase' },
      { name: 'specializations', label: 'Specializations', path: 'repairmanProfile.specializations', type: 'array', icon: 'mdi:wrench' },
      { name: 'brandsWorkedWith', label: 'Brands', path: 'repairmanProfile.brandsWorkedWith', type: 'brands', icon: 'mdi:star' },
      { name: 'description', label: 'Description', path: 'repairmanProfile.description', type: 'textarea', icon: 'mdi:text' }
    ],
    'Working Schedule': [
      { name: 'workingDays', label: 'Working Days', path: 'repairmanProfile.workingDays', type: 'array', icon: 'mdi:calendar' },
      { name: 'workingHours.start', label: 'Start Time', path: 'repairmanProfile.workingHours.start', type: 'time', icon: 'mdi:clock-start' },
      { name: 'workingHours.end', label: 'End Time', path: 'repairmanProfile.workingHours.end', type: 'time', icon: 'mdi:clock-end' },
      { name: 'pickupService', label: 'Pickup Service', path: 'repairmanProfile.pickupService', type: 'boolean', icon: 'mdi:truck' }
    ],
    'Documents': [
      { name: 'profilePhoto', label: 'Profile Photo', path: 'repairmanProfile.profilePhoto', type: 'file', icon: 'mdi:camera' },
      { name: 'nationalIdOrPassportScan', label: 'ID/Passport', path: 'repairmanProfile.nationalIdOrPassportScan', type: 'file', icon: 'mdi:passport' },
      { name: 'shopPhoto', label: 'Shop Photo', path: 'repairmanProfile.shopPhoto', type: 'file', icon: 'mdi:store-image' },
      { name: 'utilityBillOrShopProof', label: 'Utility Bill', path: 'repairmanProfile.utilityBillOrShopProof', type: 'file', icon: 'mdi:file-document' },
      { name: 'certifications', label: 'Certifications', path: 'repairmanProfile.certifications', type: 'files', icon: 'mdi:certificate' }
    ]
  };

  const handleFieldSelect = (fieldName) => {
    setSelectedFields(prev => {
      if (prev.includes(fieldName)) {
        return prev.filter(f => f !== fieldName);
      } else {
        return [...prev, fieldName];
      }
    });
  };

  const handleIssueChange = (fieldName, value) => {
    setFieldIssues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async () => {
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field to review');
      return;
    }

    const missingIssues = selectedFields.filter(field => !fieldIssues[field]?.trim());
    if (missingIssues.length > 0) {
      toast.error('Please provide issue description for all selected fields');
      return;
    }

    const reviewData = {
      fields: selectedFields.map(field => ({
        fieldName: field,
        issue: fieldIssues[field],
        suggestion: ''
      })),
      overallComment: overallComment.trim() || undefined
    };

    setSubmitting(true);
    try {
      const response = await axiosInstance.post(
        `admin/repairman/${repairmanId}/field-review`,
        reviewData,
        { headers: { 'Authorization': 'Bearer ' + token } }
      );

      onSubmit?.(response.data);
      onClose();
      setSelectedFields([]);
      setFieldIssues({});
      setOverallComment('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Icon icon="mdi:clipboard-check" className="w-8 h-8 text-orange-500" />
                  Field Review
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Select fields that need correction and describe the issues
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <Icon icon="mdi:close" className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Selected Fields</span>
                <span className="font-medium text-orange-600">{selectedFields.length} / 27</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(selectedFields.length / 27) * 100}%` }}
                />
              </div>
            </div>

            {/* Field Categories */}
            <div className="space-y-6">
              {Object.entries(fieldCategories).map(([category, fields]) => (
                <div key={category} className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-lg">
                    <Icon icon={
                      category === 'Personal Information' ? 'mdi:account-group' :
                      category === 'Contact Information' ? 'mdi:phone-in-talk' :
                      category === 'Shop Information' ? 'mdi:storefront' :
                      category === 'Professional Details' ? 'mdi:tools' :
                      category === 'Working Schedule' ? 'mdi:calendar-clock' :
                      'mdi:file-multiple'
                    } className="w-6 h-6 text-orange-500" />
                    {category}
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full ml-2">
                      {fields.length} fields
                    </span>
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {fields.map(field => {
                      const currentValue = getNestedValue(currentData, field.path);
                      const isSelected = selectedFields.includes(field.name);
                      const displayValue = formatDisplayValue(currentValue, field.type, field.name);

                      return (
                        <div 
                          key={field.name} 
                          className={`bg-white rounded-lg p-4 border-2 transition-all ${
                            isSelected 
                              ? 'border-orange-500 shadow-lg ring-2 ring-orange-200' 
                              : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleFieldSelect(field.name)}
                              className="mt-1 w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Icon icon={field.icon} className="w-5 h-5 text-orange-500" />
                                <label className="font-semibold text-gray-800">
                                  {field.label}
                                </label>
                                {isSelected && (
                                  <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                                    Selected
                                  </span>
                                )}
                              </div>
                              
                              {/* Current Value Display */}
                              <div className="mt-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Current Value</span>
                                <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[60px]">
                                  {typeof displayValue === 'string' ? (
                                    <p className="text-gray-900 font-medium break-words">{displayValue}</p>
                                  ) : (
                                    displayValue
                                  )}
                                </div>
                              </div>

                              {/* Issue Input */}
                              {isSelected && (
                                <div className="mt-3">
                                  <span className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
                                    Issue Description <span className="text-red-500">*</span>
                                  </span>
                                  <textarea
                                    placeholder={`What's wrong with ${field.label}?`}
                                    value={fieldIssues[field.name] || ''}
                                    onChange={(e) => handleIssueChange(field.name, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    rows={2}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Overall Comment */}
              <div className="bg-gradient-to-r from-orange-50 to-white rounded-lg p-4 border border-orange-200">
                <label className="block font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Icon icon="mdi:comment-text" className="w-5 h-5 text-orange-500" />
                  Overall Comment
                  <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={overallComment}
                  onChange={(e) => setOverallComment(e.target.value)}
                  placeholder="Add any general comments about the application..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Selected Fields Summary */}
              {selectedFields.length > 0 && (
                <div className="bg-orange-500 text-white rounded-lg p-4 sticky bottom-16 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="mdi:check-circle" className="w-5 h-5" />
                    <span className="font-medium">
                      {selectedFields.length} field(s) selected for review
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {selectedFields.map(field => {
                      const fieldInfo = Object.values(fieldCategories)
                        .flat()
                        .find(f => f.name === field);
                      return (
                        <span key={field} className="px-3 py-1 bg-white/20 rounded-full text-sm flex items-center gap-1">
                          <Icon icon={fieldInfo?.icon || 'mdi:alert'} className="w-4 h-4" />
                          {fieldInfo?.label || field}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t sticky bottom-0 bg-white">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
              >
                <Icon icon="mdi:close" className="w-5 h-5" />
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || selectedFields.length === 0}
                className="px-8 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 flex items-center gap-2 font-medium shadow-lg"
              >
                {submitting ? (
                  <>
                    <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:send" className="w-5 h-5" />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {expandedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setExpandedImage(null)} />
          <div className="relative z-10 max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <Icon icon="mdi:close" className="w-8 h-8" />
            </button>
            <img 
              src={expandedImage} 
              alt="Preview"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/800?text=Image+Not+Found';
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}