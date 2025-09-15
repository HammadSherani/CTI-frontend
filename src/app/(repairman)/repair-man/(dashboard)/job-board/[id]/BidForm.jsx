import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosInstance from "@/config/axiosInstance";
import { useState } from "react";
import handleError from "@/helper/handleError";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const schema = yup.object({
    basePrice: yup
        .number()
        .required("Base price is required")
        .min(0.01, "Base price must be greater than 0")
        .typeError("Base price must be a valid number"),
    partsEstimate: yup
        .number()
        .min(0, "Parts estimate cannot be negative")
        .nullable()
        .transform((value, originalValue) => originalValue === "" ? null : value),
    partsQuality: yup
        .string()
        .required("Parts quality is required"),
    estimatedTime: yup
        .number()
        .required("Estimated time is required")
        .min(1, "Estimated time must be at least 1")
        .integer("Estimated time must be a whole number")
        .typeError("Estimated time must be a valid number"),
    timeUnit: yup
        .string()
        .required("Time unit is required"),
    description: yup
        .string()
        .required("Description is required")
        .min(100, "Description must be at least 100 characters")
        .max(300, "Description cannot exceed 300 characters"),
    warranty: yup.object({
        duration: yup
            .number()
            .required("Warranty duration is required")
            .min(1, "Warranty duration must be at least 1 day")
            .typeError("Warranty duration must be a valid number"),
        description: yup.string(),
        terms: yup.string()
    }),
    availability: yup.object({
        canStartBy: yup
            .date()
            .required("Start date is required")
            .min(new Date(), "Start date cannot be in the past")
    }),
    serviceOptions: yup.object({
        pickupAvailable: yup.boolean(),
        pickupCharge: yup.number().min(0, "Pickup charge cannot be negative"),
        homeService: yup.boolean(),
        homeServiceCharge: yup.number().min(0, "Home service charge cannot be negative")
    })
});

