"use client"

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import handleError from '@/helper/handleError';
import axiosInstance from '@/config/axiosInstance';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import SmallLoader from '@/components/SmallLoader';

// ─── Small reusable components ───────────────────────────────────────────────

const StatCard = ({ icon, label, value, bgColor = "bg-primary-50", iconColor = "text-primary-600" }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
    <div className="flex items-center gap-3">
      <div className={`${bgColor} p-3 rounded-xl`}>
        <Icon icon={icon} className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value || 'N/A'}</p>
      </div>
    </div>
  </div>
);

const SectionCard = ({ title, icon, children, action }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon && <Icon icon={icon} className="w-5 h-5 text-primary-600" />}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {action && action}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const InfoRow = ({ icon, label, value, isVerified }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
    <div className={`p-2 rounded-lg ${value ? 'bg-primary-50' : 'bg-gray-100'}`}>
      <Icon icon={icon} className={`w-4 h-4 ${value ? 'text-primary-600' : 'text-gray-400'}`} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-gray-900">{value || 'Not provided'}</p>
        {isVerified && value && (
          <Icon icon="heroicons:check-badge-20-solid" className="w-4 h-4 text-green-500" />
        )}
      </div>
    </div>
  </div>
);

const Badge = ({ children, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    info: 'bg-primary-50 text-primary-700 border-primary-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    default: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
};


const SafeImage = ({ src, alt, className, width = 80, height = 80, onImageClick }) => {
  if (!src) return null;
  return (
    <div className="mt-3 cursor-pointer group relative" onClick={() => onImageClick?.(src)}>
      <Image
        src={src}
        alt={alt || 'image'}
        width={width}
        height={height}
        className={`${className || 'w-20 h-20 object-cover rounded-lg border border-gray-200'} group-hover:opacity-80 transition-opacity`}
        unoptimized
      />
      <div className="absolute inset-0 rounded-lg flex items-center justify-center bg-black/0 group-hover:bg-black/30 w-20 transition-all opacity-0 group-hover:opacity-100">
        <Icon icon="heroicons:eye" className="w-5 h-5 text-white" />
      </div>
    </div>
  );
};

// ─── Image Preview Modal ──────────────────────────────────────────────────────

const ImagePreviewModal = ({ isOpen, imageSrc, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0  bg-black/90 z-50 flex items-start justify-center p-4 " onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
        >
          <Icon icon="heroicons:x-mark" className="w-6 h-6" />
        </button>
        <img
          src={imageSrc}
          alt="Preview"
          className="w-full h-[550px] mt-4 object-contain rounded-lg"
        />
      </div>
    </div>
  );
};

// ─── Education Modal ──────────────────────────────────────────────────────────

const EducationModal = ({ isOpen, onClose, onSave, initialData, isSaving }) => {
  const [form, setForm] = useState({ title: 'Bachelors in Software Engineering', institution: 'University of Karachi', startYear: '2018', endYear: '2022', description: 'I successfully completed my degree in Software Engineering' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setForm({
        title: initialData?.title || 'Bachelors in Software Engineering',
        institution: initialData?.institution || 'University of Karachi',
        startYear: initialData?.startYear || '2018',
        endYear: initialData?.endYear || '2022',
        description: initialData?.description || 'I successfully completed my degree in Software Engineering',
      });
      setImagePreview(initialData?.educationImage || null);
      setImageFile(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;
  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Icon icon="heroicons:academic-cap" className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{initialData ? 'Edit Education' : 'Add Education'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Icon icon="heroicons:x-mark" className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Degree / Title *</label>
            <input type="text" value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="e.g. Diploma in Electronics Repair" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Institution *</label>
            <input type="text" value={form.institution} onChange={(e) => setField('institution', e.target.value)} placeholder="e.g. Technical Institute Karachi" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Start Year</label>
              <input type="number" value={form.startYear} onChange={(e) => setField('startYear', e.target.value)} placeholder="2018" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">End Year <span className="text-gray-400 font-normal">(blank = Present)</span></label>
              <input type="number" value={form.endYear} onChange={(e) => setField('endYear', e.target.value)} placeholder="2021" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} rows={3} placeholder="Describe your education..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Certificate Image</label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                  <button type="button" onClick={() => { setImagePreview(null); setImageFile(null); }} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                    <Icon icon="heroicons:x-mark" className="w-3 h-3" />
                  </button>
                </div>
              )}
              <label className={`flex-1 px-4 py-2 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all ${imagePreview ? 'border-primary-400 bg-primary-50' : 'border-gray-300'}`}>
                <div className="flex items-center justify-center gap-2">
                  <Icon icon="heroicons:cloud-arrow-up" className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{imageFile ? 'Change Image' : 'Upload Image'}</span>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, max 5MB</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
          <button onClick={() => onSave(form, imageFile)} disabled={isSaving || !form.title || !form.institution} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {isSaving && <Icon icon="eos-icons:loading" className="w-4 h-4 animate-spin" />}
            {initialData ? 'Save Changes' : 'Add Education'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Experience Modal ─────────────────────────────────────────────────────────

const ExperienceModal = ({ isOpen, onClose, onSave, initialData, isSaving }) => {
  const [form, setForm] = useState({ 
    title: 'Mobile Repair Specialist', 
    companyName: 'Click To Integrate', 
    startYear: '2024', 
    endYear: '', 
    description: '', 
    bullets: '',
    useBulletPoints: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Safely handle bullets data - ensure it's always a string for the textarea
      let bulletsValue = '';
      let useBulletPointsValue = true;
      
      if (initialData) {
        // Check if bullets exists and is an array
        if (initialData.bullets && Array.isArray(initialData.bullets)) {
          bulletsValue = initialData.bullets.join('\n');
          useBulletPointsValue = true;
        } 
        // Check if bullets exists as a string
        else if (initialData.bullets && typeof initialData.bullets === 'string') {
          bulletsValue = initialData.bullets;
          useBulletPointsValue = true;
        }
        // Check if description exists
        else if (initialData.description && initialData.description.trim() !== '') {
          bulletsValue = '';
          useBulletPointsValue = false;
        }
      }
      
      setForm({
        title: initialData?.title || 'Mobile Repair Specialist',
        companyName: initialData?.companyName || 'Click To Integrate',
        startYear: initialData?.startYear || '2024',
        endYear: initialData?.endYear || '',
        description: initialData?.description || 'I am working as a mobile repair specialist at Click To Integrate since 2024',
        bullets: bulletsValue,
        useBulletPoints: useBulletPointsValue
      });
      setImagePreview(initialData?.experienceImage || null);
      setImageFile(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;
  
  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSaveClick = () => {
    onSave(form, imageFile);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Icon icon="heroicons:briefcase" className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{initialData ? 'Edit Experience' : 'Add Experience'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Icon icon="heroicons:x-mark" className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Job Title *</label>
            <input 
              type="text" 
              value={form.title} 
              onChange={(e) => setField('title', e.target.value)} 
              placeholder="e.g. Mobile Repair Technician" 
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" 
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Company / Shop Name *</label>
            <input 
              type="text" 
              value={form.companyName} 
              onChange={(e) => setField('companyName', e.target.value)} 
              placeholder="e.g. Cti Mobile Repair" 
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Start Year</label>
              <input 
                type="number" 
                value={form.startYear} 
                onChange={(e) => setField('startYear', e.target.value)} 
                placeholder="2021" 
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">End Year <span className="text-gray-400 font-normal">(blank = Present)</span></label>
              <input 
                type="number" 
                value={form.endYear} 
                onChange={(e) => setField('endYear', e.target.value)} 
                placeholder="2023" 
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" 
              />
            </div>
          </div>


        
      
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
              <textarea 
                value={form.description} 
                onChange={(e) => setField('description', e.target.value)} 
                rows={4} 
                placeholder="Write a detailed description of your role and responsibilities..." 
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all resize-none" 
              />
              <p className="text-xs text-gray-400 mt-1">Write a complete description of your experience</p>
            </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Work Certificate / Image</label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                  <button 
                    type="button" 
                    onClick={() => { setImagePreview(null); setImageFile(null); }} 
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Icon icon="heroicons:x-mark" className="w-3 h-3" />
                  </button>
                </div>
              )}
              <label className={`flex-1 px-4 py-2 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all ${imagePreview ? 'border-primary-400 bg-primary-50' : 'border-gray-300'}`}>
                <div className="flex items-center justify-center gap-2">
                  <Icon icon="heroicons:cloud-arrow-up" className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{imageFile ? 'Change Image' : 'Upload Image'}</span>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, max 5MB</p>
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
            disabled={isSaving || !form.title || !form.companyName || !form.description.trim() || !imagePreview} 
            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving && <Icon icon="eos-icons:loading" className="w-4 h-4 animate-spin" />}
            {initialData ? 'Save Changes' : 'Add Experience'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CertificationsLicenseModal = ({ isOpen, onClose, onSave, initialData, isSaving }) => {
  const [form, setForm] = useState({ title: '' });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setForm({ title: initialData?.title || '' });
      setImagePreviews(initialData?.images || []);
      setImageFiles([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;
  
  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.filter(file => !imageFiles.some(f => f.name === file.name));
    setImageFiles(prev => [...prev, ...newFiles]);
    
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreviews(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (index < imageFiles.length) {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSaveClick = () => {
    if (form.title.trim()) {
      onSave(form, imageFiles, imagePreviews);
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
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative group">
                      <img src={preview} alt="Preview" className="w-full h-20 object-cover rounded-lg border border-gray-200" />
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
            disabled={isSaving || !form.title.trim() || imagePreviews.length === 0} 
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

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

const DeleteModal = ({ isOpen, onClose, onConfirm, itemName, isDeleting }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="heroicons:trash" className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Item</h3>
          <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <span className="font-medium text-gray-800">"{itemName}"</span>? This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={onConfirm} disabled={isDeleting} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {isDeleting && <Icon icon="eos-icons:loading" className="w-4 h-4 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Education Section ────────────────────────────────────────────────────────

const EducationSection = ({ education = [], onUpdate, token, onImageClick }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, index: null, name: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openAdd = () => { setEditItem(null); setEditIndex(null); setModalOpen(true); };
  const openEdit = (item, index) => { setEditItem(item); setEditIndex(index); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditItem(null); setEditIndex(null); };

  const handleSave = async (form, imageFile) => {
    setIsSaving(true);
    try {
      const formData = new FormData();

      const newItem = {
        title: form.title,
        institution: form.institution,
        startYear: form.startYear ? parseInt(form.startYear) : undefined,
        endYear: form.endYear ? parseInt(form.endYear) : null,
        description: form.description||"",
      };

      let updatedList;
      let targetIndex;

      //  FOR IMMEDIATE DISPLAY: include image blob URL in optimistic update
      if (editIndex !== null) {
        updatedList = education.map((item, i) => {
          if (i === editIndex) {
            return { ...item, ...newItem, educationImage: imageFile ? URL.createObjectURL(imageFile) : item.educationImage };
          }
          return item;
        });
        targetIndex = editIndex;
      } else {
        const itemWithImage = { ...newItem };
        // Only set image preview if file is selected
        if (imageFile) {
          itemWithImage.educationImage = URL.createObjectURL(imageFile);
        }
        updatedList = [...education, itemWithImage];
        targetIndex = updatedList.length - 1;
      }

      //  IMMEDIATE UPDATE: show in UI instantly with blob URL

      // Send the full updated array as JSON string
      formData.append('education', JSON.stringify(updatedList.map(item => {
        const { educationImage, ...rest } = item;
        return rest;
      })));

      if (imageFile) {
        formData.append('educationImages', imageFile);
        formData.append('educationImageIndexes', String(targetIndex));
      }

      const response = await axiosInstance.put('/repairman/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Server response:', response);
      if(response.status === 200) {
      closeModal();
  onUpdate(updatedList);
      }
    } catch (err) {
      handleError(err);
      // Revert to original on error
      setIsSaving(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const updatedList = education.filter((_, i) => i !== deleteModal.index);
      await axiosInstance.put(
        '/repairman/profile',
        { education: JSON.stringify(updatedList) },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      onUpdate(updatedList); // optimistic update — no refetch needed
      setDeleteModal({ open: false, index: null, name: '' });
    } catch (err) {
      handleError(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <SectionCard
        title="Education"
        icon="heroicons:academic-cap"
        action={
          <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors">
            <Icon icon="heroicons:plus" className="w-3.5 h-3.5" /> Add Education
          </button>
        }
      >
        {education.length === 0 ? (
          <div className="text-center py-8">
            <Icon icon="heroicons:academic-cap" className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No education added yet</p>
            <button onClick={openAdd} className="mt-3 text-primary-600 text-sm font-medium hover:underline">+ Add your first education</button>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-2 top-4 bottom-4 w-0.5 bg-gray-100" />
            <div className="space-y-0">
              {education.map((item, index) => (
                <div key={item._id || index} className="relative flex gap-4 pb-5 last:pb-0 group">
                  <div className="relative z-10 flex-shrink-0 mt-1">
                    <div className="w-4 h-4 rounded-full border-2 border-primary-500 bg-white" />
                  </div>
                  <div className="flex-1 bg-gray-50/50 rounded-xl p-4 border border-gray-100 group-hover:border-gray-200 transition-all">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs text-primary-600 border border-primary-200 bg-primary-50 px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                          {item.startYear}{item.endYear ? ` – ${item.endYear}` : ' – Present'}
                        </span>
                        <button onClick={() => openEdit(item, index)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                          <Icon icon="heroicons:pencil-square" className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button onClick={() => setDeleteModal({ open: true, index, name: item.title })} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Icon icon="heroicons:trash" className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-primary-600 font-medium mb-2">{item.institution}</p>
                    {item.description && <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>}
                    {/*  Safe image — won't crash if null */}
                    <SafeImage src={item.educationImage} alt="Education certificate" onImageClick={onImageClick} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      <EducationModal isOpen={modalOpen} onClose={closeModal} onSave={handleSave} initialData={editItem} isSaving={isSaving} />
      <DeleteModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, index: null, name: '' })} onConfirm={handleDelete} itemName={deleteModal.name} isDeleting={isDeleting} />
    </>
  );
};

// ─── Experience Section ───────────────────────────────────────────────────────

const ExperienceSection = ({ experience = [], onUpdate, token, onImageClick }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, index: null, name: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openAdd = () => { setEditItem(null); setEditIndex(null); setModalOpen(true); };
  const openEdit = (item, index) => { setEditItem(item); setEditIndex(index); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditItem(null); setEditIndex(null); };

  const handleSave = async (form, imageFile) => {
    setIsSaving(true);
    try {
      const formData = new FormData();

      const newItem = {
        title: form.title,
        companyName: form.companyName,
        startYear: form.startYear ? parseInt(form.startYear) : undefined,
        endYear: form.endYear ? parseInt(form.endYear) : null,
        description: form.description||"",
      };

      let updatedList;
      let targetIndex;

      //  FOR IMMEDIATE DISPLAY: include image blob URL in optimistic update
      if (editIndex !== null) {
        updatedList = experience.map((item, i) => {
          if (i === editIndex) {
            return { ...item, ...newItem, experienceImage: imageFile ? URL.createObjectURL(imageFile) : item.experienceImage };
          }
          return item;
        });
        targetIndex = editIndex;
      } else {
        const itemWithImage = { ...newItem };
        if (imageFile) {
          itemWithImage.experienceImage = URL.createObjectURL(imageFile);
        }
        updatedList = [...experience, itemWithImage];
        targetIndex = updatedList.length - 1;
      }

    

      // Send data without image blob references
      formData.append('experience', JSON.stringify(updatedList.map(item => {
        const { experienceImage, ...rest } = item;
        return rest;
      })));

      if (imageFile) {
        formData.append('experienceImages', imageFile);
        formData.append('experienceImageIndexes', String(targetIndex));
      }

      const response = await axiosInstance.put('/repairman/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if(response.status === 200) {
        onUpdate(updatedList);
        closeModal();
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const updatedList = experience.filter((_, i) => i !== deleteModal.index);
      await axiosInstance.put(
        '/repairman/profile',
        { experience: JSON.stringify(updatedList) },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      onUpdate(updatedList);
      setDeleteModal({ open: false, index: null, name: '' });
    } catch (err) {
      handleError(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <SectionCard
        title="Experience"
        icon="heroicons:briefcase"
        action={
          <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors">
            <Icon icon="heroicons:plus" className="w-3.5 h-3.5" /> Add Experience
          </button>
        }
      >
        {experience.length === 0 ? (
          <div className="text-center py-8">
            <Icon icon="heroicons:briefcase" className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No experience added yet</p>
            <button onClick={openAdd} className="mt-3 text-primary-600 text-sm font-medium hover:underline">+ Add your first experience</button>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-2 top-4 bottom-4 w-0.5 bg-gray-100" />
            <div className="space-y-0">
              {experience.map((item, index) => (
                <div key={item._id || index} className="relative flex gap-4 pb-5 last:pb-0 group">
                  <div className="relative z-10 flex-shrink-0 mt-1">
                    <div className="w-4 h-4 rounded-full border-2 border-primary-500 bg-white" />
                  </div>
                  <div className="flex-1 bg-gray-50/50 rounded-xl p-4 border border-gray-100 group-hover:border-gray-200 transition-all">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h4 className="text-md font-semibold text-gray-900">{item.title}</h4>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs text-primary-600 border border-primary-200 bg-primary-50 px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                          {item.startYear}{item.endYear ? ` – ${item.endYear}` : ' – Present'}
                        </span>
                        <button onClick={() => openEdit(item, index)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                          <Icon icon="heroicons:pencil-square" className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button onClick={() => setDeleteModal({ open: true, index, name: item.title })} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Icon icon="heroicons:trash" className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-primary-600 font-medium mb-2">{item.companyName}</p>
                    {item.bullets?.length > 0 ? (
                      <ul className="space-y-1 mb-2">
                        {item.bullets.map((b, bi) => (
                          <li key={bi} className="flex items-start gap-2 text-xs text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />{b}
                          </li>
                        ))}
                      </ul>
                    ) : item.description ? (
                      <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                    ) : null}
                    <SafeImage src={item.experienceImage} alt="Experience certificate" onImageClick={onImageClick} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      <ExperienceModal isOpen={modalOpen} onClose={closeModal} onSave={handleSave} initialData={editItem} isSaving={isSaving} />
      <DeleteModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, index: null, name: '' })} onConfirm={handleDelete} itemName={deleteModal.name} isDeleting={isDeleting} />
    </>
  );
};



const CertificationsLicenseSection = ({ certificationsLicense = [], onUpdate, token, onImageClick }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, index: null, name: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openAdd = () => { setEditItem(null); setEditIndex(null); setModalOpen(true); };
  const openEdit = (item, index) => { setEditItem(item); setEditIndex(index); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditItem(null); setEditIndex(null); };

const handleSave = async (form, imageFiles, imagePreviews) => {
  setIsSaving(true);
  try {
    const formData = new FormData();

    const newItem = {
      title: form.title,
      images: imagePreviews.filter(img => !img.startsWith('blob:')),
    };

    let updatedList;
    let targetIndex;

    if (editIndex !== null) {
      updatedList = certificationsLicense.map((item, i) => {
        if (i === editIndex) {
          return { ...item, ...newItem, images: imagePreviews };
        }
        return item;
      });
      targetIndex = editIndex;
    } else {
      updatedList = [...certificationsLicense, { title: form.title, images: imagePreviews }];
      targetIndex = updatedList.length - 1;
    }

    //  JSON mein sirf DB URLs bhejo (blob nahi)
    formData.append('certificationsLicense', JSON.stringify(
      updatedList.map(item => ({
        title: item.title,
        images: (item.images || []).filter(img => img && !img.startsWith('blob:'))
      }))
    ));

    //  Har image ke saath correct index bhejo
    if (imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append('certificationsLicense', file);  // same field name
      });
      
      //  YEH FIX HAI — sahi field name aur sahi index
      const indexes = imageFiles.map(() => targetIndex);
      formData.append('certificationsLicenseIndexes', JSON.stringify(indexes));
    }

    const response = await axiosInstance.put('/repairman/profile', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200) {
      onUpdate(updatedList);
      closeModal();
    }
  } catch (err) {
    handleError(err);
  } finally {
    setIsSaving(false);
  }
};

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const updatedList = certificationsLicense.filter((_, i) => i !== deleteModal.index);
      await axiosInstance.put(
        '/repairman/profile',
        { certificationsLicense: JSON.stringify(updatedList) },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      onUpdate(updatedList);
      setDeleteModal({ open: false, index: null, name: '' });
    } catch (err) {
      handleError(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <SectionCard
        title="Certifications & Licenses"
        icon="heroicons:academic-cap"
        action={
          <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors">
            <Icon icon="heroicons:plus" className="w-3.5 h-3.5" /> Add Certificate
          </button>
        }
      >
        {certificationsLicense.length === 0 ? (
          <div className="text-center py-8">
            <Icon icon="heroicons:academic-cap" className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No certificates or licenses added yet</p>
            <button onClick={openAdd} className="mt-3 text-primary-600 text-sm font-medium hover:underline">+ Add your first certificate</button>
          </div>
        ) : (
          <div className={certificationsLicense.length === 1 ? 'flex justify-center' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'}>
            {certificationsLicense.map((item, index) => (
              <div key={item._id || index} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-300 transition-all">
                {/* Image Container */}
                {item.images && item.images.length > 0 && (
                  <div className={`relative bg-gray-100 overflow-hidden ${
                    item.images.length === 1 
                      ? 'w-full h-64' 
                      : 'w-full h-48'
                  }`}>
                    <img 
                      src={item.images[0]} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => onImageClick(item.images[0])}
                    />
                    <div onClick={() => onImageClick?.(item.images[0])} className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Icon icon="heroicons:eye" className="w-6 h-6 text-white" />
                    </div>
                    {item.images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-primary-600 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                        +{item.images.length - 1}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Content Container */}
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-3">{item.title}</h4>
                  
                  {/* Additional Images (if multiple) */}
                  {item.images && item.images.length > 1 && (
                    <div className="mb-3 grid grid-cols-4 gap-1">
                      {item.images.slice(1, 5).map((img, imgIdx) => (
                        <div 
                          key={imgIdx} 
                          className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => onImageClick(img)}
                        >
                          <img src={img} alt={`${item.title} ${imgIdx + 2}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEdit(item, index)} 
                      className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                      title="Edit"
                    >
                      <Icon icon="heroicons:pencil-square" className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button 
                      onClick={() => setDeleteModal({ open: true, index, name: item.title })} 
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
        )}
      </SectionCard>

      <CertificationsLicenseModal isOpen={modalOpen} onClose={closeModal} onSave={handleSave} initialData={editItem} isSaving={isSaving} />
      <DeleteModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, index: null, name: '' })} onConfirm={handleDelete} itemName={deleteModal.name} isDeleting={isDeleting} />
    </>
  );
};




// ─── Service Catalog Section ──────────────────────────────────────────────────

const statusVariant = { pending: 'warning', approved: 'success', rejected: 'danger' };

 const ServiceCatalogSection = ({ serviceCatalog }) => {
      const [activeTab, setActiveTab] = useState('all');
      if (!serviceCatalog) return null;
    const router = useRouter();
      const tabs = [
        { key: 'all', label: 'All', count: serviceCatalog.stats?.total || 0 },
        { key: 'approved', label: 'Approved', count: serviceCatalog.stats?.approved || 0 },
        { key: 'pending', label: 'Pending', count: serviceCatalog.stats?.pending || 0 },
        { key: 'rejected', label: 'Rejected', count: serviceCatalog.stats?.rejected || 0 },
      ];
    
      const services = serviceCatalog[activeTab] || [];
    
      const statusConfig = {
        approved: { bg: 'bg-primary-100', text: 'text-green-700', dot: 'bg-primary-500' },
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
        rejected: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' }
      };
    
      return (
     <SectionCard title="Service Catalog" icon="heroicons:wrench-screwdriver">
  {/* Tabs */}
  <div className="flex gap-2 mb-5 border-b border-gray-100 pb-3 flex-wrap">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        onClick={() => setActiveTab(tab.key)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          activeTab === tab.key
            ? 'bg-primary-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {tab.label}
        <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
          {tab.count}
        </span>
      </button>
    ))}
  </div>

  {services.length === 0 ? (
    <div className="text-center py-8">
      <Icon icon="heroicons:wrench-screwdriver" className="w-12 h-12 text-gray-200 mx-auto mb-3" />
      <p className="text-sm text-gray-400">No services in this category</p>
    </div>
  ) : (
    <>
      <div className="space-y-4">
        {services.map((service) => (
          <div 
            key={service._id} 
            onClick={() => router.push(`/service-catalog/${service._id}`)}  // Fixed: added missing "/"
            className="group flex gap-4 hover:bg-gray-50 bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            {/* Image Section - Left side */}
            <div className="relative w-32 md:w-40 bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0">
              {service.images && service.images.length > 0 ? (
                <img 
                  src={service.images[0]} 
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon icon="heroicons:device-phone-mobile" className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>
            
            {/* Content Section - Right side */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">
                    {service.title}
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Icon icon="heroicons:device-phone-mobile" className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {service.deviceInfo?.modelId?.brandId?.name} {service.deviceInfo?.modelId?.name}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                    {service.description}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig[service.status]?.bg} ${statusConfig[service.status]?.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[service.status]?.dot}`}></span>
                    {service.status?.charAt(0).toUpperCase() + service.status?.slice(1)}
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    {service.pricing?.currency} {service.pricing?.total?.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Icon icon="heroicons:banknotes" className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Base: {service.pricing?.currency} {service.pricing?.basePrice?.toLocaleString()}
                    </span>
                  </div>
                  {service.pricing?.partsPrice > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Icon icon="heroicons:cog" className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Parts: {service.pricing?.currency} {service.pricing?.partsPrice?.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon icon="heroicons:calendar" className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {new Date(service.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Services Button - Shows only if there are services */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => router.push('/service-catalog')}  // ← Change this route to your full listing page
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 hover:border-primary-600 hover:text-primary-600 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:shadow-sm"
        >
          <span>View All Services</span>
          <Icon icon="heroicons:arrow-right" className="w-4 h-4" />
        </button>
      </div>
    </>
  )}
</SectionCard>
      );
    };
// ─── Profile Page ─────────────────────────────────────────────────────────────

function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [certificationsLicense, setCertificationsLicense] = useState([]);
  const [imagePreview, setImagePreview] = useState({ isOpen: false, src: '' });
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get('/repairman/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(data.data);
      setEducation(data.data.user.repairmanProfile?.education || []);
      setExperience(data.data.user.repairmanProfile?.experience || []);
      setCertificationsLicense(data.data.user.repairmanProfile?.certificationsLicense || []);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (isLoading) {
    return (
     <SmallLoader loading={isLoading} text="Loading profile..." />
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md mx-auto px-4">
          <Icon icon="heroicons:user-circle" className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Profile Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find any profile data. Please try again later.</p>
          <button onClick={fetchData} className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
            <Icon icon="heroicons:arrow-path" className="w-5 h-5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const { user, profileStatus, serviceCatalog } = data;
  const profile = user.repairmanProfile || {};
  const completionPercentage = profileStatus?.completionPercentage ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">

      {/* ── Cover / Hero ── */}
      <div className="relative h-[400px] group cursor-pointer">
        <div className="absolute inset-0 overflow-hidden">
          {profile?.shopPhoto ? (
            <>
              <img src={profile.shopPhoto} alt="Cover" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/60 group-hover:via-black/30 group-hover:to-black/10 transition-all" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}
        </div>
        <div className="absolute top-0 left-0 right-0 px-6 py-4 flex justify-between items-center">
          <button className="flex items-center gap-2 text-white/90 hover:text-white bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl hover:bg-black/30 transition-all">
            <Icon icon="heroicons:arrow-left" className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          <div className="flex gap-2">
        
            
          </div>
        </div>
        <div className="absolute bottom-24 right-6 flex gap-3" style={{ zIndex: 100 }}>
          <button onClick={() => router.push('/repair-man/profile/edit-profile')} className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all border border-white/30 font-medium flex items-center gap-2 cursor-pointer" type="button">
            <Icon icon="heroicons:pencil" className="w-5 h-5" /> Update Profile
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-24">
          <div className="flex items-end gap-6">
            <div className="relative cursor-pointer group" onClick={() => profile?.profilePhoto && setImagePreview({ isOpen: true, src: profile.profilePhoto })}>
              <div className="w-36 h-36 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 transform group-hover:scale-105 transition-transform duration-300">
                {profile?.profilePhoto
                  ? <img src={profile.profilePhoto} alt={profile.fullName} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                  : <div className="w-full h-full flex items-center justify-center"><span className="text-5xl font-bold text-white">{user.name?.split(' ').map((n) => n[0]).join('').toUpperCase()}</span></div>}
              </div>
              {profile?.profilePhoto && (
                <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Icon icon="heroicons:eye" className="w-6 h-6 text-white" />
                </div>
              )}
           
              {user.isEmailVerified && (
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1.5 border-2 border-white">
                  <Icon icon="heroicons:check" className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{profile?.fullName || user.name}</h1>
                {profile?.shopName && <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm border border-white/30">{profile.shopName}</span>}
              </div>
              <div className="flex items-center gap-4 text-white/90 flex-wrap">
                <div className="flex items-center gap-1">
                  <Icon icon="heroicons:map-pin" className="w-4 h-4" />
                  <span className="text-sm">{user.city?.name || 'City not set'}{user.state?.name ? `, ${user.state.name}` : ''}{user.country?.name ? `, ${user.country.name}` : ''}</span>
                </div>
                {profile?.yearsOfExperience && (
                  <div className="flex items-center gap-1">
                    <Icon icon="heroicons:clock" className="w-4 h-4" />
                    <span className="text-sm">{profile.yearsOfExperience} Years Experience</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Icon icon="heroicons:briefcase" className="w-4 h-4" />
                  <span className="text-sm">{profile?.totalJobs || 0} Jobs Completed</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <div className="flex items-center gap-1 bg-yellow-400/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-400/30">
                  <Icon icon="heroicons:star" className="w-4 h-4 text-yellow-400" />
                  <span className="font-semibold text-white">{profile?.rating || '0.0'}</span>
                  <span className="text-xs text-white/70">({profile?.totalReviews || 0} reviews)</span>
                </div>
                {profile?.isKycCompleted && (
                  <div className="flex items-center gap-1 bg-green-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-green-500/30">
                    <Icon icon="heroicons:check-badge" className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-white">Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-12 pb-4">
            <div className="container mx-auto px-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon icon="heroicons:chart-bar" className="w-4 h-4 text-white/70" />
                      <span className="text-sm font-medium text-white/90">Profile Strength</span>
                    </div>
                    <span className="text-sm font-bold text-white">{completionPercentage}% Complete</span>
                  </div>
                  <div className="h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500 relative" style={{ width: `${completionPercentage}%` }}>
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                </div>
                {profileStatus?.message && <Badge variant={profileStatus.isComplete ? 'success' : 'warning'}>{profileStatus.message}</Badge>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bank alert ── */}
      {!profile.isPaymentInformationCompleted && (
        <div className="container mx-auto px-6 -mt-4 mb-6 relative z-10">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-orange-500 rounded-xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg"><Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 text-orange-600" /></div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Complete Your Bank Details</h4>
                <p className="text-sm text-gray-600 mb-3">Add your bank information to start receiving payments</p>
                <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium inline-flex items-center gap-2">
                  <Icon icon="heroicons:banknotes" className="w-4 h-4" /> Add Bank Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="container mx-auto px-6 pb-8 mt-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon="heroicons:star" label="Rating" value={profile?.rating ? `${profile.rating} (${profile.totalReviews || 0} reviews)` : 'No ratings'} bgColor="bg-yellow-50" iconColor="text-yellow-600" />
          <StatCard icon="heroicons:briefcase" label="Jobs Completed" value={profile?.totalJobs || 0} bgColor="bg-primary-50" iconColor="text-primary-600" />
          <StatCard icon="heroicons:clock" label="Experience" value={profile?.yearsOfExperience ? `${profile.yearsOfExperience} Years` : 'N/A'} bgColor="bg-purple-50" iconColor="text-purple-600" />
          <StatCard icon="heroicons:users" label="Happy Clients" value={profile?.totalClients || 0} bgColor="bg-green-50" iconColor="text-green-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-6">
            {profile?.description && (
              <SectionCard title="About Me" icon="heroicons:information-circle">
                <p className="text-gray-700 leading-relaxed">{profile.description}</p>
              </SectionCard>
            )}
            {profile?.specializations?.length > 0 && (
              <SectionCard title="Specializations" icon="heroicons:bolt">
                <div className="flex flex-wrap gap-2">
                  {profile.specializations.map((spec, i) => <Badge key={i} variant="primary">{spec}</Badge>)}
                </div>
              </SectionCard>
            )}
 {profile?.workingHours && (
              <SectionCard title="Working Hours" icon="heroicons:clock">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 p-4 rounded-xl">
                    <p className="text-xs text-primary-600 font-medium mb-1">Business Hours</p>
                    <p className="text-lg font-semibold text-gray-900">{profile.workingHours.start || '09:00'} - {profile.workingHours.end || '18:00'}</p>
                  </div>
                  {profile?.workingDays?.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 font-medium mb-2">Working Days</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.workingDays.map((day, i) => <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs">{day.slice(0, 3)}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}
                        <ServiceCatalogSection serviceCatalog={serviceCatalog} />

            {/*  Education — no refetch, updates in place */}
            <EducationSection education={education} onUpdate={setEducation} token={token} onImageClick={(src) => setImagePreview({ isOpen: true, src })} />

            {/*  Experience — no refetch, updates in place */}
            <ExperienceSection experience={experience} onUpdate={setExperience} token={token} onImageClick={(src) => setImagePreview({ isOpen: true, src })} />

            {/*  Certifications & Licenses — no refetch, updates in place */}
            <CertificationsLicenseSection certificationsLicense={certificationsLicense} onUpdate={setCertificationsLicense} token={token} onImageClick={(src) => setImagePreview({ isOpen: true, src })} />
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-6">
            <SectionCard title="Contact Info" icon="heroicons:phone">
              <div className="space-y-2">
                <InfoRow icon="heroicons:phone" label="Phone" value={profile?.mobileNumber || user.phone} />
                <InfoRow icon="heroicons:envelope" label="Email" value={profile?.emailAddress || user.email} isVerified={user.isEmailVerified} />
                {profile?.whatsappNumber && <InfoRow icon="ic:baseline-whatsapp" label="WhatsApp" value={profile.whatsappNumber} />}
              </div>
            </SectionCard>
            <SectionCard title="Location" icon="heroicons:map-pin">
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl">
                  <p className="text-xs text-primary-600 font-medium mb-1">Full Address</p>
                  <p className="text-sm font-medium text-gray-900">{profile?.fullAddress || user.address || 'Address not provided'}</p>
                </div>
                {(user.city?.name || user.state?.name || user.country?.name) && (
                  <div className="flex flex-col gap-1.5 p-3 bg-gray-50 rounded-lg">
                    {user.city?.name && <div className="flex justify-between"><span className="text-xs text-gray-400">City</span><span className="text-xs font-medium text-gray-700">{user.city.name}</span></div>}
                    {user.state?.name && <div className="flex justify-between"><span className="text-xs text-gray-400">State</span><span className="text-xs font-medium text-gray-700">{user.state.name}</span></div>}
                    {user.country?.name && <div className="flex justify-between"><span className="text-xs text-gray-400">Country</span><span className="text-xs font-medium text-gray-700">{user.country.name}</span></div>}
                  </div>
                )}
                {profile?.zipCode && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500">ZIP Code</span>
                    <span className="text-sm font-medium">{profile.zipCode}</span>
                  </div>
                )}
              </div>
            </SectionCard>
            {(profile?.emergencyContactPerson || profile?.emergencyContactNumber) && (
              <SectionCard title="Emergency Contact" icon="heroicons:phone-arrow-up-right">
                <div className="space-y-3">
                  {profile.emergencyContactPerson && <InfoRow icon="heroicons:user" label="Contact Person" value={profile.emergencyContactPerson} />}
                  {profile.emergencyContactNumber && <InfoRow icon="heroicons:phone" label="Contact Number" value={profile.emergencyContactNumber} />}
                </div>
              </SectionCard>
            )}
            <SectionCard title="Services" icon="heroicons:wrench-screwdriver">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Pickup Service</span>
                  <Badge variant={profile?.pickupService ? 'success' : 'default'}>{profile?.pickupService ? 'Available' : 'Not Available'}</Badge>
                </div>
                {profile?.homeService !== undefined && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">Home Service</span>
                    <Badge variant={profile.homeService ? 'success' : 'default'}>{profile.homeService ? 'Available' : 'Not Available'}</Badge>
                  </div>
                )}
              </div>
            </SectionCard>
            {profile?.brandsWorkedWith?.length > 0 && (
              <SectionCard title="Brands Worked With" icon="heroicons:tag">
                <div className="flex flex-wrap gap-2">
                  {profile.brandsWorkedWith.map((brand) => <Badge key={brand._id} variant="info">{brand.name}</Badge>)}
                </div>
              </SectionCard>
            )}
            <SectionCard title="Account Information" icon="heroicons:user-circle">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500">Member Since</span>
                  <span className="text-sm font-medium">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500">Last Updated</span>
                  <span className="text-sm font-medium">{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className={`text-xs font-medium ${user.isEmailVerified ? 'text-green-600' : 'text-gray-400'}`}>
                      {user.isEmailVerified ? '✓ Email Verified' : '○ Email Unverified'}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-primary-50 rounded-lg">
                    <div className={`text-xs font-medium ${user.isProfileComplete ? 'text-primary-600' : 'text-gray-400'}`}>
                      {user.isProfileComplete ? '✓ Profile Complete' : '○ Profile Incomplete'}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
      
      {/* Image Preview Modal */}
      <ImagePreviewModal isOpen={imagePreview.isOpen} imageSrc={imagePreview.src} onClose={() => setImagePreview({ isOpen: false, src: '' })} />
    </div>
  );
}

export default ProfilePage;