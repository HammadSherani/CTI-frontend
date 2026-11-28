"use client";

import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import { produce } from 'immer';
import { toast } from 'react-toastify';

// Stored working hours look like "14:30 PM" (KYC form format) or "2:30 PM".
// <input type="time"> needs "HH:mm", so normalize for display...
const toTimeInput = (v) => {
  const m = String(v || '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return '';
  let h = parseInt(m[1], 10);
  const period = m[3]?.toUpperCase();
  if (h <= 12 && period === 'PM' && h !== 12) h += 12;
  if (h === 12 && period === 'AM') h = 0;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
};
// ...and save back in the same format the KYC form uses.
const fromTimeInput = (v) => {
  if (!v) return '';
  return `${v} ${parseInt(v.split(':')[0], 10) >= 12 ? 'PM' : 'AM'}`;
};

const toId = (v) => (v && typeof v === 'object' ? v._id || v.id || '' : v || '');

const LocationSelect = ({ label, value, options, placeholder, onChange, disabled = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
    >
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o._id || o.id} value={o._id || o.id}>{o.name}</option>
      ))}
    </select>
  </div>
);

// Input component for reusability
const InputField = ({ label, name, value, onChange, type = 'text', required = false, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500`}
      required={required}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

// Select component for reusability
const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
    >
      {options.map(option => (
        <option key={option.value || option} value={option.value || option}>
          {option.label || option.charAt(0).toUpperCase() + option.slice(1)}
        </option>
      ))}
    </select>
  </div>
);

// Checkbox component for reusability
const CheckboxField = ({ label, name, checked, onChange, id }) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      name={name}
      id={id}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
    />
    <label htmlFor={id} className="ml-2 text-sm text-gray-700">{label}</label>
  </div>
);

// Image Preview Component
const ImagePreview = ({ url, alt }) => {
  if (!url) return null;
  return (
    <div className="mt-2">
      <img
        src={url}
        alt={alt}
        className="w-32 h-32 object-cover rounded border border-gray-300"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    </div>
  );
};

// File Input component with image preview
const FileInput = ({ label, name, onChange, accept, currentUrl }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type="file"
      name={name}
      onChange={onChange}
      accept={accept}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
    />
    <ImagePreview url={currentUrl} alt={label} />
  </div>
);

function RepairmanEditPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStatus, setCurrentStatus] = useState('');
  const [files, setFiles] = useState({
    profilePhoto: null,
    nationalIdOrPassportScan: null,
    shopPhoto: null,
    utilityBillOrShopProof: null,
    certifications: []
  });
  const { token } = useSelector(state => state.auth);
  const { id } = useParams();
  const router = useRouter();

  const initialFormData = useMemo(() => ({
    name: '',
    email: '',
    phone: '',
    isActive: false,
    repairmanProfile: {
      workingHours: { start: '', end: '' },
      fullName: '',
      fatherName: '',
      nationalIdOrCitizenNumber: '',
      dob: '',
      gender: '',
      mobileNumber: '',
      whatsappNumber: '',
      emailAddress: '',
      emergencyContactPerson: '',
      emergencyContactNumber: '',
      shopName: '',
      fullAddress: '',
      country: '',
      state: '',
      city: '',
      zipCode: '',
      profilePhoto: '',
      nationalIdOrPassportScan: '',
      shopPhoto: '',
      utilityBillOrShopProof: '',
      certifications: [],
      yearsOfExperience: '',
      specializations: [],
      brandsWorkedWith: [],
      description: '',
      workingDays: [],
      pickupService: false
    }
  }), []);

  const [formData, setFormData] = useState(initialFormData);
  const [brandOptions, setBrandOptions] = useState([]);

  useEffect(() => {
    axiosInstance.get('/public/brands')
      .then(({ data }) => setBrandOptions(data?.data?.brands || []))
      .catch(handleError);
  }, []);

  // Location dropdowns (country → state → city), same endpoints as the KYC form
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const selectedCountry = formData.repairmanProfile.country;
  const selectedState = formData.repairmanProfile.state;

  useEffect(() => {
    axiosInstance.get('/public/countries')
      .then(({ data }) => setCountryOptions(data?.data || []))
      .catch(handleError);
  }, []);

  useEffect(() => {
    if (!selectedCountry) { setStateOptions([]); return; }
    axiosInstance.get(`/public/states/country/${selectedCountry}`)
      .then(({ data }) => setStateOptions(data?.data || []))
      .catch(handleError);
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedState) { setCityOptions([]); return; }
    axiosInstance.get(`/public/cities/state/${selectedState}`)
      .then(({ data }) => setCityOptions(data?.data || []))
      .catch(handleError);
  }, [selectedState]);

  const handleLocationChange = useCallback((field, value) => {
    setFormData(produce(draft => {
      draft.repairmanProfile[field] = value;
      // Changing a parent clears the children that depended on it
      if (field === 'country') { draft.repairmanProfile.state = ''; draft.repairmanProfile.city = ''; }
      if (field === 'state') { draft.repairmanProfile.city = ''; }
    }));
  }, []);

  const weekDays = useMemo(() => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], []);
  const genderOptions = useMemo(() => [
    { value: '', label: 'Select Gender' },
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ], []);

  const statusOptions = useMemo(() => [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'suspended', label: 'Suspended' }
  ], []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const fetchRepairMan = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/admin/repairman/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const repairman = response.data.data.repairman;
      setData(repairman);
      setCurrentStatus(repairman.status || 'pending');
      setFormData(produce(initialFormData, draft => {
        Object.assign(draft, {
          name: repairman.name || '',
          email: repairman.email || '',
          phone: repairman.phone || '',
          isActive: repairman.isActive || false,
          repairmanProfile: {
            ...draft.repairmanProfile,
            ...repairman.repairmanProfile,
            workingHours: {
              start: toTimeInput(repairman.repairmanProfile?.workingHours?.start),
              end: toTimeInput(repairman.repairmanProfile?.workingHours?.end)
            },
            // Location fields may come back as IDs or populated objects; keep IDs.
            // Fall back to the top-level user fields, as the KYC form does.
            country: toId(repairman.repairmanProfile?.country || repairman.country),
            state: toId(repairman.repairmanProfile?.state || repairman.state),
            city: toId(repairman.repairmanProfile?.city || repairman.city),
            dob: repairman.repairmanProfile?.dob ? repairman.repairmanProfile.dob.split('T')[0] : '',
            profilePhoto: repairman.repairmanProfile?.profilePhoto || '',
            nationalIdOrPassportScan: repairman.repairmanProfile?.nationalIdOrPassportScan || '',
            shopPhoto: repairman.repairmanProfile?.shopPhoto || '',
            utilityBillOrShopProof: repairman.repairmanProfile?.utilityBillOrShopProof || '',
            certifications: repairman.repairmanProfile?.certifications || [],
            specializations: repairman.repairmanProfile?.specializations || [],
            // API returns populated brand objects; keep only IDs (what the backend stores)
            brandsWorkedWith: (repairman.repairmanProfile?.brandsWorkedWith || [])
              .map(b => (b && typeof b === 'object' ? b._id : b))
              .filter(Boolean),
            workingDays: repairman.repairmanProfile?.workingDays || []
          }
        });
      }));
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [id, token, initialFormData]);

  useEffect(() => {
    fetchRepairMan();
  }, [fetchRepairMan]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(produce(draft => {
      if (name.includes('.')) {
        const [parent, child, subChild] = name.split('.');
        if (subChild) {
          draft[parent][child][subChild] = type === 'checkbox' ? checked : value;
        } else {
          draft[parent][child] = type === 'checkbox' ? checked : value;
        }
      } else {
        draft[name] = type === 'checkbox' ? checked : value;
      }
    }));
    setErrors(prev => ({ ...prev, [name.split('.').pop()]: '' }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const { name, files: selectedFiles } = e.target;
    if (name === 'repairmanProfile.certifications') {
      setFiles(prev => ({
        ...prev,
        certifications: Array.from(selectedFiles)
      }));
    } else {
      setFiles(prev => ({
        ...prev,
        [name.split('.').pop()]: selectedFiles[0]
      }));
    }
  }, []);

  const handleArrayChange = useCallback((field, value) => {
    setFormData(produce(draft => {
      const [parent, child] = field.split('.');
      draft[parent][child] = value;
    }));
  }, []);

  const handleSpecializationChange = useCallback((value) => {
    const specializations = value.split(',').map(s => s.trim()).filter(s => s);
    handleArrayChange('repairmanProfile.specializations', specializations);
  }, [handleArrayChange]);

  const handleBrandToggle = useCallback((brandId) => {
    setFormData(produce(draft => {
      const current = draft.repairmanProfile.brandsWorkedWith;
      draft.repairmanProfile.brandsWorkedWith = current.includes(brandId)
        ? current.filter(id => id !== brandId)
        : [...current, brandId];
    }));
  }, []);

  const handleWorkingDaysChange = useCallback((day) => {
    setFormData(produce(draft => {
      const currentDays = draft.repairmanProfile.workingDays;
      draft.repairmanProfile.workingDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];
    }));
  }, []);

  const handleStatusChange = useCallback((e) => {
    setCurrentStatus(e.target.value);
  }, []);

  const handleStatusUpdate = useCallback(async () => {
    try {
      setUpdatingStatus(true);
      await axiosInstance.put(`/admin/repairman/${id}/status`, {
        status: currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // alert('Status updated successfully!');
      toast.success('Status updated successfully!');
      await fetchRepairMan();
    } catch (error) {
      handleError(error);
    } finally {
      setUpdatingStatus(false);
    }
  }, [currentStatus, id, token, fetchRepairMan]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const formDataToSend = new FormData();

      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);

      const profileData = {
        ...formData.repairmanProfile,
        workingHours: {
          start: fromTimeInput(formData.repairmanProfile.workingHours.start),
          end: fromTimeInput(formData.repairmanProfile.workingHours.end)
        },
        dob: formData.repairmanProfile.dob ? new Date(formData.repairmanProfile.dob).toISOString() : null
      };
      formDataToSend.append('repairmanProfile', JSON.stringify(profileData));

      if (files.profilePhoto) formDataToSend.append('profilePhoto', files.profilePhoto);
      if (files.nationalIdOrPassportScan) formDataToSend.append('nationalIdOrPassportScan', files.nationalIdOrPassportScan);
      if (files.shopPhoto) formDataToSend.append('shopPhoto', files.shopPhoto);
      if (files.utilityBillOrShopProof) formDataToSend.append('utilityBillOrShopProof', files.utilityBillOrShopProof);
      files.certifications.forEach((file, index) => {
        formDataToSend.append(`certifications[${index}]`, file);
      });

      await axiosInstance.put(`/admin/repairman/${id}/update-profile`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Repairman updated successfully!');
      router.push(`/admin/repair-man/${id}/view`);
    } catch (error) {
      handleError(error);
      alert('Failed to update repairman');
    } finally {
      setSaving(false);
    }
  }, [formData, files, id, token, router, validateForm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon icon="mdi:alert-circle" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">No Data Found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Repairman</h1>
            <p className="text-sm text-gray-600 mt-1">Update repairman information</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Icon icon="mdi:arrow-left" className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Status Update Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Select Status
              </label>
              <select
                id="status"
                name="status"
                value={currentStatus}
                onChange={handleStatusChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={updatingStatus}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-400 flex items-center gap-2"
            >
              {updatingStatus && <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />}
              {updatingStatus ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Name" name="name" value={formData.name} onChange={handleInputChange} required error={errors.name} />
              <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} required error={errors.email} />
              <InputField label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required error={errors.phone} />
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Full Name" name="repairmanProfile.fullName" value={formData.repairmanProfile.fullName} onChange={handleInputChange} />
              <InputField label="Father's Name" name="repairmanProfile.fatherName" value={formData.repairmanProfile.fatherName} onChange={handleInputChange} />
              <InputField label="CNIC" name="repairmanProfile.nationalIdOrCitizenNumber" value={formData.repairmanProfile.nationalIdOrCitizenNumber} onChange={handleInputChange} />
              <InputField label="Date of Birth" name="repairmanProfile.dob" type="date" value={formData.repairmanProfile.dob} onChange={handleInputChange} />
              <SelectField label="Gender" name="repairmanProfile.gender" value={formData.repairmanProfile.gender} onChange={handleInputChange} options={genderOptions} />
              <InputField label="Email" name="repairmanProfile.emailAddress" type="email" value={formData.repairmanProfile.emailAddress} onChange={handleInputChange} />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Mobile" name="repairmanProfile.mobileNumber" type="tel" value={formData.repairmanProfile.mobileNumber} onChange={handleInputChange} />
              <InputField label="WhatsApp" name="repairmanProfile.whatsappNumber" type="tel" value={formData.repairmanProfile.whatsappNumber} onChange={handleInputChange} />
              <InputField label="Emergency Contact" name="repairmanProfile.emergencyContactPerson" value={formData.repairmanProfile.emergencyContactPerson} onChange={handleInputChange} />
              <InputField label="Emergency Number" name="repairmanProfile.emergencyContactNumber" type="tel" value={formData.repairmanProfile.emergencyContactNumber} onChange={handleInputChange} />
            </div>
          </div>

          {/* Shop Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shop Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Shop Name" name="repairmanProfile.shopName" value={formData.repairmanProfile.shopName} onChange={handleInputChange} />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="repairmanProfile.fullAddress"
                  value={formData.repairmanProfile.fullAddress}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <LocationSelect
                label="Country"
                value={formData.repairmanProfile.country}
                options={countryOptions}
                placeholder="Select Country"
                onChange={(v) => handleLocationChange('country', v)}
              />
              <LocationSelect
                label="State / Province"
                value={formData.repairmanProfile.state}
                options={stateOptions}
                placeholder={selectedCountry ? 'Select State' : 'Select a country first'}
                disabled={!selectedCountry}
                onChange={(v) => handleLocationChange('state', v)}
              />
              <LocationSelect
                label="City / District"
                value={formData.repairmanProfile.city}
                options={cityOptions}
                placeholder={selectedState ? 'Select City' : 'Select a state first'}
                disabled={!selectedState}
                onChange={(v) => handleLocationChange('city', v)}
              />
              <InputField label="Zip Code" name="repairmanProfile.zipCode" value={formData.repairmanProfile.zipCode} onChange={handleInputChange} />
            </div>
          </div>

          {/* Working Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Working Schedule</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Start Time" name="repairmanProfile.workingHours.start" type="time" value={formData.repairmanProfile.workingHours.start} onChange={handleInputChange} />
                <InputField label="End Time" name="repairmanProfile.workingHours.end" type="time" value={formData.repairmanProfile.workingHours.end} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                <div className="flex flex-wrap gap-3">
                  {weekDays.map(day => (
                    <label key={day} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.repairmanProfile.workingDays.includes(day)}
                        onChange={() => handleWorkingDaysChange(day)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              <CheckboxField
                label="Pickup Service"
                name="repairmanProfile.pickupService"
                id="pickupService"
                checked={formData.repairmanProfile.pickupService}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Experience (Years)"
                  name="repairmanProfile.yearsOfExperience"
                  type="number"
                  value={formData.repairmanProfile.yearsOfExperience}
                  onChange={handleInputChange}
                  min="0"
                />
                <InputField
                  label="Specializations (comma separated)"
                  value={formData.repairmanProfile.specializations.join(', ')}
                  onChange={(e) => handleSpecializationChange(e.target.value)}
                  placeholder="iPhone, Samsung, Android"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brands Worked With</label>
                {brandOptions.length === 0 ? (
                  <p className="text-sm text-gray-500">Loading brands...</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {brandOptions.map(brand => {
                      const selected = formData.repairmanProfile.brandsWorkedWith.includes(brand._id);
                      return (
                        <button
                          key={brand._id}
                          type="button"
                          onClick={() => handleBrandToggle(brand._id)}
                          className={`px-3 py-1 rounded-full text-sm border transition-colors ${selected
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                            }`}
                        >
                          {brand.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="repairmanProfile.description"
                  value={formData.repairmanProfile.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileInput
                label="Profile Photo"
                name="repairmanProfile.profilePhoto"
                onChange={handleFileChange}
                accept="image/*"
                currentUrl={formData.repairmanProfile.profilePhoto}
              />
              <FileInput
                label="CNIC/Passport"
                name="repairmanProfile.nationalIdOrPassportScan"
                onChange={handleFileChange}
                accept="image/*"
                currentUrl={formData.repairmanProfile.nationalIdOrPassportScan}
              />
              <FileInput
                label="Shop Photo"
                name="repairmanProfile.shopPhoto"
                onChange={handleFileChange}
                accept="image/*"
                currentUrl={formData.repairmanProfile.shopPhoto}
              />
              <FileInput
                label="Utility Bill"
                name="repairmanProfile.utilityBillOrShopProof"
                onChange={handleFileChange}
                accept="image/*"
                currentUrl={formData.repairmanProfile.utilityBillOrShopProof}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
                {(formData.repairmanProfile.certifications || []).filter(Boolean).length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {formData.repairmanProfile.certifications.filter(Boolean).map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Certification ${index + 1}`}
                        className="w-24 h-24 object-cover rounded border border-gray-300"
                      />
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  name="repairmanProfile.certifications"
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          {/* <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-400 flex items-center gap-2"
            >
              {saving && <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div> */}
        </form>
      </div>
    </div>
  );
}

export default RepairmanEditPage;