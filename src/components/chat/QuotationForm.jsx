"use client"

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import PartModal from '@/app/(repairman)/repair-man/(dashboard)/job-board/[id]/PartModal';

const quotationSchema = yup.object().shape({
    brandName: yup
        .string()
        .required('Brand name is required')
        .min(2, 'Brand name must be at least 2 characters'),
    modelName: yup
        .string()
        .required('Model name is required')
        .min(2, 'Model name must be at least 2 characters'),
    partsQuality: yup
        .string()
        .required('Parts quality is required')
        .oneOf(['original', 'a-plus', 'china-copy', 'refurbished-original', 'other'], 'Invalid parts quality'),
    basePrice: yup
        .number()
        .required('Base price is required')
        .positive('Base price must be a positive number')
        .typeError('Base price must be a valid number'),
    serviceCharges: yup
        .number()
        .when('serviceType', {
            is: 'pickup',
            then: (schema) => schema.required('Service charges required').positive(),
            otherwise: (schema) => schema.nullable().default(0)
        }),

    dropoffAddress: yup
        .string()
        .when('serviceType', {
            is: 'drop-off',
            then: (schema) => schema.required('Drop-off address is required'),
            otherwise: (schema) => schema.nullable()
        }),
    partsPrice: yup
        .number()
        .min(0, 'Parts price cannot be negative')
        .default(0)
        .typeError('Parts price must be a valid number'),
    description: yup
        .string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description cannot exceed 500 characters'),
    estimatedDuration: yup
        .number()
        .required('Estimated duration is required')
        .positive('Duration must be positive')
        .typeError('Estimated duration must be a number'),
    serviceType: yup
        .string()
        .required('Service type is required')
        .oneOf(['drop-off', 'pickup'], 'Invalid service type'),
    warranty: yup
        .number()
        .min(0, 'Warranty cannot be negative')
        .nullable()
        .typeError('Warranty must be a number'),
    repairmanNotes: yup
        .string()
        .max(200, 'Notes cannot exceed 200 characters')
        .nullable()
});

