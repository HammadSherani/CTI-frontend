'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import SmallLoader from '@/components/SmallLoader';
import { toast } from 'react-toastify';

// ─── Reusable Components ─────────────────────────────────────────────────

const SectionCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all mb-6">
    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
      {icon && <Icon icon={icon} className="w-5 h-5 text-primary-600" />}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const InputField = ({ label, name, value, onChange, type = 'text', placeholder, error, required }) => (
  <div className="mb-4">
    <label className="block text-xs font-medium text-gray-600 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
        error
          ? 'border-red-300 focus:ring-red-200 bg-red-50'
          : 'border-gray-200 focus:ring-primary-200 focus:border-primary-500'
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, options, error, required, multiple = false }) => (
  <div className="mb-4">
    <label className="block text-xs font-medium text-gray-600 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      multiple={multiple}
      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
        error
          ? 'border-red-300 focus:ring-red-200 bg-red-50'
          : 'border-gray-200 focus:ring-primary-200 focus:border-primary-500'
      }`}
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options?.map((opt) => (
        <option key={opt.id || opt._id || opt} value={opt.id || opt._id || opt}>
          {opt.name || opt}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const CheckboxField = ({ label, name, checked, onChange }) => (
  <div className="flex items-center mb-4">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
    />
    <label className="ml-3 text-sm font-medium text-gray-700">{label}</label>
  </div>
);

const ImageUploadField = ({ label, name, value, onChange, preview, onRemove, error }) => (
  <div className="mb-4">
    <label className="block text-xs font-medium text-gray-600 mb-2">{label}</label>
    <div className="flex items-center gap-4">
      {preview && (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <Icon icon="heroicons:x-mark" className="w-3 h-3" />
          </button>
        </div>
      )}
      <label className={`flex-1 px-4 py-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${
        preview ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
      }`}>
        <div className="flex items-center justify-center gap-2">
          <Icon icon="heroicons:cloud-arrow-up" className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">Upload Image</span>
        </div>
        <input type="file" name={name} onChange={onChange} className="hidden" accept="image/*" />
      </label>
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder, rows = 4, error, required, maxLength }) => (
  <div className="mb-4">
    <label className="block text-xs font-medium text-gray-600 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
        error
          ? 'border-red-300 focus:ring-red-200 bg-red-50'
          : 'border-gray-200 focus:ring-primary-200 focus:border-primary-500'
      }`}
    />
    <div className="flex justify-between items-center mt-1">
      {error && <p className="text-red-500 text-xs">{error}</p>}
      {maxLength && <p className="text-xs text-gray-400">{value?.length || 0}/{maxLength}</p>}
    </div>
  </div>
);

// ─── Multi-Select Component ──────────────────────────────────────────────

