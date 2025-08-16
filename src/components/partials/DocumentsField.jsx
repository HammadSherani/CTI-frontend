import { useState, useEffect, useCallback } from "react";
import { Controller } from "react-hook-form";

const DocumentField = ({ name, control, errors, label, accept, description, multiple = false }) => {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState(null);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Handle file change and generate preview
  const handleFileChange = useCallback(
    (e, onChange) => {
      const file = multiple ? e.target.files : e.target.files[0];
      if (file) {
        if (multiple) {
          onChange(e.target.files);
          setFileName(`${e.target.files.length} files selected`);
        } else {
          const isImage = file.type.startsWith("image/");
          setFileName(file.name);
          setPreview(isImage ? URL.createObjectURL(file) : null);
          onChange(file);
        }
      }
    },
    [multiple]
  );

  // Handle file removal
  const handleRemove = useCallback(
    (onChange) => {
      setPreview(null);
      setFileName(null);
      onChange(null);
    },
    []
  );

  // Handle drag-and-drop
  const handleDrop = useCallback(
    (e, onChange) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && accept.split(",").some((type) => file.type.includes(type.replace("*", "")))) {
        const isImage = file.type.startsWith("image/");
        setFileName(file.name);
        setPreview(isImage ? URL.createObjectURL(file) : null);
        onChange(file);
      }
    },
    [accept]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ...field } }) => (
          <div
            className={`relative border-2 rounded-lg p-4 bg-gray-50 transition-all duration-300 ${
              errors[name] ? "border-red-500" : "border-gray-300"
            } hover:border-orange-400 focus-within:border-orange-500`}
            onDrop={(e) => handleDrop(e, onChange)}
            onDragOver={handleDragOver}
          >
            <input
              {...field}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={(e) => handleFileChange(e, onChange)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label={`Upload ${label}`}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-6 h-6 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16V8m0 0l-4 4m4-4l4 4m6-8v12m-4-4l4 4m-4-4l-4 4"
                  />
                </svg>
                <span className="text-sm text-gray-600">
                  {fileName || `Drag and drop ${multiple ? "files" : "a file"} here or click to upload`}
                </span>
              </div>
            </div>
            {preview && (
              <div className="mt-4">
                <img
                  src={preview}
                  alt={`Preview of ${label}`}
                  className="w-32 h-32 object-cover rounded-lg shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(onChange)}
                  className="mt-2 text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
            {!preview && fileName && (
              <div className="mt-4 flex items-center space-x-2">
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 14l2-2m0 0l2-2m-2 2v-2m0 2l-2-2m2 2v2m0 4v-4m0 4l-2 2m0 0l2 2m-2-2h2m0-2h-2m2 2l2-2"
                  />
                </svg>
                <span className="text-sm text-gray-600">{fileName}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(onChange)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      />
      <p className="text-xs text-gray-500 mt-2">{description}</p>
      {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>}
    </div>
  );
};

export default DocumentField;