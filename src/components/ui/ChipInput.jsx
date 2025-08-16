import { useState } from "react";

export const ChipInput = ({ value = [], onChange, placeholder, suggestions = [], error }) => {
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