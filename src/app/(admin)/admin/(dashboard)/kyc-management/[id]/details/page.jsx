"use client";

import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';

// Read-only Input component
const InputField = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type="text"
      value={value || ''}
      disabled
      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
    />
  </div>
);

// Image Display Component
const ImageDisplay = ({ url, alt, label }) => {
  if (!url) return null;
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <img
        src={url}
        alt={alt}
        className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-300 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => window.open(url, '_blank')}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
      <p className="text-xs text-gray-500 mt-1">Click to view full size</p>
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

  const { id } = useParams();
  const router = useRouter();
  const { token } = useSelector(state => state.auth);

  const fetchRepairman = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/admin/repairman/new-repairmans/${id}`, {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
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
    
    // If status is rejected or revision, show reason modal
    if (newStatus === 'rejected' || newStatus === 'revision') {
      setShowReasonModal(true);
    }
  };

  const handleStatusUpdate = async () => {
    // If rejected or revision, reason is required
    if ((selectedStatus === 'rejected' || selectedStatus === 'revision') && !rejectionReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      setUpdatingStatus(true);
      const payload = {
        kycStatus: selectedStatus
      };

      // Add reason for rejected or revision status
      if (selectedStatus === 'rejected' || selectedStatus === 'revision') {
        payload.reason = rejectionReason;
      }

      // Updated endpoint to match backend
      await axiosInstance.post(`/admin/repairman/new-repairmans/${id}/toggle-kyc`, payload, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
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
    //   toast.error('Failed to update KYC status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'mdi:clock-outline' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: 'mdi:check-circle' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: 'mdi:close-circle' },
      revision: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'mdi:file-edit' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon icon={config.icon} className="w-4 h-4 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Icon icon="mdi:loading" className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading KYC details...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Icon icon="mdi:alert-circle" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">No Data Found</h2>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const profile = data.repairmanProfile || {};
  const currentKycStatus = data?.repairmanProfile?.kycStatus || 'pending';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">KYC Details</h1>
                {getStatusBadge(currentKycStatus)}
              </div>
              <p className="text-gray-600">Review repairman KYC application</p>
              <p className="text-sm text-gray-500 mt-1">Application ID: {id}</p>
              {profile.kycReason && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm font-medium text-yellow-800">Previous Reason:</p>
                  <p className="text-sm text-yellow-700 mt-1">{profile.kycReason}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Icon icon="mdi:arrow-left" className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>

        {/* KYC Status Change Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Change KYC Status</h3>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Status
              </label>
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="revision">Request Revision</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button
              onClick={handleStatusUpdate}
              disabled={updatingStatus || selectedStatus === currentKycStatus}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {updatingStatus ? (
                <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
              ) : (
                <Icon icon="mdi:check" className="w-5 h-5" />
              )}
              Update Status
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon icon="mdi:account" className="w-5 h-5 text-primary-600" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Name" value={data?.name} />
            <InputField label="Email" value={data?.email} />
            <InputField label="Phone" value={data?.phone} />
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon icon="mdi:account-details" className="w-5 h-5 text-primary-600" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Full Name" value={profile.fullName} />
            <InputField label="Father's Name" value={profile.fatherName} />
            <InputField label="CNIC Number" value={profile.nationalIdOrCitizenNumber} />
            <InputField label="Date of Birth" value={profile.dob ? new Date(profile.dob).toLocaleDateString() : ''} />
            <InputField label="Gender" value={profile.gender} />
            <InputField label="Email Address" value={profile.emailAddress} />
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon icon="mdi:phone" className="w-5 h-5 text-primary-600" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Mobile Number" value={profile.mobileNumber} />
            <InputField label="WhatsApp Number" value={profile.whatsappNumber} />
            <InputField label="Emergency Contact Person" value={profile.emergencyContactPerson} />
            <InputField label="Emergency Contact Number" value={profile.emergencyContactNumber} />
          </div>
        </div>

        {/* Shop Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon icon="mdi:store" className="w-5 h-5 text-primary-600" />
            Shop Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Shop Name" value={profile.shopName} />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
              <textarea
                value={profile.fullAddress || ''}
                disabled
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>
            <InputField label="City" value={profile.city} />
            <InputField label="District" value={profile.district} />
            <InputField label="Zip Code" value={profile.zipCode} />
          </div>
        </div>

        {/* Working Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon icon="mdi:clock-outline" className="w-5 h-5 text-primary-600" />
            Working Schedule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Working Hours" value={`${profile.workingHours?.start || ''} - ${profile.workingHours?.end || ''}`} />
            <InputField label="Pickup Service" value={profile.pickupService ? 'Yes' : 'No'} />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Working Days</label>
              <div className="flex flex-wrap gap-2">
                {profile.workingDays?.map((day) => (
                  <span key={day} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                    {day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon icon="mdi:briefcase" className="w-5 h-5 text-primary-600" />
            Professional Details
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <InputField label="Years of Experience" value={profile.yearsOfExperience || ''} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specializations</label>
              <div className="flex flex-wrap gap-2">
                {profile.specializations?.map((spec, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={profile.description || ''}
                disabled
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon icon="mdi:file-document" className="w-5 h-5 text-primary-600" />
            Uploaded Documents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageDisplay url={profile.profilePhoto} alt="Profile Photo" label="Profile Photo" />
            <ImageDisplay url={profile.nationalIdOrPassportScan} alt="CNIC" label="CNIC/Passport Scan" />
            <ImageDisplay url={profile.shopPhoto} alt="Shop" label="Shop Photo" />
            <ImageDisplay url={profile.utilityBillOrShopProof} alt="Utility Bill" label="Utility Bill/Shop Proof" />
          </div>

          {profile.certifications && profile.certifications.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Certifications</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {profile.certifications.map((cert, index) => (
                  <img
                    key={index}
                    src={cert}
                    alt={`Certification ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-300 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => window.open(cert, '_blank')}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon icon="mdi:chart-line" className="w-5 h-5 text-primary-600" />
            Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Jobs</p>
              <p className="text-2xl font-bold text-blue-900">{profile.totalJobs || 0}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium">Rating</p>
              <p className="text-2xl font-bold text-yellow-900">{profile.rating || 0} / 5</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">KYC Status</p>
              <p className="text-2xl font-bold text-green-900 capitalize">{currentKycStatus}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedStatus === 'revision' ? 'Revision Details' : 'Rejection Reason'}
              </h3>
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
                {selectedStatus === 'revision' ? 'What needs to be revised?' : 'Why are you rejecting this application?'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder={selectedStatus === 'revision' 
                  ? 'Please specify what needs to be revised...' 
                  : 'Please provide a detailed reason for rejection...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setRejectionReason('');
                  setSelectedStatus(currentKycStatus);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updatingStatus || !rejectionReason.trim()}
                className={`px-4 py-2 ${selectedStatus === 'revision' ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400' : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'} text-white rounded-lg flex items-center gap-2 disabled:cursor-not-allowed`}
              >
                {updatingStatus && <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />}
                {selectedStatus === 'revision' ? 'Request Revision' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KycRepairmanDetail;