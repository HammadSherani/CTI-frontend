import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axiosInstance from '@/config/axiosInstance';
import * as yup from 'yup';



const DISPUTE_CATEGORIES = [
  { value: 'unfair_rating', label: 'Unfair Rating or Review' },
  { value: 'late_payment', label: 'Late or No Payment' },
  { value: 'rude_behavior', label: 'Rude or Abusive Behavior' },
  { value: 'cancellation_after_arrival', label: 'Customer Cancelled After Arrival' },
  { value: 'fake_request', label: 'Fake or Invalid Service Request' },
  { value: 'other', label: 'Other' },
];

const DISPUTE_SCHEMA = yup.object({
    category: yup
        .string()
        .required('Please select a dispute category'),
    description: yup
        .string()
        .required('Description is required')
        .min(5, 'Description must be at least 20 characters')
        .max(1000, 'Description cannot exceed 1000 characters')
});

function DisputesModal({ isOpen, onClose, bookingId }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(DISPUTE_SCHEMA),
    defaultValues: {
      category: '',
      description: ''
    }
  });

  const { token } = useSelector((state) => state.auth);
  const watchDescription = watch('description', '');

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  const onSubmit = async (formData) => {
    setIsSubmitting(true);

    try {
      const { data } = await axiosInstance.post('/disputes/create', {
        bookingId,
        category: formData.category,
        description: formData.description.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (data.success) {
        toast.success('Dispute created successfully');
        reset();
        onClose(); // Modal close on success
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create dispute';
      toast.error(errorMessage);
      console.error('Error creating dispute:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const commonInputClasses = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors`;
  const errorClasses = 'border-red-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-5 bg-opacity-20 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">Create Dispute</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Category Select */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Dispute Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                {...register('category')}
                className={`${commonInputClasses} ${errors.category ? errorClasses : 'border-gray-300'}`}
                disabled={isSubmitting}
              >
                <option value="">Select a category</option>
                {DISPUTE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Description Textarea */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={6}
                placeholder="Please describe your issue in detail..."
                className={`${commonInputClasses} resize-none ${errors.description ? errorClasses : 'border-gray-300'}`}
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center mt-1">
                <div>
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
                <p className={`text-sm ${watchDescription.length > 1000 ? 'text-red-600' : 'text-gray-500'}`}>
                  {watchDescription.length}/1000
                </p>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Payment for this booking will be held until the dispute is resolved</li>
                      <li>Our team will review your case within 24-48 hours</li>
                      <li>Both parties will be notified of the dispute status</li>
                      <li>False disputes may result in account penalties</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Dispute...
                  </span>
                ) : (
                  'Submit Dispute'
                )}
              </button>

              <button
                type="button"
                onClick={() => reset()}
                disabled={isSubmitting}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DisputesModal;