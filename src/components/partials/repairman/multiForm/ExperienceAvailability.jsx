"use client";
import { useState } from "react";
import { Controller } from "react-hook-form";

// Custom Chip Input Component - included in this file
const ChipInput = ({ value = [], onChange, placeholder, suggestions = [], error }) => {
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
      <div className={`min-h-[44px] border rounded-lg px-3 py-2 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all ${error ? 'border-red-500' : 'border-gray-300'
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

const ExperienceAvailability = ({ control, errors }) => {
  // Predefined suggestions for chips
  const specializationSuggestions = [
    "Mobile Phone Repair", "Laptop Repair", "Desktop Repair", "Tablet Repair",
    "Gaming Console Repair", "Smart TV Repair", "Home Appliances", "Audio Equipment",
    "Camera Repair", "Smartwatch Repair", "Printer Repair", "Router Repair"
  ];

  const brandSuggestions = [
    "Samsung", "Apple", "Huawei", "Xiaomi", "Oppo", "Vivo", "OnePlus",
    "HP", "Dell", "Lenovo", "Asus", "Acer", "Sony", "LG", "Realme", "Nokia"
  ];

  const workingDaysOptions = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

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
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              )}
            />
            {errors.yearsOfExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience.message}</p>}
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
              />
            )}
          />
          {errors.specializations && <p className="text-red-500 text-sm mt-1">{errors.specializations.message}</p>}
        </div>

        {/* Custom Chip Input for Brands */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brands Worked With
            <span className="text-xs text-gray-500 ml-2">(Type and press Enter to add, or select from suggestions)</span>
          </label>
          <Controller
            name="brandsWorkedWith"
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <ChipInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Add brands you work with..."
                suggestions={brandSuggestions}
                error={errors.brandsWorkedWith}
              />
            )}
          />
          {errors.brandsWorkedWith && <p className="text-red-500 text-sm mt-1">{errors.brandsWorkedWith.message}</p>}
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
          {errors.workingDays && <p className="text-red-500 text-sm mt-1">{errors.workingDays.message}</p>}
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
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.workingHours?.start ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              )}
            />
            {errors.workingHours?.start && <p className="text-red-500 text-sm mt-1">{errors.workingHours.start.message}</p>}
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
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.workingHours?.end ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              )}
            />
            {errors.workingHours?.end && <p className="text-red-500 text-sm mt-1">{errors.workingHours.end.message}</p>}
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
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ExperienceAvailability;