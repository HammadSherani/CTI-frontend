import React, { useState } from 'react'

const BookingModal = ({ isOpen, onClose, offer, onSubmit, isSubmitting, job }) => {
    const [formData, setFormData] = useState({
        serviceType: '',
        scheduledDate: job?.availability?.canStartBy,
        // timeSlot: '',
        specialInstructions: ''
    });
    const [errors, setErrors] = useState({});

    

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.serviceType) newErrors.serviceType = 'Service type is required';
        if (!formData.scheduledDate) newErrors.scheduledDate = 'Scheduled date is required';
        if (!formData.timeSlot) newErrors.timeSlot = 'Time slot is required';

        // Validate date is not in the past
        const selectedDate = new Date(formData.scheduledDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            newErrors.scheduledDate = 'Date cannot be in the past';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const calculateTotalAmount = () => {
        let total = offer.pricing?.totalPrice || 0;
        
        if (formData.serviceType === 'pickup' && offer.serviceOptions?.pickupAvailable) {
            total += offer.serviceOptions.pickupCharge || 0;
        }
        if (formData.serviceType === 'home-service' && offer.serviceOptions?.homeService) {
            total += offer.serviceOptions.homeServiceCharge || 0;
        }
        
        return total;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 drop-shadow-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Book Service</h3>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={isSubmitting}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Service Type *
                            </label>
                            <select
                                value={formData.serviceType}
                                onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.serviceType ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={isSubmitting}
                            >
                                <option value="">Select service type</option>
                                <option value="shop">Bring to Shop</option>
                                {offer.serviceOptions?.pickupAvailable && (
                                    <option value="pickup">
                                        Pickup Service (+₨{offer.serviceOptions.pickupCharge})
                                    </option>
                                )}
                                {offer.serviceOptions?.homeService && (
                                    <option value="home-service">
                                        Home Service (+₨{offer.serviceOptions.homeServiceCharge || 0})
                                    </option>
                                )}
                            </select>
                            {errors.serviceType && (
                                <p className="text-red-500 text-xs mt-1">{errors.serviceType}</p>
                            )}
                        </div>

                        

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Special Instructions
                            </label>
                            <textarea
                                value={formData.specialInstructions}
                                onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                                placeholder="Any special instructions or requirements..."
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center text-sm">
                                <span>Base Price:</span>
                                <span>₨{offer.pricing?.totalPrice || 0}</span>
                            </div>
                            {formData.serviceType === 'pickup' && offer.serviceOptions?.pickupAvailable && (
                                <div className="flex justify-between items-center text-sm">
                                    <span>Pickup Charge:</span>
                                    <span>₨{offer.serviceOptions.pickupCharge}</span>
                                </div>
                            )}
                            {formData.serviceType === 'home-service' && offer.serviceOptions?.homeService && (
                                <div className="flex justify-between items-center text-sm">
                                    <span>Home Service Charge:</span>
                                    <span>₨{offer.serviceOptions.homeServiceCharge || 0}</span>
                                </div>
                            )}
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between items-center font-semibold">
                                    <span>Total Amount:</span>
                                    <span>₨{calculateTotalAmount()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
                                    isSubmitting 
                                        ? 'bg-blue-400 cursor-not-allowed' 
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Booking...
                                    </>
                                ) : (
                                    'Confirm Booking'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingModal
