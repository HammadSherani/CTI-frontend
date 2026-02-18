import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosInstance from "@/config/axiosInstance";
import { useState, useEffect } from "react";
import handleError from "@/helper/handleError";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import PartModal from "./PartModal";

const schema = yup.object({
    basePrice: yup
        .number()
        .required("Base price is required")
        .min(0.01, "Base price must be greater than 0")
        .typeError("Base price must be a valid number"),
    isPartRequired: yup.boolean(),
    partsEstimate: yup
        .number()
        .min(0, "Parts estimate cannot be negative")
        .nullable()
        .transform((value, originalValue) => originalValue === "" ? null : value),
    partsQuality: yup
        .string()
        .when('isPartRequired', {
            is: true,
            then: (schema) => schema.required("Parts quality is required when parts are needed"),
            otherwise: (schema) => schema.nullable()
        }),
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
        .min(1)
        .max(500, "Description cannot exceed 500 characters"),
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
        dropOffAvailable: yup.boolean(),
        pickupAvailable: yup.boolean(),
        pickupCharge: yup
            .number()
            .when('pickupAvailable', {
                is: true,
                then: (schema) => schema
                    .required("Pickup charge is required when pickup service is selected")
                    .min(0.01, "Pickup charge must be greater than 0"),
                otherwise: (schema) => schema.min(0, "Pickup charge cannot be negative").nullable()
            }),
        dropOffLocation: yup
            .string()
            .when('dropOffAvailable', {
                is: true,
                then: (schema) => schema
                    .required("Drop-off address is required when drop-off service is selected")
                    .min(10, "Address must be at least 10 characters"),
                otherwise: (schema) => schema.nullable()
            })
    }).test('at-least-one-service', 'Please select at least one service option (Drop-off or Pickup)', function(value) {
        return value.dropOffAvailable || value.pickupAvailable;
    })
});

