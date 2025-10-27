import React, { useState } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';

// Response Validation Schema
const RESPONSE_SCHEMA = yup.object({
    message: yup
        .string()
        .required('Response message is required')
        .trim()
        .min(10, 'Response must be at least 10 characters')
        .max(500, 'Response cannot exceed 500 characters')
});

const AddResponseModal = ({ isOpen, onClose, disputeId, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch
    } = useForm({
        resolver: yupResolver(RESPONSE_SCHEMA),
        defaultValues: {
            message: ''
        }
    });

    const { token } = useSelector((state) => state.auth);
    const watchMessage = watch('message', '');

    const onSubmit = async (formData) => {
        setIsSubmitting(true);

        try {
            const { data } = await axiosInstance.post(
                `/disputes/${disputeId}/response`,
                {
                    message: formData.message.trim()
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (data.success) {
                toast.success('Response added successfully');
                reset();
                onClose();
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to add response';
            toast.error(errorMessage);
            console.error('Error adding response:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            reset();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <svg 
                                    className="w-5 h-5 text-primary-600" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                                    />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Add Response</h2>
                                <p className="text-sm text-gray-600 mt-0.5">Share your response to this dispute</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                        {/* Info Box */}
                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg 
                                        className="h-5 w-5 text-primary-400" 
                                        viewBox="0 0 20 20" 
                                        fill="currentColor"
                                    >
                                        <path 
                                            fillRule="evenodd" 
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                                            clipRule="evenodd" 
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-primary-700">
                                        Your response will be visible to both parties and the admin team. 
                                        Please be professional and provide all relevant details.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Message Textarea */}
                        <div>
                            <label 
                                htmlFor="message" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Your Response <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="message"
                                {...register('message')}
                                rows={6}
                                placeholder="Type your response here..."
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-none ${
                                    errors.message ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={isSubmitting}
                            />
                            
                            {/* Error and Character Count */}
                            <div className="flex justify-between items-center mt-2">
                                <div>
                                    {errors.message && (
                                        <p className="text-sm text-red-600">{errors.message.message}</p>
                                    )}
                                </div>
                                <p className={`text-sm ${
                                    watchMessage.length > 500 
                                        ? 'text-red-600' 
                                        : watchMessage.length > 450 
                                            ? 'text-orange-600' 
                                            : 'text-gray-500'
                                }`}>
                                    {watchMessage.length}/500
                                </p>
                            </div>
                        </div>

                        {/* Guidelines */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Response Guidelines:</h3>
                            <ul className="text-sm text-gray-600 space-y-1.5">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">•</span>
                                    <span>Be clear and specific about the facts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">•</span>
                                    <span>Include any relevant details or evidence</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">•</span>
                                    <span>Maintain a professional and respectful tone</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-600 mt-0.5">•</span>
                                    <span>Avoid offensive language or personal attacks</span>
                                </li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
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
                                        Submitting...
                                    </span>
                                ) : (
                                    <>
                                        <svg 
                                            className="w-5 h-5 inline-block mr-2" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                                            />
                                        </svg>
                                        Submit Response
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddResponseModal;