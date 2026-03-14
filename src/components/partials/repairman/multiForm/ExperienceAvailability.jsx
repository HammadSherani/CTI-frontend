"use client";
import axiosInstance from "@/config/axiosInstance";
import handleError from "@/helper/handleError";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";

// Custom Chip Input Component - included in this file
const ChipInput = ({ value = [], onChange, placeholder, suggestions = [], error, touched }) => {
    const [inputValue, setInputValue] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    const addChip = (chipValue) => {
        const trimmedValue = chipValue.trim();
        if (trimmedValue && !value.includes(trimmedValue)) {
            onChange([...value, trimmedValue]);
            setInputValue("");
            setShowSuggestions(false);
        }
    };

    const removeChip = (index) => {
        const newValue = value.filter((_, i) => i !== index);
        onChange(newValue);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            addChip(inputValue);
        }
    };

    const filteredSuggestions = suggestions.filter(
        suggestion =>
            suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
            !value.includes(suggestion)
    );

    return (
        <div className="relative">
            <div className={`min-h-[44px] border rounded-lg px-3 py-2 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all ${error && touched ? 'border-red-500' : 'border-gray-300'
                }`}>
                {value.map((chip, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 border border-orange-200"
                    >
                        {chip}
                        <button
                            type="button"
                            onClick={() => removeChip(index)}
                            className="ml-2 text-orange-600 hover:text-orange-800 font-bold"
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowSuggestions(e.target.value.length > 0);
                    }}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setShowSuggestions(inputValue.length > 0)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder={value.length === 0 ? placeholder : ""}
                    className="flex-1 min-w-[120px] outline-none bg-transparent"
                />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredSuggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => addChip(suggestion)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 outline-none"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Brand Dropdown Component - FIXED: Now properly displays selected brands
const BrandDropdown = ({ value = [], onChange, brands = [], error, touched }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Get full brand objects for selected IDs
    const selectedBrands = brands.filter(brand =>
        value.some(selectedId => String(selectedId) === String(brand._id))
    );

    // Filter out already selected brands
    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !value.some(selectedId => String(selectedId) === String(brand._id))
    );

    const addBrand = (brand) => {
        // FIXED: Make sure we're storing just the ID
        const newValue = [...value, brand._id];
        onChange(newValue);
        setIsOpen(false);
        setSearchTerm("");
    };

    const removeBrand = (brandId) => {
        // FIXED: Remove by ID
        const newValue = value.filter(id => String(id) !== String(brandId));
        onChange(newValue);
    };

    return (
        <div className="relative">
            {/* Selected Brands Display - FIXED: Now shows correctly */}
            <div 
                className={`min-h-[44px] border rounded-lg px-3 py-2 flex flex-wrap gap-2 items-center cursor-pointer transition-all ${
                    error && touched ? 'border-red-500' : 'border-gray-300 hover:border-orange-300'
                }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedBrands.length > 0 ? (
                    selectedBrands.map((brand) => (
                        <span
                            key={brand._id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 border border-orange-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {brand.icon && (
                                <img
                                    src={brand.icon}
                                    alt={brand.name}
                                    className="w-4 h-4 mr-1 rounded-sm object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            )}
                            {brand.name}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeBrand(brand._id);
                                }}
                                className="ml-1 text-orange-600 hover:text-orange-800 font-bold"
                            >
                                ×
                            </button>
                        </span>
                    ))
                ) : (
                    <span className="text-gray-500">Select brands...</span>
                )}
                
                {/* Dropdown indicator */}
                <span className="ml-auto text-gray-400">
                    {isOpen ? '▲' : '▼'}
                </span>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search brands..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Brand Options */}
                    <div className="max-h-48 overflow-y-auto">
                        {filteredBrands.length > 0 ? (
                            filteredBrands.map((brand) => (
                                <button
                                    key={brand._id}
                                    type="button"
                                    onClick={() => addBrand(brand)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 outline-none flex items-center gap-2"
                                >
                                    {brand.icon && (
                                        <img
                                            src={brand.icon}
                                            alt={brand.name}
                                            className="w-5 h-5 rounded-sm object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <span className="capitalize">{brand.name}</span>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-gray-500 text-center">
                                {searchTerm ? 'No brands found' : 'No more brands available'}
                            </div>
                        )}
                    </div>

                    {/* Close Button */}
                    <div className="p-3 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                setSearchTerm("");
                            }}
                            className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ExperienceAvailability = ({ control, errors, touchedFields = {} }) => {
    const [brands, setBrands] = useState([]);
    const [brandsLoading, setBrandsLoading] = useState(true);

    const specializationSuggestions = [
        "Mobile Phone Repair", "Laptop Repair", "Desktop Repair", "Tablet Repair",
        "Gaming Console Repair", "Smart TV Repair", "Home Appliances", "Audio Equipment",
        "Camera Repair", "Smartwatch Repair", "Printer Repair", "Router Repair"
    ];

    const workingDaysOptions = [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ];

    const fetchBrands = async () => {
        try {
            setBrandsLoading(true);
            const { data } = await axiosInstance.get('/public/brands');
            setBrands(data?.data?.brands || []);
        } catch (error) {
            console.error('Error fetching brands:', error);
            handleError(error);
        } finally {
            setBrandsLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Experience & Availability</h2>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience <span className="text-red-500">*</span></label>
                        <Controller
                            name="yearsOfExperience"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="number"
                                    min="0"
                                    max="50"
                                    step="1"
                                    placeholder="0"
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                                        errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                            )}
                        />
                        {/* FIXED: Removed touchedFields check - error hamesha show hoga */}
                        {errors.yearsOfExperience && (
                            <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Service Available?</label>
                        <Controller
                            name="pickupService"
                            control={control}
                            defaultValue={false}
                            render={({ field }) => (
                                <div className="flex items-center space-x-4 pt-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={field.value === true}
                                            onChange={() => field.onChange(true)}
                                            className="mr-2 text-orange-500 focus:ring-orange-500"
                                        />
                                        Yes
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={field.value === false}
                                            onChange={() => field.onChange(false)}
                                            className="mr-2 text-orange-500 focus:ring-orange-500"
                                        />
                                        No
                                    </label>
                                </div>
                            )}
                        />
                    </div>
                </div>

                {/* Custom Chip Input for Specializations */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specializations <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 ml-2">(Type and press Enter to add, or select from suggestions)</span>
                    </label>
                    <Controller
                        name="specializations"
                        control={control}
                        defaultValue={[]}
                        render={({ field }) => (
                            <ChipInput
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Add your specializations..."
                                suggestions={specializationSuggestions}
                                error={errors.specializations}
                                touched={touchedFields?.specializations}
                            />
                        )}
                    />
                    {errors.specializations && (
                        <p className="text-red-500 text-sm mt-1">{errors.specializations.message}</p>
                    )}
                </div>

                {/* Brand Dropdown - FIXED */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brands Worked With <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 ml-2">(Select from available brands)</span>
                    </label>
                    <Controller
                        name="brandsWorkedWith"
                        control={control}
                        defaultValue={[]}
                        render={({ field }) => (
                            <>
                                {brandsLoading ? (
                                    <div className="w-full border rounded-lg px-4 py-3 bg-gray-50 text-gray-500 text-center">
                                        Loading brands...
                                    </div>
                                ) : (
                                    <BrandDropdown
                                        value={field.value || []}
                                        onChange={field.onChange}
                                        brands={brands}
                                        error={errors.brandsWorkedWith}
                                        touched={touchedFields?.brandsWorkedWith}
                                    />
                                )}
                            </>
                        )}
                    />
                    {errors.brandsWorkedWith && (
                        <p className="text-red-500 text-sm mt-1">{errors.brandsWorkedWith.message}</p>
                    )}
                </div>



<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours - Start <span className="text-red-500">*</span></label>
    <Controller
      name="workingHours.start"
      control={control}
      render={({ field }) => (
        <div className="relative">
          <input
            type="time"
            value={field.value ? field.value.split(' ')[0] : ''} // Sirf time part (HH:MM)
            onChange={(e) => {
              const timeValue = e.target.value;
              if (timeValue) {
                // Detect if it should be AM or PM based on hour
                const [hours] = timeValue.split(':');
                const hour = parseInt(hours, 10);
                const period = hour >= 12 ? 'PM' : 'AM';
                // Save with AM/PM
                field.onChange(`${timeValue} ${period}`);
              } else {
                field.onChange('');
              }
            }}
            className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
              errors.workingHours?.start ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {/* {field.value && (
            <span className="absolute right-3 top-3 text-sm text-gray-500">
              {field.value.split(' ')[1]} 
            </span>
          )} */}
        </div>
      )}
    />
    {errors.workingHours?.start && (
      <p className="text-red-500 text-sm mt-1">{errors.workingHours.start.message}</p>
    )}
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours - End <span className="text-red-500">*</span></label>
    <Controller
      name="workingHours.end"
      control={control}
      render={({ field }) => (
        <div className="relative">
          <input
            type="time"
            value={field.value ? field.value.split(' ')[0] : ''}
            onChange={(e) => {
              const timeValue = e.target.value;
              if (timeValue) {
                const [hours] = timeValue.split(':');
                const hour = parseInt(hours, 10);
                const period = hour >= 12 ? 'PM' : 'AM';
                field.onChange(`${timeValue} ${period}`);
              } else {
                field.onChange('');
              }
            }}
            className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
              errors.workingHours?.end ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {/* {field.value && (
            <span className="absolute right-3 top-3 text-sm text-gray-500">
              {field.value.split(' ')[1]}
            </span>
          )} */}
        </div>
      )}
    />
    {errors.workingHours?.end && (
      <p className="text-red-500 text-sm mt-1">{errors.workingHours.end.message}</p>
    )}
  </div>
</div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Working Days <span className="text-red-500">*</span></label>
                    <Controller
                        name="workingDays"
                        control={control}
                        defaultValue={[]}
                        render={({ field }) => (
                            <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                                {workingDaysOptions.map((day) => (
                                    <label key={day} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={field.value.includes(day)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                const newValue = checked
                                                    ? [...field.value, day]
                                                    : field.value.filter(item => item !== day);
                                                field.onChange(newValue);
                                            }}
                                            className="text-orange-500 focus:ring-orange-500"
                                        />
                                        <span className="text-sm">{day}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    />
                    {errors.workingDays && (
                        <p className="text-red-500 text-sm mt-1">{errors.workingDays.message}</p>
                    )}
                </div>

              

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <textarea
                                    {...field}
                                    rows="4"
                                    placeholder="Describe your repair services, expertise, and what makes you unique..."
                                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                                        errors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {/* Character Counter */}
                                <div className="flex justify-between items-center mt-1">
                                    <span className={`text-xs ${field.value?.length < 50 ? 'text-red-500' : 'text-green-600'}`}>
                                        {field.value?.length || 0} / 1000 characters
                                    </span>
                                    {field.value?.length < 50 && (
                                        <span className="text-xs text-red-500">
                                            Minimum 50 characters required ({50 - (field.value?.length || 0)} left)
                                        </span>
                                    )}
                                    {field.value?.length > 950 && (
                                        <span className="text-xs text-orange-500">
                                            Maximum limit approaching
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    />
                    {errors.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export { ExperienceAvailability as default };

// Helper function to transform data before API submission - FIXED
export const transformFormDataForAPI = (formData) => {
    return {
        ...formData,
        yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : 0,
        brandsWorkedWith: formData.brandsWorkedWith || [],
        specializations: formData.specializations || [],
        workingDays: formData.workingDays || [],
        pickupService: formData.pickupService || false
    };
};