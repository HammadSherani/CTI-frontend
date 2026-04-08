'use client';

import React, { useState, useEffect ,useCallback} from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import SmallLoader from '@/components/SmallLoader';
import { toast } from 'react-toastify';
import { useSearchParams } from 'next/navigation';

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

// ─── Tag Input Component (for Specializations) ──────────────────────────────

const TagInputField = ({ label, name, value = [], onChange, options, error, required }) => {
  const [inputValue, setInputValue] = useState('');

 // TagInputField component mein — event format hatao, seedha array bhejo
const handleAddTag = () => {
  if (inputValue.trim() && !value.includes(inputValue.trim())) {
    onChange([...value, inputValue.trim()]); // ✅ seedha array
    setInputValue('');
  }
};

const handleRemoveTag = (tag) => {
  onChange(value.filter((v) => v !== tag)); // ✅ seedha array
};


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-600 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type specialization and press Enter"
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
        />
        <button
          type="button"
          onClick={handleAddTag}
          className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          Add
        </button>
      </div>
      {/* Display suggestions */}
      {inputValue && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {options?.filter((opt) => opt.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(opt)).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange({ target: { name, value: [...value, opt] } });
                  setInputValue('');
                }}
                className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs text-gray-600 hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Display tags */}
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="text-primary-600 hover:text-primary-800 ml-1"
            >
              <Icon icon="heroicons:x-mark" className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

// ─── Education/Experience Modal ────────────────────────────────────────────

const EntryModal = ({ isOpen, type, onClose, onSave, entry }) => {
  const [formState, setFormState] = useState(entry || {});

  useEffect(() => {
    if (entry) {
      setFormState(entry);
    } else {
      setFormState({});
    }
  }, [entry, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState({...formState, [name]: value});
  };

  if (!isOpen) return null;

  const isEducation = type === 'education';
  const title = isEducation ? 'Add Education' : 'Add Experience';
  const institutionLabel = isEducation ? 'Institution' : 'Company Name';
  const institutionField = isEducation ? 'institution' : 'companyName';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <Icon icon="heroicons:x-mark" className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <InputField
            label="Title"
            name="title"
            value={formState.title || ''}
            onChange={handleChange}
            placeholder={isEducation ? "e.g., Bachelor of Science" : "e.g., Lead Technician"}
            required
          />
          <InputField
            label={institutionLabel}
            name={institutionField}
            value={formState[institutionField] || ''}
            onChange={handleChange}
            placeholder={isEducation ? "e.g., Pakistan Technical University" : "e.g., TechFix Solutions"}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Start Year"
              name="startYear"
              type="number"
              value={formState.startYear || ''}
              onChange={handleChange}
              placeholder="2020"
            />
            <InputField
              label="End Year"
              name="endYear"
              type="number"
              value={formState.endYear || ''}
              onChange={handleChange}
              placeholder="2024"
            />
          </div>
          <TextAreaField
            label="Description"
            name="description"
            value={formState.description || ''}
            onChange={handleChange}
            rows={3}
            placeholder={isEducation ? "Describe your major, achievements, etc." : "Describe your roles, achievements, etc."}
          />
          <div className="pt-4 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (formState.title && formState[institutionField] && formState.startYear) {
                  onSave(formState);
                } else {
                  alert('Please fill in all required fields');
                }
              }}
              className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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

// ─── Certificate/License Modal ────────────────────────────────────────────

