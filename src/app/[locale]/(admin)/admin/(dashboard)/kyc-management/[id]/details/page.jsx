"use client";

import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import FieldReviewModal from '@/components/admin/FieldReviewModal';
import Image from 'next/image';

// Enhanced Input Field Component with Selection
const InputField = ({ label, value, icon, isSelected = false, onSelect, fieldId, tabName }) => (
  <div 
    onClick={onSelect}
    className={`group relative p-4 rounded-lg border-2 transition-all cursor-pointer
      ${isSelected 
        ? 'border-green-500 bg-green-50/50 shadow-md' 
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
  >
    {/* Selection Indicator */}
    <div className="absolute top-2 right-2">
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
        ${isSelected 
          ? 'bg-green-100 text-green-700' 
          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
        }`}
      >
        <div className="relative">
          <div className={`w-2 h-2 rounded-full 
            ${isSelected ? 'bg-green-500' : 'bg-gray-400'}`}
          />
          {isSelected && (
            <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
          )}
        </div>
        <span>{isSelected ? 'Selected' : 'Click to review'}</span>
      </div>
    </div>

    {/* Label with Icon */}
    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
      {icon && <Icon icon={icon} className={`w-4 h-4 ${isSelected ? 'text-green-600' : 'text-gray-500'}`} />}
      <span className={isSelected ? 'text-green-700 font-semibold' : ''}>{label}</span>
      
    </label>

    {/* Input Field */}
    <div className="relative">
      <input
        type="text"
        value={value || ''}
        disabled
        className={`w-full px-4 py-2.5 border rounded-lg bg-white text-gray-700 cursor-not-allowed transition-all
          ${isSelected 
            ? 'border-green-300 ring-2 ring-green-100' 
            : 'border-gray-200 group-hover:border-gray-300'
          }`}
      />
      
      {/* Quick Action Icons */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {isSelected && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 rounded-full">
            <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-medium text-red-700">Review</span>
          </div>
        )}
      </div>
    </div>

    {/* Selected Field Indicator Strip */}
    {isSelected && (
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 rounded-b-lg" />
    )}
  </div>
);

// Selection Summary Bar Component
const SelectionSummaryBar = ({ selectedCount, totalFields, onNext, currentTab, totalTabs }) => (
  <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-10 mt-6">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Selected Count */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
          </div>
          <span className="font-medium text-gray-700">
            {selectedCount} field{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center gap-1 ml-4">
          <span className="text-sm text-gray-500">Tab {currentTab} of {totalTabs}</span>
          <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(currentTab / totalTabs) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all
            bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
          `}
      >
        <span>{currentTab === totalTabs ? 'Review Selected' : 'Next'}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
);

// Tab Container with Selection State
const TabContainer = ({ children, tabName, onNext, selectedCount, totalFields, currentTab, totalTabs }) => (
  <div className="space-y-4 pb-20">
    {/* Tab Header with Selection Info */}
    <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-gray-800">{tabName}</h3>
        {selectedCount > 0 && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            {selectedCount} selected
          </span>
        )}
      </div>
    </div>

    {/* Tab Content */}
    {children}

    {/* Selection Summary Bar for this tab */}
    <SelectionSummaryBar
      selectedCount={selectedCount}
      totalFields={totalFields}
      onNext={onNext}
      currentTab={currentTab}
      totalTabs={totalTabs}
    />
  </div>
);

// Image Display Component (unchanged)
// Image Display Component with Selection
const ImageDisplay = ({ url, alt, label, isSelected = false, onSelect }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!url || url === "") return null;

  return (
    <div 
      onClick={onSelect}
      className={`group relative bg-white rounded-xl border-2 overflow-hidden hover:shadow-lg transition-all cursor-pointer
        ${isSelected 
          ? 'border-green-500 ring-2 ring-green-200' 
          : 'border-gray-200 hover:border-gray-300'
        }`}
    >
      {/* Selection Indicator */}
      <div className="absolute top-2 right-2 z-10">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
          ${isSelected 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
          }`}
        >
          <div className="relative">
            <div className={`w-2 h-2 rounded-full 
              ${isSelected ? 'bg-green-500' : 'bg-gray-400'}`}
            />
            {isSelected && (
              <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
            )}
          </div>
          <span>{isSelected ? 'Selected' : 'Click to select'}</span>
        </div>
      </div>

      <div className="p-3 border-b border-gray-100 bg-gray-50">
        <label className="block text-sm font-semibold text-gray-700 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon icon="mdi:file-image" className={`w-4 h-4 ${isSelected ? 'text-green-600' : 'text-primary-600'}`} />
            {label}
          </span>
          {isSelected && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              Selected
            </span>
          )}
        </label>
      </div>
      <div className="p-3">
        <div 
          className="relative w-full h-48 rounded-lg overflow-hidden cursor-pointer group"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering parent onClick
            window.open(url, '_blank');
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          )}
          <img
            src={url}
            alt={alt}
            className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
            onError={(e) => {
              setIsLoading(false);
              setError(true);
              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              Click to view full size
            </span>
          </div>
        </div>
      </div>

      {/* Selected Field Indicator Strip */}
      {isSelected && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500" />
      )}
    </div>
  );
};

