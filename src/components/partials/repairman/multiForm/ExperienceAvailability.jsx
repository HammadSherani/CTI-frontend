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

// Brand Dropdown Component
const BrandDropdown = ({ value = [], onChange, brands = [], error, touched }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter brands based on search term and exclude already selected ones
    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !value.some(selectedBrand => selectedBrand.id === brand._id)
    );

    const addBrand = (brand) => {
        // Add the full brand object to value array for display
        const brandWithId = { ...brand, id: brand._id };
        const newValue = [...value, brandWithId];
        onChange(newValue);
        setIsOpen(false);
        setSearchTerm("");
    };

    const removeBrand = (index) => {
        const newValue = value.filter((_, i) => i !== index);
        onChange(newValue);
    };

    return (
        <div className="relative">
            {/* Selected Brands Display */}
            <div className={`min-h-[44px] border rounded-lg px-3 py-2 flex flex-wrap gap-2 items-center transition-all ${error && touched ? 'border-red-500' : 'border-gray-300'}`}>
                {value.map((brand, index) => (
                    <span
                        key={brand.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 border border-primary-200"
                    >
                        {brand.icon && (
                            <img
                                src={brand.icon}
                                alt={brand.name}
                                className="w-4 h-4 mr-2 rounded-sm object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        )}
                        {brand.name}
                        <button
                            type="button"
                            onClick={() => removeBrand(index)}
                            className="ml-2 text-primary-600 hover:text-primary-800 font-bold"
                        >
                            ×
                        </button>
                    </span>
                ))}

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex-1 min-w-[120px] text-left text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    {value.length === 0 ? "Select brands..." : "Add more brands..."}
                </button>
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            autoFocus
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
                                    className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:bg-gray-100 outline-none flex items-center"
                                >
                                    {brand.icon && (
                                        <img
                                            src={brand.icon}
                                            alt={brand.name}
                                            className="w-6 h-6 mr-3 rounded-sm object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <div>
                                        <div className="font-medium capitalize">{brand.name}</div>
                                        <div className="text-xs text-gray-500">{brand.totalModels} models</div>
                                    </div>
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


const ExperienceAvailability = ({ control, errors, touchedFields }) => {
    // Local state to store the brands that will be worked with
    const [brands, setBrands] = useState([]);

    // Local state to track whether the brands are loading
    const [brandsLoading, setBrandsLoading] = useState(true);

    // Predefined suggestions for chips
    const specializationSuggestions = [
        "Mobile Phone Repair", "Laptop Repair", "Desktop Repair", "Tablet Repair",
        "Gaming Console Repair", "Smart TV Repair", "Home Appliances", "Audio Equipment",
        "Camera Repair", "Smartwatch Repair", "Printer Repair", "Router Repair"
    ];

    // Options for the working days
    const workingDaysOptions = [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ];

    // Function to fetch the brands
    const fetchBrands = async () => {
        try {
            // Set the loading state
            setBrandsLoading(true);

            // Make the API call
            const { data } = await axiosInstance.get('/public/brands');

            // Update the brands state
            setBrands(data?.data?.brands || []);

            // Log the result
            console.log('Fetched brands:', data?.data?.brands);
        } catch (error) {
            // Log the error
            console.error('Error fetching brands:', error);

            // Handle the error
            handleError(error);
        } finally {
            // Set the loading state to false
            setBrandsLoading(false);
        }
    };

    // Fetch the brands on mount
    useEffect(() => {
        fetchBrands();
    }, []);

    // Render the form
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Experience & Availability</h2>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                        <Controller
                            name="yearsOfExperience"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="number"
                                    min="0"
                                    max="50"
                                    placeholder="0"
                                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${errors.yearsOfExperience && touchedFields?.yearsOfExperience ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            )}
                        />
                        {errors.yearsOfExperience && touchedFields?.yearsOfExperience && (
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
                        Specializations
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
                    {errors.specializations && touchedFields?.specializations && (
                        <p className="text-red-500 text-sm mt-1">{errors.specializations.message}</p>
                    )}
                </div>

                {/* Brand Dropdown - Modified to handle ObjectId transformation */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brands Worked With
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
                                        value={field.value}
                                        onChange={(brands) => {
                                            // Store full brand objects for display
                                            field.onChange(brands);
                                        }}
                                        brands={brands}
                                        error={errors.brandsWorkedWith}
                                        touched={touchedFields?.brandsWorkedWith}
                                    />
                                )}
                            </>
                        )}
                    />
                    {errors.brandsWorkedWith && touchedFields?.brandsWorkedWith && (
                        <p className="text-red-500 text-sm mt-1">{errors.brandsWorkedWith.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                    <Controller
                        name="workingDays"
                        control={control}
                        defaultValue={[]}
                        render={({ field }) => (
                            <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                                {workingDaysOptions.map((day) => (
                                    <label key={day} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
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
                    {errors.workingDays && touchedFields?.workingDays && (
                        <p className="text-red-500 text-sm mt-1">{errors.workingDays.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours - Start</label>
                        <Controller
                            name="workingHours.start"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="time"
                                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${errors.workingHours?.start && touchedFields?.workingHours?.start ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            )}
                        />
                        {errors.workingHours?.start && touchedFields?.workingHours?.start && (
                            <p className="text-red-500 text-sm mt-1">{errors.workingHours.start.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours - End</label>
                        <Controller
                            name="workingHours.end"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="time"
                                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${errors.workingHours?.end && touchedFields?.workingHours?.end ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                            )}
                        />
                        {errors.workingHours?.end && touchedFields?.workingHours?.end && (
                            <p className="text-red-500 text-sm mt-1">{errors.workingHours.end.message}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <textarea
                                {...field}
                                rows="4"
                                placeholder="Describe your repair services, expertise, and what makes you unique..."
                                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${errors.description && touchedFields?.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                        )}
                    />
                    {errors.description && touchedFields?.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Export both the component and helper function
export { ExperienceAvailability as default };

// Helper function to transform data before API submission
export const transformFormDataForAPI = (formData) => {
    return {
        ...formData,
        brandsWorkedWith: formData.brandsWorkedWith?.map(brand => brand.id || brand._id) || []
    };
};