const CertificationsLicenseModal = ({ isOpen, onClose, onSave, initialData, isSaving, pendingUploads = [] }) => {
  const [form, setForm] = useState({ title: '' });
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setForm({ title: initialData?.title || '' });
      const existing = Array.isArray(initialData?.images)
        ? initialData.images
            .filter((src) => typeof src === 'string' && src && /^https?:\/\//i.test(src))
            .map((src) => ({ preview: src, file: null, isExisting: true }))
        : [];
      const pending = Array.isArray(pendingUploads)
        ? pendingUploads
            .filter((u) => u?.file instanceof File && typeof u?.preview === 'string' && u.preview)
            .map((u) => ({ preview: u.preview, file: u.file, isExisting: false }))
        : [];

      setImages([...existing, ...pending]);
    }
  }, [initialData, isOpen, pendingUploads]);

  if (!isOpen) return null;
  
  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const preview = URL.createObjectURL(file);
      setImages((prev) => [...prev, { preview, file, isExisting: false }]);
    });
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const toRemove = prev[index];
      if (toRemove && !toRemove.isExisting && typeof toRemove.preview === 'string' && toRemove.preview.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(toRemove.preview);
        } catch (_) {
          // ignore
        }
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSaveClick = () => {
    if (form.title.trim()) {
      const previews = images.map((img) => img.preview);
      const newItems = images
        .filter((img) => !img.isExisting && img.file instanceof File)
        .map((img) => ({ file: img.file, preview: img.preview }));
      onSave(form, newItems, previews);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Icon icon="heroicons:academic-cap" className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{initialData ? 'Edit Certificate/License' : 'Add Certificate/License'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Icon icon="heroicons:x-mark" className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Certificate/License Title *</label>
            <input 
              type="text" 
              value={form.title} 
              onChange={(e) => setField('title', e.target.value)} 
              placeholder="e.g. CompTIA A+ Certified" 
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" 
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Certificate Images</label>
            <div className="space-y-3">
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img.preview} alt="Preview" className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(i)} 
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Icon icon="heroicons:x-mark" className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center gap-4 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all">
                <div className="flex items-center justify-center gap-2">
                  <Icon icon="heroicons:cloud-arrow-up" className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Upload Images</span>
                </div>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, max 5MB each (multiple allowed)</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveClick} 
            disabled={isSaving || !form.title.trim() || images.length === 0} 
            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving && <Icon icon="eos-icons:loading" className="w-4 h-4 animate-spin" />}
            {initialData ? 'Save Changes' : 'Add Certificate'}
          </button>
        </div>
      </div>
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
  const [educationModal, setEducationModal] = useState(false);
  const [experienceModal, setExperienceModal] = useState(false);
  const [certificationsLicenseModal, setCertificationsLicenseModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(null);
  const [certLicenseUploads, setCertLicenseUploads] = useState([]);
  const [initialFormData, setInitialFormData] = useState(null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
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
    },
    
    // Education & Experience
    education: [],
    experience: [],
    certifications: [],
    certificationsLicense: [],
  });

  const workingDaysOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const specializationOptions = ['Mobile Phone Repair', 'Laptop Repair', 'Tablet Repair', 'Desktop Repair', 'Gaming Console Repair', 'Audio Equipment', 'Smartwatch Repair'];

  // Fetch data
  useEffect(() => {
    fetchProfileData();
    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (formData.country) {
      fetchStates(formData.country);
    } else {
      setStates([]);
      setCities([]);
    }
  }, [formData.country]);

  // Fetch cities when state changes
  useEffect(() => {
    if (formData.state) {
      fetchCities(formData.state);
    } else {
      setCities([]);
    }
  }, [formData.state]);

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
      if (profile.certifications) previews.certifications = profile.certifications;
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
        },
        
        education: profile.education || [],
        experience: profile.experience || [],
        certifications: profile.certifications || [],
        certificationsLicense: profile.certificationsLicense || []
      });
      
      // Save initial state for change detection
      setInitialFormData({
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
        },
        education: profile.education || [],
        experience: profile.experience || [],
        certifications: profile.certifications || [],
        certificationsLicense: profile.certificationsLicense || []
      });
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };
 const fetchCountries = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/public/countries');
      setCountries(res.data.data || []);
    } catch (err) {
      console.error('Failed to load countries', err);
    }
  }, []);

  // Fetch States by Country
  const fetchStates = useCallback(async (countryId) => {
    if (!countryId) {
      setStates([]);
      return;
    }
    try {
      const res = await axiosInstance.get(`/public/states/country/${countryId}`);
      setStates(res.data.data || []);
    } catch (err) {
      console.error('Failed to load states', err);
      setStates([]);
    }
  }, []);

  // Fetch Cities by State
  const fetchCities = useCallback(async (stateId) => {
    if (!stateId) {
      setCities([]);
      return;
    }
    try {
      const res = await axiosInstance.get(`/public/cities/state/${stateId}`);
      setCities(res.data.data || []);
    } catch (err) {
      console.error('Failed to load cities', err);
      setCities([]);
    }
  }, []);

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

  // Education & Experience Handlers
  const handleEducationSave = (entry) => {
    if (selectedEntryIndex !== null) {
      const updated = [...formData.education];
      updated[selectedEntryIndex] = entry;
      setFormData({...formData, education: updated});
    } else {
      setFormData({...formData, education: [...formData.education, entry]});
    }
    setEducationModal(false);
    setSelectedEntry(null);
    setSelectedEntryIndex(null);
  };

  const handleEducationDelete = (index) => {
    setFormData({...formData, education: formData.education.filter((_, i) => i !== index)});
  };

  const handleExperienceSave = (entry) => {
    if (selectedEntryIndex !== null) {
      const updated = [...formData.experience];
      updated[selectedEntryIndex] = entry;
      setFormData({...formData, experience: updated});
    } else {
      setFormData({...formData, experience: [...formData.experience, entry]});
    }
    setExperienceModal(false);
    setSelectedEntry(null);
    setSelectedEntryIndex(null);
  };

  const handleExperienceDelete = (index) => {
    setFormData({...formData, experience: formData.experience.filter((_, i) => i !== index)});
  };

  const handleCertificationUpload = (e) => {
    const { files } = e.target;
    if (files) {
      const newCerts = [...(formData.certifications || [])];
      for (let file of files) {
        setImageFiles({...imageFiles, [`cert-${Date.now()}`]: file});
        setImagePreviews({...imagePreviews, [`cert-${Date.now()}`]: URL.createObjectURL(file)});
        newCerts.push(URL.createObjectURL(file));
      }
      setFormData({...formData, certifications: newCerts});
    }
  };

