// components/repairman/FieldCorrections.jsx
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { getFieldLabel } from '@/utils/functions';

// Renders the correct input based on field type
function FieldInput({ fieldConfig, fieldName, value, onChange }) {
  const type = fieldConfig?.type || 'text';

  if (type === 'select') {
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
      >
        <option value="">Select {fieldConfig.label}</option>
        {fieldConfig.options?.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  if (type === 'multiselect') {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (opt) => {
      const updated = selected.includes(opt)
        ? selected.filter(d => d !== opt)
        : [...selected, opt];
      onChange(updated);
    };
    return (
      <div className="flex flex-wrap gap-2">
        {fieldConfig.options?.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              selected.includes(opt)
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (type === 'tags') {
    const tags = Array.isArray(value) ? value : [];
    const [inputVal, setInputVal] = useState('');
    const addTag = () => {
      const trimmed = inputVal.trim();
      if (trimmed && !tags.includes(trimmed)) {
        onChange([...tags, trimmed]);
        setInputVal('');
      }
    };
    const removeTag = (tag) => onChange(tags.filter(t => t !== tag));
    return (
      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
              {tag}
              <button type="button" onClick={() => removeTag(tag)}>
                <Icon icon="mdi:close" className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder={`Add ${fieldConfig.label} and press Enter`}
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Add
          </button>
        </div>
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
        placeholder={`Enter ${fieldConfig.label}`}
      />
    );
  }

  if (type === 'boolean') {
    return (
      <div className="flex gap-4">
        {[true, false].map(opt => (
          <label key={String(opt)} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="accent-primary-600"
            />
            <span>{opt ? 'Yes' : 'No'}</span>
          </label>
        ))}
      </div>
    );
  }

  if (type === 'workinghours') {
    const hours = typeof value === 'object' && value !== null ? value : { start: '', end: '' };
    return (
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Start Time</label>
          <input
            type="text"
            value={hours.start || ''}
            onChange={(e) => onChange({ ...hours, start: e.target.value })}
            placeholder="e.g. 09:00 AM"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">End Time</label>
          <input
            type="text"
            value={hours.end || ''}
            onChange={(e) => onChange({ ...hours, end: e.target.value })}
            placeholder="e.g. 06:00 PM"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
    );
  }

  if (type === 'file') {
    return (
      <p className="text-sm text-gray-500 italic">
        File fields cannot be edited here. Please re-upload from the registration form.
      </p>
    );
  }

  // Default: text, email, tel, number, date
  return (
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
      placeholder={`Enter correct ${fieldConfig?.label || fieldName}`}
    />
  );
}

// Format display value for current value preview
function formatDisplayValue(fieldName, value) {
  if (value === null || value === undefined || value === '') return 'Not provided';
  const config = getFieldLabel[fieldName];
  if (!config) return String(value);

  if (config.type === 'date') {
    try { return new Date(value).toLocaleDateString(); } catch { return value; }
  }
  if (config.type === 'boolean') return value ? 'Yes' : 'No';
  if (config.type === 'multiselect' || config.type === 'tags') {
    return Array.isArray(value) ? value.join(', ') : value;
  }
  if (config.type === 'workinghours') {
    return typeof value === 'object' ? `${value.start} - ${value.end}` : value;
  }
  return String(value);
}

export default function FieldCorrections({ reviewId }) {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [corrections, setCorrections] = useState({});
  const { token } = useSelector(state => state.auth);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/repairman/profile/field-reviews/${reviewId}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      setReviews(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch pending reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewDetails = async (id) => {
    try {
      const response = await axiosInstance.get(`/repairman/profile/field-reviews/${id}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const review = response.data.data;
      setSelectedReview(review);

      // Initialize corrections with current values, parsed correctly per type
      const initialCorrections = {};
      review.fields.forEach(field => {
        const config = getFieldLabel[field.fieldName];
        let val = field.currentValue ?? '';

        if (config?.type === 'multiselect' || config?.type === 'tags') {
          val = Array.isArray(field.currentValue) ? field.currentValue : [];
        } else if (config?.type === 'workinghours') {
          val = typeof field.currentValue === 'object' ? field.currentValue : { start: '', end: '' };
        } else if (config?.type === 'boolean') {
          val = field.currentValue === true || field.currentValue === 'true';
        } else if (config?.type === 'date' && field.currentValue) {
          // Format date to YYYY-MM-DD for date input
          try { val = new Date(field.currentValue).toISOString().split('T')[0]; } catch { val = ''; }
        }

        initialCorrections[field.fieldName] = val;
      });
      setCorrections(initialCorrections);
    } catch (error) {
      toast.error('Failed to fetch review details');
    }
  };

  const handleCorrectionChange = (fieldName, value) => {
    setCorrections(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmitCorrections = async () => {
    if (!selectedReview) return;

    const correctedFields = selectedReview.fields.map(field => ({
      fieldName: field.fieldName,
      correctedValue: corrections[field.fieldName]
    }));

    setSubmitting(true);
    try {
      await axiosInstance.post(
        `/repairman/profile/field-reviews/${selectedReview.reviewId}/correct`,
        { correctedFields },
        { headers: { 'Authorization': 'Bearer ' + token } }
      );
      toast.success('Corrections submitted successfully');
      await fetchPendingReviews();
      setSelectedReview(null);
      setCorrections({});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit corrections');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAll = async (id) => {
    try {
      setSubmitting(true);
      await axiosInstance.post(`/repairman/profile/field-reviews/${id}/submit`, {}, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      toast.success('All corrections submitted for admin review');
      await fetchPendingReviews();
      setSelectedReview(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Field Corrections Required</h1>

      {!selectedReview ? (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Icon icon="mdi:check-circle" className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Pending Corrections</h3>
              <p className="text-gray-500">All your fields are up to date!</p>
            </div>
          ) : (
            <div key={reviews.reviewId} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    Review from {new Date(reviews.createdAt).toLocaleDateString()}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{reviews.overallComment}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  reviews.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {reviews.status}
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Fields to correct:</h4>
                <ul className="space-y-2">
                  {reviews.fields?.map(field => {
                    const config = getFieldLabel[field.fieldName];
                    return (
                      <li key={field._id} className="flex items-start gap-2 text-sm">
                        <Icon
                          icon={field.status === 'resolved' ? 'mdi:check-circle' : 'mdi:alert-circle'}
                          className={`w-4 h-4 mt-0.5 ${field.status === 'resolved' ? 'text-green-500' : 'text-orange-500'}`}
                        />
                        <div>
                          <span className="font-medium">{config?.label || field.fieldName}:</span>
                          <span className="text-gray-600 ml-2">{field.issue}</span>
                          {field.status === 'resolved' && (
                            <span className="ml-2 text-green-600 text-xs">(Resolved ✓)</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => fetchReviewDetails(reviews.reviewId)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Correct Fields
                </button>

                {reviews.fields?.every(f => f.status === 'resolved') && (
                  <button
                    onClick={() => handleSubmitAll(reviews.reviewId)}
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                  >
                    Submit for Review
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <button
            onClick={() => setSelectedReview(null)}
            className="mb-4 text-primary-600 hover:text-primary-800 flex items-center gap-1"
          >
            <Icon icon="mdi:arrow-left" className="w-4 h-4" />
            Back to list
          </button>

          <h2 className="text-xl font-bold mb-1">Correct Fields</h2>
          <p className="text-gray-600 mb-6">{selectedReview.overallComment}</p>

          <div className="space-y-6">
            {selectedReview.fields.map(field => {
              const config = getFieldLabel[field.fieldName];
              const label = config?.label || field.fieldName;

              return (
                <div key={field.fieldName} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icon
                      icon={field.status === 'resolved' ? 'mdi:check-circle' : 'mdi:alert'}
                      className={`w-5 h-5 mt-1 ${field.status === 'resolved' ? 'text-green-500' : 'text-orange-500'}`}
                    />
                    <div className="flex-1">
                      {/* Field label + resolved badge */}
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{label}</h3>
                        {field.status === 'resolved' && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            Resolved ✓
                          </span>
                        )}
                      </div>

                      {/* Admin issue/message */}
                      <div className="flex items-start gap-1 mb-3">
                        <Icon icon="mdi:message-alert" className="w-4 h-4 text-red-400 mt-0.5" />
                        <p className="text-sm text-red-600">
                          <span className="font-medium">Admin note:</span> {field.issue}
                        </p>
                      </div>

                      {/* Current / old value */}
                      <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Current Value</span>
                        <p className="font-medium text-gray-700 mt-0.5">
                          {formatDisplayValue(field.fieldName, field.currentValue)}
                        </p>
                      </div>

                      {/* Corrected input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Corrected Value <span className="text-red-500">*</span>
                        </label>
                        <FieldInput
                          fieldConfig={config}
                          fieldName={field.fieldName}
                          value={corrections[field.fieldName]}
                          onChange={(val) => handleCorrectionChange(field.fieldName, val)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              onClick={() => setSelectedReview(null)}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitCorrections}
              disabled={submitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Corrections'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}