export default function BidForm({
    jobId,
    repairmanId,
}) {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedParts, setSelectedParts] = useState([]);
    const router = useRouter();

    console.log('🔧 BidForm selectedParts:', selectedParts);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isValid }
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
        defaultValues: {
            basePrice: "",
            isPartRequired: false,
            partsEstimate: "",
            partsQuality: "original",
            estimatedTime: "",
            timeUnit: "days",
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
                dropOffAvailable: false,
                pickupAvailable: false,
                pickupCharge: 0,
                dropOffLocation: ""
            }
        }
    });

    // Auto-update partsEstimate when selectedParts changes
    useEffect(() => {
        const totalPrice = selectedParts.reduce((sum, part) => sum + (part.price || 0), 0);
        setValue('partsEstimate', totalPrice);
    }, [selectedParts, setValue]);

    const watchedValues = watch();
    const platformFeePercentage = 5;
    const isPartRequired = watch('isPartRequired');

    const totalPartsPrice = selectedParts.reduce((sum, part) => sum + (part.price || 0), 0);
    const basePrice = parseFloat(watchedValues.basePrice) || 0;
    const baseTotal = basePrice + totalPartsPrice;
    const pickupCharges = watchedValues.serviceOptions?.pickupAvailable ? (parseFloat(watchedValues.serviceOptions.pickupCharge) || 0) : 0;
    const totalPrice = baseTotal;
    const platformFee = (basePrice * platformFeePercentage) / 100;
    const netAmount = totalPrice - platformFee;
    const characterCount = watchedValues.description?.length || 0;
    const minCharacters = 1;

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

            const partIds = selectedParts.map(part => part._id || part.id);

            const payload = {
                jobId: jobId,
                repairmanId: repairmanId,
                requiredParts: partIds,
                isPartRequired: data.isPartRequired,
                selectedParts: selectedParts,
                pricing: {
                    basePrice: parseFloat(data.basePrice),
                    partsEstimate: totalPartsPrice,
                    totalPrice: totalPrice,
                    partsQuality: data.partsQuality || 'original',
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
                    preferredSlots: []
                },
                serviceOptions: {
                    dropOffAvailable: data.serviceOptions.dropOffAvailable,
                    pickupAvailable: data.serviceOptions.pickupAvailable,
                    pickupCharge: data.serviceOptions.pickupCharge || 0,
                    dropOffLocation: data.serviceOptions.dropOffLocation || ""
                },
                fees: {
                    platformFee: platformFee,
                    platformFeePercentage: platformFeePercentage
                },
                servicesIncluded: [],
                status: 'pending',
                expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
                // viewedByCustomer: false,
                locationContext: {
                    submissionMethod: 'profile-stored',
                    submittedAt: new Date(),
                    accuracyLevel: 'profile-based'
                },
                messages: []
            };

            const res = await axiosInstance.post(`/repairman/offers/jobs/${jobId}/offer`, payload, {
                headers: {
                    'Authorization': 'Bearer ' + repairmanId,
                }
            });

            toast.success(res.data.message);
            router.push('/repair-man/my-offers');

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

    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const handleRemovePart = (partId) => {
        const updatedParts = selectedParts.filter(p => p._id !== partId && p.id !== partId);
        setSelectedParts(updatedParts);
        
        // Uncheck isPartRequired if no parts left
        if (updatedParts.length === 0) {
            setValue('isPartRequired', false);
        }
    };

    const totalWithPickup = totalPrice + pickupCharges;

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

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
                
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <h6 className="text-lg font-bold text-gray-900">Proposal Description</h6>
                    </div>
                    
                    <div className="space-y-2">
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
                                        className={`block w-full px-3 py-3 border rounded-lg text-sm resize-none transition-colors duration-200 ${errors.description
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
                                Minimum {minCharacters} characters required (Max 500)
                            </span>
                            <span className={`font-medium ${characterCount >= minCharacters ? 'text-green-600' : 'text-gray-500'}`}>
                                {characterCount}/{minCharacters}
                            </span>
                        </div>
                        {errors.description && (
                            <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h6 className="text-lg font-bold text-gray-900">Pricing Details</h6>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Base Price */}
                        <div className="space-y-2 md:col-span-2">
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
                                            className={`block w-full pl-7 pr-3 py-2.5 border rounded-lg text-sm transition-colors duration-200 ${errors.basePrice
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

                        {/* Is Part Required Checkbox */}
                        <div className="md:col-span-2">
                            <div className="flex items-center space-x-3 p-4 bg-white border-2 border-gray-300 rounded-lg hover:border-primary-500 transition-colors">
                                <Controller
                                    name="isPartRequired"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="checkbox"
                                            id="isPartRequired"
                                            checked={field.value}
                                            onChange={(e) => {
                                                field.onChange(e.target.checked);
                                                if (!e.target.checked) {
                                                    // Clear parts when unchecked
                                                    setSelectedParts([]);
                                                    setValue('partsEstimate', 0);
                                                }
                                            }}
                                            className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                    )}
                                />
                                <label htmlFor="isPartRequired" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Parts Required for this Repair
                                </label>
                            </div>
                        </div>

                        {/* Parts Section - Only show if isPartRequired is true */}
                        {isPartRequired && (
                            <>
                                {/* Select Parts Button */}
                                <div className="md:col-span-2">
                                    <button
                                        onClick={() => setIsOpen(true)}
                                        type="button"
                                        className="w-full p-4 bg-primary-500 rounded-lg hover:bg-primary-600 cursor-pointer transition-colors">
                                        <span className="text-sm font-semibold text-white">
                                            {selectedParts.length > 0 ? `Selected Parts (${selectedParts.length})` : 'Select Required Parts'}
                                        </span>
                                    </button>
                                </div>

                                {/* Selected Parts Display */}
                                {selectedParts.length > 0 && (
                                    <div className="md:col-span-2 p-4 bg-white border-2 border-gray-200 rounded-lg">
                                        <h6 className="text-sm font-semibold text-gray-900 mb-3">Selected Parts</h6>
                                        <div className="space-y-2">
                                            {selectedParts.map((part) => (
                                                <div key={part._id || part.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{part.name}</p>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-xs text-gray-600">{part.brand?.name || 'N/A'} • {part.model?.name || 'N/A'}</span>
                                                            <span className="text-xs text-gray-600">SKU: {part.sku}</span>
                                                            <span className="text-xs font-medium text-green-600">{part.partType}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold text-primary-600">₺{part.price?.toLocaleString()}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemovePart(part._id || part.id)}
                                                            className="text-red-500 hover:text-red-700 transition-colors"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Parts Estimate */}
                                <div className="space-y-2 hidden">
                                    <label htmlFor="partsEstimate" className="block text-sm font-medium text-gray-700">
                                        Parts Estimate (Auto-calculated)
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
                                                    value={totalPartsPrice}
                                                    readOnly
                                                    className="block w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 cursor-not-allowed"
                                                    placeholder="0.00"
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 hidden">
                                    <label htmlFor="partsQuality" className="block text-sm font-medium text-gray-700">
                                        Parts Quality <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="partsQuality"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                {selectedParts.length > 0 ? (
                                                    <div className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50">
                                                        {selectedParts.map((part, index) => (
                                                            <div key={part.id} className="flex items-center justify-between py-1">
                                                                <span className="text-gray-700">{part.name}</span>
                                                                <span className="font-medium text-primary-600">{part.partType}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <select
                                                        {...field}
                                                        id="partsQuality"
                                                        className={`block w-full px-3 py-2.5 border rounded-lg text-sm transition-colors duration-200 ${errors.partsQuality
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
                                            </div>
                                        )}
                                    />
                                    {errors.partsQuality && (
                                        <p className="text-red-500 text-xs mt-1">{errors.partsQuality.message}</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {(watchedValues.basePrice || totalPartsPrice > 0) && (
                        <div className="mt-6 bg-white rounded-lg p-5 border-2 border-gray-300">
                            <h6 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Price Breakdown
                            </h6>
                            <div className="space-y-2.5 text-sm">
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-600">Base service price:</span>
                                    <span className="font-medium">₺{basePrice.toFixed(2)}</span>
                                </div>

                                {selectedParts.length > 0 && (
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <div className="flex justify-between py-1 mb-2">
                                            <span className="text-gray-700 font-medium">Parts breakdown:</span>
                                            <span className="font-medium">₺{totalPartsPrice.toFixed(2)}</span>
                                        </div>
                                        {selectedParts.map((part) => (
                                            <div key={part.id} className="flex justify-between py-1 pl-4 text-xs">
                                                <span className="text-gray-600">• {part.name}</span>
                                                <span className="text-gray-600">₺{part.price?.toFixed(2)}</span>
                                            </div>
                                        ))}
                                        <div className="mt-2 pt-2 border-t border-blue-200">
                                            <p className="text-xs text-green-600 font-medium">
                                                ✓ No commission on parts
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <hr className="border-gray-300 my-2" />

                                <div className="flex justify-between py-2 bg-gray-50 -mx-2 px-2 rounded-lg">
                                    <span className="text-gray-900 font-semibold">Subtotal:</span>
                                    <span className="text-gray-900 font-bold text-lg">₺{baseTotal.toFixed(2)}</span>
                                </div>

                                {watchedValues.serviceOptions?.pickupAvailable && pickupCharges > 0 && (
                                    <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
                                        <div className="flex items-start gap-2 mb-2">
                                            <span className="text-blue-600 text-lg">ℹ️</span>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                                                    IF CUSTOMER CHOOSES PICKUP SERVICE
                                                </p>
                                                <p className="text-xs text-blue-700 mt-1">
                                                    Additional charges will be added to the total
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-200">
                                            <span className="text-sm font-semibold text-blue-900">Pickup Charges:</span>
                                            <span className="text-sm font-bold text-blue-900">₺{pickupCharges.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}

                                {watchedValues.serviceOptions?.pickupAvailable && pickupCharges > 0 && (
                                    <div className="mt-3 p-3 bg-primary-100 border-2 border-primary-400 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-primary-900">Total (with Pickup):</span>
                                            <span className="font-bold text-primary-900 text-xl">₺{totalWithPickup.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 pt-3 border-t-2 border-gray-300">
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-600">Platform commission ({platformFeePercentage}% on base price only):</span>
                                        <span className="text-red-600 font-medium">-₺{platformFee.toFixed(2)}</span>
                                    </div>
                                </div>

                                <hr className="border-gray-300 my-2" />

                                <div className="flex justify-between py-2 bg-green-50 -mx-2 px-2 rounded-lg">
                                    <span className="text-gray-900 font-semibold">You'll receive:</span>
                                    <span className="text-green-600 font-bold text-lg">₺{netAmount.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-500 italic">
                                    * {platformFeePercentage}% commission applies only to base service price, not on parts
                                </p>
                            </div>
                        </div>
                    )}
                </div>


                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <h6 className="text-lg font-bold text-gray-900">Warranty & Timeline</h6>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            className={`flex-1 px-3 py-2.5 border rounded-lg text-sm transition-colors duration-200 ${errors.estimatedTime
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
                                            <option value="days">Days</option>
                                        </select>
                                    )}
                                />
                            </div>
                            {errors.estimatedTime && (
                                <p className="text-red-500 text-xs mt-1">{errors.estimatedTime.message}</p>
                            )}
                        </div>

                        {/* Can Start By */}
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
                                        className={`block w-full px-3 py-2.5 border rounded-lg text-sm transition-colors duration-200 ${getFieldError('availability.canStartBy')
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
                                            className={`block w-full px-3 py-2.5 border rounded-lg text-sm transition-colors duration-200 ${getFieldError('warranty.duration')
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

                        {/* Warranty Description */}
                        <div className="space-y-2">
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
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            <h6 className="text-lg font-bold text-gray-900">Service Options</h6>
                        </div>
                        <span className="text-xs text-red-500 font-medium">* Select at least one option</span>
                    </div>

                    {errors.serviceOptions?.message && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                            <p className="text-red-600 text-sm font-medium">{errors.serviceOptions.message}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Drop-off Service */}
                        <div className="flex items-start space-x-3 p-4 bg-white border-2 border-gray-200 rounded-lg">
                            <Controller
                                name="serviceOptions.dropOffAvailable"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="checkbox"
                                        id="dropOffService"
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                )}
                            />
                            <div className="flex-1">
                                <label htmlFor="dropOffService" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    Drop-off Service
                                    <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">FREE</span>
                                </label>
                                <p className="text-xs text-gray-600 mt-1">Customer will bring the item to your location</p>
                                
                                {watchedValues.serviceOptions?.dropOffAvailable && (
                                    <div className="mt-3">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Drop-off Location Address <span className="text-red-500">*</span>
                                        </label>
                                        <Controller
                                            name="serviceOptions.dropOffLocation"
                                            control={control}
                                            render={({ field }) => (
                                                <textarea
                                                    {...field}
                                                    rows={2}
                                                    placeholder="Enter your workshop/service center address"
                                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 resize-none ${
                                                        getFieldError('serviceOptions.dropOffLocation')
                                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                                                            : 'border-green-300 focus:border-primary-500 focus:ring-primary-100'
                                                    }`}
                                                />
                                            )}
                                        />
                                        {getFieldError('serviceOptions.dropOffLocation') && (
                                            <p className="text-red-500 text-xs mt-1">{getFieldError('serviceOptions.dropOffLocation')}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pickup Service */}
                        <div className="flex items-start space-x-3 p-4 bg-white border-2 border-gray-200 rounded-lg">
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
                                <p className="text-xs text-gray-600 mt-1">You will pick up the item from customer's location</p>
                                {watchedValues.serviceOptions?.pickupAvailable && (
                                    <div className="mt-3">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Pickup Service Charges <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 text-sm">₺</span>
                                            </div>
                                            <Controller
                                                name="serviceOptions.pickupCharge"
                                                control={control}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="number"
                                                        placeholder="Enter pickup charges"
                                                        className={`w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                                                            getFieldError('serviceOptions.pickupCharge')
                                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                                                                : 'border-blue-300 focus:border-primary-500 focus:ring-primary-100'
                                                        }`}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                )}
                                            />
                                        </div>
                                        {getFieldError('serviceOptions.pickupCharge') && (
                                            <p className="text-red-500 text-xs mt-1">{getFieldError('serviceOptions.pickupCharge')}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

               

                {/* Submit Button */}
                <div className="pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                        <button
                            type="submit"
                            disabled={!isValid || isSubmitting}
                            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${isValid && !isSubmitting
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

            <PartModal
                isOpen={isOpen}
                onClose={() => setIsOpen(!isOpen)}
                jobId={jobId}
                setPartsArray={setSelectedParts}
                initialSelectedParts={selectedParts}
            />
        </div>
    );
}