const handleCertLicenseSave = (form, newItems, previews) => {
  const targetIndex = selectedEntryIndex !== null ? selectedEntryIndex : formData.certificationsLicense.length;

  if (selectedEntryIndex !== null) {
    const updated = [...formData.certificationsLicense];
    updated[selectedEntryIndex] = {
      title: form.title,
      images: previews,
    };
    setFormData({ ...formData, certificationsLicense: updated });
  } else {
    setFormData({
      ...formData,
      certificationsLicense: [
        ...formData.certificationsLicense,
        { title: form.title, images: previews },
      ],
    });
  }

  setCertLicenseUploads((prev) => {
    const keepOther = prev.filter((u) => u.certIndex !== targetIndex);
    const next = (newItems || [])
      .filter((it) => it?.file instanceof File)
      .map((it) => ({ certIndex: targetIndex, file: it.file, preview: it.preview }));
    return [...keepOther, ...next];
  });

  setCertificationsLicenseModal(false);
  setSelectedEntry(null);
  setSelectedEntryIndex(null);
};

  const handleCertLicenseDelete = (index) => {
    setFormData({...formData, certificationsLicense: formData.certificationsLicense.filter((_, i) => i !== index)});
    setCertLicenseUploads((prev) =>
      prev
        .filter((u) => u.certIndex !== index)
        .map((u) => (u.certIndex > index ? { ...u, certIndex: u.certIndex - 1 } : u))
    );
  };

  // Submit form
 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSaving(true);

  try {
    const form = new FormData();

    const repairmanProfile = {};

    const fieldsToCheck = [
      'fullName', 'fatherName', 'gender', 'dob', 'nationalIdOrCitizenNumber',
      'mobileNumber', 'whatsappNumber', 'emailAddress', 'emergencyContactPerson',
      'emergencyContactNumber', 'shopName', 'fullAddress', 'zipCode', 'taxNumber',
      'specializations', 'brandsWorkedWith', 'description',
      'pickupService', 'workingDays', 'education', 'experience'
    ];

    fieldsToCheck.forEach(field => {
      if (JSON.stringify(formData[field]) !== JSON.stringify(initialFormData?.[field])) {
        repairmanProfile[field] = formData[field];
      }
    });

    if (formData.yearsOfExperience !== initialFormData?.yearsOfExperience) {
      repairmanProfile.yearsOfExperience = parseInt(formData.yearsOfExperience) || 0;
    }

    if (JSON.stringify(formData.workingHours) !== JSON.stringify(initialFormData?.workingHours)) {
      repairmanProfile.workingHours = formData.workingHours;
    }

    if (JSON.stringify(formData.bankDetails) !== JSON.stringify(initialFormData?.bankDetails)) {
      repairmanProfile.bankDetails = formData.bankDetails;
    }

    // ──────── CERTIFICATIONS LICENSE ────────
    const cleanCertificationsLicense = (formData.certificationsLicense || []).map((cert) => ({
      title: cert.title,
      images: (cert.images || []).filter(
        (img) => typeof img === 'string' && img && /^https?:\/\//i.test(img)
      ),
    }));

    if (JSON.stringify(cleanCertificationsLicense) !== JSON.stringify(initialFormData?.certificationsLicense)) {
      repairmanProfile.certificationsLicense = cleanCertificationsLicense;
    }

    form.append('repairmanProfile', JSON.stringify(repairmanProfile));

    // Location fields
    if (formData.country !== initialFormData?.country) form.append('countryId', formData.country);
    if (formData.state !== initialFormData?.state) form.append('stateId', formData.state);
    if (formData.city !== initialFormData?.city) form.append('cityId', formData.city);
    if (formData.fullAddress !== initialFormData?.fullAddress) form.append('address', formData.fullAddress);
    if (formData.district !== initialFormData?.district) form.append('district', formData.district);

    // Regular images (profilePhoto, shopPhoto, etc.)
    Object.entries(imageFiles).forEach(([key, file]) => {
      if (file && file instanceof File) {
        form.append(key, file);
      }
    });

    // ──────── CERTIFICATIONS LICENSE IMAGES (Binary upload + index mapping) ────────
    if (certLicenseUploads.length > 0) {
      const indexes = [];
      certLicenseUploads.forEach((u) => {
        if (u?.file instanceof File && Number.isInteger(u.certIndex)) {
          form.append('certificationsLicense', u.file);
          indexes.push(u.certIndex);
        }
      });
      if (indexes.length > 0) {
        form.append('certificationsLicenseIndexes', JSON.stringify(indexes));
      }
    }

    const response = await axiosInstance.put('/repairman/profile', form, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      toast.success('Profile updated successfully!');
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
              <SelectField label="Country" name="country" value={formData.country} onChange={handleChange} options={countries} required error={errors.country} />
              <SelectField label="State" name="state" value={formData.state} onChange={handleChange} options={states} required error={errors.state} />
              <SelectField label="City" name="city" value={formData.city} onChange={handleChange} options={cities} required error={errors.city} />
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
            <TagInputField
              label="Specializations"
              name="specializations"
              value={formData.specializations}
onChange={(tags) => setFormData({...formData, specializations: tags})} // ✅ yeh sahi hai ab
              suggestions={specializationOptions}
              required
              error={errors.specializations}
            />
          </SectionCard>

          {/* Education */}
          <SectionCard title="Education" icon="heroicons:academic-cap">
            <div className="mb-6">
              <button
                type="button"
                onClick={() => {
                  setSelectedEntry(null);
                  setSelectedEntryIndex(null);
                  setEducationModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors font-medium"
              >
                <Icon icon="heroicons:plus" className="w-5 h-5" />
                Add Education
              </button>
            </div>
            
            {formData.education.length > 0 ? (
              <div className="space-y-4">
                {formData.education.map((edu, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{edu.title || 'Untitled'}</h4>
                        <p className="text-sm text-gray-600 mt-1">{edu.institution}</p>
                        <p className="text-xs text-gray-500 mt-1">{edu.startYear} - {edu.endYear}</p>
                        {edu.description && <p className="text-sm text-gray-600 mt-2">{edu.description}</p>}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEntry(edu);
                            setSelectedEntryIndex(index);
                            setEducationModal(true);
                          }}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                        >
                          <Icon icon="heroicons:pencil-square" className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEducationDelete(index)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
                        >
                          <Icon icon="heroicons:trash" className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No education added yet</p>
            )}
            
            {educationModal && (
              <EntryModal
                type="education"
                entry={selectedEntry}
                isOpen={educationModal}
                onClose={() => {
                  setEducationModal(false);
                  setSelectedEntry(null);
                  setSelectedEntryIndex(null);
                }}
                onSave={handleEducationSave}
              />
            )}
          </SectionCard>

          {/* Experience */}
          <SectionCard title="Experience" icon="heroicons:briefcase">
            <div className="mb-6">
              <button
                type="button"
                onClick={() => {
                  setSelectedEntry(null);
                  setSelectedEntryIndex(null);
                  setExperienceModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors font-medium"
              >
                <Icon icon="heroicons:plus" className="w-5 h-5" />
                Add Experience
              </button>
            </div>
            
            {formData.experience.length > 0 ? (
              <div className="space-y-4">
                {formData.experience.map((exp, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{exp.title || 'Untitled'}</h4>
                        <p className="text-sm text-gray-600 mt-1">{exp.companyName}</p>
                        <p className="text-xs text-gray-500 mt-1">{exp.startYear} - {exp.endYear}</p>
                        {exp.description && <p className="text-sm text-gray-600 mt-2">{exp.description}</p>}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEntry(exp);
                            setSelectedEntryIndex(index);
                            setExperienceModal(true);
                          }}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                        >
                          <Icon icon="heroicons:pencil-square" className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExperienceDelete(index)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
                        >
                          <Icon icon="heroicons:trash" className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No experience added yet</p>
            )}
            
            {experienceModal && (
              <EntryModal
                type="experience"
                entry={selectedEntry}
                isOpen={experienceModal}
                onClose={() => {
                  setExperienceModal(false);
                  setSelectedEntry(null);
                  setSelectedEntryIndex(null);
                }}
                onSave={handleExperienceSave}
              />
            )}
          </SectionCard>

          {/* Certifications & Licenses */}
          <SectionCard title="Certifications & Licenses" icon="heroicons:academic-cap">
            <div className="mb-6">
              <button
                type="button"
                onClick={() => {
                  setSelectedEntry(null);
                  setSelectedEntryIndex(null);
                  setCertificationsLicenseModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors font-medium"
              >
                <Icon icon="heroicons:plus" className="w-5 h-5" />
                Add Certificate/License
              </button>
            </div>
            
            {formData.certificationsLicense.length > 0 ? (
              <div className={formData.certificationsLicense.length === 1 ? 'flex justify-center' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'}>
                {formData.certificationsLicense.map((cert, index) => (
                  <div key={index} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-300 transition-all">
                    {/* Image Container */}
                    {cert.images && cert.images.length > 0 && (
                      <div className={`relative bg-gray-100 overflow-hidden ${
                        cert.images.length === 1 
                          ? 'w-full h-64' 
                          : 'w-full h-48'
                      }`}>
                        <img 
                          src={cert.images[0]} 
                          alt={cert.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Icon icon="heroicons:eye" className="w-6 h-6 text-white" />
                        </div>
                        {cert.images.length > 1 && (
                          <div className="absolute top-2 right-2 bg-primary-600 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                            +{cert.images.length - 1}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Content Container */}
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-3">{cert.title}</h4>
                      
                      {/* Additional Images (if multiple) */}
                      {cert.images && cert.images.length > 1 && (
                        <div className="mb-3 grid grid-cols-4 gap-1">
                          {cert.images.slice(1, 5).map((img, imgIdx) => (
                            <div 
                              key={imgIdx} 
                              className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                            >
                              <img src={img} alt={`${cert.title} ${imgIdx + 2}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedEntry(cert);
                            setSelectedEntryIndex(index);
                            setCertificationsLicenseModal(true);
                          }}
                          className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                          title="Edit"
                        >
                          <Icon icon="heroicons:pencil-square" className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleCertLicenseDelete(index)}
                          className="flex-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                          title="Delete"
                        >
                          <Icon icon="heroicons:trash" className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon icon="heroicons:academic-cap" className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No certificates or licenses added yet</p>
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedEntry(null);
                    setSelectedEntryIndex(null);
                    setCertificationsLicenseModal(true);
                  }}
                  className="mt-3 text-primary-600 text-sm font-medium hover:underline"
                >
                  + Add your first certificate
                </button>
              </div>
            )}
            
            {certificationsLicenseModal && (
              <CertificationsLicenseModal
                isOpen={certificationsLicenseModal}
                onClose={() => {
                  setCertificationsLicenseModal(false);
                  setSelectedEntry(null);
                  setSelectedEntryIndex(null);
                }}
                onSave={handleCertLicenseSave}
                initialData={selectedEntry}
                pendingUploads={
                  selectedEntryIndex !== null
                    ? certLicenseUploads.filter((u) => u.certIndex === selectedEntryIndex)
                    : []
                }
                isSaving={false}
              />
            )}
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
