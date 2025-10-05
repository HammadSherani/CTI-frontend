
"use client";

import React, { useState } from 'react';

const RepairShopRegistration = () => {
    const [formData, setFormData] = useState({
        // Personal Information
        fullName: '',
        fatherName: '',
        nationalId: '',
        dateOfBirth: '',
        gender: '',

        // Contact Information
        mobileNumber: '',
        whatsappNumber: '',
        emailAddress: 'user@example.com',
        emergencyContact: '',
        emergencyNumber: '',

        // Business Information
        shopName: '',
        fullAddress: '',
        city: '',
        district: '',
        zipCode: '',

        // Experience & Services
        yearsExperience: '',
        specializations: [],
        brands: [],
        description: '',

        // Working Hours
        workingDays: [],
        workingHoursFrom: '',
        workingHoursTo: '',
        pickupService: false,

        // Documents
        profilePhoto: null,
        nationalIdScan: null,
        shopPhoto: null,

        // Agreement
        termsAgreed: false
    });

    const cities = ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Konya'];
    const specializations = ['Screen Repair', 'Water Damage', 'Battery Replacement', 'Charging Port', 'Software Problems'];
    const brands = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Oppo'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };


    // Calculate working hours duration
    const calculateWorkingHours = (from, to) => {
        // Implementation for calculating hours between times
    };

    // Quick preset functions
    const setQuickHours = (from, to) => {
        handleInputChange('workingHoursFrom', from);
        handleInputChange('workingHoursTo', to);
    };

    const setAllDays = () => {
        handleInputChange('workingDays', days);
    };

    const setWeekdaysOnly = () => {
        handleInputChange('workingDays', days.slice(0, 5)); // Mon-Fri
    };
    const handleArrayChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(item => item !== value)
                : [...prev[field], value]
        }));
    };

    const handleFileUpload = (field, file) => {
        setFormData(prev => ({ ...prev, [field]: file }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Registration submitted successfully!');
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 bg-white">
            <script src="https://code.iconify.design/3/3.1.1/iconify.min.js"></script>

            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Registration</h1>
                <p className="text-gray-600">Fill in your details to become a repair service provider</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Personal Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <iconify-icon icon="mdi:account" class="mr-2 text-primary-500" ></iconify-icon>
                        Personal Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Father's Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.fatherName}
                                onChange={(e) => handleInputChange('fatherName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                National ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.nationalId}
                                onChange={(e) => handleInputChange('nationalId', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Gender <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.gender}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                required
                            >
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <iconify-icon icon="mdi:phone" class="mr-2 text-primary-500" ></iconify-icon>
                        Contact Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={formData.mobileNumber}
                                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                WhatsApp Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={formData.whatsappNumber}
                                onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.emailAddress}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Emergency Contact
                            </label>
                            <input
                                type="text"
                                value={formData.emergencyContact}
                                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Business Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <iconify-icon icon="mdi:store" class="mr-2 text-primary-500" ></iconify-icon>
                        Business Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Shop/Business Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.shopName}
                                onChange={(e) => handleInputChange('shopName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.fullAddress}
                                onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.city}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                required
                            >
                                <option value="">Select City</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                District <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.district}
                                onChange={(e) => handleInputChange('district', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <iconify-icon icon="mdi:tools" class="mr-2 text-primary-500" ></iconify-icon>
                        Experience & Services
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Years of Experience <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.yearsExperience}
                                onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                What can you repair? <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-3">
                                <input
                                    type="text"
                                    placeholder="Add custom service (press Enter)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                            e.preventDefault();
                                            if (!formData.specializations.includes(e.target.value.trim())) {
                                                handleArrayChange('specializations', e.target.value.trim());
                                            }
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                <p className="text-xs text-gray-500 mt-1">Type your service and press Enter to add</p>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3 py-3">
                                {formData.specializations.map((spec, index) => (
                                    <div key={index} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                        {spec}
                                        <button
                                            type="button"
                                            onClick={() => handleArrayChange('specializations', spec)}
                                            className="text-primary-600 hover:text-primary-800"
                                        >
                                            <iconify-icon icon="mdi:close" ></iconify-icon>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {/* <div className="flex flex-wrap gap-2">
                {specializations.filter(spec => !formData.specializations.includes(spec)).map(spec => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => handleArrayChange('specializations', spec)}
                    className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-50 hover:border-primary-300 transition-colors"
                  >
                    <iconify-icon icon="mdi:plus" class="mr-1" ></iconify-icon>
                    {spec}
                  </button>
                ))}
              </div> */}

                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Which brands do you work with?
                            </label>

                            <div className="mt-3">
                                <input
                                    type="text"
                                    placeholder="Add custom brand (press Enter)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                            e.preventDefault();
                                            if (!formData.brands.includes(e.target.value.trim())) {
                                                handleArrayChange('brands', e.target.value.trim());
                                            }
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                <p className="text-xs text-gray-500 mt-1">Type brand name and press Enter to add</p>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3 py-3">
                                {formData.brands.map((brand, index) => (
                                    <div key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                        {brand}
                                        <button
                                            type="button"
                                            onClick={() => handleArrayChange('brands', brand)}
                                            className="text-green-600 hover:text-green-800"
                                        >
                                            <iconify-icon icon="mdi:close" ></iconify-icon>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {/* <div className="flex flex-wrap gap-2">
                {brands.filter(brand => !formData.brands.includes(brand)).map(brand => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => handleArrayChange('brands', brand)}
                    className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-50 hover:border-green-300 transition-colors"
                  >
                    <iconify-icon icon="mdi:plus" class="mr-1" ></iconify-icon>
                    {brand}
                  </button>
                ))}
              </div> */}

                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tell us about yourself <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={4}
                                minLength={50}
                                placeholder="Describe your repair experience, skills, and what makes you unique..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/50 minimum</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl shadow-sm border border-gray-200/50 backdrop-blur-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                            <div className="p-2 bg-primary-100 rounded-lg mr-3">
                                <iconify-icon icon="mdi:clock" className="text-primary-600 text-lg"></iconify-icon>
                            </div>
                            Working Hours & Availability
                        </h2>
                        <p className="text-sm text-gray-600">Set your business hours and service options</p>
                    </div>

                    <div className="space-y-6">
                        {/* Working Days Selection */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                <span className="flex items-center">
                                    <iconify-icon icon="mdi:calendar-week" className="mr-2 text-gray-500"></iconify-icon>
                                    Working Days
                                    <span className="text-red-500 ml-1">*</span>
                                </span>
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                                {days.map(day => (
                                    <label
                                        key={day}
                                        className={`
              flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${formData.workingDays.includes(day)
                                                ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                                                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                                            }
            `}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.workingDays.includes(day)}
                                            onChange={() => handleArrayChange('workingDays', day)}
                                            className="sr-only"
                                        />
                                        <span className="text-xs font-medium">{day.slice(0, 3)}</span>
                                        <span className="text-[10px] mt-1 opacity-75">{day.slice(3)}</span>
                                        {formData.workingDays.includes(day) && (
                                            <iconify-icon icon="mdi:check-circle" className="text-primary-500 mt-1 text-sm"></iconify-icon>
                                        )}
                                    </label>
                                ))}
                            </div>
                            {formData.workingDays.length === 0 && (
                                <p className="text-xs text-red-500 mt-2 flex items-center">
                                    <iconify-icon icon="mdi:alert-circle" className="mr-1"></iconify-icon>
                                    Please select at least one working day
                                </p>
                            )}
                        </div>

                        {/* Time Range */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                            <div className="flex items-center mb-3">
                                <iconify-icon icon="mdi:clock-time-four" className="mr-2 text-gray-500"></iconify-icon>
                                <span className="text-sm font-semibold text-gray-700">Business Hours</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Opening Time <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={formData.workingHoursFrom}
                                            onChange={(e) => handleInputChange('workingHoursFrom', e.target.value)}
                                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                            required
                                        />
                                        <iconify-icon icon="mdi:clock-start" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></iconify-icon>
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Closing Time <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={formData.workingHoursTo}
                                            onChange={(e) => handleInputChange('workingHoursTo', e.target.value)}
                                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                            required
                                        />
                                        <iconify-icon icon="mdi:clock-end" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></iconify-icon>
                                    </div>
                                </div>
                            </div>

                            {/* Duration Display */}
                            {formData.workingHoursFrom && formData.workingHoursTo && (
                                <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                                    <p className="text-sm text-primary-700 flex items-center">
                                        <iconify-icon icon="mdi:information" className="mr-2"></iconify-icon>
                                        Total hours: {calculateWorkingHours(formData.workingHoursFrom, formData.workingHoursTo)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Additional Services */}
                        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                            <div className="flex items-center mb-3">
                                <iconify-icon icon="mdi:truck-delivery" className="mr-2 text-gray-500"></iconify-icon>
                                <span className="text-sm font-semibold text-gray-700">Additional Services</span>
                            </div>

                            <div className="space-y-3">
                                <label className={`
          flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
          ${formData.pickupService
                                        ? 'border-green-300 bg-green-50'
                                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                    }
        `}>
                                    <input
                                        type="checkbox"
                                        checked={formData.pickupService}
                                        onChange={(e) => handleInputChange('pickupService', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`
            flex-shrink-0 w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-colors
            ${formData.pickupService
                                            ? 'border-green-500 bg-green-500'
                                            : 'border-gray-300'
                                        }
          `}>
                                        {formData.pickupService && (
                                            <iconify-icon icon="mdi:check" className="text-white text-sm"></iconify-icon>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-700">I offer pickup service</span>
                                        <p className="text-xs text-gray-500 mt-1">Customers can request item pickup from their location</p>
                                    </div>
                                    <iconify-icon
                                        icon="mdi:truck"
                                        className={`text-lg ${formData.pickupService ? 'text-green-600' : 'text-gray-400'}`}
                                    ></iconify-icon>
                                </label>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setQuickHours('9:00', '17:00')}
                                className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Standard (9 AM - 5 PM)
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuickHours('8:00', '18:00')}
                                className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Extended (8 AM - 6 PM)
                            </button>
                            <button
                                type="button"
                                onClick={() => setAllDays()}
                                className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                All Days
                            </button>
                            <button
                                type="button"
                                onClick={() => setWeekdaysOnly()}
                                className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Weekdays Only
                            </button>
                        </div>
                    </div>
                </div>

                {/* Document Uploads */}
               <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl shadow-sm border border-gray-200/50 backdrop-blur-sm">
  <div className="mb-6">
    <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
      <div className="p-2 bg-primary-100 rounded-lg mr-3">
        <iconify-icon icon="mdi:upload" className="text-primary-600 text-lg"></iconify-icon>
      </div>
      Upload Documents
    </h2>
    <p className="text-sm text-gray-600">Upload required documents to verify your business</p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Profile Photo Upload */}
    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        <span className="flex items-center">
          <iconify-icon icon="mdi:account-circle" className="mr-2 text-gray-500"></iconify-icon>
          Profile Photo 
          <span className="text-red-500 ml-1">*</span>
        </span>
      </label>
      
      <div className={`
        relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer group
        ${formData.profilePhoto 
          ? 'border-green-300 bg-green-50 hover:bg-green-100' 
          : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
        }
      `}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload('profilePhoto', e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          id="profilePhoto"
          required
        />
        
        {formData.profilePhoto ? (
          <div className="space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <iconify-icon icon="mdi:check-circle" className="text-green-600 text-xl"></iconify-icon>
            </div>
            <p className="text-sm font-medium text-green-700">Photo Uploaded</p>
            <p className="text-xs text-green-600">{formData.profilePhoto.name}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFileUpload('profilePhoto', null);
              }}
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary-100 transition-colors">
              <iconify-icon icon="mdi:camera-plus" className="text-gray-400 text-xl group-hover:text-primary-500 transition-colors"></iconify-icon>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-primary-700 transition-colors">
                Upload Profile Photo
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG up to 5MB
              </p>
            </div>
            <div className="flex items-center justify-center">
              <span className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-100 rounded-full group-hover:bg-primary-200 transition-colors">
                Choose File
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        <iconify-icon icon="mdi:information" className="mr-1"></iconify-icon>
        Clear, recent photo of yourself
      </div>
    </div>

    {/* National ID Upload */}
    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        <span className="flex items-center">
          <iconify-icon icon="mdi:card-account-details-outline" className="mr-2 text-gray-500"></iconify-icon>
          National ID 
          <span className="text-red-500 ml-1">*</span>
        </span>
      </label>
      
      <div className={`
        relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer group
        ${formData.nationalIdScan 
          ? 'border-green-300 bg-green-50 hover:bg-green-100' 
          : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
        }
      `}>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => handleFileUpload('nationalIdScan', e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          id="nationalIdScan"
          required
        />
        
        {formData.nationalIdScan ? (
          <div className="space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <iconify-icon icon="mdi:check-circle" className="text-green-600 text-xl"></iconify-icon>
            </div>
            <p className="text-sm font-medium text-green-700">ID Uploaded</p>
            <p className="text-xs text-green-600">{formData.nationalIdScan.name}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFileUpload('nationalIdScan', null);
              }}
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary-100 transition-colors">
              <iconify-icon icon="mdi:file-document-plus" className="text-gray-400 text-xl group-hover:text-primary-500 transition-colors"></iconify-icon>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-primary-700 transition-colors">
                Upload National ID
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, PDF up to 5MB
              </p>
            </div>
            <div className="flex items-center justify-center">
              <span className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-100 rounded-full group-hover:bg-primary-200 transition-colors">
                Choose File
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        <iconify-icon icon="mdi:shield-check" className="mr-1"></iconify-icon>
        Both sides of your ID card
      </div>
    </div>

    {/* Shop Photo Upload */}
    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        <span className="flex items-center">
          <iconify-icon icon="mdi:storefront-outline" className="mr-2 text-gray-500"></iconify-icon>
          Shop Photo 
          <span className="text-red-500 ml-1">*</span>
        </span>
      </label>
      
      <div className={`
        relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer group
        ${formData.shopPhoto 
          ? 'border-green-300 bg-green-50 hover:bg-green-100' 
          : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
        }
      `}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload('shopPhoto', e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          id="shopPhoto"
          required
        />
        
        {formData.shopPhoto ? (
          <div className="space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <iconify-icon icon="mdi:check-circle" className="text-green-600 text-xl"></iconify-icon>
            </div>
            <p className="text-sm font-medium text-green-700">Shop Photo Uploaded</p>
            <p className="text-xs text-green-600">{formData.shopPhoto.name}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFileUpload('shopPhoto', null);
              }}
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary-100 transition-colors">
              <iconify-icon icon="mdi:camera-plus-outline" className="text-gray-400 text-xl group-hover:text-primary-500 transition-colors"></iconify-icon>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-primary-700 transition-colors">
                Upload Shop Photo
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG up to 5MB
              </p>
            </div>
            <div className="flex items-center justify-center">
              <span className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-100 rounded-full group-hover:bg-primary-200 transition-colors">
                Choose File
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        <iconify-icon icon="mdi:eye" className="mr-1"></iconify-icon>
        Clear exterior view of your shop
      </div>
    </div>
  </div>

  {/* Upload Progress & Guidelines */}
  <div className="mt-6 space-y-4">
    {/* Progress Indicator */}
    <div className="bg-white p-4 rounded-lg border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Upload Progress</span>
        <span className="text-sm text-gray-500">
          {[formData.profilePhoto, formData.nationalIdScan, formData.shopPhoto].filter(Boolean).length}/3 completed
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${([formData.profilePhoto, formData.nationalIdScan, formData.shopPhoto].filter(Boolean).length / 3) * 100}%`
          }}
        ></div>
      </div>
    </div>

    {/* Guidelines */}
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-primary-800 mb-2 flex items-center">
        <iconify-icon icon="mdi:lightbulb" className="mr-2"></iconify-icon>
        Upload Guidelines
      </h3>
      <ul className="text-xs text-primary-700 space-y-1">
        <li className="flex items-start">
          <iconify-icon icon="mdi:check" className="mr-2 mt-0.5 flex-shrink-0"></iconify-icon>
          Ensure all documents are clear and readable
        </li>
        <li className="flex items-start">
          <iconify-icon icon="mdi:check" className="mr-2 mt-0.5 flex-shrink-0"></iconify-icon>
          Maximum file size: 5MB per document
        </li>
        <li className="flex items-start">
          <iconify-icon icon="mdi:check" className="mr-2 mt-0.5 flex-shrink-0"></iconify-icon>
          Accepted formats: JPG, PNG for photos; PDF for documents
        </li>
        <li className="flex items-start">
          <iconify-icon icon="mdi:check" className="mr-2 mt-0.5 flex-shrink-0"></iconify-icon>
          All uploaded documents will be securely stored and encrypted
        </li>
      </ul>
    </div>

    {/* Security Notice */}
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start">
        <iconify-icon icon="mdi:shield-check" className="text-green-600 mr-2 mt-0.5 flex-shrink-0"></iconify-icon>
        <div>
          <p className="text-sm font-medium text-green-800">Your documents are secure</p>
          <p className="text-xs text-green-700 mt-1">
            All uploaded files are encrypted and used only for verification purposes. 
            We never share your personal information with third parties.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

                {/* Agreement */}
                <div className="bg-primary-50 p-4 rounded-lg">
                    <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.termsAgreed}
                            onChange={(e) => handleInputChange('termsAgreed', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
                            required
                        />
                        <span className="text-sm text-gray-700">
                            <strong>I agree to the terms and conditions</strong> <span className="text-red-500">*</span>
                            <br />
                            <span className="text-xs text-gray-600">
                                By checking this, you confirm all information is accurate and agree to our platform terms.
                            </span>
                        </span>
                    </label>
                </div>

                {/* Submit Button */}
                <div className="text-center">
                    <button
                        type="submit"
                        disabled={!formData.termsAgreed}
                        className={`px-8 py-3 rounded-lg font-medium text-white ${formData.termsAgreed
                                ? 'bg-primary-600 hover:bg-primary-700 cursor-pointer'
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Submit Registration
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RepairShopRegistration;