export default function BidForm({ 
    jobId, 
    repairmanId, 
}) {

    const [isSubmitting, setIsSubmitting] = useState(false); 
    const router = useRouter()

    console.log(jobId, repairmanId);
    
    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isValid }
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
        defaultValues: {
            basePrice: "",
            partsEstimate: "",
            partsQuality: "original",
            estimatedTime: "",
            timeUnit: "hours",
            description: "",
            warranty: {
                duration: "",
                description: "",
                terms: ""
            },
            availability: {
                canStartBy: ""
            },
            serviceOptions: {
                pickupAvailable: false,
                pickupCharge: 0,
                homeService: false,
                homeServiceCharge: 0
            }
        }
    });

    const watchedValues = watch();
    const platformFee = 5;
    const totalPrice = (parseFloat(watchedValues.basePrice) || 0) + (parseFloat(watchedValues.partsEstimate) || 0);
    const netAmount = totalPrice ? Math.max(0, totalPrice - platformFee) : 0;
    const characterCount = watchedValues.description?.length || 0;
    const minCharacters = 100;

    const partsQualityOptions = [
        { value: 'original', label: 'Original Parts' },
        { value: 'a-plus', label: 'A+ Quality Parts' },
        { value: 'refurbished-original', label: 'Refurbished Original' },
        { value: 'china-copy', label: 'China Copy Parts' },
        { value: 'other', label: 'Other Quality' }
    ];

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            const payload = {
                jobId: jobId,
                repairmanId: repairmanId,
                
                pricing: {
                    basePrice: parseFloat(data.basePrice),
                    partsEstimate: parseFloat(data.partsEstimate) || 0,
                    totalPrice: (parseFloat(data.basePrice) || 0) + (parseFloat(data.partsEstimate) || 0),
                    partsQuality: data.partsQuality,
                    currency: 'TRY'
                },
                
                estimatedTime: {
                    value: parseInt(data.estimatedTime),
                    unit: data.timeUnit
                },
                
                description: data.description,
                
                warranty: {
                    duration: parseInt(data.warranty.duration),
                    description: data.warranty.description || '',
                    terms: data.warranty.terms || ''
                },
                
                availability: {
                    canStartBy: new Date(data.availability.canStartBy),
                    preferredSlots: [] // Can be enhanced later
                },
                
                serviceOptions: {
                    pickupAvailable: data.serviceOptions.pickupAvailable,
                    pickupCharge: data.serviceOptions.pickupCharge || 0,
                    homeService: data.serviceOptions.homeService,
                    homeServiceCharge: data.serviceOptions.homeServiceCharge || 0,
                    dropOffLocation: ""
                },
                
                // Default fields
                servicesIncluded: [],
                // experience: defaultExperience,
                status: 'pending',
                expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
                viewedByCustomer: false,
                
                // Location context
                locationContext: {
                    submissionMethod: 'profile-stored',
                    submittedAt: new Date(),
                    accuracyLevel: 'profile-based'
                },
                
                // Communication array
                messages: []
            };
            
            console.log("Payload to send:", payload);

            const res  = await axiosInstance.post(`/repairman/offers/jobs/${jobId}/offer`, payload, {
                headers: {
                    'Authorization': 'Bearer ' + repairmanId,
                }
            });

            toast.success(res.data.message);
            router.push('/repair-man/dashboard');
            
            console.log("Response from server:", res.data);
            // Here you would make the API call
            // Example:
            // const response = await fetch('/api/repair-offers', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(payload)
            // });
            // 
            // if (!response.ok) throw new Error('Failed to submit offer');
            // const result = await response.json();
            
            // Call success callback if provided
            // if (onSubmitSuccess) {
            //     onSubmitSuccess(payload);
            // }
            
        } catch (error) {
            handleError(error)
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFieldError = (fieldName) => {
        const fieldPath = fieldName.split('.');
        let error = errors;
        for (const path of fieldPath) {
            error = error?.[path];
        }
        return error?.message;
    };

    // Get minimum date for availability (today)
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="px-6 py-4 border-b border-gray-100">
                <h5 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Submit Your Repair Offer
                </h5>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Base Price */}
                    <div className="space-y-2">
                        <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700">
                            Base Service Price <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-sm">₺</span>
                            </div>
                            <Controller
                                name="basePrice"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        id="basePrice"
                                        type="number"
                                        className={`block w-full pl-7 pr-3 py-2.5 border rounded-lg text-sm transition-colors duration-200 ${
                                            errors.basePrice
                                                ? 'border-red-500 ring-2 ring-red-100'
                                                : 'border-gray-300 hover:border-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                                        } focus:outline-none`}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                )}
                            />
                        </div>
                        {errors.basePrice && (
                            <p className="text-red-500 text-xs mt-1">{errors.basePrice.message}</p>
                        )}
                    </div>

                    {/* Parts Estimate */}
                    <div className="space-y-2">
                        <label htmlFor="partsEstimate" className="block text-sm font-medium text-gray-700">
                            Parts Estimate
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-sm">₺</span>
                            </div>
                            <Controller
                                name="partsEstimate"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        id="partsEstimate"
                                        type="number"
                                        className={`block w-full pl-7 pr-3 py-2.5 border rounded-lg text-sm transition-colors duration-200 ${
                                            errors.partsEstimate
                                                ? 'border-red-500 ring-2 ring-red-100'
                                                : 'border-gray-300 hover:border-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                                        } focus:outline-none`}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                )}
                            />
                        </div>
                        {errors.partsEstimate && (
                            <p className="text-red-500 text-xs mt-1">{errors.partsEstimate.message}</p>
                        )}
                    </div>

                    {/* Parts Quality */}
                    <div className="space-y-2">
                        <label htmlFor="partsQuality" className="block text-sm font-medium text-gray-700">
                            Parts Quality
                        </label>
                        <Controller
                            name="partsQuality"
                            control={control}
                            render={({ field }) => (
                                <select
                                    {...field}
                                    id="partsQuality"
                                    className={`block w-full px-3 py-2.5 border rounded-lg text-sm transition-colors duration-200 ${
                                        errors.partsQuality
                                            ? 'border-red-500 ring-2 ring-red-100'
                                            : 'border-gray-300 hover:border-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                                    } focus:outline-none`}
                                >
                                    {partsQualityOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            )}
                        />
                        {errors.partsQuality && (
                            <p className="text-red-500 text-xs mt-1">{errors.partsQuality.message}</p>
                        )}
                    </div>

                    {/* Estimated Time */}
                    <div className="space-y-2">
                        <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700">
                            Estimated Time <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            <Controller
                                name="estimatedTime"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        id="estimatedTime"
                                        type="number"
                                        className={`flex-1 px-3 py-2.5 border rounded-lg text-sm transition-colors duration-200 ${
                                            errors.estimatedTime
                                                ? 'border-red-500 ring-2 ring-red-100'
                                                : 'border-gray-300 hover:border-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                                        } focus:outline-none`}
                                        placeholder="2"
                                        min="1"
                                    />
                                )}
                            />
                            <Controller
                                name="timeUnit"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                                    >
                                        <option value="hours">Hours</option>
                                        <option value="days">Days</option>
                                    </select>
                                )}
                            />
                        </div>
                        {errors.estimatedTime && (
                            <p className="text-red-500 text-xs mt-1">{errors.estimatedTime.message}</p>
                        )}
                    </div>

                    {/* Warranty Duration */}
                    <div className="space-y-2">
                        <label htmlFor="warrantyDuration" className="block text-sm font-medium text-gray-700">
                            Warranty Duration <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Controller
                                name="warranty.duration"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        id="warrantyDuration"
                                        type="number"
                                        className={`block w-full px-3 py-2.5 border rounded-lg text-sm transition-colors duration-200 ${
                                            getFieldError('warranty.duration')
                                                ? 'border-red-500 ring-2 ring-red-100'
                                                : 'border-gray-300 hover:border-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                                        } focus:outline-none`}
                                        placeholder="30"
                                        min="1"
                                    />
                                )}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-sm">days</span>
                            </div>
                        </div>
                        {getFieldError('warranty.duration') && (
                            <p className="text-red-500 text-xs mt-1">{getFieldError('warranty.duration')}</p>
                        )}
                    </div>

                    {/* Availability */}
                    <div className="space-y-2">
                        <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                            Can Start By <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="availability.canStartBy"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    id="availability"
                                    type="date"
                                    className={`block w-full px-3 py-2.5 border rounded-lg text-sm transition-colors duration-200 ${
                                        getFieldError('availability.canStartBy')
                                            ? 'border-red-500 ring-2 ring-red-100'
                                            : 'border-gray-300 hover:border-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                                    } focus:outline-none`}
                                    min={getMinDateTime()}
                                />
                            )}
                        />
                        {getFieldError('availability.canStartBy') && (
                            <p className="text-red-500 text-xs mt-1">{getFieldError('availability.canStartBy')}</p>
                        )}
                    </div>
                </div>

                {/* Service Options */}
                <div className="mt-6 space-y-4">
                    <h6 className="text-lg font-medium text-gray-900">Service Options</h6>
                    
                    <div className="flex items-start space-x-3">
                        <Controller
                            name="serviceOptions.pickupAvailable"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="checkbox"
                                    id="pickupService"
                                    checked={field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                            )}
                        />
                        <div className="flex-1">
                            <label htmlFor="pickupService" className="text-sm font-medium text-gray-700">
                                Pickup Service Available
                            </label>
                            {watchedValues.serviceOptions?.pickupAvailable && (
                                <div className="mt-2">
                                    <Controller
                                        name="serviceOptions.pickupCharge"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="number"
                                                placeholder="Pickup charge (₺)"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                                                min="0"
                                                step="0.01"
                                            />
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <Controller
                            name="serviceOptions.homeService"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="checkbox"
                                    id="homeService"
                                    checked={field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                            )}
                        />
                        <div className="flex-1">
                            <label htmlFor="homeService" className="text-sm font-medium text-gray-700">
                                Home Service Available
                            </label>
                            {watchedValues.serviceOptions?.homeService && (
                                <div className="mt-2">
                                    <Controller
                                        name="serviceOptions.homeServiceCharge"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="number"
                                                placeholder="Home service charge (₺)"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                                                min="0"
                                                step="0.01"
                                            />
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Warranty Description */}
                <div className="mt-6 space-y-2">
                    <label htmlFor="warrantyDescription" className="block text-sm font-medium text-gray-700">
                        Warranty Description
                    </label>
                    <Controller
                        name="warranty.description"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                id="warrantyDescription"
                                type="text"
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                                placeholder="e.g., Full parts and labor warranty"
                            />
                        )}
                    />
                </div>

                {/* Warranty Terms
                <div className="mt-4 space-y-2">
                    <label htmlFor="warrantyTerms" className="block text-sm font-medium text-gray-700">
                        Warranty Terms & Conditions
                    </label>
                    <Controller
                        name="warranty.terms"
                        control={control}
                        render={({ field }) => (
                            <textarea
                                {...field}
                                id="warrantyTerms"
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:border-primary-500"
                                rows={3}
                                placeholder="e.g., Warranty covers parts and labor. Does not cover damage from misuse..."
                                maxLength={200}
                            />
                        )}
                    />
                </div> */}

                {/* Description */}
                <div className="mt-6 space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Describe your proposal <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <textarea
                                    {...field}
                                    id="description"
                                    className={`block w-full px-3 py-3 border rounded-lg text-sm resize-none transition-colors duration-200 ${
                                        errors.description
                                            ? 'border-red-500 ring-2 ring-red-100'
                                            : 'border-gray-300 hover:border-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                                    } focus:outline-none`}
                                    rows={6}
                                    placeholder="Explain how you'll approach this repair, your relevant experience, and why you're the right person for the job..."
                                    maxLength={300}
                                />
                            )}
                        />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">
                            Minimum {minCharacters} characters required (Max 300)
                        </span>
                        <span className={`font-medium ${
                            characterCount >= minCharacters ? 'text-green-600' : 'text-gray-500'
                        }`}>
                            {characterCount}/{minCharacters}
                        </span>
                    </div>
                    {errors.description && (
                        <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                    )}
                </div>

                {/* Price Summary */}
                {(watchedValues.basePrice || watchedValues.partsEstimate) && (
                    <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h6 className="text-sm font-medium text-gray-900 mb-3">Price Breakdown</h6>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Base service price:</span>
                                <span className="font-medium">₺{(parseFloat(watchedValues.basePrice) || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Parts estimate:</span>
                                <span className="font-medium">₺{(parseFloat(watchedValues.partsEstimate) || 0).toFixed(2)}</span>
                            </div>
                            {watchedValues.serviceOptions?.pickupAvailable && watchedValues.serviceOptions?.pickupCharge > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Pickup service:</span>
                                    <span className="font-medium">₺{(parseFloat(watchedValues.serviceOptions.pickupCharge) || 0).toFixed(2)}</span>
                                </div>
                            )}
                            {watchedValues.serviceOptions?.homeService && watchedValues.serviceOptions?.homeServiceCharge > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Home service:</span>
                                    <span className="font-medium">₺{(parseFloat(watchedValues.serviceOptions.homeServiceCharge) || 0).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Platform fee:</span>
                                <span className="text-red-600">-₺{platformFee.toFixed(2)}</span>
                            </div>
                            <hr className="border-gray-200" />
                            <div className="flex justify-between font-semibold">
                                <span className="text-gray-900">Total for customer:</span>
                                <span className="text-blue-600">₺{totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span className="text-gray-900">You'll receive:</span>
                                <span className="text-green-600">₺{netAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                        <button
                            type="submit"
                            disabled={!isValid || isSubmitting}
                            className={`px-8 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                                isValid && !isSubmitting
                                    ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                </div>
                            ) : (
                                'Submit Offer'
                            )}
                            
                        </button>
                    </div>

                    {!isValid && (
                        <p className="mt-3 text-sm text-gray-500 text-center">
                            Please fill in all required fields to submit your offer
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}