'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Icon } from '@iconify/react';

export const FileUpload = ({ label, name }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { 'image/*': [] },
  });

  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-800 mb-1.5">{label}</label>

      <div
        {...getRootProps()}
        className={`
          flex justify-center items-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg cursor-pointer transition-all
          ${isDragActive ? 'border-orange-400 bg-orange-50' : 'border-gray-300'}
        `}
      >
        <input {...getInputProps()} name={name} />
        <div className="text-center space-y-2">
          <Icon icon="mdi:cloud-upload-outline" className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-sm text-gray-600">
            <span className="font-medium text-orange-600 hover:text-orange-500">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          {selectedFile && <p className="text-sm text-gray-700 mt-2">Selected: {selectedFile.name}</p>}
        </div>
      </div>
    </div>
  );
};
