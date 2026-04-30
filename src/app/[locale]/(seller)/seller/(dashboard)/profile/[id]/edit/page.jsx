"use client"

import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const InputField = ({ label, name, value, onChange, type = 'text', required = false, error, placeholder, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
      required={required}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, options, required = false, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
      required={required}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const TextareaField = ({ label, name, value, onChange, required = false, error, placeholder, rows = 4 }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
      required={required}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

const SkillInput = ({ skills, onSkillsChange }) => {
  const [newSkill, setNewSkill] = useState({ name: '', level: 'Beginner', years: '' });

  const skillLevels = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' }
  ];

  const addSkill = () => {
    if (newSkill.name && newSkill.years) {
      onSkillsChange([...skills, { ...newSkill, id: Date.now() }]);
      setNewSkill({ name: '', level: 'Beginner', years: '' });
    }
  };

  const removeSkill = (id) => {
    onSkillsChange(skills.filter(skill => skill.id !== id));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Skills & Expertise</label>
      
      {/* Existing Skills */}
      <div className="space-y-2 mb-4">
        {skills.map((skill) => (
          <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="font-medium">{skill.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                skill.level === 'Expert' ? 'bg-green-100 text-green-800' :
                skill.level === 'Advanced' ? 'bg-primary-100 text-primary-800' :
                skill.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {skill.level}
              </span>
              <span className="text-sm text-gray-600">{skill.years} years</span>
            </div>
            <button
              type="button"
              onClick={() => removeSkill(skill.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Icon icon="heroicons:trash" className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Skill */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="Skill name"
          value={newSkill.name}
          onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <select
          value={newSkill.level}
          onChange={(e) => setNewSkill({...newSkill, level: e.target.value})}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {skillLevels.map(level => (
            <option key={level.value} value={level.value}>{level.label}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Years"
          value={newSkill.years}
          onChange={(e) => setNewSkill({...newSkill, years: e.target.value})}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          min="0"
          max="50"
        />
        <button
          type="button"
          onClick={addSkill}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center"
        >
          <Icon icon="heroicons:plus" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

function ProfileEditPage() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const [formData, setFormData] = useState({
    // Basic Information
    firstName: 'Hammad',
    lastName: 'S.',
    username: 'Hammadkhan678910',
    email: 'hammad@example.com',
    phone: '+92 300 1234567',
    
    // Professional Information
    title: 'Scalable & Efficient MERN Stack Developer',
    overview: `I'm well known in MS office (MS word, MS excel, MS power point etc) i can convert pdf to word and at least in excel and I'm able to write a description blog`,
    hourlyRate: '5',
    currency: 'USD',
    
    // Location Information
    country: 'Pakistan',
    city: 'Karachi',
    timezone: 'Asia/Karachi',
    
    // Languages
    languages: [
      { id: 1, name: 'English', level: 'Professional' },
      { id: 2, name: 'Urdu', level: 'Native or bilingual' }
    ],
    
    // Skills
    skills: [
      { id: 1, name: 'MERN Stack', level: 'Expert', years: '3' },
      { id: 2, name: 'React.js', level: 'Expert', years: '4' },
      { id: 3, name: 'Node.js', level: 'Expert', years: '3' }
    ],
    
    // Availability
    availability: 'More than 30 hrs/week',
    responseTime: 'Within 1 hour'
  });

  const countryOptions = [
    { value: '', label: 'Select Country' },
    { value: 'Pakistan', label: 'Pakistan' },
    { value: 'India', label: 'India' },
    { value: 'Bangladesh', label: 'Bangladesh' },
    { value: 'USA', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'TRY', label: 'TRY (₨)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' }
  ];

  const availabilityOptions = [
    { value: 'Less than 10 hrs/week', label: 'Less than 10 hrs/week' },
    { value: '10-30 hrs/week', label: '10-30 hrs/week' },
    { value: 'More than 30 hrs/week', label: 'More than 30 hrs/week' },
    { value: 'As needed', label: 'As needed - open to offers' }
  ];

  const responseTimeOptions = [
    { value: 'Within 15 minutes', label: 'Within 15 minutes' },
    { value: 'Within 1 hour', label: 'Within 1 hour' },
    { value: 'Within 4 hours', label: 'Within 4 hours' },
    { value: 'Within 24 hours', label: 'Within 24 hours' }
  ];

  const languageLevels = [
    { value: 'Basic', label: 'Basic' },
    { value: 'Conversational', label: 'Conversational' },
    { value: 'Fluent', label: 'Fluent' },
    { value: 'Professional', label: 'Professional' },
    { value: 'Native or bilingual', label: 'Native or bilingual' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'profile') {
          setProfileImage(e.target.result);
        } else if (type === 'cover') {
          setCoverImage(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLanguageChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.map(lang => 
        lang.id === id ? { ...lang, [field]: value } : lang
      )
    }));
  };

  const addLanguage = () => {
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, { id: Date.now(), name: '', level: 'Basic' }]
    }));
  };

  const removeLanguage = (id) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.id !== id)
    }));
  };

  const handleSkillsChange = (newSkills) => {
    setFormData(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.title) newErrors.title = 'Professional title is required';
    if (!formData.overview) newErrors.overview = 'Overview is required';
    if (!formData.hourlyRate) newErrors.hourlyRate = 'Hourly rate is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600 mt-1">Update your professional information</p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Icon icon="heroicons:arrow-left" className="w-4 h-4" />
              <span>Back to Profile</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          
          {/* Profile Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary-600">
                          {formData.firstName?.[0]}{formData.lastName?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                    Upload New
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'profile')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Cover Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Cover Photo</label>
                <div className="relative">
                  <div className="w-full h-24 rounded-lg overflow-hidden bg-gray-200">
                    {coverImage ? (
                      <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-primary-600 to-primary-800"></div>
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-lg">
                    <span className="text-white text-sm">Upload Cover</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'cover')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                error={errors.firstName}
              />
              <InputField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                error={errors.lastName}
              />
              <InputField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="@username"
              />
              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                error={errors.email}
              />
              <InputField
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+92 300 1234567"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Professional Information</h3>
            <div className="space-y-6">
              <InputField
                label="Professional Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                error={errors.title}
                placeholder="e.g., Full Stack Developer, UI/UX Designer"
              />
              
              <TextareaField
                label="Professional Overview"
                name="overview"
                value={formData.overview}
                onChange={handleInputChange}
                required
                error={errors.overview}
                placeholder="Describe your professional background, skills, and what makes you unique..."
                rows={6}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Hourly Rate"
                  name="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  required
                  error={errors.hourlyRate}
                  min="1"
                />
                <SelectField
                  label="Currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  options={currencyOptions}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                options={countryOptions}
                required
              />
              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter your city"
              />
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Languages</h3>
            <div className="space-y-4">
              {formData.languages.map((language) => (
                <div key={language.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <InputField
                    label="Language"
                    value={language.name}
                    onChange={(e) => handleLanguageChange(language.id, 'name', e.target.value)}
                    placeholder="e.g., English"
                  />
                  <SelectField
                    label="Proficiency Level"
                    value={language.level}
                    onChange={(e) => handleLanguageChange(language.id, 'level', e.target.value)}
                    options={languageLevels}
                  />
                  <button
                    type="button"
                    onClick={() => removeLanguage(language.id)}
                    className="px-4 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addLanguage}
                className="px-4 py-2 text-primary-600 hover:text-primary-800 border border-primary-300 rounded-lg hover:bg-primary-50"
              >
                + Add Language
              </button>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Skills & Expertise</h3>
            <SkillInput skills={formData.skills} onSkillsChange={handleSkillsChange} />
          </div>

          {/* Availability */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Availability</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Work Availability"
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                options={availabilityOptions}
              />
              <SelectField
                label="Response Time"
                name="responseTime"
                value={formData.responseTime}
                onChange={handleInputChange}
                options={responseTimeOptions}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center space-x-2 ${loading ? 'opacity-50' : ''}`}
            >
              {loading && <Icon icon="heroicons:arrow-path" className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileEditPage;