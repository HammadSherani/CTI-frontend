"use client";

import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import { produce } from 'immer';

// Input component for reusability
const InputField = ({ label, name, value, onChange, type = 'text', required = false, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      required={required}
      {...props}
    />
  </div>
);

// Select component for reusability
const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
  <div className="flex items-center space-x-3">
    <input
      type="checkbox"
      name={name}
      id={id}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
  </div>
);

function RepairmanEditPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const { token } = useSelector(state => state.auth);
  const { id } = useParams();
  const router = useRouter();

  const initialFormData = useMemo(() => ({
    name: '',
    email: '',
    phone: '',
    status: '',
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
      city: '',
      district: '',
      zipCode: '',
      yearsOfExperience: '',
      specializations: [],
      brandsWorkedWith: [],
      description: '',
      workingDays: [],
      pickupService: false
    }
  }), []);

  const [formData, setFormData] = useState(initialFormData);

  const weekDays = useMemo(() => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], []);
  const genderOptions = useMemo(() => [
    { value: '', label: 'Select Gender' },
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ], []);
  const statusOptions = useMemo(() => ['pending', 'approved', 'rejected'], []);

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
      setFormData(produce(initialFormData, draft => {
        Object.assign(draft, {
          name: repairman.name || '',
          email: repairman.email || '',
          phone: repairman.phone || '',
          status: repairman.status || '',
          isActive: repairman.isActive || false,
          repairmanProfile: {
            ...draft.repairmanProfile,
            ...repairman.repairmanProfile,
            workingHours: {
              start: repairman.repairmanProfile?.workingHours?.start || '',
              end: repairman.repairmanProfile?.workingHours?.end || ''
            },
            dob: repairman.repairmanProfile?.dob ? repairman.repairmanProfile.dob.split('T')[0] : '',
            specializations: repairman.repairmanProfile?.specializations || [],
            brandsWorkedWith: repairman.repairmanProfile?.brandsWorkedWith || [],
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

  const handleBrandsChange = useCallback((value) => {
    const brands = value.split(',').map(s => s.trim()).filter(s => s);
    handleArrayChange('repairmanProfile.brandsWorkedWith', brands);
  }, [handleArrayChange]);

  const handleWorkingDaysChange = useCallback((day) => {
    setFormData(produce(draft => {
      const currentDays = draft.repairmanProfile.workingDays;
      draft.repairmanProfile.workingDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      await axiosInstance.put(`/admin/repairman/${id}`, {
        ...formData,
        repairmanProfile: {
          ...formData.repairmanProfile,
          dob: formData.repairmanProfile.dob ? new Date(formData.repairmanProfile.dob).toISOString() : null
        }
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert('Repairman updated successfully!');
      router.push(`/admin/repairman/${id}`);
    } catch (error) {
      handleError(error);
      alert('Failed to update repairman');
    } finally {
      setSaving(false);
    }
  }, [formData, id, token, router, validateForm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon icon="mdi:alert-circle" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">No Data Found</h2>
          <p className="text-gray-600">Unable to load repairman profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Repairman Profile</h1>
            <p className="text-gray-600 mt-1">Update repairman information and settings</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <Icon icon="mdi:arrow-left" className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Icon icon="mdi:account-settings" className="w-6 h-6 mr-2 text-blue-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Name" name="name" value={formData.name} onChange={handleInputChange} required error={errors.name} />
              <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} required error={errors.email} />
              <InputField label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required error={errors.phone} />
              <SelectField label="Status" name="status" value={formData.status} onChange={handleInputChange} options={statusOptions} />
              <CheckboxField label="Active Status" name="isActive" id="isActive" checked={formData.isActive} onChange={handleInputChange} />
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Icon icon="mdi:account" className="w-6 h-6 mr-2 text-green-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Full Name" name="repairmanProfile.fullName" value={formData.repairmanProfile.fullName} onChange={handleInputChange} />
              <InputField label="Father's Name" name="repairmanProfile.fatherName" value={formData.repairmanProfile.fatherName} onChange={handleInputChange} />
              <InputField label="National ID/CNIC" name="repairmanProfile.nationalIdOrCitizenNumber" value={formData.repairmanProfile.nationalIdOrCitizenNumber} onChange={handleInputChange} />
              <InputField label="Date of Birth" name="repairmanProfile.dob" type="date" value={formData.repairmanProfile.dob} onChange={handleInputChange} />
              <SelectField label="Gender" name="repairmanProfile.gender" value={formData.repairmanProfile.gender} onChange={handleInputChange} options={genderOptions} />
              <InputField label="Email Address" name="repairmanProfile.emailAddress" type="email" value={formData.repairmanProfile.emailAddress} onChange={handleInputChange} />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Icon icon="mdi:phone" className="w-6 h-6 mr-2 text-purple-600" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Mobile Number" name="repairmanProfile.mobileNumber" type="tel" value={formData.repairmanProfile.mobileNumber} onChange={handleInputChange} />
              <InputField label="WhatsApp Number" name="repairmanProfile.whatsappNumber" type="tel" value={formData.repairmanProfile.whatsappNumber} onChange={handleInputChange} />
              <InputField label="Emergency Contact Person" name="repairmanProfile.emergencyContactPerson" value={formData.repairmanProfile.emergencyContactPerson} onChange={handleInputChange} />
              <InputField label="Emergency Contact Number" name="repairmanProfile.emergencyContactNumber" type="tel" value={formData.repairmanProfile.emergencyContactNumber} onChange={handleInputChange} />
            </div>
          </div>

          {/* Shop Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Icon icon="mdi:store" className="w-6 h-6 mr-2 text-orange-600" />
              Shop Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Shop Name" name="repairmanProfile.shopName" value={formData.repairmanProfile.shopName} onChange={handleInputChange} />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                <textarea
                  name="repairmanProfile.fullAddress"
                  value={formData.repairmanProfile.fullAddress}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <InputField label="City" name="repairmanProfile.city" value={formData.repairmanProfile.city} onChange={handleInputChange} />
              <InputField label="District" name="repairmanProfile.district" value={formData.repairmanProfile.district} onChange={handleInputChange} />
              <InputField label="Zip Code" name="repairmanProfile.zipCode" value={formData.repairmanProfile.zipCode} onChange={handleInputChange} />
            </div>
          </div>

          {/* Working Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Icon icon="mdi:clock" className="w-6 h-6 mr-2 text-indigo-600" />
              Working Information
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Start Time" name="repairmanProfile.workingHours.start" type="time" value={formData.repairmanProfile.workingHours.start} onChange={handleInputChange} />
                <InputField label="End Time" name="repairmanProfile.workingHours.end" type="time" value={formData.repairmanProfile.workingHours.end} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Working Days</label>
                <div className="flex flex-wrap gap-3">
                  {weekDays.map(day => (
                    <label key={day} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.repairmanProfile.workingDays.includes(day)}
                        onChange={() => handleWorkingDaysChange(day)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              <CheckboxField
                label="Pickup Service Available"
                name="repairmanProfile.pickupService"
                id="pickupService"
                checked={formData.repairmanProfile.pickupService}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Icon icon="mdi:trophy" className="w-6 h-6 mr-2 text-yellow-600" />
              Professional Information
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Years of Experience"
                  name="repairmanProfile.yearsOfExperience"
                  type="number"
                  value={formData.repairmanProfile.yearsOfExperience}
                  onChange={handleInputChange}
                  min="0"
                />
                <InputField
                  label="Specializations"
                  value={formData.repairmanProfile.specializations.join(', ')}
                  onChange={(e) => handleSpecializationChange(e.target.value)}
                  placeholder="e.g., iPhone, Samsung, Android"
                />
                <InputField
                  label="Brands Worked With"
                  value={formData.repairmanProfile.brandsWorkedWith.join(', ')}
                  onChange={(e) => handleBrandsChange(e.target.value)}
                  placeholder="e.g., Apple, Samsung, Huawei"
                  className="md:col-span-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="repairmanProfile.description"
                  value={formData.repairmanProfile.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description about services and expertise..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center space-x-2 ${saving ? 'opacity-50' : ''}`}
            >
              {saving && <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RepairmanEditPage;