// Tags Display Component with Selection
const TagsDisplay = ({ items, label, icon, color = 'primary', isSelected = false, onSelect }) => {
  if (!items || items.length === 0) {
    return (
      <div 
        onClick={onSelect}
        className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all
          ${isSelected 
            ? 'border-green-500 bg-green-50/50' 
            : 'border-gray-200 hover:border-gray-300'
          }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Icon icon={icon} className={`w-5 h-5 ${isSelected ? 'text-green-600' : `text-${color}-600`}`} />
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {isSelected && (
            <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              Selected
            </span>
          )}
        </div>
        <p className="text-gray-400 text-sm italic">No {label.toLowerCase()} specified</p>
      </div>
    );
  }

  const colors = {
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200'
  };

  return (
    <div 
      onClick={onSelect}
      className={`bg-white rounded-xl border-2 p-4 hover:shadow-md transition-all cursor-pointer
        ${isSelected 
          ? 'border-green-500 bg-green-50/50' 
          : 'border-gray-200 hover:border-gray-300'
        }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon icon={icon} className={`w-5 h-5 ${isSelected ? 'text-green-600' : `text-${color}-600`}`} />
        <span className="text-sm font-semibold text-gray-800">{label}</span>
        <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
          {items.length} items
        </span>
        {isSelected && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            Selected
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={index}
            className={`px-3 py-1.5 ${colors[color]} rounded-lg text-sm font-medium border flex items-center gap-1`}
          >
            {item.icon && (
              <img src={item.icon} alt={item.name} className="w-4 h-4 rounded-full" />
            )}
            {typeof item === 'string' ? item : item.name || item}
          </span>
        ))}
      </div>
    </div>
  );
};

// Stats Card Component (unchanged)
const StatsCard = ({ icon, label, value, color = 'primary', bgColor = '50' }) => {
  const colors = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-700', icon: 'text-primary-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-600' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-600' }
  };

  return (
    <div className={`${colors[color]?.bg} rounded-xl p-4 border border-${color}-200`}>
      <div className="flex items-center gap-3">
        <div className={`p-3 bg-white rounded-lg shadow-sm`}>
          <Icon icon={icon} className={`w-6 h-6 ${colors[color]?.icon}`} />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-2xl font-bold ${colors[color]?.text}`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

function KycRepairmanDetail() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showFieldReview, setShowFieldReview] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [selectedFields, setSelectedFields] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);

  const { id } = useParams();
  const router = useRouter();
  const { token } = useSelector(state => state.auth);

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: 'mdi:account', order: 1 },
    { id: 'contact', label: 'Contact', icon: 'mdi:phone', order: 2 },
    { id: 'location', label: 'Location', icon: 'mdi:map-marker', order: 3 },
    { id: 'professional', label: 'Professional', icon: 'mdi:briefcase', order: 4 },
    { id: 'documents', label: 'Documents', icon: 'mdi:file-document', order: 5 },
    { id: 'bank', label: 'Bank Details', icon: 'mdi:bank', order: 6 }
  ].sort((a, b) => a.order - b.order);

  const currentTabIndex = tabs.findIndex(t => t.id === activeTab) + 1;
  const totalTabs = tabs.length;

  const fetchRepairman = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/admin/repairman/new-repairmans/${id}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      console.log('API Response:', response.data);
      const repairmanData = response.data.data;
      console.log('Repairman Data:', repairmanData);
      setData(repairmanData);
      setSelectedStatus(repairmanData?.repairmanProfile?.kycStatus || 'pending');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairman();
  }, []);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    
    if (newStatus === 'rejected' || newStatus === 'revision') {
      setShowReasonModal(true);
    }
  };

  const handleStatusUpdate = async () => {
    if ((selectedStatus === 'rejected' || selectedStatus === 'revision') && !rejectionReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      setUpdatingStatus(true);
      const payload = {
        kycStatus: selectedStatus
      };

      if (selectedStatus === 'rejected' || selectedStatus === 'revision') {
        payload.reason = rejectionReason;
      }

      await axiosInstance.post(`/admin/repairman/new-repairmans/${id}/toggle-kyc`, payload, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      const statusMessages = {
        approved: 'KYC approved successfully',
        rejected: 'KYC rejected successfully',
        revision: 'Revision requested successfully',
        pending: 'Status updated to pending'
      };
      
      toast.success(statusMessages[selectedStatus] || 'Status updated successfully');
      setShowReasonModal(false);
      setRejectionReason('');
      await fetchRepairman();
    } catch (error) {
      handleError(error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleFieldSelect = (fieldId) => {
    setSelectedFields(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }));
  };

  const handleNextTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      // Move to next tab
      setActiveTab(tabs[currentIndex + 1].id);
    } else {
      // Last tab - open review modal
      const selectedFieldsList = Object.entries(selectedFields)
        .filter(([_, selected]) => selected)
        .map(([fieldId]) => fieldId);
      
      if (selectedFieldsList.length === 0) {
        toast.error('Please select at least one field to review');
        return;
      }
      
      setShowReviewModal(true);
    }
  };

  const getSelectedCountForTab = (tabId) => {
    const tabFields = getFieldsForTab(tabId);
    return tabFields.filter(field => selectedFields[field.id]).length;
  };

  const getFieldsForTab = (tabId) => {
    const profile = data?.repairmanProfile || {};
    const fields = [];

    switch(tabId) {
      case 'personal':
        fields.push(
          { id: 'fullName', label: 'Full Name', value: profile.fullName, icon: 'mdi:account' },
          { id: 'fatherName', label: 'Father\'s Name', value: profile.fatherName, icon: 'mdi:account-family' },
          { id: 'nationalId', label: 'National ID', value: profile.nationalIdOrCitizenNumber, icon: 'mdi:card-account-details' },
          { id: 'dob', label: 'Date of Birth', value: profile.dob ? new Date(profile.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '', icon: 'mdi:cake' },
          { id: 'gender', label: 'Gender', value: profile.gender, icon: 'mdi:gender-male-female' },
          { id: 'email', label: 'Email Address', value: profile.emailAddress, icon: 'mdi:email' }
        );
        break;
      case 'contact':
        fields.push(
          { id: 'mobile', label: 'Mobile Number', value: profile.mobileNumber, icon: 'mdi:phone' },
          { id: 'whatsapp', label: 'WhatsApp Number', value: profile.whatsappNumber, icon: 'mdi:whatsapp' },
          { id: 'emergencyContact', label: 'Emergency Contact', value: profile.emergencyContactPerson, icon: 'mdi:account-alert' },
          { id: 'emergencyNumber', label: 'Emergency Number', value: profile.emergencyContactNumber, icon: 'mdi:phone-alert' }
        );
        break;
      case 'location':
        fields.push(
          { id: 'country', label: 'Country', value: profile.country?.name || data?.country?.name, icon: 'mdi:map' },
          { id: 'state', label: 'State', value: profile.state?.name || data?.state?.name, icon: 'mdi:map-marker-radius' },
          { id: 'city', label: 'City', value: profile.city?.name || data?.city?.name, icon: 'mdi:city' },
          { id: 'zipCode', label: 'Zip Code', value: profile.zipCode, icon: 'mdi:mailbox' },
          { id: 'fullAddress', label: 'Full Address', value: profile.fullAddress, icon: 'mdi:map-marker', type: 'textarea' }
        );
        break;
      case 'professional':
        fields.push(
          { id: 'experience', label: 'Years of Experience', value: profile.yearsOfExperience, icon: 'mdi:briefcase', type: 'number' },
          { id: 'specializations', label: 'Specializations', value: profile.specializations, icon: 'mdi:wrench', type: 'array' },
          { id: 'brands', label: 'Brands Worked With', value: profile.brandsWorkedWith, icon: 'mdi:star', type: 'brands' },
          { id: 'description', label: 'Description', value: profile.description, icon: 'mdi:text', type: 'textarea' },
          { id: 'workingDays', label: 'Working Days', value: profile.workingDays, icon: 'mdi:calendar', type: 'array' },
          { id: 'workingHours', label: 'Working Hours', value: profile.workingHours ? `${profile.workingHours.start} - ${profile.workingHours.end}` : '', icon: 'mdi:clock' },
          { id: 'pickupService', label: 'Pickup Service', value: profile.pickupService ? 'Available' : 'Not Available', icon: 'mdi:truck' }
        );
        break;
      case 'documents':
        fields.push(
          { id: 'profilePhoto', label: 'Profile Photo', value: profile.profilePhoto, icon: 'mdi:camera', type: 'file' },
          { id: 'nationalIdScan', label: 'National ID / Passport', value: profile.nationalIdOrPassportScan, icon: 'mdi:passport', type: 'file' },
          { id: 'shopPhoto', label: 'Shop Photo', value: profile.shopPhoto, icon: 'mdi:store-image', type: 'file' },
          { id: 'utilityBill', label: 'Utility Bill / Shop Proof', value: profile.utilityBillOrShopProof, icon: 'mdi:file-document', type: 'file' },
          { id: 'certifications', label: 'Certifications', value: profile.certifications, icon: 'mdi:certificate', type: 'files' }
        );
        break;
      case 'bank':
        if (profile.bankDetails) {
          fields.push(
            { id: 'accountTitle', label: 'Account Title', value: profile.bankDetails.accountTitle, icon: 'mdi:account' },
            { id: 'accountNumber', label: 'Account Number', value: profile.bankDetails.accountNumber, icon: 'mdi:credit-card' },
            { id: 'bankName', label: 'Bank Name', value: profile.bankDetails.bankName, icon: 'mdi:bank' },
            { id: 'branchName', label: 'Branch Name', value: profile.bankDetails.branchName, icon: 'mdi:domain' },
            { id: 'iban', label: 'IBAN', value: profile.bankDetails.iban, icon: 'mdi:identifier' }
          );
        }
        break;
    }

    return fields;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'mdi:clock-outline', border: 'border-yellow-200' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: 'mdi:check-circle', border: 'border-green-200' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: 'mdi:close-circle', border: 'border-red-200' },
      revision: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'mdi:file-edit', border: 'border-blue-200' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border} shadow-sm`}>
        <Icon icon={config.icon} className="w-5 h-5 mr-2" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <Icon icon="mdi:loading" className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading KYC details...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="mdi:alert-circle" className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Data Found</h2>
          <p className="text-gray-600 mb-6">The requested repairman KYC data could not be found.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const profile = data.repairmanProfile || {};
  const currentKycStatus = data?.repairmanProfile?.kycStatus || 'pending';
  const currentTabFields = getFieldsForTab(activeTab);
  const selectedCountForCurrentTab = getSelectedCountForTab(activeTab);
  const totalSelectedFields = Object.values(selectedFields).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon icon="mdi:shield-account" className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">KYC Application Review</h1>
                  <p className="text-gray-500 flex items-center gap-2 mt-1">
                    <Icon icon="mdi:identifier" className="w-4 h-4" />
                    ID: {id}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(currentKycStatus)}
              <button
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all"
              >
                <Icon icon="mdi:arrow-left" className="w-5 h-5" />
                Back
              </button>
            </div>
          </div>

          {profile.kycReason && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
              <Icon icon="mdi:information" className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">Previous Review Feedback:</p>
                <p className="text-sm text-orange-700 mt-1">{profile.kycReason}</p>
              </div>
            </div>
          )}

          {/* Selection Summary */}
          {totalSelectedFields > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
              <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700 font-medium">
                {totalSelectedFields} field{totalSelectedFields !== 1 ? 's' : ''} selected across all tabs
              </span>
            </div>
          )}
        </div>

        {/* KYC Actions */}
  {/* KYC Actions */}
<div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <Icon icon="mdi:shield-check" className="w-5 h-5 text-primary-600" />
    KYC Review Actions
  </h3>
  <div className="flex flex-wrap items-end gap-4">
    <div className="flex-1 min-w-[200px]">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Update KYC Status
      </label>
      <select
        value={selectedStatus}
        onChange={handleStatusChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
      >
        <option value="pending"> Pending Review</option>
        <option value="approved"> Approve Application</option>
        <option value="revision"> Request Revision</option>
        <option value="rejected"> Reject Application</option>
      </select>
    </div>
    
    <button
      onClick={handleStatusUpdate}
      disabled={updatingStatus || selectedStatus === currentKycStatus}
      className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:bg-gray-300 flex items-center gap-2 font-medium shadow-lg min-w-[160px] justify-center"
    >
      {updatingStatus ? (
        <>
          <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
          Updating...
        </>
      ) : (
        <>
          <Icon icon="mdi:check" className="w-5 h-5" />
          Update Status
        </>
      )}
    </button>
  </div>

  {/* Show reason if exists */}
 {/* Reason Modal for Rejection/Revision */}
{showReasonModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-full ${selectedStatus === 'revision' ? 'bg-blue-100' : 'bg-red-100'} flex items-center justify-center`}>
            <Icon 
              icon={selectedStatus === 'revision' ? 'mdi:file-edit' : 'mdi:alert-circle'} 
              className={`w-5 h-5 ${selectedStatus === 'revision' ? 'text-blue-600' : 'text-red-600'}`} 
            />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {selectedStatus === 'revision' ? 'Request Revision' : 'Reject Application'}
          </h3>
        </div>
        <button
          onClick={() => {
            setShowReasonModal(false);
            setRejectionReason('');
            setSelectedStatus(currentKycStatus);
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <Icon icon="mdi:close" className="w-6 h-6" />
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {selectedStatus === 'revision' ? 'What needs to be revised?' : 'Reason for rejection'}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          rows={4}
          placeholder={selectedStatus === 'revision' 
            ? 'Please specify what fields need to be corrected...' 
            : 'Please provide a detailed reason for rejection...'}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          This reason will be visible to the repairman
        </p>
      </div>
      
      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setShowReasonModal(false);
            setRejectionReason('');
            setSelectedStatus(currentKycStatus);
          }}
          className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleStatusUpdate}
          disabled={updatingStatus || !rejectionReason.trim()}
          className={`px-6 py-2 rounded-xl text-white flex items-center gap-2 disabled:opacity-50 ${
            selectedStatus === 'revision' 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {updatingStatus ? (
            <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
          ) : (
            <Icon icon={selectedStatus === 'revision' ? 'mdi:file-edit' : 'mdi:check'} className="w-5 h-5" />
          )}
          {selectedStatus === 'revision' ? 'Request Revision' : 'Confirm Rejection'}
        </button>
      </div>
    </div>
  </div>
)}{/* Reason Modal for Rejection/Revision */}
{showReasonModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-full ${selectedStatus === 'revision' ? 'bg-blue-100' : 'bg-red-100'} flex items-center justify-center`}>
            <Icon 
              icon={selectedStatus === 'revision' ? 'mdi:file-edit' : 'mdi:alert-circle'} 
              className={`w-5 h-5 ${selectedStatus === 'revision' ? 'text-blue-600' : 'text-red-600'}`} 
            />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {selectedStatus === 'revision' ? 'Request Revision' : 'Reject Application'}
          </h3>
        </div>
        <button
          onClick={() => {
            setShowReasonModal(false);
            setRejectionReason('');
            setSelectedStatus(currentKycStatus);
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <Icon icon="mdi:close" className="w-6 h-6" />
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {selectedStatus === 'revision' ? 'What needs to be revised?' : 'Reason for rejection'}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          rows={4}
          placeholder={selectedStatus === 'revision' 
            ? 'Please specify what fields need to be corrected...' 
            : 'Please provide a detailed reason for rejection...'}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          This reason will be visible to the repairman
        </p>
      </div>
      
      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setShowReasonModal(false);
            setRejectionReason('');
            setSelectedStatus(currentKycStatus);
          }}
          className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleStatusUpdate}
          disabled={updatingStatus || !rejectionReason.trim()}
          className={`px-6 py-2 rounded-xl text-white flex items-center gap-2 disabled:opacity-50 ${
            selectedStatus === 'revision' 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {updatingStatus ? (
            <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
          ) : (
            <Icon icon={selectedStatus === 'revision' ? 'mdi:file-edit' : 'mdi:check'} className="w-5 h-5" />
          )}
          {selectedStatus === 'revision' ? 'Request Revision' : 'Confirm Rejection'}
        </button>
      </div>
    </div>
  </div>
)}
</div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-6 border border-gray-100">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-all relative ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon icon={tab.icon} className="w-5 h-5" />
                {tab.label}
                {getSelectedCountForTab(tab.id) > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                    {getSelectedCountForTab(tab.id)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections with Selection */}
        <TabContainer
          tabName={tabs.find(t => t.id === activeTab)?.label}
          onNext={handleNextTab}
          selectedCount={selectedCountForCurrentTab}
          totalFields={currentTabFields.length}
          currentTab={currentTabIndex}
          totalTabs={totalTabs}
        >
          {/* Personal Information */}
          {activeTab === 'personal' && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Icon icon="mdi:account-details" className="w-6 h-6 text-primary-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentTabFields.map(field => (
                  <InputField
                    key={field.id}
                    label={field.label}
                    value={field.value}
                    icon={field.icon}
                    isSelected={selectedFields[field.id]}
                    onSelect={() => handleFieldSelect(field.id)}
                    fieldId={field.id}
                    tabName="Personal Info"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {activeTab === 'contact' && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Icon icon="mdi:phone-in-talk" className="w-6 h-6 text-primary-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTabFields.map(field => (
                  <InputField
                    key={field.id}
                    label={field.label}
                    value={field.value}
                    icon={field.icon}
                    isSelected={selectedFields[field.id]}
                    onSelect={() => handleFieldSelect(field.id)}
                    fieldId={field.id}
                    tabName="Contact"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Location Information */}
          {activeTab === 'location' && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Icon icon="mdi:map-marker" className="w-6 h-6 text-primary-600" />
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTabFields.map(field => (
                  field.type === 'textarea' ? (
                    <div key={field.id} className="md:col-span-2">
                      <div 
                        onClick={() => handleFieldSelect(field.id)}
                        className={`group relative p-4 rounded-lg border-2 transition-all cursor-pointer
                          ${selectedFields[field.id] 
                            ? 'border-green-500 bg-green-50/50 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <div className="absolute top-2 right-2">
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
                            ${selectedFields[field.id] 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                            }`}
                          >
                            <div className="relative">
                              <div className={`w-2 h-2 rounded-full 
                                ${selectedFields[field.id] ? 'bg-green-500' : 'bg-gray-400'}`}
                              />
                              {selectedFields[field.id] && (
                                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                              )}
                            </div>
                            <span>{selectedFields[field.id] ? 'Selected' : 'Click to select'}</span>
                          </div>
                        </div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                          <Icon icon={field.icon} className={`w-4 h-4 ${selectedFields[field.id] ? 'text-green-600' : 'text-gray-500'}`} />
                          <span className={selectedFields[field.id] ? 'text-green-700 font-semibold' : ''}>{field.label}</span>
                          <span className="ml-auto text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                            Location
                          </span>
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
                          {field.value || 'No address provided'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <InputField
                      key={field.id}
                      label={field.label}
                      value={field.value}
                      icon={field.icon}
                      isSelected={selectedFields[field.id]}
                      onSelect={() => handleFieldSelect(field.id)}
                      fieldId={field.id}
                      tabName="Location"
                    />
                  )
                ))}
              </div>
            </div>
          )}

          {/* Professional Details */}
          {activeTab === 'professional' && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Icon icon="mdi:briefcase" className="w-6 h-6 text-primary-600" />
                Professional Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <StatsCard
                  icon="mdi:briefcase-clock"
                  label="Years of Experience"
                  value={profile.yearsOfExperience || 0}
                  color="blue"
                />
                
                <StatsCard
                  icon="mdi:truck"
                  label="Pickup Service"
                  value={profile.pickupService ? 'Available' : 'Not Available'}
                  color={profile.pickupService ? 'green' : 'yellow'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentTabFields.filter(f => f.id === 'specializations').map(field => (
                  <TagsDisplay
                    key={field.id}
                    items={field.value}
                    label={field.label}
                    icon={field.icon}
                    color="primary"
                    isSelected={selectedFields[field.id]}
                    onSelect={() => handleFieldSelect(field.id)}
                  />
                ))}
                
                {currentTabFields.filter(f => f.id === 'brands').map(field => (
                  <TagsDisplay
                    key={field.id}
                    items={field.value}
                    label={field.label}
                    icon={field.icon}
                    color="purple"
                    isSelected={selectedFields[field.id]}
                    onSelect={() => handleFieldSelect(field.id)}
                  />
                ))}
              </div>

              {currentTabFields.filter(f => f.id === 'description').map(field => (
                <div key={field.id} className="mt-6">
                  <div 
                    onClick={() => handleFieldSelect(field.id)}
                    className={`group relative p-4 rounded-lg border-2 transition-all cursor-pointer
                      ${selectedFields[field.id] 
                        ? 'border-green-500 bg-green-50/50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="absolute top-2 right-2">
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
                        ${selectedFields[field.id] 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        }`}
                      >
                        <div className="relative">
                          <div className={`w-2 h-2 rounded-full 
                            ${selectedFields[field.id] ? 'bg-green-500' : 'bg-gray-400'}`}
                          />
                          {selectedFields[field.id] && (
                            <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                          )}
                        </div>
                        <span>{selectedFields[field.id] ? 'Selected' : 'Click to select'}</span>
                      </div>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Icon icon={field.icon} className={`w-4 h-4 ${selectedFields[field.id] ? 'text-green-600' : 'text-gray-500'}`} />
                      <span className={selectedFields[field.id] ? 'text-green-700 font-semibold' : ''}>{field.label}</span>
                      <span className="ml-auto text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                        Professional
                      </span>
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 whitespace-pre-wrap">
                      {field.value || 'No description provided'}
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Working Schedule</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentTabFields.filter(f => f.id === 'workingDays').map(field => (
                    <div 
                      key={field.id}
                      onClick={() => handleFieldSelect(field.id)}
                      className={`group relative p-4 rounded-lg border-2 transition-all cursor-pointer
                        ${selectedFields[field.id] 
                          ? 'border-green-500 bg-green-50/50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <div className="absolute top-2 right-2">
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
                          ${selectedFields[field.id] 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                          }`}
                        >
                          <div className="relative">
                            <div className={`w-2 h-2 rounded-full 
                              ${selectedFields[field.id] ? 'bg-green-500' : 'bg-gray-400'}`}
                            />
                            {selectedFields[field.id] && (
                              <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-blue-600 mb-1">Working Days</p>
                        <div className="flex flex-wrap gap-2">
                          {field.value?.map(day => (
                            <span key={day} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {currentTabFields.filter(f => f.id === 'workingHours').map(field => (
                    <div 
                      key={field.id}
                      onClick={() => handleFieldSelect(field.id)}
                      className={`group relative p-4 rounded-lg border-2 transition-all cursor-pointer
                        ${selectedFields[field.id] 
                          ? 'border-green-500 bg-green-50/50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <div className="absolute top-2 right-2">
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
                          ${selectedFields[field.id] 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                          }`}
                        >
                          <div className="relative">
                            <div className={`w-2 h-2 rounded-full 
                              ${selectedFields[field.id] ? 'bg-green-500' : 'bg-gray-400'}`}
                            />
                            {selectedFields[field.id] && (
                              <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-xl">
                        <p className="text-sm text-green-600 mb-1">Working Hours</p>
                        <p className="text-lg font-bold text-green-900">
                          {field.value || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
   {activeTab === 'documents' && (
  <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
      <Icon icon="mdi:file-document" className="w-6 h-6 text-primary-600" />
      Uploaded Documents
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {currentTabFields.map(field => {
        // For certifications (multiple files)
        if (field.type === 'files' && field.id === 'certifications') {
          const certificates = field.value?.filter(cert => cert) || [];
          
          return (
            <div key={field.id} className="md:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <Icon icon="mdi:certificate" className="w-5 h-5 text-primary-600" />
                <h4 className="font-semibold text-gray-800">Certifications</h4>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {certificates.length} files
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {certificates.map((cert, index) => (
                  <ImageDisplay
                    key={`${field.id}_${index}`}
                    url={cert}
                    alt={`Certification ${index + 1}`}
                    label={`Certificate ${index + 1}`}
                    isSelected={selectedFields[`${field.id}_${index}`]}
                    onSelect={() => handleFieldSelect(`${field.id}_${index}`)}
                  />
                ))}
              </div>
            </div>
          );
        }
        
        // For single image fields
        return (
          <ImageDisplay
            key={field.id}
            url={field.value}
            alt={field.label}
            label={field.label}
            isSelected={selectedFields[field.id]}
            onSelect={() => handleFieldSelect(field.id)}
          />
        );
      })}
    </div>
  </div>
)}

          {/* Bank Details */}
          {activeTab === 'bank' && (
             <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Icon icon="mdi:bank" className="w-6 h-6 text-primary-600" />
        Bank Account Details
      </h3>
      
      {profile?.bankDetails ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Account Title"
            value={profile.bankDetails.accountTitle}
            icon="mdi:account"
            isSelected={selectedFields['bankAccountTitle']}
            onSelect={() => handleFieldSelect('bankAccountTitle')}
          />
          <InputField
            label="Account Number"
            value={profile.bankDetails.accountNumber}
            icon="mdi:credit-card"
            isSelected={selectedFields['bankAccountNumber']}
            onSelect={() => handleFieldSelect('bankAccountNumber')}
          />
          <InputField
            label="Bank Name"
            value={profile.bankDetails.bankName}
            icon="mdi:bank"
            isSelected={selectedFields['bankName']}
            onSelect={() => handleFieldSelect('bankName')}
          />
          <InputField
            label="Branch Name"
            value={profile.bankDetails.branchName}
            icon="mdi:domain"
            isSelected={selectedFields['branchName']}
            onSelect={() => handleFieldSelect('branchName')}
          />
          <InputField
            label="IBAN"
            value={profile.bankDetails.iban}
            icon="mdi:identifier"
            isSelected={selectedFields['iban']}
            onSelect={() => handleFieldSelect('iban')}
          />
          <InputField
            label="Last Updated"
            value={profile.bankDetails.updatedAt 
              ? new Date(profile.bankDetails.updatedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })
              : 'Not updated'}
            icon="mdi:calendar-clock"
            isSelected={selectedFields['bankUpdatedAt']}
            onSelect={() => handleFieldSelect('bankUpdatedAt')}
          />
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <Icon icon="mdi:bank-off" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">No Bank Details Available</h4>
          <p className="text-gray-500">The repairman hasn't added any bank information yet.</p>
        </div>
      )}
    </div>

          )}
        </TabContainer>

        {/* Statistics Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Icon icon="mdi:chart-line" className="w-6 h-6 text-primary-600" />
            Application Statistics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              icon="mdi:briefcase"
              label="Total Jobs"
              value={profile.totalJobs || 0}
              color="blue"
            />
            
            <StatsCard
              icon="mdi:star"
              label="Rating"
              value={`${profile.rating || 0}/5`}
              color="yellow"
            />
            
            <StatsCard
              icon="mdi:shield-check"
              label="KYC Status"
              value={currentKycStatus.charAt(0).toUpperCase() + currentKycStatus.slice(1)}
              color={currentKycStatus === 'approved' ? 'green' : currentKycStatus === 'rejected' ? 'red' : 'yellow'}
            />
            
            <StatsCard
              icon="mdi:calendar"
              label="Joined"
              value={data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'}
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <p className="text-sm text-green-700 mb-1">KYC Completed</p>
              <p className="text-3xl font-bold text-green-800">{profile.isKycCompleted ? 'Yes' : 'No'}</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <p className="text-sm text-purple-700 mb-1">Payment Info</p>
              <p className="text-3xl font-bold text-purple-800">{profile.isPaymentInformationCompleted ? 'Completed' : 'Pending'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Field Review Modal (Old - for admin flagging) */}
      {/* <FieldReviewModal
        isOpen={showFieldReview}
        onClose={() => setShowFieldReview(false)}
        repairmanId={id}
        currentData={data}
        onSubmit={(reviewData) => {
          toast.success('Review submitted successfully');
          fetchRepairman();
        }}
      /> */}

      {/* New Review Modal for Selected Fields */}
      <FieldReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        selectedFields={Object.entries(selectedFields)
          .filter(([_, selected]) => selected)
          .map(([fieldId]) => {
            // Find field details from all tabs
            for (const tab of tabs) {
              const fields = getFieldsForTab(tab.id);
              const field = fields.find(f => f.id === fieldId);
              if (field) {
                return {
                  id: fieldId,
                  label: field.label,
                  value: field.value,
                  icon: field.icon,
                  tab: tab.label,
                  type: field.type
                };
              }
            }
            return null;
          })
          .filter(Boolean)}
        repairmanId={id}
        onSubmit={() => {
          setSelectedFields({});
          setShowReviewModal(false);
          toast.success('Review submitted successfully');
          fetchRepairman();
        }}
      />
    </div>
  );
}

export default KycRepairmanDetail;