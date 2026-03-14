"use client";

import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '@/config/axiosInstance';
import { useSelector } from 'react-redux';

export default function ReviewModal({ 
  isOpen, 
  onClose, 
  selectedFields = [], 
  repairmanId, 
  onSubmit 
}) {
  const [reasons, setReasons] = useState({});
  const [overallComment, setOverallComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const { token } = useSelector(state => state.auth);

  console.log("Selected Fields for Review:", selectedFields);
  
  // Reset reasons when modal opens with new fields
  useEffect(() => {
    if (isOpen) {
      setReasons({});
      setOverallComment('');
    }
  }, [isOpen, selectedFields]);

  const handleReasonChange = (fieldId, value) => {
    setReasons(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async () => {
    // Check if all fields have reasons
    const missingReasons = selectedFields.filter(field => !reasons[field.id]?.trim());
    if (missingReasons.length > 0) {
      toast.error('Please provide a reason for all selected fields');
      return;
    }

    // Format the data for API
   const fieldNameMap = {
  // Personal
  "Full Name": "fullName",
  "Father's Name": "fatherName",
  "National ID": "nationalIdOrCitizenNumber",
  "Date of Birth": "dob",
  "Gender": "gender",
  "Email Address": "emailAddress",

  // Contact
  "Mobile Number": "mobileNumber",
  "WhatsApp Number": "whatsappNumber",
  "Emergency Contact": "emergencyContactPerson",
  "Emergency Number": "emergencyContactNumber",

  // Location
  "Country": "country",
  "State": "state",
  "City": "city",
  "Zip Code": "zipCode",
  "Full Address": "fullAddress",

  // Professional
  "Years of Experience": "yearsOfExperience",
  "Specializations": "specializations",
  "Brands Worked With": "brandsWorkedWith",
  "Description": "description",
  "Working Days": "workingDays",
  "Working Hours": "workingHours",          // or "workingHours.start" + "workingHours.end" if backend expects object
  "Pickup Service": "pickupService",

  // Documents — most important fixes here
  "Profile Photo": "profilePhoto",
  "National ID / Passport": "nationalIdOrPassportScan",   // ← fixed (was wrong before)
  "Shop Photo": "shopPhoto",
  "Utility Bill / Shop Proof": "utilityBillOrShopProof",  // ← fixed (was wrong before)
  "Certifications": "certifications",

  // Bank
  "Account Title": "accountTitle",
  "Account Number": "accountNumber",
  "Bank Name": "bankName",
  "Branch Name": "branchName",
  "IBAN": "iban",
  "Last Updated": "updatedAt",   // if you really want to allow reviewing "updatedAt"
};

    const reviewData = {
      fields: selectedFields.map(field => {
        return {
          fieldName: fieldNameMap[field.label] || field.label.toLowerCase().replace(/\s+/g, ''),
          issue: reasons[field.id]
        };
      }),
      overallComment: overallComment.trim() || undefined
    };

    setSubmitting(true);
    try {
      await axiosInstance.post(
        `/admin/repairman/${repairmanId}/field-review`,
        reviewData,
        { headers: { 'Authorization': 'Bearer ' + token } }
      );
      
      onSubmit?.();
      onClose();
      setReasons({});
      setOverallComment('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Group fields by tab
  const groupedFields = selectedFields.reduce((acc, field) => {
    if (!acc[field.tab]) {
      acc[field.tab] = [];
    }
    acc[field.tab].push(field);
    return acc;
  }, {});

  const totalFields = selectedFields.length;
  const completedReasons = Object.keys(reasons).length;

  // ✅ Helper function to check if field is an image type
  const isImageField = (fieldLabel) => {
    const imageFields = [
      'Profile Photo', 'National ID Scan', 'Shop Photo', 
      'Utility Bill', 'Certifications', 'Certificate'
    ];
    return imageFields.some(imgField => fieldLabel.includes(imgField));
  };

  const renderImagePreview = (field) => {
    // Check if value exists and is a valid URL
    if (!field.value) return null;
    console.log("Rendering image for field:", field.label, "with value:", field.value);
    // Handle Certifications array
    if (field.label === 'Certifications' && Array.isArray(field.value)) {
      const validImages = field.value.filter(url => url && typeof url === 'string' && url.trim() !== '');
      
      if (validImages.length === 0) {
        return <p className="text-gray-500 italic text-sm">No certification images</p>;
      }
      
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          {validImages.map((url, index) => (
            <div key={index} className="relative group">
              <div 
                className="w-16 h-16 rounded-lg border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-green-500 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedImage(url);
                }}
              >
                <img 
                  src={url} 
                  alt={`Cert ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/64?text=Error';
                  }}
                />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedImage(url);
                }}
                className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon icon="mdi:fullscreen" className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      );
    }
    
    // Handle single image (string URL)
    if (typeof field.value === 'string' && field.value.startsWith('http')) {
      return (
        <div className="relative group w-24 h-24 mt-2">
          <div 
            className="w-full h-full rounded-lg border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-green-500 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedImage(field.value);
            }}
          >
            <img 
              src={field.value} 
              alt={field.label}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/96?text=Error';
              }}
            />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedImage(field.value);
            }}
            className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Icon icon="mdi:fullscreen" className="w-3 h-3" />
          </button>
        </div>
      );
    }
    
    // Handle case where value might be an object or something else
    return <p className="text-gray-500 italic text-sm">Invalid image format</p>;
  };

  // ✅ Helper to render field value
  const renderFieldValue = (field) => {
    // For image fields
    if (isImageField(field.label)) {
      const imagePreview = renderImagePreview(field);
      if (imagePreview) return imagePreview;
    }
    
    // For array fields (like specializations, workingDays, etc.)
    if (Array.isArray(field.value)) {
      if (field.value.length === 0) {
        return <p className="text-gray-500 italic">No items</p>;
      }
      
      // Check if it's an array of objects (like brands)
      if (field.value.length > 0 && typeof field.value[0] === 'object') {
        return (
          <div className="flex flex-wrap gap-1">
            {field.value.map((item, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                {item.name || item.label || JSON.stringify(item)}
              </span>
            ))}
          </div>
        );
      }
      
      // Array of strings
      return (
        <div className="flex flex-wrap gap-1">
          {field.value.map((item, idx) => (
            <span key={idx} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
              {item}
            </span>
          ))}
        </div>
      );
    }
    
    // For object fields (country, state, city)
    if (typeof field.value === 'object' && field.value !== null) {
      return <p className="text-gray-900 font-medium">{field.value.name || field.value.label || JSON.stringify(field.value)}</p>;
    }
    
    // For boolean fields
    if (typeof field.value === 'boolean') {
      return <p className="text-gray-900 font-medium">{field.value ? 'Yes' : 'No'}</p>;
    }
    
    // For regular text fields
    return <p className="text-gray-900 font-medium break-words">{field.value || 'Not provided'}</p>;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Icon icon="mdi:clipboard-edit" className="w-8 h-8 text-green-500" />
                  Review Selected Fields
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Please provide reasons for each selected field
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <Icon icon="mdi:close" className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Fields to Review</span>
                <span className="font-medium text-green-600">
                  {completedReasons} / {totalFields} reasons added
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: totalFields > 0 ? `${(completedReasons / totalFields) * 100}%` : '0%' }}
                />
              </div>
            </div>

            {/* No Fields Selected */}
            {totalFields === 0 ? (
              <div className="text-center py-12">
                <Icon icon="mdi:alert-circle" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Fields Selected</h3>
                <p className="text-gray-500">Please select at least one field to review.</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* Fields Grouped by Tab */}
                <div className="space-y-6">
                  {Object.entries(groupedFields).map(([tab, fields]) => (
                    <div key={tab} className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Icon icon="mdi:folder" className="w-5 h-5 text-green-500" />
                        <h3 className="font-semibold text-gray-700 text-lg">{tab}</h3>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full ml-2">
                          {fields.length} {fields.length === 1 ? 'field' : 'fields'}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {fields.map(field => (
                          <div key={field.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start gap-3">
                              <Icon icon={field.icon || 'mdi:alert'} className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <label className="font-semibold text-gray-800">
                                    {field.label}
                                  </label>
                                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                    {tab}
                                  </span>
                                  {reasons[field.id] && (
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full ml-auto">
                                      Reason Added ✓
                                    </span>
                                  )}
                                </div>

                                {/* Current Value - with proper rendering */}
                                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">
                                    Current Value
                                  </span>
                                  
                                  {renderFieldValue(field)}
                                </div>

                                {/* Reason Input */}
                                <div>
                                  <span className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
                                    Reason for Review <span className="text-red-500">*</span>
                                  </span>
                                  <textarea
                                    placeholder={`Why is this field being reviewed?`}
                                    value={reasons[field.id] || ''}
                                    onChange={(e) => handleReasonChange(field.id, e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500
                                      ${reasons[field.id] ? 'border-green-300 bg-green-50/30' : 'border-gray-300'}`}
                                    rows={2}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Overall Comment Section */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-white rounded-lg p-5 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon icon="mdi:comment-text" className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <label className="block font-semibold text-gray-800 mb-2">
                        Overall Comment
                        <span className="text-xs text-gray-500 font-normal ml-2">(Optional)</span>
                      </label>
                      <textarea
                        value={overallComment}
                        onChange={(e) => setOverallComment(e.target.value)}
                        placeholder="Add any general comments about the application, overall feedback, or additional instructions..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                          This comment will be visible to the repairman
                        </p>
                        {overallComment && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {overallComment.length} characters
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Section */}
                {completedReasons === totalFields && totalFields > 0 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <Icon icon="mdi:check-circle" className="w-5 h-5" />
                      <span className="font-medium">All reasons provided! Ready to submit.</span>
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t sticky bottom-0 bg-white">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium transition-all"
                  >
                    <Icon icon="mdi:close" className="w-5 h-5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || completedReasons !== totalFields}
                    className="px-8 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 flex items-center gap-2 font-medium shadow-lg transition-all disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:send" className="w-5 h-5" />
                        Submit Review ({completedReasons}/{totalFields})
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {expandedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80" onClick={() => setExpandedImage(null)} />
          <div className="relative z-10 max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <Icon icon="mdi:close" className="w-8 h-8" />
            </button>
            <img 
              src={expandedImage} 
              alt="Preview"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/800?text=Image+Not+Found';
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}