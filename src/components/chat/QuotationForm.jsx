"use client"

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import PartModal from '@/app/(repairman)/repair-man/(dashboard)/job-board/[id]/PartModal';
import { useMultiLoading } from '@/hooks/useMultiloading';

const quotationSchema = yup.object().shape({
    brand: yup
        .string()
        .required('Brand name is required')
        .min(2, 'Brand name must be at least 2 characters'),
    model: yup
        .string()
        .required('Model name is required')
        .min(2, 'Model name must be at least 2 characters'),
    repairServices: yup
        .array()
        .of(yup.string())
        .min(1, 'At least one repair service is required')
        .required('Repair services are required'),
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
        .max(100000, 'Parts price seems too high')
        .default(0)
        .typeError('Parts price must be a valid number'),
    description: yup
        .string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description cannot exceed 500 characters'),
    estimatedDuration: yup
        .number()
        .min(0, 'Estimated duration cannot be negative')
        .max(365, 'Estimated duration cannot exceed 365 days')
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
        .max(365, 'Warranty cannot exceed 365 days')
        .nullable()
        .typeError('Warranty must be a number'),
    repairmanNotes: yup
        .string()
        .max(200, 'Notes cannot exceed 200 characters')
        .nullable()
});

const QuotationForm = ({ chatId, onClose, onSuccess, initialData = null, isEdit = false }) => {
    console.log('QuotationForm rendered with initialData:', initialData, 'isEdit:', isEdit);
    const {multiloading, start, stop } = useMultiLoading();
    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [services, setService] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedParts, setSelectedParts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [selectedBrandId, setSelectedBrandId] = useState('');
    const [selectedModelId, setSelectedModelId] = useState('');
    const [isPartRequired, setIsPartRequired] = useState(false);
    const [isPartModalOpen, setIsPartModalOpen] = useState(false);
    const [editDataLoaded, setEditDataLoaded] = useState(false);
    const [isInitialLoaded, setIsInitialLoaded] = useState(false);

    // Use refs to track if initial data has been applied
    const editAppliedRef = useRef(false);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(quotationSchema),
        defaultValues: {
            brand: '',
            model: '',
            partsQuality: 'original',
            basePrice: '',
            serviceCharges: 0,
            partsPrice: 0,
            dropoffAddress: '',
            description: '',
            estimatedDuration: '',
            serviceType: 'drop-off',
            warranty: '',
            repairmanNotes: '',
            repairServices: []
        }
    });

    // ─── Fetch Brands ────────────────────────────────────────────────────────────
    const fetchBrands = async () => {
        try {
            const response = await axiosInstance.get('/public/brands', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data.data.brands || [];
        } catch (error) {
            handleError(error);
            return [];
        }
    };

    // ─── Fetch Models (returns array so we can await it) ─────────────────────────
    const fetchModels = useCallback(async (brandId) => {
        if (!brandId) {
            setModels([]);
            setValue('model', '');
            setSelectedModelId('');
            return [];
        }
        start('models');
        try {
            const response = await axiosInstance.get(`/public/models/brand/${brandId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const fetchedModels = response.data.data.models || [];
            setModels(fetchedModels);
            return fetchedModels;
        } catch (error) {
            handleError(error);
            setModels([]);
            return [];
        } finally {
            stop('models');
        }
    }, [token, setValue]);

    // ─── Fetch Services ───────────────────────────────────────────────────────────
    const fetchServices = async () => {
        try {
            const response = await axiosInstance.get('/public/services', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data.data || [];
        } catch (error) {
            handleError(error);
            return [];
        }
    };

    // ─── Initial Load: fetch brands + services, then apply edit data ──────────────
    useEffect(() => {
        const initialize = async () => {
            // Load brands and services in parallel
            start('brands');
            start('services');
            const [fetchedBrands, fetchedServices] = await Promise.all([
                fetchBrands(),
                fetchServices()
            ]);
            setBrands(fetchedBrands);
            setService(fetchedServices);
            stop('brands');
            stop('services');

            // ── ADD MODE: load localStorage data ──
            if (!isEdit || !initialData) {
                const storedPartRequired = localStorage.getItem(`isPartRequired_chat_${chatId}`);
                if (storedPartRequired) setIsPartRequired(storedPartRequired === 'true');

                const storedParts = localStorage.getItem(`selectedParts_quotation_chat_${chatId}`);
                if (storedParts) {
                    try { setSelectedParts(JSON.parse(storedParts)); } catch (e) { /* ignore */ }
                }
                setIsInitialLoaded(true);
                return;
            }

            // ── EDIT MODE: apply initialData ──
            if (editAppliedRef.current) return;
            editAppliedRef.current = true;

            try {
                const device = initialData.deviceInfo || {};

                // Services
                const repairServicesArr = device.repairServices || initialData.repairServices || [];
                const serviceIds = repairServicesArr.map(s => (typeof s === 'object' ? s._id || s.id : s));
                setSelectedServices(serviceIds);
                setValue('repairServices', serviceIds);

                // Brand
                const brandObj = device.brand || initialData.brand;
                const brandId = brandObj
                    ? (typeof brandObj === 'object' ? brandObj._id || brandObj.id : brandObj)
                    : '';

                if (brandId) {
                    setSelectedBrandId(brandId);
                    setValue('brand', brandId);

                    // Fetch models for this brand BEFORE setting model
                    const fetchedModels = await fetchModels(brandId);

                    // Model
                    const modelObj = device.model || initialData.model;
                    const modelId = modelObj
                        ? (typeof modelObj === 'object' ? modelObj._id || modelObj.id : modelObj)
                        : '';

                    if (modelId) {
                        // Verify the model exists in fetched list
                        const modelExists = fetchedModels.find(m => m._id === modelId);
                        if (modelExists) {
                            setSelectedModelId(modelId);
                            setValue('model', modelId);
                        }
                    }
                }

                // Pricing
                const pricing = initialData.pricing || {};
                setValue('partsQuality', initialData.partsQuality || 'original');
                setValue('basePrice', pricing.basePrice ?? initialData.basePrice ?? '');
                setValue('partsPrice', pricing.partsPrice ?? initialData.partsPrice ?? 0);
                setValue('serviceCharges', pricing.serviceCharges ?? initialData.serviceCharges ?? 0);

                // Service details
                const svcDetails = initialData.serviceDetails || {};
                setValue('description', svcDetails.description || initialData.description || '');
                setValue('estimatedDuration', svcDetails.estimatedDuration || initialData.estimatedDuration || '');
                setValue('serviceType', svcDetails.serviceType || initialData.serviceType || 'drop-off');
                setValue('warranty', svcDetails.warranty?.duration ?? initialData.warranty ?? '');
                setValue('repairmanNotes', initialData.repairmanNotes || '');
                setValue('dropoffAddress', svcDetails.dropoffLocation?.address || initialData.dropoffAddress || '');

                // Parts
                const partsRequired = Boolean(initialData.isPartRequired);
                setIsPartRequired(partsRequired);

                if (partsRequired && Array.isArray(initialData.requiredParts) && initialData.requiredParts.length > 0) {
                    setSelectedParts(initialData.requiredParts);
                    localStorage.setItem(`selectedParts_quotation_chat_${chatId}`, JSON.stringify(initialData.requiredParts));
                }

                setEditDataLoaded(true);
            } catch (err) {
                console.warn('Edit prefill error:', err);
            }
        };

        initialize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    // ─── Handlers ─────────────────────────────────────────────────────────────────
    const handleBrandChange = async (brandId) => {
        setSelectedBrandId(brandId);
        setValue('brand', brandId || '');
        setValue('model', '');
        setSelectedModelId('');
        if (brandId) {
            await fetchModels(brandId);
        } else {
            setModels([]);
        }
    };

    const handleIsPartRequiredToggle = (e) => {
        const isChecked = e.target.checked;
        localStorage.setItem(`isPartRequired_chat_${chatId}`, isChecked);
        setIsPartRequired(isChecked);
    };

    const handleRemoveService = (serviceToRemove) => {
        const newServices = selectedServices.filter(s => s !== serviceToRemove);
        setSelectedServices(newServices);
        setValue('repairServices', newServices);
    };

    const handleServiceSelect = (serviceId) => {
        if (!serviceId) return;
        setSelectedServices(prev => {
            const updated = prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId];
            setValue('repairServices', updated);
            return updated;
        });
    };

    // ─── Watched values ───────────────────────────────────────────────────────────
    const watchedServiceType = watch('serviceType');
    const watchedBasePrice = watch('basePrice');
    const watchedServiceCharges = watch('serviceCharges');
    const watchedDescription = watch('description');
    const watchedRepairmanNotes = watch('repairmanNotes');

    // ─── Price calculations ───────────────────────────────────────────────────────
    const partsTotal = isPartRequired
        ? selectedParts.reduce((total, part) => total + Number(part.price || 0), 0)
        : 0;

    const calculateSubtotal = () => (parseFloat(watchedBasePrice) || 0) + partsTotal;

    const calculateGrandTotal = () => {
        const subtotal = calculateSubtotal();
        const serviceCharges = watchedServiceType === 'pickup' ? (parseFloat(watchedServiceCharges) || 0) : 0;
        return subtotal + serviceCharges;
    };

    // ─── Submit ───────────────────────────────────────────────────────────────────
    const onSubmit = async (data) => {
        if (selectedServices.length === 0) {
            handleError({ message: 'Please add at least one repair service' });
            return;
        }

        setLoading(true);
        try {
            const calculatedPartsPrice = isPartRequired
                ? selectedParts.reduce((total, part) => total + Number(part.price || 0), 0)
                : 0;

            const requiredPartIds = isPartRequired
                ? selectedParts.map(part => part._id || part.id).filter(Boolean)
                : [];

            const quotationData = {
                deviceInfo: {
                    brand: data.brand,
                    model: data.model,
                    repairServices: selectedServices
                },
                partsQuality: data.partsQuality,
                basePrice: parseFloat(data.basePrice),
                partsPrice: calculatedPartsPrice,
                isPartRequired,
                ...(isPartRequired && { requiredParts: requiredPartIds }),
                description: data.description.trim(),
                estimatedDuration: data.estimatedDuration.toString(),
                ...(data.warranty && { warranty: data.warranty.toString() }),
                ...(data.repairmanNotes && { repairmanNotes: data.repairmanNotes.trim() }),
                ...(data.serviceType === 'pickup' && {
                    serviceType: 'pickup',
                    serviceCharges: parseFloat(data.serviceCharges) || 0,
                    isPickup: true,
                    isDropoff: false,
                    pickupLocation: { address: '' },
                    dropoffLocation: { address: '' }
                }),
                ...(data.serviceType === 'drop-off' && {
                    serviceType: 'drop-off',
                    serviceCharges: 0,
                    isPickup: false,
                    isDropoff: true,
                    pickupLocation: { address: '' },
                    dropoffLocation: { address: data.dropoffAddress?.trim() || '' }
                })
            };

            let response;
            if (isEdit && initialData?.quotationId) {
                const quotationId =  initialData.quotationId;
                response = await axiosInstance.put(
                    `/chat/update-quotation/${quotationId}`,
                    quotationData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                response = await axiosInstance.post(
                    `/chat/${chatId}/send-quotation`,
                    quotationData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            if (response.data?.success) {
                localStorage.removeItem(`isPartRequired_chat_${chatId}`);
                localStorage.removeItem(`selectedParts_quotation_chat_${chatId}`);
                onSuccess?.(response.data.data?.quotation || response.data.data);
                onClose();
            }
        } catch (error) {
            console.error('Quotation submit error:', error);
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const serviceTypeOptions = [
        { value: 'drop-off', label: 'Drop-off Service' },
        { value: 'pickup', label: 'Pickup Service' },
    ];


// if(editDataLoaded){
//     return (
//         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
//             <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
//                 <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary-600"></div>
//                 <span className="text-primary-600 font-medium"> quotation...</span>
//             </div>
//         </div>
//     )
// }

    // ─── Render ───────────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="bg-primary-600 text-white px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        {isEdit ? 'Update Quotation' : 'Create Quotation'}
                    </h2>
                    <Icon
                        icon="mdi:close"
                        width={24}
                        className="cursor-pointer hover:opacity-70"
                        onClick={onClose}
                    />
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {/* Edit loading indicator */}
                    {(isEdit ? !editDataLoaded : !isInitialLoaded) ?(
                        <div className="flex h-[50vh] justify-center items-center gap-2 mb-4 text-sm text-primary-600 px-3 py-2 rounded-md">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                            Loading {isEdit ? 'quotation data' : 'data'}...
                        </div>
                    ):(
<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* ── Device Information ── */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-primary-900 mb-2">Device Information</h3>
                            <div className="grid grid-cols-1 gap-3">

                                {/* Brand */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Brand Name *
                                    </label>
                                    <Controller
                                        name="brand"
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                value={selectedBrandId}
                                                onChange={async (e) => {
                                                    const brandId = e.target.value;
                                                    field.onChange(brandId);
                                                    await handleBrandChange(brandId);
                                                }}
                                                disabled={multiloading.brands}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.brand ? 'border-red-500' : 'border-gray-300'}`}
                                            >
                                                <option value="">Select a Brand</option>
                                                {multiloading.brands ? (
                                                    <option disabled>Loading brands...</option>
                                                ) : (
                                                    brands.map((brand) => (
                                                        <option key={brand._id} value={brand._id}>
                                                            {brand.name}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                        )}
                                    />
                                    {errors.brand && (
                                        <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>
                                    )}
                                </div>

                                {/* Model */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Model Name *
                                    </label>
                                    <Controller
                                        name="model"
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                value={selectedModelId}
                                                onChange={(e) => {
                                                    const modelId = e.target.value;
                                                    setSelectedModelId(modelId);
                                                    field.onChange(modelId);
                                                }}
                                                disabled={!selectedBrandId || multiloading.models}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.model ? 'border-red-500' : 'border-gray-300'}`}
                                            >
                                                <option value="">
                                                    {selectedBrandId ? (multiloading.models ? 'Loading models...' : 'Select a Model') : 'Select a Brand first'}
                                                </option>
                                                {multiloading.models ? null : models.map((model) => (
                                                    <option key={model._id} value={model._id}>
                                                        {model.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    {errors.model && (
                                        <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Repair Services ── */}
                        <div>
                            <Controller
                                name="repairServices"
                                control={control}
                                defaultValue={[]}
                                render={() => null}
                            />
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Repair Services *</h3>
                            <div className="mb-3">
                                <select
                                    onChange={(e) => handleServiceSelect(e.target.value)}
                                    value=""
                                    disabled={multiloading.services}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                    <option value="">{multiloading.services ? 'Loading services...' : 'Select a service'}</option>
                                    {multiloading.services ? null : services.map(service => (
                                        <option key={service._id} value={service._id}>
                                            {selectedServices.includes(service._id)
                                                ? `✓ ${service.name}`
                                                : service.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.repairServices && (
                                    <p className="text-red-500 text-xs mt-1">{errors.repairServices.message}</p>
                                )}
                            </div>

                            {selectedServices.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-xs font-semibold text-gray-700 mb-2">Selected Services:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedServices.map((serviceId) => {
                                            const service = services.find(s => s._id === serviceId);
                                            return (
                                                <div
                                                    key={serviceId}
                                                    className="flex items-center gap-2 bg-primary-50 border border-primary-400 text-primary-700 px-3 py-1.5 rounded-full shadow-sm"
                                                >
                                                    <span className="text-sm font-medium">{service?.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveService(serviceId)}
                                                        className="hover:bg-primary-100 rounded-full p-1 transition"
                                                    >
                                                        <Icon icon="mdi:close" width={16} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Description ── */}
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
                                        maxLength={500}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                )}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">{watchedDescription?.length || 0}/500 characters</p>
                        </div>

                        {/* ── Service Type ── */}
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
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.serviceType ? 'border-red-500' : 'border-gray-300'}`}
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

                            <div className="mt-3">
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
                                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.serviceCharges ? 'border-red-500' : 'border-gray-300'}`}
                                                />
                                            )}
                                        />
                                        {errors.serviceCharges && (
                                            <p className="text-red-500 text-xs mt-1">{errors.serviceCharges.message}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">Additional charge for pickup service</p>
                                    </div>
                                )}

                                {watchedServiceType === 'drop-off' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Drop-off Location Address *
                                        </label>
                                        <Controller
                                            name="dropoffAddress"
                                            control={control}
                                            render={({ field }) => (
                                                <textarea
                                                    {...field}
                                                    placeholder="Enter your shop/service center address..."
                                                    rows={2}
                                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.dropoffAddress ? 'border-red-500' : 'border-gray-300'}`}
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

                        {/* ── Pricing ── */}
                        <div className="bg-gray-50 p-4 rounded-md space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Pricing Details</h3>

                            <div className="grid grid-cols-1 gap-3">
                                {/* Base Price */}
                                <div>
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
    onFocus={(e) => {
        if (field.value === 0) {
            e.target.select();
        }
    }}
    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.serviceCharges ? 'border-red-500' : 'border-gray-300'}`}
/>
                                        )}
                                    />
                                    {errors.basePrice && (
                                        <p className="text-red-500 text-xs mt-1">{errors.basePrice.message}</p>
                                    )}
                                </div>

                                {/* Is Part Required */}
                                <div className="flex items-center gap-2 p-3 bg-white rounded-md border border-gray-200">
                                    <input
                                        type="checkbox"
                                        id="isPartRequired"
                                        checked={isPartRequired}
                                        onChange={handleIsPartRequiredToggle}
                                        className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-2 cursor-pointer"
                                    />
                                    <label htmlFor="isPartRequired" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                        Is Part Required?
                                    </label>
                                </div>

                                {/* Parts section */}
                                {isPartRequired && (
                                    <>
                                        {selectedParts.length > 0 && (
                                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                                                <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                                    <span className="inline-block w-2 h-2 bg-primary-600 rounded-full"></span>
                                                    Selected Parts
                                                </h4>
                                                <div className="space-y-2">
                                                    {selectedParts.map((part, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between bg-gray-50 p-2 rounded-md shadow-sm border border-gray-200"
                                                        >
                                                            <span className="text-sm text-gray-700 font-medium">{part.name}</span>
                                                            <span className="text-sm font-semibold text-primary-600">{part.price} TRY</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

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
                                            {selectedParts.length > 0 ? 'Update Selected Parts' : 'Select Required Parts'}
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Price breakdown */}
                            <div className="bg-white border border-gray-200 rounded-md p-3 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Base Price:</span>
                                    <span className="font-medium">₺{(parseFloat(watchedBasePrice) || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Parts Price:</span>
                                    <span className="font-medium">₺{partsTotal.toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between items-center text-sm font-semibold">
                                    <span className="text-gray-700">Subtotal:</span>
                                    <span>₺{calculateSubtotal().toFixed(2)}</span>
                                </div>
                                {watchedServiceType === 'pickup' && parseFloat(watchedServiceCharges) > 0 && (
                                    <div className="flex justify-between items-center text-sm text-primary-600">
                                        <span>Pickup Charges:</span>
                                        <span className="font-medium">+₺{(parseFloat(watchedServiceCharges) || 0).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-primary-600 p-3 rounded-md">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-white">Grand Total:</span>
                                    <span className="text-lg font-bold text-white">₺{calculateGrandTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Duration & Warranty ── */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Hidden partsQuality (kept for schema) */}
                            <div className="hidden">
                                <Controller
                                    name="partsQuality"
                                    control={control}
                                    render={({ field }) => (
                                        <select {...field}>
                                            <option value="original">Original</option>
                                            <option value="a-plus">A-Plus</option>
                                            <option value="china-copy">China Copy</option>
                                            <option value="refurbished-original">Refurbished Original</option>
                                            <option value="other">Other</option>
                                        </select>
                                    )}
                                />
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
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.estimatedDuration ? 'border-red-500' : 'border-gray-300'}`}
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
                                            max="365"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    )}
                                />
                                {errors.warranty && (
                                    <p className="text-red-500 text-xs mt-1">{errors.warranty.message}</p>
                                )}
                            </div>
                        </div>

                        {/* ── Additional Notes ── */}
                        <div>
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
                                        maxLength={200}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                )}
                            />
                            {errors.repairmanNotes && (
                                <p className="text-red-500 text-xs mt-1">{errors.repairmanNotes.message}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">{watchedRepairmanNotes?.length || 0}/200 characters</p>
                        </div>

                        {/* ── Actions ── */}
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
                                        {isEdit ? 'Updating...' : 'Sending...'}
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="mdi:send" width={16} />
                                        {isEdit ? 'Update Quotation' : 'Send Quotation'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                    )}

                    
                </div>
            </div>

{
console.log(selectedParts,"selectedParts in render")}
{console.log(setSelectedParts,"setSelectedParts in render")}

            <PartModal
                chatId={chatId}
                isOpen={isPartModalOpen}
                onClose={() => setIsPartModalOpen(false)}
                setPartsArray={setSelectedParts}
                initialSelectedParts={selectedParts}
            />
        </div>
    );
};

export default QuotationForm;