const MultiSelectField = ({ label, name, value = [], onChange, options, error, required }) => {
  const handleToggle = (option) => {
    const newValue = value.includes(option)
      ? value.filter((v) => v !== option)
      : [...value, option];
    onChange({ target: { name, value: newValue } });
  };

  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-600 mb-3">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {options?.map((option) => (
          <label key={option} className="flex items-center p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-primary-50 transition-colors">
            <input
              type="checkbox"
              checked={value.includes(option)}
              onChange={() => handleToggle(option)}
              className="w-4 h-4 text-primary-600"
            />
            <span className="ml-2 text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

function EditProfilePage() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState(null);
  const [errors, setErrors] = useState({});
  const [imageFiles, setImageFiles] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    fullName: '',
    fatherName: '',
    gender: '',
    dob: '',
    nationalIdOrCitizenNumber: '',
    
    // Contact Info
    mobileNumber: '',
    whatsappNumber: '',
    emailAddress: '',
    emergencyContactPerson: '',
    emergencyContactNumber: '',
    
    // Location
    country: '',
    state: '',
    city: '',
    district: '',
    fullAddress: '',
    zipCode: '',
    
    // Shop Info
    shopName: '',
    
    // Professional Info
    yearsOfExperience: '',
    specializations: [],
    brandsWorkedWith: [],
    description: '',
    taxNumber: '',
    pickupService: false,
    
    // Working Hours
    workingHours: { start: '', end: '' },
    workingDays: [],
    
    // Banking
    bankDetails: {
      accountTitle: '',
      accountNumber: '',
      bankName: '',
      branchName: '',
      iban: '',
    }
  });

  const workingDaysOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const specializationOptions = ['Mobile Phone Repair', 'Laptop Repair', 'Tablet Repair', 'Desktop Repair', 'Gaming Console Repair', 'Audio Equipment', 'Smartwatch Repair'];

  // Fetch data
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get('/repairman/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(data.data);
      
      const profile = data.data.user.repairmanProfile;
      const user = data.data.user;
      
      // Set image previews
      const previews = {};
      if (profile.profilePhoto) previews.profilePhoto = profile.profilePhoto;
      if (profile.shopPhoto) previews.shopPhoto = profile.shopPhoto;
      if (profile.nationalIdOrPassportScan) previews.nationalIdOrPassportScan = profile.nationalIdOrPassportScan;
      if (profile.utilityBillOrShopProof) previews.utilityBillOrShopProof = profile.utilityBillOrShopProof;
      setImagePreviews(previews);
      
      // Populate form
      setFormData({
        fullName: profile.fullName || '',
        fatherName: profile.fatherName || '',
        gender: profile.gender || '',
        dob: profile.dob ? profile.dob.split('T')[0] : '',
        nationalIdOrCitizenNumber: profile.nationalIdOrCitizenNumber || '',
        
        mobileNumber: profile.mobileNumber || '',
        whatsappNumber: profile.whatsappNumber || '',
        emailAddress: profile.emailAddress || '',
        emergencyContactPerson: profile.emergencyContactPerson || '',
        emergencyContactNumber: profile.emergencyContactNumber || '',
        
        country: user.country?._id || '',
        state: user.state?._id || '',
        city: user.city?._id || '',
        district: profile.district || '',
        fullAddress: profile.fullAddress || user.address || '',
        zipCode: profile.zipCode || '',
        
        shopName: profile.shopName || '',
        
        yearsOfExperience: profile.yearsOfExperience || '',
        specializations: profile.specializations || [],
        brandsWorkedWith: profile.brandsWorkedWith?.map(b => b._id || b) || [],
        description: profile.description || '',
        taxNumber: profile.taxNumber || '',
        pickupService: profile.pickupService || false,
        
        workingHours: {
          start: profile.workingHours?.start || '',
          end: profile.workingHours?.end || '',
        },
        workingDays: profile.workingDays || [],
        
        bankDetails: {
          accountTitle: profile.bankDetails?.accountTitle || '',
          accountNumber: profile.bankDetails?.accountNumber || '',
          bankName: profile.bankDetails?.bankName || '',
          branchName: profile.bankDetails?.branchName || '',
          iban: profile.bankDetails?.iban || '',
        }
      });
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('bankDetails.')) {
      const field = name.replace('bankDetails.', '');
      setFormData({
        ...formData,
        bankDetails: {
          ...formData.bankDetails,
          [field]: value,
        }
      });
    } else if (name.startsWith('workingHours.')) {
      const field = name.replace('workingHours.', '');
      setFormData({
        ...formData,
        workingHours: {
          ...formData.workingHours,
          [field]: value,
        }
      });
    } else if (type === 'checkbox') {
      setFormData({...formData, [name]: checked});
    } else if (Array.isArray(formData[name])) {
      setFormData({...formData, [name]: value});
    } else {
      setFormData({...formData, [name]: value});
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const { name, files } = e.target;
    if (files?.[0]) {
      setImageFiles({...imageFiles, [name]: files[0]});
      setImagePreviews({...imagePreviews, [name]: URL.createObjectURL(files[0])});
    }
  };

  const removeImage = (name) => {
    setImageFiles({...imageFiles, [name]: null});
    const newPreviews = {...imagePreviews};
    delete newPreviews[name];
    setImagePreviews(newPreviews);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const form = new FormData();
      
      // Add all text fields
      const repairmanProfile = {
        fullName: formData.fullName,
        fatherName: formData.fatherName,
        gender: formData.gender,
        dob: formData.dob,
        nationalIdOrCitizenNumber: formData.nationalIdOrCitizenNumber,
        mobileNumber: formData.mobileNumber,
        whatsappNumber: formData.whatsappNumber,
        emailAddress: formData.emailAddress,
        emergencyContactPerson: formData.emergencyContactPerson,
        emergencyContactNumber: formData.emergencyContactNumber,
        shopName: formData.shopName,
        fullAddress: formData.fullAddress,
        zipCode: formData.zipCode,
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        specializations: formData.specializations,
        brandsWorkedWith: formData.brandsWorkedWith,
        description: formData.description,
        taxNumber: formData.taxNumber,
        pickupService: formData.pickupService,
        workingHours: formData.workingHours,
        workingDays: formData.workingDays,
        bankDetails: formData.bankDetails,
      };
      
      form.append('repairmanProfile', JSON.stringify(repairmanProfile));
      form.append('countryId', formData.country);
      form.append('stateId', formData.state);
      form.append('cityId', formData.city);
      form.append('address', formData.fullAddress);
      form.append('district', formData.district);
      
      // Add image files
      Object.entries(imageFiles).forEach(([key, file]) => {
        if (file) form.append(key, file);
      });
      
      const response = await axiosInstance.put('/repairman/profile', form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        setTimeout(() => router.push('/repair-man/profile'), 1500);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <SmallLoader loading={isLoading} text="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4 font-medium"
          >
            <Icon icon="heroicons:arrow-left" className="w-5 h-5" />
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600 mt-2">Update your profile information and keep your details current</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <SectionCard title="Basic Information" icon="heroicons:user">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required error={errors.fullName} />
              <InputField label="Father Name" name="fatherName" value={formData.fatherName} onChange={handleChange} error={errors.fatherName} />
              <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={['Male', 'Female', 'Other']} />
              <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
              <InputField label="National ID/CNIC" name="nationalIdOrCitizenNumber" value={formData.nationalIdOrCitizenNumber} onChange={handleChange} />
              <InputField label="Tax Number" name="taxNumber" value={formData.taxNumber} onChange={handleChange} required error={errors.taxNumber} />
            </div>
          </SectionCard>

          {/* Contact Information */}
          <SectionCard title="Contact Information" icon="heroicons:phone">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required error={errors.mobileNumber} />
              <InputField label="WhatsApp Number" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} required error={errors.whatsappNumber} />
              <InputField label="Email Address" name="emailAddress" type="email" value={formData.emailAddress} onChange={handleChange} required error={errors.emailAddress} />
              <InputField label="Emergency Contact Person" name="emergencyContactPerson" value={formData.emergencyContactPerson} onChange={handleChange} required error={errors.emergencyContactPerson} />
              <InputField label="Emergency Contact Number" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} required error={errors.emergencyContactNumber} />
            </div>
          </SectionCard>

          {/* Location */}
          <SectionCard title="Location" icon="heroicons:map-pin">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label="Country" name="country" value={formData.country} onChange={handleChange} options={data?.countries || []} required error={errors.country} />
              <SelectField label="State" name="state" value={formData.state} onChange={handleChange} options={data?.states || []} required error={errors.state} />
              <SelectField label="City" name="city" value={formData.city} onChange={handleChange} options={data?.cities || []} required error={errors.city} />
              <InputField label="District" name="district" value={formData.district} onChange={handleChange} error={errors.district} />
              <InputField label="Zip Code" name="zipCode" value={formData.zipCode} onChange={handleChange} required error={errors.zipCode} />
              <InputField label="Full Address" name="fullAddress" value={formData.fullAddress} onChange={handleChange} required error={errors.fullAddress} />
            </div>
          </SectionCard>

          {/* Shop Information */}
          <SectionCard title="Shop Information" icon="heroicons:building-storefront">
            <InputField label="Shop Name" name="shopName" value={formData.shopName} onChange={handleChange} required error={errors.shopName} />
            <TextAreaField label="Shop Description" name="description" value={formData.description} onChange={handleChange} maxLength={500} required error={errors.description} />
            <CheckboxField label="Offer Pickup Service" name="pickupService" checked={formData.pickupService} onChange={handleChange} />
            
            {/* Shop Images */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploadField
                label="Profile Photo"
                name="profilePhoto"
                preview={imagePreviews.profilePhoto}
                onChange={handleImageUpload}
                onRemove={() => removeImage('profilePhoto')}
              />
              <ImageUploadField
                label="Shop Photo"
                name="shopPhoto"
                preview={imagePreviews.shopPhoto}
                onChange={handleImageUpload}
                onRemove={() => removeImage('shopPhoto')}
              />
              <ImageUploadField
                label="National ID/Passport Scan"
                name="nationalIdOrPassportScan"
                preview={imagePreviews.nationalIdOrPassportScan}
                onChange={handleImageUpload}
                onRemove={() => removeImage('nationalIdOrPassportScan')}
              />
              <ImageUploadField
                label="Utility Bill/Shop Proof"
                name="utilityBillOrShopProof"
                preview={imagePreviews.utilityBillOrShopProof}
                onChange={handleImageUpload}
                onRemove={() => removeImage('utilityBillOrShopProof')}
              />
            </div>
          </SectionCard>

          {/* Professional Information */}
          <SectionCard title="Professional Information" icon="heroicons:briefcase">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <InputField label="Years of Experience" name="yearsOfExperience" type="number" value={formData.yearsOfExperience} onChange={handleChange} required error={errors.yearsOfExperience} />
            </div>
            <MultiSelectField
              label="Specializations"
              name="specializations"
              value={formData.specializations}
              onChange={handleChange}
              options={specializationOptions}
              required
              error={errors.specializations}
            />
          </SectionCard>

          {/* Working Schedule */}
          <SectionCard title="Working Schedule" icon="heroicons:calendar-days">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <InputField label="Start Time" name="workingHours.start" type="time" value={formData.workingHours.start} onChange={handleChange} required />
              <InputField label="End Time" name="workingHours.end" type="time" value={formData.workingHours.end} onChange={handleChange} required />
            </div>
            <MultiSelectField
              label="Working Days"
              name="workingDays"
              value={formData.workingDays}
              onChange={handleChange}
              options={workingDaysOptions}
              required
              error={errors.workingDays}
            />
          </SectionCard>

          {/* Banking Details */}
          <SectionCard title="Banking Information" icon="heroicons:banknotes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Account Title" name="bankDetails.accountTitle" value={formData.bankDetails.accountTitle} onChange={handleChange} />
              <InputField label="Account Number" name="bankDetails.accountNumber" value={formData.bankDetails.accountNumber} onChange={handleChange} />
              <InputField label="Bank Name" name="bankDetails.bankName" value={formData.bankDetails.bankName} onChange={handleChange} />
              <InputField label="Branch Name" name="bankDetails.branchName" value={formData.bankDetails.branchName} onChange={handleChange} />
              <InputField label="IBAN" name="bankDetails.iban" value={formData.bankDetails.iban} onChange={handleChange} />
            </div>
          </SectionCard>

          {/* Certifications */}
          <SectionCard title="Certifications & Documents" icon="heroicons:document-check">
            <p className="text-sm text-gray-600 mb-4">Add your certification images here</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((idx) => (
                <ImageUploadField
                  key={`cert-${idx}`}
                  label={`Certification ${idx + 1}`}
                  name={`certification-${idx}`}
                  preview={imagePreviews[`certification-${idx}`]}
                  onChange={handleImageUpload}
                  onRemove={() => removeImage(`certification-${idx}`)}
                />
              ))}
            </div>
          </SectionCard>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving && <Icon icon="eos-icons:loading" className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfilePage;