const QuotationForm = ({ chatId, onClose, onSuccess }) => {
    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [services, setService] = useState([])
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedParts, setSelectedParts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [selectedBrandId, setSelectedBrandId] = useState('');
    const [selectedModelId, setSelectedModelId] = useState('');
    const [isPartRequired, setIsPartRequired] = useState(false);
    const [isPartModalOpen, setIsPartModalOpen] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(quotationSchema),
        defaultValues: {
            brandName: '',
            modelName: '',
            partsQuality: 'original',
            basePrice: '',
            serviceCharges: 0,
            partsPrice: 0,
            dropoffAddress: '',
            description: '',
            estimatedDuration: '',
            serviceType: 'drop-off',
            warranty: '',
            repairmanNotes: ''
        }
    });

    const fetchBrands = async () => {
        try {
            const response = await axiosInstance.get('/public/brands', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setBrands(response.data.data.brands || []);
        } catch (error) {
            handleError(error);
        }
    };

    const fetchModels = async (brandId) => {
        if (!brandId) {
            setModels([]);
            setValue('modelName', '');
            setSelectedModelId('');
            return;
        }
        try {
            const response = await axiosInstance.get(`/public/models/brand/${brandId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setModels(response.data.data.models || []);
        } catch (error) {
            handleError(error);
            setModels([]);
        }
    };


    const fetchServices = async () => {
        try {
            const response = await axiosInstance.get('/public/services', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setService(response.data.data || []);
        } catch (error) {
            handleError(error);
        }
    };




    useEffect(() => {
        fetchBrands();
        fetchServices();

        localStorage.setItem(`isPartRequired_chat_${chatId}`, 'false');

        const keys = Object.keys(localStorage);
        const matchedKey = keys.find(key => key.endsWith(chatId));

        const isSameChat = matchedKey === `isPartRequired_chat_${chatId}`;
        console.log("Is same chat? ", isSameChat);

    }, [token]);


    useEffect(() => {
        if (selectedBrandId) {
            fetchModels(selectedBrandId);
        } else {
            setModels([]);
            setSelectedModelId('');
            setValue('modelName', '');
        }
    }, [selectedBrandId]);

    const handleIsPartRequiredToggle = (e, chatId) => {
        const isChecked = e.target.checked;

        // Save: isPartRequired_chat_123
        localStorage.setItem('isPartRequired_chat_' + chatId, isChecked);

        // Check: find key that ends with the chatId
        const keys = Object.keys(localStorage);

        const matchedKey = keys.find(key => key.endsWith(chatId));

        const isSameChat = matchedKey === `isPartRequired_chat_${chatId}`;

        console.log("Is same chat?", isSameChat); // true or false

        setIsPartRequired(isChecked);
    };


    console.log('brands', brands);
    console.log('models', models);
    console.log('selectedParts', selectedParts);


    // const getSelectedParts = (chatId) => {
    //     const chatIdEnd = chatId.split('_').pop();

    //     const key = `selectedParts_quotation_chat_${chatIdEnd}`;

    //     const storedData = localStorage.getItem(key);

    //     if (storedData) {
    //         setSelectedParts(JSON.parse(storedData));
    //     } else {
    //         setSelectedParts([]);
    //     }
    // };


    const watchedServiceType = watch('serviceType');
    const watchedBasePrice = watch('basePrice');
    const watchedServiceCharges = watch('serviceCharges');
    const watchedPartsPrice = watch('partsPrice');
    const watchedDescription = watch('description');
    const watchedRepairmanNotes = watch('repairmanNotes');
    const watchedDropoffAddress = watch('dropoffAddress');

    const serviceTypeOptions = [
        { value: 'drop-off', label: 'Drop-off Service' },
        { value: 'pickup', label: 'Pickup Service' },
    ];

    const calculateSubtotal = () => {
        const basePrice = parseFloat(watchedBasePrice) || 0;

        const partsPrice = isPartRequired
            ? selectedParts.reduce(
                (total, part) => total + Number(part.price || 0),
                0
            )
            : 0;

        return (basePrice + partsPrice);
    };



    const calculateGrandTotal = () => {
        const subtotal = calculateSubtotal();
        const serviceCharges = (watchedServiceType === 'pickup')
            ? (parseFloat(watchedServiceCharges) || 0)
            : 0;
        return subtotal + serviceCharges;
    };

    const handleRemoveService = (serviceToRemove) => {
        setSelectedServices(selectedServices.filter(service => service !== serviceToRemove));
    };

    const handleServiceSelect = (serviceId) => {
        const selectedService = services.find(s => s._id === serviceId);
        if (selectedService && !selectedServices.some(s => s === selectedService._id)) {
            setSelectedServices([...selectedServices, selectedService._id]);
        }
    };

    const onSubmit = async (data) => {
        if (selectedServices.length === 0) {
            handleError({ message: 'Please add at least one repair service' });
            return;
        }

        setLoading(true);

        try {
            const quotationData = {
                deviceInfo: {
                    brandName: data.brandName.trim(),
                    modelName: data.modelName.trim(),
                    repairServices: selectedServices
                },
                partsQuality: data.partsQuality,
                basePrice: parseFloat(data.basePrice),
                partsPrice: parseFloat(data.partsPrice) || 0,
                description: data.description.trim(),
                estimatedDuration: data.estimatedDuration.toString(),
                ...(data.warranty && { warranty: data.warranty.toString() }),
                ...(data.repairmanNotes && { repairmanNotes: data.repairmanNotes.trim() }),

                ...(data.serviceType === 'pickup' && {
                    serviceType: 'pickup',
                    serviceCharges: parseFloat(data.serviceCharges) || 0,
                    isPickup: true,
                    isDropoff: false,
                    pickupLocation: {
                        address: ''
                    },
                    dropoffLocation: {
                        address: ''
                    }
                }),

                ...(data.serviceType === 'drop-off' && {
                    serviceType: 'drop-off',
                    serviceCharges: 0,
                    isPickup: false,
                    isDropoff: true,
                    pickupLocation: {
                        address: ''
                    },
                    dropoffLocation: {
                        address: data.dropoffAddress.trim()
                    }
                })
            };

            console.log('Sending quotation data:', quotationData);

            const response = await axiosInstance.post(
                `/chat/${chatId}/send-quotation`,
                quotationData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                onSuccess?.(response.data.data.quotation);
                onClose();
            }
        } catch (error) {
            console.error('Send quotation error:', error);
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    console.log('chatId', chatId);
    console.log('selectedParts in quotation form', selectedParts);


    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-primary-600 text-white px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Create Quotation</h2>
                    <Icon
                        icon="mdi:close"
                        width={24}
                        className="cursor-pointer hover:opacity-70"
                        onClick={onClose}
                    />
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className=" space-y-3">
                            <h3 className="text-sm font-semibold text-primary-900 mb-2">Device Information</h3>

                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Brand Name *
                                    </label>
                                    <Controller
                                        name="brandName"
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                value={selectedBrandId}
                                                onChange={(e) => {
                                                    const brandId = e.target.value;
                                                    const selectedBrand = brands.find(b => b._id === brandId);
                                                    if (selectedBrand) {
                                                        field.onChange(selectedBrand.name);
                                                        setSelectedBrandId(brandId);
                                                        setValue('modelName', '');
                                                        setSelectedModelId('');
                                                        setModels([]);
                                                    } else {
                                                        field.onChange('');
                                                        setSelectedBrandId('');
                                                        setValue('modelName', '');
                                                        setSelectedModelId('');
                                                        setModels([]);
                                                    }
                                                }}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.brandName ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            >
                                                <option value="">Select a Brand</option>
                                                {brands.map((brand) => (
                                                    <option
                                                        key={brand._id}
                                                        value={brand._id}
                                                    >
                                                        {brand.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    {errors.brandName && (
                                        <p className="text-red-500 text-xs mt-1">{errors.brandName.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Model Name *
                                    </label>
                                    <Controller
                                        name="modelName"
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                value={selectedModelId}
                                                onChange={(e) => {
                                                    const modelId = e.target.value;
                                                    const selectedModel = models.find(m => m._id === modelId);
                                                    if (selectedModel) {
                                                        field.onChange(selectedModel.name);
                                                        setSelectedModelId(modelId);
                                                    } else {
                                                        field.onChange('');
                                                        setSelectedModelId('');
                                                    }
                                                }}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.modelName ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            >
                                                <option value="">Select a Model</option>
                                                {models.map((model) => (
                                                    <option
                                                        key={model._id}
                                                        value={model._id}
                                                    >
                                                        {model.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    {errors.modelName && (
                                        <p className="text-red-500 text-xs mt-1">{errors.modelName.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Repair Services *</h3>

                            <div className="mb-3">
                                <select
                                    onChange={(e) => handleServiceSelect(e.target.value)}
                                    value=""
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Select a service</option>
                                    {services.map(service => (
                                        <option
                                            key={service._id}
                                            value={service._id}
                                        >
                                            {service.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedServices.length > 0 && (
                                <div className="bg-gray-50 p-3 rounded-md">
                                    <p className="text-xs font-medium text-gray-700 mb-2">Selected Services:</p>
                                    <div className="space-y-2">
                                        {selectedServices.map((serviceId, index) => {
                                            const service = services.find(s => s._id === serviceId);
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                                                >
                                                    <span className="text-sm text-gray-700">{service?.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveService(serviceId)}
                                                        className="text-red-600 hover:text-red-800 transition-colors"
                                                    >
                                                        <Icon icon="mdi:close" width={18} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Description *
                            </label>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <textarea
                                        {...field}
                                        placeholder="Describe the repair work to be done in detail..."
                                        rows={3}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        maxLength={500}
                                    />
                                )}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                                {watchedDescription?.length || 0}/500 characters
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Type *
                            </label>
                            <Controller
                                name="serviceType"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.serviceType ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    >
                                        {serviceTypeOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.serviceType && (
                                <p className="text-red-500 text-xs mt-1">{errors.serviceType.message}</p>
                            )}


                            <div className='mt-3'>

                                {watchedServiceType === 'pickup' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Pickup Service Charges (TRY) *
                                        </label>
                                        <Controller
                                            name="serviceCharges"
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type="number"
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.serviceCharges ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                />
                                            )}
                                        />
                                        {errors.serviceCharges && (
                                            <p className="text-red-500 text-xs mt-1">{errors.serviceCharges.message}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Additional charge for pickup service
                                        </p>
                                    </div>
                                )}


                                {watchedServiceType === 'drop-off' && (
                                    <div>
                                        <label>Drop-off Location Address *</label>
                                        <Controller
                                            name="dropoffAddress"
                                            control={control}
                                            render={({ field }) => (
                                                <textarea
                                                    {...field}
                                                    placeholder="Enter your shop/service center address..."
                                                    rows={2}
                                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.dropoffAddress ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                />
                                            )}
                                        />
                                        {errors.dropoffAddress && (
                                            <p className="text-red-500 text-xs mt-1">{errors.dropoffAddress.message}</p>
                                        )}
                                    </div>
                                )}

                            </div>


                        </div>

                        <div className="bg-gray-50 p-4 rounded-md space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Pricing Details</h3>

                            <div className="grid grid-cols-1 gap-3">
                                <div className='col-span-1'>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Base Price (TRY) *
                                    </label>
                                    <Controller
                                        name="basePrice"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="number"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.basePrice ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            />
                                        )}
                                    />
                                    {errors.basePrice && (
                                        <p className="text-red-500 text-xs mt-1">{errors.basePrice.message}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                                    <input
                                        type="checkbox"
                                        id="isPartRequired"
                                        checked={isPartRequired}
                                        onChange={(e) => handleIsPartRequiredToggle(e, chatId)}
                                        className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-2 cursor-pointer"
                                    />
                                    <label
                                        htmlFor="isPartRequired"
                                        className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                                    >
                                        Is Part Required?
                                    </label>
                                </div>

                                {isPartRequired && (
                                    <>
                                        <div>
                                            {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Parts Price (TRY)
                                            </label>
                                            <Controller
                                                name="partsPrice"
                                                control={control}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="number"
                                                        placeholder="0.00"
                                                        min="0"
                                                        step="0.01"
                                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.partsPrice ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                    />
                                                )}
                                            />
                                            {errors.partsPrice && (
                                                <p className="text-red-500 text-xs mt-1">{errors.partsPrice.message}</p>
                                            )} */}


                                            {isPartRequired && selectedParts.length > 0 && (
                                                <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                                        <span className="inline-block w-2 h-2 bg-primary-600 rounded-full"></span>
                                                        Selected Parts
                                                    </h4>

                                                    <div className="space-y-2">
                                                        {selectedParts.map((part, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between bg-white p-2 rounded-md shadow-sm border border-gray-200"
                                                            >
                                                                <span className="text-sm text-gray-700 font-medium">
                                                                    {part.name}
                                                                </span>

                                                                <span className="text-sm font-semibold text-primary-600">
                                                                    {part.price} TRY
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setIsPartModalOpen(true);
                                            }}
                                            className="w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors flex items-center justify-center gap-2 font-medium"
                                        >
                                            <Icon icon="mdi:plus-circle" width={20} />
                                            Select Required Parts
                                        </button>
                                    </>
                                )}
                            </div>




                            <div className="bg-white border border-gray-200 rounded-md p-3 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Base Price:</span>
                                    <span className="font-medium">₺{(parseFloat(watchedBasePrice) || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Parts Price:</span>

                                    <span className="font-medium">
                                        ₺{
                                            isPartRequired && selectedParts.length > 0
                                                ? selectedParts
                                                    .reduce((total, part) => total + Number(part.price || 0), 0)
                                                    .toFixed(2)
                                                : '0.00'
                                        }
                                    </span>

                                </div>

                                <div className="border-t pt-2 flex justify-between items-center text-sm font-semibold">
                                    <span className="text-gray-700">Subtotal:</span>
                                    <span>₺{calculateSubtotal()?.toFixed(2)}</span>
                                </div>

                                {watchedServiceType === 'pickup' && parseFloat(watchedServiceCharges) > 0 && (
                                    <>
                                        <div className="flex justify-between items-center text-sm text-primary-600">
                                            <span>Pickup Charges:</span>
                                            <span className="font-medium">+₺{(parseFloat(watchedServiceCharges) || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="border-t pt-2"></div>
                                    </>
                                )}
                            </div>

                            <div className="bg-primary-600 p-3 rounded-md">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-white">Grand Total:</span>
                                    <span className="text-lg font-bold text-white">
                                        ₺{calculateGrandTotal().toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className='hidden'>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Parts Quality *
                                </label>
                                <Controller
                                    name="partsQuality"
                                    control={control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.partsQuality ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="original">Original</option>
                                            <option value="a-plus">A-Plus</option>
                                            <option value="china-copy">China Copy</option>
                                            <option value="refurbished-original">Refurbished Original</option>
                                            <option value="other">Other</option>
                                        </select>
                                    )}
                                />
                                {errors.partsQuality && (
                                    <p className="text-red-500 text-xs mt-1">{errors.partsQuality.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estimated Duration (days) *
                                </label>
                                <Controller
                                    name="estimatedDuration"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="number"
                                            placeholder="e.g., 2"
                                            min="0"
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.estimatedDuration ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                    )}
                                />
                                {errors.estimatedDuration && (
                                    <p className="text-red-500 text-xs mt-1">{errors.estimatedDuration.message}</p>
                                )}
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Warranty (days)
                                </label>
                                <Controller
                                    name="warranty"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="number"
                                            placeholder="e.g., 30"
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    )}
                                />
                                {errors.warranty && (
                                    <p className="text-red-500 text-xs mt-1">{errors.warranty.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            

                            <div className='col-span-2'>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Additional Notes
                                </label>
                                <Controller
                                    name="repairmanNotes"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            placeholder="Any additional information..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            maxLength={200}
                                        />
                                    )}
                                />
                                {errors.repairmanNotes && (
                                    <p className="text-red-500 text-xs mt-1">{errors.repairmanNotes.message}</p>
                                )}
                                <p className="text-gray-500 text-xs mt-1">
                                    {watchedRepairmanNotes?.length || 0}/200 characters
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="mdi:send" width={16} />
                                        Send Quotation
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <PartModal
                chatId={chatId}
                isOpen={isPartModalOpen}
                onClose={() => setIsPartModalOpen(false)}
                setPartsArray={setSelectedParts}
            />
        </div>
    );
};

export default QuotationForm;